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
 * Fetch betting odds specifically for the Punjab Kings vs Mumbai Indians match
 * Using Betfair Exchange API
 */
export const fetchBetfairOdds = async (eventId: string = 'id2700247260533347'): Promise<any> => {
  return new Promise((resolve, reject) => {
    const https = require('https');
    
    const options = {
      method: 'GET',
      hostname: 'odds-api1.p.rapidapi.com',
      port: null,
      path: `/odds?eventId=${eventId}&bookmakers=betfair-ex&oddsFormat=decimal&raw=true`,
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
          console.log('Successfully fetched Betfair Exchange odds');
          resolve(parsedData);
        } catch (error) {
          console.error('Error parsing Betfair Exchange response:', error);
          reject(error);
        }
      });
      
      res.on('error', (error: any) => {
        console.error('Error in Betfair Exchange response:', error);
        reject(error);
      });
    });
    
    req.on('error', (error: any) => {
      console.error('Error making request to Betfair Exchange:', error);
      reject(error);
    });
    
    req.end();
  });
};

/**
 * Parse Betfair Exchange odds data for Punjab Kings vs Mumbai Indians
 */
export const parseBetfairOdds = (data: any): any => {
  if (!data) return null;
  
  try {
    // Extract market data for MATCH_ODDS market type
    const marketData = data.find((market: any) => market.marketType === 'MATCH_ODDS');
    if (!marketData) return null;
    
    // Extract runner data for Punjab Kings and Mumbai Indians
    const punjabKingsRunner = marketData.runners?.find((runner: any) => 
      runner.runnerId === '38528100' || runner.runnerName === 'Punjab Kings');
      
    const mumbaiIndiansRunner = marketData.runners?.find((runner: any) => 
      runner.runnerId === '2954281' || runner.runnerName === 'Mumbai Indians');
    
    if (!punjabKingsRunner || !mumbaiIndiansRunner) return null;
    
    // Get the best available odds (typically the first price in the list)
    const punjabOdds = punjabKingsRunner.prices?.[0]?.price || 1.90;
    const mumbaiOdds = mumbaiIndiansRunner.prices?.[0]?.price || 1.90;
    
    return {
      marketId: marketData.marketId || '1.244386290',
      eventId: data.eventId || 'id2700247260533347',
      matchOdds: {
        'Punjab Kings': punjabOdds,
        'Mumbai Indians': mumbaiOdds
      },
      runners: [
        {
          runnerId: punjabKingsRunner.runnerId || '38528100',
          runnerName: punjabKingsRunner.runnerName || 'Punjab Kings',
          odds: punjabOdds
        },
        {
          runnerId: mumbaiIndiansRunner.runnerId || '2954281',
          runnerName: mumbaiIndiansRunner.runnerName || 'Mumbai Indians',
          odds: mumbaiOdds
        }
      ]
    };
  } catch (error) {
    console.error('Error parsing Betfair Exchange odds:', error);
    return null;
  }
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
    
    // Try to fetch Betfair Exchange odds for Punjab Kings vs Mumbai Indians
    let betfairOddsData = null;
    try {
      const betfairRawData = await fetchBetfairOdds();
      betfairOddsData = parseBetfairOdds(betfairRawData);
      console.log('Successfully fetched and parsed Betfair Exchange odds:', betfairOddsData);
    } catch (error) {
      console.error('Error fetching Betfair Exchange odds:', error);
    }
    
    // Map the data to our compatible format
    const matches = await Promise.all(events.map(async (event: any) => {
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
      
      // Prepare betting odds
      let matchWinnerOdds: Record<string, number> = {};
      
      // If this is the Punjab Kings vs Mumbai Indians match and we have Betfair odds, use them
      const isPunjabVsMumbai = 
        (homeTeam.includes('Punjab') && awayTeam.includes('Mumbai')) || 
        (homeTeam.includes('Mumbai') && awayTeam.includes('Punjab')) ||
        event.eventId === 'id2700247260533347';
        
      if (isPunjabVsMumbai && betfairOddsData) {
        matchWinnerOdds = betfairOddsData.matchOdds;
        console.log(`Using Betfair Exchange odds for ${homeTeam} vs ${awayTeam}`);
      } else {
        // Use default odds
        matchWinnerOdds = {
          [homeTeam]: 1.90,
          [awayTeam]: 1.90
        };
      }
      
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
          match_winner: matchWinnerOdds
        }
      };
      
      // If this is specifically the Punjab Kings vs Mumbai Indians match, add additional data
      if (isPunjabVsMumbai && betfairOddsData) {
        match.market_id = betfairOddsData.marketId;
        match.betfair_data = betfairOddsData;
      }
      
      return match;
    }));
    
    return matches;
  } catch (error) {
    console.error('Error converting odds-api1 data:', error);
    return [];
  }
};

/**
 * Get IPL matches from odds-api1 endpoint
 */
export const getIPLMatchesFromOddsApi1 = async (): Promise<CompatibleMatch[]> => {
  console.log('Directly fetching IPL match data from odds-api1 endpoint...');
  
  try {
    const data = await fetchIPLTournamentData();
    return await convertOddsApi1Data(data);
  } catch (error) {
    console.error('Error fetching IPL matches from odds-api1:', error);
    return [];
  }
};

/**
 * Directly fetch data for the Punjab Kings vs Mumbai Indians match
 */
export const getPunjabVsMumbaiMatch = async (): Promise<CompatibleMatch | null> => {
  try {
    const betfairRawData = await fetchBetfairOdds('id2700247260533347');
    const betfairOddsData = parseBetfairOdds(betfairRawData);
    
    if (!betfairOddsData) {
      console.error('Failed to parse Betfair Exchange odds');
      return null;
    }
    
    // Create a match object using the Betfair data
    const match: CompatibleMatch = {
      id: 'id2700247260533347',
      title: 'Punjab Kings vs Mumbai Indians',
      short_title: 'PBKS vs MI',
      status: 'live',
      status_str: 'Live',
      competition_name: 'Indian Premier League',
      competition_id: 'ipl',
      date: '2025-06-01',
      time: '14:00:00',
      localteam_id: 'punjab_kings',
      localteam_name: 'Punjab Kings',
      localteam_score: '81',  // From the data provided
      localteam_overs: '',
      visitorteam_id: 'mumbai_indians',
      visitorteam_name: 'Mumbai Indians',
      visitorteam_score: '0',
      visitorteam_overs: '',
      venue_name: 'TBD',
      is_live: true,
      betting_odds: {
        match_winner: betfairOddsData.matchOdds
      },
      market_id: betfairOddsData.marketId,
      betfair_data: betfairOddsData
    };
    
    return match;
  } catch (error) {
    console.error('Error fetching Punjab vs Mumbai match:', error);
    return null;
  }
}; 