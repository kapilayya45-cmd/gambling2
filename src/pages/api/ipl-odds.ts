import type { NextApiRequest, NextApiResponse } from 'next';
import { getIPLMatchesFromOddsApi1 } from '@/services/directOddsApi';

// Simple in-memory cache for the API route
let routeCache = {
  data: null as any,
  timestamp: 0,
  expiry: 1 * 60 * 1000 // Reduce to 1 minute cache to get fresher data
};

// Demo matches for fallback if everything fails
const DEMO_MATCHES = [
  {
    id: "demo1",
    title: "Mumbai Indians vs Chennai Super Kings",
    short_title: "MI vs CSK",
    status: "live",
    status_str: "Live",
    competition_name: "Indian Premier League",
    competition_id: "ipl",
    date: "2025-06-01",
    time: "14:00:00",
    localteam_id: "mumbai_indians",
    localteam_name: "Mumbai Indians",
    localteam_score: "142/3",
    localteam_overs: "15.2",
    visitorteam_id: "chennai_super_kings",
    visitorteam_name: "Chennai Super Kings",
    visitorteam_score: "",
    visitorteam_overs: "",
    venue_name: "Wankhede Stadium",
    is_live: true,
    betting_odds: {
      match_winner: {
        "Mumbai Indians": 1.85,
        "Chennai Super Kings": 1.95
      }
    }
  },
  {
    id: "demo2",
    title: "Royal Challengers Bengaluru vs Punjab Kings",
    short_title: "RCB vs PBKS",
    status: "not_started",
    status_str: "Not Started",
    competition_name: "Indian Premier League",
    competition_id: "ipl",
    date: "2025-06-03",
    time: "14:00:00",
    localteam_id: "royal_challengers_bengaluru",
    localteam_name: "Royal Challengers Bengaluru",
    localteam_score: "",
    localteam_overs: "",
    visitorteam_id: "punjab_kings",
    visitorteam_name: "Punjab Kings",
    visitorteam_score: "",
    visitorteam_overs: "",
    venue_name: "M. Chinnaswamy Stadium",
    is_live: false,
    betting_odds: {
      match_winner: {
        "Royal Challengers Bengaluru": 2.10,
        "Punjab Kings": 1.75
      }
    }
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log("API route: Attempting to fetch IPL odds");
    
    // Always fetch fresh data for debugging purposes by setting skipCache=true in query
    const skipCache = req.query.skipCache === 'true';
    
    // Check if we have valid cached data and skipCache is not set
    if (!skipCache && routeCache.data && (Date.now() - routeCache.timestamp) < routeCache.expiry) {
      console.log('Using API route cache');
      
      // Return cached data with cache header
      return res.status(200).json(routeCache.data);
    }

    // Force fetching new data
    console.log("Fetching fresh data from odds-api1...");
    const matches = await getIPLMatchesFromOddsApi1();
    console.log(`API route: Fetched ${matches.length} IPL matches from odds-api1`);
    
    // Log match details for debugging
    if (matches && matches.length > 0) {
      console.log("Matches found:");
      matches.forEach(match => {
        console.log(`- ${match.localteam_name} vs ${match.visitorteam_name} (ID: ${match.id}, Date: ${match.date})`);
      });
    }
    
    // If no matches returned, use demo matches
    if (!matches || matches.length === 0) {
      console.log("API route: No matches returned, using demo matches");
      
      // Update cache with demo matches
      routeCache.data = DEMO_MATCHES;
      routeCache.timestamp = Date.now();
      
      // Return demo matches
      return res.status(200).json(DEMO_MATCHES);
    }
    
    // Update cache
    routeCache.data = matches;
    routeCache.timestamp = Date.now();
    
    // Return data
    return res.status(200).json(matches);
  } catch (e: any) {
    console.error('IPL odds API error:', e);
    
    // Return cached data even if expired in case of error
    if (routeCache.data) {
      console.log('Returning expired cache due to error');
      return res.status(200).json(routeCache.data);
    }
    
    // If no cache available, return demo matches instead of error
    console.log('No cache available, returning demo matches');
    return res.status(200).json(DEMO_MATCHES);
  }
} 