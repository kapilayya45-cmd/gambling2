"use client";

import React, { useState } from 'react';

export default function GamesPage() {
  const game = {
    title: "Grand City Stunts",
    url: "https://gamemonetize.co",
    thumb: "https://gamemonetize.com",
    description: "In a Grand City, a very long stunt and racing adventure is beginning with Grand City Stunts game!"
  };

  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#fbbf24', fontSize: '2.5rem', textShadow: '0 0 10px #fbbf24' }}>🏎️ MANSHON GAME HUB</h1>
        <p style={{ color: '#94a3b8' }}>అత్యుత్తమ రేసింగ్ గేమ్‌లను ఇక్కడ ఆడండి</p>
      </header>

      {!isPlaying ? (
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#1e293b', borderRadius: '15px', overflow: 'hidden', border: '2px solid #fbbf24' }}>
          <img src={game.thumb} alt={game.title} style={{ width: '100%', display: 'block' }} />
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '10px' }}>{game.title}</h2>
            <p style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '20px' }}>{game.description}</p>
            <button 
              onClick={() => setIsPlaying(true)}
              style={{ backgroundColor: '#fbbf24', color: '#000', border: 'none', padding: '12px 30px', borderRadius: '50px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              PLAY NOW
            </button>
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
          <button 
            onClick={() => setIsPlaying(false)}
            style={{ marginBottom: '10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}
          >
            ✖ Close Game
          </button>
          <iframe 
            src={game.url} 
            style={{ width: '100%', height: '600px', border: 'none', borderRadius: '10px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
            allowFullScreen
          ></iframe>
        </div>
      )}

      <footer style={{ textAlign: 'center', marginTop: '40px', color: '#64748b' }}>
        <p>© 2026 Manshon House Book. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
