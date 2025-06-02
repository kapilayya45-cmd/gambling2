import React, { useState, useEffect } from 'react';
import { useBetSlip } from '@/contexts/BetSlipContext';
import { useWallet } from '@/contexts/WalletContext';
import { useCoins } from '@/contexts/CoinsContext';

interface BetPlaceFormProps {
  team: string;
  odds: number;
  onPlaceBet?: (stake: number, team: string, odds: number, paymentMethod: 'wallet' | 'coins') => void;
}

const BetPlaceForm: React.FC<BetPlaceFormProps> = ({ team, odds, onPlaceBet }) => {
  const [stake, setStake] = useState<number>(200);
  const [profit, setProfit] = useState<number>(0);
  const { balance } = useWallet();
  const { coinsBalance } = useCoins();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'coins'>('coins');
  
  // Quick stake buttons
  const quickStakes = [200, 500, 1000, 5000, 10000];
  
  // Update profit when stake or odds change
  useEffect(() => {
    setProfit(stake * odds - stake);
  }, [stake, odds]);
  
  // Handle stake input change
  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setStake(isNaN(value) ? 0 : value);
  };
  
  // Set stake to a quick amount
  const setQuickStake = (amount: number) => {
    setStake(amount);
  };
  
  // Toggle payment method
  const togglePaymentMethod = () => {
    setPaymentMethod(prev => prev === 'wallet' ? 'coins' : 'wallet');
  };
  
  // Place the bet
  const handlePlaceBet = () => {
    // Always allow bet placement regardless of balance
    // This simulates having enough balance
    if (onPlaceBet) {
      onPlaceBet(stake, team, odds, paymentMethod);
    }
  };
  
  // Check if the user has enough balance
  const hasEnoughBalance = paymentMethod === 'coins' 
    ? coinsBalance >= stake 
    : (balance || 0) >= stake;
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-lg">{team} • Back</h3>
          <p className="text-gray-600">@ {odds.toFixed(2)}</p>
        </div>
        
        {/* Payment method toggle */}
        <div className="flex items-center space-x-2">
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
        
        <div className="flex space-x-2 mb-4">
          {quickStakes.map(amount => (
            <button
              key={amount}
              onClick={() => setQuickStake(amount)}
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
      
      {/* Show the appropriate balance based on payment method */}
      <div className="text-right text-sm text-gray-600 mb-2">
        {paymentMethod === 'coins' ? (
          <span>Available coins: ₹{coinsBalance}</span>
        ) : (
          <span>Available balance: ₹{balance || 0}</span>
        )}
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
      
      {errorMessage && (
        <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
      )}
    </div>
  );
};

export default BetPlaceForm; 