"use client";

import React, { useEffect, useState } from 'react';

export default function LiveMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    const url = 'https://rapidapi.com'; // లైవ్ మ్యాచ్‌ల ఎండ్‌పాయింట్
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'bd9714a581mshd9d62be37c57d10p165815jsnda58165bf017',
        'X-RapidAPI-Host': 'cricket-api-free-data.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      setMatches(result.events || []); // API రెస్పాన్స్ ని బట్టి ఇది మార్చుకోవాలి
      setLoading(false);
    } catch (error) {
      console.error("Error fetching matches:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 30000); // ప్రతి 30 సెకన్లకు అప్‌డేట్ అవుతుంది
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#fff' }}>Loading Live Scores...</div>;

  return (
    <div style={{ padding: '20px', backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#fbbf24', marginBottom: '30px' }}>🏏 Live Matches & Odds</h1>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {matches.length > 0 ? matches.map((match: any) => (
          <div key={match.id} style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: 'bold', marginBottom: '10px' }}>
              🔴 LIVE - {match.tournament?.name}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <h3>{match.homeTeam?.name}</h3>
                <p style={{ color: '#fbbf24', fontSize: '20px', fontWeight: 'bold' }}>
                  {match.homeScore?.current || '0'}
                </p>
              </div>
              <div style={{ color: '#64748b', fontWeight: 'bold' }}>VS</div>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <h3>{match.awayTeam?.name}</h3>
                <p style={{ color: '#fbbf24', fontSize: '20px', fontWeight: 'bold' }}>
                  {match.awayScore?.current || '0'}
                </p>
              </div>
            </div>

            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '12px' }}>Odds: </span>
                <span style={{ backgroundColor: '#334155', padding: '4px 8px', borderRadius: '4px', marginRight: '5px' }}>1.85</span>
                <span style={{ backgroundColor: '#334155', padding: '4px 8px', borderRadius: '4px' }}>2.10</span>
              </div>
              <button style={{ backgroundColor: '#fbbf24', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Place Bet
              </button>
            </div>
          </div>
        )) : (
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>ప్రస్తుతానికి లైవ్ మ్యాచ్‌లు లేవు.</div>
        )}
      </div>
    </div>
  );
}
