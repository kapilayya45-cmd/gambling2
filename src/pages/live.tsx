import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

// Loading placeholder
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-[#2a3040] rounded w-1/3 mb-4"></div>
    <div className="h-4 bg-[#2a3040] rounded w-2/3 mb-8"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-40 bg-[#2a3040] rounded"></div>
      <div className="h-40 bg-[#2a3040] rounded"></div>
      <div className="h-40 bg-[#2a3040] rounded"></div>
      <div className="h-40 bg-[#2a3040] rounded"></div>
    </div>
  </div>
);

// Dynamically import main content
const LiveContent = dynamic(
  () => import('@/components/LiveContent'),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false
  }
);

export default function Live() {
  return (
    <>
      <Head>
        <title>Live Events | Foxxy</title>
        <meta name="description" content="Watch and bet on live sporting events on Foxxy" />
      </Head>
      <div className="flex h-screen bg-black text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Live Events</h1>
              <p className="text-gray-400 mt-2">Watch and bet on live events in real-time</p>
            </div>
            
            <Suspense fallback={<LoadingSkeleton />}>
              <LiveContent />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
} 