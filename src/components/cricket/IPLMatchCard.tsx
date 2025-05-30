import React from 'react';
import Link from 'next/link';
import { CompatibleMatch } from '@/types/oddsApiTypes';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { formatTeamName, getTeamAbbreviation } from '@/utils/teamUtils';

interface IPLMatchCardProps {
  match: CompatibleMatch;
  showOdds?: boolean;
}

export const IPLMatchCard: React.FC<IPLMatchCardProps> = ({ match, showOdds = true }) => {
  const isLive = match.is_live || match.status === 'live';
  const isCompleted = match.status === 'completed';
  
  // Format match time for display
  const matchDate = match.date ? formatDate(match.date) : 'TBD';
  const matchTime = match.time ? formatTime(match.time) : 'TBD';
  
  // Format team names
  const homeTeam = formatTeamName(match.localteam_name);
  const awayTeam = formatTeamName(match.visitorteam_name);
  
  // Get team abbreviations
  const homeAbbr = getTeamAbbreviation(homeTeam);
  const awayAbbr = getTeamAbbreviation(awayTeam);
  
  // Extract betting odds if available
  const homeTeamOdds = match.betting_odds?.match_winner?.[homeTeam] || 
                      match.betting_odds?.match_winner?.[match.localteam_name];
  const awayTeamOdds = match.betting_odds?.match_winner?.[awayTeam] || 
                      match.betting_odds?.match_winner?.[match.visitorteam_name];
  
  // Format odds with rupee symbol
  const formatOdds = (odds: number | undefined) => {
    if (!odds) return '-';
    return `₹${odds.toFixed(2)}`;
  };
  
  return (
    <div className={`border rounded-lg p-4 mb-4 shadow-sm ${isLive ? 'border-red-500 bg-red-50' : isCompleted ? 'border-gray-300 bg-gray-50' : 'border-blue-300 bg-blue-50'}`}>
      {/* Match Status Badge */}
      <div className="flex justify-between items-center mb-2">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
          isLive ? 'bg-red-500 text-white' : 
          isCompleted ? 'bg-gray-500 text-white' : 
          'bg-blue-500 text-white'
        }`}>
          {isLive ? 'LIVE' : isCompleted ? 'COMPLETED' : 'UPCOMING'}
        </span>
        <span className="text-xs text-gray-600">{matchDate} • {matchTime}</span>
      </div>
      
      {/* Teams */}
      <div className="flex justify-between items-center my-3">
        <div className="flex flex-col items-start w-5/12">
          <div className="font-bold text-lg flex items-center">
            <span className="mr-2 bg-gray-200 text-gray-800 rounded px-1 text-sm">
              {homeAbbr}
            </span>
            {homeTeam}
          </div>
          {isLive && <span className="text-lg">{match.localteam_score}</span>}
          {isLive && match.localteam_overs && <span className="text-xs text-gray-600">({match.localteam_overs} overs)</span>}
        </div>
        
        <div className="text-center w-2/12">
          <span className="text-sm font-semibold text-gray-500">VS</span>
        </div>
        
        <div className="flex flex-col items-end w-5/12">
          <div className="font-bold text-lg flex items-center justify-end">
            {awayTeam}
            <span className="ml-2 bg-gray-200 text-gray-800 rounded px-1 text-sm">
              {awayAbbr}
            </span>
          </div>
          {isLive && <span className="text-lg">{match.visitorteam_score}</span>}
          {isLive && match.visitorteam_overs && <span className="text-xs text-gray-600">({match.visitorteam_overs} overs)</span>}
        </div>
      </div>
      
      {/* Venue */}
      <div className="text-sm text-gray-600 mb-3">
        {match.venue_name || 'Venue TBD'}
      </div>
      
      {/* Odds Display */}
      {showOdds && (homeTeamOdds || awayTeamOdds) && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <h4 className="text-sm font-semibold mb-2">Match Winner Odds</h4>
          <div className="flex justify-between">
            <div className="flex-1">
              <span className="text-xs text-gray-600">
                {homeAbbr}
              </span>
              <div className="text-lg font-semibold">{formatOdds(homeTeamOdds)}</div>
            </div>
            <div className="flex-1 text-right">
              <span className="text-xs text-gray-600">
                {awayAbbr}
              </span>
              <div className="text-lg font-semibold">{formatOdds(awayTeamOdds)}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Link to match details */}
      <div className="mt-3 text-center">
        <Link href={`/cricket/match/${match.id}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline">
          {isLive ? 'Watch Live & Bet' : 'View Match Details'}
        </Link>
      </div>
    </div>
  );
}; 