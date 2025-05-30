import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Match {
  id: number;
  home: string;
  away: string;
  time: string;
  odds: { home: number; draw?: number; away: number };
}

// Dummy match data per sport
const dummyMatches: Record<string, Match[]> = {
  live: [
    { id: 1, home: 'Team A', away: 'Team B', time: '12:30', odds: { home: 1.5, draw: 2.2, away: 3.0 } },
    { id: 2, home: 'Team C', away: 'Team D', time: '13:00', odds: { home: 1.8, draw: 2.5, away: 2.9 } },
  ],
  cricket: [
    { id: 3, home: 'Ind vs Aus', away: 'Pak vs SL', time: '14:00', odds: { home: 1.7, away: 2.1 } },
  ],
  football: [
    { id: 4, home: 'Man Utd', away: 'Chelsea', time: '16:00', odds: { home: 1.9, draw: 3.2, away: 4.0 } },
  ],
  basketball: [
    { id: 5, home: 'Lakers', away: 'Heat', time: '18:00', odds: { home: 1.6, away: 2.4 } },
  ],
  tennis: [
    { id: 6, home: 'Nadal', away: 'Federer', time: '20:00', odds: { home: 1.4, away: 2.8 } },
  ],
  'horse-racing': [
    { id: 7, home: 'Horse 1', away: 'Horse 2', time: '15:30', odds: { home: 3.5, away: 4.2 } },
  ],
  greyhound: [
    { id: 8, home: 'Greyhound A', away: 'Greyhound B', time: '17:45', odds: { home: 2.0, away: 2.5 } },
  ],
  casino: [
    { id: 9, home: 'Roulette', away: 'Blackjack', time: 'Live', odds: { home: 1.0, away: 1.0 } },
  ],
};

// Primary component
const MatchList: React.FC = () => {
  const router = useRouter();
  const { slug } = router.query;
  const sport = Array.isArray(slug) ? slug[0] : slug || 'live';

  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const key = sport.toLowerCase();
    setMatches(dummyMatches[key] || dummyMatches['live']);
  }, [sport]);

  return (
    <div className="px-6 space-y-6">
      <h2 className="text-2xl font-bold capitalize text-gray-800">{sport} Matches</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <div
            key={match.id}
            onClick={() => router.push(`/matches/${match.id}`)}
            className="bg-white p-4 rounded-lg border border-gray-200 hover:border-purple-400 hover:bg-gray-50 cursor-pointer transition-colors shadow-sm"
          >
            <div className="flex justify-between items-center mb-2 text-gray-800">
              <span className="font-semibold">{match.home}</span>
              <span className="text-sm text-gray-500">{match.time}</span>
              <span className="font-semibold">{match.away}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span className="px-2 py-1 bg-gray-100 rounded">{match.odds.home}</span>
              {match.odds.draw && <span className="px-2 py-1 bg-gray-100 rounded">{match.odds.draw}</span>}
              <span className="px-2 py-1 bg-gray-100 rounded">{match.odds.away}</span>
            </div>
            <Link
              href={`/bet/${match.id}`}
              onClick={(e) => e.stopPropagation()}
              className="mt-4 inline-block w-full text-center bg-[#25b95f] hover:bg-green-600 text-white py-2 rounded font-semibold transition-colors"
            >
              Place Bet
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchList;
