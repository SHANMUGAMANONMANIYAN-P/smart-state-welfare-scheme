import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { query } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'smart_welfare_jwt_secret_secure_key_2026';
const JWT_EXPIRES_IN = '7d';

/**
 * Register a new citizen (Admin accounts cannot be self-registered)
 */
export async function registerCitizen({ email, password, full_name, age, state, district, occupation, annual_income }) {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check duplicate email
  const existingUsers = await query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
  if (existingUsers && existingUsers.length > 0) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    error.isOperational = true;
    throw error;
  }

  // 2. Hash password with bcrypt (salt rounds = 10)
  const passwordHash = await bcrypt.hash(password, 10);

  // 3. Enforce citizen role explicitly
  const insertUserResult = await query(
    'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
    [normalizedEmail, passwordHash, 'citizen']
  );

  const userId = insertUserResult.insertId;

  // 4. Create initial citizen profile
  const parsedAge = age !== undefined && age !== null ? Number(age) : 25;
  if (isNaN(parsedAge) || parsedAge < 0 || parsedAge >= 100) {
    const error = new Error('Age must be below 100 (0 to 99).');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }
  const parsedIncome = annual_income ? Number(annual_income) : 100000;

  await query(
    `INSERT INTO citizen_profiles 
     (user_id, full_name, age, state, district, annual_income, occupation, employment_status, education_level, family_size, housing_status, area_type, is_disabled, is_student)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      full_name.trim(),
      parsedAge,
      state || 'National',
      district || 'Central',
      parsedIncome,
      occupation || 'General Worker',
      'other',
      'secondary',
      1,
      'owned',
      'urban',
      0,
      0,
    ]
  );

  // 5. Generate JWT token
  const token = jwt.sign(
    { id: userId, email: normalizedEmail, role: 'citizen' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: userId,
      email: normalizedEmail,
      role: 'citizen',
      full_name: full_name.trim(),
    },
  };
}

/**
 * Authenticate citizen or administrator via email/password (e.g. administrator fallback)
 */
export async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Find user
  const users = await query(
    'SELECT id, email, password_hash, role, avatar_url FROM users WHERE email = ?',
    [normalizedEmail]
  );

  if (!users || users.length === 0) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.isOperational = true;
    throw error;
  }

  const user = users[0];

  if (!user.password_hash) {
    const error = new Error('This account was created with Google Sign-In. Please click "Continue with Google".');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  // 2. Compare password hash
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.isOperational = true;
    throw error;
  }

  // 3. Fetch profile name if exists
  const profiles = await query(
    'SELECT full_name FROM citizen_profiles WHERE user_id = ?',
    [user.id]
  );
  const fullName = profiles && profiles.length > 0 ? profiles[0].full_name : null;

  // 4. Generate JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: fullName,
      avatar_url: user.avatar_url || null,
    },
  };
}

/**
 * Get configured Google OAuth Client
 */
export function getGoogleOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/google/callback';

  if (!clientId || !clientSecret || clientId.trim() === '' || clientSecret.trim() === '' || clientId.includes('replace_')) {
    return null;
  }
  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

/**
 * Check if Google OAuth credentials have been configured
 */
export function isGoogleOAuthConfigured() {
  const client = getGoogleOAuthClient();
  return Boolean(client);
}

/**
 * Generate Google OAuth authorization URL
 */
export function generateGoogleAuthUrl(state) {
  const client = getGoogleOAuthClient();
  if (!client) {
    return null;
  }
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    state,
    prompt: 'select_account',
  });
}

/**
 * Exchange Google authorization code for verified user info
 */
export async function exchangeGoogleCodeForUser(code) {
  const client = getGoogleOAuthClient();
  if (!client) {
    throw new Error('Google OAuth is not configured on this server.');
  }

  const { tokens } = await client.getToken(code);
  if (!tokens.id_token) {
    throw new Error('Google did not return an identity token.');
  }

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  if (!payload || !payload.email) {
    throw new Error('Invalid token payload received from Google.');
  }

  if (!payload.email_verified) {
    throw new Error('Google email is not verified. Please verify your Google email address first.');
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name || payload.given_name || 'Citizen',
    avatarUrl: payload.picture || null,
  };
}

/**
 * Verify Google ID token directly (for client-side credential/One Tap response)
 */
export async function verifyGoogleIdToken(idToken) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('Google OAuth Client ID is not configured on this server.');
  }

  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: clientId,
  });
  const payload = ticket.getPayload();

  if (!payload || !payload.email) {
    throw new Error('Invalid ID token payload from Google.');
  }

  if (!payload.email_verified) {
    throw new Error('Google email is not verified.');
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name || payload.given_name || 'Citizen',
    avatarUrl: payload.picture || null,
  };
}

/**
 * Locate or automatically create citizen account from verified Google identity
 */
export async function handleGoogleAuthUser({ googleId, email, name, avatarUrl }) {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Locate user by google_id
  let users = await query(
    'SELECT id, email, role, google_id, avatar_url FROM users WHERE google_id = ?',
    [googleId]
  );

  let user = null;

  if (users && users.length > 0) {
    user = users[0];
    if (avatarUrl && avatarUrl !== user.avatar_url) {
      await query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, user.id]);
      user.avatar_url = avatarUrl;
    }
  } else {
    // 2. Check if user already exists by verified email (link existing account)
    users = await query(
      'SELECT id, email, role, google_id, avatar_url FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (users && users.length > 0) {
      user = users[0];

      // Administrator Security Check:
      // If the account has admin role, verify against ADMIN_GOOGLE_SUBJECT if set
      if (user.role === 'admin' && process.env.ADMIN_GOOGLE_SUBJECT) {
        if (googleId !== process.env.ADMIN_GOOGLE_SUBJECT) {
          const error = new Error('Unauthorized Google subject for administrator access.');
          error.statusCode = 403;
          error.isOperational = true;
          throw error;
        }
      }

      await query(
        'UPDATE users SET google_id = ?, avatar_url = COALESCE(?, avatar_url) WHERE id = ?',
        [googleId, avatarUrl, user.id]
      );
      user.google_id = googleId;
      user.avatar_url = avatarUrl || user.avatar_url;
    } else {
      // 3. New user registration: Citizen role by default
      let assignedRole = 'citizen';

      // Check if this Google subject matches explicit administrator server configuration
      if (process.env.ADMIN_GOOGLE_SUBJECT && googleId === process.env.ADMIN_GOOGLE_SUBJECT) {
        assignedRole = 'admin';
      }

      const insertResult = await query(
        'INSERT INTO users (email, google_id, avatar_url, role) VALUES (?, ?, ?, ?)',
        [normalizedEmail, googleId, avatarUrl, assignedRole]
      );

      const userId = insertResult.insertId;

      // Create initial citizen profile
      await query(
        `INSERT INTO citizen_profiles 
         (user_id, full_name, age, state, district, annual_income, occupation, employment_status, education_level, family_size, housing_status, area_type, is_disabled, is_student)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          name || 'Citizen',
          25,
          'National',
          'Central',
          100000,
          'General Worker',
          'other',
          'secondary',
          1,
          'owned',
          'urban',
          0,
          0,
        ]
      );

      user = {
        id: userId,
        email: normalizedEmail,
        role: assignedRole,
        google_id: googleId,
        avatar_url: avatarUrl,
      };
    }
  }

  // 4. Fetch profile name
  const profiles = await query('SELECT full_name FROM citizen_profiles WHERE user_id = ?', [user.id]);
  const fullName = profiles && profiles.length > 0 ? profiles[0].full_name : name;

  // 5. Generate application JWT
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: fullName,
      avatar: user.avatar_url,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: fullName,
      avatar_url: user.avatar_url || null,
    },
  };
}

/**
 * Get current authenticated user details
 */
export async function getCurrentUser(userId) {
  const users = await query('SELECT id, email, role, google_id, avatar_url, created_at FROM users WHERE id = ?', [userId]);
  if (!users || users.length === 0) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  const user = users[0];
  const profiles = await query('SELECT * FROM citizen_profiles WHERE user_id = ?', [userId]);
  const profile = profiles && profiles.length > 0 ? profiles[0] : null;

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    google_id: user.google_id || null,
    avatar_url: user.avatar_url || null,
    created_at: user.created_at,
    profile,
  };
}

export default {
  registerCitizen,
  loginUser,
  getCurrentUser,
  getGoogleOAuthClient,
  isGoogleOAuthConfigured,
  generateGoogleAuthUrl,
  exchangeGoogleCodeForUser,
  verifyGoogleIdToken,
  handleGoogleAuthUser,
};
