// src/services/basketballApi.ts

const BASE = 'https://www.thesportsdb.com/api/v1/json/3';

export interface BasketballEvent {
  idEvent:     string;
  strEvent:    string;   // e.g. "Lakers vs Heat"
  dateEvent:   string;   // e.g. "2025-05-14"
  strTime:     string;   // e.g. "19:00:00"
  strHomeTeam: string;
  strAwayTeam: string;
  strLeague:   string;
}

/**
 * Fetch the next scheduled events for a given league.
 */
export async function fetchBasketballEvents(
  leagueId: string
): Promise<BasketballEvent[]> {
  const res  = await fetch(`${BASE}/eventsnextleague.php?id=${leagueId}`);
  const json = await res.json();
  return json.events || [];
}

/**
 * Fetch the most recent past events for a given league.
 * We'll use these to detect "live" games by checking timestamps.
 */
export async function fetchBasketballPastEvents(
  leagueId: string
): Promise<BasketballEvent[]> {
  const res  = await fetch(`${BASE}/eventspastleague.php?id=${leagueId}`);
  const json = await res.json();
  return json.events || [];
} 