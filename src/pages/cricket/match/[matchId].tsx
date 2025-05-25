import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import UserBalanceDisplay from '@/components/UserBalanceDisplay';
import CricketMatchStats from '@/components/cricket/CricketMatchStats';
import MarketTabs, { BettingMarket } from '@/components/cricket/MarketTabs';
import CricketOddsGrid from '@/components/cricket/CricketOddsGrid';
import { CricketFixture, CRICKET_TEAM_NAMES } from '@/services/cricketApi';
import BetSlip from '@/components/BetSlip';

// Mock cricket fixture for testing
const MOCK_FIXTURES: Record<string, CricketFixture> = {
  '101': {
    id: 101,
    league_id: 1, // IPL
    localteam_id: 101,
    visitorteam_id: 102,
    starting_at: new Date(Date.now() - 40 * 60000).toISOString(), // started 40 min ago
    localteam_score: '128/4',
    visitorteam_score: '',
    status: 'live',
    venue_name: 'Wankhede Stadium',
    venue_city: 'Mumbai',
    venue_capacity: 33000,
    toss_winner_team_id: 101,
    toss_decision: 'bat',
    live_score: {
      runs: 128,
      wickets: 4,
      overs: 14.2,
      run_rate: 8.94
    }
  },
  '102': {
    id: 102,
    league_id: 1, // IPL
    localteam_id: 103,
    visitorteam_id: 104,
    starting_at: new Date(Date.now() + 90 * 60000).toISOString(), // starts in 90 min
    status: 'notstarted',
    venue_name: 'M. Chinnaswamy Stadium',
    venue_city: 'Bangalore',
    venue_capacity: 40000
  },
  '103': {
    id: 103,
    league_id: 1, // IPL
    localteam_id: 105,
    visitorteam_id: 106,
    starting_at: new Date(Date.now() + 180 * 60000).toISOString(), // starts in 3 hours
    status: 'notstarted',
    venue_name: 'Feroz Shah Kotla',
    venue_city: 'Delhi',
    venue_capacity: 41000
  },
  '104': {
    id: 104,
    league_id: 1, // IPL
    localteam_id: 107,
    visitorteam_id: 108,
    starting_at: new Date(Date.now() + 240 * 60000).toISOString(), // starts in 4 hours
    status: 'notstarted',
    venue_name: 'Punjab Cricket Association Stadium',
    venue_city: 'Mohali',
    venue_capacity: 30000
  }
};

// Format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export default function CricketMatchPage() {
  const router = useRouter();
  const { matchId } = router.query;
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState<CricketFixture | null>(null);
  const [activeMarket, setActiveMarket] = useState<BettingMarket>('match-winner');
  const [betslipOpen, setBetslipOpen] = useState(false);

  useEffect(() => {
    if (!matchId) return;

    // Simulate API fetch
    setLoading(true);
    setTimeout(() => {
      const foundMatch = MOCK_FIXTURES[matchId as string] || null;
      if (foundMatch) {
        setMatch(foundMatch);
      }
      setLoading(false);
    }, 300); // Simulate loading delay
  }, [matchId]);

  const handleSelectOdds = (selection: any) => {
    console.log('Selected odds:', selection);
    setBetslipOpen(true);
    // In a real app, would add to betslip context
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-black text-white">
        <Sidebar />
        <div className="flex-1 p-8 flex justify-center items-center">
          <div className="animate-pulse text-xl text-gray-300">Loading match data...</div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex h-screen bg-black text-white">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Match not found</h1>
            <Link href="/cricket" className="text-purple-400 hover:text-purple-300">
              ← Back to Cricket
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const team1Name = CRICKET_TEAM_NAMES[match.localteam_id] || `Team ${match.localteam_id}`;
  const team2Name = CRICKET_TEAM_NAMES[match.visitorteam_id] || `Team ${match.visitorteam_id}`;
  const matchTitle = `${team1Name} vs ${team2Name}`;
  const matchDate = formatDate(match.starting_at);
  const isLive = match.status === 'live';

  return (
    <>
      <Head>
        <title>{matchTitle} Betting - Foxxy</title>
        <meta name="description" content={`Cricket betting for ${matchTitle} on Foxxy`} />
      </Head>

      <div className="flex h-screen bg-black text-white overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4">
              <Link href="/cricket" className="text-purple-400 hover:text-purple-300 inline-flex items-center">
                <span className="mr-2">←</span> Back to Cricket
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Main content area - 2/3 width on large screens */}
              <div className="lg:col-span-2 space-y-4">
                {/* Match header */}
                <div className="bg-[#0f121a] rounded-lg p-4 shadow-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400 text-sm">{matchDate}</span>
                    {isLive && (
                      <span className="bg-red-600 px-2 py-1 rounded text-xs font-medium animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-2xl font-bold mb-2">{matchTitle}</h1>
                  
                  <div className="text-sm text-gray-300">
                    {match.venue_name && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {match.venue_name}, {match.venue_city}
                      </div>
                    )}
                  </div>
                  
                  {isLive && match.live_score && (
                    <div className="mt-4 p-3 bg-[#1a1f2c] rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{team1Name}</span>
                        <span className="font-bold">{match.localteam_score || '0/0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">{team2Name}</span>
                        <span className="font-bold">{match.visitorteam_score || 'Yet to bat'}</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-400">
                        <span>{match.live_score.overs} overs • RR: {match.live_score.run_rate}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Match statistics component */}
                <CricketMatchStats match={match} />
                
                {/* Betting Markets */}
                <div className="bg-[#0f121a] rounded-lg overflow-hidden shadow-lg">
                  <div className="p-4 bg-[#1a1f2c] border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">Betting Markets</h3>
                  </div>
                  
                  <div className="p-4">
                    <MarketTabs activeMarket={activeMarket} onChangeMarket={setActiveMarket} />
                    
                    <div className="mt-4">
                      <CricketOddsGrid 
                        market={activeMarket} 
                        match={match} 
                        onSelectOdds={handleSelectOdds} 
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sidebar area - 1/3 width on large screens */}
              <div className="space-y-4">
                <UserBalanceDisplay />
                
                <div className={`bg-[#0f121a] rounded-lg shadow-lg overflow-hidden ${betslipOpen ? 'block' : 'hidden lg:block'}`}>
                  <div className="p-4 bg-[#1a1f2c] border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Betslip</h3>
                    <button 
                      onClick={() => setBetslipOpen(false)}
                      className="lg:hidden text-gray-400 hover:text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <BetSlip />
                  </div>
                </div>
                
                {/* Mobile betslip button */}
                <div className="fixed bottom-4 right-4 lg:hidden z-10">
                  <button 
                    onClick={() => setBetslipOpen(true)}
                    className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 