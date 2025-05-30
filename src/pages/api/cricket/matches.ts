import type { NextApiRequest, NextApiResponse } from 'next';
import { getIPLMatches } from '@/services/oddsApiService';

// This endpoint serves as a proxy for fetching cricket matches
// to avoid CORS issues in the browser
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const matches = await getIPLMatches();
    
    // If no matches were found, still return a 200 with empty array
    if (!matches || matches.length === 0) {
      return res.status(200).json({ 
        status: true,
        message: 'No IPL matches found',
        data: []
      });
    }
    
    return res.status(200).json({ 
      status: true,
      message: 'IPL matches retrieved successfully',
      data: matches
    });
  } catch (error) {
    console.error('API Error in /api/cricket/matches:', error);
    return res.status(500).json({ 
      status: false,
      message: 'Failed to fetch IPL matches',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 