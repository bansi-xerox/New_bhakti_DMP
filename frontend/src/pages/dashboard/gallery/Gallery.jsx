import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getGalleryItems, deleteGalleryMedia } from "../../../services/api";
import {
  showGalleryToast,
  showErrorAlert,
  confirmMediaDelete,
} from "../../../components/common/Alert";
import GalleryModal from "./GalleryModal";
import Pagination from "../../../components/common/Pagination";
import SearchBar from "../../../components/common/SearchBar";

const BASE_SERVER_URL = "http://localhost:5000/uploads/";

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

  // Filter & Selection States
  const [selectedFolder, setSelectedFolder] = useState("All");
  const [selectedSubFolder, setSelectedSubFolder] = useState("All");
  const [filterType, setFilterType] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState([]);
  const [hoveredMediaId, setHoveredMediaId] = useState(null);

  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [paginationData, setPaginationData] = useState({
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const loadGallery = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchQuery.trim() || undefined,
      };

      const res = await getGalleryItems(params);
      if (res.data?.success) {
        setItems(res.data.data || []);
        if (res.data.pagination) {
          setPaginationData(res.data.pagination);
        }
      }
    } catch (err) {
      showErrorAlert("Fetch Error", "Failed to load gallery items");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery]);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  const handleSearchSubmit = () => {
    setCurrentPage(1);
    loadGallery();
  };

  const folders = useMemo(() => {
    const main = [
      ...new Set(items.map((i) => i.main_folder_name).filter(Boolean)),
    ];
    return ["All", ...main];
  }, [items]);

  const subFolders = useMemo(() => {
    if (selectedFolder === "All") return ["All"];
    const subs = [
      ...new Set(
        items
          .filter((i) => i.main_folder_name === selectedFolder)
          .map((i) => i.sub_folder_name)
          .filter(Boolean),
      ),
    ];
    return ["All", ...subs];
  }, [items, selectedFolder]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchMain =
        selectedFolder === "All" || item.main_folder_name === selectedFolder;
      const matchSub =
        selectedSubFolder === "All" ||
        item.sub_folder_name === selectedSubFolder;
      const isPhoto = Boolean(item.photo_path);
      const matchType =
        filterType === "ALL" ||
        (filterType === "Photos" && isPhoto) ||
        (filterType === "Videos" && !isPhoto);
      return matchMain && matchSub && matchType;
    });
  }, [items, selectedFolder, selectedSubFolder, filterType]);

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
    <div
      className="container-fluid p-4 min-vh-100"
      style={{ backgroundColor: "#f4f6f9" }}
    >
      <style>{`
        .theme-orange-gradient { 
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%) !important; 
          color: white !important; 
          border: none !important;
          box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25) !important;
        }
        .theme-orange-outline { 
          border: 1.5px solid #ea580c !important; 
          color: #ea580c !important; 
          background-color: transparent !important; 
        }
        .theme-orange-text { color: #ea580c !important; }
        .theme-orange-light-bg { background-color: #fff7ed !important; }
        .theme-orange-border-light { border-color: #fdba74 !important; }
        .premium-card {
          background-color: white;
          border: 1px solid rgba(0,0,0,0.04) !important;
          box-shadow: 0 4px 18px rgba(0,0,0,0.04) !important;
        }
        .custom-checkbox:checked { background-color: #ea580c !important; border-color: #ea580c !important; }
      `}</style>

      {/* Header Banner */}
      <div className="premium-card rounded-4 mb-4 overflow-hidden">
        <div className="card-body p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h3 className="fw-bolder text-dark mb-1">Gallery Media Manager</h3>
            <p className="text-secondary mb-0 small fw-medium">
              Organize albums, events, photos, and video archives effortlessly.
            </p>
          </div>

          <div className="d-flex gap-2">
            {selectedIds.length > 0 && (
              <button
                type="button"
                className="btn btn-outline-danger fw-bold px-3 py-2 rounded-3 shadow-sm d-flex align-items-center gap-1"
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

      <div className="premium-card rounded-4 mb-4">
        <div className="card-body p-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
          {/* Reusable Search Component */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearchSubmit}
            placeholder="Search folder or media..."
          />

          

          {/* Subfolder & Media Type Filters */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            <div className="btn-group btn-group-sm bg-light border rounded-3 p-1 shadow-sm">
              {["ALL", "Photos", "Videos"].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`btn btn-sm rounded-2 fw-bold px-3 ${
                    filterType === t
                      ? "btn-white bg-white theme-orange-text shadow-sm"
                      : "btn-light text-secondary border-0"
                  }`}
                  onClick={() => setFilterType(t)}
                >
                  {t === "Photos"
                    ? "🖼️ Photos"
                    : t === "Videos"
                      ? "🎥 Videos"
                      : "All"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="premium-card rounded-4 p-5 text-center my-4">
          <div
            className="spinner-border theme-orange-text mx-auto"
            role="status"
          ></div>
          <p className="theme-orange-text mt-3 mb-0 fw-bold">
            Loading media library...
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="premium-card rounded-4 p-5 text-center my-4">
          <div className="display-4 text-secondary opacity-50 mb-3">📁</div>
          <h5 className="fw-bolder text-dark">No Media Found</h5>
          <p className="text-secondary small mb-3">No matching files found.</p>
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
                  className={`card h-100 premium-card rounded-4 overflow-hidden ${isSelected ? "border-2 border-warning shadow-lg" : ""}`}
                  style={{ borderColor: isSelected ? "#ea580c" : "" }}
                >
                  <div
                    className="position-relative bg-dark overflow-hidden"
                    style={{ height: "200px", cursor: "pointer" }}
                    onMouseEnter={() => setHoveredMediaId(item.id)}
                    onMouseLeave={() => setHoveredMediaId(null)}
                    onClick={() =>
                      setPreviewMedia({ ...item, mediaUrl, isPhoto })
                    }
                  >
                    {/* Checkbox */}
                    <div
                      className="position-absolute top-0 start-0 m-2"
                      style={{ zIndex: 2 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="form-check-input custom-checkbox border-2 cursor-pointer shadow"
                        checked={isSelected}
                        onChange={(e) => toggleSelectId(e, item.id)}
                        style={{ width: "1.2rem", height: "1.2rem" }}
                      />
                    </div>

                    {/* Delete Action */}
                    {hoveredMediaId === item.id && (
                      <div
                        className="position-absolute top-0 end-0 m-2"
                        style={{ zIndex: 2 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="btn btn-danger btn-sm rounded-circle shadow-lg d-flex align-items-center justify-content-center p-0"
                          style={{ width: "32px", height: "32px" }}
                          onClick={(e) => handleDeleteSingle(e, item)}
                        >
                          🗑️
                        </button>
                      </div>
                    )}

                    {/* Media Thumbnail */}
                    {isPhoto ? (
                      <img
                        src={mediaUrl}
                        alt={item.sub_folder_name}
                        className="w-100 h-100 object-fit-cover"
                        loading="lazy"
                      />
                    ) : (
                      <video
                        src={mediaUrl}
                        className="w-100 h-100 object-fit-cover"
                        muted
                        loop
                        onMouseEnter={(e) => e.target.play()}
                        onMouseLeave={(e) => {
                          e.target.pause();
                          e.target.currentTime = 0;
                        }}
                      />
                    )}
                  </div>

                  <div className="card-body p-3 d-flex flex-column justify-content-between">
                    <div className="mb-2">
                      <h6 className="fw-bolder text-dark text-truncate mb-1">
                        {item.sub_folder_name || "General Event"}
                      </h6>
                      <div className="d-flex justify-content-between align-items-center small text-secondary">
                        <span className="badge theme-orange-light-bg theme-orange-text border theme-orange-border-light fw-bold">
                          📁 {item.main_folder_name}
                        </span>
                        <span>
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn theme-orange-outline btn-sm w-100 rounded-3 fw-bold mt-2"
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
            );
          })}
        </div>
      )}

      {/* Reusable Pagination Component */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4">
        <div className="text-secondary small fw-medium mb-2 mb-md-0">
          Showing <strong>{items.length}</strong> of{" "}
          <strong>{paginationData.totalItems}</strong> media items
        </div>

        <Pagination
          currentPage={paginationData.currentPage}
          totalPages={paginationData.totalPages}
          hasNextPage={paginationData.hasNextPage}
          hasPrevPage={paginationData.hasPrevPage}
          onPageChange={(newPage) => setCurrentPage(newPage)}
        />
      </div>

      {/* Preview Modal */}
      {previewMedia && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.85)", zIndex: 1060 }}
          onClick={() => setPreviewMedia(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content bg-transparent border-0">
              <div className="d-flex justify-content-between align-items-center text-white mb-2 px-2">
                <div>
                  <h5 className="fw-bold mb-0">
                    {previewMedia.sub_folder_name}
                  </h5>
                  <small className="text-light opacity-75">
                    📁 {previewMedia.main_folder_name}
                  </small>
                </div>
                <button
                  type="button"
                  className="btn btn-light btn-sm rounded-circle fw-bold"
                  onClick={() => setPreviewMedia(null)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body p-0 text-center bg-black rounded-4 overflow-hidden">
                {previewMedia.isPhoto ? (
                  <img
                    src={previewMedia.mediaUrl}
                    alt="Preview"
                    className="img-fluid object-fit-contain"
                    style={{ maxHeight: "80vh" }}
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

      {/* Upload/Edit Modal */}
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
