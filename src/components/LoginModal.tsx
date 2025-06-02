import React, { useState } from 'react';
import Button from './Button';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose,
  onSwitchToSignup
}) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const { login } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password) {
      return setError('Please fill in all fields');
    }

    try {
      setError('');
      setLoading(true);
      setStatusMessage('Logging in...');
      
      // For superadmin-like emails, first try with Firebase Auth
      if (email.includes('admin') || email.includes('super')) {
        try {
          // Try direct Firebase Auth first
          const auth = getAuth();
          await signInWithEmailAndPassword(auth, email, password);
          
          // Successful login
          onClose();
          
          // Check if this is a superadmin
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('email', '==', email));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            if (userData.role === 'superadmin') {
              router.push('/superadmin/dashboard');
            } else if (userData.role === 'admin') {
              router.push('/admin/dashboard');
            } else {
              router.push('/home');
            }
          } else {
            router.push('/home');
          }
          
          return;
        } catch (authError) {
          // For admin logins, continue with standard login
          console.error('Admin login with direct auth failed:', authError);
        }
      }
      
      // Standard login flow with context
      await login(email, password);
      onClose();
      router.push('/home');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.code === 'auth/invalid-credential' 
        ? 'Invalid email or password'
        : error.code === 'auth/network-request-failed'
        ? 'Network error. Please check your connection and try again.'
        : error.message || 'Failed to log in');
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative bg-[#1a1f2c] w-full max-w-md rounded-lg shadow-2xl p-8 z-10 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Log In to Your Account</h2>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 text-red-200 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        {statusMessage && !error && (
          <div className="bg-blue-500 bg-opacity-20 text-blue-200 p-3 rounded mb-4 text-sm">
            {statusMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-300 text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#2a2f3c] text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-gray-300 text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#2a2f3c] text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-[#2a2f3c]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <a href="#" className="text-purple-400 hover:text-purple-300">
                Forgot your password?
              </a>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full py-3 mt-6 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-all duration-200 transform hover:scale-[1.02]"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <button 
              type="button"
              onClick={onSwitchToSignup}
              className="text-purple-400 hover:text-purple-300 focus:outline-none font-medium"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal; 