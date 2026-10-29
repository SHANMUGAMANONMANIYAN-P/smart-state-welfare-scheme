import crypto from 'crypto';
import {
  registerCitizen,
  loginUser,
  getCurrentUser,
  isGoogleOAuthConfigured,
  generateGoogleAuthUrl,
  exchangeGoogleCodeForUser,
  verifyGoogleIdToken,
  handleGoogleAuthUser,
} from '../services/authService.js';
import { validateRegistrationInput, validateLoginInput } from '../validators/authValidators.js';

export async function register(req, res, next) {
  try {
    const validation = validateRegistrationInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration inputs.',
        errors: validation.errors,
      });
    }

    const result = await registerCitizen(req.body);
    res.status(201).json({
      success: true,
      message: 'Citizen account created successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const validation = validateLoginInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid login inputs.',
        errors: validation.errors,
      });
    }

    const result = await loginUser(req.body);
    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.clearCookie('welfare_jwt');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
}

export async function getMe(req, res, next) {
  try {
    const user = await getCurrentUser(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Check Google OAuth configuration status
 */
export async function getGoogleStatus(req, res) {
  const configured = isGoogleOAuthConfigured();
  res.status(200).json({
    success: true,
    data: {
      configured,
      clientId: configured ? process.env.GOOGLE_CLIENT_ID : null,
      message: configured
        ? 'Google OAuth 2.0 is configured and active.'
        : 'Google OAuth credentials (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET) need to be configured in server/.env.',
    },
  });
}

/**
 * Redirect user to Google's official authorization screen
 */
export async function initiateGoogleAuth(req, res) {
  const configured = isGoogleOAuthConfigured();
  if (!configured) {
    // Return friendly error with developer instructions
    return res.redirect(
      '/login?error=google_not_configured&message=' +
        encodeURIComponent('Google OAuth credentials are not configured in server/.env. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.')
    );
  }

  // Generate cryptographic state for CSRF protection
  const state = crypto.randomBytes(16).toString('hex');
  res.cookie('welfare_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000, // 10 minutes
  });

  const authUrl = generateGoogleAuthUrl(state);
  res.redirect(authUrl);
}

/**
 * Handle Google OAuth callback with authorization code
 */
export async function handleGoogleCallback(req, res) {
  try {
    const { code, state, error } = req.query;

    if (error) {
      console.warn('[Google OAuth Notice] User cancelled or Google returned error:', error);
      return res.redirect('/login?error=google_access_denied&message=' + encodeURIComponent('Google sign-in was cancelled.'));
    }

    if (!code) {
      return res.redirect('/login?error=missing_code&message=' + encodeURIComponent('No authorization code was returned by Google.'));
    }

    // Exchange code for Google identity
    const googleUser = await exchangeGoogleCodeForUser(code);

    // Locate or create citizen account
    const result = await handleGoogleAuthUser(googleUser);

    // Set secure cookie
    res.cookie('welfare_jwt', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend callback handler
    return res.redirect('/auth/callback?token=' + encodeURIComponent(result.token));
  } catch (err) {
    console.error('[Google OAuth Callback Error]', err.message);
    return res.redirect(
      '/login?error=oauth_failed&message=' + encodeURIComponent(err.message || 'Google authentication failed.')
    );
  }
}

/**
 * Authenticate via Google ID Token directly (e.g. Google One Tap / GSI button)
 */
export async function authenticateGoogleCredential(req, res, next) {
  try {
    const { credential, idToken } = req.body;
    const tokenToVerify = credential || idToken;

    if (!tokenToVerify) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token credential is required.',
      });
    }

    const googleUser = await verifyGoogleIdToken(tokenToVerify);
    const result = await handleGoogleAuthUser(googleUser);

    res.cookie('welfare_jwt', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Google authentication successful.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export default {
  register,
  login,
  logout,
  getMe,
  getGoogleStatus,
  initiateGoogleAuth,
  handleGoogleCallback,
  authenticateGoogleCredential,
};
