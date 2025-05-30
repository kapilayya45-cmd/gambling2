/**
 * Direct API client for odds-api1 endpoint
 * Uses the native https module for API requests
 */

import { CompatibleMatch } from '@/types/oddsApiTypes';
import { formatTeamName, getTeamAbbreviation, createShortTitle } from '@/utils/teamUtils';

/**
 * Fetch IPL tournament data directly from odds-api1 endpoint
 */
export const fetchIPLTournamentData = async (): Promise<any> => {
  return new Promise((resolve, reject) => {
    const https = require('https');
    
    const options = {
      method: 'GET',
      hostname: 'odds-api1.p.rapidapi.com',
      port: null,
      path: '/events?tournamentId=2472&media=false',
      headers: {
        'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPID_API_KEY || '1020ae1023msh7e73e2903b32c6fp1c73d5jsne2584a26764b',
        'x-rapidapi-host': 'odds-api1.p.rapidapi.com'
      }
    };
    
    const req = https.request(options, (res: any) => {
      const chunks: any[] = [];
      
      res.on('data', (chunk: any) => {
        chunks.push(chunk);
      });
      
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        try {
          const parsedData = JSON.parse(body.toString());
          console.log('Successfully fetched data from odds-api1');
          resolve(parsedData);
        } catch (error) {
          console.error('Error parsing odds-api1 response:', error);
          reject(error);
        }
      });
      
      res.on('error', (error: any) => {
        console.error('Error in odds-api1 response:', error);
        reject(error);
      });
    });
    
    req.on('error', (error: any) => {
      console.error('Error making request to odds-api1:', error);
      reject(error);
    });
    
    req.end();
  });
};

/**
 * Convert rupee odds (multiply by approximately 83 for exchange rate)
 */
const convertToRupees = (odds: number): number => {
  return parseFloat((odds * 83).toFixed(2));
};

/**
 * Convert odds-api1 data to our compatible match format
 */
export const convertOddsApi1Data = async (data: any): Promise<CompatibleMatch[]> => {
  if (!data || !Array.isArray(data)) {
    console.error('Invalid data format from odds-api1');
    return [];
  }
  
  try {
    // Map the data to our compatible format
    const matches = data.map((event: any) => {
      // Extract and format team names
      const rawHomeTeam = event.home?.name || '';
      const rawAwayTeam = event.away?.name || '';
      
      const homeTeam = formatTeamName(rawHomeTeam);
      const awayTeam = formatTeamName(rawAwayTeam);
      
      // Format team IDs
      const localteam_id = rawHomeTeam.toLowerCase().replace(/\s+/g, '_');
      const visitorteam_id = rawAwayTeam.toLowerCase().replace(/\s+/g, '_');
      
      // Parse commence time
      const commence_time = event.commence_time || event.startTime || new Date().toISOString();
      const date = new Date(commence_time);
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = date.toISOString().split('T')[1].substring(0, 8);
      
      // Check if match is live
      const isLive = event.status === 'inprogress' || event.status === 'live';
      
      // Create compatible match object
      const match: CompatibleMatch = {
        id: event.id || `event_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        title: `${homeTeam} vs ${awayTeam}`,
        short_title: createShortTitle(homeTeam, awayTeam),
        status: isLive ? 'live' : (event.status === 'finished' ? 'completed' : 'not_started'),
        status_str: isLive ? 'Live' : (event.status === 'finished' ? 'Completed' : 'Not Started'),
        competition_name: event.tournament?.name || 'Indian Premier League',
        competition_id: 'ipl',
        date: dateStr,
        time: timeStr,
        localteam_id,
        localteam_name: homeTeam,
        localteam_score: event.scores?.home || '',
        localteam_overs: '',
        visitorteam_id,
        visitorteam_name: awayTeam,
        visitorteam_score: event.scores?.away || '',
        visitorteam_overs: '',
        venue_name: event.venue?.name || 'TBD',
        is_live: isLive,
        betting_odds: {}
      };
      
      // Add betting odds if available
      if (event.markets && Array.isArray(event.markets)) {
        const matchWinnerMarket = event.markets.find((market: any) => 
          market.key === 'h2h' || market.name?.toLowerCase().includes('winner')
        );
        
        if (matchWinnerMarket && matchWinnerMarket.outcomes) {
          const matchWinnerOdds: Record<string, number> = {};
          
          matchWinnerMarket.outcomes.forEach((outcome: any) => {
            if (outcome.name && outcome.price) {
              // Format the team name for the betting odds
              const formattedName = formatTeamName(outcome.name);
              matchWinnerOdds[formattedName] = convertToRupees(outcome.price);
            }
          });
          
          match.betting_odds.match_winner = matchWinnerOdds;
        }
      }
      
      return match;
    });
    
    return matches;
  } catch (error) {
    console.error('Error converting odds-api1 data:', error);
    return [];
  }
};

/**
 * Fetch and convert odds-api1 data in one call
 */
export const getIPLMatchesFromOddsApi1 = async (): Promise<CompatibleMatch[]> => {
  try {
    const data = await fetchIPLTournamentData();
    return await convertOddsApi1Data(data);
  } catch (error) {
    console.error('Error in getIPLMatchesFromOddsApi1:', error);
    return [];
  }
}; 