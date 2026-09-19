import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, Download, Share2, X, RefreshCw } from 'lucide-react';
import { getGalleryItems, searchByFace } from '../services/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import '../assets/userTheme.css';

const GalleryPage = () => {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [availableYears, setAvailableYears] = useState([]);
  const [availableEvents, setAvailableEvents] = useState([]);

  // Modal Lightbox State
  const [activePhoto, setActivePhoto] = useState(null);

  // Face Recognition State
  const [faceSearching, setFaceSearching] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, []);

  // Fetch all gallery items from API
  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await getGalleryItems();
      const items = res.data?.data || res.data || [];
      setMediaList(items);

      // Extract unique years using 'main_folder_name' or 'event_date'
      const years = [
        ...new Set(
          items
            .map((item) => {
              if (item.main_folder_name && !isNaN(Number(item.main_folder_name))) {
                return String(item.main_folder_name).trim();
              }
              if (item.event_date || item.created_at) {
                const parsedYear = new Date(item.event_date || item.created_at).getFullYear();
                return isNaN(parsedYear) ? null : String(parsedYear);
              }
              return null;
            })
            .filter(Boolean)
        ),
      ].sort((a, b) => b - a);

      // Extract unique event/festival names using 'sub_folder_name'
      const events = [
        ...new Set(
          items
            .map((item) => item.sub_folder_name?.trim())
            .filter(Boolean)
        ),
      ];

      setAvailableYears(years);
      setAvailableEvents(events);
    } catch (err) {
      console.error('Error fetching gallery items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract the actual photo URL from API response
  const getPhotoUrl = (item) => {
    if (!item) return '';
    return item.photo_path || item.file_url || item.url || item.image || '';
  };

  // Helper to display clean event / festival name
  const getEventTitle = (item) => {
    if (!item) return '';
    const raw = item.sub_folder_name || item.event_name || item.title || '';
    return raw.replace(/_/g, ' ');
  };

  // Face Search Handler triggered from Header camera icon
  const handleFaceSearchFromHeader = async (file) => {
    if (!file) return;

    try {
      setFaceSearching(true);
      const formData = new FormData();
      formData.append('face', file);

      const res = await searchByFace(formData);
      const matched = res.data?.data || res.data || [];
      setMediaList(matched);
      setSelectedYear('');
      setSelectedEvent('');
    } catch (err) {
      console.error('Face recognition search error:', err);
      alert('ચહેરો ઓળખવામાં સમસ્યા આવી છે અથવા કોઈ મેળ ખાતો ફોટો મળ્યો નથી.');
    } finally {
      setFaceSearching(false);
    }
  };

  // Filter items based on selected Year and Event
  const filteredMedia = mediaList.filter((item) => {
    let matchYear = true;
    let matchEvent = true;

    if (selectedYear) {
      const itemYear =
        item.main_folder_name ||
        (item.event_date ? String(new Date(item.event_date).getFullYear()) : '');
      matchYear = String(itemYear).trim() === String(selectedYear).trim();
    }

    if (selectedEvent) {
      matchEvent = item.sub_folder_name?.trim() === selectedEvent.trim();
    }

    return matchYear && matchEvent;
  });

  // Download photo function
  const handleDownload = async (photoUrl, fileName = 'bhakti-darshan.jpg') => {
    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(photoUrl, '_blank');
    }
  };

  // Web Share API with fallback to copy link
  const handleShare = async (photo) => {
    const photoUrl = getPhotoUrl(photo);
    const title = getEventTitle(photo) || 'ભજન કીર્તન પોર્ટલ ગેલેરી દર્શન';

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: 'આ ભક્તિમય તસવીર જુઓ',
          url: photoUrl,
        });
      } catch {
        // Dismissed share
      }
    } else {
      navigator.clipboard.writeText(photoUrl);
      alert('ફોટો લિંક ક્લિપબોર્ડમાં કોપી થઈ ગઈ છે!');
    }
  };

  return (
    <div className="user-app-layout">
      {/* 1. Sticky Royal Header with Face Search Handler */}
      <Header onFaceSearch={handleFaceSearchFromHeader} faceSearching={faceSearching} />

      <main className="main-desktop-container">
        {/* Gallery Stage Box */}
        <div className="gallery-desktop-stage">
          {/* Top Filter Bar (Face button removed from here) */}
          <div className="gallery-filter-bar">
            <div className="gallery-select-group">
              {/* Year Filter */}
              <select
                className="gallery-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">બધા વર્ષ</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    વર્ષ: {yr}
                  </option>
                ))}
              </select>

              {/* Event / Festival Filter */}
              <select
                className="gallery-select"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                <option value="">બધા તહેવાર / ઉત્સવ</option>
                {availableEvents.map((evt) => (
                  <option key={evt} value={evt}>
                    {evt.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>

              {/* Reset Filters */}
              {(selectedYear || selectedEvent) && (
                <button
                  type="button"
                  className="gallery-reset-btn"
                  onClick={() => {
                    setSelectedYear('');
                    setSelectedEvent('');
                    fetchGallery();
                  }}
                  title="ફિલ્ટર ક્લીયર કરો"
                >
                  <RefreshCw size={15} />
                  <span>રીસેટ</span>
                </button>
              )}
            </div>
          </div>

          {/* Photo Grid Section */}
          <div className="gallery-content-body">
            {loading ? (
              <Loader />
            ) : filteredMedia.length === 0 ? (
              <div className="empty-search-state">
                <ImageIcon size={48} style={{ opacity: 0.35, marginBottom: 10 }} />
                <p>કોઈ તસવીરો ઉપલબ્ધ નથી.</p>
                <button
                  type="button"
                  className="font-btn"
                  onClick={() => {
                    setSelectedYear('');
                    setSelectedEvent('');
                    fetchGallery();
                  }}
                >
                  બધી તસવીરો દર્શાવો
                </button>
              </div>
            ) : (
              <div className="gallery-grid">
                {filteredMedia.map((photo, idx) => {
                  const imgUrl = getPhotoUrl(photo);
                  const label = getEventTitle(photo);

                  return (
                    <div
                      key={photo.id || photo._id || idx}
                      className="gallery-card"
                      onClick={() => setActivePhoto(photo)}
                    >
                      <div className="gallery-img-wrapper">
                        <img
                          src={imgUrl}
                          alt={label || 'Gallery Photo'}
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=Photo+Unavailable';
                          }}
                        />
                      </div>
                      {label && <div className="gallery-photo-label">{label}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="lightbox-overlay" onClick={() => setActivePhoto(null)}>
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setActivePhoto(null)}
              aria-label="Close"
            >
              <X size={22} />
            </button>

            <div className="lightbox-image-wrapper">
              <img
                src={getPhotoUrl(activePhoto)}
                alt={getEventTitle(activePhoto) || 'Enlarged View'}
              />
            </div>

            <div className="lightbox-actions-bar">
              <span className="lightbox-title">
                {getEventTitle(activePhoto) || 'ભજન કીર્તન દર્શન'}
              </span>

              <div className="lightbox-btns-group">
                <button
                  type="button"
                  className="lightbox-action-btn download-btn"
                  onClick={() =>
                    handleDownload(
                      getPhotoUrl(activePhoto),
                      `${getEventTitle(activePhoto) || 'bhajan-photo'}.jpg`
                    )
                  }
                  title="ડાઉનલોડ કરો"
                >
                  <Download size={18} />
                </button>

                <button
                  type="button"
                  className="lightbox-action-btn share-btn"
                  onClick={() => handleShare(activePhoto)}
                  title="શેર કરો"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default GalleryPage;