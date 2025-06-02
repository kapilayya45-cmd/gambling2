import type { NextApiRequest, NextApiResponse } from 'next';
import { getPunjabVsMumbaiMatch } from '@/services/directOddsApi';

// Simple in-memory cache for the API route
let routeCache = {
  data: null as any,
  timestamp: 0,
  expiry: 30 * 1000 // 30 seconds cache for live odds
};

// Default fallback match for Punjab Kings vs Mumbai Indians
const DEFAULT_MATCH = {
  id: "id2700247260533347",
  title: "Punjab Kings vs Mumbai Indians",
  short_title: "PBKS vs MI",
  status: "live",
  status_str: "Live",
  competition_name: "Indian Premier League",
  competition_id: "ipl",
  date: "2025-06-01",
  time: "14:00:00",
  localteam_id: "punjab_kings",
  localteam_name: "Punjab Kings",
  localteam_score: "81",
  localteam_overs: "",
  visitorteam_id: "mumbai_indians",
  visitorteam_name: "Mumbai Indians",
  visitorteam_score: "0",
  visitorteam_overs: "",
  venue_name: "TBD",
  is_live: true,
  betting_odds: {
    match_winner: {
      "Punjab Kings": 2.34,
      "Mumbai Indians": 1.73
    }
  },
  market_id: "1.244386290",
  betfair_data: {
    marketId: "1.244386290",
    eventId: "id2700247260533347",
    matchOdds: {
      "Punjab Kings": 2.34,
      "Mumbai Indians": 1.73
    },
    runners: [
      {
        runnerId: "38528100",
        runnerName: "Punjab Kings",
        odds: 2.34
      },
      {
        runnerId: "2954281",
        runnerName: "Mumbai Indians",
        odds: 1.73
      }
    ]
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log("API route: Attempting to fetch Punjab Kings vs Mumbai Indians odds");
    
    // Check if we have valid cached data
    if (routeCache.data && (Date.now() - routeCache.timestamp) < routeCache.expiry) {
      console.log('Using API route cache for Punjab vs Mumbai match');
      return res.status(200).json(routeCache.data);
    }

    // Fetch new data for Punjab Kings vs Mumbai Indians
    const match = await getPunjabVsMumbaiMatch();
    
    if (!match) {
      console.log("API route: No match data returned, using default match data");
      
      // Update cache with default match
      routeCache.data = DEFAULT_MATCH;
      routeCache.timestamp = Date.now();
      
      // Return default match
      return res.status(200).json(DEFAULT_MATCH);
    }
    
    // Update cache
    routeCache.data = match;
    routeCache.timestamp = Date.now();
    
    // Return data
    return res.status(200).json(match);
  } catch (e: any) {
    console.error('Punjab vs Mumbai match API error:', e);
    
    // Return cached data even if expired in case of error
    if (routeCache.data) {
      console.log('Returning expired cache due to error');
      return res.status(200).json(routeCache.data);
    }
    
    // If no cache available, return default match
    console.log('No cache available, returning default match');
    return res.status(200).json(DEFAULT_MATCH);
  }
} 