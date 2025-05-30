import type { NextApiRequest, NextApiResponse } from 'next';
import { getMatchDetails } from '@/services/oddsApiService';

// Simple in-memory cache for match details
const matchCache: Record<string, {
  data: any;
  timestamp: number;
}> = {};

// Cache expiry time in milliseconds (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

// This endpoint serves as a proxy for fetching cricket match details
// to avoid CORS issues in the browser
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ 
      status: false,
      message: 'Match ID is required and must be a single value'
    });
  }

  // Check cache first
  const now = Date.now();
  const cachedMatch = matchCache[id];
  if (cachedMatch && (now - cachedMatch.timestamp) < CACHE_EXPIRY) {
    console.log(`Returning cached match data for ID: ${id}`);
    return res.status(200).json({
      status: true,
      message: 'Match details retrieved from cache',
      data: cachedMatch.data
    });
  }

  try {
    console.log(`Fetching fresh match data for ID: ${id}`);
    const match = await getMatchDetails(id);
    
    // Save to cache
    matchCache[id] = {
      data: match,
      timestamp: now
    };
    
    return res.status(200).json({ 
      status: true,
      message: 'Match details retrieved successfully',
      data: match
    });
  } catch (error) {
    console.error(`API Error in /api/cricket/match/${id}:`, error);
    return res.status(500).json({ 
      status: false,
      message: 'Failed to fetch match details',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}