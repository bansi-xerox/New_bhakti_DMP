import React, { useState } from 'react';
import { Search, Mic, X } from 'lucide-react';

const SearchBar = ({ 
  searchTerm, 
  setSearchTerm, 
  placeholder = "શોધો...", 
  onFocus,
  onClear,
  children 
}) => {
  const [isListening, setIsListening] = useState(false);

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

  const handleClear = () => {
    setSearchTerm('');
    if (onClear) onClear();
  };

  return (
    <div className="standalone-search-container" style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '10px 20px', boxSizing: 'border-box' }}>
      <div className="search-input-wrapper wide-search-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '800px' }}>
        
        <Search className="search-icon" size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#888', zIndex: 2 }} />
        
        <input
          type="text"
          className="search-input-box wide-search-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={onFocus}
          style={{
            width: '100%',
            padding: '14px 85px 14px 48px', // Fixed Padding to prevent overlapping on both sides
            borderRadius: '30px',
            border: '1px solid #e0d4c8',
            boxSizing: 'border-box', // Prevents width overflow
            fontSize: '16px',
            outline: 'none',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            background: '#ffffff'
          }}
        />

        <div className="search-actions" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 2 }}>
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

        {/* For Live Dropdown Results */}
        {children}
        
      </div>
    </div>
  );
};

export default SearchBar;