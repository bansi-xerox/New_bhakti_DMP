import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Music } from 'lucide-react';
import { getAllBhajans } from '../services/api';
import Header from '../components/common/Header';
import Loader from '../components/common/Loader';

const HeadingBhajansPage = () => {
  const { sahityaName, headingName } = useParams();
  const [bhajans, setBhajans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBhajansByHeading();
  }, [sahityaName, headingName]);

  const fetchBhajansByHeading = async () => {
    try {
      const res = await getAllBhajans();
      const matched = (res.data.data || res.data || []).filter(
        (item) =>
          (item.sahitya_name || item.sahitya || item.category) === sahityaName &&
          (item.heading_name || item.heading) === headingName
      );
      setBhajans(matched);
    } catch (err) {
      console.error('Error fetching heading bhajans:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-container">
      <Header title={headingName} />

      <div className="content-body">
        {loading ? (
          <Loader />
        ) : bhajans.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#8d6e63' }}>આ હેડિંગ હેઠળ કોઈ ભજન નથી</p>
        ) : (
          bhajans.map((b) => (
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
          ))
        )}
      </div>
    </div>
  );
};

export default HeadingBhajansPage;