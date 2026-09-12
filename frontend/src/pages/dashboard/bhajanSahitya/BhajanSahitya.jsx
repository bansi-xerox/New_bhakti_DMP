import React, { useState, useEffect, useCallback } from 'react';

// Reusable UI Components
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import SearchBar from '../../../components/common/SearchBar';

// 2. Import API Functions
import {
  getAllBhajans,
  getBhajanById,
  createBhajan,
  updateBhajan,
  deleteBhajan
} from '../../../services/api';

// 3. Import SweetAlert Utility Functions
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

  // Search & Pagination States
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

        /* --- Custom Orange Scrollbar --- */
        
        /* For Chrome, Safari, and Edge */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #fff7ed; /* Very light orange track */
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); /* Matches your button */
          border-radius: 10px;
          border: 2px solid #fff7ed;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #c2410c;
        }

        /* For Firefox */
        .overflow-auto, .table-responsive {
          scrollbar-width: thin;
          scrollbar-color: #ea580c #fff7ed;
        }
      `}</style>
<div
        className="container-fluid px-3 px-md-4 pb-3 pb-md-4 pt-0 d-flex flex-column"
        style={{
          backgroundColor: '#fdf9f1',
          flex: 1,
          minHeight: 0,
          height: '100vh',       
          maxHeight: '100vh', 
          overflow: 'hidden'     
        }}
      >
        {/* Header Card */}
        <div className="card shadow-sm border-0 rounded-4 mb-4">
          <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 p-4">
            <div>
              <span className="badge text-uppercase mb-2 px-3 py-2" style={{ backgroundColor: '#ffeedc', color: '#f26522', borderRadius: '50px', fontWeight: 'bold' }}>
                BHAJAN & SATSANG LIBRARY
              </span>
              <h2 className="fw-bold mb-1 text-dark">Bhajan Sahitya Manager</h2>
              <p className="text-muted mb-0 small">Organize and manage all bhajan texts and meanings effortlessly.</p>
            </div>
            <Button
              onClick={openAddModal}
              className="btn px-4 py-2 fw-bold text-white shadow-sm"
              style={{ backgroundColor: '#f26522', borderRadius: '50px' }}
            >
              + નવું ઉમેરો (Add New)
            </Button>
          </div>
        </div>

        {/* Search Bar Row */}
        <div className="card shadow-sm border-0 rounded-4 mb-4">
          <div className="card-body p-3">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearchSubmit}
              placeholder="Search by bhajan, author, rag, kadi..."
            />
          </div>
        </div>

        {/* Data Table Card */}
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
          {/* Added table-responsive for horizontal mobile scroll */}
          <div className="card-body p-0 overflow-auto flex-grow-1 table-responsive">
            {/* Kept minWidth so columns don't crush on mobile */}
            <table className="table table-hover align-middle mb-0" style={{ minWidth: '900px' }}>
              <thead style={{ backgroundColor: '#fef8f4', position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th className="py-3 px-4 text-secondary" style={{ width: '80px' }}>ક્રમ</th>
                  <th className="py-3 px-4 text-secondary">સાહિત્યનું નામ</th>
                  <th className="py-3 px-4 text-secondary">શીર્ષકનું નામ</th>
                  <th className="py-3 px-4 text-secondary">ભજનનું નામ</th>
                  <th className="py-3 px-4 text-secondary">ભજનની કડી</th>
                  <th className="py-3 px-4 text-secondary">ભજનનો રાગ</th>
                  <th className="py-3 px-4 text-secondary">પૃષ્ઠ ક્રમાંક</th>
                  <th className="py-3 px-4 text-secondary text-center">YouTube Link</th> {/* <-- ADDED HEADER */}
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
                      <td className="py-3 px-4 text-muted">{item.heading_name}</td>
                      <td className="py-3 px-4 fw-bold" style={{ color: '#f26522' }}>{item.bhajan_name}</td>
                      <td className="py-3 px-4 text-muted text-truncate" style={{ maxWidth: '200px' }}>{item.bhajan_kadi}</td>
                      <td className="py-3 px-4 text-muted">{item.bhajan_rag}</td>
                      <td className="py-3 px-4 text-muted">{item.page_no}</td>

                      {/* <-- ADDED YOUTUBE LINK CELL --> */}
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
              <Input label="શીર્ષકનું નામ *" name="heading_name" value={formData.heading_name} onChange={handleInputChange} required />
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
              <Input label="પૃષ્ઠ ક્રમાંક" type="number" name="page_no" value={formData.page_no} onChange={handleInputChange} />
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