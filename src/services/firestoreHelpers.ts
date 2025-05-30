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
import { checkOnlineStatus, refreshAuthToken } from '@/firebase/config';
import { auth } from '@/firebase/config';
import { getIdToken } from 'firebase/auth';

/**
 * Check if an error is a permission error
 */
function isPermissionError(error: any): boolean {
  if (!error) return false;
  
  // Check error code
  if (error.code === 'permission-denied' || 
      error.code === 'functions/permission-denied') {
    return true;
  }
  
  // Check error message
  if (error.message && (
    error.message.includes('permission') || 
    error.message.includes('insufficient permissions') ||
    error.message.includes('Missing or insufficient permissions')
  )) {
    return true;
  }
  
  return false;
}

/**
 * Try to refresh auth token when permission errors occur
 */
async function handlePermissionError(error: any): Promise<void> {
  if (isPermissionError(error) && auth.currentUser) {
    console.warn('Permission error detected, attempting token refresh...');
    try {
      await getIdToken(auth.currentUser, true);
      console.log('Token refreshed after permission error');
    } catch (refreshError) {
      console.error('Failed to refresh token after permission error:', refreshError);
    }
  }
}

/**
 * Safely gets a document from Firestore with offline fallback
 * 
 * @param ref Document reference
 * @returns DocumentSnapshot with the requested data, from cache if offline
 */
export async function safeGetDoc<T>(ref: DocumentReference<T>): Promise<DocumentSnapshot<T>> {
  try {
    // First try to get from server directly
    try {
      return await getDocFromServer(ref);
    } catch (serverError) {
      console.warn('Error fetching from server, trying standard getDoc:', serverError);
      
      // Handle permission errors with token refresh
      await handlePermissionError(serverError);
      
      // If server fetch fails, try standard getDoc (which might use cache)
      return await getDoc(ref);
    }
  } catch (err: any) {
    console.warn('Error fetching document, trying cache explicitly:', err);
    
    // Handle permission errors with token refresh
    await handlePermissionError(err);
    
    // If we're offline or there's a failed-precondition error, try to get from cache
    if (
      !checkOnlineStatus() || 
      err.code === 'failed-precondition' || 
      err.code === 'unavailable' || 
      (err.message && err.message.includes('offline')) ||
      (err.message && err.message.includes('Failed to get document from cache'))
    ) {
      try {
        // Try to get document from cache
        return await getDocFromCache(ref);
      } catch (cacheErr: any) {
        console.error('Failed to get from cache:', cacheErr);
        
        // For the specific "Failed to get document from cache" error,
        // this means the document doesn't exist in cache, so we should 
        // throw a more descriptive error
        if (cacheErr.message && cacheErr.message.includes('Failed to get document from cache')) {
          throw new Error("Document not found in cache. It may exist on the server but hasn't been cached locally yet.");
        }
        
        // If we can't get from cache and we're offline, throw a friendlier error
        if (!checkOnlineStatus()) {
          throw new Error('You are offline and the requested data is not available in the cache.');
        }
        
        // Otherwise rethrow the original error
        throw err;
      }
    }
    
    // If this is a permission error, provide a more helpful message
    if (isPermissionError(err)) {
      console.warn('Permission error detected, attempting to continue with fallback');
      // Try to refresh the token silently in the background
      handlePermissionError(err).catch(e => console.error('Failed to refresh token:', e));
      
      // Instead of throwing, we'll return an empty snapshot to allow the app to continue
      return {
        exists: () => false,
        data: () => null,
        id: ref.id,
        metadata: {
          hasPendingWrites: false,
          isEqual: () => false
        },
        ref: ref,
        get: () => null
      } as unknown as DocumentSnapshot<T>;
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
    
    // Handle permission errors with token refresh
    await handlePermissionError(err);
    
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
    
    // If this is a permission error, provide a more helpful message
    if (isPermissionError(err)) {
      console.warn('Permission error detected in query, attempting to continue with fallback');
      // Try to refresh the token silently in the background
      handlePermissionError(err).catch(e => console.error('Failed to refresh token:', e));
      
      // Return an empty result set to allow the app to continue
      return {
        docs: [],
        empty: true,
        size: 0,
        forEach: () => {},
        docChanges: () => [],
        metadata: {
          hasPendingWrites: false,
          isEqual: () => false,
          fromCache: false
        }
      } as unknown as QuerySnapshot<T>;
    }
    
    // If it's not an offline/cache issue, rethrow
    throw err;
  }
}

/**
 * Utility function to help recover from permission errors.
 * This can be called directly from components when permission errors occur.
 * 
 * @returns Promise that resolves to true if recovery was attempted
 */
export async function recoverFromPermissionError(): Promise<boolean> {
  if (!auth.currentUser) {
    console.warn('Cannot recover from permission error - no user is signed in');
    return false;
  }
  
  console.log('Attempting to recover from permission error...');
  
  try {
    // Force token refresh
    await getIdToken(auth.currentUser, true);
    console.log('Authentication token refreshed successfully');
    
    // Small delay to ensure propagation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('Failed to recover from permission error:', error);
    return false;
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