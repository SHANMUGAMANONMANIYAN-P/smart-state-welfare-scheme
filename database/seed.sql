-- ============================================================================
-- Smart Welfare Scheme Eligibility Prediction Engine
-- Seed Data: Demonstration & Evaluation Dataset
-- Password for shanmugamanonmaniyan@gmail.com: manon (admin)
-- Password for citizens: CitizenPass@123
-- ============================================================================

USE welfare_schemes_db;

-- 1. Insert Initial Users
INSERT INTO users (id, email, password_hash, role) VALUES
(1, 'shanmugamanonmaniyan@gmail.com', '$2b$10$9xB/hscVoKAVBjq86j/ITOVn7sl46Q9jjh6MWFWn.ffcv7ImnhbOW', 'admin'),
(2, 'ramesh.kumar@example.com', '$2b$10$i5uPys134GFlfvbiMs25WeoKbcKx2LJ/gQEyx.sgr7oQ4QpQwavDW', 'citizen'),
(3, 'ananya.sharma@example.com', '$2b$10$i5uPys134GFlfvbiMs25WeoKbcKx2LJ/gQEyx.sgr7oQ4QpQwavDW', 'citizen'),
(4, 'suresh.patel@example.com', '$2b$10$i5uPys134GFlfvbiMs25WeoKbcKx2LJ/gQEyx.sgr7oQ4QpQwavDW', 'citizen')
ON DUPLICATE KEY UPDATE email=VALUES(email), password_hash=VALUES(password_hash), role=VALUES(role);

-- 2. Insert Citizen Profiles for Demonstration
-- Profile 1: Ramesh Kumar (Small Farmer, Rural, Family of 4, Income 1,20,000)
INSERT INTO citizen_profiles 
(id, user_id, full_name, date_of_birth, age, state, district, annual_income, occupation, employment_status, education_level, family_size, housing_status, area_type, is_disabled, disability_percentage, is_student, gender, social_category)
VALUES
(1, 2, 'Ramesh Kumar', '1984-06-15', 42, 'Uttar Pradesh', 'Varanasi', 120000.00, 'Farmer', 'self_employed', 'secondary', 4, 'kutcha_house', 'rural', FALSE, 0, FALSE, 'male', 'obc')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- Profile 2: Ananya Sharma (Urban Student, Age 21, Family Income 1,80,000)
INSERT INTO citizen_profiles 
(id, user_id, full_name, date_of_birth, age, state, district, annual_income, occupation, employment_status, education_level, family_size, housing_status, area_type, is_disabled, disability_percentage, is_student, gender, social_category)
VALUES
(2, 3, 'Ananya Sharma', '2005-02-10', 21, 'Maharashtra', 'Pune', 180000.00, 'Student', 'student', 'graduate', 3, 'rented', 'urban', FALSE, 0, TRUE, 'female', 'general')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- Profile 3: Suresh Patel (Senior Citizen, Retired, Age 67, Income 85,000)
INSERT INTO citizen_profiles 
(id, user_id, full_name, date_of_birth, age, state, district, annual_income, occupation, employment_status, education_level, family_size, housing_status, area_type, is_disabled, disability_percentage, is_student, gender, social_category)
VALUES
(3, 4, 'Suresh Patel', '1959-11-20', 67, 'Gujarat', 'Ahmedabad', 85000.00, 'Retired Worker', 'retired', 'primary', 2, 'owned', 'urban', TRUE, 45, FALSE, 'male', 'general')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 3. Insert Welfare Schemes
INSERT INTO welfare_schemes
(id, scheme_name, slug, description, category, department, state_coverage, min_age, max_age, min_income, max_income, eligible_occupations, official_url, is_active, source_ref, last_verified_date, is_demonstration)
VALUES
(1, 'PM Kisan Samman Nidhi (Farmer Income Support)', 'pm-kisan-income-support',
 'Direct financial support of Rs 6,000 per year distributed in three equal installments to small and marginal landholding farmer families across the country.',
 'Agriculture & Farmers', 'Ministry of Agriculture & Farmers Welfare', 'All-India', 18, 100, 0, 250000.00,
 '["Farmer", "Agricultural Worker", "Cultivator"]', 'https://pmkisan.gov.in', TRUE, 'https://pmkisan.gov.in', '2026-03-01', FALSE),

(2, 'Ayushman Universal Health Protection Mission', 'ayushman-health-protection',
 'Comprehensive secondary and tertiary health insurance coverage up to Rs 5,00,000 per family per year for vulnerable low-income households.',
 'Health & Healthcare', 'National Health Authority', 'All-India', 0, 120, 0, 300000.00,
 '["All"]', 'https://pmjay.gov.in', TRUE, 'https://pmjay.gov.in', '2026-02-15', FALSE),

(3, 'Pradhan Mantri Awas Yojana - Gramin (Rural Housing)', 'pm-awas-yojana-gramin',
 'Financial assistance to homeless families and households living in kutcha or severely damaged houses in rural regions for pucca house construction.',
 'Housing & Shelter', 'Ministry of Rural Development', 'All-India', 18, 90, 0, 200000.00,
 '["All"]', 'https://pmayg.nic.in', TRUE, 'https://pmayg.nic.in', '2026-01-20', FALSE),

(4, 'Post-Matric Higher Education Financial Grant', 'post-matric-education-grant',
 'Full tuition fee waiver and monthly stipend for meritorious students pursuing university education from low-income households.',
 'Education & Youth', 'Ministry of Social Justice & Empowerment', 'All-India', 16, 30, 0, 250000.00,
 '["Student"]', 'https://scholarships.gov.in', TRUE, 'https://scholarships.gov.in', '2026-02-01', FALSE),

(5, 'Indira Gandhi National Old Age Pension Scheme', 'ignops-senior-pension',
 'Monthly social security financial pension for elder citizens living below the official poverty threshold without formal employment support.',
 'Social Security & Pension', 'Ministry of Rural Development - NSAP', 'All-India', 60, 120, 0, 150000.00,
 '["Retired", "Unemployed", "Homemaker", "Other"]', 'https://nsap.nic.in', TRUE, 'https://nsap.nic.in', '2026-03-10', FALSE),

(6, 'Divyangjan Inclusive Vocational Skill Grant', 'divyangjan-skill-grant',
 'Specialized skill acquisition subsidy and assistive equipment allowance for certified persons with disability striving towards economic independence.',
 'Disability Welfare', 'Department of Empowerment of Persons with Disabilities', 'All-India', 18, 55, 0, 350000.00,
 '["All"]', 'https://disabilityaffairs.gov.in', TRUE, 'https://disabilityaffairs.gov.in', '2026-01-15', FALSE),

(7, 'State Artisans & Traditional Handloom Support Grant', 'tamil-nadu-handloom-artisan-grant',
 'Dedicated working capital subsidy and raw material credit support for registered master weavers and artisanal workers residing in Tamil Nadu.',
 'Handloom & Handicrafts', 'Department of Handlooms, Textiles and Khadi', 'Tamil Nadu', 18, 70, 0, 180000.00,
 '["Artisan", "Handloom Weaver", "Craftsperson"]', 'https://www.tn.gov.in', TRUE, 'https://www.tn.gov.in', '2026-02-28', TRUE)
ON DUPLICATE KEY UPDATE scheme_name=VALUES(scheme_name);

-- 4. Insert Flexible Eligibility Criteria
-- Scheme 1: PM Kisan
INSERT INTO eligibility_criteria (scheme_id, criterion_type, profile_field, operator, target_value, is_mandatory, weight, description, failure_reason) VALUES
(1, 'occupation', 'occupation', 'in', '["Farmer", "Agricultural Worker", "Cultivator"]', TRUE, 2.00, 'Primary occupation must be agricultural cultivation or farm labor', 'Applicant occupation is not registered as farmer or agricultural cultivator'),
(1, 'income', 'annual_income', '<=', '250000', TRUE, 2.00, 'Annual family income must not exceed Rs 2,50,000', 'Annual family income exceeds the Rs 2,50,000 ceiling'),
(1, 'age', 'age', '>=', '18', TRUE, 1.00, 'Must be at least 18 years of age', 'Applicant must be an adult aged 18 or above'),
(1, 'area_type', 'area_type', '==', 'rural', FALSE, 1.50, 'Priority consideration for rural farm lands', 'Applicant resides in an urban location rather than a rural agrarian zone');

-- Scheme 2: Ayushman Health
INSERT INTO eligibility_criteria (scheme_id, criterion_type, profile_field, operator, target_value, is_mandatory, weight, description, failure_reason) VALUES
(2, 'income', 'annual_income', '<=', '300000', TRUE, 2.50, 'Annual family income must not exceed Rs 3,00,000', 'Annual family income exceeds the maximum threshold of Rs 3,00,000'),
(2, 'age', 'age', '>=', '0', TRUE, 1.00, 'Universal age coverage for entire household', 'Age out of coverage bounds'),
(2, 'housing_status', 'housing_status', 'in', '["kutcha_house", "homeless", "rented"]', FALSE, 1.50, 'Preference for households without permanent pucca housing', 'Applicant owns a permanent pucca dwelling'),
(2, 'family_size', 'family_size', '>=', '3', FALSE, 1.00, 'Enhanced priority for families with 3 or more members', 'Family size is below 3');

-- Scheme 3: PM Awas Gramin
INSERT INTO eligibility_criteria (scheme_id, criterion_type, profile_field, operator, target_value, is_mandatory, weight, description, failure_reason) VALUES
(3, 'area_type', 'area_type', '==', 'rural', TRUE, 2.50, 'Must reside strictly in a designated rural panchayat area', 'Applicant does not reside in a recognized rural panchayat jurisdiction'),
(3, 'income', 'annual_income', '<=', '200000', TRUE, 2.00, 'Annual income must be within low-income threshold of Rs 2,00,000', 'Annual income exceeds the rural housing threshold of Rs 2,00,000'),
(3, 'housing_status', 'housing_status', 'in', '["kutcha_house", "homeless", "rented"]', TRUE, 2.00, 'Must be living in a kutcha house or homeless', 'Applicant already owns a permanent pucca structure'),
(3, 'family_size', 'family_size', '>=', '2', FALSE, 1.00, 'Preference for multi-member dependent households', 'Single-member household');

-- Scheme 4: Post-Matric Education Grant
INSERT INTO eligibility_criteria (scheme_id, criterion_type, profile_field, operator, target_value, is_mandatory, weight, description, failure_reason) VALUES
(4, 'student', 'is_student', '==', 'true', TRUE, 2.50, 'Applicant must currently be an active enrolled student', 'Applicant is not currently enrolled as an active student'),
(4, 'age', 'age', 'between', '[16, 30]', TRUE, 1.50, 'Student must be between 16 and 30 years old', 'Applicant age is outside the 16-30 higher education bracket'),
(4, 'income', 'annual_income', '<=', '250000', TRUE, 2.00, 'Household income must not exceed Rs 2,50,000 per annum', 'Annual income exceeds the higher education grant limit'),
(4, 'education_level', 'education_level', 'in', '["higher_secondary", "graduate", "post_graduate", "doctorate"]', FALSE, 1.50, 'Enrolled in senior secondary or tertiary higher education', 'Enrolled in primary or middle schooling');

-- Scheme 5: Old Age Pension
INSERT INTO eligibility_criteria (scheme_id, criterion_type, profile_field, operator, target_value, is_mandatory, weight, description, failure_reason) VALUES
(5, 'age', 'age', '>=', '60', TRUE, 3.00, 'Must have completed at least 60 years of age', 'Applicant has not attained the minimum retirement age of 60'),
(5, 'income', 'annual_income', '<=', '150000', TRUE, 2.50, 'Annual income must not exceed Rs 1,50,000 for destitute senior citizens', 'Annual income exceeds the senior citizen welfare ceiling of Rs 1,50,000'),
(5, 'employment_status', 'employment_status', 'in', '["retired", "unemployed", "other"]', TRUE, 1.50, 'Must not be actively employed in high-paying formal commerce', 'Applicant is currently actively employed in formal industry'),
(5, 'disability', 'is_disabled', '==', 'true', FALSE, 1.50, 'Additional geriatric and disability medical allowance bonus', 'Applicant is not certified with physical disability');

-- Scheme 6: Divyangjan Vocational Skill Grant
INSERT INTO eligibility_criteria (scheme_id, criterion_type, profile_field, operator, target_value, is_mandatory, weight, description, failure_reason) VALUES
(6, 'disability', 'is_disabled', '==', 'true', TRUE, 3.00, 'Applicant must hold valid certification as a Person with Disability', 'Applicant is not registered as a Person with Disability'),
(6, 'custom', 'disability_percentage', '>=', '40', TRUE, 2.00, 'Disability benchmark percentage must be 40% or higher', 'Certified disability percentage is below the mandatory 40% threshold'),
(6, 'age', 'age', 'between', '[18, 55]', TRUE, 1.50, 'Must be in the working-age vocational band between 18 and 55', 'Age is outside the 18-55 working age group for vocational placement'),
(6, 'income', 'annual_income', '<=', '350000', FALSE, 1.50, 'Preference for lower-income applicants', 'Annual income is above preferred Rs 3,50,000 band');

-- Scheme 7: Tamil Nadu Handloom Grant
INSERT INTO eligibility_criteria (scheme_id, criterion_type, profile_field, operator, target_value, is_mandatory, weight, description, failure_reason) VALUES
(7, 'state', 'state', '==', 'Tamil Nadu', TRUE, 3.00, 'Must be a bona fide resident of Tamil Nadu state', 'Applicant does not reside within Tamil Nadu state jurisdiction'),
(7, 'occupation', 'occupation', 'in', '["Artisan", "Handloom Weaver", "Craftsperson"]', TRUE, 2.50, 'Must be engaged in traditional artisanal or handloom craft', 'Occupation does not match recognized artisanal craft or handloom trades'),
(7, 'age', 'age', '>=', '18', TRUE, 1.00, 'Must be an adult artisan aged 18 or above', 'Artisan is under 18 years of age'),
(7, 'income', 'annual_income', '<=', '180000', FALSE, 1.50, 'Priority income threshold of Rs 1,80,000', 'Income is above Rs 1,80,000 priority ceiling');

-- 5. Insert Scheme Required Documents
INSERT INTO scheme_documents (scheme_id, document_name, description, is_mandatory, issuing_authority) VALUES
-- PM Kisan
(1, 'Land Ownership Record (Khatauni / Patta)', 'Valid revenue record certifying agricultural land holding', TRUE, 'Revenue Department / Tehsildar'),
(1, 'Government ID Card (Voter ID / Ration Card)', 'Proof of identity with current residential address', TRUE, 'Election Commission / Civil Supplies'),
(1, 'Bank Account Passbook Copy', 'Account details for direct benefit transfer (DBT) credit', TRUE, 'Scheduled Commercial Bank / Post Office'),

-- Ayushman Health
(2, 'Income Certificate or BPL Card', 'Verification of annual household income or priority category', TRUE, 'Revenue Department / Block Development Officer'),
(2, 'Family Ration Card', 'Proof of household composition and listing of dependent members', TRUE, 'Department of Food & Civil Supplies'),
(2, 'Identity Proof (Voter ID / Driving License)', 'Individual proof of identity for each family beneficiary', TRUE, 'Government of India'),

-- PM Awas Gramin
(3, 'Gram Panchayat Residence Certificate', 'Confirmation of habitual residence in the gram panchayat area', TRUE, 'Gram Panchayat Secretary / Pradhan'),
(3, 'Kutcha House Verification Affidavit', 'Survey certification verifying absence of pucca brick/concrete roof', TRUE, 'Block Development Office (BDO)'),
(3, 'BPL Ration Card', 'Proof of economic disadvantage', TRUE, 'Civil Supplies Department'),

-- Post-Matric Education
(4, 'College Enrollment / Admission Receipt', 'Proof of active admission in a recognized university or college', TRUE, 'University Registrar / Principal'),
(4, 'Previous Academic Marksheet', 'Passing certificate of high school or diploma qualification', TRUE, 'State Education Board / University'),
(4, 'Income Certificate', 'Income certificate issued within the preceding 12 months', TRUE, 'Tehsildar / Competent Revenue Authority'),
(4, 'Institutional Student ID Card', 'Valid student identity badge', TRUE, 'College Authority'),

-- Old Age Pension
(5, 'Age Verification Certificate', 'Birth certificate, school leaving certificate, or Voter ID showing 60+ years', TRUE, 'Municipal Health Office / Election Commission'),
(5, 'BPL Poverty Certification', 'Endorsement proving family income below poverty line', TRUE, 'District Social Welfare Officer'),
(5, 'Bank / Post Office Savings Account Passbook', 'Active personal bank account for monthly electronic pension deposit', TRUE, 'Post Office / Public Sector Bank'),

-- Divyangjan Vocational Grant
(6, 'Unique Disability ID (UDID) Card', 'Permanent disability certificate certifying >= 40% impairment', TRUE, 'District Medical Board / CMO'),
(6, 'Age & Residence Proof', 'Verification of age and local residence', TRUE, 'Competent Authority'),
(6, 'Educational / Training Certificate', 'Basic literacy or previous skill certificate if applicable', FALSE, 'Recognized School or ITI'),

-- Tamil Nadu Handloom Grant
(7, 'Weavers Co-operative Society Card', 'Membership card from registered Primary Weavers Co-op Society', TRUE, 'Director of Handlooms & Textiles, Tamil Nadu'),
(7, 'Tamil Nadu Domicile Certificate', 'Proof of continuous residence within Tamil Nadu', TRUE, 'Tahsildar (Taluk Office, Tamil Nadu)'),
(7, 'Artisan Credit Card / Bank Passbook', 'Bank account details for subsidy disbursement', TRUE, 'Commercial Bank');

-- 6. Insert Demonstration Notifications
INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES
(1, 2, 'New PM Kisan 17th Installment Announced', 'The government has released the 17th installment of PM Kisan. Verify your landholding documents for direct benefit transfer.', 'scheme_update', FALSE),
(2, 2, 'Eligibility Assessment Ready', 'Your profile matches 4 high-priority central welfare schemes with high confidence.', 'eligibility_result', FALSE),
(3, 2, 'Kisan Credit Card Subsidy Window Open', 'Applications for interest subvention on short term crop loans are now open.', 'deadline', TRUE),
(4, 3, 'National Scholarship Portal 2026 Active', 'Fresh scholarship applications for Post-Matric education financial aid are open.', 'scheme_update', FALSE),
(5, 3, 'Document Verification Notice', 'Please keep your college enrollment certificate and income affidavit ready for verification.', 'system', FALSE),
(6, 4, 'Senior Citizen Healthcare Camps Announced', 'Free geriatric diagnostic camps under Ayushman Bharat are scheduled in your district.', 'scheme_update', FALSE)
ON DUPLICATE KEY UPDATE title=VALUES(title);

