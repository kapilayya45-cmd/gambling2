import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import AdminLogin from '@/components/AdminLogin';
import Head from 'next/head';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminUsersPage from '@/components/admin/AdminUsersPage';
import AdminBetsPage from '@/components/admin/AdminBetsPage';
import AdminEventsPage from '@/components/admin/AdminEventsPage';
import AdminWalletsPage from '@/components/admin/AdminWalletsPage';
import AdminPromotionsPage from '@/components/admin/AdminPromotionsPage';
import AdminSettingsPage from '@/components/admin/AdminSettingsPage';
import AdminDeployCoins from '@/components/AdminDeployCoins';
// Comment out or remove this import if it doesn't exist
// import ManageBonusRules from '@/components/admin/ManageBonusRules';
import { AdminProvider } from '@/contexts/AdminContext';

// Metadata
export const metadata = {
  title: 'Admin Dashboard | Foxxy',
  description: 'Admin dashboard for managing the betting platform',
};

// Main Admin Page Component
const AdminPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  return (
    <AdminProvider>
      <Head>
        <title>Admin Dashboard | Foxxy</title>
        <meta name="description" content="Admin dashboard for managing the betting platform" />
      </Head>
      <div className="min-h-screen bg-black text-white">
        <AdminContent 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      </div>
    </AdminProvider>
  );
};

// Props interface for AdminContent
interface AdminContentProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

// AdminContent component that renders the appropriate section based on selection
const AdminContent: React.FC<AdminContentProps> = ({ 
  activeSection, 
  setActiveSection 
}) => {
  const { isAdmin, isLoading, adminData } = useAdmin();
  const { currentUser, logout } = useAuth();
  
  // Loader while checking admin status
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  // Show login if not logged in
  if (!currentUser) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-12 bg-black">
        <h1 className="text-2xl font-bold mb-8 text-center">Admin Dashboard</h1>
        <AdminLogin />
      </div>
    );
  }
  
  // Deny access if logged in but not admin
  if (!isAdmin) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-12 text-center bg-black">
        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-400 mb-6">
          You do not have permission to access the admin dashboard. 
          Please contact the system administrator if you believe this is an error.
        </p>
      </div>
    );
  }
  
  // Render admin dashboard for authenticated admins
  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-[#0f0f0f] border-r border-[#2a2a2a] overflow-y-auto">
        <div className="p-4 border-b border-[#2a2a2a]">
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          <div className="mt-2 flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm text-gray-400">
              {adminData?.email || 'Admin'}
            </span>
          </div>
        </div>
        
        <nav className="mt-2">
          <SidebarItem 
            icon="dashboard" 
            label="Dashboard" 
            active={activeSection === 'dashboard'} 
            onClick={() => setActiveSection('dashboard')} 
          />
          <SidebarItem 
            icon="users" 
            label="Users" 
            active={activeSection === 'users'} 
            onClick={() => setActiveSection('users')} 
          />
          <SidebarItem 
            icon="bets" 
            label="Bets" 
            active={activeSection === 'bets'} 
            onClick={() => setActiveSection('bets')} 
          />
          <SidebarItem 
            icon="events" 
            label="Events" 
            active={activeSection === 'events'} 
            onClick={() => setActiveSection('events')} 
          />
          <SidebarItem 
            icon="wallets" 
            label="Wallets" 
            active={activeSection === 'wallets'} 
            onClick={() => setActiveSection('wallets')} 
          />
          <SidebarItem 
            icon="promotions" 
            label="Promotions" 
            active={activeSection === 'promotions'} 
            onClick={() => setActiveSection('promotions')} 
          />
          <SidebarItem 
            icon="coins" 
            label="Deploy Coins" 
            active={activeSection === 'deploycoins'} 
            onClick={() => setActiveSection('deploycoins')} 
          />
          <SidebarItem 
            icon="gift" 
            label="Bonus Rules" 
            active={activeSection === 'bonusrules'} 
            onClick={() => setActiveSection('bonusrules')} 
          />
          <SidebarItem 
            icon="settings" 
            label="Settings" 
            active={activeSection === 'settings'} 
            onClick={() => setActiveSection('settings')} 
          />
          
          <div className="px-4 py-8">
            <button 
              onClick={logout}
              className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Logout
            </button>
          </div>
        </nav>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-[#0f0f0f] border-b border-[#2a2a2a] h-16 flex items-center px-6">
          <h2 className="text-xl font-bold">
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h2>
        </header>
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#121212] p-6">
          {activeSection === 'dashboard' && <AdminDashboard />}
          {activeSection === 'users' && <AdminUsersPage />}
          {activeSection === 'bets' && <AdminBetsPage />}
          {activeSection === 'events' && <AdminEventsPage />}
          {activeSection === 'wallets' && <AdminWalletsPage />}
          {activeSection === 'promotions' && <AdminPromotionsPage />}
          {activeSection === 'settings' && <AdminSettingsPage />}
          {activeSection === 'deploycoins' && <AdminDeployCoins />}
          {activeSection === 'bonusrules' && (
            <div className="p-6 bg-[#1a1f2c] rounded-lg shadow-lg text-white">
              <h3 className="text-xl font-semibold mb-4">Bonus Rules Management</h3>
              <p>Bonus rules management functionality will be implemented soon.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Sidebar Item Component
interface SidebarItemProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => {
  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'dashboard':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
          </svg>
        );
      case 'users':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
        );
      case 'bets':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
        );
      case 'events':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        );
      case 'wallets':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
          </svg>
        );
      case 'promotions':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
          </svg>
        );
      case 'coins':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      case 'gift':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
          </svg>
        );
      case 'settings':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-6 py-3 text-left transition-colors ${
        active 
          ? 'bg-purple-600 text-white' 
          : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
      }`}
    >
      <span className="mr-3">{getIcon(icon)}</span>
      <span>{label}</span>
    </button>
  );
};

export default AdminPage; 