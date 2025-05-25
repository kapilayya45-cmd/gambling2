import { useEffect, useState } from 'react';
import { CRICKET_LEAGUES, FOOTBALL_LEAGUES, LeagueConfig } from '@/constants/leagues';
import {
  fetchCricketFixturesBySeason,
  fetchCricketLivescores
} from '@/services/cricketApi';
import {
  fetchFootballFixturesBySeason,
  fetchFootballLivescores
} from '@/services/footballApi';

export interface LeagueStatus {
  inSeason: boolean;
  live:     boolean;
}

type StatusMap = Record<number, LeagueStatus>;

export function useLeagueStatus() {
  const [status, setStatus] = useState<StatusMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function load() {
      const s: StatusMap = {};
      setLoading(true);

      try {
        // Cricket leagues
        for (const lg of CRICKET_LEAGUES) {
          try {
            // For client-side, we'll use mock data instead of direct API calls
            // In production, these would be API routes that handle CORS
            // const upcoming = await fetchCricketFixturesBySeason(lg.seasonId);
            // const liveMatches = await fetchCricketLivescores();
            
            // Mock status based on league ID for now
            s[lg.id] = {
              inSeason: true, // Assume all configured leagues are in season
              live: lg.id === 1, // Let's assume IPL has live matches
            };
          } catch (err) {
            console.error(`Error loading Cricket league ${lg.id}:`, err);
            // Set default values for this league
            s[lg.id] = { inSeason: true, live: false };
          }
        }

        // Football leagues
        for (const lg of FOOTBALL_LEAGUES) {
          try {
            // For client-side, we'll use mock data instead of direct API calls
            // const upcoming = await fetchFootballFixturesBySeason(lg.seasonId);
            // const liveMatches = await fetchFootballLivescores();
            
            // Mock status based on league ID for now
            s[lg.id] = {
              inSeason: true, // Assume all configured leagues are in season
              live: lg.id === 501, // Let's assume Premier League has live matches
            };
          } catch (err) {
            console.error(`Error loading Football league ${lg.id}:`, err);
            // Set default values for this league
            s[lg.id] = { inSeason: true, live: false };
          }
        }

        setStatus(s);
      } catch (err) {
        console.error("Failed to load league statuses:", err);
        setError(err instanceof Error ? err : new Error("Unknown error loading league statuses"));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { status, loading, error };
} 