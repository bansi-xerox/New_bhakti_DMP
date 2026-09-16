import React, { useState, useEffect, useCallback } from 'react';

// Reusable UI Components
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';

// Import API Functions
import {
  getAllBhajans,
  getBhajanById,
  createBhajan,
  updateBhajan,
  deleteBhajan,
  searchBhajans
} from '../../../services/api';

// Import SweetAlert Utility Functions
import {
  showSuccessAlert,
  showErrorAlert,
  confirmMediaDelete,
  showToastAlert
} from '../../../components/common/Alert';

// --- Zero-Dependency Lucide-Style Trash Icon ---
const Trash2Icon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

// --- Zero-Dependency Lucide-Style Search Icon ---
const SearchIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BhajanSahitya = () => {
  const [bhajans, setBhajans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const initialFormState = {
    sahitya_name: '',
    heading_name: '',
    bhajan_name: '',
    bhajan_kadi: '',
    bhajan_rag: '',
    bhajan: '',
    bhajan_bhavarth: '',
    page_no: '',
    youtube_link: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBhajans = useCallback(async (query = '') => {
    try {
      let response;
      if (query && query.trim() !== '') {
        response = await searchBhajans(query.trim());
      } else {
        response = await getAllBhajans();
      }
      setBhajans(response.data.data);
    } catch (error) {
      console.error("Error fetching data", error);
      showErrorAlert("Fetch Error", "Could not load bhajans.");
    }
  }, []);

  useEffect(() => {
    fetchBhajans();
  }, [fetchBhajans]);

  // Live Search as you type
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchBhajans(val);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = async (id) => {
    try {
      const response = await getBhajanById(id);
      const data = response.data.data;
      setFormData({
        ...initialFormState,
        ...data,
        heading_name: data.heading_name || '',
        bhajan_kadi: data.bhajan_kadi || '',
        bhajan_rag: data.bhajan_rag || '',
        bhajan_bhavarth: data.bhajan_bhavarth || '',
        page_no: data.page_no || '',
        youtube_link: data.youtube_link || ''
      });
      setCurrentId(id);
      setIsEditing(true);
      setIsModalOpen(true);
    } catch {
      showErrorAlert("Error", "Could not fetch record details.");
    }
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      ...formData,
      heading_name: formData.heading_name?.trim() || null
    };

    try {
      if (isEditing) {
        await updateBhajan(currentId, payload);
        showSuccessAlert("Success", "ભજન સફળતાપૂર્વક અપડેટ થયું!");
      } else {
        await createBhajan(payload);
        showSuccessAlert("Success", "ભજન સફળતાપૂર્વક ઉમેરાયું!");
      }
      closeModal();
      fetchBhajans(searchQuery);
    } catch (error) {
      console.error("Save error:", error);
      const errorMsg = error.response?.data?.message || "Failed to save record.";
      showErrorAlert("Error", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await confirmMediaDelete("શું તમે ખરેખર આ રેકોર્ડ કાઢી નાખવા માંગો છો?");
    if (result.isConfirmed) {
      try {
        await deleteBhajan(id);
        showToastAlert("Record deleted successfully!");
        fetchBhajans(searchQuery);
      } catch (error) {
        showErrorAlert("Error", "Could not delete the record.");
      }
    }
  };

  return (
    <>
      <style>{`
        .delete-btn-wrapper { display: none; }
        .serial-cell:hover .serial-number { display: none; }
        .serial-cell:hover .delete-btn-wrapper { display: inline-block; }

        .premium-card {
          background-color: white;
          border-radius: 12px;
          border: 1px solid black;
          box-shadow: 0 4px 18px rgba(0,0,0,0.03);
        }

        .table-custom th, .table-custom td {
          border: 1px solid #fbd3bc !important;
          vertical-align: middle;
        }
        .table-custom th {
          border-bottom: 2px solid #f26522 !important;
          background-color: #fef5ee !important;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #fef8f4;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f26522;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d95316;
        }
      `}</style>

      <div
        className="w-100 d-flex flex-column gap-3"
        style={{
          backgroundColor: '#fdf9f1',
          minHeight: '100vh',
          padding: '16px',
          boxSizing: 'border-box'
        }}
      >
        {/* Top Header & Action Row */}
        <div className="premium-card p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 flex-shrink-0">
          <div>
            <h4 className="fw-bold mb-0 text-dark">Bhajan & Satsang Library</h4>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div style={{ width: '320px', position: 'relative' }}>
              {/* Lucide-Style Search Icon */}
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#888', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                <SearchIcon size={16} />
              </span>
              {/* Live Search Input */}
              <input
                type="text"
                className="form-control shadow-sm"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="સાહિત્ય, શીર્ષક, ભજન કે રાગ દ્વારા શોધો..."
                style={{
                  borderRadius: '50px',
                  paddingLeft: '42px',
                  paddingRight: '20px',
                  borderColor: '#fbd3bc',
                  fontSize: '13px'
                }}
              />
            </div>
            <Button
              onClick={openAddModal}
              className="btn px-4 py-2 fw-bold text-white shadow-sm"
              style={{ backgroundColor: '#f26522', borderRadius: '50px', fontSize: '14px' }}
            >
              + Add New Bhajan
            </Button>
          </div>
        </div>

        {/* Data Table Card */}
        <div
          className="premium-card overflow-hidden d-flex flex-column"
          style={{
            borderColor: '#fbd3bc',
            maxHeight: 'calc(100vh - 140px)'
          }}
        >
          <div className="card-body p-0 overflow-auto custom-scrollbar">
            <table className="table table-hover align-middle mb-0 table-custom" style={{ minWidth: '900px' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th className="py-3 px-4 text-secondary" style={{ width: '80px' }}>ક્રમ</th>
                  <th className="py-3 px-4 text-secondary">સાહિત્યનું નામ</th>
                  <th className="py-3 px-4 text-secondary">શીર્ષકનું નામ</th>
                  <th className="py-3 px-4 text-secondary">ભજનનું નામ</th>
                  <th className="py-3 px-4 text-secondary">ભજનની કડી</th>
                  <th className="py-3 px-4 text-secondary">ભજનનો રાગ</th>
                  <th className="py-3 px-4 text-secondary">પૃષ્ઠ ક્રમાંક</th>
                  <th className="py-3 px-4 text-secondary text-center">YouTube Link</th>
                </tr>
              </thead>
              <tbody>
                {bhajans.length > 0 ? (
                  bhajans.map((item, index) => (
                    <tr
                      key={item._id}
                      onDoubleClick={() => openEditModal(item._id)}
                      title="Double-click to edit"
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="py-3 px-4 serial-cell" style={{ width: '80px', minWidth: '80px' }}>
                        <span className="serial-number text-secondary fw-bold">{index + 1}</span>
                        <div className="delete-btn-wrapper">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item._id);
                            }}
                            className="btn btn-sm btn-danger border-0 p-1 d-flex align-items-center justify-content-center shadow-sm"
                            style={{ width: '28px', height: '28px', borderRadius: '4px' }}
                            title="Delete"
                          >
                            <Trash2Icon size={14} />
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-dark">{item.sahitya_name}</td>
                      <td className="py-3 px-4 text-muted">{item.heading_name || '-'}</td>
                      <td className="py-3 px-4 fw-bold" style={{ color: '#f26522' }}>{item.bhajan_name}</td>
                      <td className="py-3 px-4 text-muted text-truncate" style={{ maxWidth: '200px' }}>{item.bhajan_kadi}</td>
                      <td className="py-3 px-4 text-muted">{item.bhajan_rag}</td>
                      <td className="py-3 px-4 text-muted">{item.page_no}</td>

                      <td className="py-3 px-4 text-center">
                        {item.youtube_link ? (
                          <a
                            href={item.youtube_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-danger fw-bold text-decoration-none"
                            title="Watch on YouTube"
                          >
                            ▶ Play
                          </a>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-5 text-center text-muted">
                      કોઈ ડેટા મળ્યો નથી. (No data found)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Reusable Custom Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={isEditing ? 'ભજનમાં સુધારો કરો (Edit)' : 'નવું ભજન ઉમેરો (Add New)'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="row g-2">
            <div className="col-md-6 mb-2">
              <Input
                name="sahitya_name"
                value={formData.sahitya_name}
                onChange={handleInputChange}
                placeholder="સાહિત્યનું નામ *"
                required
              />
            </div>
            <div className="col-md-6 mb-2">
              <Input
                name="heading_name"
                value={formData.heading_name}
                onChange={handleInputChange}
                placeholder="શીર્ષકનું નામ"
              />
            </div>
            <div className="col-md-6 mb-2">
              <Input
                name="bhajan_name"
                value={formData.bhajan_name}
                onChange={handleInputChange}
                placeholder="ભજનનું નામ *"
                required
              />
            </div>
            <div className="col-md-6 mb-2">
              <Input
                name="bhajan_kadi"
                value={formData.bhajan_kadi}
                onChange={handleInputChange}
                placeholder="ભજનની કડી"
              />
            </div>
            <div className="col-md-6 mb-2">
              <Input
                name="bhajan_rag"
                value={formData.bhajan_rag}
                onChange={handleInputChange}
                placeholder="ભજનનો રાગ"
              />
            </div>
            <div className="col-md-6 mb-2">
              <Input
                name="page_no"
                value={formData.page_no}
                onChange={handleInputChange}
                placeholder="પૃષ્ઠ ક્રમાંક"
              />
            </div>
            <div className="col-md-12 mb-2">
              <Input
                type="url"
                name="youtube_link"
                value={formData.youtube_link}
                onChange={handleInputChange}
                placeholder="YouTube Link"
              />
            </div>

            <div className="col-12 mb-4">
              <textarea
                required
                name="bhajan"
                value={formData.bhajan}
                onChange={handleInputChange}
                rows="4"
                className="form-control"
                placeholder="ભજનનો પાઠ *"
              />
            </div>
            <div className="col-12 mb-4">
              <textarea
                name="bhajan_bhavarth"
                value={formData.bhajan_bhavarth}
                onChange={handleInputChange}
                rows="3"
                className="form-control"
                placeholder="ભજનનો ભાવાર્થ"
              />
            </div>

            <div className="col-12 d-flex justify-content-end gap-2 mt-3 pt-3">
              <Button type="button" onClick={closeModal} className="btn btn-light px-4 py-2 text-muted fw-bold">
                રદ કરો
              </Button>
              <Button type="submit" loading={isLoading} className="btn px-4 py-2 fw-bold text-white shadow-sm" style={{ backgroundColor: '#f26522' }}>
                {isEditing ? 'અપડેટ કરો' : 'સાચવો'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
};

export default BhajanSahitya;