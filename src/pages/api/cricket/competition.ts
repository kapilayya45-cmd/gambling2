import { NextApiRequest, NextApiResponse } from 'next';
import { ODDS_API } from '../../../config/oddsApiConfig';

// This endpoint serves as a proxy for fetching IPL competition info
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
    console.log('Fetching IPL competition info...');
    
    // Since ODDS-API doesn't have a direct competition endpoint,
    // we'll create a simple mock response with IPL info
    const iplCompetitionData = {
      cid: 'ipl',
      title: 'Indian Premier League',
      abbr: 'IPL',
      type: 'league',
      category: 'international',
      season_id: new Date().getFullYear().toString(),
      season_title: `IPL ${new Date().getFullYear()}`,
      status: 'active',
      latest_season: true
    };
    
    res.status(200).json({
      data: iplCompetitionData
    });
  } catch (error) {
    console.error('Error fetching IPL competition info:', error);
    
    // Return a helpful error message
    res.status(500).json({
      error: 'Failed to fetch IPL competition info',
      message: error.message,
      suggestion: 'Please sign up for a Rapid API key and add it to your environment variables as NEXT_PUBLIC_RAPID_API_KEY'
    });
  }
} 