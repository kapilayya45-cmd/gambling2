import { NextApiRequest, NextApiResponse } from 'next';
import { ODDS_API, ENDPOINTS } from '../../../config/oddsApiConfig';
import axios from 'axios';

// This endpoint serves as a proxy for fetching cricket fixtures
// to avoid CORS issues in the browser
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { fromDate, toDate } = req.query;
  
  // Get Rapid API key from env
  const rapidApiKey = ODDS_API.RAPID_API_KEY;
  
  if (!rapidApiKey) {
    return res.status(400).json({
      error: 'No Rapid API key provided',
      message: 'Please set NEXT_PUBLIC_RAPID_API_KEY environment variable'
    });
  }
  
  // Default date range if not provided (next 30 days)
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + 30);
  
  const startDate = fromDate ? (Array.isArray(fromDate) ? fromDate[0] : fromDate) : today.toISOString().split('T')[0];
  const endDate = toDate ? (Array.isArray(toDate) ? toDate[0] : toDate) : futureDate.toISOString().split('T')[0];
  
  try {
    console.log('Fetching IPL fixtures from ODDS-API...');
    
    // Fetch fixtures with odds
    const response = await axios.get(ENDPOINTS.UPCOMING_MATCHES, {
      baseURL: ODDS_API.BASE_URL,
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': ODDS_API.RAPID_API_HOST,
      },
    });
    
    // Extract the data - handle new API format
    let upcomingMatches = [];
    
    if (response.data && response.data.events) {
      // New API format (odds-api1)
      const eventsObj = response.data.events;
      upcomingMatches = Object.values(eventsObj);
      console.log(`Found ${upcomingMatches.length} events in new API format`);
    } else {
      console.warn("Unexpected API response format");
      upcomingMatches = [];
    }
    
    // Filter for IPL matches - handle new API format
    let matches = upcomingMatches.filter((match: any) => {
      // We're using tournament ID 2472 which is already filtered
      return true;
    });
    
    // Filter by date range if needed
    if (startDate || endDate) {
      const startTimestamp = startDate ? new Date(startDate as string).getTime() : 0;
      const endTimestamp = endDate ? new Date(endDate as string).getTime() : Infinity;
      
      matches = matches.filter((match: any) => {
        // Handle new API format
        const matchTimeStr = match.startTime ? new Date(match.startTime * 1000).toISOString() : null;
        if (!matchTimeStr) return true; // Include if we can't determine time
        
        const matchDate = new Date(matchTimeStr).getTime();
        return matchDate >= startTimestamp && matchDate <= endTimestamp;
      });
    }
    
    // Format matches into expected format for the frontend
    const formattedData = {
      data: matches.map((match: any) => {
        // Handle new API format
        const homeTeam = match.participant1 || "";
        const awayTeam = match.participant2 || "";
        const matchTime = match.startTime ? new Date(match.startTime * 1000).toISOString() : new Date().toISOString();
        
        return {
          id: match.eventId || `match_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          league_id: 'ipl',
          localteam_id: homeTeam.toLowerCase().replace(/\s+/g, '_'),
          visitorteam_id: awayTeam.toLowerCase().replace(/\s+/g, '_'),
          starting_at: matchTime,
          status: 'not_started',
          venue_name: match.venue || 'TBD',
          venue_city: '',
          league: {
            id: 'ipl',
            name: 'Indian Premier League',
            code: 'IPL'
          },
          localteam: {
            id: homeTeam.toLowerCase().replace(/\s+/g, '_'),
            name: homeTeam,
            code: homeTeam.split(' ')[0]?.toUpperCase(),
            image_path: ''
          },
          visitorteam: {
            id: awayTeam.toLowerCase().replace(/\s+/g, '_'),
            name: awayTeam,
            code: awayTeam.split(' ')[0]?.toUpperCase(),
            image_path: ''
          },
          localteam_score: '',
          visitorteam_score: '',
          toss_winner_team_id: '',
          toss_decision: '',
          competition: {
            cid: 'ipl',
            title: 'Indian Premier League',
            abbr: 'IPL'
          }
        };
      })
    };
    
    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching IPL fixtures:', error);
    
    // Return a helpful error message
    res.status(500).json({
      error: 'Failed to fetch IPL fixtures',
      message: error.message,
      suggestion: 'Please sign up for a Rapid API key and add it to your environment variables as NEXT_PUBLIC_RAPID_API_KEY'
    });
  }
} 