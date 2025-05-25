'use client';

import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { collection, query, where, getDocs, orderBy, limit, startAfter, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface Bet {
  id: string;
  userId: string;
  userEmail?: string;
  sport: string;
  market: string;
  stake: number;
  odds: number;
  status: 'pending' | 'won' | 'lost' | 'void' | 'cash_out';
  createdAt: any;
}

const AdminBetsPage: React.FC = () => {
  const { isAdmin } = useAdmin();
  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isSettling, setIsSettling] = useState<{[key: string]: boolean}>({});
  const [currentPage, setCurrentPage] = useState(1);
  const betsPerPage = 20;

  const fetchBets = async (isLoadMore = false) => {
    if (!isAdmin || !db) return;
    
    setIsLoading(true);
    try {
      let betsQuery;
      
      if (isLoadMore && lastVisible) {
        betsQuery = query(
          collection(db, 'transactions'),
          where('type', '==', 'bet'),
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(betsPerPage)
        );
      } else {
        betsQuery = query(
          collection(db, 'transactions'),
          where('type', '==', 'bet'),
          orderBy('createdAt', 'desc'),
          limit(betsPerPage)
        );
      }
      
      const betsSnapshot = await getDocs(betsQuery);
      const lastVisibleDoc = betsSnapshot.docs[betsSnapshot.docs.length - 1];
      
      // Check if there are more results
      if (betsSnapshot.docs.length < betsPerPage) {
        setHasMore(false);
      } else {
        setHasMore(true);
        setLastVisible(lastVisibleDoc);
      }
      
      const betsData = await Promise.all(betsSnapshot.docs.map(async betDoc => {
        const bet = betDoc.data() as Bet;
        bet.id = betDoc.id;
        
        // Get user email if userId exists
        if (bet.userId) {
          try {
            const userRef = doc(db, 'users', bet.userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              const userData = userDoc.data();
              bet.userEmail = userData.email as string;
            }
          } catch (error) {
            console.error("Error fetching user:", error);
          }
        }
        
        return bet;
      }));
      
      if (isLoadMore) {
        setBets(prevBets => [...prevBets, ...betsData]);
        setCurrentPage(prevPage => prevPage + 1);
      } else {
        setBets(betsData);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error fetching bets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBets();
  }, [isAdmin]);

  const handleLoadMore = () => {
    fetchBets(true);
  };

  const handleForceSettle = async (betId: string, status: 'won' | 'lost' | 'void') => {
    if (!db) return;
    
    setIsSettling(prev => ({ ...prev, [betId]: true }));
    
    try {
      const betRef = doc(db, 'transactions', betId);
      const betDoc = await getDoc(betRef);
      
      if (!betDoc.exists()) {
        console.error("Bet not found");
        return;
      }
      
      const betData = betDoc.data();
      
      // Update bet status
      await updateDoc(betRef, {
        status,
        settledAt: new Date().toISOString(),
        settledBy: 'admin'
      });
      
      // If bet is won, award the winnings to the user
      if (status === 'won' && betData.userId) {
        const userRef = doc(db, 'users', betData.userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const winnings = betData.stake * betData.odds;
          
          await updateDoc(userRef, {
            coinBalance: (userData.coinBalance || 0) + winnings
          });
        }
      }
      
      // If bet is void, return the stake to the user
      if (status === 'void' && betData.userId) {
        const userRef = doc(db, 'users', betData.userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          await updateDoc(userRef, {
            coinBalance: (userData.coinBalance || 0) + betData.stake
          });
        }
      }
      
      // Refresh bets list
      fetchBets();
      
    } catch (error) {
      console.error("Error settling bet:", error);
    } finally {
      setIsSettling(prev => ({ ...prev, [betId]: false }));
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
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'won':
        return 'bg-green-900 bg-opacity-30 text-green-400';
      case 'lost':
        return 'bg-red-900 bg-opacity-30 text-red-400';
      case 'void':
        return 'bg-gray-700 bg-opacity-30 text-gray-400';
      case 'cash_out':
        return 'bg-yellow-900 bg-opacity-30 text-yellow-400';
      default:
        return 'bg-blue-900 bg-opacity-30 text-blue-400';
    }
  };

  return (
    <div className="bg-[#1a1f2c] rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-[#363e52]">
        <h2 className="text-xl font-semibold">Bets Management</h2>
        <p className="text-sm text-gray-400 mt-1">
          View all bet transactions and manage their settlement
        </p>
      </div>

      {isLoading && bets.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : bets.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No bets found
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-xs text-gray-400 uppercase bg-[#242a38]">
                <tr>
                  <th className="px-6 py-3 text-left">User</th>
                  <th className="px-6 py-3 text-left">Sport</th>
                  <th className="px-6 py-3 text-left">Market</th>
                  <th className="px-6 py-3 text-right">Stake</th>
                  <th className="px-6 py-3 text-right">Odds</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#363e52]">
                {bets.map((bet) => (
                  <tr 
                    key={bet.id} 
                    className="hover:bg-[#242a38] transition-colors"
                  >
                    <td className="px-6 py-4">
                      {bet.userEmail || bet.userId || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {bet.sport || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      {bet.market || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      ${bet.stake?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {bet.odds?.toFixed(2) || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(bet.status)}`}>
                        {bet.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {formatDate(bet.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {bet.status === 'pending' ? (
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleForceSettle(bet.id, 'won')}
                            disabled={isSettling[bet.id]}
                            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                          >
                            Win
                          </button>
                          <button
                            onClick={() => handleForceSettle(bet.id, 'lost')}
                            disabled={isSettling[bet.id]}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          >
                            Lose
                          </button>
                          <button
                            onClick={() => handleForceSettle(bet.id, 'void')}
                            disabled={isSettling[bet.id]}
                            className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                          >
                            Void
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-[#363e52] flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Page {currentPage}
            </div>
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center"
              >
                {isLoading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Load More
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminBetsPage; 