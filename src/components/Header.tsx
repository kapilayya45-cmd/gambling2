// src/components/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Button from './Button';
import Balance from './Balance';
import CoinBalance from './CoinBalance';
import LoginModal from './LoginModal';
import RegistrationModal from './RegistrationModal';
import UserProfile from './UserProfile';
import Logo from './Logo';
import Link from 'next/link';
import { Plus } from 'lucide-react';

interface HeaderProps {
  onAdd?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAdd }) => {
  const { 
    currentUser, 
    isAdmin, 
    isSuperadmin, 
    coinBalance 
  } = useAuth();

  const [isLoginModalOpen, setIsLoginModalOpen]     = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen]   = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Debug
  useEffect(() => {
    if (currentUser) {
      console.log('User:', currentUser.email);
      console.log('isAdmin:', isAdmin, 'isSuperadmin:', isSuperadmin);
      console.log('coinBalance:', coinBalance);
    }
  }, [currentUser, isAdmin, isSuperadmin, coinBalance]);

  return (
    <header className="bg-white px-4 py-3 flex justify-between items-center shadow-lg border-b border-gray-200">
      {/* ───── Left ───── */}
      <div className="flex items-center space-x-4">
        <Logo className="w-14 h-14 relative" />
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Foxxy</h1>

        <nav className="hidden md:flex items-center space-x-6">
          { /* Show Admin link to both admins and superadmins */ }
          {(isAdmin || isSuperadmin) && (
            <Link href="/admin" className="text-gray-800 uppercase tracking-wide hover:text-gray-600">
              Admin
            </Link>
          )}

          { /* Superadmin gets an extra link */ }
          {isSuperadmin && (
            <Link href="/superadmin" className="flex items-center text-purple-600 uppercase tracking-wide hover:text-purple-800">
              <Plus className="w-4 h-4 mr-1" /> Superadmin
            </Link>
          )}
        </nav>
      </div>

      {/* ───── Right ───── */}
      <div className="flex items-center space-x-3">
        {currentUser && (
          <>
            { /* Regular users and admins alike see their coin & cash balances */ }
            <CoinBalance className="hidden sm:flex mr-2" />
            <Balance     className="mr-3" />
          </>
        )}

        {currentUser ? (
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1.5 transition-colors"
          >
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {currentUser.displayName
                ? currentUser.displayName.charAt(0).toUpperCase()
                : currentUser.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-gray-800 hidden md:inline">
              {currentUser.displayName || currentUser.email?.split('@')[0]}
            </span>
            {isAdmin && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded-full hidden md:inline">
                Admin
              </span>
            )}
            {isSuperadmin && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full hidden md:inline">
                Superadmin
              </span>
            )}
          </button>
        ) : (
          <div className="flex space-x-2">
            <Button
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-4 py-2 font-medium border border-gray-300 shadow-sm"
              onClick={() => setIsLoginModalOpen(true)}
            >
              Login
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 font-medium shadow-sm"
              onClick={() => setIsSignupModalOpen(true)}
            >
              Sign Up
            </Button>
          </div>
        )}
      </div>

      { /* ───── Modals ───── */ }
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
