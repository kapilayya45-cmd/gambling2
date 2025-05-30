import { db } from '@/firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  increment, 
  Timestamp,
  limit,
  orderBy
} from 'firebase/firestore';

/**
 * Processes pending admin topups and applies them to the target admin accounts.
 * This function should be called periodically to check for and process pending topups.
 * 
 * @returns {Promise<number>} The number of topups processed
 */
export async function processAdminTopups(): Promise<number> {
  try {
    // Get pending topups
    const topupsQuery = query(
      collection(db, 'adminTopups'),
      where('status', '==', 'pending'),
      orderBy('timestamp'),
      limit(10) // Process in batches to avoid timeouts
    );
    
    const snapshot = await getDocs(topupsQuery);
    
    if (snapshot.empty) {
      console.log('No pending admin topups found');
      return 0;
    }
    
    let processedCount = 0;
    
    // Process each topup
    for (const topupDoc of snapshot.docs) {
      const topupData = topupDoc.data();
      const adminRef = doc(db, 'users', topupData.adminUid);
      
      try {
        // Update the admin's coin balance
        await updateDoc(adminRef, {
          coinBalance: increment(topupData.amount)
        });
        
        // Mark the topup as processed
        await updateDoc(topupDoc.ref, {
          status: 'completed',
          processedAt: Timestamp.now()
        });
        
        processedCount++;
      } catch (error) {
        console.error(`Error processing topup ${topupDoc.id}:`, error);
        
        // Mark as failed
        await updateDoc(topupDoc.ref, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          processedAt: Timestamp.now()
        });
      }
    }
    
    console.log(`Processed ${processedCount} admin topups`);
    return processedCount;
  } catch (error) {
    console.error('Error processing admin topups:', error);
    return 0;
  }
}

/**
 * Check for pending admin topups for a specific admin
 * @param adminUid The admin's user ID
 * @returns The total amount of pending topups
 */
export async function checkPendingTopups(adminUid: string): Promise<number> {
  try {
    const pendingQuery = query(
      collection(db, 'adminTopups'),
      where('adminUid', '==', adminUid),
      where('status', '==', 'pending')
    );
    
    const snapshot = await getDocs(pendingQuery);
    
    if (snapshot.empty) {
      return 0;
    }
    
    // Sum up all pending amounts
    return snapshot.docs.reduce((total, doc) => {
      return total + (doc.data().amount || 0);
    }, 0);
  } catch (error) {
    console.error('Error checking pending topups:', error);
    return 0;
  }
} 