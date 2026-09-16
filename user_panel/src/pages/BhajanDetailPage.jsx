import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Music, BookOpen, Video } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('lyrics');
  const [fontSize, setFontSize] = useState(19);

  useEffect(() => {
    fetchBhajan();
  }, [id]);

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

  const availableTabs = [
    { id: 'lyrics', label: 'ભજન લખાણ', icon: <Music size={22} /> },
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
            {/* Sticky Header with Clean Typography */}
            <div className="stage-sticky-header">
              <div className="stage-title-header clean-info-stage">
                
                {/* 1. સાહિત્યનું નામ - શીર્ષકનું નામ (Border/Background વગર સેન્ટરમાં) */}
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

                {/* 2. ભજન વિગતોની યાદી (Labels Bold, Values Normal, Uniform Size) */}
                <div className="uniform-info-block">
                  {/* ભજન અને પૃષ્ઠ */}
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

                  {/* કડી */}
                  {hasValue(bhajan.bhajan_kadi) && (
                    <div className="info-item">
                      <strong className="label-bold">કડી:</strong>
                      <span className="val-normal">{bhajan.bhajan_kadi.trim()}</span>
                    </div>
                  )}

                  {/* રાગ */}
                  {hasValue(bhajan.bhajan_rag) && (
                    <div className="info-item">
                      <strong className="label-bold">રાગ:</strong>
                      <span className="val-normal">{bhajan.bhajan_rag.trim()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Segmented Icon Tabs */}
              <div className="desktop-tab-bar icon-only-tab-bar">
                {availableTabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      className={`tab-pill-btn icon-tab-btn ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                      title={tab.label}
                      aria-label={tab.label}
                    >
                      {tab.icon}
                      <span className="tab-hover-tooltip">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Body */}
            <div className="stage-content-body">
              {/* 1. ભજન લખાણ */}
              {activeTab === 'lyrics' && (
                <div>
                  <div className="font-controls-bar">
                    <button className="font-btn" onClick={() => setFontSize((s) => Math.max(15, s - 2))}>A-</button>
                    <button className="font-btn" onClick={() => setFontSize((s) => Math.min(28, s + 2))}>A+</button>
                  </div>
                  <div className="lyrics-text-container" style={{ fontSize: `${fontSize}px` }}>
                    {formatText(bhajan.bhajan) || 'લખાણ ઉપલબ્ધ નથી.'}
                  </div>
                </div>
              )}

              {/* 2. ભજન ભાવાર્થ */}
              {activeTab === 'bhavarth' && bhajan.bhajan_bhavarth && (
                <div className="bhavarth-clean-content">
                  <h4>ભજન ભાવાર્થ:</h4>
                  <p>{formatText(bhajan.bhajan_bhavarth)}</p>
                </div>
              )}

              {/* 3. વિડીયો દર્શન */}
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