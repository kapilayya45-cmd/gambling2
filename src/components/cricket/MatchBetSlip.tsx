import React, { useState } from 'react';

interface BetItem {
  id: string;
  matchId: string | number;
  sport: string;
  match: string;
  selection: {
    type: 'teamA' | 'draw' | 'teamB';
    name: string;
  };
  odds: number;
  time: string;
  league: string;
}

interface MatchBetSlipProps {
  bets: BetItem[];
  onRemoveBet?: (betId: string) => void;
  onClearAll?: () => void;
  onPlaceBet?: () => void;
}

const MatchBetSlip: React.FC<MatchBetSlipProps> = ({
  bets = [],
  onRemoveBet,
  onClearAll,
  onPlaceBet
}) => {
  const [stakeValues, setStakeValues] = useState<Record<string, string>>({});
  const [totalStake, setTotalStake] = useState<string>('10');
  const [betMode, setBetMode] = useState<'single' | 'multi'>('single');

  // Calculate potential winnings
  const calculateSingleWin = (betId: string): number => {
    const bet = bets.find(b => b.id === betId);
    const stake = parseFloat(stakeValues[betId] || '0');
    if (bet && !isNaN(stake)) {
      return stake * bet.odds;
    }
    return 0;
  };

  // Calculate total singles stake
  const totalSinglesStake = Object.values(stakeValues).reduce((sum, stake) => {
    const value = parseFloat(stake || '0');
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  // Calculate total odds for accumulator
  const totalOdds = bets.reduce((acc, bet) => acc * bet.odds, 1);
  
  // Calculate multi bet win
  const multiWin = parseFloat(totalStake) * totalOdds;

  // Handle stake change for individual bets
  const handleStakeChange = (betId: string, value: string) => {
    setStakeValues(prev => ({
      ...prev,
      [betId]: value
    }));
  };

  // Handle total multi stake change
  const handleTotalStakeChange = (value: string) => {
    setTotalStake(value);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Bet slip header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setBetMode('single')}
            className={`px-3 py-1 text-sm rounded-full ${
              betMode === 'single' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            Singles
          </button>
          <button
            onClick={() => setBetMode('multi')}
            className={`px-3 py-1 text-sm rounded-full ${
              betMode === 'multi' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            Multi
          </button>
        </div>
        {bets.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-gray-400 hover:text-white"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Empty state */}
      {bets.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8 text-center text-gray-500">
          <p>Your betslip is empty</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Bet items */}
          <div className="space-y-3">
            {bets.map(bet => (
              <div key={bet.id} className="bg-gray-800 rounded-lg p-3 relative">
                <button
                  onClick={() => onRemoveBet?.(bet.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-gray-400">{bet.league}</span>
                  <span className="text-xs text-gray-400">{bet.time}</span>
                </div>
                
                <div className="text-sm font-medium mb-2">{bet.match}</div>
                
                <div className="flex justify-between items-center mb-2">
                  <div className="bg-gray-700 px-2 py-1 rounded text-xs">
                    {bet.selection.name}
                  </div>
                  <div className="font-bold text-green-400">
                    {bet.odds.toFixed(2)}
                  </div>
                </div>
                
                {betMode === 'single' && (
                  <div className="mt-2">
                    <div className="flex justify-between mb-1">
                      <label htmlFor={`stake-${bet.id}`} className="text-xs text-gray-400">
                        Stake
                      </label>
                      <span className="text-xs text-gray-400">
                        Win: ₹{calculateSingleWin(bet.id).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center bg-gray-900 rounded overflow-hidden">
                      <span className="px-2 text-gray-400">₹</span>
                      <input
                        type="number"
                        id={`stake-${bet.id}`}
                        value={stakeValues[bet.id] || ''}
                        onChange={(e) => handleStakeChange(bet.id, e.target.value)}
                        placeholder="Enter amount"
                        className="w-full bg-transparent border-0 focus:ring-0 p-2 text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Multi bet stake */}
          {betMode === 'multi' && bets.length > 1 && (
            <div className="mt-4 bg-gray-800 rounded-lg p-3">
              <div className="flex justify-between mb-2">
                <div className="text-sm font-medium">Multi Bet ({bets.length} selections)</div>
                <div className="text-xs text-gray-400">
                  Total Odds: {totalOdds.toFixed(2)}
                </div>
              </div>
              
              <div className="flex justify-between mb-1">
                <label htmlFor="multi-stake" className="text-xs text-gray-400">
                  Stake
                </label>
                <span className="text-xs text-gray-400">
                  Win: ₹{multiWin.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center bg-gray-900 rounded overflow-hidden">
                <span className="px-2 text-gray-400">₹</span>
                <input
                  type="number"
                  id="multi-stake"
                  value={totalStake}
                  onChange={(e) => handleTotalStakeChange(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full bg-transparent border-0 focus:ring-0 p-2 text-white"
                />
              </div>
            </div>
          )}

          {/* Place bet button */}
          <div className="mt-4">
            <button
              onClick={onPlaceBet}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
            >
              Place Bet
              {betMode === 'single' ? (
                <span className="ml-1">₹{totalSinglesStake.toFixed(2)}</span>
              ) : (
                <span className="ml-1">₹{totalStake}</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchBetSlip; 