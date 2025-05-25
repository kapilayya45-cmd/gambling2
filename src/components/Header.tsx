import React, { useState } from 'react';
import Button from './Button';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import Balance from './Balance';
import LoginModal from './LoginModal';
import RegistrationModal from './RegistrationModal';
import UserProfile from './UserProfile';
import Link from 'next/link';
import Logo from './Logo';
import CoinBalance from './CoinBalance';

const Header = () => {
  const { currentUser } = useAuth();
  const { isAdmin } = useAdmin();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <header className="bg-[#1a1f2c] px-4 py-3 flex justify-between items-center shadow-lg border-b border-[#2a3040]">
      {/* Left section with logo/title */}
      <div className="flex items-center">
        <div className="flex flex-shrink-0 items-center">
          <Logo className="w-14 h-14 relative" />
          <h1 className="ml-2 text-xl font-bold text-white tracking-tight">Foxxy</h1>
        </div>
      </div>
      
      {/* Right section with balance and actions */}
      <div className="flex items-center space-x-3">
        {/* Coin Balance display */}
        {currentUser && (
          <CoinBalance className="hidden sm:flex mr-2" />
        )}
        
        {/* Balance display */}
        {currentUser && (
          <Balance className="mr-3" />
        )}
        
        {/* Action buttons */}
        {currentUser ? (
          <div className="flex items-center">
            <button 
              className="flex items-center space-x-2 bg-[#2a3040] hover:bg-[#343b4f] rounded-full px-3 py-1.5 transition-colors"
              onClick={() => setIsProfileModalOpen(true)}
            >
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {currentUser.displayName 
                  ? currentUser.displayName.charAt(0).toUpperCase() 
                  : currentUser.email?.charAt(0).toUpperCase()}
              </div>
              <span className="text-white font-medium hidden md:block">
                {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
              </span>
              {isAdmin && (
                <span className="ml-1 text-xs bg-green-800 text-green-300 px-1.5 py-0.5 rounded-full hidden md:inline-block">
                  Admin
                </span>
              )}
            </button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Button 
              className="bg-transparent border border-[#2a3040] hover:bg-[#2a3040] text-sm font-medium px-3 py-1.5"
              onClick={() => setIsLoginModalOpen(true)}
            >
              Login
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-sm font-medium px-3 py-1.5 hidden sm:block"
              onClick={() => setIsSignupModalOpen(true)}
            >
              Sign Up
            </Button>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onSwitchToSignup={() => {
          setIsLoginModalOpen(false);
          setIsSignupModalOpen(true);
        }} 
      />
      
      <RegistrationModal 
        isOpen={isSignupModalOpen} 
        onClose={() => setIsSignupModalOpen(false)} 
        onSwitchToLogin={() => {
          setIsSignupModalOpen(false);
          setIsLoginModalOpen(true);
        }} 
      />
      
      <UserProfile 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </header>
  );
};

export default Header; 