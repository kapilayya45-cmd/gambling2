// src/contexts/AdminContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  limit,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "./AuthContext";

export interface BonusRule {
  id: string;
  name: string;
  description: string;
  type: "first_deposit" | "reload" | "referral" | "loyalty";
  value: number;
  valueType: "fixed" | "percentage";
  minRequirement: number;
  maxBonus: number;
  active: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface AdminUser {
  uid: string;
  email: string;
  role: "admin" | "superadmin";
}

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
  adminData: AdminUser | null;
  users: any[];
  matches: any[];
  bets: any[];
  bonusRules: BonusRule[];
  loadingData: boolean;
  fetchUsers: () => Promise<void>;
  fetchMatches: () => Promise<void>;
  fetchBets: () => Promise<void>;
  fetchBonusRules: () => Promise<void>;
  updateMatch: (matchId: string, data: any) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within an AdminProvider");
  return ctx;
}

interface Props {
  children: ReactNode;
}

// Data caching timeout (15 minutes)
const CACHE_EXPIRY = 15 * 60 * 1000; 

export function AdminProvider({ children }: Props) {
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState<AdminUser | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [bets, setBets] = useState<any[]>([]);
  const [bonusRules, setBonusRules] = useState<BonusRule[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  
  // Track data fetch timestamps for caching
  const cacheTimestamps = useRef({
    users: 0,
    matches: 0,
    bets: 0,
    bonusRules: 0
  });
  
  // Track pending fetches to prevent duplicate requests
  const pendingFetches = useRef({
    users: false,
    matches: false,
    bets: false,
    bonusRules: false
  });

  // Timeout reference for debouncing
  const fetchUsersTimeout = useRef<NodeJS.Timeout | null>(null);

  // 1) On mount or whenever the auth user changes, load their `role` from users/{uid}
  useEffect(() => {
    async function checkAdmin() {
      setIsLoading(true);
      if (!currentUser) {
        setIsAdmin(false);
        setAdminData(null);
        setIsLoading(false);
        return;
      }
      try {
        const ref = doc(db, "users", currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data().role === "admin") {
          setIsAdmin(true);
          setAdminData({
            uid: currentUser.uid,
            email: currentUser.email || "",
            role: "admin",
          });
        } else {
          setIsAdmin(false);
          setAdminData(null);
        }
      } catch (e) {
        console.error("Error loading admin status:", e);
        setIsAdmin(false);
        setAdminData(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkAdmin();
  }, [currentUser]);

  // 2) Optimized fetch users with caching and debouncing
  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    
    // Check if there's already a pending fetch
    if (pendingFetches.current.users) {
      console.log("Users fetch already in progress, skipping duplicate request");
      return;
    }
    
    // Clear any existing timeout
    if (fetchUsersTimeout.current) {
      clearTimeout(fetchUsersTimeout.current);
    }
    
    // Debounce the fetch request
    fetchUsersTimeout.current = setTimeout(async () => {
      // Check if data is still fresh in cache
      const now = Date.now();
      if (users.length > 0 && now - cacheTimestamps.current.users < CACHE_EXPIRY) {
        console.log("Using cached users data");
        return;
      }
      
      pendingFetches.current.users = true;
      setLoadingData(true);
      
      try {
        console.log("Fetching users data from Firestore");
        const col = collection(db, "users");
        // Use an efficient query with ordering and limit
        const q = query(
          col, 
          orderBy("createdAt", "desc"), 
          limit(100)
        );
        const snap = await getDocs(q);
        const userData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        setUsers(userData);
        cacheTimestamps.current.users = now;
      } catch (e) {
        console.error("Error fetching users:", e);
      } finally {
        setLoadingData(false);
        pendingFetches.current.users = false;
      }
    }, 300); // 300ms debounce delay
    
  }, [isAdmin, users.length]);

  // 3) Optimized fetch matches with caching
  const fetchMatches = useCallback(async () => {
    if (!isAdmin) return;
    
    // Check if there's already a pending fetch
    if (pendingFetches.current.matches) {
      return;
    }
    
    // Check if data is still fresh in cache
    const now = Date.now();
    if (matches.length > 0 && now - cacheTimestamps.current.matches < CACHE_EXPIRY) {
      console.log("Using cached matches data");
      return;
    }
    
    pendingFetches.current.matches = true;
    setLoadingData(true);
    
    try {
      const col = collection(db, "matches");
      const q = query(col, orderBy("date", "desc"), limit(50));
      const snap = await getDocs(q);
      setMatches(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      cacheTimestamps.current.matches = now;
    } catch (e) {
      console.error("Error fetching matches:", e);
    } finally {
      setLoadingData(false);
      pendingFetches.current.matches = false;
    }
  }, [isAdmin, matches.length]);

  // 4) Optimized fetch bets with caching
  const fetchBets = useCallback(async () => {
    if (!isAdmin) return;
    
    // Check if there's already a pending fetch
    if (pendingFetches.current.bets) {
      return;
    }
    
    // Check if data is still fresh in cache
    const now = Date.now();
    if (bets.length > 0 && now - cacheTimestamps.current.bets < CACHE_EXPIRY) {
      console.log("Using cached bets data");
      return;
    }
    
    pendingFetches.current.bets = true;
    setLoadingData(true);
    
    try {
      const q = query(
        collection(db, "transactions"), 
        where("type", "==", "bet"),
        orderBy("timestamp", "desc"),
        limit(100)
      );
      const snap = await getDocs(q);
      setBets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      cacheTimestamps.current.bets = now;
    } catch (e) {
      console.error("Error fetching bets:", e);
    } finally {
      setLoadingData(false);
      pendingFetches.current.bets = false;
    }
  }, [isAdmin, bets.length]);

  // 5) Optimized fetch bonus rules with caching
  const fetchBonusRules = useCallback(async () => {
    if (!isAdmin) return;
    
    // Check if there's already a pending fetch
    if (pendingFetches.current.bonusRules) {
      return;
    }
    
    // Check if data is still fresh in cache
    const now = Date.now();
    if (bonusRules.length > 0 && now - cacheTimestamps.current.bonusRules < CACHE_EXPIRY) {
      console.log("Using cached bonus rules data");
      return;
    }
    
    pendingFetches.current.bonusRules = true;
    setLoadingData(true);
    
    try {
      const col = collection(db, "bonusRules");
      const snap = await getDocs(col);
      setBonusRules(snap.docs.map(d => ({ id: d.id, ...d.data() } as BonusRule)));
      cacheTimestamps.current.bonusRules = now;
    } catch (e) {
      console.error("Error fetching bonus rules:", e);
    } finally {
      setLoadingData(false);
      pendingFetches.current.bonusRules = false;
    }
  }, [isAdmin, bonusRules.length]);

  // 6) Optimized update match function
  const updateMatch = async (matchId: string, data: any) => {
    if (!isAdmin) throw new Error("Unauthorized");
    try {
      const ref = doc(db, "matches", matchId);
      await updateDoc(ref, data);
      
      // Invalidate matches cache
      cacheTimestamps.current.matches = 0;
      await fetchMatches();
    } catch (e) {
      console.error("Error updating match:", e);
      throw e;
    }
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (fetchUsersTimeout.current) {
        clearTimeout(fetchUsersTimeout.current);
      }
    };
  }, []);

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isLoading,
        adminData,
        users,
        matches,
        bets,
        bonusRules,
        loadingData,
        fetchUsers,
        fetchMatches,
        fetchBets,
        fetchBonusRules,
        updateMatch,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
