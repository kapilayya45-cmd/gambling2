import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoins } from '@/contexts/CoinsContext';

interface CoinBalanceProps {
  className?: string;
}

const CoinBalance: React.FC<CoinBalanceProps> = ({ className = '' }) => {
  // Get coin balance from auth context
  const { loading } = useAuth();
  const { coinsBalance } = useCoins();

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center bg-yellow-500 text-black px-3 py-1 rounded-full">
        {/* Coin icon */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4 mr-1.5"
        >
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM9 7.5A.75.75 0 0 0 9 9h1.5c.98 0 1.813.626 2.122 1.5H9A.75.75 0 0 0 9 12h3.622a2.251 2.251 0 0 1-2.122 1.5H9a.75.75 0 0 0-.53 1.28l3 3a.75.75 0 1 0 1.06-1.06L10.8 14.988A3.752 3.752 0 0 0 14.175 12H15a.75.75 0 0 0 0-1.5h-.825A3.733 3.733 0 0 0 13.5 9H15a.75.75 0 0 0 0-1.5H9z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">
          {loading ? '...' : `Coins: ${coinsBalance}`}
        </span>
      </div>
    </div>
  );
};

export default CoinBalance; 