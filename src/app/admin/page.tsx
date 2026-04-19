"use client";

import React, { useState } from 'react';

export default function AdminWalletPage() {
  const [requests, setRequests] = useState([
    { id: 1, user: "User_101", type: "Deposit", amount: 1000, utr: "123456789", status: "Pending" },
    { id: 2, user: "User_205", type: "Withdraw", amount: 500, utr: "-", status: "Pending" },
  ]);

  const handleStatus = (id: number, newStatus: string) => {
    setRequests(requests.map(req => req.id === id ? { ...req, status: newStatus } : req));
  };

  return (
    <div style={{ padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>🏦 Admin Wallet Requests</h1>
        
        <div style={{ marginTop: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e293b', color: '#fff', textAlign: 'left' }}>
                <th style={{ padding: '15px' }}>User ID</th>
                <th style={{ padding: '15px' }}>Type</th>
                <th style={{ padding: '15px' }}>Amount</th>
                <th style={{ padding: '15px' }}>Details (UTR)</th>
                <th style={{ padding: '15px' }}>Status</th>
                <th style={{ padding: '15px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '15px' }}>{req.user}</td>
                  <td style={{ padding: '15px', color: req.type === 'Deposit' ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>{req.type}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>₹{req.amount}</td>
                  <td style={{ padding: '15px', color: '#64748b', fontSize: '13px' }}>{req.utr}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ 
                      padding: '5px 10px', borderRadius: '20px', fontSize: '12px',
                      backgroundColor: req.status === 'Pending' ? '#fef3c7' : req.status === 'Approved' ? '#dcfce7' : '#fee2e2',
                      color: req.status === 'Pending' ? '#92400e' : req.status === 'Approved' ? '#166534' : '#991b1b'
                    }}>
                      {req.status}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    {req.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => handleStatus(req.id, "Approved")} style={{ backgroundColor: '#22c55e', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Approve</button>
                        <button onClick={() => handleStatus(req.id, "Rejected")} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
