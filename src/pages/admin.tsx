// src/pages/admin.tsx  (or src/app/admin/page.tsx)
'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import AdminLogin from '@/components/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { AdminProvider } from '@/contexts/AdminContext';

// Lazy load admin components to improve initial load time
const AdminUsersPage = lazy(() => import('@/components/admin/AdminUsersPage'));
const AdminBetsPage = lazy(() => import('@/components/admin/AdminBetsPage'));
const AdminEventsPage = lazy(() => import('@/components/admin/AdminEventsPage'));
const AdminWalletsPage = lazy(() => import('@/components/admin/AdminWalletsPage'));
const AdminPromotionsPage = lazy(() => import('@/components/admin/AdminPromotionsPage'));
const AdminSettingsPage = lazy(() => import('@/components/admin/AdminSettingsPage'));
const AdminDeployCoins = lazy(() => import('@/components/AdminDeployCoins'));

export const metadata = {
  title: 'Admin Dashboard | Foxxy',
  description: 'Admin dashboard for managing the betting platform',
};

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin h-10 w-10 border-4 border-purple-500 rounded-full border-t-transparent"></div>
  </div>
);

export default function AdminPage() {
  const { currentUser, logout, isAdmin, isSuperadmin, loading } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  // show spinner while we check auth/admin status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin h-12 w-12 border-4 border-purple-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // not logged in → show login form
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <Head>
          <title>Admin Login | Foxxy</title>
        </Head>
        <h1 className="text-3xl text-gray-800 mb-6">Admin Dashboard</h1>
        <AdminLogin />
      </div>
    );
  }

  // logged in but not an admin → access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-800 px-4">
        <h1 className="text-3xl mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You do not have permission to access the admin dashboard.
        </p>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 text-white"
        >
          Logout
        </button>
      </div>
    );
  }

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  return (
    <AdminProvider>
      <Head>
        <title>Admin Dashboard | Foxxy</title>
      </Head>
      <div className="flex h-screen bg-white text-gray-800">
        {/* Use our new AdminSidebar component */}
        <AdminSidebar 
          activeSection={activeSection} 
          onSectionChange={handleSectionChange} 
        />

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <Suspense fallback={<LoadingFallback />}>
            {activeSection === 'dashboard' && <AdminDashboard />}
            {activeSection === 'users' && <AdminUsersPage />}
            {activeSection === 'bets' && <AdminBetsPage />}
            {activeSection === 'events' && <AdminEventsPage />}
            {activeSection === 'wallets' && <AdminWalletsPage />}
            {activeSection === 'promotions' && <AdminPromotionsPage />}
            {activeSection === 'settings' && <AdminSettingsPage />}
            {activeSection === 'deploycoins' && <AdminDeployCoins />}
            {activeSection === 'topupadmins' && (
              <div className="text-center py-20">
                <h2 className="text-2xl">Top-up Admins Feature</h2>
                <p className="mt-4 text-gray-600">
                  This feature is coming soon. Check back later!
                </p>
              </div>
            )}
          </Suspense>
        </main>
      </div>
    </AdminProvider>
  );
}
