import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User } from 'lucide-react';

const Header = ({ title }) => {
  const { user } = useContext(AuthContext);

  return (
    <header className="dashboard-header">
      <div className="header-title">
        <h2>{title}</h2>
      </div>
      <div className="header-user-info">
        <div className="user-avatar">
          <User size={18} />
        </div>
        <span className="user-email">{user?.email_address || 'Admin User'}</span>
      </div>
    </header>
  );
};

export default Header;