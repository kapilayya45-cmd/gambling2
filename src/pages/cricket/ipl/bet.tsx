import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { CricketFixture, CRICKET_TEAM_NAMES } from '@/services/cricketApi';
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

// Player filter option interface
interface FilterOption {
  id: string;
  name: string;
}

// Scoreboard interface (for the extended CricketFixture)
interface Scoreboard {
  team_id: number;
  type: string;
  total: number;
  wickets: number;
  overs: number;
}

// Main IPL Bets Page component
export default function IPLBetsPage() {
  const router = useRouter();
  const { team } = router.query;
  
  // If team name from URL contains dashes, convert to spaces for display
  const teamNameForDisplay = typeof team === 'string' 
    ? team.replace(/-/g, ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    : '';
    
  // Keep original slug format for filtering
  const teamName = typeof team === 'string' ? team : '';
  
  // Log the team name to check what we're getting
  useEffect(() => {
    if (team) {
      console.log('Team from URL:', team);
      console.log('Formatted team name:', teamNameForDisplay);
    }
  }, [team, teamNameForDisplay]);
  
  // Use the custom hook for live odds data
  const { matches, loading, error } = useLiveOdds();
  
  const [filteredMatches, setFilteredMatches] = useState<CricketFixture[]>([]);
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
  
  // Mock players for filtering
  const availablePlayers: FilterOption[] = [
    { id: 'p1', name: 'Virat Kohli' },
    { id: 'p2', name: 'Rohit Sharma' },
    { id: 'p3', name: 'MS Dhoni' },
    { id: 'p4', name: 'KL Rahul' },
    { id: 'p5', name: 'Jasprit Bumrah' },
    { id: 'p6', name: 'Ravindra Jadeja' },
    { id: 'p7', name: 'Rishabh Pant' },
    { id: 'p8', name: 'Hardik Pandya' },
  ];

  // Function to check if a team is part of a match
  const isTeamInMatch = (teamName: string, match: CricketFixture): boolean => {
    if (!teamName) return true; // If no team specified, return all matches
    
    const normalizedTeamName = teamName.toLowerCase().replace(/-/g, ' ');
    
    // First check if we have team name from included data in the API response
    let teamA = '';
    let teamB = '';
    
    // Try to get team names from API-included data first
    if (match.localteam && typeof match.localteam === 'object' && match.localteam.name) {
      teamA = match.localteam.name;
    } else {
      // Fall back to mapping
      teamA = CRICKET_TEAM_NAMES[match.localteam_id] || '';
    }
    
    if (match.visitorteam && typeof match.visitorteam === 'object' && match.visitorteam.name) {
      teamB = match.visitorteam.name;
    } else {
      // Fall back to mapping
      teamB = CRICKET_TEAM_NAMES[match.visitorteam_id] || '';
    }
    
    console.log(`Checking if "${normalizedTeamName}" is part of "${teamA.toLowerCase()}" or "${teamB.toLowerCase()}"`);
    
    return (
      teamA.toLowerCase().includes(normalizedTeamName) || 
      teamB.toLowerCase().includes(normalizedTeamName)
    );
  };

  // Filter matches when team name or matches change
  useEffect(() => {
    if (matches.length === 0) return;
    
    console.log(`Filtering for team: ${teamName}`);
    console.log(`Available matches:`, matches.map(m => `${CRICKET_TEAM_NAMES[m.localteam_id]} vs ${CRICKET_TEAM_NAMES[m.visitorteam_id]}`));
    
    // If team is specified, filter for that team's matches
    const matchesToShow = teamName 
      ? matches.filter(match => isTeamInMatch(teamName, match))
      : matches;
    
    console.log(`Filtered matches:`, matchesToShow.length);
    setFilteredMatches(matchesToShow);
    
    // Set the first match as selected if we have matches and none selected
    if (matchesToShow.length > 0 && !selectedMatch) {
      setSelectedMatch(matchesToShow[0]);
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

  // Helper function to get team name display
  const getTeamName = (teamId: number, match: CricketFixture): string => {
    // Try to get team names from API-included data first
    if (match.localteam && match.localteam_id === teamId && match.localteam.name) {
      return match.localteam.name;
    }
    
    if (match.visitorteam && match.visitorteam_id === teamId && match.visitorteam.name) {
      return match.visitorteam.name;
    }
    
    // Fall back to mapping
    return CRICKET_TEAM_NAMES[teamId] || `Team ${teamId}`;
  };

  return (
    <>
      <Head>
        <title>IPL Live Betting - Foxxy</title>
        <meta name="description" content="Live IPL cricket betting" />
      </Head>
      
      <div className="min-h-screen bg-white text-gray-800">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/">
              <div className="text-2xl font-bold text-[#25b95f]">
                FOXXY
              </div>
            </Link>
            
            <div className="flex space-x-4 items-center">
              <div className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-800">
                Balance: ₹{walletBalance.toLocaleString()}
              </div>
              <button 
                onClick={handleDeposit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Deposit
              </button>
              <button 
                onClick={() => setShowBets(!showBets)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                My Bets
              </button>
              <HelpButton onClick={() => setShowChat(!showChat)} />
            </div>
          </div>
        </header>
        
        <main className="container mx-auto p-4 flex flex-col md:flex-row">
          {/* Sidebar with matches */}
          <div className="w-full md:w-64 mb-6 md:mb-0 md:mr-6">
            <div className="mb-4">
              <Link href="/cricket/ipl" className="text-purple-600 hover:text-purple-800 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to all IPL
              </Link>
            </div>
            
            <h2 className="text-xl font-bold mb-4">
              {teamNameForDisplay ? `${teamNameForDisplay} Matches` : 'IPL Matches'}
            </h2>
            
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 text-red-800 p-3 rounded">
                Error loading matches: {error}
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="bg-gray-100 text-gray-600 p-3 rounded">
                No matches found for {teamNameForDisplay || 'IPL'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMatches.map(match => (
                  <button
                    key={match.id}
                    onClick={() => handleSelectMatch(match)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedMatch?.id === match.id
                        ? 'bg-purple-100 border border-purple-300'
                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">
                      {getTeamName(match.localteam_id, match)} vs {getTeamName(match.visitorteam_id, match)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {new Date(match.starting_at).toLocaleDateString()} - {match.venue?.name || 'TBD'}
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* Filter Panel */}
            <div className="mt-6">
              <FilterPanel 
                availableMarkets={availableMarkets}
                availablePlayers={availablePlayers}
                activeFilters={activeFilters}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          
          {/* Main content area */}
          <div className="flex-1">
            {/* Selected match details */}
            {selectedMatch ? (
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-6">
                <h1 className="text-2xl font-bold mb-2">
                  {getTeamName(selectedMatch.localteam_id, selectedMatch)} vs {getTeamName(selectedMatch.visitorteam_id, selectedMatch)}
                </h1>
                <div className="text-gray-600">
                  {new Date(selectedMatch.starting_at).toLocaleString()} at {selectedMatch.venue?.name || 'TBD'}
                </div>
                {selectedMatch.status === 'live' && (
                  <div className="mt-2 px-2 py-1 bg-green-100 text-green-800 inline-block rounded text-sm">
                    LIVE
                  </div>
                )}
                
                {/* Innings summary - check if scoreboards exists first */}
                {selectedMatch.scoreboards && Array.isArray(selectedMatch.scoreboards) && selectedMatch.scoreboards.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedMatch.scoreboards.map((scoreboard: Scoreboard, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200">
                        <div className="font-medium">
                          {getTeamName(scoreboard.team_id, selectedMatch)} - {scoreboard.type}
                        </div>
                        <div className="text-xl font-bold mt-1">
                          {scoreboard.total}/{scoreboard.wickets} ({scoreboard.overs})
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-100 text-gray-600 p-8 rounded-lg text-center">
                Select a match to view betting markets
              </div>
            )}
            
            {/* Betting markets */}
            {selectedMatch && (
              <>
                <MarketTabs 
                  activeMarket={selectedMarket}
                  availableMarkets={activeFilters.markets}
                  onSelectMarket={handleSelectMarket}
                />
                
                <div className="mt-4">
                  <CricketOddsGrid
                    match={selectedMatch}
                    market={selectedMarket}
                    playerFilters={activeFilters.players}
                    onPlaceBet={handlePlaceBet}
                  />
                </div>
              </>
            )}
          </div>
        </main>
        
        {/* Placed bets drawer */}
        {showBets && (
          <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-50 flex justify-end">
            <div className="w-full max-w-md bg-white h-full p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">My Bets</h2>
                <button 
                  onClick={() => setShowBets(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {placedBets.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  You haven't placed any bets yet
                </div>
              ) : (
                <div className="space-y-4">
                  {placedBets.map(bet => (
                    <div key={bet.betId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="font-medium">{bet.selection}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {bet.market} @ {bet.odds} ({bet.side})
                      </div>
                      <div className="flex justify-between mt-2 text-sm">
                        <span className="text-gray-600">Stake: ₹{bet.stake}</span>
                        <span className="font-medium">Potential Win: ₹{bet.potentialWin.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Placed: {bet.placedAt.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Chat widget */}
        {showChat && <HelpChatWidget onClose={() => setShowChat(false)} />}
      </div>
    </>
  );
} 