import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

// Loading placeholder
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div className="h-36 bg-gray-200 rounded"></div>
      <div className="h-36 bg-gray-200 rounded"></div>
      <div className="h-36 bg-gray-200 rounded"></div>
      <div className="h-36 bg-gray-200 rounded"></div>
      <div className="h-36 bg-gray-200 rounded"></div>
      <div className="h-36 bg-gray-200 rounded"></div>
      <div className="h-36 bg-gray-200 rounded"></div>
      <div className="h-36 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// Dynamically import main content
const CasinoContent = dynamic(
  () => import('@/components/CasinoContent'),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false
  }
);

export default function Casino() {
  return (
    <>
      <Head>
        <title>Casino | Foxxy</title>
        <meta name="description" content="Play casino games on Foxxy betting platform" />
      </Head>
      <div className="flex h-screen bg-white text-gray-800">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Casino Games</h1>
              <p className="text-gray-600 mt-2">Try your luck with our exciting collection of casino games</p>
            </div>
            
            <Suspense fallback={<LoadingSkeleton />}>
              <CasinoContent />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
} 