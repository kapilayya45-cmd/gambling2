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
  onChangeMarket: (market: BettingMarket) => void;
}

const MarketTabs: React.FC<MarketTabsProps> = ({ activeMarket, onChangeMarket }) => {
  const marketKeys = Object.keys(MARKET_NAMES) as BettingMarket[];
  
  return (
    <div className="mb-6">
      {/* Desktop view: Tabs */}
      <div className="hidden md:block">
        <div className="border-b border-[#2a3040] mb-4">
          <div className="flex overflow-x-auto hide-scrollbar">
            {marketKeys.map(market => (
              <button
                key={market}
                onClick={() => onChangeMarket(market)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap focus:outline-none
                  ${activeMarket === market 
                    ? 'text-[#25b95f] border-b-2 border-[#25b95f]' 
                    : 'text-gray-400 hover:text-white'
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
          onChange={(e) => onChangeMarket(e.target.value as BettingMarket)}
          className="w-full bg-[#11151f] border border-[#2a3040] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-[#25b95f]"
        >
          {marketKeys.map(market => (
            <option key={market} value={market}>
              {MARKET_NAMES[market]}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">
          {MARKET_NAMES[activeMarket]}
        </h2>
        
        {/* Odds format selector */}
        <div className="flex text-xs">
          <button className="bg-[#11151f] px-2 py-1 text-white rounded-l-md border border-[#2a3040]">
            Decimal
          </button>
          <button className="bg-[#0f121a] px-2 py-1 text-gray-400 border-t border-b border-[#2a3040]">
            Fractional
          </button>
          <button className="bg-[#0f121a] px-2 py-1 text-gray-400 rounded-r-md border border-[#2a3040]">
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