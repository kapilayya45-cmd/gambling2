import type { NextApiRequest, NextApiResponse } from 'next';
import { getBetfairMatchData, formatBettingOdds } from '../../services/betfairApi';

// Type definition for API response
type ApiResponse = {
  status: boolean;
  message?: string;
  data?: any;
  timestamp?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    console.log('API route: /api/live-match-odds called at', new Date().toISOString());
    
    // Create timestamp for debugging
    const timestamp = new Date().toISOString();
    
    // Get mock data from betfair API service
    const betfairData = getBetfairMatchData();
    
    // Add small random variations to simulate live data
    const rcbPrice = betfairData.market.runners[0].price + (Math.random() * 0.02 - 0.01);
    const pbksPrice = betfairData.market.runners[1].price + (Math.random() * 0.02 - 0.01);
    
    // Update the runner prices
    betfairData.market.runners[0].price = parseFloat(rcbPrice.toFixed(2));
    betfairData.market.runners[1].price = parseFloat(pbksPrice.toFixed(2));
    
    // Calculate the INR betting odds
    const bettingOdds = formatBettingOdds(betfairData);
    
    const matchOddsData = {
      id: betfairData.eventId,
      betradarId: betfairData.betradarId,
      title: betfairData.eventName.replace(' v ', ' vs '),
      date: '2025-06-03',
      time: '14:00:00',
      openDate: betfairData.openDate,
      teams: ['Royal Challengers Bengaluru', 'Punjab Kings'],
      venue: betfairData.venue,
      eventStatus: betfairData.eventStatus,
      bookmaker: betfairData.bookmaker,
      bookmakerName: betfairData.bookmakerName,
      marketId: betfairData.market.marketId,
      marketType: betfairData.market.marketType,
      marketName: betfairData.market.marketName,
      
      // Betting odds in INR
      betting_odds: bettingOdds,
      
      // Runners with price values that will be used by the component
      runners: betfairData.market.runners.map(runner => ({
        runnerId: runner.runnerId,
        runnerName: runner.runnerName,
        price: runner.price,
        available: `${(runner.size / 1000).toFixed(1)}K`,
        lastPriceTraded: runner.lastPriceTraded,
        selectionId: runner.selectionId,
        status: runner.status
      }))
    };

    console.log('Returning live match odds data with prices:', {
      'Royal Challengers Bengaluru': betfairData.market.runners[0].price,
      'Punjab Kings': betfairData.market.runners[1].price
    });

    return res.status(200).json({
      status: true,
      message: 'Live match odds retrieved successfully',
      data: matchOddsData,
      timestamp
    });
  } catch (error) {
    console.error('Error in live-match-odds API:', error);
    return res.status(500).json({
      status: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      timestamp: new Date().toISOString()
    });
  }
} 