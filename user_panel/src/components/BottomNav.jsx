import React from 'react';
import { Music, BookOpen, Video, Info } from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'lyrics', label: 'ભજન', icon: <Music size={18} /> },
    { id: 'bhavarth', label: 'ભજન ભાવાર્થ', icon: <BookOpen size={18} /> },
    { id: 'video', label: 'યુટ્યુબ વિડીયો', icon: <Video size={18} /> },
    { id: 'info', label: 'ભજનની માહિતી', icon: <Info size={18} /> },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;