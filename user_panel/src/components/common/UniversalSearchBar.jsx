import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Mic } from 'lucide-react';
import { getAllBhajans } from '../../services/api';
import '../../styles/searchBar.css';

const UniversalSearchBar = ({
  placeholder = 'સાહિત્ય, શીર્ષક, ભજન, કડી કે રાગ શોધો...',
  onSearchChangeExternal = null
}) => {
  const [allBhajansList, setAllBhajansList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBhajansList();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchBhajansList = async () => {
    try {
      const res = await getAllBhajans();
      const list = res.data?.data || res.data || [];
      setAllBhajansList(list);
    } catch (err) {
      console.error('Error fetching bhajans:', err);
    }
  };

  const cleanString = (str) => {
    if (!str) return '';
    return str.replace(/[\s.,:;_'"+=\-!@#$%^&*()]+/g, '').toLowerCase();
  };

  const handleSearchInput = (value) => {
    setSearchTerm(value);
    if (onSearchChangeExternal) {
      onSearchChangeExternal(value);
    }

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
      handleSearchInput(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSelectBhajan = (bhajanId) => {
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);
    if (onSearchChangeExternal) onSearchChangeExternal('');
    navigate(`/bhajan/${bhajanId}`);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);
    if (onSearchChangeExternal) onSearchChangeExternal('');
  };

  return (
    <div className="sticky-search-outer-shell" ref={searchRef}>
      <div className="wide-search-wrapper">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          className="wide-search-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleSearchInput(e.target.value)}
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
              onClick={handleClear}
              aria-label="Clear Search"
            >
              <X size={15} />
            </button>
          )}
        </div>

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
  );
};

export default UniversalSearchBar;