// src/contexts/AuthContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  getIdToken
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, Unsubscribe, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperadmin: boolean;
  coinBalance: number;
  realBalance: number;
  signup: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [coinBalance, setCoinBalance] = useState(0);
  const [realBalance, setRealBalance] = useState(0);

  const signup = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<User> => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const userRef = doc(db, 'users', user.uid);
    const now = new Date().toISOString();
    await setDoc(
      userRef,
      {
        email,
        displayName: displayName || '',
        role: 'user',
        coinBalance: 0,
        realBalance: 0,
        createdAt: now,
        lastLogin: now
      },
      { merge: true }
    );
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    return user;
  };

  const login = async (email: string, password: string) => {
    try {
      // Try to sign in normally
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Force an immediate token refresh to ensure we have a fresh token
      // This is critical for permissions to work correctly
      try {
        console.log('Refreshing authentication token after login...');
        // Wait 500ms before refreshing token - this allows Firebase Auth state to stabilize
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Force token refresh with retries
        let refreshSuccess = false;
        for (let i = 0; i < 3; i++) {
          try {
            await getIdToken(result.user, true);
            refreshSuccess = true;
            console.log('Token refreshed successfully after login');
            break;
          } catch (err) {
            console.warn(`Token refresh attempt ${i+1} failed:`, err);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
          }
        }
        
        if (!refreshSuccess) {
          console.warn('All token refresh attempts failed. Some permissions may not work correctly.');
        }
      } catch (refreshError) {
        console.warn('Could not refresh token after login:', refreshError);
        // Continue despite token refresh errors - the fallback mechanisms will handle this
      }
      
      // Update last login time
      try {
        const userRef = doc(db, 'users', result.user.uid);
        await setDoc(userRef, { lastLogin: new Date().toISOString() }, { merge: true });
      } catch (updateError) {
        console.warn('Could not update last login time:', updateError);
      }
      
      return result.user;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // If we get an invalid-credential error, we'll try to clean up the auth state
      if (error.code === 'auth/invalid-credential') {
        console.log('Invalid credential error detected, attempting cleanup...');
        try {
          // Sign out to clear any corrupted auth state
          await signOut(auth);
          // Wait a moment before rethrowing
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (cleanupError) {
          console.warn('Error during auth cleanup:', cleanupError);
        }
      }
      
      throw error;
    }
  };

  const logout = () => signOut(auth);
  const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);
  const updateUserProfile = (displayName: string) => {
    if (!currentUser) throw new Error('No user is signed in');
    return updateProfile(currentUser, { displayName });
  };

  useEffect(() => {
    let unsubWallet: Unsubscribe | null = null;

    const unsubAuth = onAuthStateChanged(auth, async user => {
      setCurrentUser(user);
      setLoading(false);

      if (!user) {
        setIsAdmin(false);
        setIsSuperadmin(false);
        setCoinBalance(0);
        setRealBalance(0);
        return;
      }

      // Force an immediate token refresh when user is detected
      try {
        console.log('Refreshing token after auth state change...');
        await getIdToken(user, true);
        console.log('Token refreshed successfully');
      } catch (refreshError) {
        console.warn('Could not refresh token:', refreshError);
        // Continue despite refresh errors
      }

      // fetch role once
      try {
        // Get the user document reference
        const userRef = doc(db, 'users', user.uid);
        
        // Try to get the document, and handle cache errors
        let snap;
        try {
          snap = await getDoc(userRef);
        } catch (error: any) {
          // If we got a cache error, we might need to create the document
          if (error.message && error.message.includes('Failed to get document from cache')) {
            console.log('User document not in cache, creating it');
            await setDoc(userRef, {
              email: user.email,
              displayName: user.displayName || '',
              role: 'user', 
              coinBalance: 0,
              realBalance: 0,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString()
            });
            snap = await getDoc(userRef);
          } else {
            throw error; // Re-throw if it's not a cache error
          }
        }
        
        const userData = snap.data();
        const role = userData?.role || 'user';
        setIsAdmin(role === 'admin' || role === 'superadmin');
        setIsSuperadmin(role === 'superadmin');
      } catch (error) {
        console.error('Error fetching user role:', error);
        setIsAdmin(false);
        setIsSuperadmin(false);
      }

      // subscribe to live balances
      const walletRef = doc(db, 'users', user.uid);
      try {
        unsubWallet = onSnapshot(
          walletRef, 
          snap => {
            const d = snap.data() || {};
            setCoinBalance(d.coinBalance ?? 0);
            setRealBalance(d.realBalance ?? 0);
          },
          error => {
            console.error('Error in wallet snapshot:', error);
          }
        );
      } catch (error) {
        console.error('Failed to subscribe to wallet updates:', error);
      }
    });

    return () => {
      unsubAuth();
      if (unsubWallet) unsubWallet();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
      currentUser,
      loading,
      isAdmin,
      isSuperadmin,
      coinBalance,
      realBalance,
      signup,
      login,
      logout,
      resetPassword,
      updateUserProfile
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}
