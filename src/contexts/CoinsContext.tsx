import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Define the context shape
interface CoinsContextType {
  coinsBalance: number;
  updateCoinsBalance: (newBalance: number) => void;
  deductCoins: (amount: number) => void;
  addCoins: (amount: number) => void;
}

// Create context with default values
const CoinsContext = createContext<CoinsContextType>({
  coinsBalance: 0,
  updateCoinsBalance: () => {},
  deductCoins: () => {},
  addCoins: () => {}
});

// Hook for using the context
export const useCoins = () => useContext(CoinsContext);

// Provider component
export const CoinsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initial state with 0, will be updated from Auth context
  const [coinsBalance, setCoinsBalance] = useState<number>(0);
  
  // Get the auth context to access the user's real coin balance
  const auth = useAuth();
  
  // Sync with the auth context coin balance
  useEffect(() => {
    if (auth && auth.coinBalance !== undefined) {
      setCoinsBalance(auth.coinBalance);
    }
  }, [auth, auth.coinBalance]);

  const updateCoinsBalance = (newBalance: number) => {
    setCoinsBalance(newBalance);
  };

  const deductCoins = (amount: number) => {
    setCoinsBalance(prev => Math.max(0, prev - amount));
  };

  const addCoins = (amount: number) => {
    setCoinsBalance(prev => prev + amount);
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