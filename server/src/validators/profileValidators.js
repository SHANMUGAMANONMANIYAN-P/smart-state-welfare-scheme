/**
 * Citizen Profile Input Validation
 */

export const VALID_EMPLOYMENT_STATUSES = [
  'employed',
  'self_employed',
  'unemployed',
  'student',
  'retired',
  'homemaker',
  'other',
];

export const VALID_EDUCATION_LEVELS = [
  'no_formal_education',
  'primary',
  'secondary',
  'higher_secondary',
  'graduate',
  'post_graduate',
  'doctorate',
];

export const VALID_HOUSING_STATUSES = [
  'owned',
  'rented',
  'homeless',
  'kutcha_house',
  'other',
];

export const VALID_AREA_TYPES = ['rural', 'urban', 'semi_urban'];

export function validateProfileInput(data) {
  const errors = {};

  // Full name
  if (!data.full_name || typeof data.full_name !== 'string' || data.full_name.trim().length < 2) {
    errors.full_name = 'Full name must contain at least 2 characters.';
  }

  // Age validation
  const age = Number(data.age);
  if (data.age === undefined || data.age === null || isNaN(age) || age < 0 || age >= 100) {
    errors.age = 'Age must be a valid number below 100 (0 to 99).';
  }

  // State & District
  if (!data.state || typeof data.state !== 'string' || !data.state.trim()) {
    errors.state = 'State / Union Territory is required.';
  }

  if (!data.district || typeof data.district !== 'string' || !data.district.trim()) {
    errors.district = 'District is required.';
  }

  // Annual household income
  const income = Number(data.annual_income);
  if (data.annual_income === undefined || data.annual_income === null || isNaN(income) || income < 0) {
    errors.annual_income = 'Annual household income must be a non-negative number.';
  }

  // Occupation
  if (!data.occupation || typeof data.occupation !== 'string' || !data.occupation.trim()) {
    errors.occupation = 'Occupation or primary trade is required.';
  }

  // Employment status
  if (data.employment_status && !VALID_EMPLOYMENT_STATUSES.includes(data.employment_status)) {
    errors.employment_status = `Employment status must be one of: ${VALID_EMPLOYMENT_STATUSES.join(', ')}`;
  }

  // Education level
  if (data.education_level && !VALID_EDUCATION_LEVELS.includes(data.education_level)) {
    errors.education_level = `Education level must be one of: ${VALID_EDUCATION_LEVELS.join(', ')}`;
  }

  // Family size
  const familySize = Number(data.family_size);
  if (data.family_size !== undefined && (isNaN(familySize) || familySize < 1 || familySize > 50)) {
    errors.family_size = 'Family size must be between 1 and 50 members.';
  }

  // Housing status
  if (data.housing_status && !VALID_HOUSING_STATUSES.includes(data.housing_status)) {
    errors.housing_status = `Housing status must be one of: ${VALID_HOUSING_STATUSES.join(', ')}`;
  }

  // Area type
  if (data.area_type && !VALID_AREA_TYPES.includes(data.area_type)) {
    errors.area_type = `Area type must be one of: ${VALID_AREA_TYPES.join(', ')}`;
  }

  // Disability percentage
  if (data.is_disabled) {
    const disPct = Number(data.disability_percentage);
    if (data.disability_percentage !== undefined && (isNaN(disPct) || disPct < 0 || disPct > 100)) {
      errors.disability_percentage = 'Disability percentage must be between 0% and 100%.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export default {
  validateProfileInput,
  VALID_EMPLOYMENT_STATUSES,
  VALID_EDUCATION_LEVELS,
  VALID_HOUSING_STATUSES,
  VALID_AREA_TYPES,
};
