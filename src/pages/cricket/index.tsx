import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { CRICKET_LEAGUES } from '@/constants/leagues';
import { useLeagueStatus } from '@/hooks/useLeagueStatus';

export default function CricketIndexPage() {
  const router = useRouter();
  const { status } = useLeagueStatus();
  
  const handleAddClick = () => {
    // For now, just alert - in a real implementation, you would show a modal
    alert("Add new cricket bet!");
    // You can implement your modal open logic here
  };

  return (
    <>
      <Head>
        <title>Foxxy - Cricket Betting</title>
        <meta name="description" content="Cricket betting on Foxxy" />
      </Head>

      <div className="flex h-screen bg-black text-white overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onAdd={handleAddClick} />
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Cricket Leagues</h1>
              <p className="text-gray-300">Select a cricket league to place your bets</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CRICKET_LEAGUES.map((league) => (
                <div 
                  key={league.id} 
                  className="bg-[#0a0d14] border border-gray-700 rounded-lg shadow-lg shadow-black/50 overflow-hidden cursor-pointer transition-transform hover:scale-105"
                  onClick={() => router.push(`/cricket/${league.id}`)}
                >
                  <div className="p-4">
                    <h2 className="text-xl font-bold mb-2">{league.name}</h2>
                    <div className="flex items-center mt-4">
                      {status[league.id]?.live && (
                        <span className="bg-red-600 text-xs text-white px-2 py-1 rounded mr-2">LIVE</span>
                      )}
                      {!status[league.id]?.live && status[league.id]?.inSeason && (
                        <span className="bg-green-600 text-xs text-white px-2 py-1 rounded mr-2">IN SEASON</span>
                      )}
                      <Link 
                        href={`/cricket/${league.id}`} 
                        className="ml-auto text-purple-400 hover:text-purple-300 text-sm font-semibold"
                      >
                        View Markets →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Special card for IPL betting page */}
              <div 
                className="bg-gradient-to-r from-[#0a0d14] to-[#1a102d] border border-gray-700 rounded-lg shadow-lg shadow-black/50 overflow-hidden cursor-pointer transition-transform hover:scale-105"
                onClick={() => router.push('/cricket/ipl/bet')}
              >
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-2">IPL Live Betting</h2>
                  <p className="text-sm text-gray-300">Real-time odds for Indian Premier League matches</p>
                  <div className="flex items-center mt-4">
                    <span className="bg-red-600 text-xs text-white px-2 py-1 rounded mr-2">LIVE</span>
                    <Link 
                      href="/cricket/ipl/bet" 
                      className="ml-auto text-purple-400 hover:text-purple-300 text-sm font-semibold"
                    >
                      Place Bets →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Featured matches section */}
            <div className="mt-10">
              <h2 className="text-2xl font-bold mb-4">Featured Matches</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Mumbai Indians vs Chennai Super Kings */}
                <div className="bg-[#0a0d14] border border-gray-700 rounded-lg shadow-lg shadow-black/50 overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-300">IPL</span>
                      <span className="bg-red-600 text-xs text-white px-2 py-1 rounded">LIVE</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Mumbai Indians vs Chennai Super Kings</h3>
                    <div className="text-sm text-gray-300 mb-3">
                      <span>Today • 19:30</span>
                    </div>
                    <Link 
                      href="/cricket/match/101" 
                      className="block text-center bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
                    >
                      Bet Now
                    </Link>
                  </div>
                </div>
                
                {/* Delhi Capitals vs Kolkata Knight Riders */}
                <div className="bg-[#0a0d14] border border-gray-700 rounded-lg shadow-lg shadow-black/50 overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-300">IPL</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Delhi Capitals vs Kolkata Knight Riders</h3>
                    <div className="text-sm text-gray-300 mb-3">
                      <span>Tomorrow • 15:30</span>
                    </div>
                    <Link 
                      href="/cricket/match/102" 
                      className="block text-center bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
                    >
                      View Markets
                    </Link>
                  </div>
                </div>
                
                {/* Rajasthan Royals vs Punjab Kings */}
                <div className="bg-[#0a0d14] border border-gray-700 rounded-lg shadow-lg shadow-black/50 overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-300">IPL</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Rajasthan Royals vs Punjab Kings</h3>
                    <div className="text-sm text-gray-300 mb-3">
                      <span>Tomorrow • 19:30</span>
                    </div>
                    <Link 
                      href="/cricket/match/104" 
                      className="block text-center bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
                    >
                      View Markets
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 