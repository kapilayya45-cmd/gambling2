import React, { useState, useEffect } from 'react';
import { useLeagueStatus } from '@/hooks/useLeagueStatus';
import { useBasketballStatus } from '@/hooks/useBasketballStatus';
import { CRICKET_LEAGUES, FOOTBALL_LEAGUES } from '@/constants/leagues';
import { BASKETBALL_LEAGUES } from '@/constants/basketballLeagues';
import { fetchCricketLivescores, fetchCricketFixturesBySeason, CRICKET_TEAM_NAMES } from '@/services/cricketApi';
import { fetchFootballLivescores, fetchFootballFixturesBySeason } from '@/services/footballApi';
import { fetchBasketballEvents } from '@/services/basketballApi';
import { Match } from '@/types/Match';
import BettingSlip from './BettingSlip';

// Tennis leagues from sidebar
const TENNIS_LEAGUES = [
  { id: '4464', name: 'ATP Tour' },
  { id: '4517', name: 'WTA Tour' },
  { id: '4491', name: 'Davis Cup' },
  { id: '4506', name: 'Fed Cup' },
  { id: '4481', name: 'Grand Slams' },
  { id: '4478', name: 'ATP Masters' },
  { id: '4489', name: 'Exhibition Matches' }
];

// Get today and tomorrow dates
const getFormattedDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const todayFormatted = getFormattedDate(today);
const tomorrowFormatted = getFormattedDate(tomorrow);

type Tab = 'in-play' | 'today' | 'tomorrow';

const InPlayGamesPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('in-play');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { status: cricketFootballStatus } = useLeagueStatus();
  const basketballStatus = useBasketballStatus();
  const [selectedBet, setSelectedBet] = useState<{ 
    teamName: string; 
    odds: number; 
    matchId: number;
    betType: '1' | 'X' | '2';
  } | null>(null);

  // Define onChangeMarket function to fix the error
  const onChangeMarket = (market: any) => {
    // This is a dummy function to prevent the error
    console.log('Market changed:', market);
  };

  // Group matches by sport
  const matchesByCategory = matches.reduce((acc, match) => {
    if (!acc[match.sport]) {
      acc[match.sport] = [];
    }
    acc[match.sport].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  // Fetch matches based on active tab
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      let fetchedMatches: Match[] = [];

      try {
        // In-Play tab
        if (activeTab === 'in-play') {
          // 1. Cricket live matches
          const cricketLive = await fetchCricketLivescores();
          const cricketMatches = cricketLive.filter(m => m.status === 'live').map(m => ({
            id: m.id,
            sport: 'cricket' as const,
            league: CRICKET_LEAGUES.find(l => l.id === m.league_id)?.name || 'Cricket',
            teamA: CRICKET_TEAM_NAMES[m.localteam_id] || 'Team A',
            teamB: CRICKET_TEAM_NAMES[m.visitorteam_id] || 'Team B',
            time: 'Live',
            date: today.toLocaleDateString(),
            isLive: true,
            odds: {
              teamA: 1.8 + Math.random() * 0.4,
              draw: 3.0 + Math.random() * 1.0,
              teamB: 1.8 + Math.random() * 0.4
            },
            stats: {
              teamAScore: m.localteam_score || '0',
              teamBScore: m.visitorteam_score || '0',
              period: 'Live',
              timeElapsed: m.live_score ? `${m.live_score.overs} overs` : 'In Progress'
            }
          }));
          
          // 2. Football live matches
          // For mocking purposes, use any available football fixtures
          const footballLive = await fetchFootballLivescores();
          const footballMatches = footballLive.map(m => ({
            id: m.id,
            sport: 'football' as const,
            league: FOOTBALL_LEAGUES.find(l => l.id === m.league_id)?.name || 'Football',
            teamA: m.localteam_id.toString(),
            teamB: m.visitorteam_id.toString(),
            time: 'Live',
            date: today.toLocaleDateString(),
            isLive: true,
            odds: {
              teamA: 1.5 + Math.random() * 1.0,
              draw: 3.0 + Math.random() * 1.0,
              teamB: 1.5 + Math.random() * 1.0
            }
          }));
          
          // 3. Basketball live matches
          const basketballLive = [];
          for (const league of BASKETBALL_LEAGUES) {
            if (basketballStatus[league.id]?.live) {
              const events = await fetchBasketballEvents(league.id);
              basketballLive.push(...events.map(e => ({
                id: parseInt(e.idEvent),
                sport: 'basketball' as const,
                league: league.name,
                teamA: e.strHomeTeam,
                teamB: e.strAwayTeam,
                time: 'Live',
                date: today.toLocaleDateString(),
                isLive: true,
                odds: {
                  teamA: 1.8 + Math.random() * 0.5,
                  teamB: 1.8 + Math.random() * 0.5
                }
              })));
            }
          }
          
          // 4. Tennis is mocked for simplicity
          const tennisLive = TENNIS_LEAGUES.map((league, idx) => ({
            id: 5000 + idx,
            sport: 'tennis' as const,
            league: league.name,
            teamA: ['Djokovic', 'Nadal', 'Federer', 'Murray', 'Alcaraz'][Math.floor(Math.random() * 5)],
            teamB: ['Zverev', 'Medvedev', 'Sinner', 'Tsitsipas', 'Rublev'][Math.floor(Math.random() * 5)],
            time: 'Live',
            date: today.toLocaleDateString(),
            isLive: true,
            odds: {
              teamA: 1.5 + Math.random() * 1.0,
              teamB: 1.5 + Math.random() * 1.0
            },
            stats: {
              teamAScore: `${Math.floor(Math.random() * 3)}-${Math.floor(Math.random() * 6)}`,
              teamBScore: `${Math.floor(Math.random() * 3)}-${Math.floor(Math.random() * 6)}`,
              period: 'Set 2',
              timeElapsed: '45 min'
            }
          })).slice(0, 3); // Just show a few for demo purposes
          
          fetchedMatches = [...cricketMatches, ...footballMatches, ...basketballLive, ...tennisLive];
        } 
        // Today's matches
        else if (activeTab === 'today') {
          // Cricket fixtures for today
          const cricketToday = [];
          for (const league of CRICKET_LEAGUES) {
            const fixtures = await fetchCricketFixturesBySeason(league.seasonId);
            cricketToday.push(...fixtures
              .filter(f => f.starting_at.startsWith(todayFormatted) && f.status !== 'live')
              .map(m => ({
                id: m.id,
                sport: 'cricket' as const,
                league: league.name,
                teamA: CRICKET_TEAM_NAMES[m.localteam_id] || 'Team A',
                teamB: CRICKET_TEAM_NAMES[m.visitorteam_id] || 'Team B',
                time: new Date(m.starting_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
                date: 'Today',
                isLive: false,
                odds: {
                  teamA: 1.8 + Math.random() * 0.4,
                  draw: 3.0 + Math.random() * 1.0,
                  teamB: 1.8 + Math.random() * 0.4
                }
              }))
            );
          }
          
          // Football fixtures for today
          const footballToday = [];
          for (const league of FOOTBALL_LEAGUES) {
            const fixtures = await fetchFootballFixturesBySeason(league.seasonId);
            footballToday.push(...fixtures
              .filter(f => f.starting_at && f.starting_at.startsWith(todayFormatted))
              .map(m => ({
                id: m.id,
                sport: 'football' as const,
                league: league.name,
                teamA: m.localteam_id.toString(),
                teamB: m.visitorteam_id.toString(),
                time: new Date(m.starting_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
                date: 'Today',
                isLive: false,
                odds: {
                  teamA: 1.5 + Math.random() * 1.0,
                  draw: 3.0 + Math.random() * 1.0,
                  teamB: 1.5 + Math.random() * 1.0
                }
              }))
            );
          }
          
          // Mock data for Tennis and Basketball for today
          const otherSportsToday = [
            ...TENNIS_LEAGUES.slice(0, 3).map((league, idx) => ({
              id: 7000 + idx,
              sport: 'tennis' as const,
              league: league.name,
              teamA: ['Djokovic', 'Nadal', 'Federer', 'Murray', 'Alcaraz'][Math.floor(Math.random() * 5)],
              teamB: ['Zverev', 'Medvedev', 'Sinner', 'Tsitsipas', 'Rublev'][Math.floor(Math.random() * 5)],
              time: `${12 + Math.floor(Math.random() * 8)}:${Math.floor(Math.random() * 6)}0`,
              date: 'Today',
              isLive: false,
              odds: {
                teamA: 1.5 + Math.random() * 1.0,
                teamB: 1.5 + Math.random() * 1.0
              }
            })),
            ...BASKETBALL_LEAGUES.map((league, idx) => ({
              id: 8000 + idx,
              sport: 'basketball' as const,
              league: league.name,
              teamA: ['Lakers', 'Celtics', 'Warriors', 'Bucks', 'Heat'][Math.floor(Math.random() * 5)],
              teamB: ['Nets', 'Mavericks', 'Suns', 'Nuggets', 'Raptors'][Math.floor(Math.random() * 5)],
              time: `${12 + Math.floor(Math.random() * 8)}:${Math.floor(Math.random() * 6)}0`,
              date: 'Today',
              isLive: false,
              odds: {
                teamA: 1.5 + Math.random() * 1.0,
                teamB: 1.5 + Math.random() * 1.0
              }
            }))
          ];
          
          fetchedMatches = [...cricketToday, ...footballToday, ...otherSportsToday];
        } 
        // Tomorrow's matches
        else {
          // For simplicity, generate mock data for tomorrow
          const tomorrowFixtures = [];
          
          // Cricket fixtures
          CRICKET_LEAGUES.forEach((league, idx) => {
            tomorrowFixtures.push({
              id: 10000 + idx,
              sport: 'cricket' as const,
              league: league.name,
              teamA: Object.values(CRICKET_TEAM_NAMES)[Math.floor(Math.random() * Object.values(CRICKET_TEAM_NAMES).length)],
              teamB: Object.values(CRICKET_TEAM_NAMES)[Math.floor(Math.random() * Object.values(CRICKET_TEAM_NAMES).length)],
              time: `${12 + Math.floor(Math.random() * 8)}:${Math.floor(Math.random() * 6)}0`,
              date: 'Tomorrow',
              isLive: false,
              odds: {
                teamA: 1.8 + Math.random() * 0.4,
                draw: 3.0 + Math.random() * 1.0,
                teamB: 1.8 + Math.random() * 0.4
              }
            });
          });
          
          // Football fixtures
          FOOTBALL_LEAGUES.forEach((league, idx) => {
            tomorrowFixtures.push({
              id: 20000 + idx,
              sport: 'football' as const,
              league: league.name,
              teamA: ['Arsenal', 'Manchester City', 'Liverpool', 'Chelsea', 'Manchester United'][Math.floor(Math.random() * 5)],
              teamB: ['Tottenham', 'Newcastle', 'Aston Villa', 'Brighton', 'West Ham'][Math.floor(Math.random() * 5)],
              time: `${12 + Math.floor(Math.random() * 8)}:${Math.floor(Math.random() * 6)}0`,
              date: 'Tomorrow',
              isLive: false,
              odds: {
                teamA: 1.5 + Math.random() * 1.0,
                draw: 3.0 + Math.random() * 1.0,
                teamB: 1.5 + Math.random() * 1.0
              }
            });
          });
          
          // Tennis fixtures
          TENNIS_LEAGUES.slice(0, 3).forEach((league, idx) => {
            tomorrowFixtures.push({
              id: 30000 + idx,
              sport: 'tennis' as const,
              league: league.name,
              teamA: ['Djokovic', 'Nadal', 'Federer', 'Murray', 'Alcaraz'][Math.floor(Math.random() * 5)],
              teamB: ['Zverev', 'Medvedev', 'Sinner', 'Tsitsipas', 'Rublev'][Math.floor(Math.random() * 5)],
              time: `${12 + Math.floor(Math.random() * 8)}:${Math.floor(Math.random() * 6)}0`,
              date: 'Tomorrow',
              isLive: false,
              odds: {
                teamA: 1.5 + Math.random() * 1.0,
                teamB: 1.5 + Math.random() * 1.0
              }
            });
          });
          
          // Basketball fixtures
          BASKETBALL_LEAGUES.forEach((league, idx) => {
            tomorrowFixtures.push({
              id: 40000 + idx,
              sport: 'basketball' as const,
              league: league.name,
              teamA: ['Lakers', 'Celtics', 'Warriors', 'Bucks', 'Heat'][Math.floor(Math.random() * 5)],
              teamB: ['Nets', 'Mavericks', 'Suns', 'Nuggets', 'Raptors'][Math.floor(Math.random() * 5)],
              time: `${12 + Math.floor(Math.random() * 8)}:${Math.floor(Math.random() * 6)}0`,
              date: 'Tomorrow',
              isLive: false,
              odds: {
                teamA: 1.5 + Math.random() * 1.0,
                teamB: 1.5 + Math.random() * 1.0
              }
            });
          });
          
          fetchedMatches = tomorrowFixtures;
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setMatches(fetchedMatches);
        setLoading(false);
      }
    };

    fetchMatches();
    
    // Set up polling for live matches
    let intervalId: NodeJS.Timeout;
    if (activeTab === 'in-play') {
      intervalId = setInterval(() => {
        fetchMatches();
      }, 30000); // Update every 30 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeTab, cricketFootballStatus, basketballStatus]);

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200">
      {/* Tab Bar */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'in-play'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('in-play')}
        >
          In-Play
        </button>
        <button
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'today'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('today')}
        >
          Today
        </button>
        <button
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'tomorrow'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('tomorrow')}
        >
          Tomorrow
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center text-gray-500 p-8">
            <p>No matches available for this selection.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Group by sport */}
            {Object.entries(matchesByCategory).map(([sport, sportMatches]) => (
              <div key={sport} className="space-y-2">
                {/* Sport Header */}
                <div className="bg-blue-600 px-4 py-3 uppercase text-base font-semibold text-white shadow-sm">
                  {sport === 'football' ? 'Soccer' : 
                   sport.charAt(0).toUpperCase() + sport.slice(1)}
                </div>
                
                {/* Match List */}
                <div className="space-y-2">
                  {sportMatches.map(match => (
                    <div key={match.id} className="bg-gray-50 rounded-md p-3 flex flex-col border border-gray-200">
                      <div className="flex items-center justify-between">
                        {/* Match Info */}
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className={`text-sm font-medium ${match.isLive ? 'text-red-600' : 'text-gray-700'}`}>
                              {match.isLive ? 'LIVE' : match.time}
                            </span>
                            <span className="mx-2 text-gray-500">•</span>
                            <span className="text-xs text-gray-700">{match.league}</span>
                          </div>
                          <div className="mt-1 font-medium text-gray-800">{match.teamA} v {match.teamB}</div>
                          {match.stats && (
                            <div className="mt-1 text-sm text-gray-700">
                              {match.stats.teamAScore} - {match.stats.teamBScore} 
                              {match.stats.period && <span className="ml-2">{match.stats.period}</span>}
                            </div>
                          )}
                        </div>
                        
                        {/* Odds */}
                        <div className="flex flex-col items-end">
                          {/* Labels */}
                          <div className="flex space-x-4 mb-1">
                            <div className="text-xs text-gray-700 w-20 text-center">1</div>
                            {match.odds.draw !== undefined && (
                              <div className="text-xs text-gray-700 w-20 text-center">X</div>
                            )}
                            <div className="text-xs text-gray-700 w-20 text-center">2</div>
                          </div>
                          
                          {/* Betting boxes with amounts */}
                          <div className="flex space-x-4">
                            {/* Box for "1" - Home team */}
                            <div className="flex flex-col">
                              <div className="flex cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const isSelected = selectedBet?.matchId === match.id && selectedBet?.betType === '1';
                                  setSelectedBet(isSelected ? null : { 
                                    teamName: match.teamA, 
                                    odds: 1.14, 
                                    matchId: match.id, 
                                    betType: '1' 
                                  });
                                }}>
                                <div className="w-10 h-10 bg-blue-50 rounded-tl-md rounded-bl-md border border-blue-300 flex justify-center items-center">
                                  <span className="text-blue-700 font-bold text-lg">1.14</span>
                                </div>
                                <div className="w-10 h-10 bg-pink-100 rounded-tr-md rounded-br-md border border-pink-200 flex justify-center items-center">
                                  <span className="text-pink-700 font-bold text-lg">1.16</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Box for "X" - Draw */}
                            {match.odds.draw !== undefined && (
                              <div className="flex flex-col">
                                <div className="flex cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const isSelected = selectedBet?.matchId === match.id && selectedBet?.betType === 'X';
                                    setSelectedBet(isSelected ? null : { 
                                      teamName: "Draw", 
                                      odds: 0.0, 
                                      matchId: match.id, 
                                      betType: 'X' 
                                    });
                                  }}>
                                  <div className="w-10 h-10 bg-blue-50 rounded-tl-md rounded-bl-md border border-blue-300 flex justify-center items-center">
                                    <span className="text-blue-700 font-bold text-lg">0.0</span>
                                  </div>
                                  <div className="w-10 h-10 bg-pink-100 rounded-tr-md rounded-br-md border border-pink-200 flex justify-center items-center">
                                    <span className="text-pink-700 font-bold text-lg">0.0</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Box for "2" - Away team */}
                            <div className="flex flex-col">
                              <div className="flex cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const isSelected = selectedBet?.matchId === match.id && selectedBet?.betType === '2';
                                  setSelectedBet(isSelected ? null : { 
                                    teamName: match.teamB, 
                                    odds: 7.2, 
                                    matchId: match.id, 
                                    betType: '2' 
                                  });
                                }}>
                                <div className="w-10 h-10 bg-blue-50 rounded-tl-md rounded-bl-md border border-blue-300 flex justify-center items-center">
                                  <span className="text-blue-700 font-bold text-lg">7.2</span>
                                </div>
                                <div className="w-10 h-10 bg-pink-100 rounded-tr-md rounded-br-md border border-pink-200 flex justify-center items-center">
                                  <span className="text-pink-700 font-bold text-lg">8</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Inline Betting Slip - Only show if this match's bet is selected */}
                      {selectedBet && selectedBet.matchId === match.id && (
                        <div className="mt-4 bg-white border border-gray-300 rounded-md overflow-hidden shadow-sm">
                          {/* Header */}
                          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-gray-50">
                            <div className="text-gray-800 font-medium">
                              {selectedBet.teamName} • {selectedBet.betType === '1' ? 'Win' : selectedBet.betType === '2' ? 'Win' : 'Draw'}
                            </div>
                            <div className="flex items-center">
                              <div className="flex items-center bg-white rounded-md border border-gray-300 mr-4">
                                <button className="text-gray-800 px-2 py-1">−</button>
                                <span className="text-gray-800 px-3 py-1 font-bold">{selectedBet.odds.toFixed(2)}</span>
                                <button className="text-gray-800 px-2 py-1">+</button>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBet(null);
                                }}
                                className="text-gray-500 hover:text-gray-800"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                          
                          {/* Main content */}
                          <div className="p-4">
                            {/* Stake and Profit Section */}
                            <div className="flex justify-between items-center mb-4">
                              <div>
                                <div className="text-gray-600 text-sm mb-1">Stake (₹)</div>
                                <input
                                  type="text"
                                  placeholder="0"
                                  className="bg-white border-2 border-blue-400 rounded w-40 h-12 px-3 text-gray-800 text-xl text-center focus:outline-none focus:ring-0"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              
                              <div className="text-right">
                                <div className="text-gray-600 text-sm mb-1">Profit</div>
                                <div className="text-gray-800 font-bold text-xl">₹0.00</div>
                              </div>
                            </div>
                            
                            {/* Quick Stake Buttons */}
                            <div className="grid grid-cols-6 gap-2 mb-4">
                              {[100, 200, 500, 1000, 5000, 10000].map(amount => (
                                <button
                                  key={amount}
                                  className="bg-gray-100 border border-gray-200 text-gray-800 text-xs py-2 rounded hover:bg-gray-200"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  ₹{amount.toLocaleString()}
                                </button>
                              ))}
                            </div>
                            
                            {/* Place Bet Button */}
                            <button 
                              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md w-full font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Place Bet
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InPlayGamesPanel; 