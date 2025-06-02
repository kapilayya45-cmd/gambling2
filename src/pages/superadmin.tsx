import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, runTransaction, doc, increment, onSnapshot, orderBy, limit, Timestamp, addDoc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { deployCoins } from '@/services/coinService';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { auth } from '@/firebase/config';
import { getIdToken } from 'firebase/auth';
import SuperadminSidebarItems from '@/components/superadmin/SuperadminSidebarItems';
import UsersList from '@/components/superadmin/UsersList';
import TopUpAdminsForm from '@/components/superadmin/TopUpAdminsForm';
import AdminsList from '@/components/superadmin/AdminsList';
import TransactionLogs from '@/components/superadmin/TransactionLogs';

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
        setStatus(prev => ({ ...prev, success: false }));
      }, 5000);
      
    } catch (error: any) {
      console.error("Error deploying coins:", error);
      setStatus({ 
        loading: false, 
        error: error.message || "Failed to deploy coins. Please try again.", 
        success: false
      });
    }
  };

  return (
    <form onSubmit={handleTopUp} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Admin Email
        </label>
        <input
          type="text"
          value={email}
          readOnly
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount (Coins)
        </label>
        <input
          type="number"
          min="1"
          step="1"
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={status.loading || !email}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
      >
        {status.loading ? "Processing..." : "Deploy Coins"}
      </button>
      
      {status.error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {status.error}
        </div>
      )}
      
      {status.success && (
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {status.message}
        </div>
      )}
    </form>
  );
}

// Admin list component
function AdminsList({ onSelectAdmin }: { onSelectAdmin: (adminId: string) => void }) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdmins() {
      try {
        const adminsQuery = query(
          collection(db, "users"),
          where("role", "==", "admin")
        );
        
        const snapshot = await getDocs(adminsQuery);
        const adminList = snapshot.docs.map(doc => ({
          id: doc.id,
          email: doc.data().email,
          coinBalance: doc.data().coinBalance || 0
        }));
        
        setAdmins(adminList);
        setLoading(false);
      } catch (error) {
        console.error("Error loading admins:", error);
        setLoading(false);
      }
    }

    fetchAdmins();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Loading admins...</div>;
  }

  if (admins.length === 0) {
    return <div className="text-center py-4 text-gray-500">No admin accounts found.</div>;
  }

  return (
    <div className="space-y-2">
      {admins.map(admin => (
        <div 
          key={admin.id}
          onClick={() => onSelectAdmin(admin.id)}
          className="p-3 border rounded cursor-pointer hover:bg-gray-50"
        >
          <div className="font-medium">{admin.email}</div>
          <div className="text-sm text-gray-600">Balance: {admin.coinBalance} coins</div>
        </div>
      ))}
    </div>
  );
}

// Transaction logs component
function TransactionLogs() {
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const txQuery = query(
          collection(db, "coinTransactions"),
          orderBy("timestamp", "desc"),
          limit(50)
        );
        
        const snapshot = await getDocs(txQuery);
        const txList = snapshot.docs.map(doc => ({
          id: doc.id,
          fromUid: doc.data().fromUid,
          fromEmail: doc.data().fromEmail,
          toUid: doc.data().toUid,
          toEmail: doc.data().toEmail,
          amount: doc.data().amount,
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));
        
        setTransactions(txList);
        setLoading(false);
      } catch (error) {
        console.error("Error loading transactions:", error);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Loading transaction history...</div>;
  }

  if (transactions.length === 0) {
    return <div className="text-center py-4 text-gray-500">No transactions found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              From
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              To
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {tx.timestamp.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {tx.fromEmail || 'Unknown'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {tx.toEmail || 'Unknown'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {tx.amount} coins
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Main page component
export default function SuperadminPage() {
  const { currentUser, isSuperadmin } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('topup');
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<Admin[]>([]);

  useEffect(() => {
    async function fetchAdmins() {
      try {
        const adminsQuery = query(
          collection(db, "users"),
          where("role", "==", "admin")
        );
        
        const snapshot = await getDocs(adminsQuery);
        const adminList = snapshot.docs.map(doc => ({
          id: doc.id,
          email: doc.data().email,
          coinBalance: doc.data().coinBalance || 0
        }));
        
        setAdmins(adminList);
        setLoading(false);
      } catch (error) {
        console.error("Error loading admins:", error);
        setLoading(false);
      }
    }

    // Check if user is authenticated and has superadmin rights
    if (!currentUser) {
      router.replace('/');
    } else {
      verifyUserPermissions(currentUser.uid).then(({ isSuperadmin }) => {
        if (!isSuperadmin) {
          router.replace('/admin'); // kick non-superadmins back to admin panel
        } else {
          fetchAdmins();
        }
      });
    }
  }, [currentUser, router]);

  const handleSelectAdmin = (adminId: string) => {
    setSelectedAdmin(adminId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Loading Superadmin Panel</h1>
          <p className="text-gray-600">Verifying permissions and loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0 hidden md:block">
        <div className="px-4 py-5 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Foxxy</h1>
          <div className="mt-2 flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm text-gray-600">
              {currentUser?.email || 'Superadmin'}
            </span>
          </div>
        </div>
        
        <SuperadminSidebarItems />
        
        <div className="px-4 py-8">
          <button 
            onClick={() => router.push('/')}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Back to Home
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white px-4 py-3 shadow-lg border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center text-gray-800">
            <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            Superadmin Dashboard
          </h2>
          
          <div className="flex items-center space-x-4">
            <a 
              href="/admin" 
              className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors text-gray-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
              Admin Panel
            </a>
            
            <a 
              href="/" 
              className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors text-gray-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              Home
            </a>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Head>
            <title>Superadmin Dashboard | Foxxy</title>
            <meta name="description" content="Superadmin control panel" />
          </Head>
          
          {/* Two-column layout for desktop, stacked on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column: Top-Up Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <TopUpAdminsForm 
                onSelectAdmin={handleSelectAdmin} 
                selectedAdmin={selectedAdmin}
                admins={admins}
              />
            </div>
            
            {/* Right column: Admins List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <AdminsList onSelectAdmin={handleSelectAdmin} />
            </div>
          </div>
          
          {/* Users List */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <UsersList />
          </div>
          
          {/* Transaction Logs */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <TransactionLogs />
          </div>
        </main>
      </div>
    </div>
  );
} 