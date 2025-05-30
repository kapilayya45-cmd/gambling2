import type { NextApiRequest, NextApiResponse } from 'next';
import { getLiveIPLMatches } from '@/services/oddsApiService';

// This endpoint serves as a proxy for fetching live cricket matches
// to avoid CORS issues in the browser
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const matches = await getLiveIPLMatches();
    
    return res.status(200).json({ 
      status: true,
      message: 'Live IPL matches retrieved successfully',
      data: matches
    });
  } catch (error) {
    console.error('API Error in /api/cricket/live:', error);
    return res.status(500).json({ 
      status: false,
      message: 'Failed to fetch live IPL matches',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 