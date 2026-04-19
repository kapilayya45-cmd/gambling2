"use client";

import React from 'react';

export default function CricketMatches() {
  // మీరు పంపిన JSON డేటా ఇక్కడ ఉంటుంది (ఉదాహరణకు మొదటి మ్యాచ్)
  const matches = [
    {
      id: 12595555,
      tournament: "Sheffield Shield",
      homeTeam: "Queensland",
      awayTeam: "Tasmania",
      homeScore: "516 & 225/5",
      awayScore: "461",
      status: "Match Ended",
      result: "Draw"
    }
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#fbbf24', marginBottom: '30px' }}>🏏 Match Results & Live Odds</h1>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {matches.map((match) => (
          <div key={match.id} style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>
              {match.tournament} • {match.status}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '5px 0' }}>{match.homeTeam}</h3>
                <p style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '18px' }}>{match.homeScore}</p>
              </div>
              
              <div style={{ padding: '0 20px', color: '#64748b', fontWeight: 'bold' }}>VS</div>
              
              <div style={{ flex: 1, textAlign: 'right' }}>
                <h3 style={{ margin: '5px 0' }}>{match.awayTeam}</h3>
                <p style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '18px' }}>{match.awayScore}</p>
              </div>
            </div>

            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#22c55e', fontSize: '14px', fontWeight: 'bold' }}>{match.result}</span>
              <button style={{ backgroundColor: '#fbbf24', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Place Bet
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
