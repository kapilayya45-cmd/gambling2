"use client";
import React, { useState } from 'react';

export default function DiceGame() {
  const [dice, setDice] = useState(1);
  const [rolling, setRolling] = useState(false);

  const roll = () => {
    setRolling(true);
    setTimeout(() => {
      setDice(Math.floor(Math.random() * 6) + 1);
      setRolling(false);
    }, 600);
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ color: '#00ff00' }}>🎲 DICE LUCK</h1>
      <div style={{ fontSize: '100px', margin: '20px', animation: rolling ? 'spin 0.2s infinite' : 'none' }}>
        {dice === 1 && '⚀'} {dice === 2 && '⚁'} {dice === 3 && '⚂'}
        {dice === 4 && '⚃'} {dice === 5 && '⚄'} {dice === 6 && '⚅'}
      </div>
      <button onClick={roll} style={{ padding: '10px 30px', cursor: 'pointer', borderRadius: '5px' }}>ROLL DICE</button>
      <style>{`@keyframes spin { from {transform: rotate(0deg);} to {transform: rotate(360deg);} }`}</style>
    </div>
  );
}
