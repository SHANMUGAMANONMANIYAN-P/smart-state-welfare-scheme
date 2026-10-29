import { query } from '../config/db.js';
import { validateProfileInput } from '../validators/profileValidators.js';

/**
 * Get profile for authenticated user
 */
export async function getProfileByUserId(userId) {
  const rows = await query('SELECT * FROM citizen_profiles WHERE user_id = ?', [userId]);
  if (!rows || rows.length === 0) {
    return null;
  }
  return rows[0];
}

/**
 * Update or create citizen profile
 */
export async function upsertProfile(userId, profileData) {
  const validation = validateProfileInput(profileData);
  if (!validation.isValid) {
    const error = new Error('Profile validation failed.');
    error.statusCode = 400;
    error.isOperational = true;
    error.errors = validation.errors;
    throw error;
  }

  const existing = await query('SELECT id FROM citizen_profiles WHERE user_id = ?', [userId]);

  const params = [
    profileData.full_name.trim(),
    profileData.date_of_birth || null,
    Number(profileData.age),
    profileData.state.trim(),
    profileData.district.trim(),
    Number(profileData.annual_income),
    profileData.occupation.trim(),
    profileData.employment_status || 'other',
    profileData.education_level || 'secondary',
    Number(profileData.family_size) || 1,
    profileData.housing_status || 'owned',
    profileData.area_type || 'urban',
    profileData.is_disabled ? 1 : 0,
    Number(profileData.disability_percentage) || 0,
    profileData.is_student ? 1 : 0,
    profileData.gender || null,
    profileData.social_category || null,
  ];

  if (existing && existing.length > 0) {
    // Update existing profile
    await query(
      `UPDATE citizen_profiles SET 
        full_name = ?,
        date_of_birth = ?,
        age = ?,
        state = ?,
        district = ?,
        annual_income = ?,
        occupation = ?,
        employment_status = ?,
        education_level = ?,
        family_size = ?,
        housing_status = ?,
        area_type = ?,
        is_disabled = ?,
        disability_percentage = ?,
        is_student = ?,
        gender = ?,
        social_category = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?`,
      [...params, userId]
    );
  } else {
    // Insert new profile
    await query(
      `INSERT INTO citizen_profiles 
        (full_name, date_of_birth, age, state, district, annual_income, occupation, employment_status, education_level, family_size, housing_status, area_type, is_disabled, disability_percentage, is_student, gender, social_category, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [...params, userId]
    );
  }

  return await getProfileByUserId(userId);
}

/**
 * Calculate profile completion percentage and status
 */
export async function getProfileCompletionStatus(userId) {
  const profile = await getProfileByUserId(userId);
  if (!profile) {
    return {
      completion_percentage: 0,
      is_complete: false,
      missing_fields: ['full_name', 'age', 'state', 'district', 'annual_income', 'occupation'],
    };
  }

  const requiredFields = [
    'full_name',
    'age',
    'state',
    'district',
    'annual_income',
    'occupation',
    'employment_status',
    'education_level',
    'family_size',
    'housing_status',
    'area_type',
  ];

  const missing = [];
  requiredFields.forEach((field) => {
    const val = profile[field];
    if (val === undefined || val === null || val === '') {
      missing.push(field);
    }
  });

  const filledCount = requiredFields.length - missing.length;
  const percentage = Math.round((filledCount / requiredFields.length) * 100);

  return {
    completion_percentage: percentage,
    is_complete: missing.length === 0,
    filled_count: filledCount,
    total_required: requiredFields.length,
    missing_fields: missing,
  };
}

export default {
  getProfileByUserId,
  upsertProfile,
  getProfileCompletionStatus,
};

