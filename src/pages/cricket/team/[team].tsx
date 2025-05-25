import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CricketFixture, CRICKET_TEAM_NAMES, fetchCricketLivescores } from '@/services/cricketApi';
import { useLiveOdds } from '@/hooks/useLiveOdds';
import MarketTabs, { BettingMarket } from '@/components/cricket/MarketTabs';
import CricketOddsGrid from '@/components/cricket/CricketOddsGrid';
import FilterPanel from '@/components/cricket/FilterPanel';
import { HelpButton, default as HelpChatWidget } from '@/components/cricket/HelpChatWidget';

// Interface for bet selection
interface BetSelection {
  selectionId: string;
  matchId: number;
  eventId: number;
  selection: string;
  market: BettingMarket;
  odds: number;
  side: 'back' | 'lay';
  stake: number;
}

// Interface for placed bet
interface PlacedBet extends BetSelection {
  betId: string;
  placedAt: Date;
  potentialWin: number;
}

// Un-slugify a team name from the URL
const unslugify = (slug: string): string => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Function to check if a team is part of a match
const isTeamInMatch = (teamName: string, match: CricketFixture): boolean => {
  const normalizedTeamName = teamName.toLowerCase();
  
  // Get team names from the mapping
  const teamA = CRICKET_TEAM_NAMES[match.localteam_id] || '';
  const teamB = CRICKET_TEAM_NAMES[match.visitorteam_id] || '';
  
  return (
    teamA.toLowerCase().includes(normalizedTeamName) || 
    teamB.toLowerCase().includes(normalizedTeamName)
  );
};

// Main Team Specific Bets Page component
const TeamBetsPage: React.FC = () => {
  const router = useRouter();
  const { team } = router.query;
  const teamName = typeof team === 'string' ? unslugify(team) : '';
  
  // Use the custom hook for live odds data
  const { matches, loading, error } = useLiveOdds();
  
  const [teamMatches, setTeamMatches] = useState<CricketFixture[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<CricketFixture | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<BettingMarket>('match-winner');
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>([]);
  const [walletBalance, setWalletBalance] = useState(10000); // Mock wallet balance
  const [showChat, setShowChat] = useState(false);
  const [showBets, setShowBets] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{
    markets: BettingMarket[];
    players: string[];
  }>({
    markets: ['match-winner', 'top-batsman', 'top-bowler', 'over-under', 'session', 'next-wicket', 'dismissal-method'],
    players: []
  });

  // Available markets for filtering
  const availableMarkets: BettingMarket[] = [
    'match-winner', 
    'top-batsman', 
    'top-bowler', 
    'over-under', 
    'session', 
    'next-wicket', 
    'dismissal-method'
  ];
  
  // Mock players for filtering - can be made team-specific in the future
  const availablePlayers = [
    { id: 'p1', name: 'Virat Kohli' },
    { id: 'p2', name: 'Rohit Sharma' },
    { id: 'p3', name: 'MS Dhoni' },
    { id: 'p4', name: 'KL Rahul' },
    { id: 'p5', name: 'Jasprit Bumrah' },
    { id: 'p6', name: 'Ravindra Jadeja' },
    { id: 'p7', name: 'Rishabh Pant' },
    { id: 'p8', name: 'Hardik Pandya' },
  ];

  // Filter matches for this team when the team name or matches change
  useEffect(() => {
    if (!teamName || matches.length === 0) return;
    
    const filteredMatches = matches.filter(match => 
      isTeamInMatch(teamName, match)
    );
    
    setTeamMatches(filteredMatches);
    
    // Set the first match as selected if we have matches and none selected
    if (filteredMatches.length > 0 && !selectedMatch) {
      setSelectedMatch(filteredMatches[0]);
    }
  }, [teamName, matches, selectedMatch]);

  // Handle selection of a match
  const handleSelectMatch = (match: CricketFixture) => {
    setSelectedMatch(match);
  };

  // Handle selection of a market
  const handleSelectMarket = (market: BettingMarket) => {
    setSelectedMarket(market);
  };

  // Handle placing a bet
  const handlePlaceBet = (selection: BetSelection) => {
    const placedBet: PlacedBet = {
      ...selection,
      selectionId: `${selection.matchId}_${selection.selection}_${Date.now()}`,
      betId: `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      placedAt: new Date(),
      potentialWin: selection.stake * selection.odds
    };
    
    // Add the bet to the placed bets list
    setPlacedBets([...placedBets, placedBet]);
    
    // Deduct stake from wallet balance
    setWalletBalance(prev => prev - selection.stake);
    
    // Show a success message
    alert(`Bet placed successfully on ${selection.selection} for ₹${selection.stake}`);
  };
  
  // Handle filter changes
  const handleFilterChange = (filters: { markets: BettingMarket[], players: string[] }) => {
    setActiveFilters(filters);
    
    // If current selected market is not in filtered markets, select first available
    if (!filters.markets.includes(selectedMarket) && filters.markets.length > 0) {
      setSelectedMarket(filters.markets[0]);
    }
  };
  
  // Mock deposit and withdraw functions
  const handleDeposit = () => {
    alert('Deposit functionality would be integrated with a payment gateway.');
  };
  
  const handleWithdraw = () => {
    alert('Withdraw functionality would be integrated with a payment gateway.');
  };

  return (
    <>
      <Head>
        <title>{teamName} Cricket Betting - Foxxy</title>
        <meta name="description" content={`Live cricket betting for ${teamName} matches`} />
      </Head>
      
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <header className="bg-[#0a0d14] border-b border-[#1a2030] p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/">
              <div className="text-2xl font-bold text-[#25b95f]">
                FOXXY
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">Balance: ₹{walletBalance.toLocaleString()}</span>
              <button 
                className="bg-[#25b95f] text-white px-3 py-1 rounded"
                onClick={handleDeposit}
              >
                Deposit
              </button>
              <button 
                className={`px-3 py-1 rounded ${showBets ? 'bg-[#25b95f] text-white' : 'bg-[#1a2030] text-gray-300'}`}
                onClick={() => setShowBets(!showBets)}
              >
                My Bets {placedBets.length > 0 && `(${placedBets.length})`}
              </button>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto py-6 px-4">
          {/* Breadcrumb navigation */}
          <div className="mb-6">
            <div className="flex items-center text-sm">
              <Link href="/" className="text-gray-400 hover:text-white">Home</Link>
              <span className="mx-2 text-gray-600">/</span>
              <Link href="/cricket" className="text-gray-400 hover:text-white">Cricket</Link>
              <span className="mx-2 text-gray-600">/</span>
              <Link href="/cricket/team" className="text-gray-400 hover:text-white">Teams</Link>
              <span className="mx-2 text-gray-600">/</span>
              <span className="text-white">{teamName}</span>
            </div>
          </div>
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{teamName} Cricket Betting</h1>
            <p className="text-gray-400 mt-1">Place bets on upcoming and live {teamName} matches</p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#25b95f] mx-auto mb-4"></div>
              <p>Loading matches...</p>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-900 p-4 rounded-lg mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          ) : teamMatches.length === 0 ? (
            <div className="bg-[#0a0d14] border border-[#1a2030] p-6 rounded-lg text-center">
              <p className="text-gray-400">No upcoming matches found for {teamName}</p>
              <Link href="/cricket" className="mt-4 inline-block bg-[#25b95f] text-white px-4 py-2 rounded">
                View All Cricket Matches
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left sidebar - Match selection */}
              <div className="lg:col-span-1">
                <h2 className="text-xl font-bold mb-4">{teamName} Matches</h2>
                <div className="space-y-4">
                  {teamMatches.map(match => (
                    <div 
                      key={match.id}
                      onClick={() => handleSelectMatch(match)}
                      className={`
                        p-3 rounded-lg cursor-pointer transition
                        ${selectedMatch?.id === match.id ? 'bg-[#0a0d14] border border-[#25b95f]/50' : 'bg-[#0a0d14] border border-[#1a2030] hover:border-[#25b95f]/30'}
                      `}
                    >
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-400">
                          {new Date(match.starting_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        {match.status === 'live' && (
                          <span className="px-1.5 py-0.5 bg-red-600 text-white text-xs rounded-full flex items-center">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-1"></span>
                            LIVE
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-medium">{CRICKET_TEAM_NAMES[match.localteam_id]}</span>
                        <span className="mx-2 text-gray-400">vs</span>
                        <span className="font-medium">{CRICKET_TEAM_NAMES[match.visitorteam_id]}</span>
                      </div>
                      {match.status === 'live' && (
                        <div className="mt-2 pt-2 border-t border-[#1a2030] flex justify-between">
                          <span className="text-sm">{match.localteam_score || '0/0'}</span>
                          <span className="text-sm">{match.visitorteam_score || '0/0'}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Main content - Betting area */}
              <div className="lg:col-span-3">
                {showBets ? (
                  <div className="bg-[#0a0d14] border border-[#1a2030] rounded-lg p-4 shadow-lg">
                    <h2 className="text-xl font-bold mb-4">My Bets</h2>
                    {placedBets.length === 0 ? (
                      <div className="text-center text-gray-400 py-12">
                        <p>You have no active bets</p>
                        <p className="text-sm mt-2">Place a bet to see it here</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-white border-collapse">
                          <thead>
                            <tr>
                              <th className="sticky top-0 bg-[#1a1f2c] text-gray-300 font-semibold py-3 px-4 text-left border-b border-gray-700">
                                Selection
                              </th>
                              <th className="sticky top-0 bg-[#1a1f2c] text-gray-300 font-semibold py-3 px-4 text-center border-b border-gray-700">
                                Market
                              </th>
                              <th className="sticky top-0 bg-[#1a1f2c] text-gray-300 font-semibold py-3 px-4 text-center border-b border-gray-700">
                                Odds
                              </th>
                              <th className="sticky top-0 bg-[#1a1f2c] text-gray-300 font-semibold py-3 px-4 text-center border-b border-gray-700">
                                Stake
                              </th>
                              <th className="sticky top-0 bg-[#1a1f2c] text-gray-300 font-semibold py-3 px-4 text-center border-b border-gray-700">
                                Potential Win
                              </th>
                              <th className="sticky top-0 bg-[#1a1f2c] text-gray-300 font-semibold py-3 px-4 text-center border-b border-gray-700">
                                Placed At
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {placedBets.map((bet, index) => (
                              <tr key={bet.betId} className={index % 2 === 0 ? 'bg-black' : 'bg-[#0a0d14]'}>
                                <td className="py-3 px-4 text-left border-b border-gray-700">
                                  <div className="font-medium">{bet.selection}</div>
                                  <div className="text-xs text-gray-400">
                                    {bet.side === 'back' ? 'Back' : 'Lay'}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center border-b border-gray-700">
                                  {bet.market}
                                </td>
                                <td className="py-3 px-4 text-center border-b border-gray-700">
                                  <span className={`font-medium ${bet.side === 'back' ? 'text-[#25b95f]' : 'text-[#e53935]'}`}>
                                    {bet.odds.toFixed(2)}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center border-b border-gray-700">
                                  ₹{bet.stake.toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-center border-b border-gray-700">
                                  <span className="text-[#25b95f]">
                                    ₹{bet.potentialWin.toLocaleString()}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center border-b border-gray-700">
                                  <span className="text-sm">
                                    {bet.placedAt.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : selectedMatch ? (
                  <div className="space-y-4">
                    {/* Filters */}
                    <FilterPanel
                      markets={availableMarkets}
                      players={availablePlayers}
                      onFilterChange={handleFilterChange}
                    />
                    
                    {/* Market tabs - only show markets that are in the active filters */}
                    <MarketTabs 
                      selectedMarket={selectedMarket}
                      onSelectMarket={handleSelectMarket}
                    />
                    
                    {/* Betting grid and other content */}
                    <CricketOddsGrid 
                      match={selectedMatch}
                      market={selectedMarket}
                      onSelectOdds={handlePlaceBet}
                    />
                  </div>
                ) : (
                  <div className="bg-[#0a0d14] border border-[#1a2030] rounded-lg p-6 text-center">
                    <p className="text-gray-400">Select a match to start betting</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Help chat widget */}
      {showChat && <HelpChatWidget onClose={() => setShowChat(false)} />}
      {!showChat && <HelpButton onClick={() => setShowChat(true)} />}
    </>
  );
};

export default TeamBetsPage; 