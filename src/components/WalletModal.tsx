import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import TransactionHistory from './TransactionHistory';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { balance, loading, error, deposit, withdraw } = useWallet();
  const [amount, setAmount] = useState<string>('');
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [processing, setProcessing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState<boolean>(false);

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }

    const numAmount = Number(amount);
    
    setProcessing(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      if (transactionType === 'deposit') {
        await deposit(numAmount);
        setSuccessMessage(`Successfully deposited $${numAmount.toFixed(2)}`);
      } else {
        await withdraw(numAmount);
        setSuccessMessage(`Successfully withdrew $${numAmount.toFixed(2)}`);
      }
      setAmount('');
    } catch (error: any) {
      setErrorMessage(error.message || 'Transaction failed');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-gray-800 bg-opacity-75" onClick={onClose}></div>
        
        <div className="bg-[#1a1f2c] rounded-lg p-6 w-full max-w-md mx-4 z-10">
          <button 
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
            onClick={onClose}
          >
            ✕
          </button>

          <h2 className="text-2xl font-bold text-white mb-6">Your Wallet</h2>
          
          <div className="bg-[#2a3040] rounded-lg p-4 mb-6">
            <p className="text-gray-400 text-sm mb-1">Current Balance</p>
            <p className="text-2xl font-bold text-white">
              ${loading ? '...' : balance.toFixed(2)}
            </p>
          </div>
          
          {errorMessage && (
            <div className="bg-red-500 bg-opacity-20 text-red-200 p-3 rounded mb-4 text-sm">
              {errorMessage}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-500 bg-opacity-20 text-green-200 p-3 rounded mb-4 text-sm">
              {successMessage}
            </div>
          )}
          
          {error && (
            <div className="bg-yellow-500 bg-opacity-20 text-yellow-200 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <div className="flex rounded-md overflow-hidden mb-4">
              <button
                className={`flex-1 py-2 text-center ${
                  transactionType === 'deposit'
                    ? 'bg-green-600 text-white'
                    : 'bg-[#2a3040] text-gray-300'
                }`}
                onClick={() => setTransactionType('deposit')}
              >
                Deposit
              </button>
              <button
                className={`flex-1 py-2 text-center ${
                  transactionType === 'withdraw'
                    ? 'bg-red-600 text-white'
                    : 'bg-[#2a3040] text-gray-300'
                }`}
                onClick={() => setTransactionType('withdraw')}
              >
                Withdraw
              </button>
            </div>

            <form onSubmit={handleTransaction}>
              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-800">$</span>
                  <input
                    type="text"
                    id="amount"
                    className="w-full bg-white text-gray-800 border border-gray-300 rounded-md p-3 pl-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className={`w-full px-4 py-3 rounded-md text-white transition-colors ${
                  transactionType === 'deposit'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={processing || loading}
              >
                {processing
                  ? 'Processing...'
                  : transactionType === 'deposit'
                  ? 'Deposit Funds'
                  : 'Withdraw Funds'}
              </button>
            </form>
          </div>
          
          <div className="border-t border-[#2a3040] pt-4 mb-4">
            <button
              className="w-full text-center py-2 text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center"
              onClick={() => setIsTransactionHistoryOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              View Transaction History
            </button>
          </div>
          
          <div className="border-t border-[#2a3040] pt-4 text-sm text-gray-400">
            <p className="mb-2">
              {transactionType === 'deposit' 
                ? 'Deposited funds will be available immediately in your account.' 
                : 'Withdrawals typically process within 1-3 business days.'}
            </p>
            <p>
              For any issues with your transactions, please contact our support team.
            </p>
          </div>
        </div>
      </div>

      <TransactionHistory 
        isOpen={isTransactionHistoryOpen} 
        onClose={() => setIsTransactionHistoryOpen(false)} 
      />
    </>
  );
};

export default WalletModal; 