"use client";

// src/firebase/config.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator, browserLocalPersistence, setPersistence, browserSessionPersistence, inMemoryPersistence, AuthError, onAuthStateChanged, getIdToken } from "firebase/auth";
import { 
  getFirestore, 
  enableMultiTabIndexedDbPersistence, 
  connectFirestoreEmulator, 
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
  FirestoreSettings
} from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Global error handling for Firebase network issues
if (isBrowser) {
  window.addEventListener('unhandledrejection', (event) => {
    const errorCode = event.reason?.code;
    if (errorCode === 'auth/network-request-failed' || errorCode === 'auth/invalid-credential') {
      console.warn(`Firebase error caught globally: ${errorCode}`, event.reason);
      // Store the error for potential recovery later
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('lastAuthError', errorCode);
      }
    }
  });
}

// Function to check internet connection
export const checkOnlineStatus = (): boolean => {
  return isBrowser ? navigator.onLine : true;
};

// Create a custom offline error for easier identification
export class OfflineError extends Error {
  constructor(message = "Operation failed because you are offline") {
    super(message);
    this.name = "OfflineError";
  }
}

// Custom Firebase Auth Error
interface FirebaseAuthError extends Error {
  code?: string;
}

// Default mock API keys for development - replace with real values in production
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyKeyDevelopmentOnly",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dummy-project.appspot.com", 
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ABCDEFGHIJ",
};

// Initialize Firebase (with error handling)
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  // Create a placeholder app object for development
  app = {
    name: "[DEFAULT]",
    options: firebaseConfig,
    automaticDataCollectionEnabled: false
  };
}

// Only initialize analytics in the browser (with error handling)
let analytics = null;
if (isBrowser) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn("Could not initialize Firebase Analytics:", error);
  }
}

// Initialize auth (with error handling)
let auth;
try {
  auth = getAuth(app);
  
  // Configure persistence (especially for development/network issues)
  if (isBrowser) {
    // Use long-lived persistence for better user experience
    setPersistence(auth, browserLocalPersistence)
      .then(() => console.log('Auth persistence set successfully'))
      .catch(error => console.warn('Failed to set auth persistence:', error));
      
    // Set up a periodic token refresh to prevent invalid-credential errors
    let tokenRefreshInterval: any = null;
    
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // Clear any existing interval
        if (tokenRefreshInterval) {
          clearInterval(tokenRefreshInterval);
        }
        
        // Refresh token every 15 minutes (Firebase tokens expire at 60 minutes)
        // More frequent refreshes help prevent permission errors
        tokenRefreshInterval = setInterval(() => {
          getIdToken(user, true)
            .then(() => console.log("Auth token refreshed"))
            .catch(err => {
              console.warn("Failed to refresh token:", err);
              // If we get an invalid credential error, clear the interval
              if (err.code === 'auth/invalid-credential') {
                clearInterval(tokenRefreshInterval);
              }
            });
        }, 15 * 60 * 1000); // 15 minutes
      } else {
        // Clear interval when user is signed out
        if (tokenRefreshInterval) {
          clearInterval(tokenRefreshInterval);
          tokenRefreshInterval = null;
        }
      }
    });
  }
  
  // Add timeout configuration for Firebase auth requests
  auth.settings = { 
    ...auth.settings,
    appVerificationDisabledForTesting: process.env.NODE_ENV === 'development',
    // Increase timeouts for slow network connections
    networkTimeout: {
      authConnect: 30000,    // 30 seconds for auth connection
      fetchTimeout: 60000,   // 60 seconds for fetch
      signupTimeout: 60000,  // 60 seconds for signup
      loginTimeout: 60000,   // 60 seconds for login
      apiRequestTimeout: 60000, // 60 seconds for API requests
    }
  };
  
  console.log("Firebase Auth initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase Auth:", error);
  // Create a mock auth object
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => callback(null),
    signInWithEmailAndPassword: () => Promise.reject(new Error("Mock auth - not implemented")),
    createUserWithEmailAndPassword: () => Promise.reject(new Error("Mock auth - not implemented")),
    signOut: () => Promise.resolve()
  };
}

// Initialize Firebase Functions
let functions;
try {
  functions = getFunctions(app, 'us-central1');
  console.log('Firebase Functions initialized successfully');
} catch (error) {
  console.error("Error initializing Firebase Functions:", error);
  functions = {
    httpsCallable: () => Promise.reject(new Error("Mock functions - not implemented"))
  };
}

// Initialize Firestore with the appropriate settings (with error handling)
let db: any;

// Mock Firestore implementation for offline development
const createMockFirestore = () => {
  console.warn("Using mock Firestore implementation");
  
  return {
    collection: () => ({
      doc: () => ({
        get: () => Promise.resolve({ exists: () => false, data: () => null }),
        set: () => Promise.resolve(),
        update: () => Promise.resolve()
      }),
      add: () => Promise.resolve({ id: "mock-id-" + Date.now() }),
      where: () => ({
        get: () => Promise.resolve({ empty: true, docs: [] })
      })
    }),
    doc: () => ({
      get: () => Promise.resolve({ exists: () => false, data: () => null }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve()
    })
  };
};

if (isBrowser) {
  // Browser-only initialization with persistence
  try {
    // Modern persistence approach with unlimited cache size
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: CACHE_SIZE_UNLIMITED
      })
    });
    console.log('Initialized Firestore with persistent local cache');
  } catch (error) {
    console.warn('Modern persistence initialization failed, using standard Firestore init', error);
    
    try {
      // Fallback to standard initialization
      db = getFirestore(app);
      
      // Then try to enable persistence manually
      enableIndexedDbPersistence(db)
        .then(() => {
          console.log('Enabled IndexedDB persistence manually');
        })
        .catch((err) => {
          if (err.code === 'failed-precondition') {
            console.warn('Multiple tabs open, persistence can only be enabled in one tab');
          } else if (err.code === 'unimplemented') {
            console.warn('Current browser does not support persistence');
          } else {
            console.error('Failed to enable persistence:', err);
          }
        });
    } catch (fbError) {
      console.error("Could not initialize Firestore, using mock implementation:", fbError);
      db = createMockFirestore();
    }
  }
} else {
  // Server-side initialization (no persistence)
  try {
    db = getFirestore(app);
  } catch (error) {
    console.error("Error initializing Firestore on server:", error);
    db = createMockFirestore();
  }
}

// Configure emulators only in development mode - modified for better stability
if (isBrowser && process.env.NODE_ENV === 'development') {
  try {
    // Always use emulators in development mode
    const useEmulators = false; // Disable emulators to fix network issues
    
    if (useEmulators) {
      console.log('Enabling Firebase Emulators for development');
      
      // Connect to auth emulator with improved error handling
      try {
        console.log('Connecting to Auth emulator...');
        // Use explicit IP and disable warnings
        connectAuthEmulator(auth, 'http://127.0.0.1:9099', { 
          disableWarnings: true,
        });
        console.log('Connected to Auth emulator successfully');
      } catch (authError) {
        console.error('Failed to connect to Auth emulator:', authError);
        // Continue without emulator
      }
      
      // Connect to Firestore emulator
      try {
        console.log('Connecting to Firestore emulator...');
        connectFirestoreEmulator(db, '127.0.0.1', 8080);
        console.log('Connected to Firestore emulator successfully');
      } catch (firestoreError) {
        console.error('Failed to connect to Firestore emulator:', firestoreError);
        // Continue without emulator
      }
      
      // Connect to Functions emulator
      try {
        console.log('Connecting to Functions emulator...');
        connectFunctionsEmulator(functions, '127.0.0.1', 5001);
        console.log('Connected to Functions emulator successfully');
      } catch (functionsError) {
        console.error('Failed to connect to Functions emulator:', functionsError);
        // Continue without emulator
      }
    }
  } catch (error) {
    console.warn("Could not set up Firebase emulators:", error);
  }
}

// Listen for online/offline events
if (isBrowser) {
  window.addEventListener('online', () => {
    console.log('App is online.');
    window.dispatchEvent(new CustomEvent('app:online'));
  });
  
  window.addEventListener('offline', () => {
    console.warn('App is offline. Some features may be unavailable.');
    window.dispatchEvent(new CustomEvent('app:offline'));
  });
}

/**
 * Helper function to force refresh the user's authentication token
 * This can fix "Missing or insufficient permissions" errors that occur right after login
 * when the token doesn't have the latest custom claims or user data
 */
export async function refreshAuthToken(): Promise<boolean> {
  if (!auth.currentUser) {
    console.warn('Cannot refresh token - no user is signed in');
    return false;
  }
  
  try {
    // Force token refresh and wait for it to complete
    await getIdToken(auth.currentUser, true);
    console.log('Auth token refreshed successfully');
    return true;
  } catch (error) {
    console.error('Failed to refresh auth token:', error);
    return false;
  }
}

/**
 * Helper function to handle Firestore queries with offline fallback
 * @deprecated Use safeGetDoc and safeGetDocs from src/services/firestoreHelpers.ts instead
 */
export async function withOfflineFallback<T>(dbOperation: () => Promise<T>, fallbackValue: T): Promise<T> {
  try {
    return await dbOperation();
  } catch (error: any) {
    console.warn('Operation failed, falling back to cached data:', error);
    
    // Check if error is due to being offline
    if (
      !checkOnlineStatus() || 
      error.code === 'unavailable' || 
      error.code === 'failed-precondition' ||
      error.message?.includes('offline') ||
      error.message?.includes('permission')
    ) {
      // Return the fallback value for offline or permission error scenarios
      return fallbackValue;
    }
    
    // For other errors, rethrow
    throw error;
  }
}

export { app, analytics, auth, db, functions };
