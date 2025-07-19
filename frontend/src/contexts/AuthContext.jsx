import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true); // NEW: loading user profile on mount
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      // Fetch current user profile to get updated admin status
      fetchCurrentUser();
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setLoadingUser(false); // No token, not loading user
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    setLoadingUser(true);
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch current user:', err);
      // If token is invalid, clear it
      if (err.response?.status === 401) {
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoadingUser(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true); setError(null);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      setLoading(false);
      return false;
    }
  };

  const register = async (data) => {
    setLoading(true); setError(null);
    try {
      await api.post('/api/auth/register', data);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  // Token is now handled by the axios interceptor in api/axios.js

  return (
    <AuthContext.Provider value={{ user, token, loading, loadingUser, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 