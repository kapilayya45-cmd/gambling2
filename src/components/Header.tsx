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
import { Plus, Menu, X } from 'lucide-react';

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

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Debug
  useEffect(() => {
    if (currentUser) {
      console.log('User:', currentUser.email);
      console.log('isAdmin:', isAdmin, 'isSuperadmin:', isSuperadmin);
      console.log('coinBalance:', coinBalance);
    }
  }, [currentUser, isAdmin, isSuperadmin, coinBalance]);

  return (
    <>
      <header className="bg-white px-4 py-3 flex justify-between items-center shadow-lg border-b border-gray-200 relative z-50">
        {/* ───── Left ───── */}
        <div className="flex items-center space-x-4">
          <Logo className="w-10 h-10 md:w-14 md:h-14 relative" />
          <h1 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight">Foxxy</h1>

          <nav className="hidden md:flex items-center space-x-6">
            {(isAdmin || isSuperadmin) && (
              <Link href="/admin" className="text-gray-800 uppercase tracking-wide hover:text-gray-600">
                Admin
              </Link>
            )}

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
              <CoinBalance className="hidden sm:flex mr-2" />
              <Balance className="hidden xs:flex mr-3" />
            </>
          )}

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-3">
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
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      
      <div
        className={`fixed right-0 top-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4">
          {currentUser ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {currentUser.displayName
                    ? currentUser.displayName.charAt(0).toUpperCase()
                    : currentUser.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </div>
                  <div className="text-sm text-gray-500">{currentUser.email}</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <CoinBalance />
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <Balance />
              </div>

              {(isAdmin || isSuperadmin) && (
                <Link
                  href="/admin"
                  className="block w-full p-3 text-left text-gray-800 hover:bg-gray-100 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}

              {isSuperadmin && (
                <Link
                  href="/superadmin"
                  className="block w-full p-3 text-left text-purple-600 hover:bg-purple-50 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Superadmin Dashboard
                </Link>
              )}

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="block w-full p-3 text-left text-gray-800 hover:bg-gray-100 rounded-lg"
              >
                Profile Settings
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-4 py-2 font-medium border border-gray-300 shadow-sm"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLoginModalOpen(true);
                }}
              >
                Login
              </Button>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 font-medium shadow-sm"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSignupModalOpen(true);
                }}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ───── Modals ───── */}
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
    </>
  );
};

export default Header;
