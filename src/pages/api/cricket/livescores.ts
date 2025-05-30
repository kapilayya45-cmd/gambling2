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
    
    // Extract the data
    const liveMatches = response.data.data || response.data || [];
    
    // Filter for IPL matches
    const iplMatches = liveMatches.filter((match: any) => 
      match.league_key === 'ipl' || 
      (match.league && match.league.toLowerCase().includes('indian premier league'))
    );
    
    console.log(`Found ${iplMatches.length} live IPL matches`);
    
    // Format matches into expected format for the frontend
    const formattedData = {
      data: iplMatches.map((match: any) => {
        return {
          id: match.id,
          league_id: 'ipl',
          localteam_id: match.home_team?.toLowerCase().replace(/\s+/g, '_'),
          visitorteam_id: match.away_team?.toLowerCase().replace(/\s+/g, '_'),
          starting_at: match.commence_time,
          status: match.completed ? 'completed' : 'live',
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
          localteam_score: match.scores?.home?.score || '',
          visitorteam_score: match.scores?.away?.score || '',
          toss_winner_team_id: match.toss?.winner || '',
          toss_decision: match.toss?.decision || '',
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