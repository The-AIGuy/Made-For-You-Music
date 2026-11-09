/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Notification } from '../types.js';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '../lib/api.js';
import { googleSignIn, googleLogout, initAuth } from '../lib/firebase.js';
import type { User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
  // Google Workspace / Gmail connection
  googleUser: FirebaseUser | null;
  googleToken: string | null;
  isGoogleConnected: boolean;
  connectGoogle: () => Promise<string>;
  disconnectGoogle: () => Promise<void>;
  // In-app notifications
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load current app user profile
  const loadUser = useCallback(async () => {
    const stored = getStoredToken();
    if (!stored) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch {
      removeStoredToken();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch in-app notifications
  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      return;
    }
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
    } catch {
      // ignore
    }
  }, [token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000); // 20s poll
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  // Listen to Firebase Google Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (fUser, aToken) => {
        setGoogleUser(fUser);
        setGoogleToken(aToken);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
    await fetchNotifications();
  };

  const register = async (payload: { name: string; email: string; password: string; phone?: string }) => {
    const res = await api.register(payload);
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
    await fetchNotifications();
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    removeStoredToken();
    setToken(null);
    setUser(null);
    setNotifications([]);
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  const connectGoogle = async (): Promise<string> => {
    const result = await googleSignIn();
    if (result) {
      setGoogleUser(result.user);
      setGoogleToken(result.accessToken);
      return result.accessToken;
    }
    throw new Error('Google sign-in did not complete.');
  };

  const disconnectGoogle = async () => {
    await googleLogout();
    setGoogleUser(null);
    setGoogleToken(null);
  };

  const markAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      // ignore
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        googleUser,
        googleToken,
        isGoogleConnected: Boolean(googleToken),
        connectGoogle,
        disconnectGoogle,
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
