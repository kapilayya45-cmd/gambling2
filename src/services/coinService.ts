import {
  getFirestore,
  doc,
  runTransaction,
  collection,
  query,
  where,
  getDocs,
  increment
} from "firebase/firestore";

const db = getFirestore();

/**
 * Deploy coins from the currently‐signed‐in admin to a user by email.
 * @throws if adminBalance < amount or user not found
 */
export async function deployCoinsToEmail(
  adminUid: string,
  targetEmail: string,
  amount: number
) {
  await runTransaction(db, async (tx) => {
    // 1) Load admin doc
    const adminRef = doc(db, "users", adminUid);
    const adminSnap = await tx.get(adminRef);
    if (!adminSnap.exists()) throw new Error("Admin profile not found");
    const adminBalance = adminSnap.data().coinBalance || 0;

    if (amount > adminBalance) {
      throw new Error(`Cannot deploy more coins (${amount}) than you have (${adminBalance})`);
    }

    // 2) Find target user by email
    const q = query(
      collection(db, "users"),
      where("email", "==", targetEmail)
    );
    const qSnap = await getDocs(q);
    if (qSnap.empty) throw new Error(`No user found with email ${targetEmail}`);
    const userDoc = qSnap.docs[0];
    const userRef = userDoc.ref;

    // 3) Update both docs
    tx.update(adminRef, { coinBalance: increment(-amount) });
    tx.update(userRef, { coinBalance: increment(amount) });
  });
} 