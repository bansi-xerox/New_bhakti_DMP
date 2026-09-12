import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="royal-footer">
      <div className="footer-top-inner">
        {/* Column 1: Brand Info */}
        <div className="footer-brand">
          <h3>ભજન કીર્તન સાહિત્ય દર્શન</h3>
          <p>
            પરંપરાગત ભજનો, સંતવાણી, આખ્યાનો અને ભક્તિ સત્સંગનું એકીકૃત ડિજિટલ સાહિત્ય કેન્દ્ર.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-column">
          <h4>ઝડપી લિંક્સ</h4>
          <ul className="footer-links">
            <li><Link to="/">મુખ્ય પૃષ્ઠ (Home)</Link></li>
            <li><a href="#sahitya-section">સાહિત્ય સંગ્રહ</a></li>
            <li><a href="https://new-bhakti-dmp.vercel.app" target="_blank" rel="noreferrer">એડમિન પોર્ટલ</a></li>
          </ul>
        </div>

        {/* Column 3: Contact & Devotion */}
        <div className="footer-column">
          <h4>સત્સંગ પ્રેરણા</h4>
          <p style={{ fontSize: '14px', color: '#d7ccc8', lineHeight: '1.65', margin: 0 }}>
            "હરિ ભજતાં હજુ કોઈની લાજ જતાં નથી જાણી રે..." <br />
            ભક્તિરસનો આનંદ માણો અને પ્રભુના નામનો મહિમા વધારો.
          </p>
        </div>
      </div>

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