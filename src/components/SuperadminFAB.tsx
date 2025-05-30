'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Plus } from 'lucide-react';

export default function SuperadminFAB() {
  const { isSuperadmin } = useAuth();
  const router = useRouter();

  // Only render for superadmins
  if (!isSuperadmin) return null;

  return (
    <button
      onClick={() => router.push('/superadmin')}
      aria-label="Superadmin Dashboard"
      className="
        fixed bottom-6 right-6
        w-14 h-14
        bg-purple-600 hover:bg-purple-700
        text-white
        rounded-full
        shadow-lg
        flex items-center justify-center
        transition
        z-50
      "
    >
      <Plus className="w-6 h-6" />
    </button>
  );
} 