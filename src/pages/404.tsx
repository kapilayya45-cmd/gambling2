import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function Custom404() {
  return (
    <div className="min-h-screen bg-[#0f121a] flex flex-col items-center justify-center text-white p-4">
      <Head>
        <title>Page Not Found | Foxxy</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Head>
      
      <div className="w-24 h-24 mb-8">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 90C72.0914 90 90 72.0914 90 50C90 27.9086 72.0914 10 50 10C27.9086 10 10 27.9086 10 50C10 72.0914 27.9086 90 50 90Z" fill="#111" fillOpacity="0.5" stroke="#8A2BE2" strokeWidth="2" />
          <path d="M50 20C65 20 75 35 75 50C75 65 65 80 50 80" stroke="#FF00FF" strokeWidth="2" />
          <path d="M50 20C35 20 25 35 25 50C25 65 35 80 50 80" stroke="#FF69B4" strokeWidth="2" />
          <path d="M35 40L45 50L35 60" stroke="#FF00FF" strokeWidth="2" />
          <path d="M65 40L55 50L65 60" stroke="#FF69B4" strokeWidth="2" />
        </svg>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold mb-4">404</h1>
      <p className="text-xl md:text-2xl mb-8 text-center text-gray-300">
        Oops! We couldn't find the page you're looking for.
      </p>
      
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <Link href="/" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors">
          Back to Home
        </Link>
        <Link href="/home" className="px-6 py-3 border border-purple-500 text-purple-400 hover:bg-purple-900 hover:bg-opacity-30 font-medium rounded-md transition-colors">
          Go to Platform
        </Link>
      </div>
    </div>
  );
} 