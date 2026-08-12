import React, { useState, useContext } from 'react';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('bhajan-mala');
  const { logout, user } = useContext(AuthContext);

  const renderContent = () => {
    switch (activeTab) {
      case 'bhajan-mala':
        return <h2>🎵 Bhajan Mala Module</h2>;
      case 'aakhyan-mala':
        return <h2>📖 Aakhyan Mala Module</h2>;
      case 'gallery':
        return <h2>🖼️ Gallary Module</h2>;
      default:
        return <h2>Welcome to Bhajan Kirtan Portal</h2>;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />
      <div className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3>Dashboard</h3>
          <span>Welcome, {user?.email_address || 'Admin'}</span>
        </header>
        <hr style={{ border: 'none', borderBottom: '1px solid #ffe0b2', marginBottom: '20px' }} />
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;