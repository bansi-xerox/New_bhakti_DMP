import React from 'react';

const Footer = () => {
  return (
    <footer className="royal-footer">
      {/* Copyright Bar */}
      <div className="footer-bottom-bar">
        <span>
          BDMP © {new Date().getFullYear()} All Rights Reserved | Developed by{' '}
          <a
            href="https://www.devamtechhub.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#ffca28',
              fontWeight: '700',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.target.style.textDecoration = 'bold')}
            onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
          >
            Devam TechHub
          </a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;