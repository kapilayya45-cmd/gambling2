import React, { useEffect } from 'react';
import { CompatibleMatch } from '@/types/oddsApiTypes';

interface MatchWinnerUIProps {
  odds: Record<string, number>;
  volumes?: Record<string, number>;
  onSelectOdds?: (team: string, price: number) => void;
  match?: CompatibleMatch;
}

/**
 * Formats large numbers into K/M format
 * e.g. 1500 => 1.5K, 1500000 => 1.5M
 */
const formatVolume = (volume: number | undefined): string => {
  if (!volume) return '';
  
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }
  
  return volume.toString();
};

/**
 * MatchWinnerUI - Displays match winner odds in a two-card layout
 * Each card shows team name, best back price, and matched volume (if available)
 */
export const MatchWinnerUI: React.FC<MatchWinnerUIProps> = ({ 
  odds, 
  volumes = {},
  onSelectOdds,
  match
}) => {
  // Always display both teams from the match
  let teamA = '';
  let teamB = '';
  
  // Try to get team names from match object
  if (match) {
    teamA = match.localteam_name || 'Home Team';
    teamB = match.visitorteam_name || 'Away Team';
  } else {
    // Fallback to odds keys if match is not provided
    const teams = Object.keys(odds);
    teamA = teams[0] || 'Team 1';
    teamB = teams[1] || 'Team 2';
  }
  
  const teams = [teamA, teamB];
  
  // Log real-time odds when they change
  useEffect(() => {
    if (match?.betting_odds?.match_winner) {
      console.log('Real-time betting odds available:', match.betting_odds.match_winner);
    }
  }, [match?.betting_odds?.match_winner]);
  
  // Function to handle clicking on an odds card
  const handleOddsClick = (team: string, price: number) => {
    if (onSelectOdds) {
      console.log(`Selected odds for ${team}: ${price}`);
      onSelectOdds(team, price);
    }
  };
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {teams.map(team => {
        const hasOdds = odds[team] !== undefined;
        const isLive = match?.is_live || false;
        
        return (
          <div 
            key={team} 
            className={`
              ${isLive ? 'bg-green-100 border-green-400' : 'bg-green-50 border-green-200'} 
              border rounded-lg p-4 flex flex-col items-center
              ${hasOdds && onSelectOdds ? 'cursor-pointer hover:bg-green-150 transition-colors' : ''}
              ${isLive ? 'relative' : ''}
            `}
            onClick={hasOdds && onSelectOdds ? () => handleOddsClick(team, odds[team]) : undefined}
          >
            {isLive && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                LIVE
              </div>
            )}
            <p className="font-semibold text-gray-700 mb-3 text-center text-lg">{team}</p>
            {hasOdds ? (
              <>
                <div className={`${isLive ? 'bg-green-200 text-green-900' : 'bg-green-100 text-green-800'} font-bold text-2xl rounded-md px-6 py-2`}>
                  {odds[team].toFixed(2)}
                </div>
                {volumes[team] && (
                  <p className="text-green-700 mt-1">{formatVolume(volumes[team])}</p>
                )}
              </>
            ) : (
              <div className="bg-gray-200 text-gray-600 font-bold text-2xl rounded-md px-6 py-2">
                -
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MatchWinnerUI; 