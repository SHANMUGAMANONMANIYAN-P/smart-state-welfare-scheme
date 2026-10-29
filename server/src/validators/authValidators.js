/**
 * Authentication Input Validation
 */

export function validateRegistrationInput(data) {
  const errors = {};

  // Email validation
  if (!data.email || typeof data.email !== 'string') {
    errors.email = 'Email address is required.';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }
  }

  // Password validation
  if (!data.password || typeof data.password !== 'string') {
    errors.password = 'Password is required.';
  } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  }

  // Full name validation
  if (!data.full_name || typeof data.full_name !== 'string' || data.full_name.trim().length < 2) {
    errors.full_name = 'Full name is required (minimum 2 characters).';
  }

  // Security: Public registration must NEVER accept role='admin'
  if (data.role && data.role !== 'citizen') {
    errors.role = 'Unauthorized role selection. Public accounts must be citizen profiles.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateLoginInput(data) {
  const errors = {};

  if (!data.email || typeof data.email !== 'string' || !data.email.trim()) {
    errors.email = 'Email address is required.';
  }

  if (!data.password || typeof data.password !== 'string' || !data.password) {
    errors.password = 'Password is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export default {
  validateRegistrationInput,
  validateLoginInput,
};
