-- ============================================================================
-- Smart Welfare Scheme Eligibility Prediction Engine
-- Database Schema: MySQL 8.0+
-- Relational normalized design with foreign keys, indexes, and constraints
-- ============================================================================

CREATE DATABASE IF NOT EXISTS welfare_schemes_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE welfare_schemes_db;

-- 1. Users table (Role-based access: citizen or admin)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NULL,
  google_id VARCHAR(255) UNIQUE NULL,
  avatar_url VARCHAR(500) NULL,
  role ENUM('citizen', 'admin') NOT NULL DEFAULT 'citizen',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_google_id (google_id),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Citizen Profiles table (Socio-economic information for scheme matching)
CREATE TABLE IF NOT EXISTS citizen_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  date_of_birth DATE NULL,
  age INT NOT NULL,
  state VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  annual_income DECIMAL(12, 2) NOT NULL,
  occupation VARCHAR(100) NOT NULL,
  employment_status ENUM('employed', 'self_employed', 'unemployed', 'student', 'retired', 'homemaker', 'other') NOT NULL DEFAULT 'other',
  education_level ENUM('no_formal_education', 'primary', 'secondary', 'higher_secondary', 'graduate', 'post_graduate', 'doctorate') NOT NULL DEFAULT 'secondary',
  family_size INT NOT NULL DEFAULT 1,
  housing_status ENUM('owned', 'rented', 'homeless', 'kutcha_house', 'other') NOT NULL DEFAULT 'owned',
  area_type ENUM('rural', 'urban', 'semi_urban') NOT NULL DEFAULT 'urban',
  is_disabled BOOLEAN NOT NULL DEFAULT FALSE,
  disability_percentage INT NULL DEFAULT 0,
  is_student BOOLEAN NOT NULL DEFAULT FALSE,
  gender ENUM('male', 'female', 'transgender', 'other') NULL,
  social_category ENUM('general', 'obc', 'sc', 'st', 'minority', 'other') NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_profiles_user (user_id),
  INDEX idx_profiles_state (state),
  INDEX idx_profiles_income (annual_income),
  INDEX idx_profiles_age (age)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Welfare Schemes table
CREATE TABLE IF NOT EXISTS welfare_schemes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  scheme_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  department VARCHAR(200) NOT NULL,
  state_coverage VARCHAR(100) NOT NULL DEFAULT 'All-India',
  min_age INT NULL,
  max_age INT NULL,
  min_income DECIMAL(12, 2) NULL,
  max_income DECIMAL(12, 2) NULL,
  eligible_occupations JSON NULL,
  official_url VARCHAR(500) NULL,
  source_id VARCHAR(100) NULL,
  source_url VARCHAR(500) NULL,
  benefits_summary TEXT NULL,
  verification_status ENUM('verified', 'pending_verification', 'rejected', 'outdated') NOT NULL DEFAULT 'verified',
  import_date TIMESTAMP NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  source_ref VARCHAR(255) NOT NULL DEFAULT 'Official Government Portal',
  last_verified_date DATE NOT NULL,
  is_demonstration BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_schemes_category (category),
  INDEX idx_schemes_active (is_active),
  INDEX idx_schemes_state (state_coverage),
  INDEX idx_schemes_source (source_id),
  INDEX idx_schemes_verification (verification_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Eligibility Criteria table (Flexible criteria rule definitions)
CREATE TABLE IF NOT EXISTS eligibility_criteria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  scheme_id INT NOT NULL,
  criterion_type ENUM('age', 'income', 'state', 'occupation', 'employment_status', 'education_level', 'family_size', 'housing_status', 'area_type', 'disability', 'student', 'gender', 'social_category', 'custom') NOT NULL,
  profile_field VARCHAR(100) NOT NULL,
  operator ENUM('<=', '>=', '<', '>', '==', '!=', 'in', 'not_in', 'between') NOT NULL,
  target_value TEXT NOT NULL,
  is_mandatory BOOLEAN NOT NULL DEFAULT FALSE,
  weight DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
  description VARCHAR(255) NOT NULL,
  failure_reason VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_criteria_scheme FOREIGN KEY (scheme_id) REFERENCES welfare_schemes(id) ON DELETE CASCADE,
  INDEX idx_criteria_scheme (scheme_id),
  INDEX idx_criteria_type (criterion_type),
  INDEX idx_criteria_mandatory (is_mandatory)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Scheme Documents table (Document requirements checklist)
CREATE TABLE IF NOT EXISTS scheme_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  scheme_id INT NOT NULL,
  document_name VARCHAR(200) NOT NULL,
  description VARCHAR(500) NULL,
  is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
  issuing_authority VARCHAR(200) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_docs_scheme FOREIGN KEY (scheme_id) REFERENCES welfare_schemes(id) ON DELETE CASCADE,
  INDEX idx_docs_scheme (scheme_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Saved Schemes table (Citizen bookmarks)
CREATE TABLE IF NOT EXISTS saved_schemes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  scheme_id INT NOT NULL,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT NULL,
  CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_saved_scheme FOREIGN KEY (scheme_id) REFERENCES welfare_schemes(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_scheme (user_id, scheme_id),
  INDEX idx_saved_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Eligibility Assessments table (Assessment execution history)
CREATE TABLE IF NOT EXISTS eligibility_assessments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_schemes_evaluated INT NOT NULL DEFAULT 0,
  eligible_count INT NOT NULL DEFAULT 0,
  needs_info_count INT NOT NULL DEFAULT 0,
  unlikely_count INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_assessments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_assessments_user (user_id),
  INDEX idx_assessments_time (evaluated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Assessment Details table (Per-scheme granular score & match breakdown)
CREATE TABLE IF NOT EXISTS assessment_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assessment_id INT NOT NULL,
  scheme_id INT NOT NULL,
  matching_score DECIMAL(5, 2) NOT NULL,
  result_category ENUM('Potentially Eligible', 'Needs More Information', 'Unlikely to Qualify', 'Not Evaluated') NOT NULL,
  mandatory_satisfied BOOLEAN NOT NULL DEFAULT TRUE,
  satisfied_criteria JSON NULL,
  unmet_criteria JSON NULL,
  missing_fields JSON NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_details_assessment FOREIGN KEY (assessment_id) REFERENCES eligibility_assessments(id) ON DELETE CASCADE,
  CONSTRAINT fk_details_scheme FOREIGN KEY (scheme_id) REFERENCES welfare_schemes(id) ON DELETE CASCADE,
  INDEX idx_details_assessment (assessment_id),
  INDEX idx_details_scheme (scheme_id),
  INDEX idx_details_category (result_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Notifications table (User notifications & scheme alerts)
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('scheme_update', 'eligibility_result', 'deadline', 'system') NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_unread (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Scheme Import Logs table (Tracking government dataset imports and audit reports)
CREATE TABLE IF NOT EXISTS scheme_import_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  source_type ENUM('csv', 'json', 'api_datagov', 'api_tngov', 'manual') NOT NULL,
  source_name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NULL,
  total_records INT NOT NULL DEFAULT 0,
  imported_count INT NOT NULL DEFAULT 0,
  updated_count INT NOT NULL DEFAULT 0,
  skipped_count INT NOT NULL DEFAULT 0,
  rejected_count INT NOT NULL DEFAULT 0,
  status ENUM('completed', 'failed', 'rolled_back') NOT NULL DEFAULT 'completed',
  error_log JSON NULL,
  report_summary JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_import_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_import_admin (admin_id),
  INDEX idx_import_status (status),
  INDEX idx_import_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

