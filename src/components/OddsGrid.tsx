import React, { useState } from 'react';
import { CricketFixture } from '@/services/cricketApi';

// Extended CricketFixture type that includes team names and odds
interface EnrichedCricketFixture extends CricketFixture {
  teamA?: string; // Team name instead of ID
  teamB?: string; // Team name instead of ID
  odds?: {
    teamA: { back: number; lay: number };
    teamB: { back: number; lay: number };
    draw: { back: number; lay: number };
  };
}

interface OddsSelectionInfo {
  eventId: number;
  market: 'match' | 'teamA' | 'teamB';
  selection: string;
  side: 'back' | 'lay';
  odds: number;
}

interface BetPlacementInfo extends OddsSelectionInfo {
  stake: number;
}

interface OddsGridProps {
  events: EnrichedCricketFixture[];
  onSelect: (selection: OddsSelectionInfo) => void;
  onPlaceBet?: (bet: BetPlacementInfo) => void;
}

const OddsGrid: React.FC<OddsGridProps> = ({ events, onSelect, onPlaceBet }) => {
  // Helper to generate random odds for demonstration if not provided
  const getRandomOdds = (): number => {
    return parseFloat((Math.random() * 3 + 1.1).toFixed(2));
  };
  
  // State for tracking selected odds for bet form
  const [selectedOdds, setSelectedOdds] = useState<OddsSelectionInfo | null>(null);
  const [stake, setStake] = useState<number>(10);
  
  // Calculate potential payout
  const potentialPayout = selectedOdds ? (selectedOdds.odds * stake).toFixed(2) : "0.00";
  
  // Handle odds button click
  const handleOddsClick = (selection: OddsSelectionInfo) => {
    // If the same button is clicked again, close the form
    if (selectedOdds && 
        selectedOdds.eventId === selection.eventId &&
        selectedOdds.market === selection.market &&
        selectedOdds.side === selection.side) {
      setSelectedOdds(null);
    } else {
      // Otherwise open the form for the selected odds
      setSelectedOdds(selection);
    }
    
    // Call the onSelect callback
    onSelect(selection);
  };
  
  // Handle place bet button click
  const handlePlaceBet = () => {
    if (selectedOdds && stake > 0 && onPlaceBet) {
      onPlaceBet({
        ...selectedOdds,
        stake
      });
      
      // Reset form and selection after placing bet
      setSelectedOdds(null);
      setStake(10);
    }
  };

  return (
    <div className="space-y-6">
      {events.map((event, eventIndex) => {
        // Use team names if available, otherwise use IDs
        const teamA = event.teamA || `Team ${event.localteam_id}`;
        const teamB = event.teamB || `Team ${event.visitorteam_id}`;
        
        // Use provided odds or generate random ones
        const odds = event.odds || {
          teamA: { back: getRandomOdds(), lay: getRandomOdds() },
          teamB: { back: getRandomOdds(), lay: getRandomOdds() },
          draw: { back: getRandomOdds(), lay: getRandomOdds() }
        };

        return (
          <div key={event.id} className="rounded-lg overflow-hidden border border-gray-800">
            {/* Event header */}
            <div className="bg-gray-900 p-3 flex justify-between items-center">
              <h3 className="font-semibold text-white">{teamA} vs {teamB}</h3>
              <span className="text-xs px-2 py-0.5 bg-red-600 rounded-full text-white">LIVE</span>
            </div>
            
            {/* Odds table */}
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800">
                  <th className="text-left p-3 border-b border-gray-700 text-gray-300">Selection</th>
                  <th className="text-center p-3 border-b border-gray-700 text-gray-300">Back Odds</th>
                  <th className="text-center p-3 border-b border-gray-700 text-gray-300">Lay Odds</th>
                </tr>
              </thead>
              <tbody>
                {/* Match Odds row */}
                <tr className="bg-gray-900">
                  <td className="p-3 border-b border-gray-700 text-gray-200">Match Odds</td>
                  <td className="text-center p-3 border-b border-gray-700">
                    <button 
                      className={`bg-green-700 hover:bg-green-600 px-4 py-1.5 rounded text-white font-medium transition-colors ${
                        selectedOdds && 
                        selectedOdds.eventId === event.id && 
                        selectedOdds.market === 'match' && 
                        selectedOdds.side === 'back' ? 'ring-2 ring-white' : ''
                      }`}
                      onClick={() => handleOddsClick({
                        eventId: event.id,
                        market: 'match',
                        selection: 'Match Odds',
                        side: 'back',
                        odds: odds.draw.back
                      })}
                    >
                      {odds.draw.back}
                    </button>
                  </td>
                  <td className="text-center p-3 border-b border-gray-700">
                    <button 
                      className={`bg-red-700 hover:bg-red-600 px-4 py-1.5 rounded text-white font-medium transition-colors ${
                        selectedOdds && 
                        selectedOdds.eventId === event.id && 
                        selectedOdds.market === 'match' && 
                        selectedOdds.side === 'lay' ? 'ring-2 ring-white' : ''
                      }`}
                      onClick={() => handleOddsClick({
                        eventId: event.id,
                        market: 'match',
                        selection: 'Match Odds',
                        side: 'lay',
                        odds: odds.draw.lay
                      })}
                    >
                      {odds.draw.lay}
                    </button>
                  </td>
                </tr>
                
                {/* Inline bet form for Match Odds */}
                {selectedOdds && 
                 selectedOdds.eventId === event.id && 
                 selectedOdds.market === 'match' && (
                  <tr className="bg-gray-800">
                    <td colSpan={3} className="p-4 border-b border-gray-700">
                      <div className="p-3 bg-gray-900 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-gray-300">
                            {selectedOdds.selection} ({selectedOdds.side === 'back' ? 'Back' : 'Lay'} @ {selectedOdds.odds})
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Stake</label>
                            <input 
                              type="number" 
                              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white" 
                              value={stake}
                              onChange={(e) => setStake(Math.max(0, Number(e.target.value)))}
                              min="0"
                              step="1"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Odds</label>
                            <div className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                              {selectedOdds.odds}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Potential Payout</label>
                            <div className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                              {potentialPayout}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button 
                            className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded text-white font-medium transition-colors"
                            onClick={handlePlaceBet}
                          >
                            Place Bet
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                
                {/* Team A row */}
                <tr className="bg-gray-800">
                  <td className="p-3 border-b border-gray-700 text-gray-200">{teamA}</td>
                  <td className="text-center p-3 border-b border-gray-700">
                    <button 
                      className={`bg-green-700 hover:bg-green-600 px-4 py-1.5 rounded text-white font-medium transition-colors ${
                        selectedOdds && 
                        selectedOdds.eventId === event.id && 
                        selectedOdds.market === 'teamA' && 
                        selectedOdds.side === 'back' ? 'ring-2 ring-white' : ''
                      }`}
                      onClick={() => handleOddsClick({
                        eventId: event.id,
                        market: 'teamA',
                        selection: teamA,
                        side: 'back',
                        odds: odds.teamA.back
                      })}
                    >
                      {odds.teamA.back}
                    </button>
                  </td>
                  <td className="text-center p-3 border-b border-gray-700">
                    <button 
                      className={`bg-red-700 hover:bg-red-600 px-4 py-1.5 rounded text-white font-medium transition-colors ${
                        selectedOdds && 
                        selectedOdds.eventId === event.id && 
                        selectedOdds.market === 'teamA' && 
                        selectedOdds.side === 'lay' ? 'ring-2 ring-white' : ''
                      }`}
                      onClick={() => handleOddsClick({
                        eventId: event.id,
                        market: 'teamA',
                        selection: teamA,
                        side: 'lay',
                        odds: odds.teamA.lay
                      })}
                    >
                      {odds.teamA.lay}
                    </button>
                  </td>
                </tr>
                
                {/* Inline bet form for Team A */}
                {selectedOdds && 
                 selectedOdds.eventId === event.id && 
                 selectedOdds.market === 'teamA' && (
                  <tr className="bg-gray-800">
                    <td colSpan={3} className="p-4 border-b border-gray-700">
                      <div className="p-3 bg-gray-900 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-gray-300">
                            {selectedOdds.selection} ({selectedOdds.side === 'back' ? 'Back' : 'Lay'} @ {selectedOdds.odds})
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Stake</label>
                            <input 
                              type="number" 
                              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white" 
                              value={stake}
                              onChange={(e) => setStake(Math.max(0, Number(e.target.value)))}
                              min="0"
                              step="1"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Odds</label>
                            <div className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                              {selectedOdds.odds}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Potential Payout</label>
                            <div className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                              {potentialPayout}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button 
                            className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded text-white font-medium transition-colors"
                            onClick={handlePlaceBet}
                          >
                            Place Bet
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                
                {/* Team B row */}
                <tr className="bg-gray-900">
                  <td className="p-3 border-b border-gray-700 text-gray-200">{teamB}</td>
                  <td className="text-center p-3 border-b border-gray-700">
                    <button 
                      className={`bg-green-700 hover:bg-green-600 px-4 py-1.5 rounded text-white font-medium transition-colors ${
                        selectedOdds && 
                        selectedOdds.eventId === event.id && 
                        selectedOdds.market === 'teamB' && 
                        selectedOdds.side === 'back' ? 'ring-2 ring-white' : ''
                      }`}
                      onClick={() => handleOddsClick({
                        eventId: event.id,
                        market: 'teamB',
                        selection: teamB,
                        side: 'back',
                        odds: odds.teamB.back
                      })}
                    >
                      {odds.teamB.back}
                    </button>
                  </td>
                  <td className="text-center p-3 border-b border-gray-700">
                    <button 
                      className={`bg-red-700 hover:bg-red-600 px-4 py-1.5 rounded text-white font-medium transition-colors ${
                        selectedOdds && 
                        selectedOdds.eventId === event.id && 
                        selectedOdds.market === 'teamB' && 
                        selectedOdds.side === 'lay' ? 'ring-2 ring-white' : ''
                      }`}
                      onClick={() => handleOddsClick({
                        eventId: event.id,
                        market: 'teamB',
                        selection: teamB,
                        side: 'lay',
                        odds: odds.teamB.lay
                      })}
                    >
                      {odds.teamB.lay}
                    </button>
                  </td>
                </tr>
                
                {/* Inline bet form for Team B */}
                {selectedOdds && 
                 selectedOdds.eventId === event.id && 
                 selectedOdds.market === 'teamB' && (
                  <tr className="bg-gray-900">
                    <td colSpan={3} className="p-4 border-b border-gray-700">
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-gray-300">
                            {selectedOdds.selection} ({selectedOdds.side === 'back' ? 'Back' : 'Lay'} @ {selectedOdds.odds})
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Stake</label>
                            <input 
                              type="number" 
                              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white" 
                              value={stake}
                              onChange={(e) => setStake(Math.max(0, Number(e.target.value)))}
                              min="0"
                              step="1"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Odds</label>
                            <div className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                              {selectedOdds.odds}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Potential Payout</label>
                            <div className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                              {potentialPayout}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button 
                            className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded text-white font-medium transition-colors"
                            onClick={handlePlaceBet}
                          >
                            Place Bet
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export default OddsGrid; 