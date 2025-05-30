import { useState, useEffect } from 'react';
import { CompatibleMatch } from '@/types/oddsApiTypes';
import { formatTeamName, createShortTitle } from '@/utils/teamUtils';

// Demo matches for fallback
const DEMO_MATCHES: CompatibleMatch[] = [
  {
    id: "demo1",
    title: "Mumbai Indians vs Chennai Super Kings",
    short_title: "MI vs CSK",
    status: "live",
    status_str: "Live",
    competition_name: "Indian Premier League",
    competition_id: "ipl",
    date: "2025-06-01",
    time: "14:00:00",
    localteam_id: "mumbai_indians",
    localteam_name: "Mumbai Indians",
    localteam_score: "142/3",
    localteam_overs: "15.2",
    visitorteam_id: "chennai_super_kings",
    visitorteam_name: "Chennai Super Kings",
    visitorteam_score: "",
    visitorteam_overs: "",
    venue_name: "Wankhede Stadium",
    is_live: true,
    betting_odds: {
      match_winner: {
        "Mumbai Indians": 150.85,
        "Chennai Super Kings": 160.95
      }
    }
  },
  {
    id: "demo2",
    title: "Royal Challengers Bangalore vs Kolkata Knight Riders",
    short_title: "RCB vs KKR",
    status: "not_started",
    status_str: "Not Started",
    competition_name: "Indian Premier League",
    competition_id: "ipl",
    date: "2025-06-03",
    time: "14:00:00",
    localteam_id: "royal_challengers_bangalore",
    localteam_name: "Royal Challengers Bangalore",
    localteam_score: "",
    localteam_overs: "",
    visitorteam_id: "kolkata_knight_riders",
    visitorteam_name: "Kolkata Knight Riders",
    visitorteam_score: "",
    visitorteam_overs: "",
    venue_name: "M. Chinnaswamy Stadium",
    is_live: false,
    betting_odds: {
      match_winner: {
        "Royal Challengers Bangalore": 175.10,
        "Kolkata Knight Riders": 145.75
      }
    }
  }
];

/**
 * Custom hook to fetch IPL matches and odds from our serverless API
 * @param refreshInterval - How often to refresh data in ms (default: 60 seconds)
 * @param debug - Whether to show debug console logs
 * @returns IPL matches with betting odds
 */
export function useIPLOdds(refreshInterval = 60000, debug = true) {
  const [matches, setMatches] = useState<CompatibleMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Ensure team names are properly formatted
  const formatMatches = (matchData: CompatibleMatch[]): CompatibleMatch[] => {
    return matchData.map(match => {
      // Format team names
      const homeTeam = formatTeamName(match.localteam_name);
      const awayTeam = formatTeamName(match.visitorteam_name);
      
      // Return updated match object
      return {
        ...match,
        localteam_name: homeTeam,
        visitorteam_name: awayTeam,
        title: `${homeTeam} vs ${awayTeam}`,
        short_title: createShortTitle(homeTeam, awayTeam)
      };
    });
  };

  const fetchOdds = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching IPL odds data...');
      
      // Try the direct API endpoint first
      let isDirectApiSuccess = false;
      try {
        const directResponse = await fetch('/api/direct-odds', {
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (directResponse.ok) {
          const directData = await directResponse.json();
          
          console.log(`Received data from direct API:`, directData);
          
          if (Array.isArray(directData) && directData.length > 0) {
            const formattedMatches = formatMatches(directData);
            
            // Sort matches: live first, then by start time
            const sortedMatches = [...formattedMatches].sort((a, b) => {
              // Live matches first
              if (a.is_live && !b.is_live) return -1;
              if (!a.is_live && b.is_live) return 1;
              
              // Then by date/time
              const dateA = new Date(`${a.date}T${a.time}`);
              const dateB = new Date(`${b.date}T${b.time}`);
              return dateA.getTime() - dateB.getTime();
            });
            
            setMatches(sortedMatches);
            setLastUpdated(new Date());
            setError(null);
            isDirectApiSuccess = true;
            return;
          }
        }
      } catch (directError) {
        console.error('Error using direct API:', directError);
        // Continue to fallback API
      }
      
      if (!isDirectApiSuccess) {
        console.log('Direct API failed, falling back to regular API...');
        // Call our serverless endpoint that keeps the API key secure
        const response = await fetch('/api/ipl-odds', {
          cache: 'no-cache', // Ensure we don't get a cached response
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log(`Received data from regular API:`, data);
        
        // Check if the response contains an error message
        if (data.error) {
          throw new Error(data.error);
        }
        
        // Check if we actually got matches data
        if (!Array.isArray(data)) {
          console.error('Invalid data format, not an array:', data);
          throw new Error('Invalid response format');
        }
        
        console.log(`Received ${data.length} matches`);
        
        if (data.length === 0) {
          console.warn('API returned zero matches - using demo matches');
          setMatches(DEMO_MATCHES);
          setLastUpdated(new Date());
          setError('No matches returned from API - showing demo data');
          return;
        }
        
        // Format and sort matches
        const formattedMatches = formatMatches(data);
        
        // Sort matches: live first, then by start time
        const sortedMatches = [...formattedMatches].sort((a, b) => {
          // Live matches first
          if (a.is_live && !b.is_live) return -1;
          if (!a.is_live && b.is_live) return 1;
          
          // Then by date/time
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA.getTime() - dateB.getTime();
        });
        
        console.log('Sorted matches:', sortedMatches.map(m => 
          `${m.localteam_name} vs ${m.visitorteam_name} (${m.is_live ? 'LIVE' : m.date})`));
        
        setMatches(sortedMatches);
        setLastUpdated(new Date());
        setError(null);
      }
      
    } catch (err: any) {
      console.error('Error fetching IPL odds:', err);
      setError(err.message || 'Failed to load IPL matches and odds');
      
      // If we have no matches but had an error, use demo matches
      if (matches.length === 0) {
        console.log('Using demo matches due to error');
        setMatches(DEMO_MATCHES);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch immediately on mount
    fetchOdds();
    
    // Set up polling interval
    const intervalId = setInterval(fetchOdds, refreshInterval);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  return {
    matches: matches.length > 0 ? matches : DEMO_MATCHES, // Always return at least demo matches
    loading,
    error,
    lastUpdated,
    refetch: fetchOdds
  };
} 