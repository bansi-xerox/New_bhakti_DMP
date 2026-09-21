import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Search, X, Mic } from 'lucide-react';
import { getAllBhajans } from '../services/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import '../assets/userTheme.css';
import SearchBar from '../components/common/SearchBar';

const SahityaDetailsPage = () => {
  const { sahityaName } = useParams();
  const [combinedItems, setCombinedItems] = useState([]);
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
    fetchItems();
  }, [sahityaName]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await getAllBhajans();
      const allItems = res.data.data || res.data || [];
      setAllBhajansList(allItems);

      const items = allItems.filter(
        (item) => item.sahitya_name?.trim() === sahityaName
      );

      // 1. Unique Headings
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

      // 2. Direct Bhajans without heading
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

  const filteredItems = combinedItems.filter((item) => {
    if (!cleanSearchTerm || showDropdown) return true;

    if (item.type === 'heading') {
      return cleanString(item.name).includes(cleanSearchTerm);
    }

    const b = item.data;
    return (
      cleanString(b.bhajan_name).includes(cleanSearchTerm) ||
      cleanString(b.bhajan_rag).includes(cleanSearchTerm)
    );
  });

  return (
    <div className="user-app-layout">
      <Header />

      <main className="main-desktop-container">
       <SearchBar 
    searchTerm={searchTerm} 
    setSearchTerm={setSearchTerm} 
    placeholder={`${sahityaName} માં શીર્ષક અથવા ભજન શોધો...`} 
  />

        {/* Content Centered Container (1000px) */}
        <div className="content-stage-centered">
          {loading ? (
            <Loader />
          ) : !showDropdown && filteredItems.length === 0 ? (
            <div className="empty-search-state">
              <p>કોઈ મેળ ખાતી વિગતો મળી નથી.</p>
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
                  બધું સાહિત્ય દર્શાવો
                </button>
              )}
            </div>
          ) : (
            <div className="desktop-grid">
              {filteredItems.map((item, idx) => {
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

                const b = item.data;
                return (
                  <div
                    key={b._id || `bhajan-${idx}`}
                    className="desktop-card"
                    onClick={() => navigate(`/bhajan/${b._id}`)}
                  >
                    <div className="card-title-row">
                      <h4 className="desktop-card-title">{b.bhajan_name?.trim()}</h4>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SahityaDetailsPage;