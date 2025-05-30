import React from 'react';

export type BettingMarket = 
  | 'match-winner'
  | 'top-batsman'
  | 'top-bowler'
  | 'over-under'
  | 'session'
  | 'next-wicket'
  | 'dismissal-method';

const MARKET_NAMES: Record<BettingMarket, string> = {
  'match-winner': 'Match Winner',
  'top-batsman': 'Top Batsman',
  'top-bowler': 'Top Bowler',
  'over-under': 'Over/Under',
  'session': 'Session Betting',
  'next-wicket': 'Next Wicket',
  'dismissal-method': 'Dismissal Method',
};

interface MarketTabsProps {
  activeMarket: BettingMarket;
  availableMarkets: BettingMarket[];
  onSelectMarket: (market: BettingMarket) => void;
}

const MarketTabs: React.FC<MarketTabsProps> = ({ 
  activeMarket, 
  availableMarkets,
  onSelectMarket
}) => {
  return (
    <div className="mb-6">
      {/* Desktop view: Tabs */}
      <div className="hidden md:block">
        <div className="border-b border-gray-200 mb-4">
          <div className="flex overflow-x-auto hide-scrollbar">
            {availableMarkets.map(market => (
              <button
                key={market}
                onClick={() => onSelectMarket(market)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap focus:outline-none
                  ${activeMarket === market 
                    ? 'text-purple-600 border-b-2 border-purple-600' 
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {MARKET_NAMES[market]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile view: Dropdown */}
      <div className="md:hidden mb-4">
        <select
          value={activeMarket}
          onChange={(e) => onSelectMarket(e.target.value as BettingMarket)}
          className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-600"
        >
          {availableMarkets.map(market => (
            <option key={market} value={market}>
              {MARKET_NAMES[market]}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {MARKET_NAMES[activeMarket]}
        </h2>
        
        {/* Odds format selector */}
        <div className="flex text-xs">
          <button className="bg-white px-2 py-1 text-gray-800 rounded-l-md border border-gray-300 font-medium">
            Decimal
          </button>
          <button className="bg-gray-50 px-2 py-1 text-gray-600 border-t border-b border-gray-300">
            Fractional
          </button>
          <button className="bg-gray-50 px-2 py-1 text-gray-600 rounded-r-md border border-gray-300">
            American
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketTabs;

// Add this to your global CSS for hiding scrollbars while allowing scrolling
// .hide-scrollbar::-webkit-scrollbar { display: none; } 