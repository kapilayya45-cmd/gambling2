'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useAuth } from '@/contexts/AuthContext';

export default function UserBalanceDisplay() {
  const { getUserBalances, isOffline } = useWallet();
  const { currentUser } = useAuth();
  const [balances, setBalances] = useState<{ coinBalance: number; realBalance: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBalances() {
      try {
        setLoading(true);
        const userBalances = await getUserBalances();
        setBalances(userBalances);
        setError(null);
      } catch (err) {
        console.error('Failed to load balances:', err);
        setError('Could not load balance information');
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) {
      loadBalances();
    } else {
      setBalances(null);
      setLoading(false);
    }
  }, [currentUser, getUserBalances]);

  if (!currentUser) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg shadow-md text-center">
        <p className="text-gray-400">Please sign in to view your balances</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg shadow-md animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg shadow-md">
        <p className="text-red-400">{error}</p>
        {isOffline && (
          <p className="text-xs text-red-500 mt-1">You appear to be offline</p>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-white mb-3">Your Balance</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-400">Coins</p>
          <p className="text-xl font-bold text-yellow-400">
            {balances?.coinBalance.toLocaleString() || 0}
          </p>
        </div>
        
        <div className="p-3 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-400">Real Balance</p>
          <p className="text-xl font-bold text-green-500">
            ${balances?.realBalance.toLocaleString() || 0}
          </p>
        </div>
      </div>

      <button 
        onClick={() => getUserBalances()} 
        className="mt-3 text-xs text-blue-400 hover:text-blue-300"
      >
        Refresh
      </button>
    </div>
  );
} 