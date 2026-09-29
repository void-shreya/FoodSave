import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, onRetry = null }) => {
  if (!message) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '1rem 1.25rem',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: 'var(--radius-md)',
      color: '#991b1b',
      margin: '1rem 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-sm"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #fca5a5',
            color: '#b91c1c',
            fontWeight: 600
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
