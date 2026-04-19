"use client";
import React, { useState, useEffect } from 'react';

const symbols = ['💎', '🍋', '🍒', '🔔', '⭐', '7️⃣'];

export default function PremiumCasino() {
  const [reels, setReels] = useState(['💎', '7️⃣', '💎']);
  const [spinning, setSpinning] = useState(false);
  const [balance, setBalance] = useState(1000);
  const [win, setWin] = useState(0);

  const spin = () => {
    if (balance < 20) return alert("బ్యాలెన్స్ సరిపోదు!");
    setSpinning(true);
    setWin(0);
    setBalance(b => b - 20);

    const interval = setInterval(() => {
      setReels([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ]);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setSpinning(false);
      // విన్నింగ్ కండిషన్
      checkWin();
    }, 2000);
  };

  const checkWin = () => {
    // ఇక్కడ మీరు మీ విన్నింగ్ లాజిక్ అప్‌డేట్ చేయవచ్చు
  };

  return (
    <div style={{
      background: 'radial-gradient(circle, #1a0b2e 0%, #090909 100%)',
      minHeight: '100vh', color: '#fff', fontFamily: 'Arial, sans-serif',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', color: '#ffcc00', textShadow: '0 0 20px #ffcc00', marginBottom: '10px' }}>
        MANSHON ROYAL SLOTS
      </h1>
      
      <div style={{ backgroundColor: '#222', padding: '20px', borderRadius: '15px', border: '5px solid #ffcc00', boxShadow: '0 0 50px rgba(255, 204, 0, 0.3)' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          {reels.map((s, i) => (
            <div key={i} style={{
              width: '100px', height: '120px', backgroundColor: '#000', borderRadius: '10px',
              fontSize: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #444', boxShadow: spinning ? 'inset 0 0 20px #ffcc00' : 'none'
            }}>
              {s}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <p style={{ fontSize: '20px' }}>Wallet: <span style={{ color: '#00ff00' }}>${balance}</span></p>
        <button 
          onClick={spin} 
          disabled={spinning}
          style={{
            padding: '15px 50px', fontSize: '24px', fontWeight: 'bold', cursor: 'pointer',
            background: 'linear-gradient(to bottom, #ffcc00, #ff9900)',
            border: 'none', borderRadius: '50px', boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
            transition: '0.2s', opacity: spinning ? 0.6 : 1
          }}>
          {spinning ? "SPINNING..." : "SPIN $20"}
        </button>
      </div>
    </div>
  );
}
