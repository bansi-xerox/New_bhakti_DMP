import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Search, X, Mic } from 'lucide-react';
import { getAllBhajans } from '../services/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import '../assets/userTheme.css';

const SahityaDetailsPage = () => {
  const { sahityaName } = useParams();
  const [combinedItems, setCombinedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
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

  // Search Filter: શીર્ષક અથવા ભજનના નામ અને રાગ પરથી શોધશે
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
        {/* Standalone Modern Searchbar with Voice */}
        <div className="standalone-search-container">
          <div className="search-input-wrapper wide-search-wrapper" style={{ position: 'relative' }}>
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input-box wide-search-input"
              placeholder={`${sahityaName} માં શીર્ષક અથવા ભજન શોધો...`}
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
              // શીર્ષક (Heading) વાળા કાર્ડમાં Arrow સાથે
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
                    <div className="card-title-row">
                      <h4 className="desktop-card-title">{item.name}</h4>
                      <ArrowRight size={18} className="title-arrow-icon" />
                    </div>
                  </div>
                );
              }

              // ભજન (Bhajan) વાળા કાર્ડમાં Arrow વગર
              const b = item.data;
              return (
                <div
                  key={b._id || `bhajan-${idx}`}
                  className="desktop-card"
                  onClick={() => navigate(`/bhajan/${b._id}`)}
                >
                  <div className="card-title-row">
                    <h4 className="desktop-card-title">{b.bhajan_name?.trim()}</h4>
                    {b.bhajan_rag && (
                      <span style={{ fontSize: '13px', color: '#8d6e63' }}>
                        {b.bhajan_rag}
                      </span>
                    )}
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