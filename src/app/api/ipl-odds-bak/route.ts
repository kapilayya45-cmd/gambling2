import { NextResponse } from 'next/server';
import { fetchIPLOdds } from '../../../services/oddsApiService';

// Simple in-memory cache for the API route
let routeCache = {
  data: null as any,
  timestamp: 0,
  expiry: 2 * 60 * 1000 // 2 minutes cache
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
    title: "Royal Challengers Bangalore vs Kolkata Knight Riders",
    short_title: "RCB vs KKR",
    status: "not_started",
    status_str: "Not Started",
    competition_name: "Indian Premier League",
    competition_id: "ipl",
    date: "2025-06-03",
    time: "14:00:00",
    localteam_id: "royal_challengers_bangalore",
    localteam_name: "Royal Challengers Bangalore",
    localteam_score: "",
    localteam_overs: "",
    visitorteam_id: "kolkata_knight_riders",
    visitorteam_name: "Kolkata Knight Riders",
    visitorteam_score: "",
    visitorteam_overs: "",
    venue_name: "M. Chinnaswamy Stadium",
    is_live: false,
    betting_odds: {
      match_winner: {
        "Royal Challengers Bangalore": 2.10,
        "Kolkata Knight Riders": 1.75
      }
    }
  }
];

export async function GET() {
  try {
    console.log("API route: Attempting to fetch IPL odds");
    
    // Check if we have valid cached data
    if (routeCache.data && (Date.now() - routeCache.timestamp) < routeCache.expiry) {
      console.log('Using API route cache');
      
      // Return cached data with cache header
      return NextResponse.json(routeCache.data, {
        headers: {
          'Cache-Control': 'public, max-age=120',
        }
      });
    }

    // Fetch new data
    const matches = await fetchIPLOdds();
    console.log(`API route: Fetched ${matches.length} IPL matches`);
    
    // If no matches returned, use demo matches
    if (!matches || matches.length === 0) {
      console.log("API route: No matches returned, using demo matches");
      
      // Update cache with demo matches
      routeCache.data = DEMO_MATCHES;
      routeCache.timestamp = Date.now();
      
      // Return demo matches
      return NextResponse.json(DEMO_MATCHES, {
        headers: {
          'Cache-Control': 'public, max-age=60',
        }
      });
    }
    
    // Update cache
    routeCache.data = matches;
    routeCache.timestamp = Date.now();
    
    // Return with cache headers
    return NextResponse.json(matches, {
      headers: {
        'Cache-Control': 'public, max-age=120',
      }
    });
  } catch (e: any) {
    console.error('IPL odds API error:', e);
    
    // Return cached data even if expired in case of error
    if (routeCache.data) {
      console.log('Returning expired cache due to error');
      return NextResponse.json(routeCache.data, {
        headers: {
          'Cache-Control': 'public, max-age=60',
        }
      });
    }
    
    // If no cache available, return demo matches instead of error
    console.log('No cache available, returning demo matches');
    return NextResponse.json(DEMO_MATCHES, {
      headers: {
        'Cache-Control': 'public, max-age=60',
      }
    });
  }
} 