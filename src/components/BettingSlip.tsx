import React, { useState } from 'react';

interface BettingSlipProps {
  teamName: string;
  odds: number;
  onClose: () => void;
}

const BettingSlip: React.FC<BettingSlipProps> = ({ teamName, odds, onClose }) => {
  const [stake, setStake] = useState<string>('');
  const profit = stake ? (parseFloat(stake) * odds - parseFloat(stake)).toFixed(2) : '0.00';
  
  const quickStakes = [100, 200, 500, 1000, 5000, 10000];
  
  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setStake(value);
    }
  };
  
  const handleQuickStake = (amount: number) => {
    setStake(amount.toString());
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col">
      <div className="border-b border-gray-800 p-4 flex justify-between items-center">
        <button 
          onClick={onClose}
          className="text-white text-lg font-medium"
        >
          Cancel
        </button>
        <div className="text-white text-lg font-medium">
          {teamName} • Back
        </div>
        <div className="flex items-center bg-black rounded-md border border-gray-700 px-2">
          <button className="text-white px-2 py-1 text-xl">−</button>
          <span className="text-white px-3 py-1 text-xl font-bold">{odds.toFixed(2)}</span>
          <button className="text-white px-2 py-1 text-xl">+</button>
        </div>
      </div>
      
      <div className="flex-1"></div>
      
      <div className="p-4 flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-gray-400 text-lg">Stake (₹)</div>
          <div className="text-gray-400 text-lg">Profit</div>
        </div>
        
        <div className="flex justify-between">
          <input
            type="text"
            value={stake}
            onChange={handleStakeChange}
            placeholder="0"
            className="bg-[#1a1f2c] border border-gray-700 rounded w-40 h-12 px-4 text-white text-xl text-center"
          />
          <div className="text-white text-2xl font-bold">₹{profit}</div>
        </div>
        
        <div className="grid grid-cols-6 gap-2 mt-4">
          {quickStakes.map(amount => (
            <button
              key={amount}
              onClick={() => handleQuickStake(amount)}
              className="bg-transparent border border-gray-700 text-white py-2 rounded hover:bg-gray-800"
            >
              ₹{amount.toLocaleString()}
            </button>
          ))}
        </div>
        
        <button className="bg-[#3574f0] hover:bg-[#4a82f3] text-white py-4 rounded-md text-xl font-medium">
          Place Bet
        </button>
      </div>
    </div>
  );
};

export default BettingSlip; 