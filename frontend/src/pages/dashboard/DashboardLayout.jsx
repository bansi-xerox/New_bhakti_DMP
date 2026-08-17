import React, { useState, useContext } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { AuthContext } from '../../context/AuthContext';

// Import Separated Module Pages
import BhajanMala from './BhajanMala';
import AakhyanMala from './AakhyanMala';
import Gallery from './gallery/Gallery';

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState('bhajan-mala');
  const { logout } = useContext(AuthContext);

  // Tab Titles mapping for Header
  const tabTitles = {
    'bhajan-mala': 'Bhajan Mala Module',
    'aakhyan-mala': 'Aakhyan Mala Module',
    'gallery': 'Gallery Module',
  };

  // Render content page dynamically based on active tab
  const renderActiveModule = () => {
    switch (activeTab) {
      case 'bhajan-mala':
        return <BhajanMala />;
      case 'aakhyan-mala':
        return <AakhyanMala />;
      case 'gallery':
        return <Gallery />;
      default:
        return <BhajanMala />;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* 1. Left Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />

      {/* 2. Right Main View Container */}
      <div className="dashboard-main-area">
        {/* Top Header Component */}
        <Header title={tabTitles[activeTab]} />

        {/* Dynamic Page Render Area */}
        <main className="dashboard-content-body">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;