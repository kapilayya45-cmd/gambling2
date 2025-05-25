import React, { useEffect, useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { checkOnlineStatus } from '@/firebase/config';

type PaymentMethod = 'wallet' | 'coins';

interface WalletInfoProps {
  totalStake: number;
  paymentMethod?: PaymentMethod;
  coinsBalance?: number;
}

const WalletInfo: React.FC<WalletInfoProps> = ({ 
  totalStake, 
  paymentMethod = 'wallet',
  coinsBalance = 0
}) => {
  const { balance, loading, isOffline } = useWallet();
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="bg-[#2a3040] rounded-md p-3 mb-3">
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-1">
            Please log in to place bets
          </p>
        </div>
      </div>
    );
  }

  // Use appropriate balance based on payment method
  const currentBalance = paymentMethod === 'wallet' ? balance : coinsBalance;
  const insufficientFunds = totalStake > currentBalance;
  const paymentLabel = paymentMethod === 'wallet' ? 'Wallet Balance' : 'Coins Balance';

  return (
    <div className="bg-[#2a3040] rounded-md p-3 mb-3">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-400">{paymentLabel}:</span>
        <span className="text-white font-medium">
          {isOffline && paymentMethod === 'wallet' 
            ? '(Offline)' 
            : (paymentMethod === 'wallet' && loading) 
              ? '...' 
              : `$${currentBalance.toFixed(2)}`
          }
        </span>
      </div>
      
      {isOffline && paymentMethod === 'wallet' && (
        <div className="mt-2 mb-1 text-xs text-yellow-400">
          You're offline. Wallet balance may not be up-to-date.
        </div>
      )}
      
      {totalStake > 0 && (
        <>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-400">Total Stake:</span>
            <span className="text-white">${totalStake.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-400">Remaining {paymentMethod === 'wallet' ? 'Balance' : 'Coins'}:</span>
            <span className={`font-medium ${insufficientFunds ? 'text-red-400' : 'text-green-400'}`}>
              ${(currentBalance - totalStake).toFixed(2)}
            </span>
          </div>
          
          {insufficientFunds && (
            <div className="mt-2 text-xs text-red-400 bg-red-400 bg-opacity-10 p-2 rounded">
              Insufficient {paymentMethod === 'wallet' ? 'wallet balance' : 'coins'}. 
              {paymentMethod === 'wallet' && ' Please deposit to place this bet.'}
            </div>
          )}
          
          {isOffline && paymentMethod === 'wallet' && (
            <div className="mt-2 text-xs text-yellow-400 bg-yellow-500 bg-opacity-10 p-2 rounded">
              You're offline. Betting with wallet is currently unavailable.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WalletInfo; 