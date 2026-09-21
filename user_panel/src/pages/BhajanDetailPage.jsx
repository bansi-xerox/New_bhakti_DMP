import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Video, Search, Mic, X } from 'lucide-react';
import { getBhajanById, getAllBhajans } from '../services/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import '../assets/userTheme.css';
import SearchBar from '../components/common/SearchBar';


const BhajanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bhajan, setBhajan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lyrics');

  // Search States
  const [allBhajansList, setAllBhajansList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    fetchBhajan();
  }, [id]);

  useEffect(() => {
    fetchAllBhajansData();
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

  const fetchBhajan = async () => {
    try {
      setLoading(true);
      const res = await getBhajanById(id);
      const data = res.data.data || res.data;
      setBhajan(data);
      setActiveTab('lyrics');
    } catch (err) {
      console.error('Error fetching bhajan details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllBhajansData = async () => {
    try {
      const res = await getAllBhajans();
      const list = res.data.data || res.data || [];
      setAllBhajansList(list);
    } catch (err) {
      console.error('Error fetching all bhajans for search:', err);
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


  // Modify handleClear to close dropdown
  const handleClearSearch = () => {
    setSearchResults([]);
    setShowDropdown(false);
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
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSelectBhajan = (bhajanId) => {
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);
    navigate(`/bhajan/${bhajanId}`);
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regExp);
    return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const formatText = (text) => {
    if (!text) return '';
    return text.replace(/\\n/g, '\n');
  };

  const hasValue = (val) => {
    if (val === null || val === undefined) return false;
    const str = String(val).trim();
    return str !== '' && str !== '-';
  };

  // Check if Bhavarth or Video exists
  const bottomTabs = [
    ...(bhajan?.bhajan_bhavarth?.trim() && bhajan.bhajan_bhavarth.trim() !== '-'
      ? [{ id: 'bhavarth', label: 'ભજન ભાવાર્થ', icon: <BookOpen size={22} />, posClass: 'side-tooltip-left' }]
      : []),
    ...(bhajan?.youtube_link?.trim() && bhajan.youtube_link.trim() !== '-'
      ? [{ id: 'video', label: 'વિડીયો દર્શન', icon: <Video size={22} />, posClass: 'side-tooltip-right' }]
      : []),
  ];

  return (
    <>
      <style>{`
        @keyframes pulseMic {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        .mic-active {
          color: #dc3545 !important;
          animation: pulseMic 1.5s infinite;
        }
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
          padding-right: 75px !important;
        }
        .live-search-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: #ffffff;
          border: 1.5px solid var(--border-gold);
          border-radius: 14px;
          box-shadow: 0 10px 30px rgba(160, 64, 0, 0.12);
          max-height: 380px;
          overflow-y: auto;
          z-index: 150;
          padding: 6px 0;
        }
        .live-search-item {
          padding: 10px 18px;
          cursor: pointer;
          border-bottom: 1px solid #faeee0;
          transition: background 0.18s ease;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .live-search-item:last-child {
          border-bottom: none;
        }
        .live-search-item:hover {
          background: #fff8f0;
        }
        .live-item-title {
          font-size: 15px;
          font-weight: 700;
          color: #2c1810;
        }
        .live-item-meta {
          font-size: 12.5px;
          color: #795548;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .live-item-tag {
          color: #bf360c;
          font-weight: 600;
        }
        .no-results-item {
          padding: 18px;
          text-align: center;
          color: #8d6e63;
          font-size: 14px;
        }
      `}</style>

      <div className="user-app-layout">
        <Header />

        <main className="main-desktop-container">
          <div className="bhajan-detail-search-container" ref={searchRef}>
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={handleSearchChange}
              onClear={handleClearSearch}
              placeholder="સાહિત્ય, શીર્ષક, ભજન, કડી કે રાગ શોધો..."
              onFocus={() => searchTerm.trim() && setShowDropdown(true)}
            >

              {/* Dropdown Results */}
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
                            <span>સાહિત્ય: <strong className="live-item-tag">{item.sahitya_name.trim()}</strong></span>
                          )}
                          {item.heading_name && (
                            <span>વિભાગ: <strong>{item.heading_name.trim()}</strong></span>
                          )}
                          {item.bhajan_rag && (
                            <span>રાગ: <strong>{item.bhajan_rag.trim()}</strong></span>
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
            </SearchBar>
          </div>

          {/* Bhajan Detail Stage */}
          {loading ? (
            <Loader />
          ) : !bhajan ? (
            <p style={{ textAlign: 'center', color: '#8d6e63', padding: '50px 0' }}>ભજન મળ્યું નથી.</p>
          ) : (
            <div className="bhajan-desktop-stage">
              <div className="stage-sticky-header">
                {/* Clickable Info Area */}
                <div
                  className={`stage-title-header clean-info-stage clickable-lyrics-header ${activeTab === 'lyrics' ? 'active-lyrics-header' : ''
                    } ${bottomTabs.length === 0 ? 'no-tabs-stage-header' : ''}`}
                  onClick={() => setActiveTab('lyrics')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveTab('lyrics')}
                  aria-label="ભજન લખાણ જોવા માટે ક્લિક કરો"
                >
                  {/* 1. Sahitya - Heading */}
                  {(hasValue(bhajan.sahitya_name) || hasValue(bhajan.heading_name)) && (
                    <div className="center-sahitya-header">
                      {hasValue(bhajan.sahitya_name) && (
                        <span className="sahitya-txt">{bhajan.sahitya_name.trim()}</span>
                      )}
                      {hasValue(bhajan.sahitya_name) && hasValue(bhajan.heading_name) && (
                        <span className="divider-hyphen"> - </span>
                      )}
                      {hasValue(bhajan.heading_name) && (
                        <span className="heading-txt">{bhajan.heading_name.trim()}</span>
                      )}
                    </div>
                  )}

                  {/* 2. Metadata Info */}
                  <div className="uniform-info-block">
                    <div className="info-row-split">
                      {hasValue(bhajan.bhajan_name) && (
                        <div className="info-item">
                          <strong className="label-bold">ભજન:</strong>
                          <span className="val-normal">{bhajan.bhajan_name.trim()}</span>
                        </div>
                      )}
                      {hasValue(bhajan.page_no) && (
                        <div className="info-item page-item">
                          <strong className="label-bold">પૃષ્ઠ:</strong>
                          <span className="val-normal">{bhajan.page_no}</span>
                        </div>
                      )}
                    </div>

                    {hasValue(bhajan.bhajan_kadi) && (
                      <div className="info-item">
                        <strong className="label-bold">કડી:</strong>
                        <span className="val-normal">{bhajan.bhajan_kadi.trim()}</span>
                      </div>
                    )}

                    {hasValue(bhajan.bhajan_rag) && (
                      <div className="info-item">
                        <strong className="label-bold">રાગ:</strong>
                        <span className="val-normal">{bhajan.bhajan_rag.trim()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Bar: Jo bottomTabs hoy to j render thase, nathi to completely remove thai jase! */}
                {bottomTabs.length > 0 && (
                  <div className="stage-actions-bar">
                    <div className="desktop-tab-bar icon-only-tab-bar">
                      {bottomTabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                          <div key={tab.id} className="adjacent-tab-wrapper">
                            <button
                              type="button"
                              className={`tab-pill-btn icon-tab-btn ${isActive ? 'active' : ''}`}
                              onClick={() => setActiveTab(tab.id)}
                              aria-label={tab.label}
                            >
                              {tab.icon}
                            </button>
                            <span className={`adjacent-tooltip ${tab.posClass}`}>
                              {tab.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Content Body */}
              <div className={`stage-content-body ${bottomTabs.length === 0 ? 'no-tabs-body-padding' : ''}`}>
                {/* Lyrics */}
                {activeTab === 'lyrics' && (
                  <div className="lyrics-text-container" style={{ fontSize: '18px' }}>
                    {formatText(bhajan.bhajan) || 'લખાણ ઉપલબ્ધ નથી.'}
                  </div>
                )}

                {/* Bhavarth */}
                {activeTab === 'bhavarth' && bhajan.bhajan_bhavarth && (
                  <div className="bhavarth-clean-content">
                    <p>{formatText(bhajan.bhajan_bhavarth)}</p>
                  </div>
                )}

                {/* Video */}
                {activeTab === 'video' && bhajan.youtube_link && (
                  <div className="video-responsive-frame">
                    <iframe
                      src={getEmbedUrl(bhajan.youtube_link)}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </main >

        <Footer />
      </div >
    </>
  );
};

export default BhajanDetailPage;