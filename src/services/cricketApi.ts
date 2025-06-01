// src/services/cricketApi.ts
import { getIPLMatches, getLiveIPLMatches, getMatchDetails } from './oddsApiService';
import type { CompatibleMatch } from '@/types/oddsApiTypes';

// Local proxy API endpoints to avoid CORS issues
const LOCAL_LIVESCORES_API = '/api/cricket/livescores';
const LOCAL_FIXTURES_API = '/api/cricket/fixtures';

// Team name mapping for UI presentation
export const CRICKET_TEAM_NAMES: Record<string, string> = {
  // Current IPL teams for 2024 season
  'MI': 'Mumbai Indians',
  'CSK': 'Chennai Super Kings',
  'RCB': 'Royal Challengers Bengaluru',  // Updated name from Bangalore
  'KKR': 'Kolkata Knight Riders',
  'DC': 'Delhi Capitals',
  'RR': 'Rajasthan Royals',
  'SRH': 'Sunrisers Hyderabad',
  'PBKS': 'Punjab Kings',
  'GT': 'Gujarat Titans',
  'LSG': 'Lucknow Super Giants',
  
  // Use these same names for team IDs
  '1': 'Mumbai Indians',
  '2': 'Chennai Super Kings',
  '3': 'Royal Challengers Bengaluru',
  '4': 'Kolkata Knight Riders',
  '5': 'Delhi Capitals',
  '6': 'Rajasthan Royals',
  '7': 'Sunrisers Hyderabad',
  '8': 'Punjab Kings',
  '9': 'Gujarat Titans',
  '10': 'Lucknow Super Giants'
};

// Re-export the types
export type { CompatibleMatch };

/**
 * Fetch live cricket matches
 */
export async function fetchCricketLivescores(): Promise<CompatibleMatch[]> {
  try {
    console.log('Fetching live cricket scores from API...');
    
    // Try to fetch data from our proxy API first
    try {
      const proxyRes = await fetch(LOCAL_LIVESCORES_API);
      if (proxyRes.ok) {
        const data = await proxyRes.json();
        if (data.data && data.data.length > 0) {
          console.log('Successfully fetched data from proxy API');
          return data.data;
        }
      }
    } catch (proxyError) {
      console.warn('Failed to fetch from proxy API, trying direct API...');
    }
    
    // Use the ODDS API implementation
    return await getLiveIPLMatches();
  } catch (error) {
    console.error('Failed to fetch cricket livescores:', error);
    throw error;
  }
}

/**
 * Helper function to update the team names mapping
 */
function updateTeamNames(matches: CompatibleMatch[]) {
  matches.forEach((match: CompatibleMatch) => {
    // Adapt this to match the new structure from ODDS API
    const localTeamCode = match.localteam_id?.split('_')[0]?.toUpperCase();
    const visitorTeamCode = match.visitorteam_id?.split('_')[0]?.toUpperCase();
    
    if (localTeamCode && !CRICKET_TEAM_NAMES[localTeamCode]) {
      CRICKET_TEAM_NAMES[localTeamCode] = match.localteam_name || '';
    }
    
    if (visitorTeamCode && !CRICKET_TEAM_NAMES[visitorTeamCode]) {
      CRICKET_TEAM_NAMES[visitorTeamCode] = match.visitorteam_name || '';
    }
  });
}

/**
 * Fetch IPL matches specifically
 */
export async function fetchIPLMatchesWithFallback(): Promise<CompatibleMatch[]> {
  console.log('Fetching IPL matches specifically...');
  try {
    let iplMatches: CompatibleMatch[] = [];
    
    // First try: fetch via our proxy API
    try {
      console.log('1. Checking for IPL matches via proxy API...');
      const fixturesRes = await fetch(LOCAL_FIXTURES_API);
      
      if (fixturesRes.ok) {
        const fixturesJson = await fixturesRes.json();
        
        if (fixturesJson.data && fixturesJson.data.length > 0) {
          console.log(`Found ${fixturesJson.data.length} IPL fixtures via proxy`);
          updateTeamNames(fixturesJson.data);
          return fixturesJson.data;
        }
      }
    } catch (proxyError) {
      console.warn('Failed to fetch via proxy:', proxyError);
    }
    
    // Use the ODDS API implementation
    iplMatches = await getIPLMatches();
    
    if (iplMatches && iplMatches.length > 0) {
      console.log(`Found ${iplMatches.length} IPL matches via ODDS API`);
      updateTeamNames(iplMatches);
      return iplMatches;
    }
    
    throw new Error('No IPL matches found in any API call');
  } catch (error) {
    console.error('Failed to fetch IPL matches:', error);
    throw error;
  }
}

/**
 * For backward compatibility
 */
export const fetchCricketFixturesBySeason = fetchIPLMatchesWithFallback;

/**
 * For backward compatibility
 */
export async function fetchSeasonFixtures(): Promise<any> {
  return { data: await fetchIPLMatchesWithFallback() };
}