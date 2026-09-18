import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Video } from 'lucide-react';
import { getBhajanById } from '../services/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import '../assets/userTheme.css';

const BhajanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bhajan, setBhajan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lyrics'); // Default view is lyrics
  const [fontSize, setFontSize] = useState(19);

  useEffect(() => {
    fetchBhajan();
  }, [id]);

  // Fetch individual bhajan details by ID
  const fetchBhajan = async () => {
    try {
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

  // Convert standard YouTube links into embeddable URLs
  const getEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regExp);
    return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  // Convert literal \n escape characters into real line breaks
  const formatText = (text) => {
    if (!text) return '';
    return text.replace(/\\n/g, '\n');
  };

  // Helper to verify non-empty and non-dash values
  const hasValue = (val) => {
    if (val === null || val === undefined) return false;
    const str = String(val).trim();
    return str !== '' && str !== '-';
  };

  // Bottom Tab Bar: Only Bhavarth and Video tabs
  const bottomTabs = [
    ...(bhajan?.bhajan_bhavarth?.trim() && bhajan.bhajan_bhavarth.trim() !== '-'
      ? [{ id: 'bhavarth', label: 'ભજન ભાવાર્થ', icon: <BookOpen size={22} /> }]
      : []),
    ...(bhajan?.youtube_link?.trim() && bhajan.youtube_link.trim() !== '-'
      ? [{ id: 'video', label: 'વિડીયો દર્શન', icon: <Video size={22} /> }]
      : []),
  ];

  return (
    <div className="user-app-layout">
      <Header />

      <main className="main-desktop-container">
        {loading ? (
          <Loader />
        ) : !bhajan ? (
          <p style={{ textAlign: 'center', color: '#8d6e63', padding: '50px 0' }}>ભજન મળ્યું નથી.</p>
        ) : (
          <div className="bhajan-desktop-stage">
            {/* Sticky Stage Header */}
            <div className="stage-sticky-header">
              {/* Entire Info Area is clickable to trigger lyrics view */}
              <div
                className={`stage-title-header clean-info-stage clickable-lyrics-header ${
                  activeTab === 'lyrics' ? 'active-lyrics-header' : ''
                }`}
                onClick={() => setActiveTab('lyrics')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveTab('lyrics')}
                aria-label="ભજન લખાણ જોવા માટે ક્લિક કરો"
              >
                {/* 1. Centered Sahitya Name - Heading Name */}
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

                {/* 2. Bhajan Meta Info */}
                <div className="uniform-info-block">
                  {/* Bhajan Name and Page Number */}
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

                  {/* Kadi */}
                  {hasValue(bhajan.bhajan_kadi) && (
                    <div className="info-item">
                      <strong className="label-bold">કડી:</strong>
                      <span className="val-normal">{bhajan.bhajan_kadi.trim()}</span>
                    </div>
                  )}

                  {/* Raag */}
                  {hasValue(bhajan.bhajan_rag) && (
                    <div className="info-item">
                      <strong className="label-bold">રાગ:</strong>
                      <span className="val-normal">{bhajan.bhajan_rag.trim()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Bar: Tabs and Font Controls aligned together cleanly */}
              <div className="stage-actions-bar">
                {bottomTabs.length > 0 && (
                  <div className="desktop-tab-bar icon-only-tab-bar">
                    {bottomTabs.map((tab) => {
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          className={`tab-pill-btn icon-tab-btn ${isActive ? 'active' : ''}`}
                          onClick={() => setActiveTab(tab.id)}
                          aria-label={tab.label}
                        >
                          {tab.icon}
                          <span className="tab-hover-tooltip">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Font Controls moved here (Fixed at header, out of scrolling area) */}
                {activeTab === 'lyrics' && (
                  <div className="header-font-controls">
                    <button
                      type="button"
                      className="font-btn"
                      onClick={() => setFontSize((s) => Math.max(15, s - 2))}
                    >
                      A-
                    </button>
                    <button
                      type="button"
                      className="font-btn"
                      onClick={() => setFontSize((s) => Math.min(28, s + 2))}
                    >
                      A+
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Content Body: Zero top space, lyrics text starts immediately at the top */}
            <div className="stage-content-body">
              {/* 1. Lyrics View */}
              {activeTab === 'lyrics' && (
                <div className="lyrics-text-container" style={{ fontSize: `${fontSize}px` }}>
                  {formatText(bhajan.bhajan) || 'લખાણ ઉપલબ્ધ નથી.'}
                </div>
              )}

              {/* 2. Bhavarth View */}
              {activeTab === 'bhavarth' && bhajan.bhajan_bhavarth && (
                <div className="bhavarth-clean-content">
                  <h4>ભજન ભાવાર્થ:</h4>
                  <p>{formatText(bhajan.bhajan_bhavarth)}</p>
                </div>
              )}

              {/* 3. Video View */}
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
      </main>

      <Footer />
    </div>
  );
};

export default BhajanDetailPage;