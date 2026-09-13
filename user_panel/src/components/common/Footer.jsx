import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="royal-footer">
    
      {/* Copyright Bar */}
      <div className="footer-bottom-bar">
        <span>
          © {new Date().getFullYear()} All Rights Reserved | Designed & Developed with <Heart size={14} color="#ef5350" style={{ display: 'inline', verticalAlign: 'middle' }} /> by <strong>Devam Infotech</strong>
        </span>
      </div>
    </footer>
  );
};

export default Footer;