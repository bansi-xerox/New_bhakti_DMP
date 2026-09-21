import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, X, Mic } from 'lucide-react';
import { getAllBhajans } from '../services/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import '../assets/userTheme.css';
import SearchBar from '../components/common/SearchBar';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
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
    fetchSahityaCategories();
  }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSahityaCategories = async () => {
    try {
      setLoading(true);
      const res = await getAllBhajans();
      const allItems = res.data.data || res.data || [];
      setAllBhajansList(allItems);

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

  const cleanString = (str) => {
    if (!str) return '';
    return str.replace(/[\s.,:;_'"+=\-!@#$%^&*()]+/g, '').toLowerCase();
  };

  // Live search handler with suggestions
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

  const filteredCategories = categories.filter((c) => {
    if (!cleanSearchTerm || showDropdown) return true;
    return cleanString(c).includes(cleanSearchTerm);
  });

  return (
    <div className="user-app-layout">
      {/* 1. Header */}
      <Header />

      <main className="main-desktop-container">
      {/* Reusable Search Bar */}
  <SearchBar 
    searchTerm={searchTerm} 
    setSearchTerm={setSearchTerm} 
    placeholder="સાહિત્ય શોધો (દા.ત. લોકભજન, પ્રભાતિયા, સંતવાણી)..." 
  />

  
        {/* 3. Categories Grid (Centered: 1000px) */}
        <div id="sahitya-section" className="content-stage-centered">
          {loading ? (
            <Loader />
          ) : !showDropdown && filteredCategories.length === 0 ? (
            <div className="empty-search-state">
              <p>કોઈ મેળ ખાતું સાહિત્ય મળ્યું નથી.</p>
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