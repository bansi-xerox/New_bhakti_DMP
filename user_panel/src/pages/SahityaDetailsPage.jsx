import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, FolderOpen, Music } from 'lucide-react';
import { getAllBhajans } from '../services/api';
import Header from '../components/common/Header';
import Loader from '../components/common/Loader';

const SahityaDetailsPage = () => {
  const { sahityaName } = useParams();
  const [headings, setHeadings] = useState([]);
  const [directBhajans, setDirectBhajans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSahityaItems();
  }, [sahityaName]);

  const fetchSahityaItems = async () => {
    try {
      const res = await getAllBhajans();
      const items = (res.data.data || res.data || []).filter(
        (item) => (item.sahitya_name || item.sahitya || item.category) === sahityaName
      );

      // Separate items that have sub-headings from direct bhajans
      const uniqueHeadings = [
        ...new Set(
          items
            .map((i) => i.heading_name || i.heading)
            .filter(Boolean)
        ),
      ];

      const direct = items.filter((i) => !(i.heading_name || i.heading));

      setHeadings(uniqueHeadings);
      setDirectBhajans(direct);
    } catch (err) {
      console.error('Error fetching sahitya items:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-container">
      <Header title={sahityaName} />

      <div className="content-body">
        {loading ? (
          <Loader />
        ) : (
          <>
            {/* 1. Sub-Headings Section (જો હોય તો) */}
            {headings.length > 0 && (
              <>
                <div className="section-label">વિભાગ / હેડિંગ</div>
                {headings.map((heading, idx) => (
                  <div
                    key={idx}
                    className="card-item"
                    onClick={() =>
                      navigate(
                        `/sahitya/${encodeURIComponent(sahityaName)}/heading/${encodeURIComponent(heading)}`
                      )
                    }
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FolderOpen size={20} color="#f57c00" />
                      <h4 className="card-title">{heading}</h4>
                    </div>
                    <ChevronRight size={18} color="#bcaaa4" />
                  </div>
                ))}
              </>
            )}

            {/* 2. Direct Bhajans Section */}
            {directBhajans.length > 0 && (
              <>
                <div className="section-label">ભજન સંગ્રહ</div>
                {directBhajans.map((b) => (
                  <div
                    key={b._id || b.id}
                    className="card-item"
                    onClick={() => navigate(`/bhajan/${b._id || b.id}`)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Music size={18} color="#e65100" />
                      <h4 className="card-title">{b.title || b.bhajan_name || b.name}</h4>
                    </div>
                    <ChevronRight size={18} color="#bcaaa4" />
                  </div>
                ))}
              </>
            )}

            {headings.length === 0 && directBhajans.length === 0 && (
              <p style={{ textAlign: 'center', color: '#8d6e63' }}>કોઈ ભજન મળ્યા નથી</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SahityaDetailsPage;