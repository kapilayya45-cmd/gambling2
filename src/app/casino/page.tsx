"use client";
import React, { useState } from 'react';

const symbols = ['🍎', '🍒', '🌟', '💎', '7️⃣'];

export default function CasinoPage() {
  const [reels, setReels] = useState(['🍎', '🍎', '🍎']);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState("మీ అదృష్టాన్ని పరీక్షించుకోండి!");
  const [balance, setBalance] = useState(1000);

  const spin = () => {
    if (balance < 10) {
      setMessage("బ్యాలెన్స్ లేదు!");
      return;
    }

    setSpinning(true);
    setBalance(prev => prev - 10);
    
    // స్పిన్నింగ్ ఎఫెక్ట్ కోసం చిన్న టైమర్
    setTimeout(() => {
      const newReels = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ];
      
      setReels(newReels);
      setSpinning(false);

      // విన్నింగ్ లాజిక్
      if (newReels[0] === newReels[1] && newReels[1] === newReels[2]) {
        setBalance(prev => prev + 100);
        setMessage("జాక్‌పాట్! 💰 +100 Credits");
      } else {
        setMessage("మళ్ళీ ప్రయత్నించండి!");
      }
    }, 1000);
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <h1>🎰 Manshon Casino Slots</h1>
      <p>Balance: <span style={{ color: '#ffd700', fontSize: '24px' }}>{balance}</span> Credits</p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '30px 0' }}>
        {reels.map((symbol, index) => (
          <div key={index} style={{
            width: '80px', height: '100px', backgroundColor: '#333', 
            fontSize: '40px', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', borderRadius: '8px', border: '3px solid #ffd700',
            animation: spinning ? 'blink 0.1s infinite' : 'none'
          }}>
            {symbol}
          </div>
        ))}
      </div>

      <button 
        onClick={spin} 
        disabled={spinning}
        style={{
          padding: '15px 40px', fontSize: '20px', backgroundColor: spinning ? '#666' : '#ffd700',
          color: 'black', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold'
        }}
      >
        {spinning ? "Spinning..." : "SPIN (10 Credits)"}
      </button>

      <h2 style={{ marginTop: '20px', color: '#ccc' }}>{message}</h2>

      <style jsx>{`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
