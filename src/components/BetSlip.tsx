import React, { useState, useEffect } from 'react';
import Button from './Button';
import WalletInfo from './WalletInfo';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, OfflineError } from '@/firebase/config';

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
    <div className="w-96 h-full flex flex-col border-l border-gray-200 bg-white">
      {/* Bet slip header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Bet Slip</h2>
          <div className="flex space-x-1">
            <button
              className={`px-3 py-1 text-sm rounded-full ${
                betMode === 'single' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setBetMode('single')}
            >
              Singles
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-full ${
                betMode === 'multi' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setBetMode('multi')}
            >
              Multi
            </button>
          </div>
        </div>
      </div>

      {/* Bet items */}
      <div className="flex-1 overflow-y-auto">
        {bets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">{emptyMessage}</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {bets.map((bet) => (
              <div key={bet.id} className="p-4 bg-white hover:bg-gray-50">
                <div className="flex justify-between">
                  <div className="text-xs text-gray-500">{bet.league}</div>
                  <div className="text-xs text-gray-500">{bet.time}</div>
                </div>
                
                <div className="mt-1 text-sm font-medium text-gray-800">{bet.match}</div>
                
                <div className="mt-2 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      {bet.selection.name}
                    </span>
                    <span className="text-purple-800 font-semibold">{bet.odds.toFixed(2)}</span>
                  </div>
                  
                  <button 
                    onClick={() => removeBet(bet.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {betMode === 'single' && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <label htmlFor={`stake-${bet.id}`} className="text-xs text-gray-600">
                        Stake
                      </label>
                      <div className="text-xs text-gray-600">
                        Potential win: {formatCurrency(calculateSingleWin(bet.id))}
                      </div>
                    </div>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        id={`stake-${bet.id}`}
                        className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        value={stakeValues[bet.id] || ''}
                        onChange={(e) => handleStakeChange(bet.id, e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wallet info & bet actions */}
      {bets.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-white">
          {/* Toggle between wallet and coins */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-700">Pay with</span>
            <div 
              className="flex items-center cursor-pointer"
              onClick={togglePaymentMethod}
            >
              <div className={`w-12 h-6 rounded-full p-1 ${paymentMethod === 'coins' ? 'bg-yellow-400' : 'bg-green-500'}`}>
                <div 
                  className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                    paymentMethod === 'coins' ? 'translate-x-6' : ''
                  }`}
                ></div>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">
                {paymentMethod === 'wallet' ? 'Wallet' : 'Coins'}
              </span>
            </div>
          </div>
          
          {/* Wallet/Coins balance */}
          <WalletInfo 
            totalStake={betMode === 'single' ? totalSinglesStake : parseFloat(totalStake || '0')}
            paymentMethod={paymentMethod}
            coinsBalance={coinsBalance}
          />
          
          {betMode === 'multi' && (
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Total Odds</span>
                <span className="text-sm font-medium text-gray-800">{totalOdds.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="multi-stake" className="text-sm text-gray-600">
                  Stake
                </label>
                <div className="text-sm text-gray-600">
                  Potential win: {formatCurrency(multiWin)}
                </div>
              </div>
              
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="multi-stake"
                  className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="0.00"
                  value={totalStake}
                  onChange={(e) => handleTotalStakeChange(e.target.value)}
                />
              </div>
            </div>
          )}
          
          {betMode === 'single' && (
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Total Stake</span>
                <span className="text-sm font-medium text-gray-800">{formatCurrency(totalSinglesStake)}</span>
              </div>
              
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Potential Returns</span>
                <span className="text-sm font-medium text-gray-800">
                  {formatCurrency(Object.keys(stakeValues).reduce(
                    (total, betId) => total + calculateSingleWin(betId), 0
                  ))}
                </span>
              </div>
            </div>
          )}
          
          {betError && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              {betError}
            </div>
          )}
          
          {betSuccess && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
              Your bet has been placed successfully!
            </div>
          )}
          
          <div className="mt-4 flex space-x-2">
            <Button 
              onClick={clearAllBets}
              className="flex-1 bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 py-2"
            >
              Clear All
            </Button>
            
            <Button 
              onClick={placeBet}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2"
              disabled={placingBet}
            >
              {placingBet ? 'Processing...' : 'Place Bet'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BetSlip; 