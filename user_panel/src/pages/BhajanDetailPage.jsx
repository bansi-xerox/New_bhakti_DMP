import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, Video } from 'lucide-react';

import {
  getBhajanById,
  getAllBhajans
} from '../services/api';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import UniversalSearchBar from '../components/common/UniversalSearchBar';
import SearchBar from '../components/common/SearchBar';

import '../assets/userTheme.css';


const BhajanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [bhajan, setBhajan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lyrics');

  // Search states
  const [allBhajansList, setAllBhajansList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isListening, setIsListening] = useState(false);


  // =========================
  // Fetch Bhajan Details
  // =========================
  useEffect(() => {
    fetchBhajan();
    fetchAllBhajansData();
  }, [id]);


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


  // =========================
  // Fetch All Bhajans
  // =========================
  const fetchAllBhajansData = async () => {
    try {
      const res = await getAllBhajans();
      const list = res.data.data || res.data || [];

      setAllBhajansList(list);
    } catch (err) {
      console.error(
        'Error fetching all bhajans for search:',
        err
      );
    }
  };


  // =========================
  // Clean Search String
  // =========================
  const cleanString = (str) => {
    if (!str) return '';

    return str
      .replace(/[\s.,:;_'"+=\\\-!@#$%^&*()]+/g, '')
      .toLowerCase();
  };


  // =========================
  // Search Change
  // =========================
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


  // =========================
  // Clear Search
  // =========================
  const handleClearSearch = () => {
    setSearchResults([]);
    setShowDropdown(false);
    setSearchTerm('');
  };


  // =========================
  // Voice Search
  // =========================
  const handleVoiceSearch = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        'તમારું બ્રાઉઝર વોઇસ સર્ચને સપોર્ટ કરતું નથી.'
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = 'gu-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript;

      handleSearchChange(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };


  // =========================
  // Select Bhajan
  // =========================
  const handleSelectBhajan = (bhajanId) => {
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);

    navigate(`/bhajan/${bhajanId}`);
  };


  // =========================
  // YouTube Embed URL
  // =========================
  const getEmbedUrl = (url) => {
    if (!url) return '';

    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/
    );

    return match
      ? `https://www.youtube.com/embed/${match[1]}`
      : url;
  };


  // =========================
  // Format Text
  // =========================
  const formatText = (text) => {
    if (!text) return '';

    return text.replace(/\\n/g, '\n');
  };


  // =========================
  // Check Value
  // =========================
  const hasValue = (val) => {
    if (val === null || val === undefined) {
      return false;
    }

    const str = String(val).trim();

    return str !== '' && str !== '-';
  };


  // =========================
  // Bottom Tabs
  // =========================
  const bottomTabs = [
    ...(bhajan?.bhajan_bhavarth?.trim() &&
    bhajan.bhajan_bhavarth.trim() !== '-'
      ? [
          {
            id: 'bhavarth',
            label: 'ભજન ભાવાર્થ',
            icon: <BookOpen size={19} />,
            posClass: 'side-tooltip-bottom'
          }
        ]
      : []),

    ...(bhajan?.youtube_link?.trim() &&
    bhajan.youtube_link.trim() !== '-'
      ? [
          {
            id: 'video',
            label: 'વિડીયો દર્શન',
            icon: <Video size={19} />,
            posClass: 'side-tooltip-bottom'
          }
        ]
      : [])
  ];


  // =========================
  // RETURN
  // =========================
  return (
    <div className="user-app-layout">

      <Header />

      <main className="main-desktop-container">

        {/* Reusable Universal Sticky Search Bar */}
        <UniversalSearchBar />

        <div className="main-desktop-container">

          {/* Search */}
          <div
            className="bhajan-detail-search-container"
            ref={searchRef}
          >
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={handleSearchChange}
              onClear={handleClearSearch}
              placeholder="સાહિત્ય, શીર્ષક, ભજન, કડી કે રાગ શોધો..."
              onFocus={() =>
                searchTerm.trim() &&
                setShowDropdown(true)
              }
            >

              {/* Dropdown Results */}
              {showDropdown && (
                <div
                  className="live-search-dropdown"
                  style={{ paddingTop: '5px' }}
                >
                  {searchResults.length > 0 ? (
                    searchResults.map((item) => (
                      <div
                        key={item._id}
                        className="live-search-item"
                        onClick={() =>
                          handleSelectBhajan(item._id)
                        }
                      >

                        <div className="live-item-title">
                          {item.bhajan_name?.trim()}
                        </div>

                        <div className="live-item-meta">

                          {item.sahitya_name && (
                            <span>
                              સાહિત્ય:{' '}
                              <strong className="live-item-tag">
                                {item.sahitya_name.trim()}
                              </strong>
                            </span>
                          )}

                          {item.heading_name && (
                            <span>
                              વિભાગ:{' '}
                              <strong>
                                {item.heading_name.trim()}
                              </strong>
                            </span>
                          )}

                          {item.bhajan_rag && (
                            <span>
                              રાગ:{' '}
                              <strong>
                                {item.bhajan_rag.trim()}
                              </strong>
                            </span>
                          )}

                          {item.bhajan_kadi && (
                            <span>
                              કડી: "{item.bhajan_kadi.trim()}"
                            </span>
                          )}

                        </div>

                      </div>
                    ))
                  ) : (
                    <div className="no-results-item">
                      કોઈ મેળ ખાતું ભજન કે સાહિત્ય મળ્યું નથી.
                    </div>
                  )}
                </div>
              )}

            </SearchBar>
          </div>


          {/* Bhajan Detail Stage */}
          {loading ? (
            <Loader />

          ) : !bhajan ? (

            <p
              style={{
                textAlign: 'center',
                color: '#8d6e63',
                padding: '50px 0'
              }}
            >
              ભજન મળ્યું નથી.
            </p>

          ) : (

            <div className="bhajan-desktop-stage">

              <div className="stage-sticky-header">

                {/* Clickable Info Area */}
                <div
                  className={`stage-title-header clean-info-stage clickable-lyrics-header ${
                    activeTab === 'lyrics'
                      ? 'active-lyrics-header'
                      : ''
                  } ${
                    bottomTabs.length === 0
                      ? 'no-tabs-stage-header'
                      : ''
                  }`}

                  onClick={() =>
                    setActiveTab('lyrics')
                  }

                  role="button"
                  tabIndex={0}

                  onKeyDown={(e) => {
                    if (
                      e.key === 'Enter' ||
                      e.key === ' '
                    ) {
                      setActiveTab('lyrics');
                    }
                  }}

                  aria-label="ભજન લખાણ જોવા માટે ક્લિક કરો"
                >

                  {/* 1. Sahitya - Heading */}
                  {(
                    hasValue(bhajan.sahitya_name) ||
                    hasValue(bhajan.heading_name)
                  ) && (

                    <div className="center-sahitya-header">

                      {hasValue(bhajan.sahitya_name) && (
                        <span className="sahitya-txt">
                          {bhajan.sahitya_name.trim()}
                        </span>
                      )}

                      {hasValue(bhajan.sahitya_name) &&
                        hasValue(bhajan.heading_name) && (
                          <span className="divider-hyphen">
                            {' - '}
                          </span>
                        )}

                      {hasValue(bhajan.heading_name) && (
                        <span className="heading-txt">
                          {bhajan.heading_name.trim()}
                        </span>
                      )}

                    </div>
                  )}


                  {/* 2. Metadata Info */}
                  <div className="uniform-info-block">

                    <div className="info-row-split">

                      {hasValue(bhajan.bhajan_name) && (
                        <div className="info-item">

                          <strong className="label-bold">
                            ભજન:
                          </strong>

                          <span className="val-normal">
                            {bhajan.bhajan_name.trim()}
                          </span>

                        </div>
                      )}


                      {hasValue(bhajan.page_no) && (
                        <div className="info-item page-item">

                          <strong className="label-bold">
                            પૃષ્ઠ:
                          </strong>

                          <span className="val-normal">
                            {bhajan.page_no}
                          </span>

                        </div>
                      )}

                    </div>


                    {hasValue(bhajan.bhajan_kadi) && (
                      <div className="info-item">

                        <strong className="label-bold">
                          કડી:
                        </strong>

                        <span className="val-normal">
                          {bhajan.bhajan_kadi.trim()}
                        </span>

                      </div>
                    )}


                    {hasValue(bhajan.bhajan_rag) && (
                      <div className="info-item">

                        <strong className="label-bold">
                          રાગ:
                        </strong>

                        <span className="val-normal">
                          {bhajan.bhajan_rag.trim()}
                        </span>

                      </div>
                    )}

                  </div>


                  {/* Top Right Actions */}
                  {bottomTabs.length > 0 && (

                    <div
                      className="top-right-actions-group"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >

                      {bottomTabs.map((tab) => {

                        const isActive =
                          activeTab === tab.id;

                        return (

                          <div
                            key={tab.id}
                            className="adjacent-tab-wrapper"
                          >

                            <button
                              type="button"
                              className={`tab-pill-btn icon-tab-btn top-compact-btn ${
                                isActive
                                  ? 'active'
                                  : ''
                              }`}
                              onClick={() =>
                                setActiveTab(tab.id)
                              }
                              aria-label={tab.label}
                            >
                              {tab.icon}
                            </button>

                            <span
                              className={`adjacent-tooltip ${tab.posClass}`}
                            >
                              {tab.label}
                            </span>

                          </div>

                        );
                      })}

                    </div>
                  )}

                </div>


                {/* Metadata Info */}
                <div className="uniform-info-block">

                  <div className="info-row-split">

                    {hasValue(bhajan.bhajan_name) && (
                      <div className="info-item">

                        <strong className="label-bold">
                          ભજન:
                        </strong>

                        <span className="val-normal">
                          {bhajan.bhajan_name.trim()}
                        </span>

                      </div>
                    )}


                    {hasValue(bhajan.page_no) && (
                      <div className="info-item page-item">

                        <strong className="label-bold">
                          પૃષ્ઠ:
                        </strong>

                        <span className="val-normal">
                          {bhajan.page_no}
                        </span>

                      </div>
                    )}

                  </div>


                  {hasValue(bhajan.bhajan_kadi) && (
                    <div className="info-item">

                      <strong className="label-bold">
                        કડી:
                      </strong>

                      <span className="val-normal">
                        {bhajan.bhajan_kadi.trim()}
                      </span>

                    </div>
                  )}


                  {hasValue(bhajan.bhajan_rag) && (
                    <div className="info-item">

                      <strong className="label-bold">
                        રાગ:
                      </strong>

                      <span className="val-normal">
                        {bhajan.bhajan_rag.trim()}
                      </span>

                    </div>
                  )}

                </div>

              </div>

            </div>

          )}

        </div>

        <Footer />

      </main>

    </div>
  );
};


export default BhajanDetailPage;