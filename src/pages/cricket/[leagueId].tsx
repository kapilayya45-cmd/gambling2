import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { CRICKET_LEAGUES } from '@/constants/leagues';
import { Match } from '@/types/Match';

// Placeholder match data
const MOCK_MATCHES: Match[] = [
  {
    id: 101,
    sport: 'cricket',
    league: 'IPL',
    teamA: 'Mumbai Indians',
    teamB: 'Chennai Super Kings',
    time: '19:30',
    date: 'Today',
    isLive: true,
    odds: {
      teamA: 2.1,
      draw: 3.5,
      teamB: 1.8
    },
    stats: {
      teamAScore: '157/8',
      teamBScore: '98/3',
      period: '15.2 overs',
      timeElapsed: '2nd innings'
    }
  },
  {
    id: 102,
    sport: 'cricket',
    league: 'IPL',
    teamA: 'Delhi Capitals',
    teamB: 'Kolkata Knight Riders',
    time: '15:30',
    date: 'Tomorrow',
    isLive: false,
    odds: {
      teamA: 1.9,
      draw: 3.7,
      teamB: 2.2
    }
  },
  {
    id: 103,
    sport: 'cricket',
    league: 'Pakistan Super League',
    teamA: 'Lahore Qalandars',
    teamB: 'Karachi Kings',
    time: '20:00',
    date: 'Today',
    isLive: false,
    odds: {
      teamA: 2.0,
      draw: 3.4,
      teamB: 2.1
    }
  },
  {
    id: 104,
    sport: 'cricket',
    league: 'Test Series',
    teamA: 'England',
    teamB: 'Australia',
    time: '11:00',
    date: 'Tomorrow',
    isLive: false,
    odds: {
      teamA: 2.4,
      draw: 3.0,
      teamB: 1.7
    }
  }
];

export default function CricketLeaguePage() {
  const router = useRouter();
  const { leagueId } = router.query;
  const [loading, setLoading] = useState(true);
  const [league, setLeague] = useState<any>(null);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    if (!leagueId) return;

    // Find the league in our constants
    const selectedLeague = CRICKET_LEAGUES.find(l => l.id.toString() === leagueId);
    if (selectedLeague) {
      setLeague(selectedLeague);
    }

    // Filter mock matches for this league
    // In a real app, this would be an API call with the leagueId
    const leagueMatches = MOCK_MATCHES.filter(match => {
      if (leagueId === '1') return match.league === 'IPL';
      if (leagueId === '8') return match.league === 'Pakistan Super League';
      if (leagueId === '4') return match.league === 'Test Series';
      if (leagueId === '18') return match.league === 'ICC World Cup';
      return false;
    });

    setMatches(leagueMatches);
    setLoading(false);
  }, [leagueId]);

  if (!league && !loading) {
    return (
      <div className="flex h-screen bg-black text-white">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">League not found</h1>
            <Link href="/cricket" className="text-purple-400 hover:text-purple-300">
              ← Back to Cricket Leagues
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{league ? `${league.name} Betting - Foxxy` : 'Cricket Betting - Foxxy'}</title>
        <meta name="description" content={`Cricket betting for ${league?.name || 'cricket leagues'} on Foxxy`} />
      </Head>

      <div className="flex h-screen bg-black text-white overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-pulse text-xl text-gray-300">Loading...</div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <Link href="/cricket" className="text-purple-400 hover:text-purple-300 inline-flex items-center">
                    <span className="mr-2">←</span> Back to Cricket Leagues
                  </Link>
                  <h1 className="text-2xl font-bold mt-4">{league.name}</h1>
                  <p className="text-gray-300">Select a match to place your bet</p>
                </div>

                {matches.length === 0 ? (
                  <div className="bg-[#0a0d14] border border-gray-700 rounded-lg p-6 text-center shadow-lg shadow-black/50">
                    <p className="text-xl mb-2">No matches available</p>
                    <p className="text-gray-300">There are currently no matches scheduled for this league</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {matches.map(match => (
                      <div key={match.id} className="bg-[#0a0d14] border border-gray-700 rounded-lg shadow-lg shadow-black/50 overflow-hidden">
                        <div className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-300">{match.league}</span>
                            {match.isLive && (
                              <span className="bg-red-600 text-xs text-white px-2 py-1 rounded">LIVE</span>
                            )}
                          </div>
                          
                          <h2 className="text-lg font-semibold mb-2">{match.teamA} vs {match.teamB}</h2>
                          
                          <div className="text-sm text-gray-300 mb-3">
                            <span>{match.date} • {match.time}</span>
                          </div>
                          
                          {match.stats && (
                            <div className="bg-black p-2 rounded-lg mb-3 border border-gray-700">
                              <div className="flex justify-between text-sm mb-1">
                                <span>{match.teamA}</span>
                                <span className="font-semibold">{match.stats.teamAScore}</span>
                              </div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>{match.teamB}</span>
                                <span className="font-semibold">{match.stats.teamBScore}</span>
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {match.stats.timeElapsed} • {match.stats.period}
                              </div>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-3 gap-2 mt-4">
                            <button className="bg-black hover:bg-[#1a2030] py-2 px-3 rounded text-center transition-colors border border-gray-700">
                              <div className="text-xs text-gray-300 mb-1">{match.teamA}</div>
                              <div className="font-semibold">{match.odds.teamA}</div>
                            </button>
                            <button className="bg-black hover:bg-[#1a2030] py-2 px-3 rounded text-center transition-colors border border-gray-700">
                              <div className="text-xs text-gray-300 mb-1">Draw</div>
                              <div className="font-semibold">{match.odds.draw}</div>
                            </button>
                            <button className="bg-black hover:bg-[#1a2030] py-2 px-3 rounded text-center transition-colors border border-gray-700">
                              <div className="text-xs text-gray-300 mb-1">{match.teamB}</div>
                              <div className="font-semibold">{match.odds.teamB}</div>
                            </button>
                          </div>
                          
                          <Link href={`/cricket/match/${match.id}`} className="block text-center text-purple-400 hover:text-purple-300 mt-4 text-sm">
                            View all markets →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 