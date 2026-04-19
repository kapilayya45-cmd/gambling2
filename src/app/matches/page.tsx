"use client";

import React, { useEffect, useState } from 'react';

export default function CricketScorecard() {
  const [matchData, setMatchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchScorecard = async () => {
    // Cricbuzz Match Scorecard Endpoint
    const url = 'https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/40381/hscard';
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com',
        'x-rapidapi-key': 'bd9714a581mshd9d62be37c57d10p165815jsnda58165bf017'
      }
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      
      // Cricbuzz API scorecard data ni set chestunnam
      setMatchData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching scorecard:", error);
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScorecard();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#050a12', minHeight: '100vh', color: '#fff' }}>
        <h2>Loading Live Scorecard...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#050a12', minHeight: '100vh', color: '#ff4444' }}>
        <h2>Error fetching match data. Check API configuration.</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#050a12', minHeight: '100vh', color: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#00d2ff', marginBottom: '30px' }}>🏏 Live Cricket Scorecard</h1>
      
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {matchData ? (
          <div style={{ backgroundColor: '#111b27', borderRadius: '15px', padding: '25px', border: '1px solid #1e2d3d', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            
            {/* Match Status */}
            <div style={{ textAlign: 'center', marginBottom: '20px', color: '#ffca28', fontWeight: 'bold' }}>
              {matchData.status || "Match in Progress"}
            </div>

            {/* Teams and Scores */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e2d3d', pb: '20px', mb: '20px' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <h2 style={{ margin: '0', fontSize: '20px' }}>{matchData.matchHeader?.team1?.name}</h2>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00d2ff', mt: '10px' }}>
                  {matchData.miniscore?.batTeamScore || "0/0"}
                </div>
              </div>

              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4b5563', padding: '0 15px' }}>VS</div>

              <div style={{ textAlign: 'center', flex: 1 }}>
                <h2 style={{ margin: '0', fontSize: '20px' }}>{matchData.matchHeader?.team2?.name}</h2>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00d2ff', mt: '10px' }}>
                  {matchData.miniscore?.bowlTeamScore || "Yet to bat"}
                </div>
              </div>
            </div>

            {/* Match Info Details */}
            <div style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.8' }}>
              <p>📍 Venue: {matchData.venueInfo?.ground}, {matchData.venueInfo?.city}</p>
              <p>📅 Series: {matchData.seriesName}</p>
            </div>

            {/* Raw JSON for Debugging (Optional) */}
            <details style={{ marginTop: '20px', cursor: 'pointer' }}>
              <summary style={{ color: '#64748b', fontSize: '12px' }}>Show technical data</summary>
              <pre style={{ fontSize: '10px', background: '#050a12', padding: '10px', borderRadius: '5px', overflowX: 'auto', mt: '10px' }}>
                {JSON.stringify(matchData, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>No match data available.</div>
        )}
      </div>
    </div>
  );
}
