import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, ArrowRight, Sparkles, Music, Library, Compass } from 'lucide-react';
import { getAllBhajans } from '../services/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeNav, setActiveNav] = useState('all');
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
      {/* 1. Pure Header (No Navigation here) */}
      <Header />

      <main className="main-desktop-container">
        {/* 2. Hero Section with Integrated Navigation */}
        <section className="home-hero-banner">
          <div className="home-hero-top">
            <div>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '26px', color: '#2c1810', fontWeight: 800 }}>
                ભક્તિ અને સત્સંગ સાહિત્ય લાઇબ્રેરી
              </h2>
              <p style={{ margin: 0, color: '#795548', fontSize: '15px' }}>
                પ્રાચીન તેમજ અર્વાચીન ભજનો, પ્રભાતિયાં અને કીર્તનોનું પવિત્ર સંકલન.
              </p>
            </div>

            {/* Search Input Box */}
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                className="search-input-box"
                placeholder="સાહિત્ય શોધો (દા.ત. લોકભજન, રાસ-ગરબા)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Home Page Navigation Pills */}
          <div className="home-nav-pills">
            <button
              className={`nav-pill-btn ${activeNav === 'all' ? 'active' : ''}`}
              onClick={() => setActiveNav('all')}
            >
              <Library size={16} />
              <span>તમામ સાહિત્ય</span>
            </button>
            <button
              className={`nav-pill-btn ${activeNav === 'popular' ? 'active' : ''}`}
              onClick={() => setActiveNav('popular')}
            >
              <Music size={16} />
              <span>લોકપ્રિય ભજનો</span>
            </button>
            <button
              className={`nav-pill-btn ${activeNav === 'explore' ? 'active' : ''}`}
              onClick={() => setActiveNav('explore')}
            >
              <Compass size={16} />
              <span>વિશેષ સંગ્રહ</span>
            </button>
          </div>
        </section>

        {/* 3. Sahitya Cards Grid */}
        <div id="sahitya-section">
          <h3 style={{ fontSize: '20px', color: '#bf360c', marginBottom: '20px', fontWeight: 700 }}>
            📖 ઉપલબ્ધ સાહિત્ય વિભાગો ({filteredCategories.length})
          </h3>

          {loading ? (
            <Loader />
          ) : filteredCategories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#8d6e63' }}>
              <p style={{ fontSize: '17px' }}>કોઈ સાહિત્ય મળ્યું નથી.</p>
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
                    <div className="card-header-icon">
                      <BookOpen size={24} />
                    </div>
                    <h3 className="desktop-card-title">{name}</h3>
                    <p className="desktop-card-subtitle">સંપૂર્ણ ભજન અને કીર્તન સંગ્રહ</p>
                  </div>

                  <div className="card-footer-action">
                    <span>વિભાગ ખોલો</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 4. Devam Infotech Copyright Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;