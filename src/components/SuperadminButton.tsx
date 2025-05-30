import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface SuperadminButtonProps {
  className?: string;
}

const SuperadminButton: React.FC<SuperadminButtonProps> = ({ className = '' }) => {
  const { isSuperadmin } = useAuth();

  if (!isSuperadmin) {
    return null;
  }

  return (
    <Link 
      href="/superadmin/dashboard" 
      className={`flex items-center px-3 py-1 text-xs font-medium rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors ${className}`}
    >
      <span className="mr-1">⚡</span>
      <span>SUPERADMIN</span>
    </Link>
  );
};

export default SuperadminButton; 