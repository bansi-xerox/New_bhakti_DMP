import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Music, ArrowLeft, Search, X } from 'lucide-react';
import { getAllBhajans } from '../services/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';

const HeadingBhajansPage = () => {
  const { sahityaName, headingName } = useParams();
  const [bhajans, setBhajans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  // Search Filter: ભજનનું નામ અથવા રાગ શોધશે
  const filteredBhajans = bhajans.filter((b) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return (
      b.bhajan_name?.toLowerCase().includes(query) ||
      b.bhajan_rag?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="user-app-layout">
      {/* 1. Sticky Royal Header */}
      <Header />

      <main className="main-desktop-container">


        {/* 2. Standalone Modern Searchbar */}
        <div className="standalone-search-container">
          <div className="search-input-wrapper wide-search-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input-box wide-search-input"
              placeholder={`${headingName} માં ભજન શોધો...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchTerm('')}
                aria-label="Clear Search"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* 3. Breadcrumb Back Bar */}
        {/* <div className="subpage-back-bar">
          <button
            className="back-action-btn"
            onClick={() => navigate(`/sahitya/${encodeURIComponent(sahityaName)}`)}
          >
            <ArrowLeft size={16} /> પાછા જાઓ
          </button>
          <span style={{ color: '#8d6e63', fontSize: '14px' }}>
            / {sahityaName} / <strong style={{ color: '#2c1810' }}>{headingName}</strong>
          </span>
        </div> */}

        {/* 4. Heading Details Title */}
        {/* <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', color: '#bf360c', margin: '0 0 6px 0', fontWeight: 800 }}>
            {headingName}
          </h2>
          <p style={{ margin: 0, color: '#795548', fontSize: '14.5px' }}>
            {sahityaName} હેઠળના ઉપલબ્ધ ભજનોની યાદી ({filteredBhajans.length})
          </p>
        </div> */}

        {/* 5. Bhajans Grid (Arrow વગર) */}
        {loading ? (
          <Loader />
        ) : filteredBhajans.length === 0 ? (
          <div className="empty-search-state">
            <p>કોઈ મેળ ખાતા ભજન મળ્યા નથી.</p>
            {searchTerm && (
              <button
                type="button"
                className="font-btn"
                onClick={() => setSearchTerm('')}
              >
                તમામ ભજનો દર્શાવો
              </button>
            )}
          </div>
        ) : (
          <div className="desktop-grid">
            {filteredBhajans.map((b) => (
              <div
                key={b._id}
                className="desktop-card"
                onClick={() => navigate(`/bhajan/${b._id}`)}
              >
                <div>
                  <h4 className="desktop-card-title">{b.bhajan_name?.trim()}</h4>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 6. Sticky Footer */}
      <Footer />
    </div>
  );
};

export default HeadingBhajansPage;