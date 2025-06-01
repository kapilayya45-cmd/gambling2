import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';
import { formatTeamName, getTeamAbbreviation, createShortTitle } from '@/utils/teamUtils';

// Simple in-memory cache for the API route
const routeCache = {
  data: null as any,
  timestamp: 0,
  expiry: 2 * 60 * 1000 // 2 minutes cache
};

// Convert USD odds to INR (multiply by approximately 83 for exchange rate)
const convertToRupees = (odds: number): number => {
  return parseFloat((odds * 83).toFixed(2));
};

// Define types for API responses
type ApiEvent = {
  id?: string;
  home?: { name?: string };
  away?: { name?: string };
  commence_time?: string;
  startTime?: string;
  status?: string;
  tournament?: { name?: string };
  venue?: { name?: string } | string;
  scores?: { home?: string; away?: string };
  markets?: Array<{
    key?: string;
    name?: string;
    outcomes?: Array<{
      name?: string;
      price?: number;
    }>;
  }>;
};

type ApiResponse = {
  events?: ApiEvent[] | Record<string, ApiEvent>;
  [key: string]: any;
};

// Define the match object type with proper typing for betting_odds
interface CompatibleMatch {
  id: string;
  title: string;
  short_title: string;
  status: string;
  status_str: string;
  competition_name: string;
  competition_id: string;
  date: string;
  time: string;
  localteam_id: string;
  localteam_name: string;
  localteam_score: string;
  localteam_overs: string;
  visitorteam_id: string;
  visitorteam_name: string;
  visitorteam_score: string;
  visitorteam_overs: string;
  venue_name: string;
  is_live: boolean;
  betting_odds: {
    match_winner?: Record<string, number>;
    [key: string]: any;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log("Direct Odds API: Attempting to fetch IPL odds");
    
    // Check if we have valid cached data
    if (routeCache.data && (Date.now() - routeCache.timestamp) < routeCache.expiry) {
      console.log('Using API route cache');
      return res.status(200).json(routeCache.data);
    }

    // Fetch new data
    const data = await new Promise<ApiResponse | ApiEvent[]>((resolve, reject) => {
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
      
      const req = https.request(options, (res) => {
        const chunks: any[] = [];
        
        res.on('data', (chunk) => {
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
        
        res.on('error', (error) => {
          console.error('Error in odds-api1 response:', error);
          reject(error);
        });
      });
      
      req.on('error', (error) => {
        console.error('Error making request to odds-api1:', error);
        reject(error);
      });
      
      req.end();
    });

    // Process the data - handle both array and object formats
    let eventsArray: ApiEvent[] = [];
    
    if (Array.isArray(data)) {
      console.log('API response is already an array');
      eventsArray = data;
    } else if (data && typeof data === 'object') {
      console.log('API response is an object, checking for events property');
      // Check if it has an events property that might be an array or object
      if ('events' in data && data.events) {
        if (Array.isArray(data.events)) {
          console.log('Found events array in response');
          eventsArray = data.events;
        } else if (typeof data.events === 'object') {
          console.log('Found events object in response, converting to array');
          eventsArray = Object.values(data.events);
        }
      } else {
        // If no events property, try to convert the whole object to an array
        console.log('No events property found, using object values as array');
        eventsArray = Object.values(data);
      }
    }
    
    if (!eventsArray.length) {
      console.log('No events found in response, using fallback data');
      // Provide fallback data for testing
      eventsArray = [
        {
          id: 'fallback_1',
          home: { name: 'Mumbai Indians' },
          away: { name: 'Chennai Super Kings' },
          commence_time: new Date().toISOString(),
          status: 'not_started'
        },
        {
          id: 'fallback_2',
          home: { name: 'Delhi Capitals' },
          away: { name: 'Royal Challengers Bengaluru' },
          commence_time: new Date().toISOString(),
          status: 'not_started'
        }
      ];
    }

    const matches: CompatibleMatch[] = eventsArray.map((event: ApiEvent) => {
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
      
      // Handle venue which can be a string or an object with a name property
      let venueName = 'TBD';
      if (event.venue) {
        if (typeof event.venue === 'string') {
          venueName = event.venue;
        } else if (typeof event.venue === 'object' && event.venue.name) {
          venueName = event.venue.name;
        }
      }
      
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
        venue_name: venueName,
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
    
    // Update cache
    routeCache.data = matches;
    routeCache.timestamp = Date.now();
    
    // Return the data
    return res.status(200).json(matches);
  } catch (error) {
    console.error('Error in direct odds API:', error);
    
    // Return cached data even if expired in case of error
    if (routeCache.data) {
      return res.status(200).json(routeCache.data);
    }
    
    // Fallback to hardcoded data if no cache is available
    const fallbackMatches: CompatibleMatch[] = [
      {
        id: 'static_fallback_1',
        title: 'Mumbai Indians vs Chennai Super Kings',
        short_title: 'MI vs CSK',
        status: 'not_started',
        status_str: 'Not Started',
        competition_name: 'Indian Premier League',
        competition_id: 'ipl',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toISOString().split('T')[1].substring(0, 8),
        localteam_id: 'mumbai_indians',
        localteam_name: 'Mumbai Indians',
        localteam_score: '',
        localteam_overs: '',
        visitorteam_id: 'chennai_super_kings',
        visitorteam_name: 'Chennai Super Kings',
        visitorteam_score: '',
        visitorteam_overs: '',
        venue_name: 'Wankhede Stadium',
        is_live: false,
        betting_odds: {
          match_winner: {
            'Mumbai Indians': 185,
            'Chennai Super Kings': 195
          }
        }
      },
      {
        id: 'static_fallback_2',
        title: 'Delhi Capitals vs Royal Challengers Bengaluru',
        short_title: 'DC vs RCB',
        status: 'not_started',
        status_str: 'Not Started',
        competition_name: 'Indian Premier League',
        competition_id: 'ipl',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toISOString().split('T')[1].substring(0, 8),
        localteam_id: 'delhi_capitals',
        localteam_name: 'Delhi Capitals',
        localteam_score: '',
        localteam_overs: '',
        visitorteam_id: 'royal_challengers_bengaluru',
        visitorteam_name: 'Royal Challengers Bengaluru',
        visitorteam_score: '',
        visitorteam_overs: '',
        venue_name: 'Arun Jaitley Stadium',
        is_live: false,
        betting_odds: {
          match_winner: {
            'Delhi Capitals': 190,
            'Royal Challengers Bengaluru': 175
          }
        }
      }
    ];
    
    console.log('Returning fallback data');
    return res.status(200).json(fallbackMatches);
  }
} 