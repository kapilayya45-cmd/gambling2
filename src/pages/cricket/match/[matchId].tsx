import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import UserBalanceDisplay from '@/components/UserBalanceDisplay';
import MarketTabs, { BettingMarket } from '@/components/cricket/MarketTabs';
import BetSlip from '@/components/BetSlip';
import { CompatibleMatch } from '@/types/oddsApiTypes';
import { IPL_CONFIG } from '@/config/oddsApiConfig';
import { formatTeamName, getTeamAbbreviation, createShortTitle } from '@/utils/teamUtils';

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

// Format odds with rupee symbol
const formatOdds = (odds: number | undefined) => {
  if (!odds) return '-';
  return `₹${odds.toFixed(2)}`;
};

export default function CricketMatchPage() {
  const router = useRouter();
  const { matchId } = router.query;
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState<CompatibleMatch | null>(null);
  const [activeMarket, setActiveMarket] = useState<BettingMarket>('match-winner');
  const [betslipOpen, setBetslipOpen] = useState(false);

  useEffect(() => {
    if (!matchId) return;

    const fetchMatchDetails = async () => {
      setLoading(true);
      try {
        // Fetch from our API route
        const response = await fetch(`/api/cricket/match/${matchId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch match details: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.status && data.data) {
          console.log("Match data received:", data.data);
          
          // Format the team names before setting the match data
          const matchData = data.data;
          matchData.localteam_name = formatTeamName(matchData.localteam_name);
          matchData.visitorteam_name = formatTeamName(matchData.visitorteam_name);
          matchData.title = `${matchData.localteam_name} vs ${matchData.visitorteam_name}`;
          matchData.short_title = createShortTitle(matchData.localteam_name, matchData.visitorteam_name);
          
          setMatch(matchData);
        } else {
          throw new Error(data.message || 'Failed to get match data');
        }
      } catch (err) {
        console.error('Error fetching match details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatchDetails();
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
            <Link href="/cricket/ipl" className="text-purple-400 hover:text-purple-300">
              ← Back to IPL Cricket
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get team names from match (already formatted by now)
  const homeTeam = match.localteam_name;
  const awayTeam = match.visitorteam_name;
  
  // Get abbreviations
  const homeAbbr = getTeamAbbreviation(homeTeam);
  const awayAbbr = getTeamAbbreviation(awayTeam);
  
  // Make sure we use proper formatted names
  const matchTitle = `${homeTeam} vs ${awayTeam}`;
  const shortTitle = `${homeAbbr} vs ${awayAbbr}`;
  const matchDate = match.date ? formatDate(`${match.date}T${match.time}`) : 'TBD';
  const isLive = match.is_live || match.status === 'live';

  // Get betting odds
  const homeOdds = match.betting_odds?.match_winner?.[homeTeam];
  const awayOdds = match.betting_odds?.match_winner?.[awayTeam];

  const availableMarkets: BettingMarket[] = [
    'match-winner',
    'top-batsman',
    'top-bowler',
    'over-under',
    'session',
    'next-wicket'
  ];

  return (
    <>
      <Head>
        <title>{matchTitle} Betting - BetMaster</title>
        <meta name="description" content={`Cricket betting for ${matchTitle} on BetMaster`} />
      </Head>

      <div className="flex h-screen bg-black text-white overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4">
              <Link href="/cricket/ipl" className="text-purple-400 hover:text-purple-300 inline-flex items-center">
                <span className="mr-2">←</span> Back to all IPL
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
                        {match.venue_name}
                      </div>
                    )}
                  </div>
                  
                  {isLive && (
                    <div className="mt-4 p-3 bg-[#1a1f2c] rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{homeTeam}</span>
                        <span className="font-bold">{match.localteam_score || '0/0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">{awayTeam}</span>
                        <span className="font-bold">{match.visitorteam_score || 'Yet to bat'}</span>
                      </div>
                      {match.localteam_overs && (
                        <div className="mt-2 text-sm text-gray-400">
                          <span>{match.localteam_overs} overs</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Betting Markets */}
                <div className="bg-[#0f121a] rounded-lg overflow-hidden shadow-lg">
                  <div className="p-4 bg-[#1a1f2c] border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">Betting Markets</h3>
                  </div>
                  
                  <div className="p-4">
                    <MarketTabs 
                      activeMarket={activeMarket} 
                      availableMarkets={availableMarkets}
                      onSelectMarket={(market) => setActiveMarket(market)} 
                    />
                    
                    <div className="mt-4">
                      {activeMarket === 'match-winner' && (
                        <div className="grid grid-cols-3 gap-4">
                          <div 
                            className="p-4 bg-[#1a1f2c] rounded-lg text-center cursor-pointer hover:bg-[#262c3a] transition-colors"
                            onClick={() => handleSelectOdds({ team: homeTeam, odds: homeOdds })}
                          >
                            <div className="mb-2 text-gray-400">{homeTeam}</div>
                            <div className="text-xl font-bold">
                              {formatOdds(homeOdds)}
                            </div>
                          </div>
                          <div 
                            className="p-4 bg-[#1a1f2c] rounded-lg text-center cursor-pointer hover:bg-[#262c3a] transition-colors"
                            onClick={() => handleSelectOdds({ team: 'Draw', odds: 450 })}
                          >
                            <div className="mb-2 text-gray-400">Draw</div>
                            <div className="text-xl font-bold">₹450.00</div>
                          </div>
                          <div 
                            className="p-4 bg-[#1a1f2c] rounded-lg text-center cursor-pointer hover:bg-[#262c3a] transition-colors"
                            onClick={() => handleSelectOdds({ team: awayTeam, odds: awayOdds })}
                          >
                            <div className="mb-2 text-gray-400">{awayTeam}</div>
                            <div className="text-xl font-bold">
                              {formatOdds(awayOdds)}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {activeMarket !== 'match-winner' && (
                        <div className="p-6 text-center text-gray-400">
                          <p>Additional betting markets coming soon</p>
                        </div>
                      )}
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