import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Link from 'next/link';
import Head from 'next/head';
import InPlayGamesPanel from '@/components/InPlayGamesPanel';

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