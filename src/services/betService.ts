import { collection, addDoc, Timestamp, DocumentReference } from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface BetDetails {
  matchId: number;
  match: string;
  selection: string;
  market: string;
  odds: number;
  stake: number;
  side: 'back' | 'lay';
}

/**
 * Records a bet in Firestore
 * @param userId User ID of the bettor
 * @param betDetails Details of the bet being placed
 * @returns Reference to the created document
 */
export async function recordBet(
  userId: string,
  betDetails: BetDetails
): Promise<DocumentReference> {
  // Calculate potential win
  const potentialWin = betDetails.stake * betDetails.odds;
  
  // Create a transaction record that will be picked up by LiveBetsSection
  return await addDoc(collection(db, 'transactions'), {
    userId,
    type: 'bet',
    // Store main bet data at the root level for filtering
    matchId: betDetails.matchId,
    match: betDetails.match,
    selection: betDetails.selection,
    odds: betDetails.odds,
    stake: betDetails.stake,
    potentialWin,
    // Important: This status makes it show in the live bets section
    status: 'live',
    // Store creation time
    createdAt: Timestamp.now(),
    // Store payment details
    paymentMethod: 'coins',
    // Store additional bet details as a nested object
    betDetails: {
      market: betDetails.market,
      side: betDetails.side,
      timestamp: new Date().toISOString()
    }
  });
} 