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
  onSelectOdds: (selection: any) => void;
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

// Cricket Odds Grid Component
const CricketOddsGrid: React.FC<CricketOddsGridProps> = ({ market, match, onSelectOdds }) => {
  // State to track the currently open bet entry row
  const [openBetRow, setOpenBetRow] = useState<string | null>(null);
  // State to store the selected odds (decoupled from live feed)
  const [selectedOdds, setSelectedOdds] = useState<SelectedOddsType | null>(null);
  
  // Generate selections based on market type
  const generateSelections = (): MatchWinnerSelection[] => {
    const teamA = CRICKET_TEAM_NAMES[match.localteam_id] || `Team ${match.localteam_id}`;
    const teamB = CRICKET_TEAM_NAMES[match.visitorteam_id] || `Team ${match.visitorteam_id}`;
    
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
    onSelectOdds({
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
    <div className="overflow-x-auto bg-[#0f121a] rounded-lg shadow-lg mb-6">
      <table className="w-full text-white border-collapse">
        <thead>
          <tr>
            <th className="sticky top-0 bg-[#1a1f2c] text-gray-300 font-semibold py-3 px-4 text-left border-b border-gray-700">
              Selection
            </th>
            <th className="sticky top-0 bg-[#1a1f2c] text-gray-300 font-semibold py-3 px-2 text-center border-b border-gray-700">
              Back 3
            </th>
            <th className="sticky top-0 bg-[#1a1f2c] text-gray-300 font-semibold py-3 px-2 text-center border-b border-gray-700">
              Back 2
            </th>
            <th className="sticky top-0 bg-[#1a1f2c] text-gray-300 font-semibold py-3 px-2 text-center border-b border-gray-700">
              Back 1
            </th>
            <th className="sticky top-0 bg-[#1a1f2c] text-gray-300 font-semibold py-3 px-2 text-center border-b border-gray-700">
              Lay 1
            </th>
            <th className="sticky top-0 bg-[#1a1f2c] text-gray-300 font-semibold py-3 px-2 text-center border-b border-gray-700">
              Lay 2
            </th>
            <th className="sticky top-0 bg-[#1a1f2c] text-gray-300 font-semibold py-3 px-2 text-center border-b border-gray-700">
              Lay 3
            </th>
            <th className="sticky top-0 bg-[#1a1f2c] text-gray-300 font-semibold py-3 px-4 text-center border-b border-gray-700">
              Min/Max
            </th>
          </tr>
        </thead>
        <tbody>
          {selections.map((selection, index) => (
            <React.Fragment key={`row-${selection.id}`}>
              <tr className={index % 2 === 0 ? 'bg-black' : 'bg-[#0a0d14]'}>
                <td className="py-4 px-4 text-left border-b border-gray-700">
                  <span className="font-medium">{selection.name}</span>
                </td>
                
                {/* Back price levels */}
                {selection.back.slice().reverse().map((level, i) => (
                  <td 
                    key={`back-${selection.id}-${i}`}
                    className="p-2 text-center border-b border-gray-700 cursor-pointer select-none hover:bg-[#343b4f]"
                    onClick={() => handlePriceClick(selection, level.price, BACK)}
                  >
                    <div className="px-3 py-2 rounded border border-blue-200 bg-blue-100 bg-opacity-20 text-blue-300 hover:bg-opacity-30 transition-colors">
                      <div className="font-bold">{level.price.toFixed(2)}</div>
                      <div className="text-xs text-gray-300">₹{level.size.toLocaleString()}</div>
                    </div>
                  </td>
                ))}
                
                {/* Lay price levels */}
                {selection.lay.map((level, i) => (
                  <td 
                    key={`lay-${selection.id}-${i}`}
                    className="p-2 text-center border-b border-gray-700 cursor-pointer select-none hover:bg-[#343b4f]"
                    onClick={() => handlePriceClick(selection, level.price, LAY)}
                  >
                    <div className="px-3 py-2 rounded border border-red-200 bg-red-100 bg-opacity-20 text-red-300 hover:bg-opacity-30 transition-colors">
                      <div className="font-bold">{level.price.toFixed(2)}</div>
                      <div className="text-xs text-gray-300">₹{level.size.toLocaleString()}</div>
                    </div>
                  </td>
                ))}
                
                {/* Min/Max column */}
                <td className="py-4 px-4 text-center border-b border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">Min</div>
                  <div className="text-sm">₹100</div>
                  <div className="text-xs text-gray-400 mt-2 mb-1">Max</div>
                  <div className="text-sm">₹1,00,000</div>
                </td>
              </tr>
              
              {/* Inline bet entry row - Using selectedOdds instead of parsing from openBetRow */}
              {shouldShowBetEntry(selection.id) && selectedOdds && (
                <tr key={`bet-${selection.id}`}>
                  <InlineBetEntry 
                    matchId={match.id}
                    selectedOdds={selectedOdds.price}
                    side={selectedOdds.side}
                    selection={selectedOdds.selection}
                    market={market}
                    totalColumns={TOTAL_COLUMNS}
                    onCancel={handleCancelBet}
                    onPlaceBet={handlePlaceBet}
                  />
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