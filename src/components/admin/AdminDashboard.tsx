'use client';

import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

// Dashboard KPI card component
interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, change, icon, trend }) => {
  return (
    <div className="bg-[#1a1f2c] rounded-lg p-6 shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
          <div className="text-white text-2xl font-bold">{value}</div>
          {change && (
            <div className={`text-xs mt-2 flex items-center ${
              trend === 'up' ? 'text-green-400' : 
              trend === 'down' ? 'text-red-400' : 'text-gray-400'
            }`}>
              {trend === 'up' && (
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              )}
              {trend === 'down' && (
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"></path>
                </svg>
              )}
              {change}
            </div>
          )}
        </div>
        <div className="p-3 rounded-full bg-[#242a38]">
          {icon}
        </div>
      </div>
    </div>
  );
};

// Chart component for bet activity
const BetActivityChart = ({ data }: { data: {date: string, count: number}[] }) => {
  const maxValue = Math.max(...data.map(d => d.count));
  
  return (
    <div className="bg-[#1a1f2c] rounded-lg p-6 shadow-md">
      <h3 className="text-lg font-medium mb-4">Bet Activity (Last 7 Days)</h3>
      <div className="h-60 flex items-end justify-between">
        {data.map((day, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className="w-full max-w-[30px] bg-purple-600 rounded-t transition-all duration-500"
              style={{ 
                height: `${(day.count / maxValue) * 100}%`, 
                minHeight: '5px',
                opacity: day.count ? 1 : 0.3
              }}
            ></div>
            <div className="text-xs text-gray-400 mt-2">
              {day.date}
            </div>
            <div className="text-xs font-medium mt-1">
              {day.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { isAdmin } = useAdmin();
  const [dashboardData, setDashboardData] = useState({
    activeUsers: 0,
    betsToday: 0,
    totalVolume: 0,
    profitLoss: 0,
    betActivity: [] as {date: string, count: number}[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAdmin || !db) return;
      
      setIsLoading(true);
      try {
        // Get today's date (start of day)
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const timestampToday = Timestamp.fromDate(startOfToday);
        
        // Count active users (users who have logged in in the last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const timestampSevenDaysAgo = Timestamp.fromDate(sevenDaysAgo);
        
        const usersQuery = query(
          collection(db, 'users'),
          where('lastLogin', '>=', timestampSevenDaysAgo)
        );
        const usersSnapshot = await getDocs(usersQuery);
        const activeUsers = usersSnapshot.size;
        
        // Count bets placed today
        const betsQuery = query(
          collection(db, 'transactions'),
          where('type', '==', 'bet'),
          where('createdAt', '>=', timestampToday)
        );
        const betsSnapshot = await getDocs(betsQuery);
        const betsToday = betsSnapshot.size;
        
        // Calculate total volume and P/L
        let totalVolume = 0;
        let profitLoss = 0;
        
        betsSnapshot.forEach(doc => {
          const betData = doc.data();
          totalVolume += betData.amount || 0;
          
          // If bet is settled and lost, it's profit for the house
          if (betData.status === 'lost') {
            profitLoss += betData.amount || 0;
          } 
          // If bet is settled and won, it's loss for the house
          else if (betData.status === 'won') {
            profitLoss -= (betData.amount * betData.odds) - betData.amount || 0;
          }
        });
        
        // Get bet activity for the last 7 days
        const betActivity = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          
          const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
          
          const dayBetsQuery = query(
            collection(db, 'transactions'),
            where('type', '==', 'bet'),
            where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
            where('createdAt', '<=', Timestamp.fromDate(endOfDay))
          );
          
          const dayBetsSnapshot = await getDocs(dayBetsQuery);
          
          betActivity.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            count: dayBetsSnapshot.size
          });
        }
        
        setDashboardData({
          activeUsers,
          betsToday,
          totalVolume,
          profitLoss,
          betActivity
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [isAdmin]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Active Users" 
          value={dashboardData.activeUsers}
          change="+12% from last week"
          trend="up"
          icon={
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          }
        />
        
        <KpiCard 
          title="Bets Today" 
          value={dashboardData.betsToday}
          change="+5% from yesterday"
          trend="up"
          icon={
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
          }
        />
        
        <KpiCard 
          title="Total Volume" 
          value={formatCurrency(dashboardData.totalVolume)}
          change="-2% from yesterday"
          trend="down"
          icon={
            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          }
        />
        
        <KpiCard 
          title="P/L Today" 
          value={formatCurrency(dashboardData.profitLoss)}
          change={dashboardData.profitLoss >= 0 ? "+8% from yesterday" : "-3% from yesterday"}
          trend={dashboardData.profitLoss >= 0 ? "up" : "down"}
          icon={
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          }
        />
      </div>
      
      <BetActivityChart data={dashboardData.betActivity} />
    </div>
  );
};

export default AdminDashboard; 