import { useState, useEffect } from 'react';
import { BASKETBALL_LEAGUES, BasketballLeague } from '@/constants/basketballLeagues';
import {
  fetchBasketballEvents,
  fetchBasketballPastEvents,
  BasketballEvent
} from '@/services/basketballApi';

export interface LeagueStatus {
  inSeason: boolean;   // any upcoming matches exist?
  live:     boolean;   // is there a match currently in play?
}

type StatusMap = Record<string, LeagueStatus>;

export function useBasketballStatus(): StatusMap {
  const [status, setStatus] = useState<StatusMap>({});

  useEffect(() => {
    async function load() {
      const now = new Date();
      const s: StatusMap = {};

      for (const lg of BASKETBALL_LEAGUES) {
        // 1) Upcoming events => "in season"
        const upcoming = await fetchBasketballEvents(lg.id);
        const inSeason = upcoming.length > 0;

        // 2) Past events => check if any started within last 2 hours
        const past = await fetchBasketballPastEvents(lg.id);
        const live = past.some((ev: BasketballEvent) => {
          const start = new Date(`${ev.dateEvent}T${ev.strTime}`);
          const end   = new Date(start.getTime() + 2 * 60 * 60 * 1000);  // +2h
          return start <= now && now <= end;
        });

        s[lg.id] = { inSeason, live };
      }

      setStatus(s);
    }

    load();
  }, []);

  return status;
} 