import { NextApiRequest, NextApiResponse } from 'next';
import { ODDS_API, ENDPOINTS } from '../../../config/oddsApiConfig';
import axios from 'axios';

// This endpoint serves as a proxy for fetching cricket data
// to avoid CORS issues in the browser
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get Rapid API key from env
  const rapidApiKey = ODDS_API.RAPID_API_KEY;
  
  if (!rapidApiKey) {
    return res.status(400).json({
      error: 'No Rapid API key provided',
      message: 'Please set NEXT_PUBLIC_RAPID_API_KEY environment variable'
    });
  }
  
  try {
    console.log('Fetching live cricket matches from ODDS-API...');
    
    // Fetch live matches
    const response = await axios.get(ENDPOINTS.LIVE_SCORES, {
      baseURL: ODDS_API.BASE_URL,
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': ODDS_API.RAPID_API_HOST,
      },
    });
    
    // Extract the data - handle new API format
    let liveMatches = [];
    
    if (response.data && response.data.events) {
      // New API format (odds-api1)
      const eventsObj = response.data.events;
      liveMatches = Object.values(eventsObj);
      console.log(`Found ${liveMatches.length} events in new API format`);
    } else {
      console.warn("Unexpected API response format");
      liveMatches = [];
    }
    
    // Filter for IPL matches - handle new API format
    const iplMatches = liveMatches.filter((match: any) => {
      // We're using tournament ID 2472 which is already filtered for IPL
      return match.eventStatus === 'live' || match.eventStatus === 'inprogress';
    });
    
    console.log(`Found ${iplMatches.length} live IPL matches`);
    
    // Format matches into expected format for the frontend
    const formattedData = {
      data: iplMatches.map((match: any) => {
        // Handle new API format
        const homeTeam = match.participant1 || "";
        const awayTeam = match.participant2 || "";
        const matchTime = match.startTime ? new Date(match.startTime * 1000).toISOString() : new Date().toISOString();
        const isCompleted = match.eventStatus === 'ended' || match.eventStatus === 'finished';
        
        return {
          id: match.eventId || `match_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          league_id: 'ipl',
          localteam_id: homeTeam.toLowerCase().replace(/\s+/g, '_'),
          visitorteam_id: awayTeam.toLowerCase().replace(/\s+/g, '_'),
          starting_at: matchTime,
          status: isCompleted ? 'completed' : 'live',
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
          localteam_score: match.localteam_score || '',
          visitorteam_score: match.visitorteam_score || '',
          toss_winner_team_id: match.toss_winner || '',
          toss_decision: match.toss_decision || '',
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
    console.error('Error fetching live cricket matches:', error);
    
    // Return a helpful error message
    res.status(500).json({
      error: 'Failed to fetch live IPL matches',
      message: error.message,
      suggestion: 'Please sign up for a Rapid API key and add it to your environment variables as NEXT_PUBLIC_RAPID_API_KEY'
    });
  }
} 