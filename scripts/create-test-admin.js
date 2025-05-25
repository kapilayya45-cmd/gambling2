/**
 * DEVELOPMENT ONLY - Create a test admin user document in Firestore
 * 
 * This script manually adds a document to the users collection with admin role
 * to enable admin login testing without Firebase Auth signup.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Firebase configuration - same as in your app
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
const db = getFirestore(app);

// Actual UID provided by the user
const ADMIN_USER_UID = 'zflat2ebXeXwZvwon0ERoYz1xgh2';
const ADMIN_USER_EMAIL = 'admin@example.com';

async function createTestAdmin() {
  try {
    // Create or update user document with admin role
    await setDoc(doc(db, 'users', ADMIN_USER_UID), {
      email: ADMIN_USER_EMAIL,
      role: 'admin',
      isAdmin: true,
      displayName: 'Test Admin',
      coinBalance: 1000,
      realBalance: 1000,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }, { merge: true });
    
    console.log('✅ Test admin user created/updated successfully!');
    console.log('User ID:', ADMIN_USER_UID);
    console.log('Email:', ADMIN_USER_EMAIL);
    console.log('Role: admin');
    
    // Also add to admins collection for double verification
    await setDoc(doc(db, 'admins', ADMIN_USER_UID), {
      email: ADMIN_USER_EMAIL,
      role: 'admin',
      createdAt: new Date().toISOString()
    });
    
    console.log('✅ Admin document also added to admins collection.');
    console.log('You can now login with the account linked to this UID.');
    
  } catch (error) {
    console.error('❌ Error creating test admin:', error);
  }
}

// Run the function
createTestAdmin().then(() => process.exit(0)); 