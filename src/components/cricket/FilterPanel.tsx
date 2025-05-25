import React, { useState } from 'react';
import { BettingMarket } from './MarketTabs';

interface FilterOption {
  id: string;
  name: string;
}

interface FilterPanelProps {
  markets: BettingMarket[];
  players: FilterOption[];
  onFilterChange: (filters: {
    markets: BettingMarket[];
    players: string[];
  }) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  markets, 
  players, 
  onFilterChange 
}) => {
  const [selectedMarkets, setSelectedMarkets] = useState<BettingMarket[]>(markets);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Market display names 
  const MARKET_NAMES: Record<BettingMarket, string> = {
    'match-winner': 'Match Winner',
    'top-batsman': 'Top Batsman',
    'top-bowler': 'Top Bowler',
    'over-under': 'Over/Under',
    'session': 'Session Betting',
    'next-wicket': 'Next Wicket',
    'dismissal-method': 'Dismissal Method',
  };
  
  const handleMarketToggle = (market: BettingMarket) => {
    const updatedMarkets = selectedMarkets.includes(market)
      ? selectedMarkets.filter(m => m !== market)
      : [...selectedMarkets, market];
    
    setSelectedMarkets(updatedMarkets);
    onFilterChange({
      markets: updatedMarkets,
      players: selectedPlayers
    });
  };
  
  const handlePlayerToggle = (playerId: string) => {
    const updatedPlayers = selectedPlayers.includes(playerId)
      ? selectedPlayers.filter(p => p !== playerId)
      : [...selectedPlayers, playerId];
    
    setSelectedPlayers(updatedPlayers);
    onFilterChange({
      markets: selectedMarkets,
      players: updatedPlayers
    });
  };
  
  const clearFilters = () => {
    setSelectedMarkets(markets);
    setSelectedPlayers([]);
    onFilterChange({
      markets,
      players: []
    });
  };
  
  return (
    <div className="bg-[#0a0d14] border border-[#1a2030] rounded-lg overflow-hidden mb-6">
      {/* Header */}
      <div 
        className="bg-black px-4 py-3 border-b border-[#1a2030] flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-medium text-white">Filters</h3>
        <div className="flex items-center">
          {(selectedMarkets.length < markets.length || selectedPlayers.length > 0) && (
            <span className="bg-[#25b95f] text-white text-xs rounded-full px-2 py-0.5 mr-2">
              {(markets.length - selectedMarkets.length) + selectedPlayers.length}
            </span>
          )}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Filter body - only shown when expanded */}
      {isExpanded && (
        <div className="p-4">
          {/* Markets section */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Betting Markets</h4>
            <div className="grid grid-cols-2 gap-2">
              {markets.map(market => (
                <div key={market} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`market-${market}`}
                    checked={selectedMarkets.includes(market)}
                    onChange={() => handleMarketToggle(market)}
                    className="mr-2 h-4 w-4 text-[#25b95f] rounded border-[#1a2030] focus:ring-[#25b95f] bg-black"
                  />
                  <label htmlFor={`market-${market}`} className="text-sm text-white">
                    {MARKET_NAMES[market]}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Players section */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Players</h4>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
              {players.map(player => (
                <div key={player.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`player-${player.id}`}
                    checked={selectedPlayers.includes(player.id)}
                    onChange={() => handlePlayerToggle(player.id)}
                    className="mr-2 h-4 w-4 text-[#25b95f] rounded border-[#1a2030] focus:ring-[#25b95f] bg-black"
                  />
                  <label htmlFor={`player-${player.id}`} className="text-sm text-white truncate">
                    {player.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-400 hover:text-white px-3 py-1"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel; 