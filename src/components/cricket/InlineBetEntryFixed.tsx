import React, { useState, useEffect } from 'react';
import { BettingMarket } from './MarketTabs';
import { useWallet } from '@/contexts/WalletContext';
import { useCoins } from '@/contexts/CoinsContext';

interface InlineBetEntryFixedProps {
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
    payWith: 'wallet' | 'coins';
  }) => void;
  walletBalance?: number; // Optional prop to pass wallet balance from parent
}

const InlineBetEntryFixed: React.FC<InlineBetEntryFixedProps> = ({
  selection,
  market,
  odds: initialOdds,
  side,
  onCancel,
  onPlaceBet,
  walletBalance: externalBalance
}) => {
  const [stake, setStake] = useState<number>(200);
  const [odds, setOdds] = useState<number>(initialOdds);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { balance: contextBalance } = useWallet();
  const { coinsBalance } = useCoins();
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'coins'>('coins');
  
  // Use external balance if provided, otherwise use context balance
  const availableBalance = externalBalance !== undefined ? externalBalance : (contextBalance || 0);
  
  // Quick stake options
  const quickStakeOptions = [100, 200, 500, 1000, 5000, 10000];
  
  // Calculate potential profit
  const potentialProfit = stake * odds - stake;
  
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
  
  // Toggle payment method
  const togglePaymentMethod = () => {
    setPaymentMethod(prev => prev === 'wallet' ? 'coins' : 'wallet');
  };
  
  // Check if the user has enough balance
  const hasEnoughBalance = paymentMethod === 'coins' 
    ? coinsBalance >= stake 
    : availableBalance >= stake;
  
  // Handle place bet - always allow betting regardless of balance
  const handlePlaceBet = () => {
    if (stake > 0 && hasEnoughBalance) {
      onPlaceBet({
        selection,
        market,
        side,
        odds,
        stake,
        payWith: paymentMethod
      });
    } else {
      setErrorMessage(`Insufficient ${paymentMethod === 'coins' ? 'coins' : 'balance'} for this stake`);
    }
  };
  
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
          
          {/* Payment method toggle */}
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${paymentMethod === 'wallet' ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>Wallet</span>
            <button 
              onClick={togglePaymentMethod}
              className={`relative inline-flex h-5 w-10 items-center rounded-full ${paymentMethod === 'coins' ? 'bg-green-600' : 'bg-gray-300'}`}
            >
              <span 
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${paymentMethod === 'coins' ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <span className={`text-xs ${paymentMethod === 'coins' ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>Coins</span>
          </div>
          
          <button
            onClick={handlePlaceBet}
            disabled={!hasEnoughBalance}
            className={`px-4 py-2 rounded font-medium text-white ${
              !hasEnoughBalance ? 'bg-gray-400 cursor-not-allowed' : 
              (side === 'back' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700')
            }`}
          >
            {paymentMethod === 'coins' ? 'Place Bet with Coins' : 'Place Bet'}
          </button>
        </div>
      </div>
      
      {/* Quick stake buttons */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {quickStakeOptions.map(amount => (
          <button
            key={amount}
            onClick={() => applyQuickStake(amount)}
            className="px-3 py-1 rounded text-sm text-gray-700 bg-white hover:bg-gray-100 border border-gray-300"
          >
            ₹{amount.toLocaleString()}
          </button>
        ))}
      </div>
      
      <div className="text-sm text-gray-600 mt-3 text-center">
        {paymentMethod === 'coins' ? 
          `Available coins: ₹${coinsBalance.toLocaleString()}` : 
          `Available balance: ₹${availableBalance.toLocaleString()}`}
      </div>
      
      {errorMessage && (
        <div className="text-red-500 text-sm mt-2 text-center">{errorMessage}</div>
      )}
    </div>
  );
};

export default InlineBetEntryFixed; 