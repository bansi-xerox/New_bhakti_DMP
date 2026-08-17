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
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* Header Banner */}
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 rounded-pill fw-semibold text-uppercase mb-2">
              Bhajan & Satsang Library
            </span>
            <h3 className="fw-bold text-dark mb-1">Gallery Media Manager</h3>
            <p className="text-secondary mb-0 small">Organize albums, events, photos, and video archives</p>
          </div>

          <div className="d-flex gap-2">
            {selectedIds.length > 0 && (
              <button
                type="button"
                className="btn btn-outline-danger fw-semibold px-3 py-2 rounded-3 shadow-sm d-flex align-items-center gap-1"
                onClick={handleBulkDelete}
              >
                <span>🗑️</span> Delete Selected ({selectedIds.length})
              </button>
            )}
            <button
              type="button"
              className="btn btn-success fw-semibold px-4 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2"
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
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body p-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
          {/* Main Folder Pills */}
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <span className="text-secondary small fw-bold me-1">YEAR / FOLDER:</span>
            {folders.map((folder) => (
              <button
                key={folder}
                type="button"
                className={`btn btn-sm rounded-pill fw-semibold px-3 ${
                  selectedFolder === folder ? 'btn-success text-white shadow-sm' : 'btn-light text-secondary border'
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
          <div className="d-flex flex-wrap align-items-center gap-2">
            {selectedFolder !== 'All' && subFolders.length > 1 && (
              <select
                className="form-select form-select-sm rounded-3 border-secondary-subtle"
                style={{ width: 'auto' }}
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

            <div className="btn-group btn-group-sm bg-light border rounded-3 p-1">
              {['ALL', 'Photos', 'Videos'].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`btn btn-sm rounded-2 fw-semibold px-3 ${
                    filterType === t ? 'btn-white bg-white text-dark shadow-sm' : 'btn-light text-secondary border-0'
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
        <div className="card shadow-sm border-0 rounded-4 p-5 text-center my-4">
          <div className="spinner-border text-success mx-auto" role="status"></div>
          <p className="text-secondary mt-3 mb-0 fw-semibold">Loading media library...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card shadow-sm border-0 rounded-4 p-5 text-center my-4">
          <div className="display-4 text-secondary opacity-50 mb-3">📁</div>
          <h5 className="fw-bold text-dark">No Media Found</h5>
          <p className="text-secondary small mb-3">No files found in this selection.</p>
          <div>
            <button
              type="button"
              className="btn btn-success fw-semibold px-4 rounded-3"
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
                  className={`card h-100 shadow-sm rounded-4 overflow-hidden border ${
                    isSelected ? 'border-success border-2 shadow' : 'border-light-subtle'
                  }`}
                >
                  {/* Thumbnail Box */}
                  <div
                    className="position-relative bg-dark overflow-hidden"
                    style={{ height: '190px', cursor: 'pointer' }}
                    onClick={() => setPreviewMedia({ ...item, mediaUrl, isPhoto })}
                  >
                    {/* Checkbox */}
                    <div className="position-absolute top-0 start-0 m-2 z-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="form-check-input border-2 cursor-pointer shadow"
                        checked={isSelected}
                        onChange={(e) => toggleSelectId(e, item.id)}
                        style={{ width: '1.2rem', height: '1.2rem' }}
                      />
                    </div>

                    {/* Type Badge */}
                    <span className="position-absolute top-0 end-0 m-2 badge bg-dark bg-opacity-75 rounded-pill px-2 py-1 small fw-bold z-2">
                      {isPhoto ? '📷 Photo' : '🎥 Video'}
                    </span>

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
                        <video src={mediaUrl} className="w-100 h-100 object-fit-cover" preload="metadata" />
                        <span className="position-absolute text-white fs-2 opacity-75">▶</span>
                      </div>
                    )}
                  </div>

                  {/* Body & Actions */}
                  <div className="card-body p-3 d-flex flex-column justify-content-between">
                    <div>
                      <h6 className="fw-bold text-dark text-truncate mb-1" title={item.sub_folder_name}>
                        {item.sub_folder_name || 'General Event'}
                      </h6>
                      <div className="d-flex justify-content-between align-items-center small text-secondary mb-3">
                        <span className="badge bg-light text-secondary border">📁 {item.main_folder_name}</span>
                        <span className="small">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex gap-2 pt-2 border-top">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm w-50 rounded-2 fw-semibold d-flex align-items-center justify-content-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedForEdit(item);
                          setIsModalOpen(true);
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm w-50 rounded-2 fw-semibold d-flex align-items-center justify-content-center gap-1"
                        onClick={(e) => handleDeleteSingle(e, item)}
                      >
                        🗑️ Delete
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
                  className="btn btn-light btn-sm rounded-circle fw-bold px-2 py-1"
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