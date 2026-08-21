import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ fullPage = false, text = 'Loading data...' }) => {
  if (fullPage) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <Loader2 size={36} className="spinner-anim" style={{ color: '#4f46e5', animation: 'spin 1s linear infinite' }} />
        <div style={{ color: '#64748b', fontWeight: 500, fontSize: '0.95rem' }}>{text}</div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
      <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
      <span>{text}</span>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LoadingSpinner;
