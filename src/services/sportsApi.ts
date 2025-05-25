// src/services/sportsApi.ts
// This file is being phased out in favor of individual sport APIs

import { Match } from '../types/Match';

// TheSportsDB API base URL and key
const API_BASE_URL = process.env.NEXT_PUBLIC_SPORTS_API_BASE_URL || 'https://www.thesportsdb.com/api/v1/json/3';
const API_KEY = process.env.NEXT_PUBLIC_SPORTS_API_KEY || '3'; // Default to free tier if not specified

// Tennis league IDs
export const TENNIS_LEAGUES = [
  { id: '4464', name: 'ATP Tour' }, // ATP
  { id: '4517', name: 'WTA Tour' }, // WTA
  { id: '4491', name: 'Davis Cup' },
  { id: '4506', name: 'Fed Cup' },
  { id: '4481', name: 'Grand Slams' },
  { id: '4478', name: 'ATP Masters' },
  { id: '4489', name: 'Exhibition Matches' }
];

// Generate random odds for matches
const generateRandomOdds = (sport: string): { teamA: number; draw?: number; teamB: number } => {
  if (sport.toLowerCase() === 'soccer') {
    return {
      teamA: parseFloat((Math.random() * 3 + 1.5).toFixed(2)),
      draw: parseFloat((Math.random() * 2 + 2.5).toFixed(2)),
      teamB: parseFloat((Math.random() * 3 + 1.5).toFixed(2)),
    };
  } else if (sport.toLowerCase() === 'cricket') {
    return {
      teamA: parseFloat((Math.random() * 2 + 1.4).toFixed(2)),
      draw: parseFloat((Math.random() * 3 + 3.5).toFixed(2)),
      teamB: parseFloat((Math.random() * 2 + 1.4).toFixed(2)),
    };
  } else {
    // Default odds for other sports (including tennis)
    return {
      teamA: parseFloat((Math.random() * 2 + 1.3).toFixed(2)),
      teamB: parseFloat((Math.random() * 2 + 1.3).toFixed(2)),
    };
  }
};

// Format date to YYYY-MM-DD
const formatDate = (date: Date): string => date.toISOString().split('T')[0];

// Convert TheSportsDB event to our Match format
const convertEventToMatch = (event: any, isToday: boolean): Match => {
  const sportType = event.strSport.toLowerCase() === 'soccer' ? 'football' : event.strSport.toLowerCase();
  return {
    id: parseInt(event.idEvent, 10),
    sport: sportType as any,
    league: event.strLeague,
    teamA: event.strHomeTeam,
    teamB: event.strAwayTeam,
    time: event.strTime || '00:00',
    date: isToday ? 'Today' : 'Tomorrow',
    isLive: isToday && Math.random() > 0.7,
    odds: generateRandomOdds(event.strSport),
    stats: undefined,
  };
};

// Fetch events for a specific date and sport
const fetchEventsByDate = async (date: string, sport: string): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${API_KEY}/eventsday.php?d=${date}&s=${sport}`);
    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error(`Error fetching ${sport} events:`, error);
    return [];
  }
};

// Fetch cricket and football matches for today and tomorrow
export const fetchMatches = async (): Promise<Match[]> => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayStr = formatDate(today);
  const tomorrowStr = formatDate(tomorrow);

  const [todayFootball, todayCricket, tomorrowFootball, tomorrowCricket] = await Promise.all([
    fetchEventsByDate(todayStr, 'Soccer'),
    fetchEventsByDate(todayStr, 'Cricket'),
    fetchEventsByDate(tomorrowStr, 'Soccer'),
    fetchEventsByDate(tomorrowStr, 'Cricket'),
  ]);

  return [
    ...todayFootball.map((e: any) => convertEventToMatch(e, true)),
    ...todayCricket.map((e: any) => convertEventToMatch(e, true)),
    ...tomorrowFootball.map((e: any) => convertEventToMatch(e, false)),
    ...tomorrowCricket.map((e: any) => convertEventToMatch(e, false)),
  ];
};

/**
 * @deprecated Use sport-specific API services instead
 */
export const fetchLeagueEvents = async (leagueId: string): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${API_KEY}/eventspastleague.php?id=${leagueId}`);
    
    if (!response.ok) {
      console.error(`Error response from API: ${response.status} ${response.statusText}`);
      return [];
    }
    
    // Check if the content type is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`Expected JSON response but got ${contentType}`);
      return [];
    }
    
    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error(`Error fetching league events for ${leagueId}:`, error);
    return [];
  }
};

// Interface for raw TheSportsDB API event data
export interface SportDbEvent {
  idEvent: string;
  strEvent: string;
  dateEvent: string;
  strTime: string;
  strHomeTeam: string;
  strAwayTeam: string;
  strStatus?: string;
}

/**
 * @deprecated Use sport-specific API services instead
 */
export async function fetchUpcomingMatchesByLeague(
  leagueId: string
): Promise<SportDbEvent[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/${API_KEY}/eventsnextleague.php?id=${leagueId}`
    );
    
    if (!res.ok) {
      console.error(`Error response from API: ${res.status} ${res.statusText}`);
      return [];
    }
    
    // Check if the content type is JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`Expected JSON response but got ${contentType}`);
      return [];
    }
    
    const json = await res.json();
    return json.events || [];
  } catch (error) {
    console.error(`Error fetching upcoming matches for league ${leagueId}:`, error);
    return [];
  }
}
