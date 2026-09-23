import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getAllBhajans } from '../services/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import UniversalSearchBar from '../components/common/UniversalSearchBar';
import '../assets/userTheme.css';
import SearchBar from '../components/common/SearchBar';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageFilterText, setPageFilterText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSahityaCategories();
  }, []);

  const fetchSahityaCategories = async () => {
    try {
      setLoading(true);
      const res = await getAllBhajans();
      const allItems = res.data.data || res.data || [];

      const uniqueNames = [
        ...new Set(
          allItems
            .map((item) => item.sahitya_name?.trim())
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

  const cleanString = (str) => {
    if (!str) return '';
    return str.replace(/[\s.,:;_'"+=\-!@#$%^&*()]+/g, '').toLowerCase();
  };

  const cleanQuery = cleanString(pageFilterText);
  const filteredCategories = categories.filter((c) =>
    !cleanQuery ? true : cleanString(c).includes(cleanQuery)
  );

  return (
    <div className="user-app-layout">
      <Header />

      <main className="main-desktop-container">
      {/* Reusable Search Bar */}
 <SearchBar 
    searchTerm={searchTerm} 
    setSearchTerm={setSearchTerm} 
    placeholder="સાહિત્ય શોધો (દા.ત. લોકભજન, પ્રભાતિયા, સંતવાણી)..." 
  />

        {/* 3. Categories Grid (Centered: 1000px) */}
<div id="sahitya-section" className="content-stage-centered" style={{ paddingTop: '5px' }}>          {loading ? (
            <Loader />
          ) : filteredCategories.length === 0 ? (
            <div className="empty-search-state">
              <p>કોઈ મેળ ખાતું સાહિત્ય મળ્યું નથી.</p>
            </div>
          ) : (
            <div className="desktop-grid">
              {filteredCategories.map((name, idx) => (
                <div
                  key={idx}
                  className="desktop-card"
                  onClick={() => navigate(`/sahitya/${encodeURIComponent(name)}`)}
                >
                  <div className="card-title-row">
                    <h3 className="desktop-card-title">{name}</h3>
                    <ArrowRight size={18} className="title-arrow-icon" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;