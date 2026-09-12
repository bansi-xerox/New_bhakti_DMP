import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, BookMarked } from 'lucide-react';
import { getAllBhajans } from '../services/api';
import Header from '../components/common/Header';
import Loader from '../components/common/Loader';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUniqueSahitya();
  }, []);

  const fetchUniqueSahitya = async () => {
    try {
      const res = await getAllBhajans();
      const allItems = res.data.data || res.data || [];

      // Extract unique Sahitya (category) names
      const uniqueNames = [
        ...new Set(
          allItems
            .map((item) => item.sahitya_name || item.sahitya || item.category)
            .filter(Boolean)
        ),
      ];
      setCategories(uniqueNames);
    } catch (err) {
      console.error('Error loading Sahitya categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-container">
      <Header title="🙏 ભજન કીર્તન સાહિત્ય" showBack={false} />

      <div className="search-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="સાહિત્ય શોધો..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="content-body">
        {loading ? (
          <Loader />
        ) : filteredCategories.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#8d6e63' }}>કોઈ સાહિત્ય મળ્યું નથી</p>
        ) : (
          filteredCategories.map((name, idx) => (
            <div
              key={idx}
              className="card-item"
              onClick={() => navigate(`/sahitya/${encodeURIComponent(name)}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookMarked size={20} color="#e65100" />
                <h3 className="card-title">{name}</h3>
              </div>
              <ChevronRight size={18} color="#bcaaa4" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;