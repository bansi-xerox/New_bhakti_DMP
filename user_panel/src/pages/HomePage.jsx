import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, ArrowRight, X } from 'lucide-react';
import { getAllBhajans } from '../services/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import '../assets/userTheme.css';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSahityaCategories();
  }, []);

  const fetchSahityaCategories = async () => {
    try {
      const res = await getAllBhajans();
      const allItems = res.data.data || res.data || [];

      const uniqueNames = [
        ...new Set(
          allItems
            .map((item) => item.sahitya_name?.trim())
            .filter(Boolean)
        ),
      ];
      setCategories(uniqueNames);
    } catch (err) {
      console.error('Error loading Sahitya categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-app-layout">
      {/* 1. Sticky Royal Header */}
      <Header />

      <main className="main-desktop-container">
        {/* 2. Standalone Modern Searchbar (Hero removed) */}
        <div className="standalone-search-container">
          <div className="search-input-wrapper wide-search-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input-box wide-search-input"
              placeholder="સાહિત્ય શોધો (દા.ત. લોકભજન, પ્રભાતિયા, સંતવાણી)..."
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

        {/* 3. Enhanced Royal Section Header */}
        <div id="sahitya-section">
          <div className="section-title-wrapper">
            <div className="section-title-left">
              <span className="section-icon-badge">📖</span>
              <h3 className="section-main-heading">ઉપલબ્ધ સાહિત્ય વિભાગો</h3>
              <span className="section-count-pill">
                {filteredCategories.length} {filteredCategories.length === 1 ? 'વિભાગ' : 'વિભાગો'}
              </span>
            </div>
            <div className="section-heading-divider" />
          </div>

          {/* Cards Grid */}
          {loading ? (
            <Loader />
          ) : filteredCategories.length === 0 ? (
            <div className="empty-search-state">
              <p>કોઈ મેળ ખાતું સાહિત્ય મળ્યું નથી.</p>
              {searchTerm && (
                <button
                  type="button"
                  className="font-btn"
                  onClick={() => setSearchTerm('')}
                >
                  તમામ સાહિત્ય જુઓ
                </button>
              )}
            </div>
          ) : (
            <div className="desktop-grid">
              {filteredCategories.map((name, idx) => (
                <div
                  key={idx}
                  className="desktop-card"
                  onClick={() => navigate(`/sahitya/${encodeURIComponent(name)}`)}
                >
                  <div>
                    {/* <ArrowRight size={16} /> */}
                    <h3 className="desktop-card-title">{name}</h3>
                  </div>


                </div>
              ))}
            </div>
          )}
        </div>
      </main>

    </div>
  );
};

export default HomePage;