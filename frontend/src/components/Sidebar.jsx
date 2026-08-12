import React from 'react';
import { Music, BookOpen, Image, LogOut } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  // Add new module objects here in the future easily
  const navItems = [
    { id: 'bhajan-mala', label: 'Bhajan Mala', icon: <Music size={18} /> },
    { id: 'aakhyan-mala', label: 'Aakhyan Mala', icon: <BookOpen size={18} /> },
    { id: 'gallery', label: 'Gallery', icon: <Image size={18} /> },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-brand">🙏Bhajan Kirtan</div>
      <ul className="sidebar-menu">
        {navItems.map((item) => (
          <li
            key={item.id}
            className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
      <div className="sidebar-item" onClick={onLogout} style={{ borderTop: '1px solid #4e342e', color: '#ff8a80' }}>
        <LogOut size={18} />
        <span>Logout</span>
      </div>
    </div>
  );
};

export default Sidebar;