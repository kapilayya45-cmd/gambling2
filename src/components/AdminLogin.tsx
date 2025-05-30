// src/components/AdminLogin.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import Button from './Button';

const AdminLogin: React.FC = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string>();
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  // Enable dev mode admin access
  useEffect(() => {
    // Only in development mode, add a way to enable admin access
    if (process.env.NODE_ENV === 'development') {
      // Add event listener for a special key combination (Ctrl+Shift+A)
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
          console.log('Development admin mode activated');
          localStorage.setItem('devAdminOverride', 'true');
          sessionStorage.setItem('demoAdminLogin', 'true');
          router.push('/admin');
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [router]);

  // Check for development override
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (localStorage.getItem('devAdminOverride') === 'true') {
        console.log('Development admin override is active');
      }
    }
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      console.log(`Attempting to sign in with email: ${email}`);
      
      // Check network connectivity first
      if (!navigator.onLine) {
        setError('You appear to be offline. Please check your internet connection.');
        setLoading(false);
        return;
      }
      
      // Try auth with error handling
      let user;
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        user = result.user;
        console.log('Authentication successful, user:', user.uid);
      } catch (authError: any) {
        console.error('Authentication error:', authError);
        
        // Handle network errors specifically
        if (authError.code === 'auth/network-request-failed') {
          setError('Network error. This could be due to:' +
                  '\n1. No internet connection' +
                  '\n2. Firebase servers unreachable' + 
                  '\n3. Emulator not running (in development)');
          
          // In development, provide additional info for emulator issues
          if (process.env.NODE_ENV === 'development') {
            console.error('Development mode: If using emulators, make sure they are running:');
            console.error('Run: firebase emulators:start');
            
            // Allow dev bypass
            if (email === 'admin@example.com' && password === 'adminpass') {
              console.log('DEV MODE: Bypassing authentication for admin@example.com');
              sessionStorage.setItem('demoAdminLogin', 'true');
              router.push('/admin');
              return;
            }
          }
          
          setLoading(false);
          return;
        }
        
        throw authError; // Re-throw for the outer catch block
      }

      try {
        // Verify admin role in Firestore 'users' collection
        const adminRef = doc(db, 'users', user.uid);
        const adminSnap = await getDoc(adminRef);
        console.log('Firestore doc path:', `users/${user.uid}`);
        console.log('Document exists?', adminSnap.exists());
        console.log('Document data:', adminSnap.data());
        
        if (!adminSnap.exists() || adminSnap.data().role !== 'admin') {
          await signOut(auth);
          setError('Access denied. You are not an administrator.');
          return;
        }
      } catch (firestoreError) {
        console.error('Firestore permission error:', firestoreError);
        
        // DEVELOPMENT MODE ONLY - Allow specific test emails for development
        if (process.env.NODE_ENV !== 'production' && email === 'admin@example.com') {
          console.log('DEVELOPMENT MODE: Bypassing Firestore permission check for admin@example.com');
          // Set session storage flag for development admin
          sessionStorage.setItem('demoAdminLogin', 'true');
          router.push('/admin');
          return;
        }
        
        await signOut(auth);
        setError('Database permission error. Contact the administrator.');
        return;
      }

      router.push('/admin');
    } catch (err: any) {
      console.error('Firebase login error:', err);
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Invalid email format.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled.');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed login attempts. Please try again later.');
          break;
        case 'auth/network-request-failed':
          setError('Network connection error. Please check your internet connection and try again.');
          break;
        default:
          setError(`Login failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // DEVELOPMENT ONLY - Helper function to enable admin mode
  const enableDevAdminMode = () => {
    if (process.env.NODE_ENV === 'development') {
      localStorage.setItem('devAdminOverride', 'true');
      sessionStorage.setItem('demoAdminLogin', 'true');
      router.push('/admin');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#1a1f2c] p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white text-center mb-6">Admin Login</h2>
      {error && (
        <div className="bg-red-600 bg-opacity-20 text-red-400 p-3 rounded mb-4 text-sm whitespace-pre-line">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <label className="block text-gray-300 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 bg-gray-800 border border-[#3a4050] rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="admin@example.com"
        />

        <label className="block text-gray-300 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-6 px-3 py-2 bg-gray-800 border border-[#3a4050] rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="••••••••"
        />

        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>

      {/* Development shortcut */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 text-center">
          <button 
            onClick={enableDevAdminMode}
            className="text-sm text-gray-500 hover:text-gray-300"
          >
            DEV MODE: Enable Admin Access
          </button>
          <p className="text-xs text-gray-600 mt-1">
            (Or press Ctrl+Shift+A)
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
