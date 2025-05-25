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
    <div className="bg-[#1a1f2c] h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#2a3040] flex justify-between items-center">
        <h2 className="font-bold text-white text-lg">Bet Slip</h2>
        <div className="flex space-x-1">
          <button
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              betMode === 'single' 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#2a3040] text-gray-300 hover:bg-[#343b4f]'
            }`}
            onClick={() => setBetMode('single')}
          >
            Singles
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              betMode === 'multi' 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#2a3040] text-gray-300 hover:bg-[#343b4f]'
            }`}
            onClick={() => setBetMode('multi')}
            disabled={bets.length < 2}
          >
            Multi
          </button>
        </div>
      </div>

      {/* Bet slip content */}
      <div className="flex-1 overflow-y-auto">
        {isOffline && (
          <div className="bg-yellow-500 bg-opacity-10 text-yellow-400 p-2 text-xs text-center border-b border-yellow-500 border-opacity-20">
            You are currently offline. Some features may be unavailable.
          </div>
        )}
        
        {bets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-8 text-center">
            <svg className="w-12 h-12 text-gray-500 mb-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 7L12 13L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-gray-400">{emptyMessage}</p>
            <p className="text-sm text-gray-500 mt-1">Select odds to add bets</p>
          </div>
        ) : (
          <>
            <div className="p-3">
              <div className="flex justify-between mb-3">
                <span className="text-sm text-gray-400">{bets.length} Selections</span>
                <button 
                  className="text-xs text-blue-400 hover:text-blue-300"
                  onClick={clearAllBets}
                >
                  Clear All
                </button>
              </div>

              {/* Payment Method Toggle */}
              <div className="bg-[#2a3040] rounded-md p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Payment Method</span>
                </div>
                <div className="flex border border-[#3a4050] rounded-md overflow-hidden">
                  <button
                    className={`flex-1 py-2 text-center text-sm transition-colors ${
                      paymentMethod === 'wallet'
                        ? 'bg-purple-600 text-white'
                        : 'bg-[#1a1f2c] text-gray-300 hover:bg-[#2a3040]'
                    }`}
                    onClick={() => setPaymentMethod('wallet')}
                  >
                    Wallet
                  </button>
                  <button
                    className={`flex-1 py-2 text-center text-sm transition-colors ${
                      paymentMethod === 'coins'
                        ? 'bg-purple-600 text-white'
                        : 'bg-[#1a1f2c] text-gray-300 hover:bg-[#2a3040]'
                    }`}
                    onClick={() => setPaymentMethod('coins')}
                  >
                    Coins
                  </button>
                </div>
              </div>

              {/* Wallet Info Component */}
              <WalletInfo 
                totalStake={betMode === 'single' ? totalSinglesStake : parseFloat(totalStake || '0')} 
                paymentMethod={paymentMethod}
                coinsBalance={coinsBalance}
              />

              {/* Bet selections */}
              <div className="space-y-3">
                {bets.map(bet => (
                  <div 
                    key={bet.id} 
                    className="bg-[#2a3040] rounded-md p-3 relative group"
                  >
                    <button 
                      className="absolute top-2 right-2 text-gray-500 hover:text-white"
                      onClick={() => removeBet(bet.id)}
                    >
                      ✕
                    </button>

                    <div className="flex justify-between items-start mb-1">
                      <div className="text-xs text-gray-400">
                        {bet.league}
                      </div>
                      <div className="text-xs text-gray-400">
                        {bet.time}
                      </div>
                    </div>

                    <div className="text-sm text-white mb-1">
                      {bet.match}
                    </div>

                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium text-white">
                        {bet.selection.name}
                      </div>
                      <div className="text-green-400 font-bold">
                        {bet.odds.toFixed(2)}
                      </div>
                    </div>

                    {betMode === 'single' && (
                      <div className="flex items-center mt-2">
                        <div className="w-full">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs text-gray-400">Stake</label>
                            <div className="text-xs text-gray-400">
                              Win: {formatCurrency(calculateSingleWin(bet.id))}
                            </div>
                          </div>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">$</span>
                            <input
                              type="text"
                              className="w-full bg-[#1a1f2c] rounded pl-6 py-1.5 text-right pr-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                              value={stakeValues[bet.id] || ''}
                              onChange={(e) => handleStakeChange(bet.id, e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bet slip footer */}
      {bets.length > 0 && (
        <div className="p-4 border-t border-[#2a3040]">
          {betSuccess && (
            <div className="bg-green-500 bg-opacity-10 text-green-400 p-3 rounded mb-4 text-sm">
              Bet placed successfully!
            </div>
          )}
          
          {betError && (
            <div className="bg-red-500 bg-opacity-10 text-red-400 p-3 rounded mb-4 text-sm">
              {betError}
            </div>
          )}
          
          {betMode === 'single' ? (
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1 text-sm">
                <span className="text-gray-400">Total Stake:</span>
                <span className="text-white font-medium">{formatCurrency(totalSinglesStake)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Potential Win:</span>
                <span className="text-green-400 font-bold">
                  {formatCurrency(
                    Object.keys(stakeValues).reduce(
                      (sum, betId) => sum + calculateSingleWin(betId), 
                      0
                    )
                  )}
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1 text-sm">
                <span className="text-gray-400">Total Odds:</span>
                <span className="text-white font-medium">{totalOdds.toFixed(2)}</span>
              </div>
              
              <div className="mb-3">
                <label className="text-xs text-gray-400 block mb-1">Multi Bet Stake</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">$</span>
                  <input
                    type="text"
                    className="w-full bg-[#1a1f2c] rounded pl-6 py-1.5 text-right pr-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={totalStake}
                    onChange={(e) => handleTotalStakeChange(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Potential Win:</span>
                <span className="text-green-400 font-bold">
                  {formatCurrency(isNaN(multiWin) ? 0 : multiWin)}
                </span>
              </div>
            </div>
          )}
          
          <Button 
            className="w-full py-3 bg-green-600 hover:bg-green-700 font-medium"
            onClick={placeBet}
            disabled={
              placingBet || 
              !currentUser || 
              (isOffline && paymentMethod === 'wallet') ||
              (betMode === 'single' ? totalSinglesStake > currentBalance : parseFloat(totalStake) > currentBalance)
            }
          >
            {placingBet ? 'Processing...' : (isOffline && paymentMethod === 'wallet') ? 'Offline' : 'Place Bet'}
          </Button>
          
          {!currentUser && (
            <p className="text-xs text-center text-gray-400 mt-2">
              Please log in to place bets
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BetSlip; 