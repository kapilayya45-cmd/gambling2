import React, { useState } from 'react';

interface WalletPanelProps {
  balance: number;
  onDeposit: () => void;
  onWithdraw: () => void;
}

const WalletPanel: React.FC<WalletPanelProps> = ({ balance, onDeposit, onWithdraw }) => {
  const [showHistory, setShowHistory] = useState(false);
  
  // Mock transaction history for UI demonstration
  const transactions = [
    { id: 't1', type: 'deposit', amount: 5000, date: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: 't2', type: 'bet_win', amount: 2500, date: new Date(Date.now() - 5 * 60 * 60 * 1000) },
    { id: 't3', type: 'bet_loss', amount: -1500, date: new Date(Date.now() - 8 * 60 * 60 * 1000) },
    { id: 't4', type: 'withdraw', amount: -1000, date: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  ];
  
  // Calculate today's P/L
  const todayPL = transactions
    .filter(tx => tx.date.toDateString() === new Date().toDateString())
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const isProfitable = todayPL >= 0;
  
  return (
    <div className="bg-[#0a0d14] border border-[#1a2030] rounded-lg overflow-hidden mb-4">
      <div className="bg-black px-4 py-3 border-b border-[#1a2030]">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Your Wallet</h2>
          <div className="flex space-x-1">
            <button
              onClick={() => setShowHistory(false)}
              className={`px-3 py-1 text-xs rounded-l ${
                !showHistory 
                  ? 'bg-[#25b95f] text-white' 
                  : 'bg-black text-gray-400 hover:text-white'
              }`}
            >
              Balance
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className={`px-3 py-1 text-xs rounded-r ${
                showHistory 
                  ? 'bg-[#25b95f] text-white' 
                  : 'bg-black text-gray-400 hover:text-white'
              }`}
            >
              History
            </button>
          </div>
        </div>
      </div>
      
      {!showHistory ? (
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400">Available Balance</span>
            <span className="text-2xl font-bold text-white">₹{balance.toLocaleString()}</span>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={onDeposit}
              className="flex-1 bg-[#25b95f] hover:bg-[#25b95f]/80 text-white py-2 rounded font-medium"
            >
              Deposit
            </button>
            <button
              onClick={onWithdraw}
              className="flex-1 bg-black hover:bg-[#1a2030] text-white py-2 rounded font-medium border border-[#1a2030]"
            >
              Withdraw
            </button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-[#1a2030]">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Today's P/L</span>
              <span className={`text-lg font-semibold ${isProfitable ? 'text-[#25b95f]' : 'text-[#e53935]'}`}>
                {isProfitable ? '+' : ''}₹{todayPL.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <h3 className="text-white font-medium mb-3">Recent Transactions</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {transactions.map(tx => (
              <div key={tx.id} className="bg-black p-2 rounded flex justify-between items-center">
                <div>
                  <div className="text-sm text-white capitalize">
                    {tx.type.replace('_', ' ')}
                  </div>
                  <div className="text-xs text-gray-400">
                    {tx.date.toLocaleDateString()} • {tx.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
                <div className={`
                  font-medium
                  ${tx.amount > 0 ? 'text-[#25b95f]' : tx.amount < 0 ? 'text-[#e53935]' : 'text-white'}
                `}>
                  {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPanel; 