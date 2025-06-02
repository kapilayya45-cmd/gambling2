import type { NextApiRequest, NextApiResponse } from 'next';
import { getLiveOddsFromApi } from '@/services/liveOddsApi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('API route called: /api/live-odds');
  
  try {
    console.log('Fetching fresh data from the odds-api1 endpoint...');
    const matches = await getLiveOddsFromApi();
    
    if (matches.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'No matches found'
      });
    }
    
    const match = matches[0];
    console.log('Match details:', {
      title: match.title,
      teams: `${match.localteam_name} vs ${match.visitorteam_name}`,
      odds: match.betting_odds?.match_winner
    });
    
    return res.status(200).json({
      status: true,
      data: match
    });
  } catch (error) {
    console.error('Error fetching live odds:', error);
    return res.status(500).json({
      status: false,
      message: 'Error fetching live odds',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 