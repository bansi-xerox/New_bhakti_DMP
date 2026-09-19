import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, Download, Share2, X, RefreshCw, Play, Film } from 'lucide-react';
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
  const [activeMedia, setActiveMedia] = useState(null);

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

      // Extract unique years
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

      // Extract unique events
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

  // Helper to format date as DD-MM-YYYY
  const formatDateString = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return '';
    }
  };

  // Helper to clean and display event title
  const getEventTitle = (item) => {
    if (!item) return '';
    const raw = item.sub_folder_name || item.event_name || item.title || 'દર્શન';
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

  // Group media items by event and date
  const groupedMedia = filteredMedia.reduce((acc, item) => {
    const title = getEventTitle(item);
    const dateFormatted = formatDateString(item.event_date || item.created_at);
    const groupKey = dateFormatted ? `${title} (${dateFormatted})` : title;

    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {});

  // Download media function (Image or Video)
  const handleDownload = async (url, fileName = 'bhakti-media') => {
    try {
      const response = await fetch(url);
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
      window.open(url, '_blank');
    }
  };

  // Share handler
  const handleShare = async (media) => {
    const mediaUrl = media.video_path || media.photo_path || media.file_url || media.url;
    const title = getEventTitle(media);

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: 'આ ભક્તિ દર્શન જુઓ',
          url: mediaUrl,
        });
      } catch {
        // Dismiss
      }
    } else {
      navigator.clipboard.writeText(mediaUrl);
      alert('લિંક ક્લિપબોર્ડમાં કોપી થઈ ગઈ છે!');
    }
  };

  return (
    <div className="user-app-layout">
      {/* 1. Header with Face Search Handler */}
      <Header onFaceSearch={handleFaceSearchFromHeader} faceSearching={faceSearching} />

      <main className="main-desktop-container">
        <div className="gallery-desktop-stage">
          {/* Filters Bar */}
          <div className="gallery-filter-bar">
            <div className="gallery-select-group">
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
            </div>
          </div>

          {/* Grouped Photos & Videos Grid */}
          <div className="gallery-content-body custom-orange-scrollbar">
            {loading ? (
              <Loader />
            ) : Object.keys(groupedMedia).length === 0 ? (
              <div className="empty-search-state">
                <ImageIcon size={48} style={{ opacity: 0.35, marginBottom: 10 }} />
                <p>કોઈ તસવીરો કે વિડીયો ઉપલબ્ધ નથી.</p>
                <button
                  type="button"
                  className="font-btn"
                  onClick={() => {
                    setSelectedYear('');
                    setSelectedEvent('');
                    fetchGallery();
                  }}
                >
                  બધું દર્શાવો
                </button>
              </div>
            ) : (
              <div className="gallery-groups-container">
                {Object.entries(groupedMedia).map(([groupTitle, items], groupIndex) => (
                  <div key={groupIndex} className="gallery-group-section">
                    {/* Group Header: Event Name (Event Date)[cite: 30] */}
                    <div className="gallery-group-header">
                      <span className="gallery-group-title">{groupTitle}</span>
                      <span className="gallery-group-count">{items.length} દર્શન</span>
                    </div>

                    {/* Media Grid */}
                    <div className="gallery-grid">
                      {items.map((media, idx) => {
                        const isVideo = Boolean(media.video_path);
                        const mediaUrl = media.video_path || media.photo_path || media.file_url || media.url;

                        return (
                          <div
                            key={media.id || media._id || idx}
                            className="gallery-card clean-card"
                            onClick={() => setActiveMedia(media)}
                          >
                            <div className="gallery-img-wrapper">
                              {isVideo ? (
                                <div className="video-card-preview">
                                  <video src={mediaUrl} muted preload="metadata" />
                                  <div className="video-play-overlay">
                                    <div className="play-icon-circle">
                                      <Play size={20} fill="#ffffff" color="#ffffff" />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <img
                                  src={mediaUrl}
                                  alt={groupTitle}
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/300x200?text=Photo+Unavailable';
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Lightbox Modal (For Photos and Videos) */}
      {activeMedia && (
        <div className="lightbox-overlay" onClick={() => setActiveMedia(null)}>
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setActiveMedia(null)}
              aria-label="Close"
            >
              <X size={22} />
            </button>

            {/* Media Player / Viewer */}
            <div className="lightbox-image-wrapper">
              {activeMedia.video_path ? (
                <video
                  src={activeMedia.video_path}
                  controls
                  autoPlay
                  className="lightbox-video"
                />
              ) : (
                <img
                  src={activeMedia.photo_path || activeMedia.file_url || activeMedia.url}
                  alt={getEventTitle(activeMedia) || 'Enlarged View'}
                />
              )}
            </div>

            {/* Actions Bar */}
            <div className="lightbox-actions-bar">
              <span className="lightbox-title">
                {getEventTitle(activeMedia)}
                {formatDateString(activeMedia.event_date || activeMedia.created_at) && (
                  <span className="lightbox-date">
                    {' '}({formatDateString(activeMedia.event_date || activeMedia.created_at)})
                  </span>
                )}
              </span>

              <div className="lightbox-btns-group">
                <button
                  type="button"
                  className="lightbox-action-btn download-btn"
                  onClick={() =>
                    handleDownload(
                      activeMedia.video_path || activeMedia.photo_path || activeMedia.file_url || activeMedia.url,
                      `${getEventTitle(activeMedia)}.${activeMedia.video_path ? 'mp4' : 'jpg'}`
                    )
                  }
                  title="ડાઉનલોડ કરો"
                >
                  <Download size={18} />
                </button>

                <button
                  type="button"
                  className="lightbox-action-btn share-btn"
                  onClick={() => handleShare(activeMedia)}
                  title="શેર કરો"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default GalleryPage;