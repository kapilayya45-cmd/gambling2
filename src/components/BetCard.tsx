import React from 'react';

interface BetCardProps {
  match: string;
  selection: string;
  odds: number;
  stake: number;
  potentialWin: number;
  status: 'live' | 'settled' | 'cashout';
  onCashOut?: (betId: string) => void;
  betId: string;
}

const BetCard: React.FC<BetCardProps> = ({
  match,
  selection,
  odds,
  stake,
  potentialWin,
  status,
  onCashOut,
  betId
}) => {
  const handleCashOut = () => {
    if (onCashOut && status === 'live') {
      onCashOut(betId);
    }
  };

  return (
    <div className="min-w-[270px] bg-[#1a1f2c] rounded-lg p-4 flex-shrink-0">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-purple-400">
          {status === 'live' ? 'LIVE' : status === 'settled' ? 'SETTLED' : 'CASH OUT'}
        </span>
        <span className="text-xs text-gray-400">Bet #{betId.substring(0, 8)}</span>
      </div>
      
      <h3 className="font-medium mb-2 text-white">{match}</h3>
      <div className="text-sm text-gray-300 mb-3">
        Selection: <span className="text-white font-medium">{selection}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="bg-[#2a3040] rounded p-2">
          <span className="block text-gray-400">Odds</span>
          <span className="text-white font-medium">{odds.toFixed(2)}</span>
        </div>
        <div className="bg-[#2a3040] rounded p-2">
          <span className="block text-gray-400">Stake</span>
          <span className="text-white font-medium">₹{stake.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <span className="block text-xs text-gray-400">Potential Win</span>
          <span className="text-green-400 font-medium">₹{potentialWin.toFixed(2)}</span>
        </div>
        
        {status === 'live' && onCashOut && (
          <button 
            onClick={handleCashOut}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded transition-colors"
          >
            Cash Out
          </button>
        )}
      </div>
    </div>
  );
};

export default BetCard; 