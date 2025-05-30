import { useState, useEffect } from 'react';
import Head from 'next/head';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import Link from 'next/link';

export default function SuperadminDirectLogin() {
  const [email, setEmail] = useState('superadmin@example.com');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  async function bypassAuth() {
    try {
      setLoading(true);
      setStatus('Creating direct superadmin session...');

      // Generate a unique ID for this session
      const uid = `superadmin-${Date.now()}`;
      
      // Create a document for this user directly in Firestore
      try {
        await setDoc(doc(db, "users", uid), {
          email: email,
          role: "superadmin",
          uid: uid,
          coinBalance: 9999999,
          displayName: "Superadmin",
          createdAt: new Date()
        });
        setStatus('Created Firestore document.');
      } catch (error) {
        console.error('Firestore error:', error);
        setStatus('Failed to create Firestore document. Continuing with local storage only.');
      }
      
      // Store auth data in localStorage as a backup mechanism
      localStorage.setItem('superadminAuth', JSON.stringify({
        email,
        uid,
        role: 'superadmin',
        isDirectLogin: true
      }));
      
      // Store a session marker
      sessionStorage.setItem('superadminSession', 'true');
      
      setStatus('Success! Redirecting to dashboard...');
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/superadmin/dashboard';
      }, 1500);
    } catch (error) {
      console.error('Error in direct login:', error);
      setStatus(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Head>
        <title>Superadmin Direct Login</title>
      </Head>
      
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Superadmin Direct Login</h1>
        
        <div className="mb-6">
          <p className="text-red-400 mb-4 text-sm">
            <strong>Warning:</strong> This page bypasses normal authentication for development/testing. 
            It should not be used in production.
          </p>
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Email (for identification only)</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1">This email is just for display. No actual authentication occurs.</p>
          </div>
        </div>
        
        <button
          onClick={bypassAuth}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-medium disabled:opacity-50"
        >
          {loading ? 'Creating Session...' : 'Direct Superadmin Login'}
        </button>
        
        {status && (
          <div className="mt-4 p-3 bg-gray-700 rounded text-sm text-white">
            {status}
          </div>
        )}
        
        <div className="mt-6 flex justify-center">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 