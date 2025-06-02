import React from 'react';

interface Admin {
  id: string;
  email: string;
  coinBalance: number;
}

interface AdminsListProps {
  onSelectAdmin: (adminId: string) => void;
}

export default function AdminsList({ onSelectAdmin }: AdminsListProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Admins List</h2>
      <div className="space-y-2">
        {/* Admin list will be populated from parent component */}
        <div className="text-sm text-gray-600">
          Select an admin from the dropdown in the Top Up form to manage their balance.
        </div>
      </div>
    </div>
  );
} 