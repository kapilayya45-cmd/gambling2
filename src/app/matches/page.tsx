"use client";

import React, { useEffect, useState } from 'react';

export default function TournamentSchedules() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchSchedules = async () => {
    // URL nundi extra spaces mariyu backslash lu remove chesam
    const url = 'https://allsportsapi2.p.rapidapi.com/api/tournament/17/season/76986/statistics/info';
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'allsportsapi2.p.rapidapi.com',
        'x-rapidapi-key': 'bd9714a581mshd9d62be37c57d10p165815jsnda58165bf017'
      }
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      // Tournament statistics data ni set chestunnam
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff' }}>
        <h2>Loading Tournament Data...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#0f172a', minHeight: '100vh', color: '#ff4444' }}>
        <h2>Error loading data. Please check API Key or URL.</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#fbbf24', marginBottom: '30px' }}>🏆 Tournament Statistics & Info</h1>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {stats ? (
          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155' }}>
            <h2 style={{ color: '#fbbf24', borderBottom: '1px solid #334155', pb: '10px' }}>Tournament Details</h2>
            
            {/* API structure prakaram ikkada fields display avthayi */}
            <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <p style={{ color: '#94a3b8', margin: '0' }}>Season Info</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.season?.name || '76986'}</p>
              </div>
              <div>
                <p style={{ color: '#94a3b8', margin: '0' }}>Status</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#4ade80' }}>Active</p>
              </div>
            </div>

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#0f172a', borderRadius: '8px' }}>
              <p style={{ color: '#94a3b8', marginBottom: '10px' }}>Raw Stats Preview:</p>
              <pre style={{ fontSize: '12px', color: '#cbd5e1', overflowX: 'auto' }}>
                {JSON.stringify(stats, null, 2).substring(0, 500)}...
              </pre>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>No data found for this tournament.</div>
        )}
      </div>
    </div>
  );
}
