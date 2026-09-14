import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { getGalleryItems, deleteGalleryMedia } from "../../../services/api";
import {
  showGalleryToast,
  showErrorAlert,
  confirmMediaDelete,
} from "../../../components/common/Alert";
import GalleryModal from "./GalleryModal";

// --- Zero-Dependency Lucide-Style SVG Icons ---
const FolderIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
  </svg>
);

const FolderOpenIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2" />
  </svg>
);

const GlobeIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

const SearchIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const PlusIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

const XIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const ChevronRightIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const ChevronDownIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const CornerDownRightIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="15 10 20 15 15 20" />
    <path d="M4 4v7a4 4 0 0 0 4 4h12" />
  </svg>
);

const Trash2Icon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

const PlayIcon = ({ size = 20, fill = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
);

const ImageIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

// const BASE_SERVER_URL = 'http://localhost:5000/uploads/';
const BASE_SERVER_URL = 'https://new-bhakti-dmp.onrender.com/uploads/';
const formatMediaUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${BASE_SERVER_URL}${path.replace(/^\/+/, "")}`;
};

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(null);

  const clickTimeoutRef = useRef(null);

const handleSingleClick = (item, mediaUrl, isPhoto) => {
  // Clear any existing timer
  if (clickTimeoutRef.current) {
    clearTimeout(clickTimeoutRef.current);
  }
  // Set a timer to open the big image. If they double click, this gets cancelled.
  clickTimeoutRef.current = setTimeout(() => {
    setPreviewMedia({ ...item, mediaUrl, isPhoto });
  }, 250);
};

const handleDoubleClick = (e, item) => {
  e.stopPropagation();
  // Cancel the single click preview from opening
  if (clickTimeoutRef.current) {
    clearTimeout(clickTimeoutRef.current);
  }
  setPreviewMedia(null);
  setSelectedForEdit(item);
  setIsModalOpen(true);
};

  // Layout States
  const [expandedMainFolder, setExpandedMainFolder] = useState('All');
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [selectedSubFolder, setSelectedSubFolder] = useState('All');
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  // Search & Pagination States


  const loadGallery = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getGalleryItems();

      if (res.data?.success) {
        setItems(res.data.data || []);
      }
    } catch (err) {
      showErrorAlert("Fetch Error", "Failed to load gallery items");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadGallery();
  }, [loadGallery]);
  const folders = useMemo(() => {
    const main = [
      ...new Set(items.map((i) => i.main_folder_name).filter(Boolean)),
    ];
    return ["All", ...main];
  }, [items]);

  const getSubFoldersForMain = (mainFolder) => {
    if (mainFolder === 'All') return [];
    return [
      'All',
      ...new Set(
        items
          .filter((i) => i.main_folder_name === mainFolder)
          .map((i) => i.sub_folder_name)
          .filter(Boolean)
      )
    ];
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchMain =
        selectedFolder === "All" || item.main_folder_name === selectedFolder;
      const matchSub =
        selectedSubFolder === "All" ||
        item.sub_folder_name === selectedSubFolder;
      const isPhoto = Boolean(item.photo_path);
      const matchType =
        filterType === 'ALL' ||
        (filterType === 'Photos' && isPhoto) ||
        (filterType === 'Videos' && !isPhoto);

      const searchLower = searchTerm.toLowerCase();
      const matchSearch = searchTerm === '' ||
        (item.sub_folder_name || '').toLowerCase().includes(searchLower) ||
        (item.main_folder_name || '').toLowerCase().includes(searchLower);

      return matchMain && matchSub && matchType && matchSearch;
    });
  }, [items, selectedFolder, selectedSubFolder, filterType, searchTerm]);

  const handleDeleteSingle = async (e, item) => {
    e.stopPropagation();
    const type = item.photo_path ? "photo" : "video";
    const confirm = await confirmMediaDelete(
      `Do you want to delete this ${type}?`,
    );

    if (confirm.isConfirmed) {
      try {
        const res = await deleteGalleryMedia([item.id]);
        if (res.data?.success) {
          showGalleryToast(res.data.message || "Media deleted successfully");
          setSelectedIds((prev) => prev.filter((id) => id !== item.id));
          loadGallery();
        }
      } catch (err) {
        showErrorAlert(
          "Delete Error",
          err.response?.data?.message || err.message,
        );
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirm = await confirmMediaDelete(
      `Delete selected ${selectedIds.length} items?`,
    );
    if (confirm.isConfirmed) {
      try {
        const res = await deleteGalleryMedia(selectedIds);
        if (res.data?.success) {
          showGalleryToast(res.data.message || "Items deleted successfully");
          setSelectedIds([]);
          loadGallery();
        }
      } catch (err) {
        showErrorAlert(
          "Delete Error",
          err.response?.data?.message || err.message,
        );
      }
    }
  };

  const toggleSelectId = (e, id) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <div className="container-fluid p-0 p-0 p-0 d-flex flex-column" style={{ minHeight: '100%', backgroundColor: 'transparent' }}>
      <style>{`

/* --- Lightbox Zoom Animation --- */
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.5); /* Starts zoomed out */
          }
          to {
            opacity: 1;
            transform: scale(1); /* Zooms in to original size */
          }
        }
        
        .modal-zoom-anim {
          animation: zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

.theme-orange-gradient { 
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%) !important; 
          color: white !important; border: none !important;
          transition: all 0.3s ease;
        }
        .theme-orange-gradient:hover {
          box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3) !important;
          transform: translateY(-1px);
        }
        .theme-orange-text { color: #ea580c !important; }
        .premium-card {
          background-color: white;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.04);
          box-shadow: 0 4px 18px rgba(0,0,0,0.03);
        }
        
      .gallery-layout { 
          display: flex; 
          gap: 1.5rem; 
          height: calc(100vh - 40px);
          align-items: stretch; 
          overflow: hidden; 
        }

        .gallery-inner-sidebar { 
          width: 280px; 
          flex-shrink: 0;
          overflow-y: auto; 
          padding: 1.5rem; 
        }
        
        .gallery-main-area { 
            flex: 1; 
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            min-width: 0; 
            overflow: hidden; 
        }

        .folder-btn { 
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; padding: 0.75rem 1rem; margin-bottom: 0.25rem;
          background: transparent; border: none; border-radius: 0.5rem;
          text-align: left; font-weight: 600; color: #475569; transition: all 0.2s;
        }
        .folder-btn:hover { background: #f8fafc; color: #ea580c; }
        .folder-btn.active { background: #fff7ed; color: #ea580c; border-left: 4px solid #ea580c; }
        
        .subfolder-list { padding-left: 1.5rem; margin-bottom: 0.5rem; }
        .subfolder-btn {
          display: flex; align-items: center; width: 100%; padding: 0.5rem 0.75rem;
          background: transparent; border: none; border-radius: 0.25rem;
          text-align: left; font-size: 0.875rem; color: #64748b; transition: all 0.2s;
        }
        .subfolder-btn:hover { color: #ea580c; background: #f8fafc; }
        .subfolder-btn.active { color: #ea580c; font-weight: bold; }

        .search-wrapper {
          flex: 1;
          max-width: 500px;
          min-width: 260px;
          position: relative;
        }
        .search-input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.6rem 2.5rem;
          outline: none;
          transition: all 0.2s;
          font-size: 0.95rem;
          background-color: #f8fafc;
          color: #334155;
        }
        .search-input:focus { 
          background-color: #fff;
          border-color: #f97316; 
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1); 
        }
        .search-icon-left {
          position: absolute;
          left: 0.8rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          display: flex;
          align-items: center;
        }

        .grid-10 {
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          gap: 0.75rem;
        }
        @media (max-width: 1600px) { .grid-10 { grid-template-columns: repeat(8, 1fr); } }
        @media (max-width: 1200px) { .grid-10 { grid-template-columns: repeat(6, 1fr); } }
        @media (max-width: 992px) { 
          .gallery-layout { flex-direction: column; } 
          .gallery-inner-sidebar { width: 100%; border-right: none; } 
          .grid-10 { grid-template-columns: repeat(5, 1fr); }
          .search-wrapper { max-width: 100%; } 
        }
        @media (max-width: 576px) { .grid-10 { grid-template-columns: repeat(3, 1fr); } }

        .media-card {
          position: relative; aspect-ratio: 1; 
          border-radius: 0.5rem; overflow: hidden; background: #f1f5f9; cursor: pointer;
          border: 2px solid transparent; transition: all 0.2s;
        }
        .media-card.selected { border-color: #ea580c; }
        .media-card:hover { transform: scale(1.03); z-index: 10; box-shadow: 0 6px 16px rgba(0,0,0,0.15); }
        .media-card img, .media-card video { width: 100%; height: 100%; object-fit: cover; }
        
        .media-overlay {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.4); opacity: 0; transition: opacity 0.2s;
        }
        .media-card:hover .media-overlay { opacity: 1; }
        .media-checkbox { position: absolute; top: 0.5rem; left: 0.5rem; z-index: 2; width: 1.1rem; height: 1.1rem; }
        .media-delete-btn { position: absolute; top: 0.5rem; right: 0.5rem; z-index: 2; }

        /* --- Custom Orange Scrollbar --- */
        
        /* For Chrome, Safari, and Edge */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #fff7ed;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          border-radius: 10px;
          border: 2px solid #fff7ed;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #c2410c;
        }

        /* For Firefox */
        .gallery-inner-sidebar, .overflow-auto {
          scrollbar-width: thin;
          scrollbar-color: #ea580c #fff7ed;
        }
      `}</style>

      <div className="gallery-layout">

        {/* --- LEFT SIDEBAR: FOLDER TREE --- */}
        <div className="gallery-inner-sidebar premium-card">

          <div className="mb-4">
            <h5 className="fw-bolder text-dark mb-3">Albums</h5>

            {/* CLEANER ADD BUTTON: Just a PLUS icon and text */}
            <button
              className="btn theme-orange-gradient w-100 border-0 shadow-sm d-flex align-items-center justify-content-center gap-2"
              style={{ padding: '0.75rem 1rem', borderRadius: '10px' }}
              onClick={() => { setSelectedForEdit(null); setIsModalOpen(true); }}
              title="Add Media"
            >
              <PlusIcon size={22} className="flex-shrink-0" />

              <div className="text-start lh-1">
                <div className="fw-bold mb-1" style={{ fontSize: '14px', letterSpacing: '0.3px' }}>
                  Add Photos & Videos
                </div>
              </div>
            </button>
          </div>

          <div className="folder-tree mt-2">
            {folders.map((mainFolder) => (
              <div key={mainFolder}>
                <button
                  type="button"
                  className={`folder-btn ${selectedFolder === mainFolder && expandedMainFolder === mainFolder ? 'active' : ''}`}
                  onClick={() => {
                    setExpandedMainFolder(expandedMainFolder === mainFolder ? null : mainFolder);
                    setSelectedFolder(mainFolder);
                    setSelectedSubFolder('All');
                    setSearchTerm('');
                  }}
                >
                  <span className="d-flex align-items-center gap-2">
                    <span className="d-flex align-items-center">
                      {mainFolder === 'All' ? <GlobeIcon size={18} /> : (expandedMainFolder === mainFolder ? <FolderOpenIcon size={18} /> : <FolderIcon size={18} />)}
                    </span>
                    {mainFolder}
                  </span>
                  {mainFolder !== 'All' && (
                    <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                      {expandedMainFolder === mainFolder ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
                    </span>
                  )}
                </button>

                {mainFolder !== 'All' && expandedMainFolder === mainFolder && (
                  <div className="subfolder-list">
                    {getSubFoldersForMain(mainFolder).map((subFolder) => (
                      <button
                        key={subFolder}
                        type="button"
                        className={`subfolder-btn ${selectedSubFolder === subFolder ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedFolder(mainFolder);
                          setSelectedSubFolder(subFolder);
                          setSearchTerm('');
                        }}
                      >
                        <CornerDownRightIcon size={14} className="me-2 opacity-50" />
                        {subFolder === 'All' ? 'All Events' : subFolder}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* --- RIGHT SIDE: MAIN CONTENT & GRID --- */}
        <div className="gallery-main-area">

          {/* HEADER ACTION BAR */}
          <div className="premium-card p-3 d-flex flex-wrap justify-content-between align-items-center gap-3">

            <div className="d-flex flex-column pe-2">
              <h4 className="fw-bolder mb-1 text-dark text-nowrap">
                {selectedFolder === 'All' ? 'All Media' : `${selectedFolder}`}
                {selectedSubFolder !== 'All' && ` / ${selectedSubFolder}`}
              </h4>
              <span className="text-secondary small fw-medium">{filteredItems.length} items found</span>
            </div>

            {/* BIG PROMINENT SEARCH BAR */}
            <div className="search-wrapper mx-auto">
              <span className="search-icon-left">
                <SearchIcon size={18} />
              </span>
              <input
                type="text"
                className="search-input shadow-sm"
                placeholder="Search folders or events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-sm position-absolute end-0 top-50 translate-middle-y text-muted border-0 bg-transparent"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  <XIcon size={16} />
                </button>
              )}
            </div>

            {/* FILTERS & BULK ACTIONS */}
            <div className="d-flex flex-wrap gap-2 align-items-center ms-auto">
              <div className="btn-group btn-group-sm bg-light border rounded-3 p-1">
                {['ALL', 'Photos', 'Videos'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`btn btn-sm rounded-2 fw-bold px-3 ${filterType === t ? 'btn-white bg-white theme-orange-text shadow-sm' : 'btn-light text-secondary border-0'
                      }`}
                    onClick={() => setFilterType(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* NEW: Move and Delete Buttons (Visible only when items are selected) */}
{selectedIds.length > 0 && (
  <div className="d-flex align-items-center gap-2 ms-2">
    {/* BULK MOVE BUTTON */}
    <button
      type="button"
      className="btn btn-warning btn-sm fw-bold px-3 py-1 rounded-3 shadow-sm d-flex align-items-center gap-2 text-dark"
      onClick={() => {
        const itemsToMove = filteredItems.filter(i => selectedIds.includes(i.id));
        setSelectedForEdit(itemsToMove); 
        setIsModalOpen(true);
      }}
    >
      <FolderOpenIcon size={16} /> Move ({selectedIds.length})
    </button>

    {/* BULK DELETE BUTTON */}
    <button
      type="button"
      className="btn btn-danger btn-sm fw-bold px-3 py-1 rounded-3 shadow-sm d-flex align-items-center gap-2"
      onClick={handleBulkDelete}
    >
      <Trash2Icon size={16} /> ({selectedIds.length})
    </button>
  </div>
)}
            </div>
          </div>

          {/* MEDIA GRID AREA */}
          <div className="premium-card p-4 flex-grow-1 overflow-auto">
            {loading ? (
              <div className="text-center mt-5">
                <div className="spinner-border theme-orange-text" role="status"></div>
                <p className="mt-2 text-muted fw-medium">Loading media...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center mt-5 pt-4">
                <div className="text-secondary opacity-25 mb-3 d-flex justify-content-center">
                  <FolderOpenIcon size={64} />
                </div>
                <h5 className="fw-bold text-dark">No Media Found</h5>
                <p className="text-muted small">Try adjusting your search or selecting a different folder.</p>
              </div>
            ) : (
              <div className="grid-10">
                {filteredItems.map((item) => {
                  const isPhoto = Boolean(item.photo_path);
                  const rawPath = item.photo_path || item.video_path;
                  const mediaUrl = formatMediaUrl(rawPath);
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`media-card ${isSelected ? 'selected shadow' : ''}`}
                      onClick={() => handleSingleClick(item, mediaUrl, isPhoto)}
                      onDoubleClick={(e) => handleDoubleClick(e, item)}
                    >
                      {isPhoto ? (
                        <img src={mediaUrl} alt={item.sub_folder_name} loading="lazy" />
                      ) : (
                        <video src={mediaUrl} muted preload="metadata" />
                      )}

                 {/* Hover Overlay with Delete & Checkbox */}
<div
  className="media-overlay"
  style={{
    opacity: isSelected ? 1 : undefined,
    backgroundColor: isSelected ? 'rgba(0,0,0,0.3)' : undefined
  }}
>
  <input
    type="checkbox"
    className="form-check-input media-checkbox shadow-sm cursor-pointer"
    checked={isSelected}
    onChange={(e) => toggleSelectId(e, item.id)}
    onClick={(e) => e.stopPropagation()}
    style={{ width: '1.25rem', height: '1.25rem' }} 
  />

  {/* ONLY show the individual dustbin if the item is NOT selected AND we aren't in bulk selection mode */}
  {!isSelected && selectedIds.length === 0 && (
    <button
      type="button"
      className="btn btn-danger btn-sm rounded-circle media-delete-btn p-0 d-flex align-items-center justify-content-center shadow"
      style={{ width: '28px', height: '28px' }}
      onClick={(e) => handleDeleteSingle(e, item)}
    >
      <Trash2Icon size={14} />
    </button>
  )}

  {!isPhoto && (
    <div className="position-absolute top-50 start-50 translate-middle text-white" style={{ pointerEvents: 'none' }}>
      <PlayIcon fill="white" size={28} />
    </div>
  )}
</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULL SCREEN LIGHTBOX MODAL */}
      {previewMedia && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.85)", zIndex: 1060, transition: 'background-color 0.3s ease' }}
          onClick={() => setPreviewMedia(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-xl modal-zoom-anim"
            onClick={(e) => e.stopPropagation()}
          >
            {/* INLINE STYLE ADDED HERE: Guaranteed solid black background */}
            <div
              className="modal-content border-0 rounded-4 overflow-hidden shadow-lg"
              style={{ backgroundColor: '#000000' }}
            >

              {/* Header Section */}
              <div className="d-flex justify-content-between align-items-center text-white p-3">
                <div>
                  <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                    {previewMedia.isPhoto ? <ImageIcon size={20} /> : <PlayIcon size={20} />}
                    {(previewMedia.photo_path || previewMedia.video_path || '').split('/').pop()}
                  </h5>

                </div>
                <button
                  type="button"
                  className="btn btn-light btn-sm rounded-circle fw-bold shadow d-flex align-items-center justify-content-center text-dark"
                  style={{ width: '32px', height: '32px', transition: 'transform 0.2s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  onClick={() => setPreviewMedia(null)}
                >
                  <XIcon size={18} />
                </button>
              </div>

              {/* Image/Video Section */}
              <div className="modal-body p-0 text-center">
                {previewMedia.isPhoto ? (
                  <img
                    src={previewMedia.mediaUrl}
                    alt="Preview"
                    className="img-fluid object-fit-contain"
                    style={{ maxHeight: "80vh", width: "100%" }}
                  />
                ) : (
                  <video
                    src={previewMedia.mediaUrl}
                    controls
                    autoPlay
                    className="w-100"
                    style={{ maxHeight: "80vh" }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD / EDIT MODAL */}
      {/* UPLOAD / EDIT MODAL */}
      <GalleryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedForEdit(null);
        }}
        onSuccess={() => {
          loadGallery();
          setSelectedIds([]); // Clear checkboxes after a successful move
        }}
        initialData={selectedForEdit}
      />
    </div>
  );
};

export default Gallery;
