import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const Balance: React.FC<{ className?: string }> = ({ className }) => {
  const { realBalance } = useAuth();
  return (
    <div className={className + ' flex items-center'}>
      <span className="px-2 py-1 bg-green-500 text-white rounded">
        ${realBalance.toFixed(2)}
      </span>
    </div>
  );
};

export default Balance; 