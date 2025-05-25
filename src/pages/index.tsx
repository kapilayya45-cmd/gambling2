import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Logo from '@/components/Logo';
import RegistrationModal from '@/components/RegistrationModal';
import LoginModal from '@/components/LoginModal';

export default function Home() {
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openRegistrationModal = () => {
    setIsRegistrationModalOpen(true);
  };

  const closeRegistrationModal = () => {
    setIsRegistrationModalOpen(false);
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsRegistrationModalOpen(false);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const switchToRegistration = () => {
    setIsLoginModalOpen(false);
    setIsRegistrationModalOpen(true);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <Head>
        <title>Foxxy – Live Bets, Big Wins</title>
        <meta
          name="description"
          content="Where Every Play Counts—from edge-of-your-seat matchups to high-stakes casino tables, dive into nonstop action and unbeatable odds."
        />
      </Head>

      {/* Background */}
      <div className="absolute inset-0 z-0 bg-home-bg bg-cover bg-center brightness-40" />

      {/* Page Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="flex justify-between items-center px-8 py-6">
          <div className="flex-shrink-0">
            <Logo className="w-32 h-28" />
          </div>

          <nav className="flex items-center space-x-8">
            <Link
              href="/home"
              className="text-white text-lg uppercase tracking-wider font-medium border-b-2 border-white px-1 py-1"
            >
              HOME
            </Link>
            <button
              onClick={openLoginModal}
              className="text-white text-lg uppercase tracking-wider font-medium hover:text-gray-300 transition-colors"
            >
              LOGIN
            </button>
            <Link
              href="/admin"
              className="text-white text-lg uppercase tracking-wider font-medium hover:text-gray-300 transition-colors"
            >
              ADMIN
            </Link>
          </nav>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-white text-7xl md:text-8xl font-bold mb-8 px-8 py-2 bg-black bg-opacity-40">
            Live Bets, Big Wins
          </h1>
          <p className="text-white text-xl md:text-2xl max-w-4xl mx-auto mb-16 px-8 py-2 bg-black bg-opacity-40 leading-relaxed">
            Where Every Play Counts—from edge-of-your-seat matchups to high-stakes casino tables, dive into nonstop action and unbeatable odds.
          </p>
          <button
            onClick={openRegistrationModal}
            className="bg-white text-gray-900 px-16 py-4 text-xl font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
          >
            Register
          </button>
        </main>

        <footer className="py-6 px-8">
          <p className="text-white text-sm">&copy; 2025. All Rights Reserved.</p>
        </footer>
      </div>

      {/* Registration Modal */}
      <RegistrationModal 
        isOpen={isRegistrationModalOpen}
        onClose={closeRegistrationModal}
        onSwitchToLogin={openLoginModal}
      />

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onSwitchToSignup={switchToRegistration}
      />
    </div>
  );
}
