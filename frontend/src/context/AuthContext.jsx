import { createContext, useContext, useState, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

const STORAGE_TOKEN = 'mindspace_token';
const STORAGE_USER = 'mindspace_user';

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const persist = (userObj, tokenStr) => {
    localStorage.setItem(STORAGE_TOKEN, tokenStr);
    localStorage.setItem(STORAGE_USER, JSON.stringify(userObj));
    setUser(userObj);
    setToken(tokenStr);
  };

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login({ email, password });
      persist(data.user, data.token);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async ({ name, email, password, role }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register({ name, email, password, role });
      persist(data.user, data.token);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not create your account. That email may already be registered.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
    setUser(null);
    setToken(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
