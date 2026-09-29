import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const DashboardLayout = ({ children, title = '', subtitle = '', action = null }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem', maxWidth: '1280px', overflowX: 'hidden' }}>
          {(title || action) && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div>
                {title && (
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {subtitle}
                  </p>
                )}
              </div>
              {action && <div>{action}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
