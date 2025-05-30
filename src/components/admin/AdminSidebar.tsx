import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarItemProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function SidebarItem({ label, active, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-6 py-3 text-left transition ${
        active
          ? 'bg-purple-600 text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );
}

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const { currentUser, logout, isSuperadmin } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
        <div className="mt-2 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-sm text-gray-600">
            {currentUser?.email || 'Admin'}
            {isSuperadmin && <Plus className="inline w-4 h-4 text-yellow-600 ml-2" />}
          </span>
        </div>
      </div>
      <nav className="mt-4">
        {[
          ['dashboard', 'Dashboard'],
          ['users', 'Users'],
          ['bets', 'Bets'],
          ['events', 'Events'],
          ['wallets', 'Wallets'],
          ['promotions', 'Promotions'],
          ['settings', 'Settings'],
        ].map(([key, label]) => (
          <SidebarItem
            key={key}
            label={label}
            active={activeSection === key}
            onClick={() => onSectionChange(key)}
          />
        ))}

        {/* Everyone with role=admin (or superadmin) sees this */}
        <SidebarItem
          label="Deploy Coins"
          active={activeSection === 'deploycoins'}
          onClick={() => onSectionChange('deploycoins')}
        />

        {/* Only superadmins see this */}
        {isSuperadmin && (
          <>
            <SidebarItem
              label="Top-up Admins"
              active={activeSection === 'topupadmins'}
              onClick={() => onSectionChange('topupadmins')}
            />
            <Link href="/superadmin">
              <div className={`w-full flex items-center px-6 py-3 text-left transition text-purple-600 hover:bg-gray-100 hover:text-purple-700`}>
                Superadmin Panel
              </div>
            </Link>
          </>
        )}

        <div className="px-4 py-6">
          <button
            onClick={logout}
            className="w-full py-2 bg-red-600 rounded hover:bg-red-700 text-white"
          >
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
} 