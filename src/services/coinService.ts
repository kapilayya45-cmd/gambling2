// src/services/coinService.ts
import {
    getFirestore,
    runTransaction,
    doc,
    collection,
    query,
    where,
    getDocs,
    increment
  } from "firebase/firestore";
import { getFunctions, httpsCallable, HttpsCallableResult } from "firebase/functions";
import { db, functions, auth } from "../firebase/config";
import { getIdToken } from "firebase/auth";
  
// Error types to help with better error handling
enum DeploymentErrorType {
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission',
  NOT_FOUND = 'not_found',
  INSUFFICIENT_BALANCE = 'insufficient_balance',
  CONNECTION = 'connection',
  UNKNOWN = 'unknown'
}

/**
 * Deploy coins from one user to another by email.
 * @param fromUid     The UID of the account sending the coins.
 * @param toEmail     The recipient user's email address.
 * @param amount      Number of coins to transfer (must be ≥ 1).
 * @throws {Error}    If sender has insufficient balance.
 * @throws {Error}    If sender or recipient is not found.
 * @throws {Error}    If role-based rules are violated.
 */
export async function deployCoins(
  fromUid: string,
  toEmail: string,
  amount: number
): Promise<{ newBalance: number | string }> {
  if (amount <= 0) throw new Error("Must deploy at least 1 coin");

  // Check if user is signed in and the uid matches
  if (!auth.currentUser) {
    console.log("User not signed in, will try fallback deployment");
    // Try fallback deployment instead of throwing an error immediately
    try {
      const result = await fallbackDirectDeployment(fromUid, toEmail, amount);
      console.log('Direct fallback deployment succeeded:', result);
      return result;
    } catch (fallbackError: any) {
      console.error("Direct fallback deployment failed:", fallbackError);
      throw new Error(`Failed to deploy coins: ${fallbackError.message}`);
    }
  }
  
  if (auth.currentUser.uid !== fromUid) {
    throw new Error("You can only deploy coins from your own account");
  }

  console.log(`Deploying ${amount} coins from ${fromUid} to ${toEmail}`);
  
  // Try the cloud function first, then fall back to direct deployment if needed
  return await tryCloudFunctionWithFallback(fromUid, toEmail, amount);
}

/**
 * Tries to use the Cloud Function first, with fallback to direct deployment if needed.
 * Adds proper error handling, retry logic, and token refresh.
 */
async function tryCloudFunctionWithFallback(
  fromUid: string, 
  toEmail: string, 
  amount: number
): Promise<{ newBalance: number | string }> {
  let retryCount = 0;
  const maxRetries = 2;
  
  while (retryCount <= maxRetries) {
    try {
      // Force token refresh before calling the Cloud Function if we're retrying
      if (retryCount > 0 && auth.currentUser) {
        console.log(`Retry attempt ${retryCount}: refreshing authentication token...`);
        try {
          await getIdToken(auth.currentUser, true);
          console.log("Token refreshed successfully");
        } catch (refreshError) {
          console.error("Failed to refresh token, continuing anyway:", refreshError);
        }
      }
      
      // Use the Firebase Cloud Function
      console.log("Using Firebase Cloud Function for coin deployment");
      const deployCoinsFunction = httpsCallable(functions, 'deployCoins');
      
      console.log("Function call data:", { fromUid, toEmail, amount });
      
      const result = await deployCoinsFunction({
        fromUid,
        toEmail,
        amount
      });
      
      console.log("Function result:", result.data);
      return result.data as { newBalance: number | string };
    } catch (error: any) {
      // Enhanced error logging
      console.error("Error in deployment attempt:", error);
      
      // Analyze the error to determine its type
      const errorType = categorizeError(error);
      
      // Check if we should retry based on error type
      if (errorType === DeploymentErrorType.CONNECTION && retryCount < maxRetries) {
        console.log(`Connection error detected, retrying (${retryCount + 1}/${maxRetries})...`);
        retryCount++;
        // Add exponential backoff delay between retries
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        continue;
      }
      
      // Check if we should use fallback based on error type
      if (shouldUseFallback(errorType)) {
        console.log(`Error type '${errorType}' detected, falling back to direct Firestore operations`);
        try {
          const result = await fallbackDirectDeployment(fromUid, toEmail, amount);
          console.log('Fallback deployment succeeded:', result);
          return result;
        } catch (fallbackError: any) {
          console.error("Fallback deployment also failed:", fallbackError);
          // Create a more descriptive error with both original and fallback errors
          const errorMessage = `Function error: ${getErrorMessage(error)}, Fallback error: ${fallbackError.message}`;
          throw new Error(`Failed to deploy coins: ${errorMessage}`);
        }
      }
      
      // For other errors, format and throw a standardized error
      throw formatError(error, errorType);
    }
  }
  
  // We've exhausted retries and fallbacks, throw a final error
  throw new Error("Failed to deploy coins after multiple attempts");
}

/**
 * Categorizes an error into a specific type for better handling
 */
function categorizeError(error: any): DeploymentErrorType {
  // Check Firebase Functions HttpsCallableError
  if (error.code) {
    switch (error.code) {
      case 'functions/unavailable':
      case 'functions/internal':
      case 'functions/deadline-exceeded':
        return DeploymentErrorType.CONNECTION;
      case 'functions/unauthenticated':
      case 'functions/invalid-credential':
        return DeploymentErrorType.AUTHENTICATION;
      case 'functions/permission-denied':
        return DeploymentErrorType.PERMISSION;
      case 'functions/not-found':
        return DeploymentErrorType.NOT_FOUND;
      case 'functions/failed-precondition':
        // Check if it's about insufficient balance
        if (error.message?.toLowerCase().includes('insufficient')) {
          return DeploymentErrorType.INSUFFICIENT_BALANCE;
        }
        return DeploymentErrorType.UNKNOWN;
    }
  }
  
  // Check error message content
  const message = error.message?.toLowerCase() || '';
  if (message.includes('signed in') || message.includes('authentication') || message.includes('auth')) {
    return DeploymentErrorType.AUTHENTICATION;
  }
  if (message.includes('permission') || message.includes('denied')) {
    return DeploymentErrorType.PERMISSION;
  }
  if (message.includes('not found') || message.includes('no user')) {
    return DeploymentErrorType.NOT_FOUND;
  }
  if (message.includes('insufficient') || message.includes('balance')) {
    return DeploymentErrorType.INSUFFICIENT_BALANCE;
  }
  if (message.includes('network') || message.includes('offline') || message.includes('unavailable')) {
    return DeploymentErrorType.CONNECTION;
  }
  
  return DeploymentErrorType.UNKNOWN;
}

/**
 * Determines if we should use fallback based on error type
 */
function shouldUseFallback(errorType: DeploymentErrorType): boolean {
  return [
    DeploymentErrorType.AUTHENTICATION,
    DeploymentErrorType.CONNECTION
  ].includes(errorType);
}

/**
 * Gets a clean error message from the error object
 */
function getErrorMessage(error: any): string {
  if (error.message) {
    return error.message;
  }
  return 'Unknown error';
}

/**
 * Formats an error with consistent structure
 */
function formatError(error: any, type: DeploymentErrorType): Error {
  let message = getErrorMessage(error);
  
  // Format based on error type
  switch (type) {
    case DeploymentErrorType.AUTHENTICATION:
      return new Error(`Authentication error: ${message}`);
    case DeploymentErrorType.PERMISSION:
      return new Error(`Permission denied: ${message}`);
    case DeploymentErrorType.NOT_FOUND:
      return new Error(`Not found: ${message}`);
    case DeploymentErrorType.INSUFFICIENT_BALANCE:
      return new Error(`Insufficient balance: ${message}`);
    case DeploymentErrorType.CONNECTION:
      return new Error(`Connection error: ${message}`);
    default:
      return new Error(`Error deploying coins: ${message}`);
  }
}

/**
 * Fallback direct deployment for when cloud function fails
 */
async function fallbackDirectDeployment(
  fromUid: string,
  toEmail: string,
  amount: number
): Promise<{ newBalance: number | string }> {
  try {
    return await runTransaction(db, async tx => {
      // 1) Load sender
      const fromRef = doc(db, "users", fromUid);
      const fromSnap = await tx.get(fromRef);
      if (!fromSnap.exists()) throw new Error("Your profile not found");
      const fromData = fromSnap.data();
      
      // Check if sender is superadmin (unlimited coins)
      const isSuperadmin = fromData.role === 'superadmin';
      
      if (!isSuperadmin && fromData.coinBalance < amount) {
        throw new Error(`Insufficient coins (${fromData.coinBalance})`);
      }

      // 2) Find recipient
      const qSnap = await getDocs(
        query(collection(db, "users"), where("email", "==", toEmail))
      );
      if (qSnap.empty) throw new Error("No user with that email");
      const toDoc = qSnap.docs[0];
      const toRef = toDoc.ref;
      const toData = toDoc.data();

      // 3) Enforce role hierarchy
      if (fromData.role === "superadmin") {
        if (toData.role !== "admin") {
          throw new Error("Superadmin may only top up admins");
        }
      } else if (fromData.role === "admin") {
        if (toData.role !== "user") {
          throw new Error("Admin may only top up regular users");
        }
      } else {
        throw new Error("You are not permitted to deploy coins");
      }

      // 4) Create transaction record
      const transactionRef = doc(collection(db, "coinTransactions"));
      tx.set(transactionRef, {
        fromUid,
        fromEmail: fromData.email || 'unknown',
        fromRole: fromData.role,
        toUid: toDoc.id,
        toEmail: toData.email,
        toRole: toData.role,
        amount: amount,
        timestamp: new Date(),
        method: 'fallback' // Track that this was a fallback deployment
      });
      
      // 5) Atomically move coins (superadmins only update recipient)
      if (!isSuperadmin) {
        tx.update(fromRef, { coinBalance: increment(-amount) });
      }
      
      tx.update(toRef, { 
        coinBalance: increment(amount),
        lastTopupBy: fromData.email || 'unknown',
        lastTopupAmount: amount,
        lastTopupTime: new Date()
      });
      
      return { 
        newBalance: isSuperadmin ? 'unlimited' : (fromData.coinBalance - amount) 
      };
    });
  } catch (error: any) {
    console.error("Fallback deployment failed:", error);
    throw error;
  }
}

// Add an alias for compatibility with any existing deployCoinsToEmail usage
export const deployCoinsToEmail = deployCoins;
  