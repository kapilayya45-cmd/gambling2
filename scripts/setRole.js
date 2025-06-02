// scripts/setRole.js

const admin = require('firebase-admin');
// directly require the service account JSON
const serviceAccount = require('../firebase-service-account.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Get command line arguments
const [,, uid, role] = process.argv;

// Validate inputs
if (!uid || !role) {
  console.error('Usage: node scripts/setRole.js <UID> <role>');
  console.error('Example: node scripts/setRole.js abc123def456 superadmin');
  console.error('Available roles: admin, superadmin, user');
  process.exit(1);
}

if (!['admin', 'superadmin', 'user'].includes(role)) {
  console.error(`Invalid role: ${role}`);
  console.error('Available roles: admin, superadmin, user');
  process.exit(1);
}

// Set custom claims for the user
admin.auth().setCustomUserClaims(uid, { role })
  .then(() => {
    console.log(`✅ Successfully set user ${uid} role to "${role}"`);
    // Also update the user document in Firestore
    return admin.firestore().collection('users').doc(uid).update({
      role: role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  })
  .then(() => {
    console.log(`✅ Updated Firestore document for user ${uid}`);
    console.log('\nRole will take effect when the user signs in next time.');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error setting role:');
    console.error(err);
    process.exit(1);
  });
