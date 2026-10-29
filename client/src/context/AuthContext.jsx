import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, profileAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('welfare_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('welfare_token'));
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('welfare_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.data && res.data.data) {
            const userData = res.data.data;
            setUser({
              id: userData.id,
              email: userData.email,
              role: userData.role,
              full_name: userData.profile?.full_name || 'Citizen',
            });
            setProfile(userData.profile || null);
            localStorage.setItem(
              'welfare_user',
              JSON.stringify({
                id: userData.id,
                email: userData.email,
                role: userData.role,
                full_name: userData.profile?.full_name || 'Citizen',
              })
            );
          }
        } catch (err) {
          console.warn('Session verification failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: receivedToken, user: receivedUser } = res.data.data;

    localStorage.setItem('welfare_token', receivedToken);
    localStorage.setItem('welfare_user', JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);

    // Fetch full profile
    try {
      const profRes = await profileAPI.getProfile();
      setProfile(profRes.data.data);
    } catch {
      // Profile may not exist yet for new accounts
    }

    return receivedUser;
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    const { token: receivedToken, user: receivedUser } = res.data.data;

    localStorage.setItem('welfare_token', receivedToken);
    localStorage.setItem('welfare_user', JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);

    try {
      const profRes = await profileAPI.getProfile();
      setProfile(profRes.data.data);
    } catch {
      // Profile may not exist yet
    }

    return receivedUser;
  };

  const handleAuthToken = async (receivedToken) => {
    localStorage.setItem('welfare_token', receivedToken);
    setToken(receivedToken);
    try {
      const res = await authAPI.getMe();
      if (res.data && res.data.data) {
        const userData = res.data.data;
        const normalized = {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          full_name: userData.profile?.full_name || 'Citizen',
          avatar_url: userData.avatar_url || null,
        };
        setUser(normalized);
        setProfile(userData.profile || null);
        localStorage.setItem('welfare_user', JSON.stringify(normalized));
        return normalized;
      }
    } catch (err) {
      console.error('Failed to load user from token:', err);
      logout();
      throw err;
    }
  };

  const loginWithGoogleCredential = async (credential) => {
    const res = await authAPI.verifyGoogleCredential(credential);
    const { token: receivedToken, user: receivedUser } = res.data.data;

    localStorage.setItem('welfare_token', receivedToken);
    localStorage.setItem('welfare_user', JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);

    try {
      const profRes = await profileAPI.getProfile();
      setProfile(profRes.data.data);
    } catch {
      // Profile may not exist yet
    }

    return receivedUser;
  };

  const initiateGoogleSignIn = () => {
    window.location.href = '/api/v1/auth/google';
  };

  const logout = () => {
    localStorage.removeItem('welfare_token');
    localStorage.removeItem('welfare_user');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await profileAPI.getProfile();
      setProfile(res.data.data);
      return res.data.data;
    } catch (err) {
      console.error('Failed to refresh profile:', err.message);
      return null;
    }
  };

  const value = {
    user,
    token,
    profile,
    loading,
    isAuthenticated: Boolean(token && user),
    isAdmin: Boolean(user && user.role === 'admin'),
    login,
    register,
    logout,
    refreshProfile,
    handleAuthToken,
    loginWithGoogleCredential,
    initiateGoogleSignIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
