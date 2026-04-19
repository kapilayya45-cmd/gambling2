"use client";

import React, { useEffect, useState } from 'react';

export default function TournamentSchedules() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedules = async () => {
    const url = ' https://allsportsapi2.p.rapidapi.com/api/tournament/17/season/76986/statistics/info \';
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'cricketapi12.p.rapidapi.com',
        'x-rapidapi-key': 'bd9714a581mshd9d62be37c57d10p165815jsnda58165bf017'
      }
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      // API రెస్పాన్స్ లో 'events' ఫోల్డర్ ఉంటే దాన్ని సెట్ చేస్తున్నాము
      setEvents(data.events || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#fff' }}>Loading Schedules...</div>;

  return (
    <div style={{ padding: '20px', backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#fbbf24', marginBottom: '30px' }}>🗓️ Tournament Schedules</h1>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {events.length > 0 ? events.map((event: any) => (
          <div key={event.id} style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>
              {event.tournament?.name} • {event.status?.description}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0' }}>{event.homeTeam?.name}</h3>
                <p style={{ color: '#fbbf24', fontSize: '18px', fontWeight: 'bold', margin: '5px 0' }}>
                  {event.homeScore?.display || 'Yet to bat'}
                </p>
              </div>
              <div style={{ padding: '0 20px', fontWeight: 'bold', color: '#64748b' }}>VS</div>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <h3 style={{ margin: '0' }}>{event.awayTeam?.name}</h3>
                <p style={{ color: '#fbbf24', fontSize: '18px', fontWeight: 'bold', margin: '5px 0' }}>
                  {event.awayScore?.display || 'Yet to bat'}
                </p>
              </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '13px', color: '#cbd5e1', fontStyle: 'italic' }}>
              Start Time: {new Date(event.startTimestamp * 1000).toLocaleString()}
            </div>
          </div>
        )) : (
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>ఈ తేదీన ఎటువంటి మ్యాచ్‌లు షెడ్యూల్ చేయబడలేదు.</div>
        )}
      </div>
    </div>
  );
}
