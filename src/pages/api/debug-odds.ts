import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchRCBvsPBKSMatch } from '@/services/cricketApi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Debug API: Fetching RCB vs PBKS match data with betting odds');
    
    // Fetch the match data
    const matchData = await fetchRCBvsPBKSMatch();
    
    if (!matchData) {
      return res.status(404).json({
        status: false,
        message: 'No match data found'
      });
    }
    
    // Extract just the important parts for debugging
    const debugData = {
      id: matchData.id,
      title: matchData.title,
      teams: {
        home: matchData.localteam_name,
        away: matchData.visitorteam_name
      },
      betting_odds: matchData.betting_odds,
      has_match_winner_odds: !!matchData.betting_odds?.match_winner,
      match_winner_keys: matchData.betting_odds?.match_winner ? Object.keys(matchData.betting_odds.match_winner) : [],
      match_winner_values: matchData.betting_odds?.match_winner ? Object.values(matchData.betting_odds.match_winner) : []
    };
    
    return res.status(200).json({
      status: true,
      message: 'Debug data for RCB vs PBKS match',
      data: debugData
    });
  } catch (error) {
    console.error('Debug API Error:', error);
    return res.status(500).json({
      status: false,
      message: 'Error fetching debug data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 