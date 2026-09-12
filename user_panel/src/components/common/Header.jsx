import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const Header = () => {
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
            <p>પવિત્ર ભક્તિ સાહિત્ય સંગ્રહ</p>
          </div>
        </Link>
       
      </div>
    </header>
  );
};

export default Header;