import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getAllBhajans } from '../services/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import UniversalSearchBar from '../components/common/UniversalSearchBar';
import '../assets/userTheme.css';
import SearchBar from '../components/common/SearchBar';

const SahityaDetailsPage = () => {
  const { sahityaName } = useParams();
  const [combinedItems, setCombinedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageFilterText, setPageFilterText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, [sahityaName]);

  const fetchItems = async () => {
    try {
      setLoading(true);
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
      ].map((heading) => ({
        type: 'heading',
        name: heading,
      }));

      const directBhajans = items
        .filter((i) => !i.heading_name || i.heading_name.trim() === '')
        .map((bhajan) => ({
          type: 'bhajan',
          data: bhajan,
        }));

      setCombinedItems([...uniqueHeadings, ...directBhajans]);
    } catch (err) {
      console.error('Error fetching sahitya items:', err);
    } finally {
      setLoading(false);
    }
  };

  const cleanString = (str) => {
    if (!str) return '';
    return str.replace(/[\s.,:;_'"+=\-!@#$%^&*()]+/g, '').toLowerCase();
  };

  const cleanQuery = cleanString(pageFilterText);
  const filteredItems = combinedItems.filter((item) => {
    if (!cleanQuery) return true;
    if (item.type === 'heading') {
      return cleanString(item.name).includes(cleanQuery);
    }
    const b = item.data;
    return (
      cleanString(b.bhajan_name).includes(cleanQuery) ||
      cleanString(b.bhajan_rag).includes(cleanQuery)
    );
  });

  return (
    <div className="user-app-layout">
      <Header />

      <main className="main-desktop-container">
<<<<<<< HEAD
       <SearchBar 
    searchTerm={searchTerm} 
    setSearchTerm={setSearchTerm} 
    placeholder={`${sahityaName} માં શીર્ષક અથવા ભજન શોધો...`} 
  />

        {/* Content Centered Container (1000px) */}
        <div className="content-stage-centered" style={{ paddingTop: '5px' }}>
=======
        {/* Reusable Universal Sticky Search Bar */}
        <UniversalSearchBar
          placeholder={`${sahityaName} માં શીર્ષક અથવા ભજન શોધો...`}
          onSearchChangeExternal={setPageFilterText}
        />

        {/* Content Centered Container */}
        <div className="content-stage-centered">
>>>>>>> 8909c8b (-commited)
          {loading ? (
            <Loader />
          ) : filteredItems.length === 0 ? (
            <div className="empty-search-state">
              <p>કોઈ મેળ ખાતી વિગતો મળી નથી.</p>
            </div>
          ) : (
            <div className="desktop-grid">
              {filteredItems.map((item, idx) => {
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
                      <div className="card-title-row">
                        <h4 className="desktop-card-title">{item.name}</h4>
                        <ArrowRight size={18} className="title-arrow-icon" />
                      </div>
                    </div>
                  );
                }

                const b = item.data;
                return (
                  <div
                    key={b._id || `bhajan-${idx}`}
                    className="desktop-card"
                    onClick={() => navigate(`/bhajan/${b._id}`)}
                  >
                    <div className="card-title-row">
                      <h4 className="desktop-card-title">{b.bhajan_name?.trim()}</h4>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SahityaDetailsPage;