import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Music, ArrowRight, ArrowLeft } from 'lucide-react';
import { getAllBhajans } from '../services/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';

const HeadingBhajansPage = () => {
  const { sahityaName, headingName } = useParams();
  const [bhajans, setBhajans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBhajans();
  }, [sahityaName, headingName]);

  const fetchBhajans = async () => {
    try {
      const res = await getAllBhajans();
      const allItems = res.data.data || res.data || [];
      const matched = allItems.filter(
        (item) =>
          item.sahitya_name?.trim() === sahityaName &&
          item.heading_name?.trim() === headingName
      );
      setBhajans(matched);
    } catch (err) {
      console.error('Error fetching bhajans:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-app-layout">
      {/* 1. Dedicated Header */}
      <Header />

      <main className="main-desktop-container">
        {/* 2. Subpage Breadcrumb Back Bar */}
        <div className="subpage-back-bar">
          <button
            className="back-action-btn"
            onClick={() => navigate(`/sahitya/${encodeURIComponent(sahityaName)}`)}
          >
            <ArrowLeft size={16} /> પાછા જાઓ
          </button>
          <span style={{ color: '#8d6e63', fontSize: '14px' }}>
            / {sahityaName} / <strong style={{ color: '#2c1810' }}>{headingName}</strong>
          </span>
        </div>

        {/* Heading Section Title */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', color: '#bf360c', margin: '0 0 6px 0', fontWeight: 800 }}>
            🎵 {headingName}
          </h2>
          <p style={{ margin: 0, color: '#795548', fontSize: '14.5px' }}>
            {sahityaName} હેઠળના ઉપલબ્ધ ભજનોની યાદી ({bhajans.length})
          </p>
        </div>

        {/* Content Section */}
        {loading ? (
          <Loader />
        ) : bhajans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8d6e63' }}>
            <p style={{ fontSize: '17px' }}>આ શીર્ષક હેઠળ કોઈ ભજન મળ્યા નથી.</p>
          </div>
        ) : (
          <div className="desktop-grid">
            {bhajans.map((b) => (
              <div
                key={b._id}
                className="desktop-card"
                onClick={() => navigate(`/bhajan/${b._id}`)}
              >
                <div>
                  <div className="card-header-icon">
                    <Music size={24} />
                  </div>
                  <h4 className="desktop-card-title">{b.bhajan_name?.trim()}</h4>
                  <p className="desktop-card-subtitle">
                    {b.bhajan_rag ? `રાગ: ${b.bhajan_rag}` : 'ભજન વિગતવાર વાંચો'}
                  </p>
                </div>
                <div className="card-footer-action">
                  <span>વાંચો & સાંભળો</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 3. Devam Infotech Copyright Footer */}
      <Footer />
    </div>
  );
};

export default HeadingBhajansPage;