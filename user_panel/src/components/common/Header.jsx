import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Header = ({ title, showBack = true }) => {
  const navigate = useNavigate();

  return (
    <header className="user-header">
      {showBack && (
        <button className="header-back-btn" onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
      )}
      <h2>{title || 'ભજન સાહિત્ય'}</h2>
    </header>
  );
};

export default Header;