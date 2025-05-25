const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyKeyDevelopmentOnly",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dummy-project.appspot.com", 
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Admin user details
const ADMIN_EMAIL = 'admin@example.com';

/**
 * This script has been updated to NOT create users via the client SDK.
 * 
 * Admins should be:
 * 1. Created through the Firebase Console Authentication section
 * 2. Then manually added to the 'admins' collection in Firestore
 *
 * For development, use the hardcoded admin credentials:
 * - Email: admin@example.com
 * - Password: admin123
 */

console.log('==========================================================');
console.log('ADMIN USER CREATION NOTICE');
console.log('==========================================================');
console.log('For security reasons, admin users should NOT be created using');
console.log('client-side code. Please follow these steps instead:');
console.log('');
console.log('1. Create a user in Firebase Console Authentication section');
console.log('2. Add the user to the "admins" collection in Firestore with:');
console.log('   - Document ID: <user-uid>');
console.log('   - Fields:');
console.log('     - email: <user-email>');
console.log('     - role: "admin"');
console.log('');
console.log('For development, use:');
console.log('Email: admin@example.com');
console.log('Password: admin123');
console.log('=========================================================='); 