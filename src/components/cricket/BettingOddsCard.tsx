import React, { useEffect, useState } from 'react';
import InlineBetEntryFixed from './InlineBetEntryFixed';
import { BettingMarket } from './MarketTabs';

interface BettingOddsCardProps {
  onPlaceBet?: (team: string, odds: number) => void;
}

/**
 * A component that directly fetches and displays betting odds
 * Uses the price values from the API for the RCB vs PBKS match
 */
const BettingOddsCard: React.FC<BettingOddsCardProps> = ({ onPlaceBet }) => {
  const [oddsData, setOddsData] = useState({
    rcbOdds: 1.91,
    pbksOdds: 2.08,
    rcbLiquidity: '18.0K',
    pbksLiquidity: '21.9K'
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedBet, setSelectedBet] = useState<{
    team: string;
    odds: number;
  } | null>(null);
  
  // Fetch data from the API
  const fetchOdds = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching odds data from API...');
      
      // Add timestamp to prevent caching
      const response = await fetch(`/api/live-match-odds?t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ API response received');
      
      if (data.status && data.data) {
        const apiData = data.data;
        
        // Extract the price values from the runners array
        const rcbRunner = apiData.runners?.find(r => r.runnerName === 'Royal Challengers Bengaluru');
        const pbksRunner = apiData.runners?.find(r => r.runnerName === 'Punjab Kings');
        
        // Update odds data with proper values, keeping defaults as fallback
        const newOddsData = {
          rcbOdds: rcbRunner?.price || 1.91,
          pbksOdds: pbksRunner?.price || 2.08,
          rcbLiquidity: rcbRunner?.available || '18.0K',
          pbksLiquidity: pbksRunner?.available || '21.9K'
        };
        
        console.log('💰 Updated odds data:', newOddsData);
        setOddsData(newOddsData);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('❌ Error fetching odds:', err);
      setError(err instanceof Error ? err.message : 'Error loading odds');
      // Keep the default values in case of error
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch on component mount
  useEffect(() => {
    fetchOdds();
    
    // Refresh every 15 seconds
    const intervalId = setInterval(fetchOdds, 15000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Handle bet selection
  const handleSelectBet = (team: string, odds: number) => {
    setSelectedBet({ team, odds });
  };

  // Handle bet placement
  const handlePlaceBet = (betData: { selection: string; market: BettingMarket; side: "back" | "lay"; odds: number; stake: number; payWith: "wallet" | "coins"; }) => {
    if (selectedBet && onPlaceBet) {
      onPlaceBet(selectedBet.team, selectedBet.odds);
    }
    setSelectedBet(null);
  };
  
  // Manual refresh handler
  const handleRefresh = () => {
    fetchOdds();
  };

  return (
    <div className="match-winner-container mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Match Winner</h2>
        <div className="flex items-center">
          {lastUpdated && (
            <div className="text-xs text-gray-500 mr-4">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="mr-4 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <div className="odds-format-toggle flex">
            <button className="px-3 py-1 text-sm border border-gray-300 bg-gray-100">Decimal</button>
            <button className="px-3 py-1 text-sm border border-gray-300">Fractional</button>
            <button className="px-3 py-1 text-sm border border-gray-300">American</button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          className={`bg-green-50 border border-green-100 rounded-lg p-4 text-center cursor-pointer transition-all ${
            selectedBet?.team === 'Royal Challengers Bengaluru' ? 'ring-2 ring-blue-500' : 'hover:border-green-200'
          }`}
          onClick={() => handleSelectBet('Royal Challengers Bengaluru', oddsData.rcbOdds)}
        >
          <h3 className="font-medium text-gray-800 mb-2">Royal Challengers Bengaluru</h3>
          <div className="text-2xl font-bold mb-1">{loading && !lastUpdated ? '...' : oddsData.rcbOdds}</div>
          <div className="text-sm text-gray-600 mb-3">{oddsData.rcbLiquidity}</div>
        </div>
        
        <div 
          className={`bg-green-50 border border-green-100 rounded-lg p-4 text-center cursor-pointer transition-all ${
            selectedBet?.team === 'Punjab Kings' ? 'ring-2 ring-blue-500' : 'hover:border-green-200'
          }`}
          onClick={() => handleSelectBet('Punjab Kings', oddsData.pbksOdds)}
        >
          <h3 className="font-medium text-gray-800 mb-2">Punjab Kings</h3>
          <div className="text-2xl font-bold mb-1">{loading && !lastUpdated ? '...' : oddsData.pbksOdds}</div>
          <div className="text-sm text-gray-600 mb-3">{oddsData.pbksLiquidity}</div>
        </div>
      </div>

      {/* Inline bet slip */}
      {selectedBet && (
        <div className="mt-4">
          <InlineBetEntryFixed
            selection={selectedBet.team}
            market="match-winner"
            odds={selectedBet.odds}
            side="back"
            onCancel={() => setSelectedBet(null)}
            onPlaceBet={handlePlaceBet}
          />
        </div>
      )}
    </div>
  );
};

export default BettingOddsCard; 