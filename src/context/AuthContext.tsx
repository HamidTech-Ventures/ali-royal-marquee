import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if we have an access token in memory or if we can refresh
    const initAuth = async () => {
      try {
        // Attempt to restore session by refreshing token
        const refreshResponse = await api.post('/auth/refresh');
        if (refreshResponse.data && refreshResponse.data.accessToken) {
          // Access token will be automatically set by the api.ts interceptor/logic
          // but we can ensure it's set if the interceptor only handles 401 retries
          // Actually, our api.ts processQueue logic sets it on 401 retry, 
          // we need to make sure we explicitly set it here for the initial load
          const { setAccessToken } = await import('../services/api');
          setAccessToken(refreshResponse.data.accessToken);

          // Now fetch user details
          const response = await api.get('/auth/me');
          if (response.data) {
            setCurrentUser({
              id: response.data.id,
              fullName: response.data.fullName,
              email: response.data.email,
              role: response.data.role
            });
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (error) {
        // Refresh failed (no valid cookie) or network error
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    const handleAuthLogout = () => {
      setIsAuthenticated(false);
      setCurrentUser(null);
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  const login = async (accessToken: string, user: User) => {
    const { setAccessToken } = await import('../services/api');
    setAccessToken(accessToken);
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      const { setAccessToken } = await import('../services/api');
      setAccessToken(null);
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
