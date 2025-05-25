import { NextApiRequest, NextApiResponse } from 'next';

interface Bet {
  id: string;
  userId: string;
  matchId: number;
  match: string;
  selection: string;
  odds: number;
  stake: number;
  potentialWin: number;
  status: 'live' | 'settled' | 'cashout';
  createdAt: string;
  settled?: {
    payout: number;
    settledAt: string;
  };
}

// Mock data for development
const mockBets: Bet[] = [
  {
    id: '1',
    userId: 'user123',
    matchId: 101,
    match: 'Manchester United vs Liverpool',
    selection: 'Manchester United',
    odds: 2.5,
    stake: 10,
    potentialWin: 25,
    status: 'live',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: '2',
    userId: 'user123',
    matchId: 102,
    match: 'Real Madrid vs Barcelona',
    selection: 'Draw',
    odds: 3.2,
    stake: 15,
    potentialWin: 48,
    status: 'live',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '3',
    userId: 'user123',
    matchId: 103,
    match: 'Lakers vs Celtics',
    selection: 'Celtics',
    odds: 1.8,
    stake: 20,
    potentialWin: 36,
    status: 'settled',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    settled: {
      payout: 36,
      settledAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    }
  },
  {
    id: '4',
    userId: 'user123',
    matchId: 104,
    match: 'India vs Australia',
    selection: 'India',
    odds: 2.1,
    stake: 25,
    potentialWin: 52.5,
    status: 'settled',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    settled: {
      payout: 0, // Lost bet
      settledAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    }
  },
  {
    id: '5',
    userId: 'user123',
    matchId: 105,
    match: 'Bayern Munich vs Dortmund',
    selection: 'Bayern Munich',
    odds: 1.5,
    stake: 30,
    potentialWin: 45,
    status: 'settled',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    settled: {
      payout: 45,
      settledAt: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
    }
  },
  {
    id: '6',
    userId: 'user123',
    matchId: 106,
    match: 'Nadal vs Djokovic',
    selection: 'Nadal',
    odds: 2.2,
    stake: 15,
    potentialWin: 33,
    status: 'live',
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { status, page = '1', limit = '10' } = req.query;
  
  // In a real app, we would validate the user is authenticated
  // And fetch data from a database based on userId
  
  // Filter bets by status if provided
  let filteredBets = [...mockBets];
  if (status) {
    filteredBets = mockBets.filter(bet => bet.status === status);
  }
  
  // Implement pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = pageNum * limitNum;
  
  const paginatedBets = filteredBets.slice(startIndex, endIndex);
  
  // Return results with pagination metadata
  res.status(200).json({
    bets: paginatedBets,
    pagination: {
      total: filteredBets.length,
      pages: Math.ceil(filteredBets.length / limitNum),
      currentPage: pageNum,
      hasNext: endIndex < filteredBets.length,
      hasPrev: startIndex > 0,
    }
  });
} 