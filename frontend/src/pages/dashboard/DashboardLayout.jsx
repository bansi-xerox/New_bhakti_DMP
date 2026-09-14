import React, { useState, useContext } from 'react';
import Sidebar from '../../components/Sidebar';
import { AuthContext } from '../../context/AuthContext';
import { User } from 'lucide-react';

// Import Separated Module Pages
import BhajanSahitya from './bhajanSahitya/BhajanSahitya';
import Gallery from './gallery/Gallery';

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState('bhajan-sahitya');
  const { logout, user } = useContext(AuthContext);

  // Render content page dynamically based on active tab
  const renderActiveModule = () => {
    switch (activeTab) {
      case 'bhajan-sahitya':
        return <BhajanSahitya />;
      case 'gallery':
        return <Gallery />;
      default:
        return <BhajanSahitya />;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* 1. Left Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />

      {/* 2. Right Main View Container */}
      <div className="dashboard-main-area d-flex flex-column h-100 position-relative">
        
        {/* Top Right User Profile / Email (Since common header is removed) */}
        <div className="d-flex justify-content-end align-items-center px-4 pt-3 pb-2 flex-shrink-0">
          <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded-pill shadow-sm border">
            <div className="user-avatar rounded-circle bg-light p-1 d-flex align-items-center justify-content-center text-secondary">
              <User size={16} />
            </div>
            <span className="user-email fw-bold text-dark small">{user?.email_address || 'demo_2026@gmail.com'}</span>
          </div>
        </div>

        {/* Dynamic Page Render Area */}
        <main className="dashboard-content-body flex-grow-1 overflow-hidden p-3 pt-0">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;