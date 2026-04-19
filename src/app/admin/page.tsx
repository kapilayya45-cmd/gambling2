"use client";
import React, { useState } from 'react';

export default function AdminDashboard() {
  // డెమో డేటా - నిజానికి ఇవి డేటాబేస్ నుండి రావాలి
  const [users, setUsers] = useState([
    { id: 1, name: "Suresh", email: "suresh@mail.com", points: 500 },
    { id: 2, name: "Ramesh", email: "ramesh@mail.com", points: 1200 },
  ]);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [addAmount, setAddAmount] = useState(0);

  // పాయింట్స్ యాడ్ చేసే ఫంక్షన్
  const updatePoints = () => {
    if (!selectedUser) return alert("యూజర్‌ను సెలెక్ట్ చేయండి!");
    
    const updatedUsers = users.map(u => {
      if (u.id === selectedUser.id) {
        return { ...u, points: u.points + Number(addAmount) };
      }
      return u;
    });
    
    setUsers(updatedUsers);
    alert(`${addAmount} పాయింట్స్ యాడ్ చేయబడ్డాయి!`);
    setSelectedUser(null);
    setAddAmount(0);
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <h1 style={{ color: '#2c3e50' }}>🏰 Manshon Admin - Wallet Manager</h1>
      
      {/* పాయింట్స్ యాడ్ చేసే సెక్షన్ */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '18px' }}>Add Points to User</h2>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <select 
            onChange={(e) => setSelectedUser(users.find(u => u.id === Number(e.target.value)))}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', flex: 1 }}
          >
            <option value="">Select User</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name} (Bal: {u.points})</option>)}
          </select>
          <input 
            type="number" 
            placeholder="Amount" 
            value={addAmount}
            onChange={(e) => setAddAmount(Number(e.target.value))}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100px' }}
          />
          <button 
            onClick={updatePoints}
            style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
          >
            Add Points
          </button>
        </div>
      </div>

      {/* యూజర్ లిస్ట్ టేబుల్ */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>User Management</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#ecf0f1', textAlign: 'left' }}>
              <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Email</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Wallet Balance</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{user.name}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{user.email}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#2980b9' }}>{user.points} pts</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
