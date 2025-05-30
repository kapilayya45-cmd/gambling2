// src/config/oddsApiConfig.ts

// API configuration for ODDS-API via Rapid API
export const ODDS_API = {
  BASE_URL: 'https://odds.p.rapidapi.com/v4',
  RAPID_API_KEY: process.env.NEXT_PUBLIC_RAPID_API_KEY || '',
  RAPID_API_HOST: 'odds.p.rapidapi.com',
  // Requests per minute limit - for rate limiting awareness
  RATE_LIMIT: 5,
};

// IPL Cricket Tournament configuration
export const IPL_CONFIG = {
  TOURNAMENT_ID: 'cricket_ipl',  // Sport key for IPL in ODDS-API
  EXACT_TOURNAMENT_ID: 2472,     // Exact tournament ID
  // Fallback tournament IDs in case the primary one fails
  ALTERNATIVE_IDS: [
    2473,                         // Possible alternative ID
    'cricket_t20_international',  // T20 cricket as fallback
    'cricket_test_match'          // Test matches as fallback
  ],
  SPORT_KEY: 'cricket',          // Main sport key
  SPORT_SLUG: 'cricket',         // Sport slug
  LEAGUE_NAME: 'Indian Premier League',
  CATEGORY_NAME: 'India',        // Country/region category
  SEASON: '2023',                // Current season
  TEAMS: [
    'Mumbai Indians',
    'Chennai Super Kings',
    'Royal Challengers Bangalore',
    'Kolkata Knight Riders',
    'Delhi Capitals',
    'Rajasthan Royals',
    'Sunrisers Hyderabad',
    'Punjab Kings',
    'Gujarat Titans',
    'Lucknow Super Giants'
  ],
  // Known match IDs for specific IPL matches
  KNOWN_MATCH_IDS: [
    'id2700247260533321',  // Live match on June 1, 2025
    'id2700247260533347',  // Upcoming match on June 3, 2025
    'id2700247260533349',  // Another IPL match
  ]
};

// Endpoints for cricket matches and odds
export const ENDPOINTS = {
  // Get upcoming matches with odds
  UPCOMING_MATCHES: `/sports/${IPL_CONFIG.TOURNAMENT_ID}/odds`,
  
  // Get live cricket scores
  LIVE_SCORES: `/sports/${IPL_CONFIG.TOURNAMENT_ID}/scores`,
  
  // Get historical match data
  HISTORICAL: `/sports/${IPL_CONFIG.TOURNAMENT_ID}/scores-history`,
  
  // Get specific match details
  MATCH_ODDS: (matchId: string) => 
    `/sports/${IPL_CONFIG.TOURNAMENT_ID}/odds/${matchId}`,
    
  // Alternative endpoint with exact tournament ID
  TOURNAMENT_MATCHES: `/sports/cricket/tournaments/${IPL_CONFIG.EXACT_TOURNAMENT_ID}/odds`,
  
  // Generic cricket endpoint as fallback
  ALL_CRICKET: `/sports/cricket/odds`,
  
  // Direct access to a specific event by ID
  EVENT_BY_ID: (eventId: string) => 
    `/events/${eventId}/odds`,
};

// Betting markets available
export const MARKETS = {
  // Winner of the match
  MATCH_WINNER: 'h2h',
  
  // Toss winner
  TOSS_WINNER: 'toss_winner',
  
  // Team to score more in first 6 overs
  FIRST_SIX_OVERS: 'first_six_overs',
  
  // Total runs in the match
  TOTALS: 'totals',
};

// Common parameters for API requests
export const DEFAULT_PARAMS = {
  regions: 'us,uk,eu,au',  // Regions to get odds from
  oddsFormat: 'decimal',   // Decimal odds format
  markets: 'h2h,totals',   // Default markets to fetch - reduced to minimize request size
  dateFormat: 'iso',       // ISO date format
}; 