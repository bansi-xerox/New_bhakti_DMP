import React, { useState, useEffect, useMemo } from 'react';
import { getGalleryItems, deleteGalleryMedia } from '../../../services/api';
import { showGalleryToast, showErrorAlert, confirmMediaDelete } from '../../../components/common/Alert';
import GalleryModal from './GalleryModal';

const BASE_SERVER_URL = 'http://localhost:5000/uploads/'; 

const formatMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${BASE_SERVER_URL}${path.replace(/^\/+/, '')}`;
};

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(null);

  const [selectedFolder, setSelectedFolder] = useState('All');
  const [selectedSubFolder, setSelectedSubFolder] = useState('All');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState([]);
  
  // State to track hovered media
  const [hoveredMediaId, setHoveredMediaId] = useState(null);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      setLoading(true);
      const res = await getGalleryItems();
      if (res.data?.success) {
        setItems(res.data.data || []);
      }
    } catch (err) {
      showErrorAlert('Fetch Error', 'Failed to load gallery items');
    } finally {
      setLoading(false);
    }
  };

  const folders = useMemo(() => {
    const main = [...new Set(items.map((i) => i.main_folder_name).filter(Boolean))];
    return ['All', ...main];
  }, [items]);

  const subFolders = useMemo(() => {
    if (selectedFolder === 'All') return ['All'];
    const subs = [
      ...new Set(
        items
          .filter((i) => i.main_folder_name === selectedFolder)
          .map((i) => i.sub_folder_name)
          .filter(Boolean)
      ),
    ];
    return ['All', ...subs];
  }, [items, selectedFolder]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchMain = selectedFolder === 'All' || item.main_folder_name === selectedFolder;
      const matchSub = selectedSubFolder === 'All' || item.sub_folder_name === selectedSubFolder;
      const isPhoto = Boolean(item.photo_path);
      const matchType =
        filterType === 'ALL' ||
        (filterType === 'Photos' && isPhoto) ||
        (filterType === 'Videos' && !isPhoto);
      return matchMain && matchSub && matchType;
    });
  }, [items, selectedFolder, selectedSubFolder, filterType]);

  const handleDeleteSingle = async (e, item) => {
    e.stopPropagation();
    const type = item.photo_path ? 'photo' : 'video';
    const confirm = await confirmMediaDelete(`Do you want to delete this ${type}?`);

    if (confirm.isConfirmed) {
      try {
        const res = await deleteGalleryMedia([item.id]);
        if (res.data?.success) {
          showGalleryToast(res.data.message || 'Media deleted successfully');
          setSelectedIds((prev) => prev.filter((id) => id !== item.id));
          loadGallery();
        }
      } catch (err) {
        showErrorAlert('Delete Error', err.response?.data?.message || err.message);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirm = await confirmMediaDelete(`Delete selected ${selectedIds.length} items?`);
    if (confirm.isConfirmed) {
      try {
        const res = await deleteGalleryMedia(selectedIds);
        if (res.data?.success) {
          showGalleryToast(res.data.message || 'Items deleted successfully');
          setSelectedIds([]);
          loadGallery();
        }
      } catch (err) {
        showErrorAlert('Delete Error', err.response?.data?.message || err.message);
      }
    }
  };

  const toggleSelectId = (e, id) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="container-fluid p-4 min-vh-100" style={{ backgroundColor: '#f4f6f9' }}>
      
      {/* 
        PREMIUM THEME STYLES: 
        Added gradients, soft drop-shadows (shading), and smooth hover lift effects 
      */}
      <style>{`
        .theme-orange-gradient { 
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%) !important; 
          color: white !important; 
          border: none !important;
          box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25) !important;
          transition: all 0.3s ease !important;
        }
        .theme-orange-gradient:hover { 
          background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%) !important; 
          box-shadow: 0 6px 16px rgba(234, 88, 12, 0.4) !important;
          transform: translateY(-2px);
        }
        .theme-orange-outline { 
          border: 1.5px solid #ea580c !important; 
          color: #ea580c !important; 
          background-color: transparent !important; 
          transition: all 0.3s ease !important;
        }
        .theme-orange-outline:hover { 
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%) !important; 
          color: white !important; 
          border-color: transparent !important;
          box-shadow: 0 4px 10px rgba(234, 88, 12, 0.25) !important;
        }
        .theme-orange-text { color: #ea580c !important; }
        .theme-orange-light-bg { background-color: #fff7ed !important; }
        .theme-orange-border-light { border-color: #fdba74 !important; }
        .premium-card {
          background-color: white;
          border: 1px solid rgba(0,0,0,0.04) !important;
          box-shadow: 0 4px 18px rgba(0,0,0,0.04) !important;
          transition: all 0.3s ease !important;
        }
        .premium-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important;
          transform: translateY(-4px);
        }
        .custom-checkbox:checked { background-color: #ea580c !important; border-color: #ea580c !important; }
        .custom-select:focus { border-color: #fdba74 !important; box-shadow: 0 0 0 0.25rem rgba(234, 88, 12, 0.25) !important; }
      `}</style>

      {/* Header Banner */}
      <div className="premium-card rounded-4 mb-4 overflow-hidden">
        <div className="card-body p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <span className="badge theme-orange-light-bg theme-orange-text border theme-orange-border-light px-3 py-1 rounded-pill fw-bold text-uppercase mb-2 shadow-sm">
              Bhajan & Satsang Library
            </span>
            <h3 className="fw-bolder text-dark mb-1">Gallery Media Manager</h3>
            <p className="text-secondary mb-0 small fw-medium">Organize albums, events, photos, and video archives effortlessly.</p>
          </div>

          <div className="d-flex gap-2">
            {selectedIds.length > 0 && (
              <button
                type="button"
                className="btn btn-outline-danger fw-bold px-3 py-2 rounded-3 shadow-sm d-flex align-items-center gap-1 transition"
                onClick={handleBulkDelete}
              >
                <span>🗑️</span> Delete Selected ({selectedIds.length})
              </button>
            )}
            <button
              type="button"
              className="btn theme-orange-gradient fw-bold px-4 py-2 rounded-3 d-flex align-items-center gap-2"
              onClick={() => {
                setSelectedForEdit(null);
                setIsModalOpen(true);
              }}
            >
              <span>＋</span> Add Photos & Videos
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="premium-card rounded-4 mb-4">
        <div className="card-body p-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
          {/* Main Folder Pills */}
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <span className="text-secondary small fw-bold me-2">YEAR / FOLDER:</span>
            {folders.map((folder) => (
              <button
                key={folder}
                type="button"
                className={`btn btn-sm rounded-pill fw-bold px-4 transition ${
                  selectedFolder === folder ? 'theme-orange-gradient' : 'btn-light text-secondary border'
                }`}
                onClick={() => {
                  setSelectedFolder(folder);
                  setSelectedSubFolder('All');
                }}
              >
                📁 {folder}
              </button>
            ))}
          </div>

          {/* Sub Folder & Type Filters */}
          <div className="d-flex flex-wrap align-items-center gap-3">
            {selectedFolder !== 'All' && subFolders.length > 1 && (
              <select
                className="form-select form-select-sm rounded-3 custom-select text-secondary fw-bold border-light-subtle shadow-sm"
                style={{ width: 'auto', paddingRight: '2.5rem' }}
                value={selectedSubFolder}
                onChange={(e) => setSelectedSubFolder(e.target.value)}
              >
                {subFolders.map((sub) => (
                  <option key={sub} value={sub}>
                    📂 {sub === 'All' ? 'All Sub-Folders' : sub}
                  </option>
                ))}
              </select>
            )}

            <div className="btn-group btn-group-sm bg-light border rounded-3 p-1 shadow-sm">
              {['ALL', 'Photos', 'Videos'].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`btn btn-sm rounded-2 fw-bold px-3 transition ${
                    filterType === t ? 'btn-white bg-white theme-orange-text shadow-sm' : 'btn-light text-secondary border-0'
                  }`}
                  onClick={() => setFilterType(t)}
                >
                  {t === 'Photos' ? '🖼️ Photos' : t === 'Videos' ? '🎥 Videos' : 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Media Grid Display */}
      {loading ? (
        <div className="premium-card rounded-4 p-5 text-center my-4">
          <div className="spinner-border theme-orange-text mx-auto" role="status"></div>
          <p className="theme-orange-text mt-3 mb-0 fw-bold">Loading media library...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="premium-card rounded-4 p-5 text-center my-4">
          <div className="display-4 text-secondary opacity-50 mb-3">📁</div>
          <h5 className="fw-bolder text-dark">No Media Found</h5>
          <p className="text-secondary small mb-4">No files found in this selection.</p>
          <div>
            <button
              type="button"
              className="btn theme-orange-gradient fw-bold px-4 py-2 rounded-3"
              onClick={() => {
                setSelectedForEdit(null);
                setIsModalOpen(true);
              }}
            >
              Upload Media
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {filteredItems.map((item) => {
            const isPhoto = Boolean(item.photo_path);
            const rawPath = item.photo_path || item.video_path;
            const mediaUrl = formatMediaUrl(rawPath);
            const isSelected = selectedIds.includes(item.id);

            return (
              <div key={item.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div
                  className={`card h-100 premium-card rounded-4 overflow-hidden ${
                    isSelected ? 'border-2 border-warning shadow-lg' : ''
                  }`}
                  style={{ borderColor: isSelected ? '#ea580c' : '' }}
                >
                  {/* Thumbnail Box */}
                  <div
                    className="position-relative bg-dark overflow-hidden"
                    style={{ height: '200px', cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredMediaId(item.id)}
                    onMouseLeave={() => setHoveredMediaId(null)}
                    onClick={() => setPreviewMedia({ ...item, mediaUrl, isPhoto })}
                  >
                    {/* Dark Overlay Effect on Hover */}
                    <div
                      className="position-absolute top-0 start-0 w-100 h-100"
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        opacity: hoveredMediaId === item.id ? 1 : 0,
                        transition: 'opacity 0.2s ease-in-out',
                        zIndex: 1,
                        pointerEvents: 'none' // Prevents overlay from blocking clicks
                      }}
                    ></div>

                    {/* Checkbox */}
                    <div className="position-absolute top-0 start-0 m-2" style={{ zIndex: 2 }} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="form-check-input custom-checkbox border-2 cursor-pointer shadow"
                        checked={isSelected}
                        onChange={(e) => toggleSelectId(e, item.id)}
                        style={{ width: '1.2rem', height: '1.2rem' }}
                      />
                    </div>

                    {/* Top Right Action: Delete Button OR Type Badge */}
                    {hoveredMediaId === item.id ? (
                      // Show Delete Button on Hover
                      <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: 2 }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm rounded-circle shadow-lg d-flex align-items-center justify-content-center p-0"
                          style={{ width: '32px', height: '32px', transition: 'all 0.2s' }}
                          onClick={(e) => handleDeleteSingle(e, item)}
                          title="Delete Media"
                        >
                          🗑️
                        </button>
                      </div>
                    ) : (
                      // Show Type Badge when not hovered
                      <span className="position-absolute top-0 end-0 m-2 badge bg-dark bg-opacity-75 rounded-pill px-3 py-1 small fw-bold shadow-sm" style={{ zIndex: 2 }}>
                        {isPhoto ? '📷 Photo' : '🎥 Video'}
                      </span>
                    )}

                    {/* Media Render */}
                    {isPhoto ? (
                      <img
                        src={mediaUrl}
                        alt={item.sub_folder_name}
                        className="w-100 h-100 object-fit-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/400x300/e2e8f0/475569?text=Image+Not+Found';
                        }}
                      />
                    ) : (
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-black position-relative">
                        <video 
                          src={mediaUrl} 
                          className="w-100 h-100 object-fit-cover" 
                          muted 
                          loop
                          preload="metadata" 
                          onMouseEnter={(e) => e.target.play()}
                          onMouseLeave={(e) => {
                            e.target.pause();
                            e.target.currentTime = 0;
                          }}
                        />
                        {hoveredMediaId !== item.id && (
                          <span className="position-absolute text-white fs-2 opacity-75" style={{ zIndex: 0 }}>▶</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Body & Actions */}
                  <div className="card-body p-3 d-flex flex-column justify-content-between">
                    <div className="mb-3">
                      <h6 className="fw-bolder text-dark text-truncate mb-2" title={item.sub_folder_name}>
                        {item.sub_folder_name || 'General Event'}
                      </h6>
                      <div className="d-flex justify-content-between align-items-center small text-secondary">
                        <span className="badge theme-orange-light-bg theme-orange-text border theme-orange-border-light fw-bold">
                          📁 {item.main_folder_name}
                        </span>
                        <span className="small fw-medium">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex pt-2 border-top">
                      <button
                        type="button"
                        className="btn theme-orange-outline btn-sm w-100 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedForEdit(item);
                          setIsModalOpen(true);
                        }}
                      >
                        ✏️ Edit Media
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full-Screen Preview Modal */}
      {previewMedia && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1060 }}
          onClick={() => setPreviewMedia(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-transparent border-0">
              <div className="d-flex justify-content-between align-items-center text-white mb-2 px-2">
                <div>
                  <h5 className="fw-bold mb-0">{previewMedia.sub_folder_name}</h5>
                  <small className="text-light opacity-75">📁 {previewMedia.main_folder_name}</small>
                </div>
                <button
                  type="button"
                  className="btn btn-light btn-sm rounded-circle fw-bold px-2 py-1 shadow"
                  onClick={() => setPreviewMedia(null)}
                >
                  ✕
                </button>
              </div>
              <div
                className="modal-body p-0 text-center bg-black rounded-4 overflow-hidden shadow-lg position-relative d-flex align-items-center justify-content-center"
                style={{ minHeight: '60vh', maxHeight: '80vh' }}
              >
                {previewMedia.isPhoto ? (
                  <img
                    src={previewMedia.mediaUrl}
                    alt={previewMedia.sub_folder_name}
                    className="img-fluid object-fit-contain"
                    style={{ maxHeight: '80vh', width: 'auto' }}
                  />
                ) : (
                  <video
                    src={previewMedia.mediaUrl}
                    controls
                    autoPlay
                    className="w-100"
                    style={{ maxHeight: '80vh' }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single Modal for Add and Edit */}
      <GalleryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedForEdit(null);
        }}
        onSuccess={loadGallery}
        initialData={selectedForEdit}
      />
    </div>
  );
};

export default Gallery;