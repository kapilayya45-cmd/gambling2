import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Head from 'next/head';
import LiveBetsSection from '@/components/LiveBetsSection';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

// Type for Bet
interface Bet {
  id: string;
  userId: string;
  matchId: number;
  match: string;
  selection: string;
  odds: number;
  stake: number;
  potentialWin: number;
  status: 'live' | 'settled' | 'cashout';
  createdAt: string;
  settled?: {
    payout: number;
    settledAt: string;
  };
}

// Type for API response
interface BetsResponse {
  bets: Bet[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Fetch settled bets
const fetchSettledBets = async (page: number): Promise<BetsResponse> => {
  const response = await fetch(`/api/user/bets?status=settled&page=${page}`);
  if (!response.ok) {
    throw new Error('Failed to fetch settled bets');
  }
  return response.json();
};

// Helper to format date
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  } catch (error) {
    return dateString;
  }
};

export default function Feed() {
  const [historyPage, setHistoryPage] = useState(1);

  // Query for bet history
  const { 
    data: settledBetsData, 
    isLoading: isLoadingSettledBets,
    error: settledBetsError
  } = useQuery<BetsResponse, Error>({
    queryKey: ['settledBets', historyPage],
    queryFn: () => fetchSettledBets(historyPage),
  });

  // Handle cash out button click
  const handleCashOut = (betId: string) => {
    console.log(`Cash out bet ${betId}`);
    // In a real app, this would make an API call to cash out the bet
    // No need to manually refetch as the onSnapshot listener will update automatically
  };

  // Go to next page
  const goToNextPage = () => {
    if (settledBetsData?.pagination.hasNext) {
      setHistoryPage(prev => prev + 1);
    }
  };

  // Go to previous page
  const goToPrevPage = () => {
    if (settledBetsData?.pagination.hasPrev) {
      setHistoryPage(prev => prev - 1);
    }
  };

  return (
    <>
      <Head>
        <title>My Feed | Foxxy</title>
        <meta name="description" content="Your personalized betting feed on Foxxy" />
      </Head>
      <div className="flex h-screen bg-black text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">My Feed</h1>
              <p className="text-gray-400 mt-2">Your personalized betting recommendations and updates</p>
            </div>
            
            {/* Live Bets Section - Using the new component with real-time updates */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Your Live Bets</h2>
              <LiveBetsSection onCashOut={handleCashOut} />
            </div>
            
            {/* Personalized Recommendations */}
            <div className="mb-6 bg-[#1a1f2c] rounded-lg p-5">
              <h2 className="text-xl font-semibold mb-4">Based on Your Interests</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#2a3040] p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-purple-400">LIVE</span>
                    <span className="text-xs text-gray-400">Starts in 10 min</span>
                  </div>
                  <h3 className="font-medium mb-1">Manchester United vs Liverpool</h3>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Football</span>
                    <span>Premier League</span>
                  </div>
                </div>
                <div className="bg-[#2a3040] p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-green-400">NEW</span>
                    <span className="text-xs text-gray-400">Today</span>
                  </div>
                  <h3 className="font-medium mb-1">Poker Championship Main Event</h3>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Casino</span>
                    <span>High Stakes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bet History Section */}
            <div className="mb-6 bg-[#1a1f2c] rounded-lg p-5">
              <h2 className="text-xl font-semibold mb-4">Bet History</h2>
              
              {isLoadingSettledBets ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-10 bg-[#2a3040] rounded"></div>
                  <div className="h-10 bg-[#2a3040] rounded"></div>
                  <div className="h-10 bg-[#2a3040] rounded"></div>
                </div>
              ) : settledBetsError ? (
                <div className="bg-red-900/20 text-red-400 p-4 rounded-lg">
                  Failed to load bet history. Please try again.
                </div>
              ) : settledBetsData?.bets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No betting history yet</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#2a3040]">
                          <th className="text-left py-3 px-4 font-medium text-gray-400">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-400">Match</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-400">Bet Type</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-400">Stake</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-400">Payout</th>
                        </tr>
                      </thead>
                      <tbody>
                        {settledBetsData?.bets.map((bet) => (
                          <tr key={bet.id} className="border-b border-[#2a3040] hover:bg-[#2a3040]/30">
                            <td className="py-3 px-4">{formatDate(bet.createdAt)}</td>
                            <td className="py-3 px-4">{bet.match}</td>
                            <td className="py-3 px-4">{bet.selection}</td>
                            <td className="py-3 px-4">${bet.stake.toFixed(2)}</td>
                            <td className={`py-3 px-4 ${bet.settled?.payout ? 'text-green-400' : 'text-red-400'}`}>
                              {bet.settled?.payout ? `+$${bet.settled.payout.toFixed(2)}` : `-$${bet.stake.toFixed(2)}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination controls */}
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-400">
                      Page {settledBetsData?.pagination.currentPage} of {settledBetsData?.pagination.pages}
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={goToPrevPage}
                        disabled={!settledBetsData?.pagination.hasPrev}
                        className={`px-3 py-1 rounded text-sm ${
                          settledBetsData?.pagination.hasPrev 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Previous
                      </button>
                      <button 
                        onClick={goToNextPage}
                        disabled={!settledBetsData?.pagination.hasNext}
                        className={`px-3 py-1 rounded text-sm ${
                          settledBetsData?.pagination.hasNext 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 