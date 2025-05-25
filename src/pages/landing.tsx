import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Logo from '@/components/Logo';

const LandingPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <Head>
        <title>Foxxy - Live Bets, Big Wins</title>
        <meta name="description" content="Where Every Play Counts—from edge-of-your-seat matchups to high-stakes casino tables, dive into nonstop action and unbeatable odds." />
      </Head>

      {/* Full-screen background image - casino/gambling environment */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/landing-bg.jpg")',
          filter: 'brightness(0.4)'
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header/Navigation */}
        <header className="flex justify-between items-center px-8 py-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo className="w-32 h-28" />
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-8">
            <Link href="/" className="text-white text-lg uppercase tracking-wider font-medium border-b-2 border-white px-1 py-1">HOME</Link>
            <Link href="/login" className="text-white text-lg uppercase tracking-wider font-medium hover:text-gray-300 transition-colors">LOGIN</Link>
            <Link href="/admin" className="text-white text-lg uppercase tracking-wider font-medium hover:text-gray-300 transition-colors">ADMIN</Link>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
          {/* Main Heading */}
          <h1 className="text-white text-7xl md:text-8xl font-bold mb-8 px-8 py-2 bg-black bg-opacity-40">
            Live Bets, Big Wins
          </h1>

          {/* Subheading */}
          <p className="text-white text-xl md:text-2xl max-w-4xl mx-auto mb-16 px-8 py-2 bg-black bg-opacity-40 leading-relaxed">
            Where Every Play Counts—from edge-of-your-seat matchups to high-stakes casino tables, 
            dive into nonstop action and unbeatable odds.
          </p>

          {/* CTA Button */}
          <Link 
            href="/signup" 
            className="bg-white text-gray-900 px-16 py-4 text-xl font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
          >
            Register
          </Link>
        </main>

        {/* Footer */}
        <footer className="py-6 px-8">
          <p className="text-white text-sm">&copy; 2025. All Rights Reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage; 