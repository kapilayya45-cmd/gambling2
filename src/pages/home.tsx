import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import BetSlip from '@/components/BetSlip';
import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Foxxy | Sports Betting Platform</title>
        <meta name="description" content="Place bets on your favorite sports with Foxxy" />
      </Head>
      <div className="flex h-screen bg-black text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">Welcome to Foxxy</h1>
                <p className="text-gray-400 mt-2">Your all-in-one betting platform</p>
              </div>
              
              {/* Popular Categories */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#1a1f2c] rounded-lg p-4 hover:bg-[#2a3040] transition-colors cursor-pointer">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold">Live Events</h2>
                  </div>
                  <p className="text-gray-400 text-sm">Watch and bet on live sporting events</p>
                </div>
                
                <div className="bg-[#1a1f2c] rounded-lg p-4 hover:bg-[#2a3040] transition-colors cursor-pointer">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold">Casino Games</h2>
                  </div>
                  <p className="text-gray-400 text-sm">Enjoy our selection of casino games</p>
                </div>
                
                <div className="bg-[#1a1f2c] rounded-lg p-4 hover:bg-[#2a3040] transition-colors cursor-pointer">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold">Promotions</h2>
                  </div>
                  <p className="text-gray-400 text-sm">Check out our latest bonus offers</p>
                </div>
              </div>
            </div>
            <div className="w-80 border-l border-[#2a2a2a] p-4 bg-[#0f0f0f]">
              <BetSlip />
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 