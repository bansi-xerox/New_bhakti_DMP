import React, { useState, useEffect } from 'react';
import { confirmMediaDelete } from '../../../components/common/Alert';

const API_SERVER_URL = process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

function GalleryDisplay({ items, onDeleteSingle, onDeleteBulk, onOpenUploadModal }) {
  const [activeMainFolder, setActiveMainFolder] = useState(null);
  const [activeSubFolder, setActiveSubFolder] = useState(null);
  const [activeTab, setActiveTab] = useState('Photos');

  const [selectedIds, setSelectedIds] = useState([]);
  const [modalItem, setModalItem] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [hoveredCardId, setHoveredCardId] = useState(null);

  const mainFolderList = Array.from(new Set(items.map((i) => i.main_folder_name)));

  const subFolderList = Array.from(
    new Set(
      items
        .filter((i) => i.main_folder_name === activeMainFolder)
        .map((i) => i.sub_folder_name)
    )
  );

  const activeMediaList = items.filter(
    (i) =>
      i.main_folder_name === activeMainFolder &&
      i.sub_folder_name === activeSubFolder
  );

  const availablePhotos = activeMediaList.filter((i) => i.photo_path);
  const availableVideos = activeMediaList.filter((i) => i.video_path);
  const photoCount = availablePhotos.length;
  const videoCount = availableVideos.length;

  useEffect(() => {
    if (photoCount > 0) {
      setActiveTab('Photos');
    } else if (videoCount > 0) {
      setActiveTab('Videos');
    }
  }, [activeSubFolder, photoCount, videoCount]);

  const currentDisplayList = activeTab === 'Photos' ? availablePhotos : availableVideos;

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDeleteClick = async () => {
    const count = selectedIds.length;
    const typeLabel = activeTab.toLowerCase();
    const confirm = await confirmMediaDelete(`Are you sure you want to delete ${count} ${typeLabel}?`);

    if (confirm.isConfirmed) {
      await onDeleteBulk(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <div>
      {/* 1. Header Metrics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-lg-3 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-uppercase fw-bold text-muted" style={{ fontSize: '11px' }}>Total Albums</span>
              <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1">Root</span>
            </div>
            <h3 className="fw-bold mb-0 text-dark">{mainFolderList.length}</h3>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-uppercase fw-bold text-muted" style={{ fontSize: '11px' }}>Sub Folders</span>
              <span className="badge bg-success-subtle text-success rounded-pill px-2 py-1">Events</span>
            </div>
            <h3 className="fw-bold mb-0 text-dark">
              {Array.from(new Set(items.map((i) => `${i.main_folder_name}/${i.sub_folder_name}`))).length}
            </h3>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-uppercase fw-bold text-muted" style={{ fontSize: '11px' }}>Photos</span>
              <span className="badge bg-warning-subtle text-warning rounded-pill px-2 py-1">JPG/PNG</span>
            </div>
            <h3 className="fw-bold mb-0 text-dark">{items.filter((i) => i.photo_path).length}</h3>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-uppercase fw-bold text-muted" style={{ fontSize: '11px' }}>Videos</span>
              <span className="badge bg-danger-subtle text-danger rounded-pill px-2 py-1">MP4</span>
            </div>
            <h3 className="fw-bold mb-0 text-dark">{items.filter((i) => i.video_path).length}</h3>
          </div>
        </div>
      </div>

      {/* 2. Main Content Box */}
      <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
        {/* Navigation Breadcrumb */}
        <div className="d-flex align-items-center justify-content-between pb-3 mb-4 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-light fw-bold px-3 rounded-pill"
              style={{ color: '#4f46e5' }}
              onClick={() => {
                setActiveMainFolder(null);
                setActiveSubFolder(null);
              }}
            >
              Gallery Root
            </button>
            {activeMainFolder && (
              <>
                <span className="text-muted">/</span>
                <button
                  type="button"
                  className="btn btn-sm btn-light fw-bold text-dark px-3 rounded-pill"
                  onClick={() => setActiveSubFolder(null)}
                >
                  {activeMainFolder}
                </button>
              </>
            )}
            {activeSubFolder && (
              <>
                <span className="text-muted">/</span>
                <span className="badge bg-primary text-white fs-6 px-3 py-2 rounded-pill" style={{ backgroundColor: '#4f46e5' }}>
                  {activeSubFolder}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Level 1: Main Folders Display */}
        {!activeMainFolder && (
          <div>
            {mainFolderList.length === 0 ? (
              <div className="text-center py-5">
                <div className="fs-1 text-muted mb-2">📁</div>
                <h5 className="fw-bold text-secondary">No Albums Found</h5>
                <p className="text-muted mb-3">Upload your first files using the button above.</p>
                <button
                  type="button"
                  className="btn text-white px-4 rounded-pill shadow-sm"
                  style={{ backgroundColor: '#4f46e5' }}
                  onClick={onOpenUploadModal}
                >
                  + Upload First Media
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {mainFolderList.map((folder) => {
                  const count = items.filter((i) => i.main_folder_name === folder).length;
                  return (
                    <div key={folder} className="col-xl-3 col-lg-4 col-md-6">
                      <div
                        className="card border rounded-4 p-4 text-center cursor-pointer shadow-sm"
                        style={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.borderColor = '#6366f1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                        onClick={() => setActiveMainFolder(folder)}
                      >
                        <div className="fs-1 mb-2">📁</div>
                        <h5 className="fw-bold text-dark mb-1 text-truncate">{folder}</h5>
                        <small className="text-muted">{count} items inside</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Level 2: Sub Folders Display */}
        {activeMainFolder && !activeSubFolder && (
          <div className="row g-4">
            {subFolderList.map((sub) => {
              const subCount = items.filter(
                (i) => i.main_folder_name === activeMainFolder && i.sub_folder_name === sub
              ).length;
              return (
                <div key={sub} className="col-xl-3 col-lg-4 col-md-6">
                  <div
                    className="card border rounded-4 p-4 text-center cursor-pointer shadow-sm"
                    style={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = '#6366f1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                    onClick={() => setActiveSubFolder(sub)}
                  >
                    <div className="fs-1 mb-2">📂</div>
                    <h5 className="fw-bold text-dark mb-1 text-truncate">{sub}</h5>
                    <small className="text-muted">{subCount} files stored</small>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Level 3: Photos / Videos Grid View */}
        {activeSubFolder && (
          <div>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
              <div>
                {availablePhotos.length > 0 && availableVideos.length > 0 && (
                  <div className="btn-group bg-light p-1 rounded-pill">
                    <button
                      type="button"
                      className={`btn btn-sm rounded-pill px-4 fw-bold ${
                        activeTab === 'Photos' ? 'btn-white bg-white shadow-sm text-primary' : 'text-secondary'
                      }`}
                      onClick={() => {
                        setActiveTab('Photos');
                        setSelectedIds([]);
                      }}
                    >
                      Photos ({availablePhotos.length})
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm rounded-pill px-4 fw-bold ${
                        activeTab === 'Videos' ? 'btn-white bg-white shadow-sm text-primary' : 'text-secondary'
                      }`}
                      onClick={() => {
                        setActiveTab('Videos');
                        setSelectedIds([]);
                      }}
                    >
                      Videos ({availableVideos.length})
                    </button>
                  </div>
                )}
              </div>

              {selectedIds.length > 0 && (
                <div className="d-flex align-items-center gap-3">
                  <span className="fw-bold text-dark small">{selectedIds.length} Selected</span>
                  <button className="btn btn-danger btn-sm px-3 rounded-pill fw-semibold shadow-sm" onClick={handleBulkDeleteClick}>
                    Delete Selected
                  </button>
                </div>
              )}
            </div>

            <div className="row g-3">
              {currentDisplayList.map((item) => {
                const isPhoto = Boolean(item.photo_path);
                const fileUrl = `${API_SERVER_URL}/uploads/${isPhoto ? item.photo_path : item.video_path}`;
                const isHovered = hoveredCardId === item.id;

                return (
                  <div key={item.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                    <div
                      className="position-relative rounded-4 overflow-hidden shadow-sm bg-dark"
                      style={{ height: '220px', cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredCardId(item.id)}
                      onMouseLeave={() => setHoveredCardId(null)}
                      onClick={() => {
                        setModalItem({ ...item, fileUrl, isPhoto });
                        setZoomScale(1);
                      }}
                    >
                      {isPhoto ? (
                        <img src={fileUrl} alt="Gallery item" className="w-100 h-100 object-fit-cover d-block" />
                      ) : (
                        <video
                          src={fileUrl}
                          className="w-100 h-100 object-fit-cover d-block"
                          muted
                          loop
                          onMouseEnter={(e) => e.target.play()}
                          onMouseLeave={(e) => {
                            e.target.pause();
                            e.target.currentTime = 0;
                          }}
                        />
                      )}

                      {/* Hover Overlay with Delete & Checkbox */}
                      <div
                        className={`position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-between align-items-start p-3 ${
                          isHovered ? 'opacity-100' : 'opacity-0'
                        }`}
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.45)',
                          transition: 'opacity 0.2s ease',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input mt-1"
                          style={{ width: '22px', height: '22px', cursor: 'pointer' }}
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center shadow"
                          style={{ width: '32px', height: '32px' }}
                          title="Delete"
                          onClick={(e) => onDeleteSingle(e, item)}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox / Zoom Modal */}
      {modalItem && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.92)', zIndex: 1060 }}
          onClick={() => setModalItem(null)}
        >
          <div
            className="position-relative d-flex flex-column align-items-center"
            style={{ maxWidth: '90vw', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="btn btn-light rounded-circle position-absolute top-0 end-0 m-2 fw-bold shadow"
              style={{ zIndex: 1070 }}
              onClick={() => setModalItem(null)}
            >
              ✕
            </button>

            {modalItem.isPhoto ? (
              <div className="text-center overflow-auto p-2" style={{ maxHeight: '80vh' }}>
                <img
                  src={modalItem.fileUrl}
                  alt="Full preview"
                  className="img-fluid rounded-4 shadow-lg"
                  style={{
                    maxHeight: '75vh',
                    transform: `scale(${zoomScale})`,
                    transition: 'transform 0.2s ease',
                  }}
                />
                <div className="d-flex justify-content-center gap-2 mt-3">
                  <button
                    type="button"
                    className="btn btn-light btn-sm fw-bold px-3 shadow rounded-pill"
                    onClick={() => setZoomScale((z) => Math.min(z + 0.25, 3))}
                  >
                    Zoom In (+)
                  </button>
                  <button
                    type="button"
                    className="btn btn-light btn-sm fw-bold px-3 shadow rounded-pill"
                    onClick={() => setZoomScale((z) => Math.max(z - 0.25, 0.5))}
                  >
                    Zoom Out (-)
                  </button>
                  <button
                    type="button"
                    className="btn btn-light btn-sm fw-bold px-3 shadow rounded-pill"
                    onClick={() => setZoomScale(1)}
                  >
                    Reset
                  </button>
                </div>
              </div>
            ) : (
              <video
                src={modalItem.fileUrl}
                controls
                autoPlay
                className="rounded-4 shadow-lg"
                style={{ maxWidth: '100%', maxHeight: '80vh' }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GalleryDisplay;