import React, { useState, useEffect, memo } from 'react';
import { collection, query, where, onSnapshot, DocumentData, Query } from 'firebase/firestore';
import { db, OfflineError, checkOnlineStatus } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import BetCard from './BetCard';

// Type for Bet
interface MatchBet {
  id: string;
  userId: string;
  matchId: number;
  match: string;
  selection: string;
  odds: number;
  stake: number;
  potentialWin: number;
  status: 'live' | 'settled' | 'cashout';
  createdAt: string;
  settled?: {
    payout: number;
    settledAt: string;
  };
}

interface LiveBetsSectionProps {
  onCashOut: (betId: string) => void;
}

const LiveBetsSection: React.FC<LiveBetsSectionProps> = ({ onCashOut }) => {
  const [liveBets, setLiveBets] = useState<MatchBet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(!checkOnlineStatus());
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

  // Subscribe to live bets with real-time updates
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      setLiveBets([]);
      return;
    }

    setLoading(true);
    setError(null);

    // Create query for live bets for current user
    let betsQuery: Query<DocumentData> | null = null;
    try {
      betsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid),
        where('status', '==', 'live'),
        where('type', '==', 'bet')
      );
    } catch (err) {
      console.error('Error creating query:', err);
      setLoading(false);
      setError('Failed to create query for live bets');
      return;
    }

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      betsQuery,
      (snapshot) => {
        const bets: MatchBet[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // Extract data with fallbacks for different formats
          const matchId = data.matchId || 0;
          const match = data.match || 'Unknown Match';
          const selection = data.selection || 'Unknown Selection';
          const odds = data.odds || 1.0;
          const stake = data.stake || 0;
          const potentialWin = data.potentialWin || (stake * odds);
          
          // Format creation time
          let createdAt = '';
          if (data.createdAt?.toDate) {
            createdAt = data.createdAt.toDate().toISOString();
          } else if (data.timestamp?.toDate) {
            createdAt = data.timestamp.toDate().toISOString();
          } else if (data.createdAt) {
            createdAt = data.createdAt;
          } else if (data.timestamp) {
            createdAt = data.timestamp;
          } else {
            createdAt = new Date().toISOString();
          }
          
          bets.push({
            id: doc.id,
            userId: data.userId,
            matchId,
            match,
            selection,
            odds,
            stake,
            potentialWin,
            status: data.status || 'live',
            createdAt
          });
        });
        setLiveBets(bets);
        setLoading(false);
      },
      (err) => {
        console.error('Error getting live bets:', err);
        if (!checkOnlineStatus()) {
          setError('You are offline. Some data may not be up-to-date.');
        } else {
          setError('Could not load live bets — retrying...');
        }
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-center min-w-[270px] h-[200px] bg-[#2a3040] rounded-lg flex-shrink-0">
              <div className="animate-spin h-8 w-8 border-4 border-purple-600 rounded-full border-t-transparent"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 text-red-400 p-4 rounded-lg flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        {error}
      </div>
    );
  }

  if (liveBets.length === 0) {
    return (
      <div className="bg-white rounded-lg p-5 text-center border border-gray-200 shadow">
        <p className="text-gray-500">No live bets at the moment</p>
        <button 
          className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
          onClick={() => window.location.href = '/sports'}
        >
          Place Your First Bet
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex space-x-4">
        {liveBets.map(bet => (
          <MemoizedBetCard
            key={bet.id}
            betId={bet.id}
            match={bet.match}
            selection={bet.selection}
            odds={bet.odds}
            stake={bet.stake}
            potentialWin={bet.potentialWin}
            status={bet.status}
            onCashOut={onCashOut}
          />
        ))}
      </div>
    </div>
  );
};

// Memoize BetCard to prevent unnecessary re-renders
const MemoizedBetCard = memo(BetCard);

export default LiveBetsSection; 