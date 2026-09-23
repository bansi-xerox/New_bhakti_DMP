import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllBhajans } from '../services/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import UniversalSearchBar from '../components/common/UniversalSearchBar';
import '../assets/userTheme.css';

const HeadingBhajansPage = () => {
  const { sahityaName, headingName } = useParams();
  const [bhajans, setBhajans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageFilterText, setPageFilterText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBhajans();
  }, [sahityaName, headingName]);

  const fetchBhajans = async () => {
    try {
      setLoading(true);
      const res = await getAllBhajans();
      const allItems = res.data.data || res.data || [];

      const matched = allItems.filter(
        (item) =>
          item.sahitya_name?.trim() === sahityaName &&
          item.heading_name?.trim() === headingName
      );
      setBhajans(matched);
    } catch (err) {
      console.error('Error fetching bhajans:', err);
    } finally {
      setLoading(false);
    }
  };

  const cleanString = (str) => {
    if (!str) return '';
    return str.replace(/[\s.,:;_'"+=\-!@#$%^&*()]+/g, '').toLowerCase();
  };

  const cleanQuery = cleanString(pageFilterText);
  const filteredBhajans = bhajans.filter((b) => {
    if (!cleanQuery) return true;
    return (
      cleanString(b.bhajan_name).includes(cleanQuery) ||
      cleanString(b.bhajan_rag).includes(cleanQuery)
    );
  });

  return (
    <div className="user-app-layout">
      <Header />

      <main className="main-desktop-container">
        {/* Reusable Universal Sticky Search Bar */}
        <UniversalSearchBar
          placeholder={`${headingName} માં ભજન શોધો...`}
          onSearchChangeExternal={setPageFilterText}
        />

        {/* Bhajans Grid */}
        <div className="content-stage-centered">
          {loading ? (
            <Loader />
          ) : filteredBhajans.length === 0 ? (
            <div className="empty-search-state">
              <p>કોઈ મેળ ખાતા ભજન મળ્યા નથી.</p>
            </div>
          ) : (
            <div className="desktop-grid">
              {filteredBhajans.map((b) => (
                <div
                  key={b._id}
                  className="desktop-card"
                  onClick={() => navigate(`/bhajan/${b._id}`)}
                >
                  <div>
                    <h4 className="desktop-card-title">{b.bhajan_name?.trim()}</h4>
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

export default HeadingBhajansPage;