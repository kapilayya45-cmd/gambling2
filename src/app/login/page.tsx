"use client";
import React, { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // ఇక్కడ మీ ఫైర్‌బేస్ లేదా డేటాబేస్ లాజిక్ ఉండాలి
    alert(`Logging in with: ${email}`);
    window.location.href = "/games"; // లాగిన్ అయ్యాక గేమ్స్ పేజీకి వెళ్తుంది
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a' }}>
      <form onSubmit={handleLogin} style={{ backgroundColor: '#1e293b', padding: '40px', borderRadius: '15px', width: '350px', border: '1px solid #fbbf24' }}>
        <h2 style={{ color: '#fbbf24', textAlign: 'center', marginBottom: '20px' }}>Manshon Login</h2>
        <input 
          type="email" placeholder="Email" required 
          value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '5px', border: 'none' }}
        />
        <input 
          type="password" placeholder="Password" required 
          value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '5px', border: 'none' }}
        />
        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
          LOGIN
        </button>
      </form>
    </div>
  );
}
