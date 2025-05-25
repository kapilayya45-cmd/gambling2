'use client';

import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface User {
  id: string;
  email: string;
  displayName: string;
  coinBalance: number;
  realBalance: number;
  role: string;
  createdAt: any;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (userId: string, coinBalance: number, realBalance: number) => Promise<void>;
}

const EditUserModal: React.FC<EditModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [coinBalance, setCoinBalance] = useState(user?.coinBalance || 0);
  const [realBalance, setRealBalance] = useState(user?.realBalance || 0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setCoinBalance(user.coinBalance || 0);
      setRealBalance(user.realBalance || 0);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await onSave(user.id, coinBalance, realBalance);
      onClose();
    } catch (error) {
      console.error("Error updating user balance:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-[#1a1f2c] rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Edit User Balance</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-400 mb-2">User: <span className="text-white">{user?.email}</span></p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Coin Balance
          </label>
          <input
            type="number"
            value={coinBalance}
            onChange={(e) => setCoinBalance(Number(e.target.value))}
            className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Real Money Balance
          </label>
          <input
            type="number"
            value={realBalance}
            onChange={(e) => setRealBalance(Number(e.target.value))}
            className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#363e52] text-white rounded hover:bg-[#404a62] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center"
          >
            {isSaving && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminUsersPage: React.FC = () => {
  const { fetchUsers, users } = useAdmin();
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      await fetchUsers();
      setIsLoading(false);
    };
    
    loadUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (users) {
      const filtered = users.filter(user => 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUserChanges = async (userId: string, coinBalance: number, realBalance: number) => {
    if (!db) return;
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      coinBalance,
      realBalance,
      'metadata.lastUpdated': new Date().toISOString()
    });
    
    // Refresh the users list
    await fetchUsers();
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    
    try {
      // Handle Firestore timestamp
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString();
      }
      
      // Handle ISO string
      return new Date(timestamp).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="bg-[#1a1f2c] rounded-lg shadow-md overflow-hidden">
      {/* Header with search */}
      <div className="p-4 border-b border-[#363e52] flex flex-col md:flex-row justify-between md:items-center space-y-2 md:space-y-0">
        <h2 className="text-xl font-semibold">User Management</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 pr-10 bg-[#242a38] border border-[#363e52] rounded-md text-white w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <div className="absolute right-3 top-2.5 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          {searchTerm ? 'No users found matching your search' : 'No users found'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-xs text-gray-400 uppercase bg-[#242a38]">
              <tr>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Display Name</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-left">Coin Balance</th>
                <th className="px-6 py-3 text-left">Real Balance</th>
                <th className="px-6 py-3 text-left">Signup Date</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#363e52]">
              {filteredUsers.map((user) => (
                <tr 
                  key={user.id} 
                  className="hover:bg-[#242a38] transition-colors"
                >
                  <td className="px-6 py-4">
                    {user.email || 'No email'}
                  </td>
                  <td className="px-6 py-4">
                    {user.displayName || 'Anonymous'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-900 bg-opacity-30 text-purple-400' 
                        : 'bg-blue-900 bg-opacity-30 text-blue-400'
                    }`}>
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.coinBalance?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4">
                    ${user.realBalance?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveUserChanges}
      />
    </div>
  );
};

export default AdminUsersPage; 