import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, X } from 'lucide-react';
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
        {/* 2. Standalone Modern Searchbar */}
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
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* 3. Cards Grid (Balanced Padding) */}
        <div id="sahitya-section">
          {loading ? (
            <Loader />
          ) : filteredCategories.length === 0 ? (
            <div className="empty-search-state">
              <p>કોઈ મેળ ખાતું સાહિત્ય મળ્યું નથી.</p>
            </div>
          ) : (
            <div className="desktop-grid">
              {filteredCategories.map((name, idx) => (
                <div
                  key={idx}
                  className="desktop-card"
                  onClick={() => navigate(`/sahitya/${encodeURIComponent(name)}`)}
                >
                  <div className="card-title-row">
                    <h3 className="desktop-card-title">{name}</h3>
                    <ArrowRight size={18} className="title-arrow-icon" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 4. Sticky Bottom Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;