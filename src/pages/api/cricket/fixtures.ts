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
    
    // Extract the data
    const upcomingMatches = response.data.data || response.data || [];
    
    // Filter for IPL matches
    let matches = upcomingMatches.filter((match: any) => 
      match.league_key === 'ipl' || 
      (match.league && match.league.toLowerCase().includes('indian premier league'))
    );
    
    // Filter by date range if needed
    if (startDate || endDate) {
      const startTimestamp = startDate ? new Date(startDate as string).getTime() : 0;
      const endTimestamp = endDate ? new Date(endDate as string).getTime() : Infinity;
      
      matches = matches.filter((match: any) => {
        const matchDate = new Date(match.commence_time).getTime();
        return matchDate >= startTimestamp && matchDate <= endTimestamp;
      });
    }
    
    // Format matches into expected format for the frontend
    const formattedData = {
      data: matches.map((match: any) => {
        return {
          id: match.id,
          league_id: 'ipl',
          localteam_id: match.home_team?.toLowerCase().replace(/\s+/g, '_'),
          visitorteam_id: match.away_team?.toLowerCase().replace(/\s+/g, '_'),
          starting_at: match.commence_time,
          status: 'not_started',
          venue_name: match.venue || 'TBD',
          venue_city: '',
          league: {
            id: 'ipl',
            name: 'Indian Premier League',
            code: 'IPL'
          },
          localteam: {
            id: match.home_team?.toLowerCase().replace(/\s+/g, '_'),
            name: match.home_team,
            code: match.home_team?.split(' ')[0]?.toUpperCase(),
            image_path: ''
          },
          visitorteam: {
            id: match.away_team?.toLowerCase().replace(/\s+/g, '_'),
            name: match.away_team,
            code: match.away_team?.split(' ')[0]?.toUpperCase(),
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