// src/config/oddsApiConfig.ts

// API configuration for ODDS-API via Rapid API
export const ODDS_API = {
  BASE_URL: 'https://odds-api1.p.rapidapi.com',
  RAPID_API_KEY: process.env.NEXT_PUBLIC_RAPID_API_KEY || '',
  RAPID_API_HOST: 'odds-api1.p.rapidapi.com',
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
  SEASON: '2024',                // Current season
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
  KNOWN_MATCHES: [
    {
      matchId: 'id2700247260533347',
      participant1Id: 152330,           // e.g. "Royal Challengers Bangalore" (your internal ID)
      participant2Id: 152324,           // e.g. "Kolkata Knight Riders" (your internal ID)
      betradarId:     60533347,         // Betradar feed ID for this match
    },
    {
      matchId: 'id2700247260533349',
      participant1Id: 1233373,         // e.g. "Delhi Capitals" (your internal ID)
      participant2Id: 1233375,         // e.g. "Rajasthan Royals" (your internal ID)
      betradarId:     null,            // Not yet available for this game
    },
  ]
};

// Endpoints for cricket matches and odds
export const ENDPOINTS = {
  // Get upcoming matches with odds
  UPCOMING_MATCHES: `/events?tournamentId=${IPL_CONFIG.EXACT_TOURNAMENT_ID}`,
  
  // Get live cricket scores
  LIVE_SCORES: `/events?tournamentId=${IPL_CONFIG.EXACT_TOURNAMENT_ID}&liveData=true`,
  
  // Get historical match data
  HISTORICAL: `/events?tournamentId=${IPL_CONFIG.EXACT_TOURNAMENT_ID}&historical=true`,
  
  // Get specific match details
  MATCH_ODDS: (matchId: string) => 
    `/events/${matchId}?media=true`,
    
  // Alternative endpoint with exact tournament ID
  TOURNAMENT_MATCHES: `/events?tournamentId=${IPL_CONFIG.EXACT_TOURNAMENT_ID}&media=true`,
  
  // Generic cricket endpoint as fallback
  ALL_CRICKET: `/events?sport=cricket`,
  
  // Direct access to a specific event by ID
  EVENT_BY_ID: (eventId: string) => 
    `/events/${eventId}?media=true`,
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