'use client';

import React, { useEffect, useState } from 'react';
import { TENNIS_LEAGUES, fetchUpcomingMatchesByLeague } from '@/services/sportsApi';
import { SportDbEvent } from '@/services/sportsApi';

export default function TennisList() {
  const [matches, setMatches] = useState<SportDbEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadMatches() {
      setLoading(true);
      try {
        // ← Here's where you use your snippet:
        const results = await Promise.all(
          TENNIS_LEAGUES.map(lg => fetchUpcomingMatchesByLeague(lg.id))
        );
        // Flatten the array of arrays into a single list
        if (mounted) setMatches(results.flat());
      } catch (err: any) {
        console.error(err);
        if (mounted) setError('Failed to load tennis matches.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadMatches();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <p>Loading Tennis…</p>;
  if (error)   return <p className="text-red-500">{error}</p>;
  if (!matches.length) return <p>No upcoming Tennis matches.</p>;

  return (
    <ul>
      {matches.map(m => (
        <li key={m.idEvent}>
          {m.strEvent} @ {m.strTime}
        </li>
      ))}
    </ul>
  );
} 