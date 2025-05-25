import React, { useState } from 'react';
import { BettingMarket } from './MarketTabs';

interface BetSelection {
  selectionId: string;
  matchId: number;
  selection: string;
  market: BettingMarket;
  odds: number;
  side: 'back' | 'lay';
  stake: number;
}

interface PlacedBet extends BetSelection {
  betId: string;
  placedAt: Date;
  potentialWin: number;
}

interface BetSlipPanelProps {
  selections: BetSelection[];
  placedBets: PlacedBet[];
  walletBalance: number;
  onUpdateStake: (selectionId: string, stake: number) => void;
  onRemoveSelection: (selectionId: string) => void;
  onPlaceBet: (selection: BetSelection) => void;
  onClearSlip: () => void;
}

const BetSlipPanel: React.FC<BetSlipPanelProps> = ({
  selections,
  placedBets,
  walletBalance,
  onUpdateStake,
  onRemoveSelection,
  onPlaceBet,
  onClearSlip
}) => {
  const [activeTab, setActiveTab] = useState<'betslip' | 'mybets'>('betslip');
  
  // Calculate total potential payout for all active selections
  const calculateTotalStake = () => {
    return selections.reduce((total, selection) => total + (selection.stake || 0), 0);
  };
  
  const calculateTotalPotentialWin = () => {
    return selections.reduce((total, selection) => {
      const stake = selection.stake || 0;
      return total + (stake * selection.odds);
    }, 0);
  };
  
  // Set stake as percentage of wallet
  const applyStakePercentage = (selectionId: string, percentage: number) => {
    const newStake = Math.floor(walletBalance * (percentage / 100));
    onUpdateStake(selectionId, newStake);
  };
  
  // Determine if bet can be placed (stake > 0 and stake <= wallet balance)
  const canPlaceBet = (selection: BetSelection) => {
    return selection.stake > 0 && selection.stake <= walletBalance;
  };

  return (
    <div className="bg-[#0a0d14] border border-[#1a2030] rounded-lg overflow-hidden sticky top-4">
      {/* Header */}
      <div className="bg-black px-4 py-3 border-b border-[#1a2030]">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Betting Slip</h2>
          <div className="flex space-x-1 text-xs">
            <button
              className={`px-3 py-1 rounded-l ${
                activeTab === 'betslip' 
                  ? 'bg-[#25b95f] text-white' 
                  : 'bg-black text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('betslip')}
            >
              Bet Slip {selections.length > 0 && `(${selections.length})`}
            </button>
            <button
              className={`px-3 py-1 rounded-r ${
                activeTab === 'mybets' 
                  ? 'bg-[#25b95f] text-white' 
                  : 'bg-black text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('mybets')}
            >
              My Bets {placedBets.length > 0 && `(${placedBets.length})`}
            </button>
          </div>
        </div>
      </div>
      
      {/* Betslip Content */}
      {activeTab === 'betslip' && (
        <div className="p-4">
          {selections.length === 0 ? (
            <div className="text-center text-gray-400 py-6">
              <p>Your bet slip is empty</p>
              <p className="text-xs mt-2">Click on odds to add selections</p>
            </div>
          ) : (
            <>
              {/* Selection list */}
              <div className="space-y-3 mb-4">
                {selections.map(selection => (
                  <div key={selection.selectionId} className="bg-black rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-white">{selection.selection}</h4>
                        <span className="text-xs text-gray-400">
                          {selection.market} • {selection.side === 'back' ? 'Back' : 'Lay'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-sm font-bold ${selection.side === 'back' ? 'text-[#25b95f]' : 'text-[#e53935]'}`}>
                          {selection.odds.toFixed(2)}
                        </span>
                        <button 
                          onClick={() => onRemoveSelection(selection.selectionId)}
                          className="ml-2 text-gray-400 hover:text-white"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor={`stake-${selection.selectionId}`} className="text-xs text-gray-400">
                          Stake (₹)
                        </label>
                        <div className="flex space-x-1">
                          {[25, 50, 100].map(percent => (
                            <button
                              key={percent}
                              onClick={() => applyStakePercentage(selection.selectionId, percent)}
                              className="text-xs px-2 py-0.5 bg-black border border-[#1a2030] text-white rounded hover:bg-[#1a2030]"
                            >
                              {percent}%
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <input
                        id={`stake-${selection.selectionId}`}
                        type="number"
                        value={selection.stake || ''}
                        onChange={(e) => onUpdateStake(selection.selectionId, Number(e.target.value))}
                        className="w-full bg-black border border-[#1a2030] rounded py-2 px-3 text-white mb-2"
                        placeholder="Enter stake"
                        min="0"
                      />
                      
                      <div className="flex justify-between text-xs mb-3">
                        <span className="text-gray-400">Potential Win:</span>
                        <span className="text-[#25b95f] font-medium">
                          ₹{selection.stake > 0 ? (selection.stake * selection.odds).toFixed(2) : '0.00'}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => onPlaceBet(selection)}
                        disabled={!canPlaceBet(selection)}
                        className={`w-full py-2 rounded text-white font-medium 
                          ${canPlaceBet(selection) 
                            ? 'bg-[#25b95f] hover:bg-[#25b95f]/80' 
                            : 'bg-gray-600 cursor-not-allowed'
                          }`
                        }
                      >
                        Place Bet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Summary and actions */}
              <div className="border-t border-[#1a2030] pt-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-400">Total Stake:</span>
                  <span className="text-sm text-white">₹{calculateTotalStake().toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-sm text-gray-400">Potential Return:</span>
                  <span className="text-sm text-[#25b95f]">₹{calculateTotalPotentialWin().toFixed(2)}</span>
                </div>
                
                <button
                  onClick={onClearSlip}
                  className="w-full bg-black border border-[#1a2030] py-2 text-white rounded hover:bg-[#1a2030]"
                >
                  Clear Slip
                </button>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* My Bets Content */}
      {activeTab === 'mybets' && (
        <div className="p-4">
          {placedBets.length === 0 ? (
            <div className="text-center text-gray-400 py-6">
              <p>No active bets</p>
              <p className="text-xs mt-2">Place a bet to see it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {placedBets.map(bet => (
                <div key={bet.betId} className="bg-black rounded-lg p-3">
                  <div className="flex justify-between mb-1">
                    <h4 className="font-medium text-white">{bet.selection}</h4>
                    <span className={`text-sm font-bold ${bet.side === 'back' ? 'text-[#25b95f]' : 'text-[#e53935]'}`}>
                      {bet.odds.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    {bet.market} • {bet.side === 'back' ? 'Back' : 'Lay'}
                  </div>
                  
                  <div className="flex justify-between text-xs mt-2">
                    <span className="text-gray-400">Stake:</span>
                    <span className="text-white">₹{bet.stake.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Potential Win:</span>
                    <span className="text-[#25b95f]">₹{bet.potentialWin.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Placed:</span>
                    <span className="text-white">{bet.placedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BetSlipPanel; 