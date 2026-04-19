"use client";
import React from 'react';

export default function GamesLobby() {
  // ఇక్కడ GameMonetize నుండి మీరు కాపీ చేసిన గేమ్ లింక్ పేస్ట్ చేయండి
  const gameUrl = "https://gamemonetize.com"; 

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff' }}>
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1 style={{ color: '#ffcc00', textShadow: '0 0 10px #ffcc00' }}>🎰 MANSHON GAME ZONE</h1>
        <p>వందలాది ఉచిత గేమ్‌లు ఇక్కడ ఆడండి!</p>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        padding: '10px' 
      }}>
        <iframe 
          src={gameUrl}
          style={{
            width: '90%',
            height: '80vh',
            border: '5px solid #ffcc00',
            borderRadius: '15px',
            boxShadow: '0 0 30px rgba(255, 204, 0, 0.5)'
          }}
          frameBorder="0"
          scrolling="no"
          allowFullScreen
        ></iframe>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={() => window.location.href='/admin'} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Back to Admin
        </button>
      </div>
    </div>
  );
}
"use client";
import React, { useState } from 'react';

export default function GamesPage() {
  const game = {
    title: "Grand City Stunts",
    url: "https://html5.gamemonetize.co/ehni1mj8vzyzv4usr03qm5obdlv974sl/",
    thumb: "https://img.gamemonetize.com/ehni1mj8vzyzv4usr03qm5obdlv974sl/512x384.jpg",
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
        // గేమ్ ఆడకముందు కనిపించే ప్రివ్యూ కార్డ్
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
        // ప్లే నొక్కిన తర్వాత ఓపెన్ అయ్యే ఐఫ్రేమ్ (Iframe)
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
