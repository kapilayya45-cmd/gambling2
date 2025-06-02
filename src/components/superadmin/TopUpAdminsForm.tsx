import React, { useState } from 'react';
import { doc, runTransaction } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface Admin {
  id: string;
  email: string;
  coinBalance: number;
}

interface TopUpAdminsFormProps {
  selectedAdmin: string;
  onSelectAdmin: (adminId: string) => void;
  admins: Admin[];
}

export default function TopUpAdminsForm({ selectedAdmin, onSelectAdmin, admins }: TopUpAdminsFormProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success?: boolean; message?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin || !amount) return;

    setLoading(true);
    setStatus({});

    try {
      const amountNum = parseInt(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Please enter a valid positive number');
      }

      await runTransaction(db, async (transaction) => {
        const adminRef = doc(db, 'users', selectedAdmin);
        const adminDoc = await transaction.get(adminRef);

        if (!adminDoc.exists()) {
          throw new Error('Admin not found');
        }

        transaction.update(adminRef, {
          coinBalance: (adminDoc.data().coinBalance || 0) + amountNum
        });
      });

      setStatus({
        success: true,
        message: `Successfully topped up ${amount} coins!`
      });
      setAmount('');
    } catch (error) {
      setStatus({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to top up coins'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedAdminData = admins.find(admin => admin.id === selectedAdmin);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Up Admin Balance</h2>
      
      <div className="space-y-4">
        {/* Admin Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Admin
          </label>
          <select
            value={selectedAdmin}
            onChange={(e) => onSelectAdmin(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Select an admin</option>
            {admins.map(admin => (
              <option key={admin.id} value={admin.id}>
                {admin.email} (Current Balance: {admin.coinBalance})
              </option>
            ))}
          </select>
        </div>

        {/* Amount Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount to Top Up
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              min="1"
            />
          </div>

          {selectedAdminData && (
            <div className="text-sm text-gray-600">
              Current Balance: {selectedAdminData.coinBalance} coins
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedAdmin || !amount}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
              loading || !selectedAdmin || !amount
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {loading ? 'Processing...' : 'Top Up Balance'}
          </button>
        </form>

        {/* Status Messages */}
        {status.message && (
          <div className={`p-3 rounded-md ${
            status.success
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
} 