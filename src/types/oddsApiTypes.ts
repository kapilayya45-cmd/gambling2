// src/types/oddsApiTypes.ts

// Basic match information
export interface Match {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  tournament_id?: number;      // The exact tournament ID
  league_key?: string;         // League key (e.g., 'ipl')
  league?: string;             // League name (e.g., 'Indian Premier League')
  venue?: string;              // Venue name
  bookmakers?: Bookmaker[];
}

// Bookmaker information (betting provider)
export interface Bookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: Market[];
}

// Market information (type of bet)
export interface Market {
  key: string;
  last_update: string;
  outcomes: Outcome[];
}

// Outcome information (betting option)
export interface Outcome {
  name: string;
  price: number;
  point?: number;
}

// Betfair Exchange specific interfaces
export interface BetfairRunner {
  runnerId: string;
  runnerName: string;
  odds: number;
}

export interface BetfairData {
  marketId: string;
  eventId: string;
  matchOdds: {
    [team: string]: number;
  };
  runners: BetfairRunner[];
}

// Live score information
export interface LiveScore {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  completed: boolean;
  home_team: string;
  away_team: string;
  tournament_id?: number;      // The exact tournament ID
  league_key?: string;         // League key (e.g., 'ipl')
  league?: string;             // League name (e.g., 'Indian Premier League')
  venue?: string;              // Venue name
  status?: string;             // Status of the match ('live', 'completed', etc.)
  eventStatus?: string;        // Alternative status field used by some API responses
  scores?: {
    home: {
      score: string;
      overs?: string;
      wickets?: number;
    };
    away: {
      score: string;
      overs?: string;
      wickets?: number;
    };
    result?: string;          // Match result text
  };
  last_update?: string;
  toss?: {
    winner: string;
    decision: string;
  };    // Toss information
}

// Convert to format compatible with existing app
export interface CompatibleMatch {
  id: string;
  title: string;
  short_title: string;
  status: string;              // 'live', 'not_started', 'completed'
  status_str: string;          // Human-readable status
  competition_name: string;
  competition_id: string;
  date: string;
  time: string;
  localteam_id: string;
  localteam_name: string;
  localteam_score?: string;
  localteam_overs?: string;
  visitorteam_id: string;
  visitorteam_name: string;
  visitorteam_score?: string;
  visitorteam_overs?: string;
  venue_name: string;
  toss_winner?: string;
  toss_decision?: string;
  result?: string;             // Match result
  is_live: boolean;
  betting_odds?: {
    match_winner?: {
      [team: string]: number;
    };
    toss_winner?: {
      [team: string]: number;
    };
    totals?: {
      over?: {
        value: number;
        price: number;
      };
      under?: {
        value: number;
        price: number;
      };
    };
  };
  // Betfair Exchange specific fields
  market_id?: string;          // Betfair Market ID
  betfair_data?: BetfairData;  // Raw Betfair Exchange data
} 