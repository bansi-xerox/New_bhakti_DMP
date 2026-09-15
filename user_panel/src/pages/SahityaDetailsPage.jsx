import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Folder, Music, ArrowRight, ArrowLeft, Search, X } from 'lucide-react';
import { getAllBhajans } from '../services/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';

const SahityaDetailsPage = () => {
  const { sahityaName } = useParams();
  const [combinedItems, setCombinedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, [sahityaName]);

  const fetchItems = async () => {
    try {
      const res = await getAllBhajans();
      const allItems = res.data.data || res.data || [];
      const items = allItems.filter(
        (item) => item.sahitya_name?.trim() === sahityaName
      );

      // ૧. Unique Headings ની યાદી
      const uniqueHeadings = [
        ...new Set(
          items
            .map((i) => i.heading_name?.trim())
            .filter(Boolean)
        ),
      ].map((heading) => ({
        type: 'heading',
        name: heading,
      }));

      // ૨. Direct Bhajans ની યાદી
      const directBhajans = items
        .filter((i) => !i.heading_name || i.heading_name.trim() === '')
        .map((bhajan) => ({
          type: 'bhajan',
          data: bhajan,
        }));

      setCombinedItems([...uniqueHeadings, ...directBhajans]);
    } catch (err) {
      console.error('Error fetching sahitya items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search Filter: શીર્ષક અથવા ભજનના નામ અને રાગ પરથી ફિલ્ટર થશે
  const filteredItems = combinedItems.filter((item) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();

    if (item.type === 'heading') {
      return item.name.toLowerCase().includes(query);
    }
    const b = item.data;
    return (
      b.bhajan_name?.toLowerCase().includes(query) ||
      b.bhajan_rag?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="user-app-layout">
      <Header />

      <main className="main-desktop-container">
       

        {/* Standalone Modern Searchbar */}
        <div className="standalone-search-container">
          <div className="search-input-wrapper wide-search-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input-box wide-search-input"
              placeholder={`${sahityaName} માં શીર્ષક અથવા ભજન શોધો...`}
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

         {/* Breadcrumb Back Bar
        <div className="subpage-back-bar">
          <button className="back-action-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> પાછા જાઓ
          </button>
          <span style={{ color: '#8d6e63', fontSize: '14px' }}>/ {sahityaName}</span>
        </div> */}

        {loading ? (
          <Loader />
        ) : filteredItems.length === 0 ? (
          <div className="empty-search-state">
            <p>કોઈ મેળ ખાતી વિગતો મળી નથી.</p>
            {searchTerm && (
              <button
                type="button"
                className="font-btn"
                onClick={() => setSearchTerm('')}
              >
                બધું સાહિત્ય દર્શાવો
              </button>
            )}
          </div>
        ) : (
          <div className="desktop-grid">
            {filteredItems.map((item, idx) => {
              // જો આ શીર્ષક (Heading) હોય તો (Arrow સાથે):
              if (item.type === 'heading') {
                return (
                  <div
                    key={`heading-${idx}`}
                    className="desktop-card"
                    onClick={() =>
                      navigate(
                        `/sahitya/${encodeURIComponent(sahityaName)}/heading/${encodeURIComponent(item.name)}`
                      )
                    }
                  >
                    <div>
                      <div className="card-title-row">
                        <h4 className="desktop-card-title">{item.name}</h4>
                        <ArrowRight size={18} className="title-arrow-icon" />
                      </div>
                    </div>
                  </div>
                );
              }

              // જો આ ભજન (Bhajan) હોય તો (Arrow વગર):
              const b = item.data;
              return (
                <div
                  key={b._id || `bhajan-${idx}`}
                  className="desktop-card"
                  onClick={() => navigate(`/bhajan/${b._id}`)}
                >
                  <div>
                    <h4 className="desktop-card-title">{b.bhajan_name?.trim()}</h4>
                    <p className="desktop-card-subtitle">
                      {b.bhajan_rag ? `રાગ: ${b.bhajan_rag}` : ''}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SahityaDetailsPage;