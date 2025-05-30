'use client';

import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { collection, query, where, getDocs, orderBy, limit, doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface WalletTransaction {
  id: string;
  userId: string;
  userEmail?: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  paymentMethod?: string;
  paymentDetails?: string;
  notes?: string;
}

const AdminWalletsPage: React.FC = () => {
  const { isAdmin } = useAdmin();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<{[key: string]: boolean}>({});
  const [activeTab, setActiveTab] = useState<'all' | 'deposits' | 'withdrawals'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const fetchTransactions = async () => {
    if (!isAdmin || !db) return;
    
    setIsLoading(true);
    try {
      let transactionsQuery;
      
      // Simplified queries to avoid composite index issues
      if (activeTab === 'all' && statusFilter === 'all') {
        // Simple query with just type and orderBy
        transactionsQuery = query(
          collection(db, 'transactions'),
          where('type', 'in', ['deposit', 'withdrawal']),
          orderBy('createdAt', 'desc')
        );
      } else if (activeTab !== 'all' && statusFilter === 'all') {
        // Filter by transaction type only
        transactionsQuery = query(
          collection(db, 'transactions'),
          where('type', '==', activeTab === 'deposits' ? 'deposit' : 'withdrawal'),
          orderBy('createdAt', 'desc')
        );
      } else if (activeTab === 'all' && statusFilter !== 'all') {
        // For filtering by status on all types, we'll fetch and filter in memory
        // This avoids the need for a composite index on type+status+createdAt
        transactionsQuery = query(
          collection(db, 'transactions'),
          where('type', 'in', ['deposit', 'withdrawal']),
          orderBy('createdAt', 'desc')
        );
      } else {
        // For specific type and status, we'll use a simpler query
        // This only requires an index on type+createdAt which should already exist
        transactionsQuery = query(
          collection(db, 'transactions'),
          where('type', '==', activeTab === 'deposits' ? 'deposit' : 'withdrawal'),
          orderBy('createdAt', 'desc')
        );
      }
      
      const transactionsSnapshot = await getDocs(transactionsQuery);
      
      // Process transaction data and fetch user emails
      const transactionsData = await Promise.all(transactionsSnapshot.docs.map(async docSnap => {
        const transaction = docSnap.data() as WalletTransaction;
        transaction.id = docSnap.id;
        
        // Skip transactions that don't match our status filter if we're doing in-memory filtering
        if (statusFilter !== 'all' && transaction.status !== statusFilter) {
          return null;
        }
        
        // Get user email if userId exists
        if (transaction.userId) {
          try {
            const userRef = doc(db, 'users', transaction.userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              const userData = userDoc.data();
              transaction.userEmail = userData.email as string;
            }
          } catch (error) {
            console.error("Error fetching user:", error);
          }
        }
        
        return transaction;
      }));
      
      // Filter out null values (from status filtering) and set transactions
      setTransactions(transactionsData.filter(Boolean) as WalletTransaction[]);
    } catch (error) {
      console.error("Error fetching wallet transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [isAdmin, activeTab, statusFilter]);

  const handleProcessTransaction = async (transactionId: string, status: 'approved' | 'rejected') => {
    if (!db || !isAdmin) return;
    
    setIsProcessing(prev => ({ ...prev, [transactionId]: true }));
    
    try {
      const transactionRef = doc(db, 'transactions', transactionId);
      const transactionDoc = await getDoc(transactionRef);
      
      if (!transactionDoc.exists()) {
        console.error("Transaction not found");
        return;
      }
      
      const transactionData = transactionDoc.data() as WalletTransaction;
      
      // Update transaction status
      await updateDoc(transactionRef, {
        status,
        processedAt: Timestamp.now(),
        processedBy: 'admin'
      });
      
      // If approved, update user balance
      if (status === 'approved' && transactionData.userId) {
        const userRef = doc(db, 'users', transactionData.userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          if (transactionData.type === 'deposit') {
            // Add funds to user's real balance
            await updateDoc(userRef, {
              realBalance: (userData.realBalance || 0) + transactionData.amount
            });
          } else if (transactionData.type === 'withdrawal' && (userData.realBalance || 0) >= transactionData.amount) {
            // Subtract funds from user's real balance
            await updateDoc(userRef, {
              realBalance: (userData.realBalance || 0) - transactionData.amount
            });
          }
        }
      }
      
      // Refresh transactions list
      fetchTransactions();
      
    } catch (error) {
      console.error("Error processing transaction:", error);
    } finally {
      setIsProcessing(prev => ({ ...prev, [transactionId]: false }));
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    
    try {
      // Handle Firestore timestamp
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleString();
      }
      
      // Handle ISO string
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved':
        return 'bg-green-900 bg-opacity-30 text-green-400';
      case 'rejected':
        return 'bg-red-900 bg-opacity-30 text-red-400';
      default:
        return 'bg-blue-900 bg-opacity-30 text-blue-400';
    }
  };

  const getFilteredTransactions = () => {
    return transactions.filter(transaction => {
      if (activeTab === 'all') return true;
      return transaction.type === (activeTab === 'deposits' ? 'deposit' : 'withdrawal');
    }).filter(transaction => {
      if (statusFilter === 'all') return true;
      return transaction.status === statusFilter;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="bg-[#1a1f2c] rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-[#363e52]">
        <h2 className="text-xl font-semibold">Wallet Management</h2>
        <p className="text-sm text-gray-400 mt-1">
          Process deposit and withdrawal requests
        </p>
      </div>

      {/* Filters */}
      <div className="p-4 flex flex-col md:flex-row justify-between gap-4 border-b border-[#363e52]">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeTab === 'all' 
                ? 'bg-purple-600 text-white' 
                : 'bg-[#242a38] text-gray-400 hover:bg-[#2d3546]'
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeTab === 'deposits' 
                ? 'bg-purple-600 text-white' 
                : 'bg-[#242a38] text-gray-400 hover:bg-[#2d3546]'
            }`}
          >
            Deposits
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeTab === 'withdrawals' 
                ? 'bg-purple-600 text-white' 
                : 'bg-[#242a38] text-gray-400 hover:bg-[#2d3546]'
            }`}
          >
            Withdrawals
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              statusFilter === 'all' 
                ? 'bg-purple-600 text-white' 
                : 'bg-[#242a38] text-gray-400 hover:bg-[#2d3546]'
            }`}
          >
            All Status
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              statusFilter === 'pending' 
                ? 'bg-purple-600 text-white' 
                : 'bg-[#242a38] text-gray-400 hover:bg-[#2d3546]'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              statusFilter === 'approved' 
                ? 'bg-purple-600 text-white' 
                : 'bg-[#242a38] text-gray-400 hover:bg-[#2d3546]'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              statusFilter === 'rejected' 
                ? 'bg-purple-600 text-white' 
                : 'bg-[#242a38] text-gray-400 hover:bg-[#2d3546]'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Transaction List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No transactions found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-xs text-gray-400 uppercase bg-[#242a38]">
              <tr>
                <th className="px-6 py-3 text-left">User</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-left">Payment Method</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#363e52]">
              {filteredTransactions.map((transaction) => (
                <tr 
                  key={transaction.id} 
                  className="hover:bg-[#242a38] transition-colors"
                >
                  <td className="px-6 py-4">
                    {transaction.userEmail || transaction.userId || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 capitalize">
                    {transaction.type}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'}>
                      {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {transaction.paymentMethod || '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {formatDate(transaction.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {transaction.status === 'pending' ? (
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleProcessTransaction(transaction.id, 'approved')}
                          disabled={isProcessing[transaction.id]}
                          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleProcessTransaction(transaction.id, 'rejected')}
                          disabled={isProcessing[transaction.id]}
                          className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminWalletsPage; 