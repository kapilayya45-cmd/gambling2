import React, { useState, useEffect } from 'react';
import Button from './Button';
import WalletInfo from './WalletInfo';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, OfflineError } from '@/firebase/config';
import { X } from 'lucide-react';

// Payment method type
type PaymentMethod = 'wallet' | 'coins';

interface BetItem {
  id: string;
  matchId: number;
  sport: string;
  match: string;
  selection: {
    type: 'teamA' | 'draw' | 'teamB';
    name: string;
  };
  odds: number;
  time: string;
  league: string;
}

const BetSlip: React.FC = () => {
  // Sample bet items - in a real app these would come from state management
  const [bets, setBets] = useState<BetItem[]>([
    {
      id: 'bet-1',
      matchId: 1,
      sport: 'cricket',
      match: 'Mumbai Indians vs Chennai Super Kings',
      selection: {
        type: 'teamA',
        name: 'Mumbai Indians'
      },
      odds: 2.1,
      time: '19:30',
      league: 'IPL 2023'
    },
    {
      id: 'bet-2',
      matchId: 4,
      sport: 'football',
      match: 'Barcelona vs Real Madrid',
      selection: {
        type: 'draw',
        name: 'Draw'
      },
      odds: 3.5,
      time: '20:00',
      league: 'La Liga'
    }
  ]);

  const [stakeValues, setStakeValues] = useState<{ [key: string]: string }>({});
  const [totalStake, setTotalStake] = useState<string>('10');
  const [betMode, setBetMode] = useState<'single' | 'multi'>('single');
  const [placingBet, setPlacingBet] = useState<boolean>(false);
  const [betSuccess, setBetSuccess] = useState<boolean>(false);
  const [betError, setBetError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet');
  const emptyMessage = "Your bet slip is empty";

  const { currentUser } = useAuth();
  const { balance: walletBalance, withdraw, getTransactions, isOffline } = useWallet();
  
  // Mock coins balance - in a real app this would come from a context
  const [coinsBalance, setCoinsBalance] = useState<number>(500);

  // Get the current balance based on payment method
  const currentBalance = paymentMethod === 'wallet' ? walletBalance : coinsBalance;

  // Calculate total odds for accumulator
  const totalOdds = bets.reduce((acc, bet) => acc * bet.odds, 1);
  
  // Calculate potential winnings for single bets
  const calculateSingleWin = (betId: string): number => {
    const bet = bets.find(b => b.id === betId);
    const stake = parseFloat(stakeValues[betId] || '0');
    if (bet && !isNaN(stake)) {
      return stake * bet.odds;
    }
    return 0;
  };

  // Calculate total singles stake
  const totalSinglesStake = Object.values(stakeValues).reduce((sum, stake) => {
    const value = parseFloat(stake || '0');
    return sum + (isNaN(value) ? 0 : value);
  }, 0);
  
  // Calculate multi bet win
  const multiWin = parseFloat(totalStake) * totalOdds;

  // Set default stake for each bet
  useEffect(() => {
    // Initialize each bet with a default stake
    const initialStakes: { [key: string]: string } = {};
    bets.forEach(bet => {
      initialStakes[bet.id] = stakeValues[bet.id] || '5';
    });
    setStakeValues(initialStakes);
  }, [bets.length]);

  // Handle stake change for individual bets
  const handleStakeChange = (betId: string, value: string) => {
    setStakeValues({
      ...stakeValues,
      [betId]: value
    });
  };

  // Handle total multi stake change
  const handleTotalStakeChange = (value: string) => {
    setTotalStake(value);
  };

  // Remove a bet from the slip
  const removeBet = (betId: string) => {
    setBets(bets.filter(bet => bet.id !== betId));
    
    // Also remove from stake values
    const newStakeValues = { ...stakeValues };
    delete newStakeValues[betId];
    setStakeValues(newStakeValues);
  };

  // Clear all bets
  const clearAllBets = () => {
    setBets([]);
    setStakeValues({});
  };

  // Toggle payment method
  const togglePaymentMethod = () => {
    setPaymentMethod(prev => prev === 'wallet' ? 'coins' : 'wallet');
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  // Listen for offline events to show appropriate error messages
  useEffect(() => {
    if (isOffline && paymentMethod === 'wallet') {
      setBetError('You are currently offline. Some features may be unavailable.');
    } else {
      setBetError(null);
    }
  }, [isOffline, paymentMethod]);

  // Place bet
  const placeBet = async () => {
    if (!currentUser) {
      setBetError('You must be logged in to place a bet');
      return;
    }
    
    if (!db) {
      setBetError('Service unavailable. Please try again later.');
      return;
    }
    
    if (isOffline && paymentMethod === 'wallet') {
      setBetError('You are currently offline. Please check your internet connection and try again.');
      return;
    }
    
    // Validate stake amounts
    if (betMode === 'single') {
      if (totalSinglesStake <= 0) {
        setBetError('Please enter stake amounts for your bets');
        return;
      }
      
      if (totalSinglesStake > currentBalance) {
        setBetError(`Insufficient ${paymentMethod} balance`);
        return;
      }
    } else { // Multi bet
      if (!totalStake || parseFloat(totalStake) <= 0) {
        setBetError('Please enter a stake amount');
        return;
      }
      
      if (parseFloat(totalStake) > currentBalance) {
        setBetError(`Insufficient ${paymentMethod} balance`);
        return;
      }
    }
    
    const stakeAmount = betMode === 'single' ? totalSinglesStake : parseFloat(totalStake || '0');
    
    setBetError(null);
    setPlacingBet(true);

    try {
      if (paymentMethod === 'wallet') {
        // Withdraw from wallet
        await withdraw(stakeAmount);
      } else {
        // Deduct from coins
        setCoinsBalance(prev => prev - stakeAmount);
      }
      
      // Record the bet transaction
      const betDescription = betMode === 'single' 
        ? `Bet on ${bets.length} selections` 
        : `Multi bet with ${bets.length} selections`;
      
      // In a real app, you would submit the bet to your backend here
      // and get a bet reference or ID
      // For our example, we'll create the transaction directly
      await addDoc(collection(db, 'transactions'), {
        userId: currentUser.uid,
        type: 'bet',
        amount: stakeAmount,
        timestamp: Timestamp.now(),
        description: betDescription,
        status: 'completed',
        paymentMethod: paymentMethod,
        betDetails: {
          mode: betMode,
          selections: bets.map(bet => ({
            match: bet.match,
            selection: bet.selection.name,
            odds: bet.odds,
            stake: betMode === 'single' ? parseFloat(stakeValues[bet.id] || '0') : null
          })),
          totalOdds: betMode === 'multi' ? totalOdds : null
        }
      });

      // Refresh transactions
      getTransactions();
      
      // Show success message and clear bets
      setBetSuccess(true);
      clearAllBets();
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setBetSuccess(false);
      }, 3000);
    } catch (error: any) {
      if (error instanceof OfflineError) {
        setBetError('Cannot place bet while offline. Please check your connection.');
      } else {
        setBetError(error.message || 'Failed to place bet');
      }
    } finally {
      setPlacingBet(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white shadow-lg md:w-80 md:border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-800">Bet Slip</h2>
          <span className="px-2 py-0.5 text-sm bg-gray-200 text-gray-700 rounded-full">
            {bets.length}
          </span>
        </div>
        <button
          onClick={clearAllBets}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Clear All
        </button>
      </div>

      {/* Bet Mode Toggle */}
      <div className="flex p-2 bg-gray-50 border-b border-gray-200">
        <button
          className={`flex-1 py-2 text-sm font-medium rounded-l-lg ${
            betMode === 'single'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setBetMode('single')}
        >
          Single
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium rounded-r-lg ${
            betMode === 'multi'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setBetMode('multi')}
        >
          Multi
        </button>
      </div>

      {/* Bets List */}
      <div className="flex-1 overflow-y-auto">
        {bets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <svg
              className="w-12 h-12 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-center">{emptyMessage}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {bets.map((bet) => (
              <div key={bet.id} className="p-4 relative">
                <button
                  onClick={() => removeBet(bet.id)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {bet.league}
                    </span>
                    <span className="text-sm text-gray-500">{bet.time}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{bet.match}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600">
                      {bet.selection.name}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {bet.odds.toFixed(2)}
                    </span>
                  </div>
                </div>

                {betMode === 'single' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stake
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={stakeValues[bet.id] || ''}
                        onChange={(e) => handleStakeChange(bet.id, e.target.value)}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                      <div className="text-sm text-gray-500">
                        Win: {formatCurrency(calculateSingleWin(bet.id))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {bets.length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
          {/* Payment Method Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Pay with:</span>
            <button
              onClick={togglePaymentMethod}
              className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-full hover:bg-gray-200"
            >
              <span className="text-sm font-medium">
                {paymentMethod === 'wallet' ? 'Wallet' : 'Coins'}
              </span>
              <span className="text-sm text-gray-500">
                ({formatCurrency(currentBalance)})
              </span>
            </button>
          </div>

          {betMode === 'multi' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Stake
                </label>
                <input
                  type="number"
                  value={totalStake}
                  onChange={(e) => handleTotalStakeChange(e.target.value)}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Odds:</span>
                <span className="font-medium">{totalOdds.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Potential Win:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(multiWin)}
                </span>
              </div>
            </>
          )}

          {betMode === 'single' && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Stake:</span>
              <span className="font-medium">
                {formatCurrency(totalSinglesStake)}
              </span>
            </div>
          )}

          {betError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {betError}
            </div>
          )}

          <Button
            onClick={placeBet}
            disabled={placingBet || bets.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {placingBet ? 'Placing Bet...' : 'Place Bet'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BetSlip; 