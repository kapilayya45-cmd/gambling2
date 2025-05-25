// This script creates test bonus rules in Firestore
// Run with: node scripts/create-test-bonus.js

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp 
} = require('firebase/firestore');

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample bonus rules to create
const sampleBonusRules = [
  {
    name: "Welcome Bonus 100%",
    description: "Get 100% bonus on your first deposit up to 1000 coins",
    type: "first_deposit",
    value: 100,
    valueType: "percentage",
    minRequirement: 100,
    maxBonus: 1000,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: "Reload Bonus 50%",
    description: "Get 50% bonus on your deposits, available every weekend",
    type: "reload",
    value: 50,
    valueType: "percentage",
    minRequirement: 200,
    maxBonus: 500,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: "Refer a Friend",
    description: "Get 200 coins for each friend you refer who makes a deposit",
    type: "referral",
    value: 200,
    valueType: "fixed",
    minRequirement: 0,
    maxBonus: 0,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

async function createBonusRules() {
  try {
    for (const rule of sampleBonusRules) {
      const ruleRef = doc(collection(db, 'bonusRules'));
      await setDoc(ruleRef, rule);
      console.log(`Created bonus rule: ${rule.name} with ID: ${ruleRef.id}`);
    }
    console.log('All bonus rules created successfully');
  } catch (error) {
    console.error('Error creating bonus rules:', error);
  }
}

// Run the function
createBonusRules()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  }); 