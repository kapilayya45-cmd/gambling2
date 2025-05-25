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
  const url = `${FB_BASE}/fixtures/season/${seasonId}?api_token=${TOKEN}`;
  const res = await fetch(url);
  const json = await res.json();
  return json.data || [];
}

// 2) Live matches across all comps:
export async function fetchFootballLivescores(): Promise<FootballFixture[]> {
  const url = `${FB_BASE}/livescores?api_token=${TOKEN}`;
  const res = await fetch(url);
  const json = await res.json();
  return json.data || [];
} 