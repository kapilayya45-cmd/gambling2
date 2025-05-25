"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Define types for bet selections
export interface MatchOdds {
  id: string;
  matchId: number;
  sport: string; 
  match: string;
  teamA: string;
  teamB: string;
  time: string;
  league: string;
  odds: {
    teamA: number;
    draw: number;
    teamB: number;
  };
}

export interface BetSelection {
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

interface BetStakes {
  [betId: string]: number;
}

// Define BetSlip context type
interface BetSlipContextType {
  selections: BetSelection[];
  stakes: BetStakes;
  betMode: 'single' | 'multi';
  multiStake: number;
  totalSinglesStake: number;
  totalOdds: number;
  potentialWinnings: number;
  addSelection: (matchOdds: MatchOdds, selectionType: 'teamA' | 'draw' | 'teamB') => void;
  removeSelection: (selectionId: string) => void;
  clearSelections: () => void;
  setBetMode: (mode: 'single' | 'multi') => void;
  updateStake: (selectionId: string, amount: number) => void;
  updateMultiStake: (amount: number) => void;
}

// Create context
const BetSlipContext = createContext<BetSlipContextType | undefined>(undefined);

// Custom hook to use BetSlip context
export function useBetSlip() {
  const context = useContext(BetSlipContext);
  if (context === undefined) {
    throw new Error('useBetSlip must be used within a BetSlipProvider');
  }
  return context;
}

interface BetSlipProviderProps {
  children: ReactNode;
}

// BetSlip provider component
export function BetSlipProvider({ children }: BetSlipProviderProps) {
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [stakes, setStakes] = useState<BetStakes>({});
  const [betMode, setBetMode] = useState<'single' | 'multi'>('single');
  const [multiStake, setMultiStake] = useState<number>(10);
  const { currentUser } = useAuth();

  // Calculate total odds for accumulator bet
  const totalOdds = selections.reduce((acc, selection) => acc * selection.odds, 1);

  // Calculate total stakes for all single bets
  const totalSinglesStake = Object.values(stakes).reduce((sum, stake) => sum + (stake || 0), 0);

  // Calculate potential winnings based on bet mode
  const potentialWinnings = betMode === 'single'
    ? selections.reduce((sum, selection) => sum + (stakes[selection.id] || 0) * selection.odds, 0)
    : multiStake * totalOdds;

  // Initialize stakes when selections change
  useEffect(() => {
    const newStakes = { ...stakes };
    let changed = false;

    // Add default stakes for new selections
    selections.forEach(selection => {
      if (newStakes[selection.id] === undefined) {
        newStakes[selection.id] = 5; // Default stake
        changed = true;
      }
    });

    // Remove stakes for removed selections
    Object.keys(newStakes).forEach(id => {
      if (!selections.some(selection => selection.id === id)) {
        delete newStakes[id];
        changed = true;
      }
    });

    if (changed) {
      setStakes(newStakes);
    }
  }, [selections]);

  // Load saved selections from localStorage when user logs in
  useEffect(() => {
    if (currentUser) {
      try {
        const savedSelectionsJson = localStorage.getItem(`betslip_${currentUser.uid}`);
        if (savedSelectionsJson) {
          const savedData = JSON.parse(savedSelectionsJson);
          setSelections(savedData.selections || []);
          setStakes(savedData.stakes || {});
          setBetMode(savedData.betMode || 'single');
          setMultiStake(savedData.multiStake || 10);
        }
      } catch (error) {
        console.error('Error loading bet slip data', error);
      }
    }
  }, [currentUser]);

  // Save selections to localStorage when they change
  useEffect(() => {
    if (currentUser && selections.length > 0) {
      try {
        localStorage.setItem(`betslip_${currentUser.uid}`, JSON.stringify({
          selections,
          stakes,
          betMode,
          multiStake
        }));
      } catch (error) {
        console.error('Error saving bet slip data', error);
      }
    }
  }, [selections, stakes, betMode, multiStake, currentUser]);

  // Add a selection to the bet slip
  const addSelection = (matchOdds: MatchOdds, selectionType: 'teamA' | 'draw' | 'teamB') => {
    // Generate a unique ID for the selection
    const selectionId = `${matchOdds.matchId}_${selectionType}`;
    
    // Check if selection already exists
    const existingSelectionIndex = selections.findIndex(s => s.id === selectionId);
    
    if (existingSelectionIndex !== -1) {
      // Remove the selection if it's already in the betslip (toggle behavior)
      removeSelection(selectionId);
      return;
    }
    
    // Get the selection details
    let selectionName: string;
    let oddsValue: number;
    
    switch (selectionType) {
      case 'teamA':
        selectionName = matchOdds.teamA;
        oddsValue = matchOdds.odds.teamA;
        break;
      case 'draw':
        selectionName = 'Draw';
        oddsValue = matchOdds.odds.draw;
        break;
      case 'teamB':
        selectionName = matchOdds.teamB;
        oddsValue = matchOdds.odds.teamB;
        break;
    }
    
    const newSelection: BetSelection = {
      id: selectionId,
      matchId: matchOdds.matchId,
      sport: matchOdds.sport,
      match: matchOdds.match,
      selection: {
        type: selectionType,
        name: selectionName
      },
      odds: oddsValue,
      time: matchOdds.time,
      league: matchOdds.league
    };
    
    setSelections(prev => [...prev, newSelection]);
  };

  // Remove a selection from the bet slip
  const removeSelection = (selectionId: string) => {
    setSelections(prev => prev.filter(selection => selection.id !== selectionId));
    
    // Also update stakes
    setStakes(prev => {
      const updated = { ...prev };
      delete updated[selectionId];
      return updated;
    });
  };

  // Clear all selections
  const clearSelections = () => {
    setSelections([]);
    setStakes({});
  };

  // Update stake for a single bet
  const updateStake = (selectionId: string, amount: number) => {
    if (amount < 0) return;
    
    setStakes(prev => ({
      ...prev,
      [selectionId]: amount
    }));
  };

  // Update stake for multi bet
  const updateMultiStake = (amount: number) => {
    if (amount < 0) return;
    setMultiStake(amount);
  };

  // Switch between single and multi bet modes
  const changeBetMode = (mode: 'single' | 'multi') => {
    setBetMode(mode);
  };

  const value = {
    selections,
    stakes,
    betMode,
    multiStake,
    totalSinglesStake,
    totalOdds,
    potentialWinnings,
    addSelection,
    removeSelection,
    clearSelections,
    setBetMode: changeBetMode,
    updateStake,
    updateMultiStake
  };

  return (
    <BetSlipContext.Provider value={value}>
      {children}
    </BetSlipContext.Provider>
  );
} 