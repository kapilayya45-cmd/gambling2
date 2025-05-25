import React from 'react';
import Link from 'next/link';
import { BASKETBALL_LEAGUES } from '@/constants/basketballLeagues';
import { useBasketballStatus } from '@/hooks/useBasketballStatus';

export default function BasketballIndex() {
  const status = useBasketballStatus();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Basketball Leagues</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BASKETBALL_LEAGUES.map(league => (
          <Link key={league.id} href={`/basketball/${league.id}`} legacyBehavior>
            <a className="p-4 bg-[#11151f] hover:bg-[#1a202c] rounded-lg transition-colors">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-xl">{league.name}</h2>
                <div className="flex space-x-2">
                  {status[league.id]?.live && (
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">LIVE</span>
                  )}
                  {status[league.id]?.inSeason && !status[league.id]?.live && (
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">IN SEASON</span>
                  )}
                </div>
              </div>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
} 