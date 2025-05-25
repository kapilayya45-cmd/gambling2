"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { doc, setDoc, updateDoc, collection, addDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db, checkOnlineStatus, OfflineError } from '../firebase/config';
import { safeGetDoc, safeGetDocs } from '@/services/firestoreHelpers';

// Define transaction type
export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'bet';
  amount: number;
  timestamp: Date;
  description?: string;
  status: 'completed' | 'pending' | 'failed';
}

// Define wallet context type
interface WalletContextType {
  balance: number;
  loading: boolean;
  error: string | null;
  transactions: Transaction[];
  loadingTransactions: boolean;
  isOffline: boolean;
  deposit: (amount: number) => Promise<void>;
  withdraw: (amount: number) => Promise<void>;
  getBalance: () => Promise<number>;
  getTransactions: () => Promise<Transaction[]>;
  getUserBalances: () => Promise<{ coinBalance: number; realBalance: number } | null>;
}

// Create context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Custom hook to use wallet context
export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

interface WalletProviderProps {
  children: ReactNode;
}

// Wallet provider component
export function WalletProvider({ children }: WalletProviderProps) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!checkOnlineStatus());
  const [userBalances, setUserBalances] = useState<{ coinBalance: number; realBalance: number } | null>(null);
  const { currentUser } = useAuth();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initial status
    setIsOffline(!checkOnlineStatus());
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize or fetch user wallet when authenticated
  useEffect(() => {
    if (currentUser) {
      getBalance().catch(error => {
        if (!(error instanceof OfflineError)) {
          setError('Failed to load wallet balance');
          console.error(error);
        }
      });
      getTransactions().catch(error => {
        if (!(error instanceof OfflineError)) {
          console.error('Failed to load transactions:', error);
        }
      });
    } else {
      setBalance(0);
      setTransactions([]);
      setLoading(false);
    }
  }, [currentUser]);

  // Get user's balance
  async function getBalance(): Promise<number> {
    if (!currentUser) {
      setLoading(false);
      return 0;
    }

    setLoading(true);
    setError(null);
    
    try {
      const walletRef = doc(db, 'wallets', currentUser.uid);
      // Using safeGetDoc helper instead of getDoc
      const walletDoc = await safeGetDoc(walletRef);
      
      if (walletDoc.exists()) {
        const walletData = walletDoc.data();
        const newBalance = walletData.balance || 0;
        setBalance(newBalance);
        setLoading(false);
        return newBalance;
      } else {
        // If no wallet exists, create one with 0 balance
        if (!isOffline) {
          await setDoc(walletRef, { balance: 0 });
        }
        setBalance(0);
        setLoading(false);
        return 0;
      }
    } catch (error: any) {
      if (!checkOnlineStatus()) {
        // We're offline, use current state
        setError('You are offline. Using cached balance.');
      } else {
        setError('Failed to get balance');
      }
      setLoading(false);
      console.error('Error getting balance:', error);
      return balance; // Return current state balance on error
    }
  }

  // Get user's transactions
  async function getTransactions(): Promise<Transaction[]> {
    if (!currentUser) {
      return [];
    }

    setLoadingTransactions(true);
    
    try {
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid),
        orderBy('timestamp', 'desc')
      );
      
      // Using safeGetDocs helper instead of getDocs
      const querySnapshot = await safeGetDocs(transactionsQuery);
      const transactionsList: Transaction[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactionsList.push({
          id: doc.id,
          type: data.type,
          amount: data.amount,
          timestamp: data.timestamp.toDate(),
          description: data.description || '',
          status: data.status
        });
      });
      
      setTransactions(transactionsList);
      setLoadingTransactions(false);
      return transactionsList;
    } catch (error) {
      console.error('Error getting transactions:', error);
      setLoadingTransactions(false);
      return transactions; // Return current state transactions on error
    }
  }

  // Deposit funds to user's wallet
  async function deposit(amount: number): Promise<void> {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    if (amount <= 0) {
      throw new Error('Deposit amount must be greater than 0');
    }
    
    if (isOffline) {
      throw new OfflineError('Cannot deposit funds while offline');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const walletRef = doc(db, 'wallets', currentUser.uid);
      // Using safeGetDoc helper instead of getDoc 
      const walletDoc = await safeGetDoc(walletRef);
      
      if (walletDoc.exists()) {
        const newBalance = (walletDoc.data().balance || 0) + amount;
        await updateDoc(walletRef, { balance: newBalance });
        setBalance(newBalance);
      } else {
        await setDoc(walletRef, { balance: amount });
        setBalance(amount);
      }

      // Record the transaction
      await addDoc(collection(db, 'transactions'), {
        userId: currentUser.uid,
        type: 'deposit',
        amount: amount,
        timestamp: Timestamp.now(),
        description: 'Deposit to wallet',
        status: 'completed'
      });

      // Refresh transactions
      getTransactions();
    } catch (error: any) {
      if (!checkOnlineStatus()) {
        setError('Cannot deposit while offline');
      } else {
        setError('Failed to deposit funds');
      }
      console.error('Error depositing funds:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Withdraw funds from user's wallet
  async function withdraw(amount: number): Promise<void> {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be greater than 0');
    }
    
    if (isOffline) {
      throw new OfflineError('Cannot withdraw funds while offline');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const walletRef = doc(db, 'wallets', currentUser.uid);
      // Using safeGetDoc helper instead of getDoc
      const walletDoc = await safeGetDoc(walletRef);
      
      if (!walletDoc.exists()) {
        throw new Error('Wallet not found');
      }
      
      const currentBalance = walletDoc.data().balance || 0;
      
      if (currentBalance < amount) {
        throw new Error('Insufficient funds');
      }
      
      const newBalance = currentBalance - amount;
      await updateDoc(walletRef, { balance: newBalance });
      setBalance(newBalance);

      // Record the transaction
      await addDoc(collection(db, 'transactions'), {
        userId: currentUser.uid,
        type: 'withdraw',
        amount: amount,
        timestamp: Timestamp.now(),
        description: 'Withdrawal from wallet',
        status: 'completed'
      });

      // Refresh transactions
      getTransactions();
    } catch (error: any) {
      if (!checkOnlineStatus()) {
        setError('Cannot withdraw while offline');
      } else {
        setError(error.message || 'Failed to withdraw funds');
      }
      console.error('Error withdrawing funds:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Get user's profile balances directly from users collection
  async function getUserBalances(): Promise<{ coinBalance: number; realBalance: number } | null> {
    // 1. Check if user is authenticated
    if (!currentUser) {
      console.error('User must be logged in to read balance');
      return null;
    }

    try {
      // 2. Use the safeGetDoc helper for better error handling
      const userDocRef = doc(db, 'users', currentUser.uid);
      const snap = await safeGetDoc(userDocRef);
      
      if (snap.exists()) {
        const userData = snap.data();
        console.log('User balances:', userData);
        
        // Update state
        const balances = {
          coinBalance: userData.coinBalance || 0,
          realBalance: userData.realBalance || 0
        };
        setUserBalances(balances);
        return balances;
      } else {
        console.warn('User document not found, creating default document');
        // Create a default document if not found
        const defaultData = { 
          coinBalance: 0, 
          realBalance: 0, 
          role: 'user',
          createdAt: new Date().toISOString()
        };
        
        if (!isOffline) {
          await setDoc(userDocRef, defaultData);
        }
        
        setUserBalances({ coinBalance: 0, realBalance: 0 });
        return { coinBalance: 0, realBalance: 0 };
      }
    } catch (error) {
      console.error('Error reading user balances:', error);
      setError('Failed to read user profile balances');
      return userBalances; // Return current state if we have it
    }
  }

  // Define context value with all methods and state
  const value: WalletContextType = {
    balance,
    loading,
    error,
    transactions,
    loadingTransactions,
    isOffline,
    deposit,
    withdraw,
    getBalance,
    getTransactions,
    getUserBalances
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
} 