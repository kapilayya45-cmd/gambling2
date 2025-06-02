import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { formatDate } from '@/utils/date';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  coinBalance: number;
  createdAt: any;
  status: string;
}

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showOnlyAdmins, setShowOnlyAdmins] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const usersQuery = query(collection(db, "users"));
        const snapshot = await getDocs(usersQuery);
        const usersList = snapshot.docs.map(doc => ({
          id: doc.id,
          email: doc.data().email || 'No email',
          displayName: doc.data().displayName || 'Anonymous',
          role: doc.data().role || 'user',
          coinBalance: doc.data().coinBalance || 0,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          status: doc.data().status || 'active'
        }));
        setUsers(usersList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesFilter = user.email.toLowerCase().includes(filter.toLowerCase()) ||
                         user.displayName.toLowerCase().includes(filter.toLowerCase());
    const matchesRole = !showOnlyAdmins || user.role === 'admin';
    return matchesFilter && matchesRole;
  });

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading users...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Users & Admins</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 px-3 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Search users..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <div className="absolute right-3 top-2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
          <button 
            onClick={() => setShowOnlyAdmins(!showOnlyAdmins)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              showOnlyAdmins 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showOnlyAdmins ? 'Showing Admins' : 'Show All Users'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-gray-600">Email</th>
              <th className="px-4 py-3 text-gray-600">Display Name</th>
              <th className="px-4 py-3 text-gray-600">Role</th>
              <th className="px-4 py-3 text-gray-600">Balance</th>
              <th className="px-4 py-3 text-gray-600">Created At</th>
              <th className="px-4 py-3 text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <tr key={user.id} className="bg-white hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-900">{user.email}</td>
                <td className="px-4 py-3 text-gray-900">{user.displayName}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === 'superadmin'
                      ? 'bg-yellow-100 text-yellow-800'
                      : user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-yellow-600">{user.coinBalance}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.status === 'suspended' 
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 