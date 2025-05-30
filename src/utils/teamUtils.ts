/**
 * Utility functions for team name handling
 */

// Map of team IDs/slugs to proper display names
export const TEAM_NAME_MAP: Record<string, string> = {
  'mumbai_indians': 'Mumbai Indians',
  'chennai_super_kings': 'Chennai Super Kings',
  'royal_challengers_bangalore': 'Royal Challengers Bangalore',
  'kolkata_knight_riders': 'Kolkata Knight Riders',
  'delhi_capitals': 'Delhi Capitals',
  'rajasthan_royals': 'Rajasthan Royals',
  'sunrisers_hyderabad': 'Sunrisers Hyderabad',
  'punjab_kings': 'Punjab Kings',
  'gujarat_titans': 'Gujarat Titans',
  'lucknow_super_giants': 'Lucknow Super Giants'
};

// Map of team names to abbreviations
export const TEAM_ABBREVIATIONS: Record<string, string> = {
  'Mumbai Indians': 'MI',
  'Chennai Super Kings': 'CSK',
  'Royal Challengers Bangalore': 'RCB',
  'Kolkata Knight Riders': 'KKR',
  'Delhi Capitals': 'DC',
  'Rajasthan Royals': 'RR',
  'Sunrisers Hyderabad': 'SRH',
  'Punjab Kings': 'PBKS',
  'Gujarat Titans': 'GT',
  'Lucknow Super Giants': 'LSG'
};

/**
 * Format a team name to proper display format
 * @param name Raw team name that might have "Team" prefix or underscores
 * @returns Properly formatted team name
 */
export function formatTeamName(name: string): string {
  // Remove "Team " prefix if present
  let formattedName = name.replace(/^Team\s+/, '');
  
  // Check if it's in our mapping
  if (TEAM_NAME_MAP[formattedName.toLowerCase()]) {
    return TEAM_NAME_MAP[formattedName.toLowerCase()];
  }
  
  // Otherwise format it by capitalizing each word and replacing underscores
  return formattedName.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get the abbreviation for a team
 * @param name Team name (should be properly formatted)
 * @returns Team abbreviation or first word of team name if not found
 */
export function getTeamAbbreviation(name: string): string {
  const formattedName = formatTeamName(name);
  return TEAM_ABBREVIATIONS[formattedName] || formattedName.split(' ')[0];
}

/**
 * Create a short title for a match using team abbreviations
 * @param homeTeam Home team name
 * @param awayTeam Away team name
 * @returns Short title like "MI vs CSK"
 */
export function createShortTitle(homeTeam: string, awayTeam: string): string {
  const homeAbbr = getTeamAbbreviation(homeTeam);
  const awayAbbr = getTeamAbbreviation(awayTeam);
  return `${homeAbbr} vs ${awayAbbr}`;
} 