import React from 'react';
import { useIPLOdds } from '@/hooks/useIPLOdds';
import { IPLMatchCard } from './IPLMatchCard';
import { Spinner } from '../ui/Spinner';

interface IPLMatchListProps {
  showLiveOnly?: boolean;
  limit?: number;
}

export const IPLMatchList: React.FC<IPLMatchListProps> = ({ 
  showLiveOnly = false,
  limit 
}) => {
  const { matches, loading, error } = useIPLOdds();
  
  // Filter matches if needed
  const filteredMatches = showLiveOnly 
    ? matches.filter(match => match.is_live || match.status === 'live')
    : matches;
  
  // Apply limit if provided
  const displayMatches = limit 
    ? filteredMatches.slice(0, limit) 
    : filteredMatches;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>Failed to load matches: {error}</p>
      </div>
    );
  }

  if (displayMatches.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-6 rounded-md text-center">
        <p className="text-lg font-medium mb-2">No matches found</p>
        <p className="text-sm text-gray-500">
          {showLiveOnly 
            ? 'There are no live IPL matches right now. Check back later!'
            : 'There are no upcoming IPL matches scheduled at the moment.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayMatches.map(match => (
        <IPLMatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}; 