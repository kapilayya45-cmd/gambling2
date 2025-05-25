import { useState, useEffect } from 'react';
import { fetchCricketLivescores, CricketFixture } from '@/services/cricketApi';

/**
 * Custom hook to handle fetching live cricket data with polling
 * @param initialInterval Polling interval in milliseconds
 * @returns Array of cricket fixtures
 */
export function useLiveOdds(initialInterval = 15000) {
  const [matches, setMatches] = useState<CricketFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to fetch live data
  const fetchLiveData = async () => {
    try {
      const livescores = await fetchCricketLivescores();
      
      // Filter for IPL matches only (assuming league_id 1 is IPL)
      const iplMatches = livescores.filter(match => 
        match.league_id === 1 || String(match.league_id) === '1'
      );
      
      if (iplMatches.length > 0) {
        setMatches(iplMatches);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to load IPL matches:', err);
      setError('Could not connect to live data source.');
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