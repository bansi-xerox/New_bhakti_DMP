import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, X, Mic } from 'lucide-react';
import { getAllBhajans } from '../services/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import '../assets/userTheme.css';

const HeadingBhajansPage = () => {
  const { sahityaName, headingName } = useParams();
  const [bhajans, setBhajans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Dropdown states
  const [allBhajansList, setAllBhajansList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const searchRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchBhajans();
  }, [sahityaName, headingName]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchBhajans = async () => {
    try {
      setLoading(true);
      const res = await getAllBhajans();
      const allItems = res.data.data || res.data || [];
      setAllBhajansList(allItems);

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

  const cleanString = (str) => {
    if (!str) return '';
    return str.replace(/[\s.,:;_'"+=\-!@#$%^&*()]+/g, '').toLowerCase();
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    const cleanQuery = cleanString(value);

    if (!cleanQuery) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const matched = allBhajansList.filter((item) => {
      return (
        cleanString(item.sahitya_name).includes(cleanQuery) ||
        cleanString(item.heading_name).includes(cleanQuery) ||
        cleanString(item.bhajan_name).includes(cleanQuery) ||
        cleanString(item.bhajan_kadi).includes(cleanQuery) ||
        cleanString(item.bhajan_rag).includes(cleanQuery)
      );
    });

    setSearchResults(matched.slice(0, 15));
    setShowDropdown(true);
  };

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
      handleSearchChange(transcript);
    };
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSelectBhajan = (bhajanId) => {
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);
    navigate(`/bhajan/${bhajanId}`);
  };

  const cleanSearchTerm = cleanString(searchTerm);

  const filteredBhajans = bhajans.filter((b) => {
    if (!cleanSearchTerm || showDropdown) return true;
    return (
      cleanString(b.bhajan_name).includes(cleanSearchTerm) ||
      cleanString(b.bhajan_rag).includes(cleanSearchTerm)
    );
  });

  return (
    <div className="user-app-layout">
      <Header />

      <main className="main-desktop-container">
        {/* Standalone Modern Searchbar (Centered: 1000px) */}
        <div className="standalone-search-container" ref={searchRef}>
          <div className="search-input-wrapper wide-search-wrapper" style={{ position: 'relative' }}>
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input-box wide-search-input"
              placeholder={`${headingName} માં ભજન શોધો...`}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => searchTerm.trim() && setShowDropdown(true)}
            />

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
                  onClick={() => {
                    setSearchTerm('');
                    setSearchResults([]);
                    setShowDropdown(false);
                  }}
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

            {/* Live Search Dropdown Suggestions */}
            {showDropdown && (
              <div className="live-search-dropdown">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <div
                      key={item._id}
                      className="live-search-item"
                      onClick={() => handleSelectBhajan(item._id)}
                    >
                      <div className="live-item-title">{item.bhajan_name?.trim()}</div>
                      <div className="live-item-meta">
                        {item.sahitya_name && (
                          <span>
                            સાહિત્ય: <strong className="live-item-tag">{item.sahitya_name.trim()}</strong>
                          </span>
                        )}
                        {item.heading_name && (
                          <span>
                            વિભાગ: <strong>{item.heading_name.trim()}</strong>
                          </span>
                        )}
                        {item.bhajan_rag && (
                          <span>
                            રાગ: <strong>{item.bhajan_rag.trim()}</strong>
                          </span>
                        )}
                        {item.bhajan_kadi && (
                          <span>કડી: "{item.bhajan_kadi.trim()}"</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results-item">કોઈ મેળ ખાતું ભજન કે સાહિત્ય મળ્યું નથી.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bhajans Grid (Centered: 1000px) */}
        <div className="content-stage-centered">
          {loading ? (
            <Loader />
          ) : !showDropdown && filteredBhajans.length === 0 ? (
            <div className="empty-search-state">
              <p>કોઈ મેળ ખાતા ભજન મળ્યા નથી.</p>
              {searchTerm && (
                <button
                  type="button"
                  className="font-btn"
                  onClick={() => {
                    setSearchTerm('');
                    setSearchResults([]);
                    setShowDropdown(false);
                  }}
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HeadingBhajansPage;