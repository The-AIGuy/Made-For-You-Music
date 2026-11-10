/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Notification } from '../types.js';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '../lib/api.js';
import { googleSignIn, googleLogout, initAuth, authorizeGmailSender, getGmailAccessToken } from '../lib/firebase.js';
import type { User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
  // Optional Gmail Sender integration
  googleUser: FirebaseUser | null;
  isGmailConnected: boolean;
  connectGmail: () => Promise<string>;
  disconnectGmail: () => Promise<void>;
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
  const [isGmailConnected, setIsGmailConnected] = useState<boolean>(false);
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

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (fUser) => {
        setGoogleUser(fUser);
      },
      () => {
        setGoogleUser(null);
        setIsGmailConnected(false);
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

  /**
   * Standard Google Sign-In: Requests only openid, email, and profile.
   * Authenticates the user in Firebase, then creates/loads their customer account.
   */
  const signInWithGoogle = async () => {
    const fUser = await googleSignIn();
    if (!fUser || !fUser.email) {
      throw new Error('Google Sign-In did not return a verified email.');
    }

    const res = await api.googleAuth({
      email: fUser.email,
      name: fUser.displayName || undefined,
      googleUid: fUser.uid,
    });

    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
    setGoogleUser(fUser);
    await fetchNotifications();
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    await googleLogout();
    removeStoredToken();
    setToken(null);
    setUser(null);
    setGoogleUser(null);
    setIsGmailConnected(false);
    setNotifications([]);
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  /**
   * Optional Gmail integration: Specifically prompts for gmail.send scope.
   */
  const connectGmail = async (): Promise<string> => {
    const result = await authorizeGmailSender();
    if (result && result.accessToken) {
      setGoogleUser(result.user);
      setIsGmailConnected(true);
      return result.accessToken;
    }
    throw new Error('Gmail authorization was not granted.');
  };

  const disconnectGmail = async () => {
    setIsGmailConnected(false);
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
        signInWithGoogle,
        logout,
        updateUser,
        googleUser,
        isGmailConnected,
        connectGmail,
        disconnectGmail,
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
