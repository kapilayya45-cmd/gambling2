import React, { useState } from 'react';
import Button from './Button';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

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
      await login(email, password);
      onClose();
      // Redirect to home page
      router.push('/home');
    } catch (error: any) {
      setError(error.code === 'auth/invalid-credential' 
        ? 'Invalid email or password'
        : error.message || 'Failed to log in');
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
        <h2 className="text-2xl font-bold text-white mb-6">Log In to Your Account</h2>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 text-red-200 p-3 rounded mb-4 text-sm">
            {error}
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
              placeholder="Enter your password"
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded bg-white"
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
            className="w-full py-3 mt-6 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md"
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
              className="text-purple-400 hover:text-purple-300 focus:outline-none"
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