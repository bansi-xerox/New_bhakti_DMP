import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Image as ImageIcon } from 'lucide-react';
import '../../assets/userTheme.css';

const Header = () => {
  const location = useLocation();

  return (
    <header className="royal-header">
      <div className="royal-header-inner">
        {/* Brand Logo & Name */}
        <Link to="/" className="royal-brand-group">
          <div className="royal-brand-emblem">
            <Sparkles size={28} />
          </div>
          <div className="royal-brand-titles">
            <h1>ભજન કીર્તન પોર્ટલ</h1>
          </div>
        </Link>

        {/* Header Right Action: Gallery Icon Button */}
        <div className="header-right-actions">
          <Link
            to="/gallery"
            className={`header-gallery-btn ${location.pathname === '/gallery' ? 'active' : ''}`}
            title="ગેલેરી દર્શન"
            aria-label="ગેલેરી દર્શન"
          >
            <ImageIcon size={22} />
            <span className="gallery-btn-text">ગેલેરી</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;