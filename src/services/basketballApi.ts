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

interface ApiResponse {
  events: BasketballEvent[] | null;
}

// Mock basketball events data
const mockBasketballEvents: BasketballEvent[] = [
  {
    idEvent: "1001",
    strEvent: "Lakers vs Warriors",
    dateEvent: "2025-06-01",
    strTime: "19:30:00",
    strHomeTeam: "Lakers",
    strAwayTeam: "Warriors",
    strLeague: "NBA"
  },
  {
    idEvent: "1002",
    strEvent: "Celtics vs Heat",
    dateEvent: "2025-06-02",
    strTime: "20:00:00",
    strHomeTeam: "Celtics",
    strAwayTeam: "Heat",
    strLeague: "NBA"
  },
  {
    idEvent: "1003",
    strEvent: "Bucks vs Bulls",
    dateEvent: "2025-06-03",
    strTime: "19:00:00",
    strHomeTeam: "Bucks",
    strAwayTeam: "Bulls",
    strLeague: "NBA"
  }
];

// Mock past events
const mockPastEvents: BasketballEvent[] = [
  {
    idEvent: "995",
    strEvent: "Knicks vs Nets",
    dateEvent: "2025-05-30",
    strTime: "19:00:00",
    strHomeTeam: "Knicks",
    strAwayTeam: "Nets",
    strLeague: "NBA"
  },
  {
    idEvent: "996",
    strEvent: "Rockets vs Mavericks",
    dateEvent: "2025-05-29",
    strTime: "20:30:00",
    strHomeTeam: "Rockets",
    strAwayTeam: "Mavericks",
    strLeague: "NBA"
  }
];

/**
 * Fetch the next scheduled events for a given league.
 */
export async function fetchBasketballEvents(
  leagueId: string
): Promise<BasketballEvent[]> {
  // Return mock data instead of making an actual API call
  return mockBasketballEvents;
}

/**
 * Fetch the most recent past events for a given league.
 * We'll use these to detect "live" games by checking timestamps.
 */
export async function fetchBasketballPastEvents(
  leagueId: string
): Promise<BasketballEvent[]> {
  // Return mock data instead of making an actual API call
  return mockPastEvents;
}