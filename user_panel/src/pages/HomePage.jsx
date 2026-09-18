import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, X, Mic } from 'lucide-react';
import { getAllBhajans } from '../services/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import '../assets/userTheme.css';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
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

  // Voice Search Handler (Gujarati)
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('તમારું બ્રાઉઝર વોઇસ સર્ચને સપોર્ટ કરતું નથી.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'gu-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
    };
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const filteredCategories = categories.filter((c) =>
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-app-layout">
      {/* 1. Header */}
      <Header />

      <main className="main-desktop-container">
        {/* 2. Standalone Modern Searchbar */}
        <div className="standalone-search-container">
          <div className="search-input-wrapper wide-search-wrapper" style={{ position: 'relative' }}>
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input-box wide-search-input"
              placeholder="સાહિત્ય શોધો (દા.ત. લોકભજન, પ્રભાતિયા, સંતવાણી)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Mic & Clear Buttons */}
            <div className="search-actions">
              <span
                className={isListening ? 'mic-active' : ''}
                style={{
                  color: isListening ? '#dc3545' : '#888',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'color 0.3s ease',
                }}
                onClick={handleVoiceSearch}
                title={isListening ? 'Listening...' : 'Search by Voice'}
              >
                <Mic size={18} />
              </span>

              {searchTerm && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear Search"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                    color: '#888',
                  }}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Categories Grid */}
        <div id="sahitya-section">
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
                  તમામ સાહિત્ય દર્શાવો
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

      {/* 4. Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;