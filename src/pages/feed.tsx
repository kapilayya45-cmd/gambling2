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
      <div className="flex h-screen bg-white text-gray-800">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">My Feed</h1>
              <p className="text-gray-600 mt-2">Your personalized betting recommendations and updates</p>
            </div>
            
            {/* Live Bets Section - Using the new component with real-time updates */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Your Live Bets</h2>
              <LiveBetsSection onCashOut={handleCashOut} />
            </div>
            
            {/* Personalized Recommendations */}
            <div className="mb-6 bg-white rounded-lg p-5 shadow border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Based on Your Interests</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-purple-600">LIVE</span>
                    <span className="text-xs text-gray-500">Starts in 10 min</span>
                  </div>
                  <h3 className="font-medium mb-1">Manchester United vs Liverpool</h3>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Football</span>
                    <span>Premier League</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-green-600">NEW</span>
                    <span className="text-xs text-gray-500">Today</span>
                  </div>
                  <h3 className="font-medium mb-1">Poker Championship Main Event</h3>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Casino</span>
                    <span>High Stakes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bet History Section */}
            <div className="mb-6 bg-white rounded-lg p-5 shadow border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Bet History</h2>
              
              {isLoadingSettledBets ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ) : settledBetsError ? (
                <div className="bg-red-100 text-red-600 p-4 rounded-lg">
                  Failed to load bet history. Please try again.
                </div>
              ) : settledBetsData?.bets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No betting history yet</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500">Match</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500">Bet Type</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500">Stake</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500">Payout</th>
                        </tr>
                      </thead>
                      <tbody>
                        {settledBetsData?.bets.map((bet) => (
                          <tr key={bet.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-3 px-4">{formatDate(bet.createdAt)}</td>
                            <td className="py-3 px-4">{bet.match}</td>
                            <td className="py-3 px-4">{bet.selection}</td>
                            <td className="py-3 px-4">${bet.stake.toFixed(2)}</td>
                            <td className={`py-3 px-4 ${bet.settled?.payout ? 'text-green-600' : 'text-red-600'}`}>
                              {bet.settled?.payout ? `+$${bet.settled.payout.toFixed(2)}` : `-$${bet.stake.toFixed(2)}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination controls */}
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-500">
                      Page {settledBetsData?.pagination.currentPage} of {settledBetsData?.pagination.pages}
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={goToPrevPage}
                        disabled={!settledBetsData?.pagination.hasPrev}
                        className={`px-3 py-1 rounded text-sm ${
                          settledBetsData?.pagination.hasPrev 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* News & Updates */}
            <div className="mb-6 bg-white rounded-lg p-5 shadow border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Latest News & Updates</h2>
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-purple-600 text-sm font-medium">NEW FEATURE</span>
                    <span className="text-xs text-gray-500">2 days ago</span>
                  </div>
                  <h3 className="font-medium mb-1">Live Cash Out Now Available</h3>
                  <p className="text-gray-600 text-sm">Cash out your bets anytime during live matches to secure your winnings or cut your losses.</p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-600 text-sm font-medium">PROMO</span>
                    <span className="text-xs text-gray-500">5 days ago</span>
                  </div>
                  <h3 className="font-medium mb-1">Double Your First Deposit</h3>
                  <p className="text-gray-600 text-sm">New users can get up to $100 in bonus funds when they make their first deposit.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 