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

  // Voice Search is now handled entirely inside the reusable component
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
      setSearchTerm(transcript); // Updates the search term in the parent page
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      setSearchTerm('');
    }
  };

  return (
    <div className="standalone-search-container" style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}>
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
            padding: '14px 85px 14px 48px', // Fixed padding prevents text overlapping icons
            borderRadius: '30px',
            border: '1px solid #e0d4c8',
            boxSizing: 'border-box',
            fontSize: '16px',
            outline: 'none',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            background: '#ffffff'
          }}
        />

        <div className="search-actions" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 2 }}>
          {/* Mic Button */}
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

          {/* Clear Button */}
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

        {/* This renders the Dropdown ONLY on the Bhajan Detail page */}
        {children}
        
      </div>
  );
};

export default SearchBar;