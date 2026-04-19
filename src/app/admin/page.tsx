import React from 'react';

export default function AdminPage() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: '#111827', fontSize: '28px', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
          Manshon House Book - Admin Panel
        </h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ padding: '20px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <h3 style={{ margin: '0', color: '#1e40af' }}>Total Users</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0' }}>1,250</p>
          </div>
          <div style={{ padding: '20px', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #d1fae5' }}>
            <h3 style={{ margin: '0', color: '#065f46' }}>Active Bets</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0' }}>84</p>
          </div>
        </div>

        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Live Matches Control</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
              <th style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Match</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Status</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>IPL: CSK vs RCB</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}><span style={{ color: '#059669', fontWeight: 'bold' }}>LIVE</span></td>
              <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                <button style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Stop Betting</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
