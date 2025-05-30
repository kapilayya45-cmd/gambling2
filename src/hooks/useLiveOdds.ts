import { useState, useEffect } from 'react';
import { fetchCricketLivescores, fetchIPLMatchesWithFallback, CompatibleMatch } from '@/services/cricketApi';

/**
 * Custom hook to handle fetching live cricket data with polling
 * @param initialInterval Polling interval in milliseconds
 * @returns Array of cricket fixtures
 */
export function useLiveOdds(initialInterval = 15000) {
  const [matches, setMatches] = useState<CompatibleMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to fetch live data
  const fetchLiveData = async () => {
    try {
      console.log('Fetching live cricket data...');
      
      // Use the specialized IPL matches function
      const iplMatches = await fetchIPLMatchesWithFallback();
      console.log('Retrieved IPL matches:', iplMatches?.length || 0, 'matches');
      
      if (iplMatches && iplMatches.length > 0) {
        // Log the team names we found to help debug
        iplMatches.forEach((match, index) => {
          const localTeamName = match.localteam_name || `Team ${match.localteam_id}`;
          const visitorTeamName = match.visitorteam_name || `Team ${match.visitorteam_id}`;
          console.log(`Match ${index + 1}: ${localTeamName} vs ${visitorTeamName}`);
        });
        
        setMatches(iplMatches);
        setError(null);
      } else {
        console.warn('No IPL matches found, trying general livescores');
        
        // Fall back to the original method as a backup
        const livescores = await fetchCricketLivescores();
        if (livescores && livescores.length > 0) {
          console.log('Using general livescores:', livescores.length);
          setMatches(livescores);
          setError(null);
        } else {
          console.warn('No matches found at all');
        }
      }
    } catch (err) {
      console.error('Failed to load IPL matches:', err);
      setError('Could not connect to live data source.');
      
      // Try to fall back to direct livescores if the IPL-specific function fails
      try {
        const livescores = await fetchCricketLivescores();
        if (livescores && livescores.length > 0) {
          console.log('Falling back to direct livescores:', livescores.length);
          setMatches(livescores);
          setError(null);
        }
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch and set up polling
  useEffect(() => {
    // Fetch data immediately
    fetchLiveData();
    
    // Set up polling interval
    const intervalId = setInterval(() => {
      fetchLiveData();
    }, initialInterval);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [initialInterval]);
  
  return { matches, loading, error };
} 