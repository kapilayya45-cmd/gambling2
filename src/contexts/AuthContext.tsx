// src/contexts/AuthContext.tsx
'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, updateDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { safeGetDoc } from '@/services/firestoreHelpers';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  coinBalance: number;
  realBalance: number;
  signup: (email: string, password: string, displayName?: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [coinBalance, setCoinBalance] = useState(0);
  const [realBalance, setRealBalance] = useState(0);

  const signup = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<User> => {
    if (!auth) throw new Error('Authentication service unavailable');

    try {
      // 1) Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2) Create Firestore user document with robust error handling
      try {
        // Check if user document already exists
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await safeGetDoc(userDocRef);
        
        if (!userDoc.exists()) {
          // Only create if document doesn't exist
          await setDoc(userDocRef, {
            coinBalance: 0,
            realBalance: 0,
            role: 'user',
            displayName: displayName || '',
            email: email,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            metadata: {
              registrationMethod: 'email',
              lastUpdated: new Date().toISOString()
            }
          });
          console.log(`User document created for ${user.uid}`);
        } else {
          // Update last login if user document already exists
          await updateDoc(userDocRef, {
            lastLogin: new Date().toISOString(),
            'metadata.lastUpdated': new Date().toISOString()
          });
          console.log(`User document already exists for ${user.uid}, updated login time`);
        }
      } catch (firestoreError) {
        console.error('Error creating user document:', firestoreError);
        // Consider if you want to delete the auth user if Firestore creation fails
        // await user.delete();
        // throw new Error('Failed to create user profile. Please try again.');
      }

      // 3) Optionally update displayName in Auth
      if (displayName) {
        try {
          await updateProfile(user, { displayName });
        } catch (profileError) {
          console.error('Error updating profile:', profileError);
          // Non-critical error, continue without failing
        }
      }

      return user;
    } catch (error: any) {
      // For development with our mock implementation, we'll handle the error here
      if (error.code === 'auth/email-already-in-use' || error.message?.includes('email-already-in-use')) {
        console.warn('Email already in use - in development mode, simulating login instead');
        
        // In development mode with mock Firebase, simulate a successful login
        if (process.env.NODE_ENV !== 'production') {
          return {
            uid: `dev-user-${Date.now()}`,
            email,
            displayName: displayName || 'Development User',
            emailVerified: true,
            // Add other required User properties with mock values
            getIdToken: () => Promise.resolve('mock-token'),
            // Add other required methods
          } as unknown as User;
        }
      }
      
      // Re-throw the error for production or other errors
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    if (!auth) throw new Error('Authentication service unavailable');
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  };

  const logout = async (): Promise<void> => {
    if (!auth) throw new Error('Authentication service unavailable');
    await signOut(auth);
  };

  const resetPassword = async (email: string): Promise<void> => {
    if (!auth) throw new Error('Authentication service unavailable');
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (
    displayName: string
  ): Promise<void> => {
    if (!currentUser) throw new Error('No user logged in');
    await updateProfile(currentUser, { displayName });
  };

  useEffect(() => {
    let unsubWallet: Unsubscribe | null = null;

    const unsubAuth = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);

      // if a user is signed in, hook their wallet doc
      if (user) {
        const walletRef = doc(db, 'users', user.uid);
        unsubWallet = onSnapshot(walletRef, snap => {
          if (snap.exists()) {
            const data = snap.data();
            setCoinBalance(data.coinBalance ?? 0);
            setRealBalance(data.realBalance ?? 0);
          } else {
            // if no wallet doc yet, you might want to create it here
            setCoinBalance(0);
            setRealBalance(0);
          }
        });
      } else {
        // no user → clear balances
        setCoinBalance(0);
        setRealBalance(0);
      }
    });

    return () => {
      unsubAuth();
      if (unsubWallet) unsubWallet();
    };
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    coinBalance,
    realBalance,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
