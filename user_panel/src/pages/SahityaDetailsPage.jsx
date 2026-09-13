import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Folder, Music, ArrowRight, ArrowLeft } from 'lucide-react';
import { getAllBhajans } from '../services/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';

const SahityaDetailsPage = () => {
  const { sahityaName } = useParams();
  const [headings, setHeadings] = useState([]);
  const [directBhajans, setDirectBhajans] = useState([]);
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

      const uniqueHeadings = [
        ...new Set(
          items
            .map((i) => i.heading_name?.trim())
            .filter(Boolean)
        ),
      ];

      const direct = items.filter((i) => !i.heading_name || i.heading_name.trim() === '');

      setHeadings(uniqueHeadings);
      setDirectBhajans(direct);
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
        {/* Subpage Breadcrumb Back Bar */}
        <div className="subpage-back-bar">
          <button className="back-action-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> પાછા જાઓ
          </button>
          <span style={{ color: '#8d6e63', fontSize: '14px' }}>/ {sahityaName}</span>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <>
            {headings.length > 0 && (
              <section style={{ marginBottom: '36px' }}>
                <h3 style={{ fontSize: '19px', color: '#bf360c', marginBottom: '16px' }}>
                  📁 વિભાગો / શીર્ષક ({headings.length})
                </h3>
                <div className="desktop-grid">
                  {headings.map((heading, idx) => (
                    <div
                      key={idx}
                      className="desktop-card"
                      onClick={() =>
                        navigate(
                          `/sahitya/${encodeURIComponent(sahityaName)}/heading/${encodeURIComponent(heading)}`
                        )
                      }
                    >
                      <div>
                        <div className="card-header-icon" style={{ background: '#fff3e0' }}>
                          <Folder size={24} color="#f57c00" />
                        </div>
                        <h4 className="desktop-card-title">{heading}</h4>
                        <p className="desktop-card-subtitle">આ વિભાગ હેઠળના ભજનો જુઓ</p>
                      </div>
                      <div className="card-footer-action">
                        <span>ભજનો જુઓ</span>
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {directBhajans.length > 0 && (
              <section>
                <h3 style={{ fontSize: '19px', color: '#e65100', marginBottom: '16px' }}>
                  🎵 ભજનો ({directBhajans.length})
                </h3>
                <div className="desktop-grid">
                  {directBhajans.map((b) => (
                    <div
                      key={b._id}
                      className="desktop-card"
                      onClick={() => navigate(`/bhajan/${b._id}`)}
                    >
                      <div>
                        <div className="card-header-icon">
                          <Music size={24} />
                        </div>
                        <h4 className="desktop-card-title">{b.bhajan_name?.trim()}</h4>
                        <p className="desktop-card-subtitle">
                          {b.bhajan_rag ? `રાગ: ${b.bhajan_rag}` : 'ભજન વિગતવાર વાંચો'}
                        </p>
                      </div>
                      <div className="card-footer-action">
                        <span>વાંચો & સાંભળો</span>
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      
    </div>
  );
};

export default SahityaDetailsPage;