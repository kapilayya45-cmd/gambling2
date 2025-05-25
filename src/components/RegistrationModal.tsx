import React, { useState, useEffect } from 'react';
import Button from './Button';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ 
  isOpen, 
  onClose,
  onSwitchToLogin
}) => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [redirectToLogin, setRedirectToLogin] = useState(false);
  
  const { signup } = useAuth();

  // Effect to handle automatic redirect to login after email-already-exists error
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (redirectToLogin) {
      timer = setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [redirectToLogin, onSwitchToLogin]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return setError('Please fill in all fields');
    }
    
    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password, username);
      setSignupSuccess(true);
      setTimeout(() => {
        onClose();
        // Redirect to home page
        router.push('/home');
      }, 1500);
    } catch (error: any) {
      console.log('Registration error:', error);
      
      // Check for email already in use error
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please log in instead.');
        setRedirectToLogin(true);
      } else if (error.code === 'auth/invalid-email') {
        setError('The email address is not valid. Please enter a valid email.');
      } else if (error.code === 'auth/weak-password') {
        setError('The password is too weak. Please choose a stronger password.');
      } else {
        // For other errors, display the message or a generic error
        setError(error.message || 'Failed to create an account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-800 bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative bg-[#1a1f2c] w-full max-w-md rounded-lg shadow-xl p-8 z-10">
        <h2 className="text-2xl font-bold text-white mb-6">Create Your Account</h2>
        
        {error && (
          <div className={`${redirectToLogin ? 'bg-blue-500' : 'bg-red-500'} bg-opacity-20 ${redirectToLogin ? 'text-blue-200' : 'text-red-200'} p-3 rounded mb-4 text-sm`}>
            {error}
            {redirectToLogin && <div className="mt-1">Redirecting to login...</div>}
          </div>
        )}

        {signupSuccess && (
          <div className="bg-green-500 bg-opacity-20 text-green-200 p-3 rounded mb-4 text-sm">
            Account created successfully! Redirecting to home page...
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-gray-300 text-sm font-medium mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-gray-300 text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (redirectToLogin) setRedirectToLogin(false);
              }}
              className="w-full px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Create a password (min. 6 characters)"
              required
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-300 text-sm font-medium mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Confirm your password"
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full py-3 mt-6 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md"
            disabled={loading || signupSuccess || redirectToLogin}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <button 
              type="button"
              onClick={onSwitchToLogin}
              className="text-purple-400 hover:text-purple-300 focus:outline-none"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationModal; 