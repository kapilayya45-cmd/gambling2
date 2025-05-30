// src/services/footballApi.ts
const FB_BASE = 'https://api.sportmonks.com/v3/football';
const TOKEN = 'Z2rnDHZxgnxm79ERrw6Y5gFieZ8A6bXdvh3RzdBjseoQMhWQkznyCZIbzqzT';

export interface FootballFixture {
  id:             number;
  league_id:      number;
  localteam_id:   number;
  visitorteam_id: number;
  starting_at:    string;
  // …
}

// 1) Upcoming fixtures by season:
export async function fetchFootballFixturesBySeason(
  seasonId: number
): Promise<FootballFixture[]> {
  // Mock data based on the seasonId
  const mockData = [
    {
      id: 2001,
      league_id: seasonId === 27089 ? 501 : 271, // Map season ID to league ID
      localteam_id: 5,
      visitorteam_id: 6,
      starting_at: new Date().toISOString(),
    },
    {
      id: 2002,
      league_id: seasonId === 27089 ? 501 : 271,
      localteam_id: 7,
      visitorteam_id: 8,
      starting_at: new Date().toISOString(),
    },
    {
      id: 2003,
      league_id: seasonId === 27089 ? 501 : 271,
      localteam_id: 9,
      visitorteam_id: 10,
      starting_at: new Date().toISOString(),
    }
  ];
  
  // For development, just return mock data to avoid API errors
  return mockData;
  
  /* Commented out problematic API call code
  try {
  const url = `${FB_BASE}/fixtures/season/${seasonId}?api_token=${TOKEN}`;
  const res = await fetch(url);
  const json = await res.json();
  return json.data || [];
  } catch (error) {
    console.error(`Failed to fetch football fixtures for season ${seasonId}:`, error);
    // Return mock data instead
    return mockData;
  }
  */
}

// 2) Live matches across all comps:
export async function fetchFootballLivescores(): Promise<FootballFixture[]> {
  // Mock data to return in case of error
  const mockData = [
    {
      id: 1001,
      league_id: 501, // Premier League
      localteam_id: 1,
      visitorteam_id: 2,
      starting_at: new Date().toISOString(),
    },
    {
      id: 1002,
      league_id: 271, // Danish Superliga
      localteam_id: 3,
      visitorteam_id: 4,
      starting_at: new Date().toISOString(),
    }
  ];
  
  // For development, just return mock data to avoid API errors
  return mockData;
  
  /* Commented out problematic API call code
  try {
  const url = `${FB_BASE}/livescores?api_token=${TOKEN}`;
  const res = await fetch(url);
  const json = await res.json();
  return json.data || [];
  } catch (error) {
    console.error("Failed to fetch football livescores:", error);
    // Return mock data instead
    return mockData;
  }
  */
} 