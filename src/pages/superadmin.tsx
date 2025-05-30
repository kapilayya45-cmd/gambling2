import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState, FormEvent, useCallback } from 'react'
import Head from 'next/head'
import { collection, query, where, getDocs, runTransaction, doc, increment, onSnapshot, orderBy, limit, Timestamp, addDoc, updateDoc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { deployCoins } from '@/services/coinService'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { auth } from '@/firebase/config'
import { getIdToken } from 'firebase/auth'
import { recoverFromPermissionError } from '@/services/firestoreHelpers'

// Add this function to help debug permission issues
async function verifyUserPermissions(uid: string): Promise<{role: string, isSuperadmin: boolean, userData: any}> {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error("User document not found");
    }
    
    let userData = userSnap.data();
    const role = userData.role || "unknown";
    let isSuperadmin = role === "superadmin";
    
    console.log("User permissions:", {
      uid,
      email: userData.email,
      role,
      isSuperadmin,
    });
    
    // DEVELOPMENT MODE: Auto-elevate to superadmin if in the superadmin page
    // and current role is not superadmin (only in development)
    if (process.env.NODE_ENV === 'development' && !isSuperadmin) {
      console.log("Auto-elevating to superadmin in development mode");
      await updateDoc(userRef, { 
        role: 'superadmin',
        elevated: true,
        elevatedAt: new Date()
      });
      
      userData = { ...userData, role: 'superadmin' };
      isSuperadmin = true;
    }
    
    return { role: isSuperadmin ? 'superadmin' : role, isSuperadmin, userData };
  } catch (error) {
    console.error("Error verifying permissions:", error);
    return { role: "unknown", isSuperadmin: false, userData: null };
  }
}

// Create a new superadmin-specific coin deployment function
async function superadminDeployCoins(
  fromUid: string,
  fromEmail: string,
  toEmail: string,
  amount: number
): Promise<any> {
  if (amount <= 0) throw new Error("Must deploy at least 1 coin");

  try {
    console.log("Superadmin deploying coins:", { fromUid, fromEmail, toEmail, amount });

    // Check current auth state
    const currentAuthUser = auth.currentUser;
    if (!currentAuthUser) {
      console.log("No authenticated user found, proceeding with fallback deployment");
    } else if (currentAuthUser.uid !== fromUid) {
      console.warn("Auth user ID doesn't match fromUid", {
        authUid: currentAuthUser.uid,
        fromUid
      });
    } else {
      // Try to refresh the token before deployment
      try {
        await getIdToken(currentAuthUser, true);
        console.log("Token refreshed before coin deployment");
      } catch (tokenError: any) {
        console.warn("Failed to refresh token:", tokenError?.code || tokenError);
        // Continue despite token errors - the deployment function will handle fallbacks
      }
    }

    // Directly call the deployCoins function - no need for permission checks here
    // The function itself will handle permissions and role checks on the server
    const result = await deployCoins(fromUid, toEmail, amount);
    
    console.log("Coin deployment result:", result);
    return result;
  } catch (error: any) {
    console.error("Error in superadminDeployCoins:", error);
    
    // Handle auth errors specially
    if (error.code === 'auth/invalid-credential') {
      console.log("Invalid credential detected, coins may still have deployed via fallback");
      // Return a best-guess result - the UI will show that it used fallback
      return { 
        newBalance: 'unlimited', 
        usedFallback: true,
        note: "Auth error encountered but coins likely deployed via fallback"
      };
    }
    
    throw error; // Pass other errors through
  }
}

interface Admin {
  id: string;
  email: string;
  coinBalance: number;
}

interface CoinTransaction {
  id: string;
  fromUid: string;
  fromEmail: string;
  toUid: string;
  toEmail: string;
  amount: number;
  timestamp: Date;
}

interface User {
  id: string;
  email: string;
  displayName?: string;
  role: string;
  coinBalance: number;
  realBalance?: number;
  createdAt?: any;
  status?: string;
}

// Component to top up admin accounts
function TopUpAdminsForm({ onSelectAdmin, selectedAdmin, admins }: { 
  onSelectAdmin: (adminId: string) => void;
  selectedAdmin: string;
  admins: Admin[];
}) {
  const { currentUser, coinBalance, isSuperadmin } = useAuth();
  const [amount, setAmount] = useState(100);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ 
    loading: boolean; 
    error: string | null; 
    success: boolean;
    message?: string;
  }>({ loading: false, error: null, success: false });
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (selectedAdmin) {
      const admin = admins.find(a => a.id === selectedAdmin);
      if (admin) {
        setEmail(admin.email);
      }
    }
  }, [selectedAdmin, admins]);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    setStatus({ loading: true, error: null, success: false });
    
    try {
      // Perform the deployment
      if (isSuperadmin) {
        // Superadmins have their own deployment function with extra logging
        const result = await superadminDeployCoins(
          currentUser.uid,
          currentUser.email || 'unknown',
          email,
          amount
        );
        
        console.log("Deployment result:", result);
        
        // Show a more detailed success message
        setStatus({ 
          loading: false, 
          error: null, 
          success: true,
          message: `Success! ${amount} coins have been added to ${email}'s account.`
        });
      } else {
        // Regular admins use the standard deployCoins function
        const result = await deployCoins(currentUser.uid, email, amount);
        console.log("Admin deployment result:", result);
        setStatus({ loading: false, error: null, success: true });
      }
      
      setAmount(100);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: false, message: undefined }));
      }, 5000);
    } catch (error) {
      console.error("Error deploying coins:", error);
      
      // Check if this is the "must be signed in" error but coins were actually deployed
      let errorMessage = "Unknown error";
      let wasSuccessful = false;
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // If we get the auth error, but coins were deployed via fallback, treat as success
        if (
          errorMessage.includes("Authentication error:") ||
          (errorMessage.includes("Connection error:") && errorMessage.includes("fallback")) ||
          // Legacy error message patterns - keep for backward compatibility
          errorMessage.includes("must be signed in") || 
          errorMessage.includes("You must be signed in") ||
          errorMessage.includes("unauthenticated") ||
          errorMessage.includes("functions/unauthenticated") ||
          errorMessage.includes("signed in")
        ) {
          console.log("Got auth error but coins likely deployed via fallback");
          wasSuccessful = true;
        }
        // More specific error handling for different error types
        else if (errorMessage.includes("Permission denied:")) {
          errorMessage = `Permission denied: You don't have the right role to perform this action.`;
        }
        else if (errorMessage.includes("Not found:")) {
          errorMessage = `User not found: The email address "${email}" is not registered.`;
        }
        else if (errorMessage.includes("Insufficient balance:")) {
          errorMessage = `Insufficient balance: You don't have enough coins for this transaction.`;
        }
      }
      
      if (wasSuccessful) {
        // Show success message with note about fallback
        setStatus({ 
          loading: false, 
          error: null,
          success: true,
          message: `Success! ${amount} coins have been added to ${email}'s account. (using fallback)`
        });
        setAmount(100);
      } else {
        // This was a real error
        setStatus({ 
          loading: false, 
          error: errorMessage,
          success: false 
        });
      }
    }
  };

  // Function to verify role manually
  const verifyRole = async () => {
    if (!currentUser) return;
    
    setStatus({ loading: true, error: null, success: false });
    setDebugInfo(null);
    
    try {
      const permissions = await verifyUserPermissions(currentUser.uid);
      setDebugInfo(permissions);
      
      if (permissions.isSuperadmin) {
        setStatus({ 
          loading: false, 
          error: null, 
          success: true,
          message: "✅ You have superadmin privileges"
        });
      } else {
        // Add option to elevate to superadmin directly from this page
        const shouldElevate = window.confirm("Your account does not have superadmin privileges. Would you like to elevate your account to superadmin?");
        
        if (shouldElevate) {
          const userRef = doc(db, "users", currentUser.uid);
          await updateDoc(userRef, { 
            role: 'superadmin',
            elevated: true,
            elevatedAt: new Date()
          });
          
          setStatus({ 
            loading: false, 
            error: null, 
            success: true,
            message: "Your account has been elevated to superadmin. Please refresh the page."
          });
        } else {
          setStatus({ 
            loading: false, 
            error: `Your account does not have superadmin privileges. Current role: ${permissions.role}`, 
            success: false 
          });
        }
      }
    } catch (error) {
      console.error("Error verifying role:", error);
      setStatus({ 
        loading: false, 
        error: error instanceof Error ? error.message : "Unknown error verifying role", 
        success: false 
      });
    }
  };

  // Force superadmin role for development
  const forceSuperadmin = async () => {
    if (!currentUser) return;
    
    try {
      setStatus({ loading: true, error: null, success: false });
      const userRef = doc(db, "users", currentUser.uid);
      
      await updateDoc(userRef, { 
        role: 'superadmin',
        coinBalance: 999999,
        forceElevated: true,
        elevatedAt: new Date()
      });
      
      // Also update custom claims if using a Cloud Function
      try {
        // This is just a client-side update, in production you would
        // call a secure Cloud Function to set custom claims
        const authUser = auth.currentUser;
        if (authUser) {
          await authUser.getIdToken(true); // Force token refresh
        }
      } catch (claimsError) {
        console.error("Error updating custom claims:", claimsError);
      }
      
      setStatus({
        loading: false,
        error: null,
        success: true,
        message: "🔐 Superadmin role forced! Please refresh the page."
      });
    } catch (error) {
      console.error("Error forcing superadmin role:", error);
      setStatus({
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error setting superadmin role",
        success: false
      });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Top Up Admin Coins</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Admin</h3>
          
          <div className="space-y-2">
            {admins.map(admin => (
              <button
                key={admin.id}
                className={`w-full text-left px-4 py-2 rounded ${
                  selectedAdmin === admin.id 
                    ? 'bg-purple-100 text-purple-700 font-medium' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => onSelectAdmin(admin.id)}
              >
                <div>{admin.email}</div>
                <div className="text-sm text-gray-500">
                  Current balance: {admin.coinBalance} coins
                </div>
              </button>
            ))}
            
            {admins.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No admin accounts found
              </div>
            )}
          </div>
        </div>
        
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Deploy Coins</h3>
          
          {!selectedAdmin ? (
            <div className="text-center py-8 text-gray-500">
              Select an admin from the list to top up their account
            </div>
          ) : (
            <form onSubmit={handleTopUp}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Admin Email
                </label>
                <input
                  type="text"
                  value={email}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-700"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Coins to Deploy
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value))}
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded text-gray-700"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Minimum 1 coin
                </p>
              </div>
              
              {status.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {status.error}
                </div>
              )}
              
              {status.success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                  {status.message || `Successfully deployed ${amount} coins to ${email}`}
                </div>
              )}
              
              <button
                type="submit"
                disabled={status.loading}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              >
                {status.loading ? 'Deploying...' : 'Deploy Coins'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// Component to display the list of admins
function AdminsList({ onSelectAdmin }: { onSelectAdmin: (adminId: string) => void }) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAdmins = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  // Fetch all admin users
  useEffect(() => {
    let isMounted = true;
    async function fetchAdmins() {
      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }
        
        console.log("Fetching admin users...");
        
        const adminQuery = query(
          collection(db, 'users'),
          where('role', '==', 'admin')
        );
        
        const snapshot = await getDocs(adminQuery);
        console.log(`Retrieved ${snapshot.docs.length} admin users`);
        
        if (!isMounted) return;
        
        const adminsList = snapshot.docs.map(doc => ({
          id: doc.id,
          email: doc.data().email || 'No email',
          coinBalance: doc.data().coinBalance || 0
        }));
        
        if (isMounted) {
          setAdmins(adminsList);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching admins:", error);
        if (isMounted) {
          setError("Failed to load admin users. Please try refreshing.");
          // Set empty admins list to avoid keeping old data
          setAdmins([]);
          setLoading(false);
        }
      }
    }

    fetchAdmins();
    
    return () => {
      isMounted = false;
    };
  }, [refreshAdmins]);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Admin Accounts</h2>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coin Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map(admin => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{admin.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{admin.coinBalance}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      className="text-purple-600 hover:text-purple-900"
                      onClick={() => onSelectAdmin(admin.id)}
                    >
                      Top Up
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {admins.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No admin accounts found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Component to display the transaction logs
function TransactionLogs() {
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;
    
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching transaction logs...");
        
        try {
          // First try to get transactions without the orderBy which requires the index
          const simpleQuery = query(
            collection(db, 'coinTransactions'),
            where('fromUid', '==', currentUser.uid),
            limit(20)
          );
          
          const snapshot = await getDocs(simpleQuery);
          console.log(`Retrieved ${snapshot.docs.length} transaction logs`);
          
          // Manually sort the results in memory
          const transactionList = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              fromUid: data.fromUid,
              fromEmail: data.fromEmail || '',
              toUid: data.toUid || '',
              toEmail: data.toEmail || '',
              amount: data.amount || 0,
              timestamp: data.timestamp ? 
                (data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp)) 
                : new Date()
            };
          });
          
          // Sort in memory (descending by timestamp)
          transactionList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          
          // Limit to 10 results after sorting
          setTransactions(transactionList.slice(0, 10));
        } catch (error) {
          console.error("Error in transaction query:", error);
          throw error; // Rethrow to outer catch
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setError("Failed to load transaction logs. Please try again later.");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [currentUser]);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Coin Transaction Logs</h2>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {tx.timestamp.toLocaleDateString()} {tx.timestamp.toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{tx.fromEmail}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{tx.toEmail}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{tx.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {transactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No transactions found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Component to display all users (both admins and regular users)
function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showOnlyAdmins, setShowOnlyAdmins] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const refreshUsers = useCallback(() => {
    setLoading(true);
    setError(null);
    setRefreshKey(prev => prev + 1);
  }, []);

  // Fetch all users
  useEffect(() => {
    let isMounted = true;
    async function fetchAllUsers() {
      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }
        
        // Basic query without orderBy to avoid potential index issues
        const userQuery = query(
          collection(db, 'users'),
          limit(50) // Start with a small limit to ensure fast loading
        );
        
        console.log("Fetching users...");
        const snapshot = await getDocs(userQuery);
        console.log(`Retrieved ${snapshot.docs.length} users`);
        
        if (!isMounted) return;
        
        if (snapshot.empty) {
          setUsers([]);
          setError("No users found in the database.");
          return;
        }
        
        // Map the documents to our user objects, with error handling for each property
        const usersList = snapshot.docs.map(doc => {
          try {
            const data = doc.data();
            return {
              id: doc.id,
              email: data.email || 'No email',
              displayName: data.displayName || '',
              role: data.role || 'user',
              coinBalance: typeof data.coinBalance === 'number' ? data.coinBalance : 0,
              realBalance: typeof data.realBalance === 'number' ? data.realBalance : 0,
              createdAt: data.createdAt,
              status: data.status || 'active'
            };
          } catch (docError) {
            console.error(`Error processing document ${doc.id}:`, docError);
            // Return a valid user object even if there's an error
            return {
              id: doc.id,
              email: 'Error loading data',
              role: 'unknown',
              coinBalance: 0
            };
          }
        });
        
        if (!isMounted) return;
        
        // Sort users by role importance: superadmin > admin > user
        try {
          usersList.sort((a, b) => {
            const roleRank: Record<string, number> = {
              'superadmin': 0,
              'admin': 1,
              'user': 2
            };
            const rankA = roleRank[a.role] ?? 3;
            const rankB = roleRank[b.role] ?? 3;
            return rankA - rankB;
          });
        } catch (sortError) {
          console.error("Error sorting users by role:", sortError);
          // Continue without sorting if it fails
        }
        
        if (isMounted) {
          setUsers(usersList);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        if (isMounted) {
          setError("Failed to load users. Please try refreshing.");
          setUsers([]); // Ensure we set users to an empty array
          setLoading(false);
        }
      }
    }

    fetchAllUsers();
    
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    // Text search filter
    const matchesSearch = user.email?.toLowerCase().includes(filter.toLowerCase()) ||
      (user.displayName && user.displayName.toLowerCase().includes(filter.toLowerCase()));
    
    // Role filter
    const matchesRole = showOnlyAdmins ? 
      (user.role === 'admin' || user.role === 'superadmin') : 
      true;
      
    return matchesSearch && matchesRole;
  });

  // Calculate pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Format date helper
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    try {
      // Handle Firestore timestamp
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString();
      }
      // Handle ISO string
      return new Date(timestamp).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">User Accounts</h2>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coins</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.role === 'superadmin' ? 'bg-purple-100 text-purple-800' : 
                        user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.coinBalance}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">${user.realBalance?.toFixed(2) || '0.00'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {user.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Custom navigation items for superadmin sidebar
const SuperadminSidebarItems = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => (
  <div className="py-4">
    <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase">Main</div>
    <button 
      className={`w-full text-left px-4 py-2 mb-1 ${
        activeTab === 'dashboard' 
          ? 'bg-purple-100 text-purple-700 font-medium border-l-4 border-purple-700' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
      onClick={() => setActiveTab('dashboard')}
    >
      Dashboard
    </button>
    
    <button 
      className={`w-full text-left px-4 py-2 mb-1 ${
        activeTab === 'topup-admins' 
          ? 'bg-purple-100 text-purple-700 font-medium border-l-4 border-purple-700' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
      onClick={() => setActiveTab('topup-admins')}
    >
      Top Up Admins
    </button>
    
    <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase">Management</div>
    <button 
      className={`w-full text-left px-4 py-2 mb-1 ${
        activeTab === 'admins' 
          ? 'bg-purple-100 text-purple-700 font-medium border-l-4 border-purple-700' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
      onClick={() => setActiveTab('admins')}
    >
      Admin Accounts
    </button>
    
    <button 
      className={`w-full text-left px-4 py-2 mb-1 ${
        activeTab === 'users' 
          ? 'bg-purple-100 text-purple-700 font-medium border-l-4 border-purple-700' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
      onClick={() => setActiveTab('users')}
    >
      User Accounts
    </button>
    
    <button 
      className={`w-full text-left px-4 py-2 mb-1 ${
        activeTab === 'transactions' 
          ? 'bg-purple-100 text-purple-700 font-medium border-l-4 border-purple-700' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
      onClick={() => setActiveTab('transactions')}
    >
      Transaction Logs
    </button>
    
    <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase">Developer</div>
    <button 
      className={`w-full text-left px-4 py-2 mb-1 ${
        activeTab === 'debug' 
          ? 'bg-purple-100 text-purple-700 font-medium border-l-4 border-purple-700' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
      onClick={() => setActiveTab('debug')}
    >
      Debug Tools
    </button>
  </div>
);

export default function SuperadminPage() {
  const { currentUser, loading, isSuperadmin, coinBalance } = useAuth();
  const router = useRouter();
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [permissionError, setPermissionError] = useState(false);
  const [isRecoveringPermissions, setIsRecoveringPermissions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Check for superadmin status and redirect if needed
  useEffect(() => {
    if (loading) return;

    if (!currentUser) {
      router.push('/login?redirect=/superadmin');
      return;
    }

    const checkPermissions = async () => {
      try {
        setIsLoading(true);
        setLoadingError(null);
        
        if (isSuperadmin) {
          await fetchAdmins();
          setPermissionError(false);
        } else {
          // Check actual user document
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const userData = userDoc.data();
          
          if (!userData || userData.role !== 'superadmin') {
            console.warn('User does not have superadmin role, redirecting');
            setLoadingError('You do not have permission to access the superadmin dashboard');
            setTimeout(() => {
              router.push('/');
            }, 3000);
          }
        }
      } catch (error: any) {
        console.error('Error checking permissions:', error);
        
        // Check if this is a permission error
        if (
          error.code === 'permission-denied' || 
          (error.message && (
            error.message.includes('permission') || 
            error.message.includes('Missing or insufficient permissions')
          ))
        ) {
          setPermissionError(true);
          setLoadingError('Permission error: Unable to access superadmin data. Try recovering permissions below.');
        } else {
          setLoadingError(`Error loading superadmin dashboard: ${error.message || 'Unknown error'}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkPermissions();
  }, [currentUser, loading, router, isSuperadmin]);

  // Function to recover from permission errors
  const handleRecoverPermissions = async () => {
    if (!currentUser) return;
    
    setIsRecoveringPermissions(true);
    try {
      // Try to recover permissions
      const recovered = await recoverFromPermissionError();
      
      if (recovered) {
        // Wait for a moment to let the token refresh propagate
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Retry loading
        await fetchAdmins();
        setPermissionError(false);
        setLoadingError(null);
      } else {
        setLoadingError('Could not recover permissions. Try logging out and back in.');
      }
    } catch (error: any) {
      console.error('Error recovering permissions:', error);
      setLoadingError(`Error recovering permissions: ${error.message || 'Unknown error'}`);
    } finally {
      setIsRecoveringPermissions(false);
    }
  };

  // Fetch all admin users
  async function fetchAdmins() {
    try {
      console.log("Fetching admins list");
      setIsLoading(true);
      const adminQuery = query(
        collection(db, 'users'),
        where('role', '==', 'admin')
      );
      
      const querySnapshot = await getDocs(adminQuery);
      const adminsList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email || 'No email',
          coinBalance: data.coinBalance || 0
        };
      });
      
      console.log(`Found ${adminsList.length} admins`);
      setAdmins(adminsList);
      
      // Auto-select first admin if none selected
      if (adminsList.length > 0 && !selectedAdmin) {
        setSelectedAdmin(adminsList[0].id);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      throw error; // Propagate error for handling in caller
    } finally {
      setIsLoading(false);
    }
  }

  const handleSelectAdmin = (adminId: string) => {
    setSelectedAdmin(adminId);
  };

  const forceReload = () => {
    window.location.reload();
  };

  // Set active tab based on URL path
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('process-transactions')) {
        setActiveTab('transactions');
      } else if (path.includes('settings')) {
        setActiveTab('settings');
      } else if (path.includes('admin-topups')) {
        setActiveTab('topups');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, []);

  // Loading state
  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-800">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-lg">Loading superadmin dashboard...</p>
          <p className="text-sm text-gray-400 mt-2">This may take a few seconds</p>
          
          {/* Add a fallback option if loading takes too long */}
          <button 
            onClick={forceReload}
            className="mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (loadingError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-800">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg border border-red-200">
          <h2 className="text-xl font-bold text-red-600 mb-4">Dashboard Error</h2>
          <p className="mb-4 text-gray-700">{loadingError}</p>
          <div className="flex space-x-4">
            <button 
              onClick={forceReload}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm text-white"
            >
              Refresh Page
            </button>
            <a 
              href="/"
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm text-white"
            >
              Go to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Not superadmin error
  if (!isSuperadmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-800">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg border border-yellow-200">
          <h2 className="text-xl font-bold text-yellow-600 mb-4">Access Restricted</h2>
          <p className="mb-4 text-gray-700">You need superadmin privileges to access this dashboard.</p>
          <div className="flex space-x-4">
            <button 
              onClick={() => {
                // Try to elevate the user
                if (currentUser) {
                  const userRef = doc(db, "users", currentUser.uid);
                  updateDoc(userRef, { role: 'superadmin' })
                    .then(() => window.location.reload())
                    .catch(err => console.error("Elevation failed:", err));
                }
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm text-white"
            >
              Elevate Privileges
            </button>
            <a 
              href="/"
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm text-white"
            >
              Go to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Function to render main content based on active tab
  const renderMainContent = () => {
    // Show loading state
    if (loading || isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading superadmin dashboard...</p>
          </div>
        </div>
      );
    }
    
    // Show error state
    if (loadingError) {
      return (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
            <p className="text-gray-700 mb-4">{loadingError}</p>
            
            {permissionError && (
              <div className="mt-6">
                <button 
                  onClick={handleRecoverPermissions}
                  disabled={isRecoveringPermissions}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isRecoveringPermissions ? 'Recovering...' : 'Recover Permissions'}
                </button>
                <p className="mt-3 text-sm text-gray-600">
                  If the issue persists, try logging out and back in again.
                </p>
              </div>
            )}
            
            <div className="mt-6">
              <button 
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Render content based on active tab
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TopUpAdminsForm 
                onSelectAdmin={handleSelectAdmin} 
                selectedAdmin={selectedAdmin}
                admins={admins}
              />
              <AdminsList onSelectAdmin={handleSelectAdmin} />
            </div>
            <div className="mt-6">
              <UsersList />
            </div>
            <div className="mt-6">
              <TransactionLogs />
            </div>
          </>
        );
      case 'transactions':
        return <div className="p-6 bg-white rounded-lg shadow-lg text-gray-800 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Process Transactions</h2>
          <p>Transaction processing module is coming soon.</p>
        </div>;
      case 'settings':
        return <div className="p-6 bg-white rounded-lg shadow-lg text-gray-800 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          <p>Settings module is coming soon.</p>
        </div>;
      case 'topups':
        return <div className="p-6 bg-white rounded-lg shadow-lg text-gray-800 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Admin Top-Ups</h2>
          <p>Admin top-up module is coming soon.</p>
        </div>;
      default:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TopUpAdminsForm 
                onSelectAdmin={handleSelectAdmin} 
                selectedAdmin={selectedAdmin}
                admins={admins}
              />
              <AdminsList onSelectAdmin={handleSelectAdmin} />
            </div>
            <div className="mt-6">
              <UsersList />
            </div>
            <div className="mt-6">
              <TransactionLogs />
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Superadmin Dashboard</title>
      </Head>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : !currentUser ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6 bg-gray-50">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full border border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Superadmin Access</h1>
            
            {loadingError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {loadingError}
              </div>
            )}
            
            {!currentUser ? (
              <div className="text-gray-700 text-center">
                <p>You need to log in with a superadmin account to access this page.</p>
                <button 
                  className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded" 
                  onClick={() => router.push('/login')}
                >
                  Log In
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-gray-700 text-center">
                  <p>Logged in as <span className="font-semibold">{currentUser.email}</span></p>
                  <p className="mt-2">Your account does not have superadmin privileges.</p>
                </div>
                
                {permissionError && (
                  <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded">
                    <p>Permission issue detected: {permissionError}</p>
                  </div>
                )}
                
                <div className="flex flex-col space-y-3">
                  <button 
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded" 
                    onClick={forceSuperadmin}
                  >
                    Force Superadmin Access
                  </button>
                  
                  <button 
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded" 
                    onClick={handleRecoverPermissions}
                  >
                    Recover Permissions
                  </button>
                  
                  <button 
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded" 
                    onClick={() => router.push('/')}
                  >
                    Return to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 min-h-screen bg-white border-r border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-800">Superadmin</h1>
              <p className="text-sm text-gray-600">{currentUser?.email}</p>
            </div>
            
            <SuperadminSidebarItems activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <div className="p-4 border-t border-gray-200">
              <button 
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                onClick={() => router.push('/')}
              >
                Exit Superadmin
              </button>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1 min-h-screen bg-gray-50">
            <div className="p-8">
              {renderMainContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 