/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

// Standard Google Sign-In Provider: Base identity provider without requesting external scopes
// Firebase Auth GoogleAuthProvider defaults to 'profile' and 'email' automatically.
const standardGoogleProvider = new GoogleAuthProvider();
standardGoogleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Separate Gmail Sender Provider: Explicit, optional integration only
export const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
const gmailProvider = new GoogleAuthProvider();
gmailProvider.addScope(GMAIL_SCOPE);

let isSigningIn = false;
let cachedGmailToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: FirebaseUser) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user);
    } else {
      cachedGmailToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Standard customer login with Google: Minimum scopes (openid, email, profile).
 * Completely safe for all general users without unverified app restriction.
 */
export const googleSignIn = async (): Promise<FirebaseUser | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, standardGoogleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Standard Google Sign-In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Optional Gmail authorization: Separate explicit authorization strictly for sending emails.
 */
export const authorizeGmailSender = async (): Promise<{ user: FirebaseUser; accessToken: string }> => {
  try {
    const result = await signInWithPopup(auth, gmailProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Gmail access token');
    }
    cachedGmailToken = credential.accessToken;
    return { user: result.user, accessToken: credential.accessToken };
  } catch (error: any) {
    console.error('Gmail Authorization error:', error);
    throw error;
  }
};

export const getGmailAccessToken = async (): Promise<string | null> => {
  return cachedGmailToken;
};

export const googleLogout = async () => {
  await auth.signOut();
  cachedGmailToken = null;
};
