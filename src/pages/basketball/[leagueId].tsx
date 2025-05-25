import { useRouter } from 'next/router';
import { BASKETBALL_LEAGUES } from '@/constants/basketballLeagues';
import { useBasketballStatus } from '@/hooks/useBasketballStatus';
import { fetchBasketballEvents } from '@/services/basketballApi';
import React from 'react';

export default function BasketballLeaguePage() {
  const { query } = useRouter();
  const id = Array.isArray(query.leagueId) ? query.leagueId[0] : query.leagueId;
  const league = BASKETBALL_LEAGUES.find(lg => lg.id === id);
  const status = useBasketballStatus();

  if (!league) return <p className="p-4">League not found.</p>;

  const [events, setEvents] = React.useState([]);
  React.useEffect(() => {
    fetchBasketballEvents(league.id).then(setEvents);
  }, [league.id]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">
        {league.name}
        {status[league.id]?.live && <span className="ml-3 text-red-600">LIVE NOW</span>}
      </h1>
      <p className="mb-4">
        {status[league.id]?.inSeason ? 'Matches are scheduled for this season.' : 'Off-season.'}
      </p>

      <h2 className="text-xl font-semibold mb-2">Upcoming Matches</h2>
      {events.length === 0 ? (
        <p>No upcoming games found.</p>
      ) : (
        <ul className="space-y-3">
          {events.map(ev => (
            <li key={ev.idEvent} className="p-3 bg-[#11151f] rounded flex justify-between">
              <span>{ev.strHomeTeam} vs {ev.strAwayTeam}</span>
              <span className="text-sm text-gray-400">{ev.dateEvent} {ev.strTime}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 