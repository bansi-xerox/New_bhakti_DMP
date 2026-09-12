import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBhajanById } from '../services/api';
import Header from '../components/common/Header';
import BottomNav from '../components/BottomNav';
import Loader from '../components/common/Loader';

const BhajanDetailPage = () => {
  const { id } = useParams();
  const [bhajan, setBhajan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lyrics'); // 'lyrics' | 'bhavarth' | 'video' | 'info'

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

  // Convert regular YouTube link to embed format
  const getEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : url;
  };

  const renderTabContent = () => {
    if (!bhajan) return null;

    switch (activeTab) {
      case 'lyrics':
        return (
          <div className="bhajan-detail-box">
            {bhajan.lyrics || bhajan.content || bhajan.bhajan_text || 'લખાણ ઉપલબ્ધ નથી.'}
          </div>
        );

      case 'bhavarth':
        return (
          <div className="bhajan-detail-box">
            <h4 style={{ color: '#bf360c', marginTop: 0 }}>🙏 ભજન ભાવાર્થ</h4>
            {bhajan.bhavarth || bhajan.meaning || bhajan.description || 'કોઈ ભાવાર્થ ઉપલબ્ધ નથી.'}
          </div>
        );

      case 'video':
        return (
          <div className="bhajan-detail-box" style={{ padding: '12px' }}>
            {bhajan.youtube_url || bhajan.video_url ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
                <iframe
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                  src={getEmbedUrl(bhajan.youtube_url || bhajan.video_url)}
                  title="YouTube video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#8d6e63' }}>વિડિયો ઉપલબ્ધ નથી.</p>
            )}
          </div>
        );

      case 'info':
        return (
          <div className="bhajan-detail-box">
            <h4 style={{ color: '#bf360c', marginTop: 0 }}>ℹ️ ભજનની માહિતી</h4>
            <p><strong>સાહિત્ય:</strong> {bhajan.sahitya_name || bhajan.sahitya || '-'}</p>
            <p><strong>વિભાગ / હેડિંગ:</strong> {bhajan.heading_name || bhajan.heading || '-'}</p>
            <p><strong>રચયિતા / સંત:</strong> {bhajan.author || bhajan.writer || 'પરંપરાગત'}</p>
            <p><strong>રાગ / ઢાળ:</strong> {bhajan.raag || '-'}</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="user-container">
      <Header title={bhajan ? (bhajan.title || bhajan.bhajan_name) : 'વિગત'} />

      <div className="content-body">
        {loading ? <Loader /> : renderTabContent()}
      </div>

      {/* 4 Navigation Tabs at bottom */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default BhajanDetailPage;