const functions = require('firebase-functions');
const admin = require('firebase-admin');
 // compiled to functions/lib/index.js, so go up two levels:
const serviceAccount = require('../../firebase-service-account.json');

// Updated initialization with service account credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/**
 * Callable HTTPS function to transfer coins:
 * - superadmin → only tops up admins (with unlimited coins)
 * - admin      → only tops up regular users (limited by balance)
 * Uses Admin SDK (bypasses Firestore rules).
 */
exports.deployCoins = functions.https.onCall(async (data, context) => {
  // Type validation would normally happen here
  const { fromUid, toEmail, amount } = data;

  // 1) Auth check
  if (!context || !context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be signed in to deploy coins.'
    );
  }

  const callerUid = context.auth.uid;
  
  // Ensure the callerUid matches fromUid
  if (fromUid !== callerUid) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'You can only deploy coins from your own account.'
    );
  }

  // 2) Validate amount
  if (typeof amount !== 'number' || amount <= 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Amount must be a positive number.'
    );
  }

  // 3) Load caller's document
  const callerRef = admin.firestore().doc(`users/${callerUid}`);
  const callerSnap = await callerRef.get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError(
      'not-found',
      'Caller profile not found.'
    );
  }
  const callerData = callerSnap.data();
  const callerRole = callerData.role;
  const isSuperadmin = callerRole === 'superadmin';
  
  // 4) Role check
  if (callerRole !== 'superadmin' && callerRole !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Insufficient privileges to deploy coins.'
    );
  }

  // 5) Balance check (skip for superadmins)
  if (!isSuperadmin) {
    const callerBalance = callerData.coinBalance || 0;
    if (callerBalance < amount) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        `Insufficient coins (have ${callerBalance}, need ${amount}).`
      );
    }
  }

  // 6) Find recipient by email
  const userQuery = await admin
    .firestore()
    .collection('users')
    .where('email', '==', toEmail)
    .limit(1)
    .get();

  if (userQuery.empty) {
    throw new functions.https.HttpsError(
      'not-found',
      `No user found with email "${toEmail}".`
    );
  }

  const targetDoc = userQuery.docs[0];
  const targetData = targetDoc.data();
  const targetRole = targetData.role;

  // 7) Enforce role-based transfer rules
  if (callerRole === 'superadmin' && targetRole !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Superadmin may only top up admins.'
    );
  }
  if (callerRole === 'admin' && targetRole !== 'user') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Admin may only top up regular users.'
    );
  }

  // 8) Perform the atomic transaction
  let newBalance;
  
  await admin.firestore().runTransaction(async tx => {
    // Create a record of this transaction
    const transactionRef = admin.firestore().collection('coinTransactions').doc();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    
    tx.set(transactionRef, {
      fromUid: callerUid,
      fromEmail: callerData.email,
      fromRole: callerRole,
      toUid: targetDoc.id,
      toEmail: targetData.email,
      toRole: targetRole,
      amount: amount,
      timestamp: timestamp
    });
    
    // Update balances (superadmins only update recipient)
    if (!isSuperadmin) {
      tx.update(callerRef, { coinBalance: admin.firestore.FieldValue.increment(-amount) });
    }
    
    tx.update(targetDoc.ref, { 
      coinBalance: admin.firestore.FieldValue.increment(amount),
      lastTopupBy: callerData.email || 'unknown',
      lastTopupAmount: amount,
      lastTopupTime: timestamp
    });
  });
  
  // Get the new balance for the response
  if (isSuperadmin) {
    newBalance = 'unlimited';
  } else {
    const updatedCallerSnap = await callerRef.get();
    const updatedCallerData = updatedCallerSnap.data();
    newBalance = updatedCallerData.coinBalance;
  }

  // 9) Return the caller's new balance
  return { newBalance };
});
