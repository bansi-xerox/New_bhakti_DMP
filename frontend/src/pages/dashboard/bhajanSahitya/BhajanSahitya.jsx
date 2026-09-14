import React, { useState, useEffect, useCallback } from 'react';

// Reusable UI Components
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import SearchBar from '../../../components/common/SearchBar';

// Import API Functions
import {
  getAllBhajans,
  getBhajanById,
  createBhajan,
  updateBhajan,
  deleteBhajan
} from '../../../services/api';

// Import SweetAlert Utility Functions
import {
  showSuccessAlert,
  showErrorAlert,
  confirmMediaDelete,
  showToastAlert
} from '../../../components/common/Alert';

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

  const fetchBhajans = useCallback(async () => {
    try {
      const response = await getAllBhajans();
      setBhajans(response.data.data);
    } catch (error) {
      console.error("Error fetching data", error);
      showErrorAlert("Fetch Error", "Could not load bhajans.");
    }
  }, []);

  useEffect(() => {
    fetchBhajans();
  }, [fetchBhajans]);

  const handleSearchSubmit = () => {
    fetchBhajans();
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
      setFormData(response.data.data);
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
    try {
      if (isEditing) {
        await updateBhajan(currentId, formData);
        showSuccessAlert("Success", "ભજન સફળતાપૂર્વક અપડેટ થયું!");
      } else {
        await createBhajan(formData);
        showSuccessAlert("Success", "ભજન સફળતાપૂર્વક ઉમેરાયું!");
      }
      closeModal();
      fetchBhajans();
    } catch (error) {
      console.error("Save error:", error);
      showErrorAlert("Error", "Failed to save record.");
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
        fetchBhajans();
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
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 4px 18px rgba(0,0,0,0.03);
        }

        /* Table Border & Clean Look */
        .table-custom th, .table-custom td {
          border-color: #f1ebd9 !important;
          vertical-align: middle;
        }
        .table-custom th {
          border-bottom: 2px solid #e6dcbe !important;
        }

        /* --- Custom Orange Scrollbar --- */
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

      {/* Main Container - ચારેય બાજુ બિલકુલ સરખી 20px સ્પેસ */}
      <div
        className="w-100 d-flex flex-column gap-3"
        style={{
          backgroundColor: '#fdf9f1',
          height: '100vh',
          padding: '20px',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {/* Top Header & Action Row */}
        <div className="premium-card p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 flex-shrink-0">
          <div>
            <h4 className="fw-bold mb-0 text-dark">Bhajan & Satsang Library</h4>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            <div style={{ width: '280px' }}>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={handleSearchSubmit}
                placeholder="Search bhajans..."
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

        {/* Data Table Card with Proper Border */}
        <div className="premium-card overflow-hidden flex-grow-1 d-flex flex-column border" style={{ minHeight: 0, borderColor: '#e6dcbe !important' }}>
          <div className="card-body p-0 overflow-auto flex-grow-1 custom-scrollbar">
            <table className="table table-hover align-middle mb-0 table-custom" style={{ minWidth: '900px' }}>
              <thead style={{ backgroundColor: '#fef8f4', position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th className="py-3 px-4 text-secondary" style={{ width: '80px', backgroundColor: '#fef8f4' }}>ક્રમ</th>
                  <th className="py-3 px-4 text-secondary" style={{ backgroundColor: '#fef8f4' }}>સાહિત્યનું નામ</th>
                  <th className="py-3 px-4 text-secondary" style={{ backgroundColor: '#fef8f4' }}>શીર્ષકનું નામ</th>
                  <th className="py-3 px-4 text-secondary" style={{ backgroundColor: '#fef8f4' }}>ભજનનું નામ</th>
                  <th className="py-3 px-4 text-secondary" style={{ backgroundColor: '#fef8f4' }}>ભજનની કડી</th>
                  <th className="py-3 px-4 text-secondary" style={{ backgroundColor: '#fef8f4' }}>ભજનનો રાગ</th>
                  <th className="py-3 px-4 text-secondary" style={{ backgroundColor: '#fef8f4' }}>પૃષ્ઠ ક્રમાંક</th>
                  <th className="py-3 px-4 text-secondary text-center" style={{ backgroundColor: '#fef8f4' }}>YouTube Link</th>
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
                            className="btn btn-sm btn-danger border-0 py-1 px-2 fw-bold"
                            style={{ fontSize: '0.75rem', borderRadius: '4px' }}
                          >
                            Delete
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
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <Input label="સાહિત્યનું નામ *" name="sahitya_name" value={formData.sahitya_name} onChange={handleInputChange} required />
            </div>
            <div className="col-md-6">
              <Input
                label="શીર્ષકનું નામ"
                name="heading_name"
                value={formData.heading_name}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6">
              <Input label="ભજનનું નામ *" name="bhajan_name" value={formData.bhajan_name} onChange={handleInputChange} required />
            </div>
            <div className="col-md-6">
              <Input label="ભજનની કડી" name="bhajan_kadi" value={formData.bhajan_kadi} onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
              <Input label="ભજનનો રાગ" name="bhajan_rag" value={formData.bhajan_rag} onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
              <Input
                label="પૃષ્ઠ ક્રમાંક"
                name="page_no"
                value={formData.page_no}
                onChange={handleInputChange}
                placeholder="5-10"
              />
            </div>
            <div className="col-md-12">
              <Input label="YouTube Link" type="url" name="youtube_link" value={formData.youtube_link} onChange={handleInputChange} placeholder="https://youtube.com/..." />
            </div>

            <div className="col-12 mt-3">
              <label className="form-label fw-bold text-secondary small">ભજનનો પાઠ *</label>
              <textarea required name="bhajan" value={formData.bhajan} onChange={handleInputChange} rows="5" className="form-control" />
            </div>
            <div className="col-12 mt-3">
              <label className="form-label fw-bold text-secondary small">ભજનનો અર્થ</label>
              <textarea name="bhajan_bhavarth" value={formData.bhajan_bhavarth} onChange={handleInputChange} rows="3" className="form-control" />
            </div>

            <div className="col-12 d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
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