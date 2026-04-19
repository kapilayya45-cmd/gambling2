"use client";

import React, { useState } from 'react';

export default function WalletPage() {
  const [balance, setBalance] = useState(500);
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [tab, setTab] = useState("deposit");

  const handleAction = (type: string) => {
    if (!amount || Number(amount) <= 0) return alert("దయచేసి సరైన అమౌంట్ ఎంటర్ చేయండి");
    alert(`${type} రిక్వెస్ట్ పంపబడింది! అడ్మిన్ త్వరలో అప్రూవ్ చేస్తారు.`);
    setAmount("");
    setTransactionId("");
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ color: '#fbbf24' }}>💰 My Wallet</h1>
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px', marginBottom: '20px', border: '2px solid #fbbf24' }}>
          <p style={{ fontSize: '18px', margin: '0' }}>ప్రస్తుత బ్యాలెన్స్</p>
          <h2 style={{ fontSize: '36px', margin: '10px 0', color: '#fbbf24' }}>₹{balance}</h2>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => setTab("deposit")} style={{ flex: 1, padding: '10px', backgroundColor: tab === 'deposit' ? '#fbbf24' : '#334155', color: tab === 'deposit' ? '#000' : '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Deposit</button>
          <button onClick={() => setTab("withdraw")} style={{ flex: 1, padding: '10px', backgroundColor: tab === 'withdraw' ? '#fbbf24' : '#334155', color: tab === 'withdraw' ? '#000' : '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Withdraw</button>
        </div>

        {tab === "deposit" ? (
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px' }}>
            <h3>Scan & Pay</h3>
            <div style={{ width: '150px', height: '150px', backgroundColor: '#fff', margin: '10px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
              [QR CODE HERE]
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>పేమెంట్ చేసాక కింద వివరాలు ఇవ్వండి</p>
            <input type="number" placeholder="Enter Amount" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '5px', border: 'none' }} />
            <input type="text" placeholder="Transaction ID (UTR)" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: 'none' }} />
            <button onClick={() => handleAction("Deposit")} style={{ width: '100%', padding: '12px', backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Submit Deposit</button>
          </div>
        ) : (
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px' }}>
            <h3>Withdraw Money</h3>
            <input type="number" placeholder="Enter Amount" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '5px', border: 'none' }} />
            <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'left' }}>* కనీసం ₹200 ఉండాలి</p>
            <button onClick={() => handleAction("Withdraw")} style={{ width: '100%', padding: '12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Request Withdraw</button>
          </div>
        )}
      </div>
    </div>
  );
}
