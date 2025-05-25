import React, { useState } from 'react';

interface InlineBetEntryProps {
  matchId: number;
  selectedOdds: number;
  side: 'back' | 'lay';
  selection: string;
  market: string;
  totalColumns: number;
  onCancel: () => void;
  onPlaceBet: (betData: {
    matchId: number;
    selection: string;
    market: string;
    side: 'back' | 'lay';
    odds: number;
    stake: number;
  }) => void;
}

const InlineBetEntry: React.FC<InlineBetEntryProps> = ({
  matchId,
  selectedOdds,
  side,
  selection,
  market,
  totalColumns,
  onCancel,
  onPlaceBet
}) => {
  const [stake, setStake] = useState<number>(0);
  const [odds, setOdds] = useState<number>(selectedOdds);
  
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
        matchId,
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
    <td colSpan={totalColumns} className="bg-[#11151f] border-t border-gray-700 p-0">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-shrink-0">
            <button
              onClick={onCancel}
              className="bg-[#1a1f2c] hover:bg-[#2a3040] text-white px-3 py-1 rounded text-sm"
            >
              Cancel
            </button>
          </div>
          
          <div className="flex items-center">
            <span className="text-gray-300 text-sm mr-2">{selection} • {side === 'back' ? 'Back' : 'Lay'}</span>
            <div className="flex items-center bg-black border border-gray-700 rounded">
              <button
                onClick={() => adjustOdds(false)}
                className="px-2 py-1 text-gray-300 hover:bg-[#1a1f2c] rounded-l"
              >
                –
              </button>
              <span className={`px-3 py-1 font-bold ${side === 'back' ? 'text-[#25b95f]' : 'text-[#e53935]'}`}>
                {odds.toFixed(2)}
              </span>
              <button
                onClick={() => adjustOdds(true)}
                className="px-2 py-1 text-gray-300 hover:bg-[#1a1f2c] rounded-r"
              >
                +
              </button>
            </div>
            
            <div className="mx-4">
              <div className="text-xs text-gray-400 mb-1">Stake (₹)</div>
              <input
                type="number"
                value={stake || ''}
                onChange={handleStakeChange}
                className="w-24 bg-black border border-gray-700 rounded py-1 px-2 text-white text-right"
                placeholder="0"
                min="0"
              />
            </div>
            
            <div className="mx-4">
              <div className="text-xs text-gray-400 mb-1">Profit</div>
              <div className="text-[#25b95f] font-bold">
                ₹{potentialProfit.toFixed(2)}
              </div>
            </div>
            
            <button
              onClick={handlePlaceBet}
              disabled={stake <= 0}
              className={`
                px-4 py-2 rounded font-medium text-white
                ${stake > 0 
                  ? `${side === 'back' ? 'bg-[#25b95f] hover:bg-[#25b95f]/90' : 'bg-[#e53935] hover:bg-[#e53935]/90'}` 
                  : 'bg-gray-700 cursor-not-allowed'}
              `}
            >
              Place Bet
            </button>
          </div>
        </div>
        
        {/* Quick stake buttons */}
        <div className="flex justify-center gap-2">
          {quickStakeOptions.map(amount => (
            <button
              key={amount}
              onClick={() => applyQuickStake(amount)}
              className="bg-[#1a1f2c] hover:bg-[#2a3040] px-3 py-1 rounded text-sm text-white"
            >
              ₹{amount.toLocaleString()}
            </button>
          ))}
        </div>
      </div>
    </td>
  );
};

export default InlineBetEntry; 