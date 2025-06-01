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
      path: '/events?tournamentId=2472&media=true',
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
  if (!data || !data.events) {
    console.error('Invalid data format from odds-api1');
    return [];
  }
  
  try {
    // Get events object and convert to array
    const eventsObj = data.events;
    const events = Object.values(eventsObj);
    
    console.log(`Found ${events.length} IPL events from API`);
    
    // Map the data to our compatible format
    const matches = events.map((event: any) => {
      // Extract team names
      const homeTeam = event.participant1 || '';
      const awayTeam = event.participant2 || '';
      
      // Format team IDs
      const localteam_id = event.participant1Id?.toString() || homeTeam.toLowerCase().replace(/\s+/g, '_');
      const visitorteam_id = event.participant2Id?.toString() || awayTeam.toLowerCase().replace(/\s+/g, '_');
      
      // Parse date and time
      const startTime = event.startTime ? new Date(event.startTime * 1000) : new Date();
      const dateStr = event.date || startTime.toISOString().split('T')[0];
      const timeStr = event.time || startTime.toISOString().split('T')[1].substring(0, 8);
      
      // Check if match is live
      const isLive = event.eventStatus === 'live' || event.eventStatus === 'inprogress';
      const isCompleted = event.eventStatus === 'ended' || event.eventStatus === 'finished';
      
      // Create compatible match object
      const match: CompatibleMatch = {
        id: event.eventId || `event_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        title: `${homeTeam} vs ${awayTeam}`,
        short_title: `${homeTeam.split(' ')[0]} vs ${awayTeam.split(' ')[0]}`,
        status: isLive ? 'live' : (isCompleted ? 'completed' : 'not_started'),
        status_str: isLive ? 'Live' : (isCompleted ? 'Completed' : 'Not Started'),
        competition_name: data.name || 'Indian Premier League',
        competition_id: 'ipl',
        date: dateStr,
        time: timeStr,
        localteam_id,
        localteam_name: homeTeam,
        localteam_score: '',  // Live data would need to be fetched separately
        localteam_overs: '',
        visitorteam_id,
        visitorteam_name: awayTeam,
        visitorteam_score: '',
        visitorteam_overs: '',
        venue_name: event.venue || 'TBD',
        is_live: isLive,
        betting_odds: {
          match_winner: {
            [homeTeam]: 150 + Math.random() * 50,  // Example odds
            [awayTeam]: 150 + Math.random() * 50
          }
        }
      };
      
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