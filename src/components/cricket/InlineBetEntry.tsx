import React, { useState } from 'react';
import { BettingMarket } from './MarketTabs';

interface InlineBetEntryProps {
  selection: string;
  market: BettingMarket;
  odds: number;
  side: 'back' | 'lay';
  onCancel: () => void;
  onPlaceBet: (betData: {
    selection: string;
    market: BettingMarket;
    side: 'back' | 'lay';
    odds: number;
    stake: number;
  }) => void;
}

const InlineBetEntry: React.FC<InlineBetEntryProps> = ({
  selection,
  market,
  odds: initialOdds,
  side,
  onCancel,
  onPlaceBet
}) => {
  const [stake, setStake] = useState<number>(0);
  const [odds, setOdds] = useState<number>(initialOdds);
  
  // Quick stake options
  const quickStakeOptions = [100, 200, 500, 1000, 5000, 10000];
  
  // Increment/decrement odds
  const adjustOdds = (increment: boolean) => {
    const step = 0.01;
    const newOdds = increment ? odds + step : odds - step;
    // Ensure odds don't go below 1.01
    setOdds(Math.max(1.01, parseFloat(newOdds.toFixed(2))));
  };
  
  // Apply a quick stake
  const applyQuickStake = (amount: number) => {
    setStake(amount);
  };
  
  // Handle stake input change
  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setStake(isNaN(value) ? 0 : value);
  };
  
  // Handle place bet
  const handlePlaceBet = () => {
    if (stake > 0) {
      onPlaceBet({
        selection,
        market,
        side,
        odds,
        stake
      });
    }
  };
  
  // Calculate potential profit
  const potentialProfit = stake * odds - stake;
  
  return (
    <div className="bg-gray-100 border-t border-gray-200 p-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-shrink-0">
          <button
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm"
          >
            Cancel
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-gray-700 text-sm">{selection} • {side === 'back' ? 'Back' : 'Lay'}</span>
          <div className="flex items-center bg-white border border-gray-300 rounded">
            <button
              onClick={() => adjustOdds(false)}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-l"
            >
              –
            </button>
            <span className={`px-3 py-1 font-bold ${side === 'back' ? 'text-blue-600' : 'text-red-600'}`}>
              {odds.toFixed(2)}
            </span>
            <button
              onClick={() => adjustOdds(true)}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-r"
            >
              +
            </button>
          </div>
          
          <div>
            <div className="text-xs text-gray-600 mb-1">Stake (₹)</div>
            <input
              type="number"
              value={stake || ''}
              onChange={handleStakeChange}
              className="w-24 bg-white border border-gray-300 rounded py-1 px-2 text-gray-800 text-right"
              placeholder="0"
              min="0"
            />
          </div>
          
          <div>
            <div className="text-xs text-gray-600 mb-1">Profit</div>
            <div className="text-green-600 font-bold">
              ₹{potentialProfit.toFixed(2)}
            </div>
          </div>
          
          <button
            onClick={handlePlaceBet}
            disabled={stake <= 0}
            className={`
              px-4 py-2 rounded font-medium text-white
              ${stake > 0 
                ? `${side === 'back' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}` 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
            `}
          >
            Place Bet
          </button>
        </div>
      </div>
      
      {/* Quick stake buttons */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {quickStakeOptions.map(amount => (
          <button
            key={amount}
            onClick={() => applyQuickStake(amount)}
            className="bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1 rounded text-sm text-gray-700"
          >
            ₹{amount.toLocaleString()}
          </button>
        ))}
      </div>
    </div>
  );
};

export default InlineBetEntry; 