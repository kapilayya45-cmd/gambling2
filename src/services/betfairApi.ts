/**
 * Service for handling Betfair Exchange API data
 */

// Interface for Betfair runner (team)
export interface BetfairRunner {
  runnerId: string;
  runnerName: string;
  price: number;
  size: number;
  lastPriceTraded: number;
  handicap: number;
  selectionId: number;
  sortPriority: number;
  status: string;
}

// Interface for Betfair market data
export interface BetfairMarket {
  marketId: string;
  marketName: string;
  marketType: string;
  totalMatched: number;
  runners: BetfairRunner[];
}

// Interface for Betfair event data
export interface BetfairEvent {
  eventId: string;
  eventName: string;
  openDate: string;
  timezone: string;
  countryCode: string;
  venue?: string;
  betradarId?: string;
}

/**
 * Get mock data for Royal Challengers Bengaluru vs Punjab Kings match
 * This simulates fetching data from the Betfair Exchange API
 */
export function getBetfairMatchData() {
  // Data for Royal Challengers Bengaluru vs Punjab Kings match
  return {
    eventId: 'id2700247260533349',
    betradarId: '60533349',
    eventName: 'Royal Challengers Bengaluru v Punjab Kings',
    openDate: '2025-06-03T14:00:00.000Z',
    timezone: 'GMT',
    countryCode: 'GB',
    venue: 'M. Chinnaswamy Stadium',
    bookmaker: 'betfair-ex',
    bookmakerName: 'BetFair Exchange',
    currencyCode: 'GBP',
    eventStatus: 'pre-game',
    market: {
      marketId: '1.244443880',
      marketName: 'Match Odds',
      marketType: 'MATCH_ODDS',
      totalMatched: 23822.775777672712,
      runners: [
        {
          runnerId: '67868736',
          runnerName: 'Royal Challengers Bengaluru',
          price: 1.92,
          size: 18000,
          lastPriceTraded: 1.92,
          handicap: 0,
          selectionId: 67868736,
          sortPriority: 1,
          status: 'ACTIVE'
        },
        {
          runnerId: '38528100',
          runnerName: 'Punjab Kings',
          price: 2.08,
          size: 21900,
          lastPriceTraded: 2.08,
          handicap: 0,
          selectionId: 38528100,
          sortPriority: 2,
          status: 'ACTIVE'
        }
      ]
    }
  };
}

/**
 * Convert Betfair decimal odds to display format (Indian Rupees)
 * @param price Decimal odds from Betfair
 * @returns Odds in Indian Rupees
 */
export function convertOddsToInr(price: number): number {
  // Convert to INR by multiplying by 83
  return parseFloat((price * 83).toFixed(2));
}

/**
 * Format betting odds data for display
 * @param data Betfair API data
 * @returns Formatted odds data for UI
 */
export function formatBettingOdds(data: any) {
  if (!data || !data.market || !data.market.runners) {
    return {
      'Royal Challengers Bengaluru': 158.53,
      'Punjab Kings': 172.64
    };
  }

  const odds = {};
  
  data.market.runners.forEach(runner => {
    // Convert odds to INR format
    const oddsInr = convertOddsToInr(runner.price);
    odds[runner.runnerName] = oddsInr;
  });
  
  return odds;
} 