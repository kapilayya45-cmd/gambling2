// src/components/SignupModal.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { AuthError, AuthErrorCodes } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { checkOnlineStatus } from '@/firebase/config';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}: SignupModalProps) {
  const { signup } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);
  const [emailInUse, setEmailInUse] = useState(false);
  const [isOnline, setIsOnline]   = useState(true);

  // Ref for the email input to focus on errors
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Effect to update online status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(checkOnlineStatus());
    };

    // Check initial status
    updateOnlineStatus();

    // Listen for changes
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Cleanup
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // When emailInUse becomes true, focus the email field
  useEffect(() => {
    if (emailInUse) {
      emailInputRef.current?.focus();
    }
  }, [emailInUse]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailInUse(false);
    setLoading(true);

    // Check for internet connection
    if (!isOnline) {
      setError('You appear to be offline. Please check your internet connection and try again.');
      setLoading(false);
      return;
    }

    try {
      // Proceed with signup
      await signup(email, password, displayName);
      
      // If successful, close the modal
      setError(null);
      onClose();
    } catch (err: unknown) {
      const authErr = err as AuthError;
      console.log('Signup error:', authErr);
      
      // Development mode handling - check for specific message patterns
      if (typeof authErr.code === 'string') {
        // Check for email already in use - handle both enum and string error codes
        if (authErr.code === AuthErrorCodes.EMAIL_EXISTS || 
            authErr.code === 'auth/email-already-in-use') {
          setEmailInUse(true);
          setError('This email address is already registered. Please log in instead.');
        } else if (authErr.code === AuthErrorCodes.WEAK_PASSWORD || 
                  authErr.code === 'auth/weak-password') {
          setError('Password is too weak. Please use at least 6 characters.');
        } else if (authErr.code === AuthErrorCodes.INVALID_EMAIL || 
                  authErr.code === 'auth/invalid-email') {
          setError('Invalid email address. Please enter a valid email.');
        } else if (authErr.code === 'auth/network-request-failed' ||
                  (authErr.message && authErr.message.includes('offline'))) {
          setError('Unable to connect to the server. Please check your internet connection and try again.');
        } else {
          // Handle other Firebase Auth errors
          setError(`Registration error: ${authErr.message || 'Unknown error'}`);
        }
      } else if (authErr.message) {
        // Handle non-standard errors
        if (authErr.message.includes('email-already-in-use')) {
          setEmailInUse(true);
          setError('This email address is already registered. Please log in instead.');
        } else if (authErr.message.includes('offline') || authErr.message.includes('network')) {
          setError('Unable to connect to the server. Please check your internet connection and try again.');
        } else {
          setError(`Error: ${authErr.message}`);
        }
      } else {
        // Generic error handling
        setError('Failed to register. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    setError(null);
    setEmailInUse(false);
    onClose();
    onSwitchToLogin();
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailInUse) {
      setEmailInUse(false);
      setError(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg w-80 text-gray-900"
      >
        <h2 className="text-xl font-bold mb-4">Sign Up</h2>

        {!isOnline && (
          <div className="bg-yellow-100 border-yellow-400 text-yellow-700 px-4 py-3 border rounded mb-4 text-sm">
            ⚠️ You are currently offline. Some features may not work properly.
          </div>
        )}

        {/* Error alert with "Go to Login" when email is in use */}
        {error && (
          <div
            className={`${
              emailInUse
                ? 'bg-blue-100 border-blue-400 text-blue-700'
                : error.includes('offline') || error.includes('internet')
                ? 'bg-yellow-100 border-yellow-400 text-yellow-700'
                : 'bg-red-100 border-red-400 text-red-700'
            } px-4 py-3 border rounded mb-4 text-sm`}
          >
            {error}
            {emailInUse && (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={handleSwitchToLogin}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                >
                  Go to Login
                </button>
              </div>
            )}
          </div>
        )}

        {/* Display Name */}
        <input
          id="display-name-input"
          type="text"
          placeholder="Display Name"
          className="w-full mb-3 px-3 py-2 border rounded placeholder-gray-500"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          required
        />

        {/* Email (with ref for focusing on error) */}
        <input
          id="email-input"
          ref={emailInputRef}
          type="email"
          placeholder="Email"
          className="w-full mb-3 px-3 py-2 border rounded placeholder-gray-500"
          value={email}
          onChange={handleEmailChange}
          required
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-3 py-2 border rounded placeholder-gray-500"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading || emailInUse || !isOnline}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        {/* Switch to Login */}
        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <button
            type="button"
            className="text-blue-600 underline"
            onClick={handleSwitchToLogin}
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
}
