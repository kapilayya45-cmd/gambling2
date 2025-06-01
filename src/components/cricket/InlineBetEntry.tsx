import React, { useState, useEffect } from 'react';
import { BettingMarket } from './MarketTabs';
import { useWallet } from '@/contexts/WalletContext';

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
  walletBalance?: number; // Optional prop to pass wallet balance from parent
}

const InlineBetEntry: React.FC<InlineBetEntryProps> = ({
  selection,
  market,
  odds: initialOdds,
  side,
  onCancel,
  onPlaceBet,
  walletBalance: externalBalance
}) => {
  const [stake, setStake] = useState<number>(0);
  const [odds, setOdds] = useState<number>(initialOdds);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { balance: contextBalance } = useWallet();
  
  // Use external balance if provided, otherwise use context balance
  const walletBalance = externalBalance !== undefined ? externalBalance : contextBalance;
  
  // Quick stake options
  const quickStakeOptions = [100, 200, 500, 1000, 5000, 10000];
  
  // Validate stake when it changes
  useEffect(() => {
    if (stake > walletBalance) {
      setErrorMessage(`Insufficient balance. Available: ₹${walletBalance.toLocaleString()}`);
    } else if (stake <= 0) {
      setErrorMessage("");
    } else {
      setErrorMessage("");
    }
  }, [stake, walletBalance]);
  
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
    if (stake > 0 && stake <= walletBalance) {
      onPlaceBet({
        selection,
        market,
        side,
        odds,
        stake
      });
    } else if (stake > walletBalance) {
      setErrorMessage(`Insufficient balance. Available: ₹${walletBalance.toLocaleString()}`);
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
              className={`w-24 bg-white border ${errorMessage ? 'border-red-500' : 'border-gray-300'} rounded py-1 px-2 text-gray-800 text-right`}
              placeholder="0"
              min="0"
              max={walletBalance}
            />
            {errorMessage && <div className="text-xs text-red-500 mt-1">{errorMessage}</div>}
          </div>
          
          <div>
            <div className="text-xs text-gray-600 mb-1">Profit</div>
            <div className="text-green-600 font-bold">
              ₹{potentialProfit.toFixed(2)}
            </div>
          </div>
          
          <button
            onClick={handlePlaceBet}
            disabled={stake <= 0 || stake > walletBalance}
            className={`
              px-4 py-2 rounded font-medium text-white
              ${stake > 0 && stake <= walletBalance
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
            disabled={amount > walletBalance}
            className={`
              px-3 py-1 rounded text-sm text-gray-700
              ${amount <= walletBalance
                ? 'bg-white hover:bg-gray-100 border border-gray-300' 
                : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'}
            `}
          >
            ₹{amount.toLocaleString()}
          </button>
        ))}
      </div>
      
      <div className="text-sm text-gray-600 mt-3 text-center">
        Available balance: ₹{walletBalance.toLocaleString()}
      </div>
    </div>
  );
};

export default InlineBetEntry; 