import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Music, BookOpen, Video, Info, ArrowLeft } from 'lucide-react';
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
      setBhajan(res.data.data || res.data);
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

  // Convert literal "\n" strings into real line breaks
  const formatText = (text) => {
    if (!text) return '';
    return text.replace(/\\n/g, '\n');
  };

  const tabs = [
    { id: 'lyrics', label: 'ભજન લખાણ', icon: <Music size={18} /> },
    { id: 'bhavarth', label: 'ભજન ભાવાર્થ', icon: <BookOpen size={18} /> },
    { id: 'video', label: 'વિડીયો દર્શન', icon: <Video size={18} /> },
    { id: 'info', label: 'સંપૂર્ણ માહિતી', icon: <Info size={18} /> },
  ];

  return (
    <div className="user-app-layout">
      {/* 1. Global Royal Header */}
      <Header />

      <main className="main-desktop-container">
        {/* Subpage Breadcrumb Back Bar */}
        <div className="subpage-back-bar">
          <button className="back-action-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> પાછા જાઓ
          </button>
          <span style={{ color: '#8d6e63', fontSize: '14.5px' }}>
            / {bhajan?.bhajan_name?.trim() || 'વિગત'}
          </span>
        </div>

        {loading ? (
          <Loader />
        ) : !bhajan ? (
          <p style={{ textAlign: 'center', color: '#8d6e63', padding: '60px 0' }}>ભજન મળ્યું નથી.</p>
        ) : (
          <div className="bhajan-desktop-stage">
            {/* 2. Sticky Stage Header (Title & Segmented Tabs અંદર ફિક્સ રહેશે) */}
            <div className="stage-sticky-header">
              <div className="stage-title-header">
                <h2>{bhajan.bhajan_name?.trim()}</h2>
                <div className="stage-badge-group">
                  {bhajan.sahitya_name && (
                    <span className="pill-badge">સાહિત્ય: {bhajan.sahitya_name.trim()}</span>
                  )}
                  {bhajan.bhajan_rag && (
                    <span className="pill-badge">રાગ: {bhajan.bhajan_rag.trim()}</span>
                  )}
                  {bhajan.page_no && (
                    <span className="pill-badge">પૃષ્ઠ: {bhajan.page_no}</span>
                  )}
                </div>
              </div>

              {/* Segmented Tab Bar */}
              <div className="desktop-tab-bar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`tab-pill-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Scrollable Tab Content Body (માત્ર આ જ ભાગ અંદર સ્ક્રોલ થશે) */}
            <div className="stage-content-body">
              {/* Lyrics Tab */}
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

              {/* Bhavarth Tab */}
              {activeTab === 'bhavarth' && (
                <div className="bhavarth-container">
                  <h4 style={{ color: '#bf360c', marginTop: 0, fontSize: '19px' }}>🙏 ભજન ભાવાર્થ / રહસ્ય:</h4>
                  {formatText(bhajan.bhajan_bhavarth) || 'આ ભજનનો ભાવાર્થ ઉપલબ્ધ નથી.'}
                </div>
              )}

              {/* YouTube Video Tab */}
              {activeTab === 'video' && (
                <div>
                  {bhajan.youtube_link ? (
                    <div className="video-responsive-frame">
                      <iframe
                        src={getEmbedUrl(bhajan.youtube_link)}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <p style={{ textAlign: 'center', color: '#8d6e63', padding: '50px 0', fontSize: '16px' }}>
                      આ ભજન માટે વિડીયો લિંક ઉપલબ્ધ નથી.
                    </p>
                  )}
                </div>
              )}

              {/* Info Tab */}
              {activeTab === 'info' && (
                <table className="info-detail-table">
                  <tbody>
                    <tr>
                      <td>સાહિત્યનું નામ</td>
                      <td>{bhajan.sahitya_name?.trim() || '-'}</td>
                    </tr>
                    <tr>
                      <td>શીર્ષક / વિભાગ</td>
                      <td>{bhajan.heading_name?.trim() || '-'}</td>
                    </tr>
                    <tr>
                      <td>ભજનનું નામ</td>
                      <td>{bhajan.bhajan_name?.trim() || '-'}</td>
                    </tr>
                    <tr>
                      <td>મુખ્ય કડી</td>
                      <td>{bhajan.bhajan_kadi?.trim() || '-'}</td>
                    </tr>
                    <tr>
                      <td>ભજનનો રાગ / ઢાળ</td>
                      <td>{bhajan.bhajan_rag?.trim() || '-'}</td>
                    </tr>
                    <tr>
                      <td>પૃષ્ઠ ક્રમાંક</td>
                      <td>{bhajan.page_no || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>

     
    </div>
  );
};

export default BhajanDetailPage;