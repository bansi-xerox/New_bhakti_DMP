import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, X, Mic } from 'lucide-react'; // Added Mic icon import
import { getAllBhajans } from '../services/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import '../assets/userTheme.css';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New State for Voice Search
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

  // =========================================================
  // Voice Search Handler
  // =========================================================
  const handleVoiceSearch = () => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('તમારું બ્રાઉઝર વોઇસ સર્ચને સપોર્ટ કરતું નથી. (Your browser does not support voice search.)');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'gu-IN'; // Setting to Gujarati.
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript); // Set the search box text to spoken text
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const filteredCategories = categories.filter((c) =>
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <style>{`
        /* Pulse animation for active mic */
        @keyframes pulseMic {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .mic-active {
          color: #dc3545 !important; /* Red color when recording */
          animation: pulseMic 1.5s infinite;
        }

        /* Group the action icons inside the search bar */
        .search-actions {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 10;
        }

        .search-input-box {
          padding-right: 75px !important; /* Make room for the mic and X buttons */
        }
      `}</style>

      <div className="user-app-layout">
        {/* 1. Sticky Royal Header */}
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
              
              {/* Mic & Clear Buttons Container */}
              <div className="search-actions">
                {/* Voice Search Mic Icon */}
                <span
                  className={isListening ? "mic-active" : ""}
                  style={{
                    color: isListening ? '#dc3545' : '#888',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'color 0.3s ease'
                  }}
                  onClick={handleVoiceSearch}
                  title={isListening ? "Listening..." : "Search by Voice"}
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
                      color: '#888'
                    }}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
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
    </>
  );
};

export default HomePage;