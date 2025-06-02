import React, { useState, useEffect } from 'react';
import { CompatibleMatch } from '@/types/oddsApiTypes';
import { useBetSlip } from '@/contexts/BetSlipContext';
import { useWallet } from '@/contexts/WalletContext';
import { useCoins } from '@/contexts/CoinsContext';

interface MatchBetSlipFixedProps {
  match: CompatibleMatch;
  odds: number;
  selection: string;
  onClose?: () => void;
  onPlaceBet?: (stake: number, paymentMethod: 'wallet' | 'coins') => void;
}

const MatchBetSlipFixed: React.FC<MatchBetSlipFixedProps> = ({
  match,
  odds,
  selection,
  onClose,
  onPlaceBet
}) => {
  const [stake, setStake] = useState<number>(200);
  const [profit, setProfit] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'coins'>('coins');
  const { coinsBalance } = useCoins();
  const { balance: walletBalance } = useWallet();
  
  // Calculate profit whenever stake or odds change
  useEffect(() => {
    setProfit(stake * odds - stake);
  }, [stake, odds]);
  
  // Handle stake change
  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setStake(isNaN(value) ? 0 : value);
  };
  
  // Quick stake options
  const quickStakeOptions = [200, 500, 1000, 5000, 10000];
  
  // Handle clicking a quick stake button
  const handleQuickStake = (amount: number) => {
    setStake(amount);
  };
  
  // Toggle payment method
  const togglePaymentMethod = () => {
    setPaymentMethod(prev => prev === 'wallet' ? 'coins' : 'wallet');
  };
  
  // Place the bet
  const handlePlaceBet = () => {
    if (onPlaceBet) {
      onPlaceBet(stake, paymentMethod);
    }
  };
  
  // Check if the user has enough balance
  const hasEnoughBalance = paymentMethod === 'coins' 
    ? coinsBalance >= stake 
    : (walletBalance || 0) >= stake;
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Place Bet</h3>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="mb-4">
        <p className="text-gray-600 text-sm">{match.localteam_name} vs {match.visitorteam_name}</p>
        <p className="font-medium">Selection: {selection}</p>
        <p className="text-green-600 font-bold">@ {odds.toFixed(2)}</p>
      </div>
      
      {/* Payment method toggle */}
      <div className="flex justify-end items-center space-x-2 mb-4">
        <span className={`text-sm ${paymentMethod === 'wallet' ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>Wallet</span>
        <button 
          onClick={togglePaymentMethod}
          className={`relative inline-flex h-6 w-11 items-center rounded-full ${paymentMethod === 'coins' ? 'bg-green-600' : 'bg-gray-300'}`}
        >
          <span 
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${paymentMethod === 'coins' ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
        <span className={`text-sm ${paymentMethod === 'coins' ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>Coins</span>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Stake (₹)</label>
        <div className="flex items-center mb-2">
          <span className="bg-gray-200 px-3 py-2 rounded-l">₹</span>
          <input
            type="number"
            value={stake}
            onChange={handleStakeChange}
            className="flex-1 p-2 border border-gray-300 rounded-r focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div className="grid grid-cols-5 gap-2 mb-4">
          {quickStakeOptions.map(amount => (
            <button
              key={amount}
              onClick={() => handleQuickStake(amount)}
              className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-sm"
            >
              ₹{amount}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between">
          <span className="text-gray-700">Profit</span>
          <span className="text-green-600 font-bold">₹{profit.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>{paymentMethod === 'coins' ? 'Available coins:' : 'Available balance:'}</span>
        <span>₹{paymentMethod === 'coins' ? coinsBalance : walletBalance || 0}</span>
      </div>
      
      <button
        onClick={handlePlaceBet}
        disabled={!hasEnoughBalance}
        className={`w-full ${hasEnoughBalance 
          ? 'bg-green-600 hover:bg-green-700' 
          : 'bg-gray-400 cursor-not-allowed'} text-white py-3 rounded-lg font-medium`}
      >
        {paymentMethod === 'coins' ? 'Place Bet with Coins' : 'Place Bet'}
      </button>
      
      {!hasEnoughBalance && (
        <p className="text-red-500 text-sm mt-2">
          Insufficient {paymentMethod === 'coins' ? 'coins' : 'balance'} for this stake
        </p>
      )}
    </div>
  );
};

export default MatchBetSlipFixed; 