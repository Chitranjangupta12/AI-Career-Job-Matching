import React from 'react';
import { Compass, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '2rem 1.5rem', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#4f46e5', fontWeight: 700 }}>
          <Compass size={20} />
          <span>AI-Powered Career Guidance & Intelligent Job Matching System</span>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Intelligent Career Guidance & Talent Matching Platform
        </div>
      </div>
    </footer>
  );
};

export default Footer;
