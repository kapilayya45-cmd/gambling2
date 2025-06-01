import useSWR from 'swr';
import { CompatibleMatch } from '@/types/oddsApiTypes';

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

// Fetcher function for SWR
const fetcher = async (url: string): Promise<CompatibleMatch[]> => {
  console.log(`SWR fetching data from: ${url}`);
  
  try {
    const response = await fetch(url, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log(`SWR received data:`, data);
    
    // Check if the response contains an error message
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Check if we actually got matches data
    let matchesData = data;
    if (!Array.isArray(data)) {
      if (data.data && Array.isArray(data.data)) {
        matchesData = data.data;
      } else {
        console.error('Invalid data format, not an array:', data);
        throw new Error('Invalid response format');
      }
    }
    
    if (matchesData.length === 0) {
      console.warn('API returned zero matches - using demo matches');
      return DEMO_MATCHES;
    }
    
    // Sort matches: live first, then by start time
    const sortedMatches = [...matchesData].sort((a, b) => {
      // Live matches first
      if (a.is_live && !b.is_live) return -1;
      if (!a.is_live && b.is_live) return 1;
      
      // Then by date/time
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
    
    console.log('SWR sorted matches:', sortedMatches.map(m => 
      `${m.localteam_name} vs ${m.visitorteam_name} (${m.is_live ? 'LIVE' : m.date})`));
    
    return sortedMatches;
  } catch (err: any) {
    console.error('SWR error fetching IPL odds:', err);
    return DEMO_MATCHES; // Return demo matches as fallback
  }
};

/**
 * Custom hook to fetch IPL matches and odds using SWR
 * @param refreshInterval - How often to refresh data in ms (default: 60 seconds)
 * @param debug - Whether to show debug console logs
 * @returns IPL matches with betting odds
 */
export function useIPLOdds(refreshInterval = 60000, debug = true) {
  const { 
    data: matches = DEMO_MATCHES, 
    error, 
    isLoading,
    isValidating,
    mutate 
  } = useSWR<CompatibleMatch[]>(
    '/api/ipl-odds', 
    fetcher, 
    {
      refreshInterval, // Auto revalidate every X ms
      revalidateOnFocus: true, // Revalidate when user refocuses the window
      revalidateOnReconnect: true, // Revalidate when user reconnects to the network
      shouldRetryOnError: true, // Retry on error
      errorRetryCount: 3, // Maximum retry count
      dedupingInterval: 2000, // Deduplicate requests within this interval
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // Don't retry on 404
        if (error.status === 404) return;
        
        // Don't retry on 429 (rate limit)
        if (error.status === 429) {
          console.log('Rate limit hit, using cached data');
          return;
        }
        
        // Retry after 5 seconds
        setTimeout(() => revalidate({ retryCount }), 5000);
      },
      fallbackData: DEMO_MATCHES, // Initial data while loading
    }
  );
  
  const lastUpdated = isValidating ? null : new Date();
  
  return {
    matches, // Always return at least demo matches
    loading: isLoading,
    error: error ? (error.message || 'Failed to load IPL matches and odds') : null,
    lastUpdated,
    refetch: mutate // Function to manually refetch data
  };
} 