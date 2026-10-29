import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'welfare_schemes_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let mysqlPool = null;
let isConnectedToMySQL = false;
let fallbackDb = null;
let dbStatus = {
  mode: 'uninitialized',
  database: dbConfig.database,
  host: dbConfig.host,
  port: dbConfig.port,
  message: 'Initializing database connection...',
};

/**
 * Initialize fallback SQLite in-memory / local storage when MySQL is not accessible
 */
async function initFallbackStorage() {
  try {
    // Dynamic import better-sqlite3 if needed
    const Database = (await import('better-sqlite3')).default;
    const dbPath = path.resolve(__dirname, '../../../database/welfare_local.sqlite');
    fallbackDb = new Database(dbPath);
    fallbackDb.pragma('journal_mode = WAL');
    fallbackDb.pragma('foreign_keys = ON');

    // Create normalized tables in fallback SQLite
    fallbackDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        google_id TEXT UNIQUE,
        avatar_url TEXT,
        role TEXT NOT NULL DEFAULT 'citizen',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS citizen_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        date_of_birth TEXT,
        age INTEGER NOT NULL,
        state TEXT NOT NULL,
        district TEXT NOT NULL,
        annual_income REAL NOT NULL,
        occupation TEXT NOT NULL,
        employment_status TEXT NOT NULL DEFAULT 'other',
        education_level TEXT NOT NULL DEFAULT 'secondary',
        family_size INTEGER NOT NULL DEFAULT 1,
        housing_status TEXT NOT NULL DEFAULT 'owned',
        area_type TEXT NOT NULL DEFAULT 'urban',
        is_disabled INTEGER NOT NULL DEFAULT 0,
        disability_percentage INTEGER DEFAULT 0,
        is_student INTEGER NOT NULL DEFAULT 0,
        gender TEXT,
        social_category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS welfare_schemes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scheme_name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        department TEXT NOT NULL,
        state_coverage TEXT NOT NULL DEFAULT 'All-India',
        min_age INTEGER,
        max_age INTEGER,
        min_income REAL,
        max_income REAL,
        eligible_occupations TEXT,
        official_url TEXT,
        source_id TEXT,
        source_url TEXT,
        benefits_summary TEXT,
        verification_status TEXT NOT NULL DEFAULT 'verified',
        import_date TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        source_ref TEXT DEFAULT 'Official Government Portal',
        last_verified_date TEXT NOT NULL,
        is_demonstration INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS eligibility_criteria (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scheme_id INTEGER NOT NULL,
        criterion_type TEXT NOT NULL,
        profile_field TEXT NOT NULL,
        operator TEXT NOT NULL,
        target_value TEXT NOT NULL,
        is_mandatory INTEGER NOT NULL DEFAULT 0,
        weight REAL NOT NULL DEFAULT 1.00,
        description TEXT NOT NULL,
        failure_reason TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (scheme_id) REFERENCES welfare_schemes(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS scheme_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scheme_id INTEGER NOT NULL,
        document_name TEXT NOT NULL,
        description TEXT,
        is_mandatory INTEGER NOT NULL DEFAULT 1,
        issuing_authority TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (scheme_id) REFERENCES welfare_schemes(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS saved_schemes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        scheme_id INTEGER NOT NULL,
        saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        UNIQUE(user_id, scheme_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (scheme_id) REFERENCES welfare_schemes(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS eligibility_assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        total_schemes_evaluated INTEGER NOT NULL DEFAULT 0,
        eligible_count INTEGER NOT NULL DEFAULT 0,
        needs_info_count INTEGER NOT NULL DEFAULT 0,
        unlikely_count INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS assessment_details (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assessment_id INTEGER NOT NULL,
        scheme_id INTEGER NOT NULL,
        matching_score REAL NOT NULL,
        result_category TEXT NOT NULL,
        mandatory_satisfied INTEGER NOT NULL DEFAULT 1,
        satisfied_criteria TEXT,
        unmet_criteria TEXT,
        missing_fields TEXT,
        explanation TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assessment_id) REFERENCES eligibility_assessments(id) ON DELETE CASCADE,
        FOREIGN KEY (scheme_id) REFERENCES welfare_schemes(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'system',
        is_read INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS scheme_import_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER NOT NULL,
        source_type TEXT NOT NULL,
        source_name TEXT NOT NULL,
        file_name TEXT,
        total_records INTEGER NOT NULL DEFAULT 0,
        imported_count INTEGER NOT NULL DEFAULT 0,
        updated_count INTEGER NOT NULL DEFAULT 0,
        skipped_count INTEGER NOT NULL DEFAULT 0,
        rejected_count INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'completed',
        error_log TEXT,
        report_summary TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Ensure google_id and avatar_url columns exist in existing SQLite databases
    try { fallbackDb.exec('ALTER TABLE users ADD COLUMN google_id TEXT'); } catch {}
    try { fallbackDb.exec('ALTER TABLE users ADD COLUMN avatar_url TEXT'); } catch {}

    // Ensure import and verification columns exist in existing SQLite databases
    try { fallbackDb.exec('ALTER TABLE welfare_schemes ADD COLUMN source_id TEXT'); } catch {}
    try { fallbackDb.exec('ALTER TABLE welfare_schemes ADD COLUMN source_url TEXT'); } catch {}
    try { fallbackDb.exec('ALTER TABLE welfare_schemes ADD COLUMN benefits_summary TEXT'); } catch {}
    try { fallbackDb.exec("ALTER TABLE welfare_schemes ADD COLUMN verification_status TEXT NOT NULL DEFAULT 'verified'"); } catch {}
    try { fallbackDb.exec('ALTER TABLE welfare_schemes ADD COLUMN import_date TEXT'); } catch {}


    // Check if initial users exist, seed if empty
    const userCount = fallbackDb.prepare('SELECT COUNT(*) as count FROM users').get().count;
    if (userCount === 0) {
      seedFallbackStorage();
    }

    // Ensure primary administrator account shanmugamanonmaniyan@gmail.com is set with role 'admin'
    // and all other users are set to 'citizen' (users for this website)
    try {
      const primaryAdminEmail = 'shanmugamanonmaniyan@gmail.com';
      const adminPass = process.env.ADMIN_INITIAL_PASSWORD || 'manon';
      const adminHash = bcrypt.hashSync(adminPass, 10);
      const existingAdmin = fallbackDb.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(primaryAdminEmail.toLowerCase());
      if (existingAdmin) {
        fallbackDb.prepare('UPDATE users SET role = ?, password_hash = ? WHERE id = ?').run('admin', adminHash, existingAdmin.id);
      } else {
        fallbackDb.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)').run(primaryAdminEmail, adminHash, 'admin');
      }
      fallbackDb.prepare('UPDATE users SET role = ? WHERE LOWER(email) != ?').run('citizen', primaryAdminEmail.toLowerCase());
    } catch (syncErr) {
      console.warn('[DB] Admin role sync warning:', syncErr.message);
    }

    dbStatus = {
      mode: 'fallback_sqlite',
      database: 'welfare_local.sqlite',
      message: 'Active in embedded fallback mode (MySQL not yet connected). Full schema & demo data active.',
    };
    console.log('[DB] Fallback storage initialized with complete schema & seed records.');
  } catch (err) {
    console.error('[DB] Failed to initialize fallback storage:', err.message);
  }
}

function seedFallbackStorage() {
  if (!fallbackDb) return;
  const adminPassHash = bcrypt.hashSync(process.env.ADMIN_INITIAL_PASSWORD || 'manon', 10);
  const insertUser = fallbackDb.prepare('INSERT OR IGNORE INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)');
  insertUser.run(1, 'shanmugamanonmaniyan@gmail.com', adminPassHash, 'admin');
  insertUser.run(2, 'ramesh.kumar@example.com', '$2b$10$i5uPys134GFlfvbiMs25WeoKbcKx2LJ/gQEyx.sgr7oQ4QpQwavDW', 'citizen');
  insertUser.run(3, 'ananya.sharma@example.com', '$2b$10$i5uPys134GFlfvbiMs25WeoKbcKx2LJ/gQEyx.sgr7oQ4QpQwavDW', 'citizen');
  insertUser.run(4, 'suresh.patel@example.com', '$2b$10$i5uPys134GFlfvbiMs25WeoKbcKx2LJ/gQEyx.sgr7oQ4QpQwavDW', 'citizen');

  const insertProfile = fallbackDb.prepare(`
    INSERT OR IGNORE INTO citizen_profiles 
    (id, user_id, full_name, date_of_birth, age, state, district, annual_income, occupation, employment_status, education_level, family_size, housing_status, area_type, is_disabled, disability_percentage, is_student, gender, social_category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertProfile.run(1, 2, 'Ramesh Kumar', '1984-06-15', 42, 'Uttar Pradesh', 'Varanasi', 120000, 'Farmer', 'self_employed', 'secondary', 4, 'kutcha_house', 'rural', 0, 0, 0, 'male', 'obc');
  insertProfile.run(2, 3, 'Ananya Sharma', '2005-02-10', 21, 'Maharashtra', 'Pune', 180000, 'Student', 'student', 'graduate', 3, 'rented', 'urban', 0, 0, 1, 'female', 'general');
  insertProfile.run(3, 4, 'Suresh Patel', '1959-11-20', 67, 'Gujarat', 'Ahmedabad', 85000, 'Retired Worker', 'retired', 'primary', 2, 'owned', 'urban', 1, 45, 0, 'male', 'general');

  const insertScheme = fallbackDb.prepare(`
    INSERT OR IGNORE INTO welfare_schemes
    (id, scheme_name, slug, description, category, department, state_coverage, min_age, max_age, min_income, max_income, eligible_occupations, official_url, is_active, source_ref, last_verified_date, is_demonstration)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertScheme.run(1, 'PM Kisan Samman Nidhi (Farmer Income Support)', 'pm-kisan-income-support', 'Direct financial support of Rs 6,000 per year distributed in three equal installments to small and marginal landholding farmer families.', 'Agriculture & Farmers', 'Ministry of Agriculture & Farmers Welfare', 'All-India', 18, 100, 0, 250000, '["Farmer", "Agricultural Worker", "Cultivator"]', 'https://pmkisan.gov.in', 1, 'https://pmkisan.gov.in', '2026-03-01', 0);
  insertScheme.run(2, 'Ayushman Universal Health Protection Mission', 'ayushman-health-protection', 'Comprehensive secondary and tertiary health insurance coverage up to Rs 5,00,000 per family per year for vulnerable low-income households.', 'Health & Healthcare', 'National Health Authority', 'All-India', 0, 120, 0, 300000, '["All"]', 'https://pmjay.gov.in', 1, 'https://pmjay.gov.in', '2026-02-15', 0);
  insertScheme.run(3, 'Pradhan Mantri Awas Yojana - Gramin (Rural Housing)', 'pm-awas-yojana-gramin', 'Financial assistance to homeless families and households living in kutcha or severely damaged houses in rural regions.', 'Housing & Shelter', 'Ministry of Rural Development', 'All-India', 18, 90, 0, 200000, '["All"]', 'https://pmayg.nic.in', 1, 'https://pmayg.nic.in', '2026-01-20', 0);
  insertScheme.run(4, 'Post-Matric Higher Education Financial Grant', 'post-matric-education-grant', 'Full tuition fee waiver and monthly stipend for meritorious students pursuing university education from low-income households.', 'Education & Youth', 'Ministry of Social Justice & Empowerment', 'All-India', 16, 30, 0, 250000, '["Student"]', 'https://scholarships.gov.in', 1, 'https://scholarships.gov.in', '2026-02-01', 0);
  insertScheme.run(5, 'Indira Gandhi National Old Age Pension Scheme', 'ignops-senior-pension', 'Monthly social security financial pension for elder citizens living below the official poverty threshold.', 'Social Security & Pension', 'Ministry of Rural Development - NSAP', 'All-India', 60, 120, 0, 150000, '["Retired", "Unemployed", "Homemaker", "Other"]', 'https://nsap.nic.in', 1, 'https://nsap.nic.in', '2026-03-10', 0);
  insertScheme.run(6, 'Divyangjan Inclusive Vocational Skill Grant', 'divyangjan-skill-grant', 'Specialized skill acquisition subsidy and assistive equipment allowance for certified persons with disability.', 'Disability Welfare', 'Department of Empowerment of Persons with Disabilities', 'All-India', 18, 55, 0, 350000, '["All"]', 'https://disabilityaffairs.gov.in', 1, 'https://disabilityaffairs.gov.in', '2026-01-15', 0);
  insertScheme.run(7, 'State Artisans & Traditional Handloom Support Grant', 'tamil-nadu-handloom-artisan-grant', 'Dedicated working capital subsidy and raw material credit support for registered master weavers and artisanal workers residing in Tamil Nadu.', 'Handloom & Handicrafts', 'Department of Handlooms, Textiles and Khadi', 'Tamil Nadu', 18, 70, 0, 180000, '["Artisan", "Handloom Weaver", "Craftsperson"]', 'https://www.tn.gov.in', 1, 'https://www.tn.gov.in', '2026-02-28', 1);

  const insertCriteria = fallbackDb.prepare(`
    INSERT OR IGNORE INTO eligibility_criteria 
    (scheme_id, criterion_type, profile_field, operator, target_value, is_mandatory, weight, description, failure_reason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertCriteria.run(1, 'occupation', 'occupation', 'in', '["Farmer", "Agricultural Worker", "Cultivator"]', 1, 2.0, 'Primary occupation must be agricultural cultivation or farm labor', 'Applicant occupation is not registered as farmer or agricultural cultivator');
  insertCriteria.run(1, 'income', 'annual_income', '<=', '250000', 1, 2.0, 'Annual family income must not exceed Rs 2,50,000', 'Annual family income exceeds the Rs 2,50,000 ceiling');
  insertCriteria.run(1, 'age', 'age', '>=', '18', 1, 1.0, 'Must be at least 18 years of age', 'Applicant must be an adult aged 18 or above');
  insertCriteria.run(1, 'area_type', 'area_type', '==', 'rural', 0, 1.5, 'Priority consideration for rural farm lands', 'Applicant resides in an urban location rather than a rural agrarian zone');

  insertCriteria.run(2, 'income', 'annual_income', '<=', '300000', 1, 2.5, 'Annual family income must not exceed Rs 3,00,000', 'Annual family income exceeds the maximum threshold of Rs 3,00,000');
  insertCriteria.run(2, 'age', 'age', '>=', '0', 1, 1.0, 'Universal age coverage for entire household', 'Age out of coverage bounds');
  insertCriteria.run(2, 'housing_status', 'housing_status', 'in', '["kutcha_house", "homeless", "rented"]', 0, 1.5, 'Preference for households without permanent pucca housing', 'Applicant owns a permanent pucca dwelling');
  insertCriteria.run(2, 'family_size', 'family_size', '>=', '3', 0, 1.0, 'Enhanced priority for families with 3 or more members', 'Family size is below 3');

  insertCriteria.run(3, 'area_type', 'area_type', '==', 'rural', 1, 2.5, 'Must reside strictly in a designated rural panchayat area', 'Applicant does not reside in a recognized rural panchayat jurisdiction');
  insertCriteria.run(3, 'income', 'annual_income', '<=', '200000', 1, 2.0, 'Annual income must be within low-income threshold of Rs 2,00,000', 'Annual income exceeds the rural housing threshold of Rs 2,00,000');
  insertCriteria.run(3, 'housing_status', 'housing_status', 'in', '["kutcha_house", "homeless", "rented"]', 1, 2.0, 'Must be living in a kutcha house or homeless', 'Applicant already owns a permanent pucca structure');
  insertCriteria.run(3, 'family_size', 'family_size', '>=', '2', 0, 1.0, 'Preference for multi-member dependent households', 'Single-member household');

  insertCriteria.run(4, 'student', 'is_student', '==', 'true', 1, 2.5, 'Applicant must currently be an active enrolled student', 'Applicant is not currently enrolled as an active student');
  insertCriteria.run(4, 'age', 'age', 'between', '[16, 30]', 1, 1.5, 'Student must be between 16 and 30 years old', 'Applicant age is outside the 16-30 higher education bracket');
  insertCriteria.run(4, 'income', 'annual_income', '<=', '250000', 1, 2.0, 'Household income must not exceed Rs 2,50,000 per annum', 'Annual income exceeds the higher education grant limit');
  insertCriteria.run(4, 'education_level', 'education_level', 'in', '["higher_secondary", "graduate", "post_graduate", "doctorate"]', 0, 1.5, 'Enrolled in senior secondary or tertiary higher education', 'Enrolled in primary or middle schooling');

  insertCriteria.run(5, 'age', 'age', '>=', '60', 1, 3.0, 'Must have completed at least 60 years of age', 'Applicant has not attained the minimum retirement age of 60');
  insertCriteria.run(5, 'income', 'annual_income', '<=', '150000', 1, 2.5, 'Annual income must not exceed Rs 1,50,000 for destitute senior citizens', 'Annual income exceeds the senior citizen welfare ceiling of Rs 1,50,000');
  insertCriteria.run(5, 'employment_status', 'employment_status', 'in', '["retired", "unemployed", "other"]', 1, 1.5, 'Must not be actively employed in high-paying formal commerce', 'Applicant is currently actively employed in formal industry');
  insertCriteria.run(5, 'disability', 'is_disabled', '==', 'true', 0, 1.5, 'Additional geriatric and disability medical allowance bonus', 'Applicant is not certified with physical disability');

  insertCriteria.run(6, 'disability', 'is_disabled', '==', 'true', 1, 3.0, 'Applicant must hold valid certification as a Person with Disability', 'Applicant is not registered as a Person with Disability');
  insertCriteria.run(6, 'custom', 'disability_percentage', '>=', '40', 1, 2.0, 'Disability benchmark percentage must be 40% or higher', 'Certified disability percentage is below the mandatory 40% threshold');
  insertCriteria.run(6, 'age', 'age', 'between', '[18, 55]', 1, 1.5, 'Must be in the working-age vocational band between 18 and 55', 'Age is outside the 18-55 working age group');
  insertCriteria.run(6, 'income', 'annual_income', '<=', '350000', 0, 1.5, 'Preference for lower-income applicants', 'Annual income is above preferred Rs 3,50,000 band');

  insertCriteria.run(7, 'state', 'state', '==', 'Tamil Nadu', 1, 3.0, 'Must be a bona fide resident of Tamil Nadu state', 'Applicant does not reside within Tamil Nadu state jurisdiction');
  insertCriteria.run(7, 'occupation', 'occupation', 'in', '["Artisan", "Handloom Weaver", "Craftsperson"]', 1, 2.5, 'Must be engaged in traditional artisanal or handloom craft', 'Occupation does not match recognized artisanal craft or handloom trades');
  insertCriteria.run(7, 'age', 'age', '>=', '18', 1, 1.0, 'Must be an adult artisan aged 18 or above', 'Artisan is under 18 years of age');
  insertCriteria.run(7, 'income', 'annual_income', '<=', '180000', 0, 1.5, 'Priority income threshold of Rs 1,80,000', 'Income is above Rs 1,80,000 priority ceiling');

  const insertDoc = fallbackDb.prepare(`
    INSERT OR IGNORE INTO scheme_documents (scheme_id, document_name, description, is_mandatory, issuing_authority)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertDoc.run(1, 'Land Ownership Record (Khatauni / Patta)', 'Valid revenue record certifying agricultural land holding', 1, 'Revenue Department / Tehsildar');
  insertDoc.run(1, 'Government ID Card (Voter ID / Ration Card)', 'Proof of identity with current residential address', 1, 'Election Commission / Civil Supplies');
  insertDoc.run(1, 'Bank Account Passbook Copy', 'Account details for direct benefit transfer (DBT) credit', 1, 'Scheduled Commercial Bank / Post Office');

  insertDoc.run(2, 'Income Certificate or BPL Card', 'Verification of annual household income or priority category', 1, 'Revenue Department / Block Development Officer');
  insertDoc.run(2, 'Family Ration Card', 'Proof of household composition and listing of dependent members', 1, 'Department of Food & Civil Supplies');
  insertDoc.run(2, 'Identity Proof (Voter ID / Driving License)', 'Individual proof of identity for each family beneficiary', 1, 'Government of India');

  insertDoc.run(3, 'Gram Panchayat Residence Certificate', 'Confirmation of habitual residence in the gram panchayat area', 1, 'Gram Panchayat Secretary / Pradhan');
  insertDoc.run(3, 'Kutcha House Verification Affidavit', 'Survey certification verifying absence of pucca brick/concrete roof', 1, 'Block Development Office (BDO)');
  insertDoc.run(3, 'BPL Ration Card', 'Proof of economic disadvantage', 1, 'Civil Supplies Department');

  insertDoc.run(4, 'College Enrollment / Admission Receipt', 'Proof of active admission in a recognized university or college', 1, 'University Registrar / Principal');
  insertDoc.run(4, 'Previous Academic Marksheet', 'Passing certificate of high school or diploma qualification', 1, 'State Education Board / University');
  insertDoc.run(4, 'Income Certificate', 'Income certificate issued within the preceding 12 months', 1, 'Tehsildar / Competent Revenue Authority');
  insertDoc.run(4, 'Institutional Student ID Card', 'Valid student identity badge', 1, 'College Authority');

  insertDoc.run(5, 'Age Verification Certificate', 'Birth certificate or Voter ID showing 60+ years', 1, 'Municipal Health Office / Election Commission');
  insertDoc.run(5, 'BPL Poverty Certification', 'Endorsement proving family income below poverty line', 1, 'District Social Welfare Officer');
  insertDoc.run(5, 'Bank / Post Office Savings Account Passbook', 'Active personal bank account for monthly electronic pension deposit', 1, 'Post Office / Public Sector Bank');

  insertDoc.run(6, 'Unique Disability ID (UDID) Card', 'Permanent disability certificate certifying >= 40% impairment', 1, 'District Medical Board / CMO');
  insertDoc.run(6, 'Age & Residence Proof', 'Verification of age and local residence', 1, 'Competent Authority');
  insertDoc.run(6, 'Educational / Training Certificate', 'Basic literacy or previous skill certificate if applicable', 0, 'Recognized School or ITI');

  insertDoc.run(7, 'Weavers Co-operative Society Card', 'Membership card from registered Primary Weavers Co-op Society', 1, 'Director of Handlooms & Textiles, Tamil Nadu');
  insertDoc.run(7, 'Tamil Nadu Domicile Certificate', 'Proof of continuous residence within Tamil Nadu', 1, 'Tahsildar (Taluk Office, Tamil Nadu)');
  insertDoc.run(7, 'Artisan Credit Card / Bank Passbook', 'Bank account details for subsidy disbursement', 1, 'Commercial Bank');

  const insertNotif = fallbackDb.prepare(`
    INSERT OR IGNORE INTO notifications (id, user_id, title, message, type, is_read)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertNotif.run(1, 2, 'New PM Kisan 17th Installment Announced', 'The government has released the 17th installment of PM Kisan. Verify your landholding documents for direct benefit transfer.', 'scheme_update', 0);
  insertNotif.run(2, 2, 'Eligibility Assessment Ready', 'Your profile matches 4 high-priority central welfare schemes with high confidence.', 'eligibility_result', 0);
  insertNotif.run(3, 2, 'Kisan Credit Card Subsidy Window Open', 'Applications for interest subvention on short term crop loans are now open.', 'deadline', 1);
  insertNotif.run(4, 3, 'National Scholarship Portal 2026 Active', 'Fresh scholarship applications for Post-Matric education financial aid are open.', 'scheme_update', 0);
  insertNotif.run(5, 3, 'Document Verification Notice', 'Please keep your college enrollment certificate and income affidavit ready for verification.', 'system', 0);
  insertNotif.run(6, 4, 'Senior Citizen Healthcare Camps Announced', 'Free geriatric diagnostic camps under Ayushman Bharat are scheduled in your district.', 'scheme_update', 0);
}


/**
 * Initialize MySQL Connection Pool
 */
export async function initializeDatabase() {
  try {
    mysqlPool = mysql.createPool(dbConfig);
    const connection = await mysqlPool.getConnection();
    await connection.ping();
    connection.release();
    isConnectedToMySQL = true;
    dbStatus = {
      mode: 'mysql',
      database: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port,
      message: `Connected successfully to MySQL server at ${dbConfig.host}:${dbConfig.port} (${dbConfig.database})`,
    };
    console.log(`[DB] Connected to MySQL: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);

    // Ensure primary administrator account shanmugamanonmaniyan@gmail.com is set with role 'admin'
    try {
      const primaryAdminEmail = 'shanmugamanonmaniyan@gmail.com';
      const adminPass = process.env.ADMIN_INITIAL_PASSWORD || 'manon';
      const adminHash = bcrypt.hashSync(adminPass, 10);
      const [existingAdmin] = await mysqlPool.query('SELECT id FROM users WHERE LOWER(email) = ?', [primaryAdminEmail.toLowerCase()]);
      if (existingAdmin && existingAdmin.length > 0) {
        await mysqlPool.query('UPDATE users SET role = ?, password_hash = ? WHERE id = ?', ['admin', adminHash, existingAdmin[0].id]);
      } else {
        await mysqlPool.query('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [primaryAdminEmail, adminHash, 'admin']);
      }
      await mysqlPool.query('UPDATE users SET role = ? WHERE LOWER(email) != ?', ['citizen', primaryAdminEmail.toLowerCase()]);
    } catch (syncErr) {
      console.warn('[DB] MySQL Admin sync warning:', syncErr.message);
    }
  } catch (err) {
    isConnectedToMySQL = false;
    console.warn(`[DB WARNING] MySQL connection could not be established (${err.message}).`);
    console.warn(`[DB WARNING] Activating local fallback storage so all services remain fully operational.`);
    console.warn(`[DB HINT] To connect your local MySQL server, set DB_PASSWORD=your_password in server/.env`);
    await initFallbackStorage();
  }
}

/**
 * Unified parameterized query runner for MySQL (and SQLite fallback)
 */
export async function query(sql, params = []) {
  if (isConnectedToMySQL && mysqlPool) {
    try {
      const [rows] = await mysqlPool.query(sql, params);
      return rows;
    } catch (err) {
      console.error('[MySQL Error]', err.message, 'SQL:', sql);
      throw err;
    }
  }

  // Fallback engine handling
  if (!fallbackDb) {
    await initFallbackStorage();
  }

  try {
    const trimmed = sql.trim();
    const isSelect = /^SELECT/i.test(trimmed);
    const isInsert = /^INSERT/i.test(trimmed);
    const isUpdate = /^UPDATE/i.test(trimmed);
    const isDelete = /^DELETE/i.test(trimmed);

    // Normalize MySQL syntax to SQLite if needed
    let sqliteSql = trimmed
      .replace(/ON DUPLICATE KEY UPDATE.*$/i, '')
      .replace(/AUTO_INCREMENT/gi, 'AUTOINCREMENT');

    if (isSelect) {
      const stmt = fallbackDb.prepare(sqliteSql);
      return stmt.all(params);
    } else {
      const stmt = fallbackDb.prepare(sqliteSql);
      const result = stmt.run(params);
      return {
        insertId: result.lastInsertRowid,
        affectedRows: result.changes,
      };
    }
  } catch (err) {
    console.error('[Fallback DB Error]', err.message, 'SQL:', sql);
    throw err;
  }
}

/**
 * Execute callback within a database transaction with automatic rollback on error
 */
export async function withTransaction(callback) {
  if (isConnectedToMySQL && mysqlPool) {
    const connection = await mysqlPool.getConnection();
    await connection.beginTransaction();
    try {
      const connQuery = async (sql, params = []) => {
        const [rows] = await connection.query(sql, params);
        return rows;
      };
      const result = await callback(connQuery);
      await connection.commit();
      return result;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  // Fallback SQLite transaction
  if (!fallbackDb) {
    await initFallbackStorage();
  }

  try {
    fallbackDb.exec('BEGIN IMMEDIATE TRANSACTION');
    const result = await callback(query);
    fallbackDb.exec('COMMIT');
    return result;
  } catch (err) {
    try {
      fallbackDb.exec('ROLLBACK');
    } catch (rbErr) {
      // ignore if already rolled back
    }
    throw err;
  }
}

/**
 * Returns current database connection status
 */
export function getDbStatus() {
  return dbStatus;
}

export default {
  initializeDatabase,
  query,
  withTransaction,
  getDbStatus,
};
