import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import BetPlaceForm from '@/components/cricket/BetPlaceForm';
import { useCoins } from '@/contexts/CoinsContext';
import { useWallet } from '@/contexts/WalletContext';

export default function BetPlacementPage() {
  const { balance: walletBalance } = useWallet();
  const { coinsBalance, deductCoins } = useCoins();
  const [betPlaced, setBetPlaced] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('Punjab Kings');
  const [selectedOdds, setSelectedOdds] = useState(2.34);
  
  // Handle placing a bet
  const handlePlaceBet = (stake: number, team: string, odds: number, paymentMethod: 'wallet' | 'coins') => {
    // Calculate potential profit
    const profit = stake * odds - stake;
    
    // Show success message
    alert(`Bet placed successfully!\nTeam: ${team}\nStake: ₹${stake}\nPotential Profit: ₹${profit.toFixed(2)}\nPaid with: ${paymentMethod}`);
    
    // Update state
    setBetPlaced(true);
    
    // Deduct from the appropriate balance
    if (paymentMethod === 'coins') {
      deductCoins(stake);
    }
  };
  
  return (
    <>
      <Head>
        <title>Place Bet | Foxxy</title>
        <meta name="description" content="Place your cricket bet" />
      </Head>
      
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <Link href="/">
              <span className="text-2xl font-bold text-green-600">FOXXY</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="text-gray-800 font-medium">
                Balance: ₹{walletBalance?.toLocaleString() || 0}
              </div>
              <div className="bg-yellow-500 text-black px-4 py-2 rounded-full font-medium">
                Coins: ₹{coinsBalance.toLocaleString()}
              </div>
              <button className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700">
                Deposit
              </button>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-md font-medium hover:bg-purple-700">
                My Bets
              </button>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Punjab Kings vs Mumbai Indians
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Match info */}
              <div>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h2 className="font-semibold text-lg mb-2">Match Details</h2>
                  <p className="text-gray-600">01/06/2025, 19:30:00 at TBD</p>
                  <div className="mt-3 flex items-center">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                      LIVE
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="font-semibold text-lg mb-2">Current Score</h2>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Punjab Kings</span>
                    <span className="text-lg">81</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Mumbai Indians</span>
                    <span className="text-lg">0</span>
                  </div>
                </div>
              </div>
              
              {/* Bet placement form */}
              <div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="font-semibold text-lg mb-4">Match Winner</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Home team */}
                    <div 
                      className="bg-green-100 border-green-400 border rounded-lg p-4 flex flex-col items-center cursor-pointer"
                      onClick={() => setSelectedTeam('Punjab Kings')}
                    >
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        LIVE
                      </div>
                      <p className="font-semibold text-gray-700 mb-3 text-center text-lg">Punjab Kings</p>
                      <button 
                        className="bg-green-200 text-green-900 font-bold text-2xl rounded-md px-6 py-2 relative w-full"
                        onClick={() => {
                          setSelectedTeam('Punjab Kings');
                          setSelectedOdds(2.34);
                        }}
                      >
                        2.34
                        <span className="absolute -top-2 -right-2 text-xs bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center">
                          +
                        </span>
                      </button>
                      <p className="text-xs text-gray-500 mt-2">Click to place bet</p>
                    </div>
                    
                    {/* Away team */}
                    <div 
                      className="bg-green-100 border-green-400 border rounded-lg p-4 flex flex-col items-center cursor-pointer"
                      onClick={() => setSelectedTeam('Mumbai Indians')}
                    >
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        LIVE
                      </div>
                      <p className="font-semibold text-gray-700 mb-3 text-center text-lg">Mumbai Indians</p>
                      <button 
                        className="bg-green-200 text-green-900 font-bold text-2xl rounded-md px-6 py-2 relative w-full"
                        onClick={() => {
                          setSelectedTeam('Mumbai Indians');
                          setSelectedOdds(1.73);
                        }}
                      >
                        1.73
                        <span className="absolute -top-2 -right-2 text-xs bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center">
                          +
                        </span>
                      </button>
                      <p className="text-xs text-gray-500 mt-2">Click to place bet</p>
                    </div>
                  </div>
                  
                  {/* Bet form */}
                  <BetPlaceForm
                    team={selectedTeam}
                    odds={selectedOdds}
                    onPlaceBet={handlePlaceBet}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
} 