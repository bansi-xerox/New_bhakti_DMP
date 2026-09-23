import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BookOpen, Video } from 'lucide-react';
import { getBhajanById } from '../services/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import UniversalSearchBar from '../components/common/UniversalSearchBar';
import '../assets/userTheme.css';

const BhajanDetailPage = () => {
  const { id } = useParams();
  const [bhajan, setBhajan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lyrics');

  useEffect(() => {
    fetchBhajan();
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

  const bottomTabs = [
    ...(bhajan?.bhajan_bhavarth?.trim() && bhajan.bhajan_bhavarth.trim() !== '-'
      ? [{ id: 'bhavarth', label: 'ભજન ભાવાર્થ', icon: <BookOpen size={19} />, posClass: 'side-tooltip-bottom' }]
      : []),
    ...(bhajan?.youtube_link?.trim() && bhajan.youtube_link.trim() !== '-'
      ? [{ id: 'video', label: 'વિડીયો દર્શન', icon: <Video size={19} />, posClass: 'side-tooltip-bottom' }]
      : []),
  ];

  return (
    <div className="user-app-layout">
      <Header />

      <main className="main-desktop-container">
        {/* Reusable Universal Sticky Search Bar */}
        <UniversalSearchBar />

        {/* Bhajan Detail Stage */}
        {loading ? (
          <Loader />
        ) : !bhajan ? (
          <p style={{ textAlign: 'center', color: '#8d6e63', padding: '50px 0' }}>ભજન મળ્યું નથી.</p>
        ) : (
          <div className="bhajan-desktop-stage">
            <div className="stage-sticky-header">
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
                {/* Top Row: Left (Sahitya/Heading) & Right (Bhavarth/Video icons) */}
                <div className="stage-top-flex-row">
                  <div className="top-left-sahitya-header">
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

                  {bottomTabs.length > 0 && (
                    <div
                      className="top-right-actions-group"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {bottomTabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                          <div key={tab.id} className="adjacent-tab-wrapper">
                            <button
                              type="button"
                              className={`tab-pill-btn icon-tab-btn top-compact-btn ${isActive ? 'active' : ''}`}
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
                  )}
                </div>

                {/* Metadata Info */}
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
            </div>

            {/* Content Body */}
            <div className="stage-content-body">
              {activeTab === 'lyrics' && (
                <div className="lyrics-text-container" style={{ fontSize: '18px' }}>
                  {formatText(bhajan.bhajan) || 'લખાણ ઉપલબ્ધ નથી.'}
                </div>
              )}

              {activeTab === 'bhavarth' && bhajan.bhajan_bhavarth && (
                <div className="bhavarth-clean-content">
                  <p>{formatText(bhajan.bhajan_bhavarth)}</p>
                </div>
              )}

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