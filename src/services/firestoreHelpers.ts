import { 
  DocumentReference, 
  DocumentSnapshot, 
  getDoc, 
  getDocFromCache,
  getDocFromServer,
  QuerySnapshot,
  query,
  Query,
  getDocs,
  getDocsFromCache,
  getDocsFromServer
} from 'firebase/firestore';
import { checkOnlineStatus } from '@/firebase/config';

/**
 * Safely gets a document from Firestore with offline fallback
 * 
 * @param ref Document reference
 * @returns DocumentSnapshot with the requested data, from cache if offline
 */
export async function safeGetDoc<T>(ref: DocumentReference<T>): Promise<DocumentSnapshot<T>> {
  try {
    // First try the normal approach
    return await getDoc(ref);
  } catch (err: any) {
    console.warn('Error fetching document, trying cache:', err);
    
    // If we're offline or there's a failed-precondition error, try to get from cache
    if (
      !checkOnlineStatus() || 
      err.code === 'failed-precondition' || 
      err.code === 'unavailable' || 
      (err.message && err.message.includes('offline'))
    ) {
      try {
        // Try to get document from cache
        return await getDocFromCache(ref);
      } catch (cacheErr: any) {
        console.error('Failed to get from cache:', cacheErr);
        // If we can't get from cache and we're offline, throw a friendlier error
        if (!checkOnlineStatus()) {
          throw new Error('You are offline and the requested data is not available in the cache.');
        }
        // Otherwise rethrow the original error
        throw err;
      }
    }
    
    // If it's not an offline/cache issue, rethrow
    throw err;
  }
}

/**
 * Safely gets documents from a query with offline fallback
 * 
 * @param query Query reference
 * @returns QuerySnapshot with the requested data, from cache if offline
 */
export async function safeGetDocs<T>(queryRef: Query<T>): Promise<QuerySnapshot<T>> {
  try {
    // First try the normal approach
    return await getDocs(queryRef);
  } catch (err: any) {
    console.warn('Error fetching documents, trying cache:', err);
    
    // If we're offline or there's a failed-precondition error, try to get from cache
    if (
      !checkOnlineStatus() || 
      err.code === 'failed-precondition' || 
      err.code === 'unavailable' || 
      (err.message && err.message.includes('offline'))
    ) {
      try {
        // Try to get documents from cache
        return await getDocsFromCache(queryRef);
      } catch (cacheErr: any) {
        console.error('Failed to get from cache:', cacheErr);
        // If we can't get from cache and we're offline, throw a friendlier error
        if (!checkOnlineStatus()) {
          throw new Error('You are offline and the requested data is not available in the cache.');
        }
        // Otherwise rethrow the original error
        throw err;
      }
    }
    
    // If it's not an offline/cache issue, rethrow
    throw err;
  }
}

/**
 * Safely performs a Firestore operation with an offline fallback
 * 
 * @param operation The Firestore operation to attempt
 * @param fallbackFn Optional fallback function to call if offline
 * @returns Result of the operation or fallback
 */
export async function safeFirestoreOperation<T>(
  operation: () => Promise<T>, 
  fallbackFn?: () => Promise<T> | T
): Promise<T> {
  try {
    return await operation();
  } catch (err: any) {
    console.warn('Firestore operation failed, checking if offline:', err);
    
    // If we're offline or there's a specific error type
    if (
      !checkOnlineStatus() || 
      err.code === 'failed-precondition' || 
      err.code === 'unavailable' || 
      (err.message && err.message.includes('offline'))
    ) {
      // If a fallback was provided, use it
      if (fallbackFn) {
        console.log('Using fallback function for offline operation');
        return await fallbackFn();
      }
      
      // Otherwise throw a friendly error
      throw new Error('This operation is not available while offline.');
    }
    
    // For other errors, rethrow
    throw err;
  }
} 