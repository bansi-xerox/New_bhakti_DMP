import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, BookOpen, Image, LogOut, ChevronRight, Sparkles } from 'lucide-react';
import { showConfirmDialog, showToastAlert } from './common/Alert';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const navigate = useNavigate();

  const navItems = [
    { id: 'bhajan-sahitya', label: 'Bhajan Sahitya', icon: <BookOpen size={19} /> },
    { id: 'gallery', label: 'Gallery', icon: <Image size={19} /> },
  ];

  const handleLogoutClick = async () => {
    const result = await showConfirmDialog({
      title: 'Are you sure?',
      text: 'Do you want to log out of your session?',
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      onLogout();
      await showToastAlert('Logout Successful');
      navigate('/');
    }
  };

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Sparkles size={20} />
        </div>
        <div className="brand-text">
          <span>Bhajan Kirtan</span>
          <small>Admin Portal</small>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="sidebar-nav-container">
        <span className="sidebar-section-title">MAIN MODULES</span>
        <ul className="sidebar-menu">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <li
                key={item.id}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <div className="item-content">
                  <span className="item-icon">{item.icon}</span>
                  <span className="item-label">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={16} className="active-arrow" />}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Bottom Footer / Logout */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogoutClick}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;