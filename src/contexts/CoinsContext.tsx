import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

// Define the context shape
interface CoinsContextType {
  coinsBalance: number;
  updateCoinsBalance: (newBalance: number) => Promise<void>;
  deductCoins: (amount: number) => Promise<void>;
  addCoins: (amount: number) => Promise<void>;
}

// Create context with default values
const CoinsContext = createContext<CoinsContextType>({
  coinsBalance: 0,
  updateCoinsBalance: async () => {},
  deductCoins: async () => {},
  addCoins: async () => {}
});

// Hook for using the context
export const useCoins = () => useContext(CoinsContext);

// Provider component
export const CoinsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initial state with 0, will be updated from Auth context
  const [coinsBalance, setCoinsBalance] = useState<number>(0);
  
  // Get the auth context to access the user's real coin balance
  const { currentUser, coinBalance } = useAuth();
  
  // Sync with the auth context coin balance
  useEffect(() => {
    if (coinBalance !== undefined) {
      setCoinsBalance(coinBalance);
    }
  }, [coinBalance]);

  const updateCoinsBalance = async (newBalance: number) => {
    if (!currentUser) return;
    
    try {
      // Update in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        coinBalance: newBalance
      });
      
      // Update local state
      setCoinsBalance(newBalance);
    } catch (error) {
      console.error('Error updating coin balance:', error);
      throw error;
    }
  };

  const deductCoins = async (amount: number) => {
    if (!currentUser) return;
    
    try {
      const newBalance = Math.max(0, coinsBalance - amount);
      
      // Update in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        coinBalance: newBalance
      });
      
      // Update local state
      setCoinsBalance(newBalance);
    } catch (error) {
      console.error('Error deducting coins:', error);
      throw error;
    }
  };

  const addCoins = async (amount: number) => {
    if (!currentUser) return;
    
    try {
      const newBalance = coinsBalance + amount;
      
      // Update in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        coinBalance: newBalance
      });
      
      // Update local state
      setCoinsBalance(newBalance);
    } catch (error) {
      console.error('Error adding coins:', error);
      throw error;
    }
  };

  return (
    <CoinsContext.Provider
      value={{
        coinsBalance,
        updateCoinsBalance,
        deductCoins,
        addCoins
      }}
    >
      {children}
    </CoinsContext.Provider>
  );
}; 