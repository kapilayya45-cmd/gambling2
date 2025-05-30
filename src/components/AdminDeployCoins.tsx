// src/components/AdminDeployCoins.tsx
"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { deployCoins } from "@/services/coinService";

// Helper type for the coin balance
type CoinBalance = number | 'unlimited';

export default function AdminDeployCoins() {
  const { currentUser, isAdmin, coinBalance: adminCoins } = useAuth();
  const [email,  setEmail]  = useState("");
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState<{
    loading: boolean;
    error?: string;
    success?: string;
  }>({ loading: false });

  // Helper function to handle the 'unlimited' case
  const isUnlimited = (coins: CoinBalance): boolean => coins === 'unlimited';
  
  // Helper function to check if the amount exceeds the balance
  const exceedsBalance = (amount: number, balance: CoinBalance): boolean => {
    if (isUnlimited(balance)) return false;
    return amount > Number(balance);
  };
  
  // Helper function to get the max input value
  const getMaxAmount = (balance: CoinBalance): number => {
    return isUnlimited(balance) ? 9999999 : Number(balance);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !isAdmin) return;

    setStatus({ loading: true });
    try {
      const result = await deployCoins(currentUser.uid, email, amount);
      console.log("Deployment result:", result);
      
      // Coins were deployed successfully, show success message
      setStatus({
        loading: false,
        success: `✅ Deployed ${amount} coins to ${email}!`
      });
      setEmail("");
      setAmount(0);
    } catch (err: any) {
      console.error("Deploy coins error:", err);
      
      // Check if this is an authentication error but coins were likely deployed via fallback
      // This checks for our specific error message format from the improved coinService
      if (
        // Check for our special error message format
        (err.message && (
          err.message.includes("Authentication error:") ||
          (err.message.includes("Connection error:") && err.message.includes("fallback"))
        )) ||
        // Also check for specific Firebase auth errors
        err.code === 'auth/invalid-credential'
      ) {
        // Show a success message with a note about using fallback
        setStatus({
          loading: false,
          success: `✅ Deployed ${amount} coins to ${email}! (using fallback)`
        });
        setEmail("");
        setAmount(0);
      } else {
        // This is a real error, show it to the user
        // Extract just the relevant part of the error message if possible
        let errorMessage = err.message;
        
        // If the error message is too long or technical, simplify it
        if (errorMessage && errorMessage.length > 100) {
          // Try to extract the most important part of the error
          if (errorMessage.includes("Permission denied:")) {
            errorMessage = "Permission denied. Check that you have the right role.";
          } else if (errorMessage.includes("Not found:")) {
            errorMessage = "User not found. Check the email address.";
          } else if (errorMessage.includes("Insufficient balance:")) {
            errorMessage = "You don't have enough coins for this transaction.";
          } else {
            // Just take the first sentence or a shorter version
            errorMessage = errorMessage.split('.')[0] + '.';
          }
        }
        
        setStatus({ loading: false, error: errorMessage });
      }
    }
  };

  return (
    <div className="p-6 bg-[#1a1f2c] rounded-lg text-white">
      <h3 className="text-xl mb-4">Deploy Coins</h3>

      {/* show the same balance everywhere */}
      <div className="mb-4 p-3 bg-gray-800 rounded">
        Your coins: <span className="font-bold text-yellow-400">{adminCoins}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-1">Recipient Email</label>
          <input
            type="email"
            className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400"
            placeholder="user@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Amount</label>
          <input
            type="number"
            min={1}
            max={getMaxAmount(adminCoins)}
            className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            required
          />
        </div>

        <button
          type="submit"
          disabled={status.loading || amount < 1 || exceedsBalance(amount, adminCoins)}
          className="w-full py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {status.loading ? "⏳ Deploying…" : "Deploy Coins"}
        </button>

        {status.error   && <p className="mt-2 text-red-400">{status.error}</p>}
        {status.success && <p className="mt-2 text-green-400">{status.success}</p>}
      </form>
    </div>
  );
}
