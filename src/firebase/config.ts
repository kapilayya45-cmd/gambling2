"use client";

// src/firebase/config.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
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

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

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

// Add Firestore emulator connection in development
if (isBrowser && process.env.NODE_ENV !== 'production') {
  // Use emulators in development if they're running
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099');
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('Connected to Firebase emulators');
    } catch (error) {
      console.warn("Could not connect to Firebase emulators:", error);
    }
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

export { app, analytics, auth, db };
