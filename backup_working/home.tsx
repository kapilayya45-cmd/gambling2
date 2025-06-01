import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Link from 'next/link';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled to avoid the component rendering issues
const InPlayGamesPanel = dynamic(() => import('@/components/InPlayGamesPanel'), { 
  ssr: false,
  loading: () => (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
        <h2 className="font-bold">Live Games</h2>
      </div>
      <div className="p-4 flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    </div>
  )
});

export default function Home() {
  return (
    <>
      <Head>
        <title>Foxxy | Sports Betting Platform</title>
        <meta name="description" content="Place bets on your favorite sports with Foxxy" />
      </Head>
      <div className="flex h-screen bg-white text-gray-800">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header onAdd={null} />
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">Welcome to Foxxy</h1>
                <p className="text-gray-600 mt-2">Your all-in-one betting platform</p>
              </div>
              
              {/* In-Play Games Panel */}
              <InPlayGamesPanel />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
