// src/constants/leagues.ts

export interface LeagueConfig {
  /** SportMonks league ID */
  id: number;
  /** Human-readable competition name */
  name: string;
  /** SportMonks current_season_id for this competition */
  seasonId: number;
}

/** Cricket leagues and their active season IDs */
export const CRICKET_LEAGUES: LeagueConfig[] = [
  {
    id: 1,  // IPL (Indian Premier League)
    name: 'IPL (Indian Premier League)',
    seasonId: 1689,  // Current 2024 IPL season ID
  },
  {
    id: 8,  // Pakistan Super League
    name: 'Pakistan Super League',
    seasonId: 1698,  // Current PSL season ID
  },
  {
    id: 18,  // ICC Cricket World Cup
    name: 'ICC World Cup',
    seasonId: 1325,  // Current World Cup season ID
  },
  {
    id: 4,  // Test Series
    name: 'Test Series',
    seasonId: 1659,  // Current Test Series season ID
  },
];

/** Football leagues and their active season IDs */
export const FOOTBALL_LEAGUES: LeagueConfig[] = [
  {
    id: 501,  // Premier League (England)
    name: 'Premier League',
    seasonId: 27089,  // Replace with current_season_id from API
  },
  {
    id: 271, // Danish Superliga
    name: 'Danish Superliga',
    seasonId: 4123,  // Replace with current_season_id from API
  },
]; 