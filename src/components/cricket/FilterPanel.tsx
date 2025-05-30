import React, { useState } from 'react';
import { BettingMarket } from './MarketTabs';

interface FilterOption {
  id: string;
  name: string;
}

interface FilterPanelProps {
  availableMarkets: BettingMarket[];
  availablePlayers: FilterOption[];
  activeFilters: {
    markets: BettingMarket[];
    players: string[];
  };
  onChange: (filters: {
    markets: BettingMarket[];
    players: string[];
  }) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  availableMarkets, 
  availablePlayers, 
  activeFilters,
  onChange 
}) => {
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
    const updatedMarkets = activeFilters.markets.includes(market)
      ? activeFilters.markets.filter(m => m !== market)
      : [...activeFilters.markets, market];
    
    onChange({
      markets: updatedMarkets,
      players: activeFilters.players
    });
  };
  
  const handlePlayerToggle = (playerId: string) => {
    const updatedPlayers = activeFilters.players.includes(playerId)
      ? activeFilters.players.filter(p => p !== playerId)
      : [...activeFilters.players, playerId];
    
    onChange({
      markets: activeFilters.markets,
      players: updatedPlayers
    });
  };
  
  const clearFilters = () => {
    onChange({
      markets: availableMarkets,
      players: []
    });
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6 shadow-sm">
      {/* Header */}
      <div 
        className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-medium text-gray-800">Filters</h3>
        <div className="flex items-center">
          {(activeFilters.markets.length < availableMarkets.length || activeFilters.players.length > 0) && (
            <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-0.5 mr-2">
              {(availableMarkets.length - activeFilters.markets.length) + activeFilters.players.length}
            </span>
          )}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 text-gray-500 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
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
            <h4 className="text-sm font-medium text-gray-600 mb-2">Betting Markets</h4>
            <div className="grid grid-cols-2 gap-2">
              {availableMarkets.map(market => (
                <div key={market} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`market-${market}`}
                    checked={activeFilters.markets.includes(market)}
                    onChange={() => handleMarketToggle(market)}
                    className="mr-2 h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <label htmlFor={`market-${market}`} className="text-sm text-gray-700">
                    {MARKET_NAMES[market]}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Players section */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Players</h4>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
              {availablePlayers.map(player => (
                <div key={player.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`player-${player.id}`}
                    checked={activeFilters.players.includes(player.id)}
                    onChange={() => handlePlayerToggle(player.id)}
                    className="mr-2 h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <label htmlFor={`player-${player.id}`} className="text-sm text-gray-700 truncate">
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
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1"
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