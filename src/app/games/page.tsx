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
