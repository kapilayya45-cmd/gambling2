// src/services/cricketApi.ts
const BASE = 'https://cricket.sportmonks.com/api/v2.0';
// Hard-coded SportMonks API token for testing
const TOKEN = 'Z2rnDHZxgnxm79ERrw6Y5gFieZ8A6bXdvh3RzdBjseoQMhWQkznyCZIbzqzT';

export interface CricketFixture {
  id:             number;
  league_id:      number;
  localteam_id:   number;
  visitorteam_id: number;
  starting_at:    string;
  // …add any other fields you need
  localteam_score?: string;
  visitorteam_score?: string;
  status?: string;
  venue_name?: string;
  venue_city?: string;
  venue_capacity?: number;
  toss_winner_team_id?: number;
  toss_decision?: string;
  lineup?: any[];
  live_score?: {
    runs: number;
    wickets: number;
    overs: number;
    run_rate: number;
  };
}

// Mock IPL fixtures for development and testing
const MOCK_IPL_FIXTURES: CricketFixture[] = [
  {
    id: 1001,
    league_id: 1, // IPL
    localteam_id: 101,
    visitorteam_id: 102,
    starting_at: new Date(Date.now() - 40 * 60000).toISOString(), // started 40 min ago
    localteam_score: '128/4',
    visitorteam_score: '',
    status: 'live',
    venue_name: 'Wankhede Stadium',
    venue_city: 'Mumbai',
    venue_capacity: 33000,
    toss_winner_team_id: 101,
    toss_decision: 'bat',
    live_score: {
      runs: 128,
      wickets: 4,
      overs: 14.2,
      run_rate: 8.94
    }
  },
  {
    id: 1002,
    league_id: 1, // IPL
    localteam_id: 103,
    visitorteam_id: 104,
    starting_at: new Date(Date.now() + 90 * 60000).toISOString(), // starts in 90 min
    status: 'notstarted',
    venue_name: 'M. Chinnaswamy Stadium',
    venue_city: 'Bangalore',
    venue_capacity: 40000
  },
  {
    id: 1003,
    league_id: 1, // IPL
    localteam_id: 105,
    visitorteam_id: 106,
    starting_at: new Date(Date.now() + 180 * 60000).toISOString(), // starts in 3 hours
    status: 'notstarted',
    venue_name: 'Feroz Shah Kotla',
    venue_city: 'Delhi',
    venue_capacity: 41000
  }
];

// Team name mapping for UI presentation
export const CRICKET_TEAM_NAMES: Record<number, string> = {
  101: 'Mumbai Indians',
  102: 'Chennai Super Kings',
  103: 'Royal Challengers Bangalore',
  104: 'Kolkata Knight Riders',
  105: 'Delhi Capitals',
  106: 'Rajasthan Royals',
  107: 'Sunrisers Hyderabad',
  108: 'Punjab Kings'
};

/**
 * Fetch upcoming fixtures for a given season
 */
export async function fetchCricketFixturesBySeason(
  seasonId: number
): Promise<CricketFixture[]> {
  // Using mock data for development to avoid API errors
  return MOCK_IPL_FIXTURES.filter(fixture => fixture.league_id === seasonId);
  
  /* Real API implementation:
  try {
    const url = `${BASE}/fixtures/season/${seasonId}?api_token=${TOKEN}`;
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.warn('Failed to fetch cricket fixtures, using mock data:', error);
    return MOCK_IPL_FIXTURES.filter(fixture => fixture.league_id === seasonId);
  }
  */
}

/**
 * Fetch live matches (ball-by-ball) across all leagues
 */
export async function fetchCricketLivescores(): Promise<CricketFixture[]> {
  // Using mock data for development to avoid API errors
  return MOCK_IPL_FIXTURES;
  
  /* Real API implementation:
  try {
    const url = `${BASE}/livescores?api_token=${TOKEN}`;
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.warn('Failed to fetch cricket livescores, using mock data:', error);
    return MOCK_IPL_FIXTURES;
  }
  */
} 