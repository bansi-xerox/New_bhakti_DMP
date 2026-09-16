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
            style={{
              color: '#ffca28',
              fontWeight: '700',
              textDecoration: 'none',
              transition: 'color 0.25s ease',
              display: 'inline-block',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#ff8f00')}
            onMouseLeave={(e) => (e.target.style.color = '#ffca28')}
          >
            Devam TechHub
          </a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;