import React, { useState } from 'react';
import { BettingMarket } from './MarketTabs';
import { CricketFixture, CRICKET_TEAM_NAMES } from '@/services/cricketApi';
import InlineBetEntry from './InlineBetEntry';

// Odds button types
const BACK = 'back';
const LAY = 'lay';
type OddsType = typeof BACK | typeof LAY;

// Sample price levels data interface for the 3-level depth
interface PriceLevels {
  price: number;
  size: number;
}

// Selection interfaces for different market types
interface MatchWinnerSelection {
  id: string;
  name: string;
  back: PriceLevels[];
  lay: PriceLevels[];
}

// Selected odds type
interface SelectedOddsType {
  selectionId: string;
  selection: string;
  price: number;
  side: OddsType;
  market: BettingMarket;
}

// Main CricketOddsGrid props
interface CricketOddsGridProps {
  market: BettingMarket;
  match: CricketFixture;
  playerFilters: string[];
  onPlaceBet: (selection: any) => void;
}

// Generate mock price levels for demonstration
const generatePriceLevels = (basePrice: number, isBack: boolean): PriceLevels[] => {
  const direction = isBack ? 1 : -1;
  const priceDelta = 0.05;
  
  return [0, 1, 2].map(level => ({
    price: parseFloat((basePrice + (level * direction * priceDelta)).toFixed(2)),
    size: Math.floor(Math.random() * 5000) + 1000
  }));
};

// Total number of columns in the table
const TOTAL_COLUMNS = 8; // 1 for selection name, 3 for back, 3 for lay, 1 for min/max

// Helper function to get team names from the match
const getTeamName = (teamId: number, match: CricketFixture): string => {
  // First check if we have a mapped name
  if (CRICKET_TEAM_NAMES[teamId]) {
    return CRICKET_TEAM_NAMES[teamId];
  }
  
  // Next, check if we have team objects from the API
  if (teamId === match.localteam_id && match.localteam?.name) {
    return match.localteam.name;
  }
  
  if (teamId === match.visitorteam_id && match.visitorteam?.name) {
    return match.visitorteam.name;
  }
  
  // Finally fall back to a generic name
  return `Team ${teamId}`;
};

// Cricket Odds Grid Component
const CricketOddsGrid: React.FC<CricketOddsGridProps> = ({ market, match, playerFilters, onPlaceBet }) => {
  // State to track the currently open bet entry row
  const [openBetRow, setOpenBetRow] = useState<string | null>(null);
  // State to store the selected odds (decoupled from live feed)
  const [selectedOdds, setSelectedOdds] = useState<SelectedOddsType | null>(null);
  
  // Generate selections based on market type
  const generateSelections = (): MatchWinnerSelection[] => {
    const teamA = getTeamName(match.localteam_id, match);
    const teamB = getTeamName(match.visitorteam_id, match);
    
    // Log team names for debugging
    console.log(`Displaying match: ${teamA} vs ${teamB}`);
    
    // Base prices with some variance
    const teamABasePrice = 1.85 + (Math.random() * 0.3);
    const teamBBasePrice = 2.10 + (Math.random() * 0.3);
    const drawBasePrice = 4.50 + (Math.random() * 0.5);
    
    if (market === 'match-winner') {
      return [
        {
          id: `${match.id}_team_a`,
          name: teamA,
          back: generatePriceLevels(teamABasePrice, true),
          lay: generatePriceLevels(teamABasePrice + 0.05, false)
        },
        {
          id: `${match.id}_draw`,
          name: 'Draw',
          back: generatePriceLevels(drawBasePrice, true),
          lay: generatePriceLevels(drawBasePrice + 0.05, false)
        },
        {
          id: `${match.id}_team_b`,
          name: teamB,
          back: generatePriceLevels(teamBBasePrice, true),
          lay: generatePriceLevels(teamBBasePrice + 0.05, false)
        }
      ];
    }
    
    if (market === 'top-batsman') {
      // Mock data for top batsmen
      return [
        {
          id: `${match.id}_batsman_1`,
          name: 'Virat Kohli',
          back: generatePriceLevels(3.75, true),
          lay: generatePriceLevels(3.85, false)
        },
        {
          id: `${match.id}_batsman_2`,
          name: 'Rohit Sharma',
          back: generatePriceLevels(4.50, true),
          lay: generatePriceLevels(4.60, false)
        },
        {
          id: `${match.id}_batsman_3`,
          name: 'KL Rahul',
          back: generatePriceLevels(5.00, true),
          lay: generatePriceLevels(5.10, false)
        },
        {
          id: `${match.id}_batsman_4`,
          name: 'MS Dhoni',
          back: generatePriceLevels(7.50, true),
          lay: generatePriceLevels(7.65, false)
        },
        {
          id: `${match.id}_batsman_5`,
          name: 'Rishabh Pant',
          back: generatePriceLevels(8.00, true),
          lay: generatePriceLevels(8.15, false)
        }
      ];
    }
    
    // Mock data for other markets
    return [
      {
        id: `${match.id}_selection_1`,
        name: 'Selection 1',
        back: generatePriceLevels(1.95, true),
        lay: generatePriceLevels(2.05, false)
      },
      {
        id: `${match.id}_selection_2`,
        name: 'Selection 2',
        back: generatePriceLevels(3.25, true),
        lay: generatePriceLevels(3.35, false)
      },
      {
        id: `${match.id}_selection_3`,
        name: 'Selection 3',
        back: generatePriceLevels(5.50, true),
        lay: generatePriceLevels(5.65, false)
      }
    ];
  };
  
  const selections = generateSelections();
  
  // Handle clicking on a price cell to open bet entry
  const handlePriceClick = (selection: MatchWinnerSelection, price: number, side: OddsType) => {
    // Store the selected odds separately from the live data
    setSelectedOdds({
      selectionId: selection.id,
      selection: selection.name,
      price: price,
      side: side,
      market: market
    });
    
    // Set the open bet row
    setOpenBetRow(selection.id);
  };
  
  // Handle canceling the inline bet
  const handleCancelBet = () => {
    setOpenBetRow(null);
    setSelectedOdds(null);
  };
  
  // Handle placing a bet from the inline row
  const handlePlaceBet = (betData: any) => {
    onPlaceBet({
      matchId: match.id,
      eventId: match.id,
      selectionId: selectedOdds?.selectionId,
      selection: betData.selection,
      market: betData.market,
      odds: betData.odds,
      side: betData.side,
      stake: betData.stake
    });
    
    // Close the bet entry row
    setOpenBetRow(null);
    setSelectedOdds(null);
  };
  
  // Determine if a betting row should have an inline bet entry
  const shouldShowBetEntry = (selectionId: string) => {
    return openBetRow === selectionId;
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Selection</th>
            <th className="px-2 py-2 text-center text-xs font-medium text-gray-600 bg-blue-50" colSpan={3}>Back</th>
            <th className="px-2 py-2 text-center text-xs font-medium text-gray-600 bg-red-50" colSpan={3}>Lay</th>
            <th className="px-2 py-2 text-center text-xs font-medium text-gray-600">Min/Max</th>
          </tr>
        </thead>
        <tbody>
          {selections.map((selection, index) => (
            <React.Fragment key={selection.id}>
              <tr className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-4 py-3 text-left">
                  <div className="font-medium text-gray-800">{selection.name}</div>
                </td>
                
                {/* Back price cells */}
                {selection.back.map((level, i) => (
                  <td key={`back-${i}`} className="border-r border-gray-200 p-0">
                    <button
                      onClick={() => handlePriceClick(selection, level.price, BACK)}
                      className="w-full py-3 px-2 flex flex-col items-center bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <span className="text-blue-700 font-medium">{level.price.toFixed(2)}</span>
                      <span className="text-xs text-gray-600">${level.size.toLocaleString()}</span>
                    </button>
                  </td>
                ))}
                
                {/* Lay price cells */}
                {selection.lay.map((level, i) => (
                  <td key={`lay-${i}`} className="border-r border-gray-200 p-0">
                    <button
                      onClick={() => handlePriceClick(selection, level.price, LAY)}
                      className="w-full py-3 px-2 flex flex-col items-center bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <span className="text-red-700 font-medium">{level.price.toFixed(2)}</span>
                      <span className="text-xs text-gray-600">${level.size.toLocaleString()}</span>
                    </button>
                  </td>
                ))}
                
                {/* Min/Max stake */}
                <td className="px-2 py-3 text-center">
                  <div className="text-xs text-gray-600">
                    <div>Min: ₹100</div>
                    <div>Max: ₹1,00,000</div>
                  </div>
                </td>
              </tr>
              
              {/* Inline bet entry row */}
              {shouldShowBetEntry(selection.id) && selectedOdds && (
                <tr>
                  <td colSpan={TOTAL_COLUMNS} className="px-0 py-0">
                    <InlineBetEntry
                      selection={selectedOdds.selection}
                      market={selectedOdds.market}
                      odds={selectedOdds.price}
                      side={selectedOdds.side}
                      onCancel={handleCancelBet}
                      onPlaceBet={handlePlaceBet}
                    />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CricketOddsGrid; 