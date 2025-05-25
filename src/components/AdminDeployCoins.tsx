"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { deployCoinsToEmail } from '@/services/coinService';

export default function AdminDeployCoins() {
  const { currentUser, isAdmin } = useAuth();
  const [adminCoins, setAdminCoins] = useState(0);
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState({ loading: false, error: null, success: false });

  // Subscribe to admin's coinBalance
  useEffect(() => {
    if (!currentUser || !isAdmin) return;
    const ref = doc(db, 'users', currentUser.uid);
    return onSnapshot(ref, snap => {
      setAdminCoins(snap.data()?.coinBalance ?? 0);
    });
  }, [currentUser, isAdmin]);

  const handleDeploy = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: false });
    
    try {
      await deployCoinsToEmail(currentUser.uid, email, amount);
      setStatus({ loading: false, error: null, success: true });
      setEmail('');
      setAmount(0);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: false }));
      }, 3000);
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: false });
    }
  };

  return (
    <div className="p-6 bg-[#1a1f2c] rounded-lg shadow-lg text-white">
      <h3 className="text-xl font-semibold mb-4">Deploy Coins</h3>

      {/* ← Your dedicated coin panel */}
      <div className="mb-4 px-4 py-2 bg-gray-800 rounded">
        <span className="text-gray-300">Your Coins: </span>
        <span className="font-bold text-yellow-400">{adminCoins}</span>
      </div>

      <form onSubmit={handleDeploy}>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Recipient Email</label>
          <input 
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="user@example.com"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Amount</label>
          <input 
            type="number"
            min="1"
            max={adminCoins}
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={status.loading || amount <= 0 || amount > adminCoins}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-bold transition-colors"
        >
          {status.loading ? 'Processing...' : 'Deploy Coins'}
        </button>
        
        {status.error && (
          <div className="mt-4 p-2 bg-red-900/50 border border-red-800 rounded text-red-200">
            {status.error}
          </div>
        )}
        
        {status.success && (
          <div className="mt-4 p-2 bg-green-900/50 border border-green-800 rounded text-green-200">
            Successfully deployed {amount} coins to {email}!
          </div>
        )}
      </form>
    </div>
  );
} 