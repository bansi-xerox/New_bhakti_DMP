import React, { useEffect, useState } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
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

  const cleanString = (str) => {
    if (!str) return '';
    return str.replace(/[\s.,:;_'"+=\-!@#$%^&*()]+/g, '').toLowerCase();
  };

  const cleanSearchTerm = cleanString(searchTerm);
  
  const filteredBhajans = bhajans.filter((b) => {
    if (!cleanSearchTerm) return true;
    
    return (
      cleanString(b.bhajan_name).includes(cleanSearchTerm) ||
      cleanString(b.bhajan_rag).includes(cleanSearchTerm)
    );
  });

  return (
    <div className="user-app-layout">
      <Header />

      <main className="main-desktop-container">
        {/* Standalone Modern Searchbar with Voice */}
        <div className="standalone-search-container">
          <div className="search-input-wrapper wide-search-wrapper" style={{ position: 'relative' }}>
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input-box wide-search-input"
              placeholder={`${headingName} માં ભજન શોધો...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

        {/* Bhajans Grid (Arrow વગર) */}
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

      <Footer />
    </div>
  );
};

export default HeadingBhajansPage;