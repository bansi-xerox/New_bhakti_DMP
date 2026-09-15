import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Folder, Music, ArrowRight, ArrowLeft } from 'lucide-react';
import { getAllBhajans } from '../services/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';

const SahityaDetailsPage = () => {
  const { sahityaName } = useParams();
  const [combinedItems, setCombinedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, [sahityaName]);

  const fetchItems = async () => {
    try {
      const res = await getAllBhajans();
      const allItems = res.data.data || res.data || [];
      const items = allItems.filter(
        (item) => item.sahitya_name?.trim() === sahityaName
      );

      // ૧. Unique Headings ની યાદી
      const uniqueHeadings = [
        ...new Set(
          items
            .map((i) => i.heading_name?.trim())
            .filter(Boolean)
        ),
      ].map((heading) => ({
        type: 'heading',
        name: heading,
      }));

      // ૨. Direct Bhajans ની યાદી (જેમાં કોઈ હેડિંગ નથી)
      const directBhajans = items
        .filter((i) => !i.heading_name || i.heading_name.trim() === '')
        .map((bhajan) => ({
          type: 'bhajan',
          data: bhajan,
        }));

      // બંનેને એક જ લિસ્ટમાં ભેગા કરો (પહેલા શીર્ષક અને પછી ભજન)
      setCombinedItems([...uniqueHeadings, ...directBhajans]);
    } catch (err) {
      console.error('Error fetching sahitya items:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-app-layout">
      <Header />

      <main className="main-desktop-container">
        {/* Breadcrumb Back Bar */}
        <div className="subpage-back-bar">
          <button className="back-action-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> પાછા જાઓ
          </button>
          <span style={{ color: '#8d6e63', fontSize: '14px' }}>/ {sahityaName}</span>
        </div>

        {loading ? (
          <Loader />
        ) : combinedItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8d6e63' }}>
            <p style={{ fontSize: '17px' }}>કોઈ સાહિત્ય વિગતો મળી નથી.</p>
          </div>
        ) : (
          <div className="desktop-grid">
            {combinedItems.map((item, idx) => {
              // if (Heading) then:
              if (item.type === 'heading') {
                return (
                  <div
                    key={`heading-${idx}`}
                    className="desktop-card"
                    onClick={() =>
                      navigate(
                        `/sahitya/${encodeURIComponent(sahityaName)}/heading/${encodeURIComponent(item.name)}`
                      )
                    }
                  >
                    <div>
                      <div className="card-title-row">
                        <h4 className="desktop-card-title">{item.name}</h4>
                        {/* shirshak Arrow   */}
                        <ArrowRight size={18} className="title-arrow-icon" />
                      </div>
                    </div>
                  </div>
                );
              }

              // if (Bhajan)  then:
              const b = item.data;
              return (
                <div
                  key={b._id || `bhajan-${idx}`}
                  className="desktop-card"
                  onClick={() => navigate(`/bhajan/${b._id}`)}
                >
                  <div>
                    {/* bhajan- Arrow remove   */}
                    <h4 className="desktop-card-title">{b.bhajan_name?.trim()}</h4>
                    <p className="desktop-card-subtitle">
                      {b.bhajan_rag ? `રાગ: ${b.bhajan_rag}` : 'ભજન વાંચો'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SahityaDetailsPage;