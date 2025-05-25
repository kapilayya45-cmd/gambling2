import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Head from 'next/head';

export default function Betslip() {
  // Example bet data - in a real app this would come from context or state
  const bets = [
    { id: 1, event: 'Manchester United vs Liverpool', selection: 'Liverpool to win', odds: 2.25, stake: 10, potential: 22.50 },
    { id: 2, event: 'NBA: Lakers vs. Celtics', selection: 'Over 210.5 points', odds: 1.92, stake: 20, potential: 38.40 },
  ];

  const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const totalPotential = bets.reduce((sum, bet) => sum + bet.potential, 0);

  return (
    <>
      <Head>
        <title>Betslip | Foxxy</title>
        <meta name="description" content="View and manage your active bets on Foxxy" />
      </Head>
      <div className="flex h-screen bg-black text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Betslip</h1>
              <p className="text-gray-400 mt-2">Manage your selections and place your bets</p>
            </div>
            
            {/* Betslip content */}
            <div className="space-y-6">
              {bets.length > 0 ? (
                <>
                  {/* Selections */}
                  <div className="bg-[#1a1f2c] rounded-lg p-5">
                    <h2 className="text-xl font-semibold mb-4">Your Selections</h2>
                    <div className="space-y-4">
                      {bets.map((bet) => (
                        <div key={bet.id} className="bg-[#2a3040] p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{bet.event}</h3>
                              <p className="text-sm text-gray-400 mt-1">{bet.selection}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-purple-400 font-bold">{bet.odds.toFixed(2)}</span>
                              <button className="ml-3 text-gray-400 hover:text-red-400">✕</button>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center">
                            <div className="flex-1">
                              <label className="block text-xs text-gray-400 mb-1">Stake ($)</label>
                              <input 
                                type="number" 
                                value={bet.stake}
                                className="w-full bg-[#1a1f2c] border border-[#3c4254] rounded p-2 text-white"
                              />
                            </div>
                            <div className="ml-4 text-right">
                              <span className="block text-xs text-gray-400 mb-1">Potential Return</span>
                              <span className="text-green-400 font-medium">${bet.potential.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bet Summary */}
                  <div className="bg-[#1a1f2c] rounded-lg p-5">
                    <h2 className="text-xl font-semibold mb-4">Bet Summary</h2>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Stake:</span>
                        <span className="font-medium">${totalStake.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-[#2a3040] pt-3">
                        <span className="text-gray-400">Potential Return:</span>
                        <span className="text-green-400 font-medium">${totalPotential.toFixed(2)}</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded transition-colors">
                      Place Bet
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-[#1a1f2c] rounded-lg p-8 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <h2 className="text-xl font-semibold mb-2">Your betslip is empty</h2>
                  <p className="text-gray-400 mb-6">Browse events and select odds to add selections to your betslip.</p>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2 rounded transition-colors">
                    Explore Markets
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 