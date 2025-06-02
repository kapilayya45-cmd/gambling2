import React from 'react';

interface BetCardProps {
  match: string;
  selection: string;
  odds: number;
  stake: number;
  potentialWin: number;
  status: 'live' | 'settled' | 'cashout';
  onCancelBet?: (betId: string) => void;
  betId: string;
  createdAt?: string;
}

const BetCard: React.FC<BetCardProps> = ({
  match,
  selection,
  odds,
  stake,
  potentialWin,
  status,
  onCancelBet,
  betId,
  createdAt
}) => {
  const handleCancelBet = () => {
    if (onCancelBet && status === 'live') {
      onCancelBet(betId);
    }
  };

  // Format the date nicely
  const formattedDate = createdAt ? new Date(createdAt).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }) : '';

  return (
    <div className="min-w-[270px] bg-white rounded-lg p-4 flex-shrink-0 border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-purple-600">
          {status === 'live' ? 'LIVE' : status === 'settled' ? 'SETTLED' : 'CANCELLED'}
        </span>
        <span className="text-sm text-gray-500">Bet #{betId.substring(0, 8)}</span>
      </div>

      <div className="mb-4">
        <div className="text-gray-500 mb-1">Selection:</div>
        <div className="text-gray-900">{selection}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-gray-500 mb-1">Odds</div>
          <div className="text-gray-900">{odds.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-1">Stake</div>
          <div className="text-gray-900">₹{stake.toLocaleString()}</div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-gray-500 mb-1">Potential Win</div>
          <div className="text-green-600">₹{potentialWin.toFixed(2)}</div>
        </div>
        {status === 'live' && onCancelBet && (
          <button 
            onClick={handleCancelBet}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Cancel Bet
          </button>
        )}
      </div>

      {createdAt && (
        <div className="text-sm text-gray-500">
          Placed: {formattedDate}
        </div>
      )}
    </div>
  );
};

export default BetCard; 