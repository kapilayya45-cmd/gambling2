import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { formatDate } from '@/utils/date';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  timestamp: any;
  userId: string;
  userEmail: string;
}

export default function TransactionLogs() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const transactionsQuery = query(
      collection(db, "transactions"),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(transactionsQuery, (snapshot) => {
      const transactionsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      
      setTransactions(transactionsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Transactions</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-gray-600">User</th>
              <th className="px-4 py-3 text-gray-600">Type</th>
              <th className="px-4 py-3 text-gray-600">Amount</th>
              <th className="px-4 py-3 text-gray-600">Status</th>
              <th className="px-4 py-3 text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map(transaction => (
              <tr key={transaction.id} className="bg-white hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="text-gray-900">{transaction.userEmail}</div>
                  <div className="text-xs text-gray-500">{transaction.userId}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    transaction.type === 'deposit'
                      ? 'bg-green-100 text-green-800'
                      : transaction.type === 'withdrawal'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}>
                    {transaction.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-900">
                    {transaction.amount} coins
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    transaction.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(transaction.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 