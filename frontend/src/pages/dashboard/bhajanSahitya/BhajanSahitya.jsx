import React, { useState, useEffect, useCallback } from 'react';

import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';

import {
  getAllBhajans,
  getBhajanById,
  createBhajan,
  updateBhajan,
  deleteBhajan,
  searchBhajans
} from '../../../services/api';

import {
  showSuccessAlert,
  showErrorAlert,
  confirmMediaDelete,
  showToastAlert
} from '../../../components/common/Alert';

// =========================================================
// Trash Icon
// =========================================================

const Trash2Icon = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

// =========================================================
// Search Icon
// =========================================================

const SearchIcon = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// =========================================================
// Main Component
// =========================================================

const BhajanSahitya = () => {
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

  const [bhajans, setBhajans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [searchQuery, setSearchQuery] = useState('');

  // =========================================================
  // Fetch Bhajans
  // =========================================================

  const fetchBhajans = useCallback(async (query = '') => {
    try {
      let response;

      if (query && query.trim() !== '') {
        response = await searchBhajans(query.trim());
      } else {
        response = await getAllBhajans();
      }

      setBhajans(response?.data?.data || []);
    } catch (error) {
      console.error('Error fetching bhajans:', error);

      showErrorAlert(
        'Fetch Error',
        'Could not load bhajans.'
      );
    }
  }, []);

  // =========================================================
  // Initial Load
  // =========================================================

  useEffect(() => {
    fetchBhajans();
  }, [fetchBhajans]);

  // =========================================================
  // Search
  // =========================================================

  const handleSearchChange = (e) => {
    const value = e.target.value;

    setSearchQuery(value);
    fetchBhajans(value);
  };

  // =========================================================
  // Form Input Change
  // =========================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  // =========================================================
  // Open Add Modal
  // =========================================================

  const openAddModal = () => {
    setFormData({ ...initialFormState });
    setCurrentId(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // =========================================================
  // Open Edit Modal
  // =========================================================

  const openEditModal = async (id) => {
    try {
      const response = await getBhajanById(id);
      const data = response?.data?.data || {};

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
    } catch (error) {
      console.error('Edit fetch error:', error);

      showErrorAlert(
        'Error',
        'Could not fetch record details.'
      );
    }
  };

  // =========================================================
  // Close Modal
  // =========================================================

  const closeModal = () => {
    if (!isLoading) {
      setIsModalOpen(false);
    }
  };

  // =========================================================
  // Submit Form
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    setIsLoading(true);

    const payload = {
      ...formData,
      heading_name: formData.heading_name?.trim() || null
    };

    try {
      if (isEditing) {
        await updateBhajan(currentId, payload);

        showSuccessAlert(
          'Success',
          'ભજન સફળતાપૂર્વક અપડેટ થયું!'
        );
      } else {
        await createBhajan(payload);

        showSuccessAlert(
          'Success',
          'ભજન સફળતાપૂર્વક ઉમેરાયું!'
        );
      }

      setIsModalOpen(false);
      await fetchBhajans(searchQuery);
    } catch (error) {
      console.error('Save error:', error);

      const errorMessage =
        error?.response?.data?.message ||
        'Failed to save record.';

      showErrorAlert(
        'Error',
        errorMessage
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // Delete Bhajan
  // =========================================================

  const handleDelete = async (id) => {
    const result = await confirmMediaDelete(
      'શું તમે ખરેખર આ રેકોર્ડ કાઢી નાખવા માંગો છો?'
    );

    if (!result?.isConfirmed) {
      return;
    }

    try {
      await deleteBhajan(id);

      showToastAlert(
        'Record deleted successfully!'
      );

      await fetchBhajans(searchQuery);
    } catch (error) {
      console.error('Delete error:', error);

      showErrorAlert(
        'Error',
        'Could not delete the record.'
      );
    }
  };

  // =========================================================
  // JSX
  // =========================================================

  return (
    <>
      <style>{`
        /* =====================================================
           PAGE
           ===================================================== */

        .bhajan-page {
          width: 100%;
          height: 100%;
          min-height: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
          flex-grow: 1;
          padding: 16px;
          box-sizing: border-box;
          background-color: #fdf9f1;
          overflow-y: auto;
        }

        /* =====================================================
           PREMIUM CARD
           ===================================================== */

        .premium-card {
          background-color: #ffffff;
          border: 1px solid #fbd3bc;
          border-radius: 14px;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
        }

        /* =====================================================
           HEADER
           ===================================================== */

        .bhajan-header {
          width: 100%;
          flex-shrink: 0;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-sizing: border-box;
        }

        .bhajan-header-title {
          margin: 0;
          font-size: 20px;
          line-height: 28px;
          font-weight: 700;
          color: #1f2937;
        }

        .bhajan-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .bhajan-search-wrapper {
          width: 320px;
          position: relative;
        }

        .bhajan-search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #888;
          display: flex;
          align-items: center;
          pointer-events: none;
          z-index: 2;
        }

        .bhajan-search-input {
          width: 100% !important;
          height: 40px !important;
          margin: 0 !important;
          padding: 8px 18px 8px 42px !important;
          box-sizing: border-box !important;
          border: 1px solid #fbd3bc !important;
          border-radius: 50px !important;
          background-color: #ffffff !important;
          font-size: 13px !important;
          outline: none !important;
        }

        .bhajan-search-input:focus {
          border-color: #f26522 !important;
          box-shadow: 0 0 0 3px rgba(242, 101, 34, 0.08) !important;
        }

        .bhajan-add-button {
          height: 40px !important;
          padding: 0 18px !important;
          border: none !important;
          border-radius: 50px !important;
          background-color: #f26522 !important;
          color: #ffffff !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          white-space: nowrap;
          box-shadow: 0 3px 8px rgba(242, 101, 34, 0.18) !important;
        }

        .bhajan-add-button:hover {
          background-color: #e85a17 !important;
        }

        /* =====================================================
           TABLE
           ===================================================== */

        .table-custom-wrapper {
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background-color: #ffffff;
  border: 1px solid #d49a7a !important;
  border-radius: 14px;
  position: relative;
}

.table-custom-wrapper::before {
  content: "";
  position: absolute;
  top: -1px;
  left: -1px;
  width: 22px;
  height: 22px;

  border-top: 2px solid #c45a24;
  border-left: 2px solid #c45a24;

  border-top-left-radius: 14px;

  pointer-events: none;
  z-index: 10;
}

        .table-responsive-wrapper {
          width: 100%;
          height: 100%;
          overflow-x: auto;
          overflow-y: auto;
        }

        .table-custom {
          width: 100%;
          min-width: 900px;
          margin: 0 !important;
          border-collapse: collapse !important;
          border-spacing: 0 !important;
        }

       .table-custom th,
        .table-custom td {
         border-right: 1px solid #c45a24 !important;
border-bottom: 1px solid #c45a24 !important;
          vertical-align: middle !important;
        }

        .table-custom th:last-child,
        .table-custom td:last-child {
          border-right: none !important;
        }

        .table-custom th {
          background-color: #fef5ee !important;
          border-bottom: 2px solid #f26522 !important;
          color: #64748b !important;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .table-custom td {
          font-size: 13px;
        }

        .table-custom tbody tr:hover {
          background-color: #fffaf6 !important;
        }

        /* =====================================================
           DELETE BUTTON
           ===================================================== */

        .serial-cell {
          position: relative;
        }

        .delete-btn-wrapper {
          display: none;
        }

        .serial-cell:hover .serial-number {
          display: none;
        }

        .serial-cell:hover .delete-btn-wrapper {
          display: inline-flex;
        }

        /* =====================================================
           MODAL FORM
           
           IMPORTANT:
           No Bootstrap row / mb-* spacing is used here.
           This gives complete control over vertical gaps.
           ===================================================== */

        .bhajan-modal-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 7px !important;
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box;
        }

        /* =====================================================
           TWO COLUMN ROW
           ===================================================== */

        .bhajan-form-row {
          width: 100%;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          column-gap: 14px;
          row-gap: 7px;
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box;
        }

        /* =====================================================
           FIELD
           ===================================================== */

        .bhajan-form-field {
          width: 100%;
          min-width: 0;
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box;
        }

        .bhajan-form-full {
          width: 100%;
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box;
        }

        /* =====================================================
           INPUT COMPONENT RESET
           
           Input component may internally use mb-3/form-group.
           These rules remove that spacing.
           ===================================================== */

        .bhajan-modal-form .mb-5,
        .bhajan-modal-form .mb-4,
        .bhajan-modal-form .mb-3,
        .bhajan-modal-form .mb-2,
        .bhajan-modal-form .mb-1,
        .bhajan-modal-form .mt-5,
        .bhajan-modal-form .mt-4,
        .bhajan-modal-form .mt-3,
        .bhajan-modal-form .mt-2,
        .bhajan-modal-form .mt-1,
        .bhajan-modal-form .form-group,
        .bhajan-modal-form .form-floating {
          margin-top: 0 !important;
          margin-bottom: 0 !important;
        }

        .bhajan-modal-form .form-control,
        .bhajan-modal-form input,
        .bhajan-modal-form textarea {
          box-sizing: border-box !important;
          margin: 0 !important;
          width: 100% !important;
          border: 1px solid #dfe5ec !important;
          border-radius: 10px !important;
          background-color: #fbfcfe !important;
          color: #1e293b !important;
          outline: none !important;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02) !important;
          transition:
            border-color 0.2s ease,
            background-color 0.2s ease,
            box-shadow 0.2s ease !important;
        }

        /* =====================================================
           NORMAL INPUT
           ===================================================== */

        .bhajan-modal-form input,
        .bhajan-modal-form .form-control:not(textarea) {
          height: 42px !important;
          min-height: 42px !important;
          padding: 8px 13px !important;
          font-size: 13.5px !important;
          font-weight: 500 !important;
          line-height: 24px !important;
        }

        /* =====================================================
           PLACEHOLDER
           ===================================================== */

        .bhajan-modal-form input::placeholder,
        .bhajan-modal-form textarea::placeholder,
        .bhajan-modal-form .form-control::placeholder {
          color: #94a3b8 !important;
          opacity: 1 !important;
          font-size: 13px !important;
          font-weight: 400 !important;
        }

        /* =====================================================
           HOVER
           ===================================================== */

        .bhajan-modal-form input:hover,
        .bhajan-modal-form textarea:hover,
        .bhajan-modal-form .form-control:hover {
          background-color: #ffffff !important;
          border-color: #cbd5e1 !important;
        }

        /* =====================================================
           FOCUS
           ===================================================== */

        .bhajan-modal-form input:focus,
        .bhajan-modal-form textarea:focus,
        .bhajan-modal-form .form-control:focus {
          background-color: #ffffff !important;
          border-color: #f26522 !important;
          box-shadow:
            0 0 0 3px rgba(242, 101, 34, 0.09),
            0 2px 7px rgba(15, 23, 42, 0.04) !important;
        }

        /* =====================================================
           YOUTUBE INPUT
           ===================================================== */

        .bhajan-youtube-field {
          margin-top: 0 !important;
        }

        /* =====================================================
           TEXTAREA
           
           Bhajan + Bhavarth are kept close together.
           ===================================================== */

        .bhajan-textarea {
          display: block !important;
          width: 100% !important;
          height: 96px !important;
          min-height: 96px !important;
          margin: 0 !important;
          padding: 10px 13px !important;
          font-size: 13.5px !important;
          font-weight: 500 !important;
          line-height: 20px !important;
          resize: vertical !important;
        }

        .bhavarth-textarea {
          display: block !important;
          width: 100% !important;
          height: 78px !important;
          min-height: 78px !important;
          margin: 0 !important;
          padding: 10px 13px !important;
          font-size: 13.5px !important;
          font-weight: 500 !important;
          line-height: 20px !important;
          resize: vertical !important;
        }

        /* =====================================================
           TEXTAREA GROUP
           
           This specifically controls the small gap between
           Bhajan textarea and Bhavarth textarea.
           ===================================================== */

        .bhajan-textarea-group {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 7px !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* =====================================================
           ACTION BUTTONS
           ===================================================== */

        .bhajan-modal-actions {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          margin: 2px 0 0 !important;
          padding: 0 !important;
        }

        .modal-action-btn-cancel {
          height: 40px !important;
          min-width: 92px !important;
          padding: 0 18px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 9px !important;
          background-color: #f8fafc !important;
          color: #64748b !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
        }

        .modal-action-btn-cancel:hover {
          background-color: #f1f5f9 !important;
          border-color: #d8dee7 !important;
          color: #334155 !important;
        }

        .modal-action-btn-save {
          height: 40px !important;
          min-width: 92px !important;
          padding: 0 20px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: none !important;
          border-radius: 9px !important;
          background: linear-gradient(
            135deg,
            #f97316 0%,
            #ea580c 100%
          ) !important;
          color: #ffffff !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          box-shadow: 0 3px 8px rgba(234, 88, 12, 0.18) !important;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease !important;
        }

        .modal-action-btn-save:hover {
          transform: translateY(-1px);
          box-shadow: 0 5px 13px rgba(234, 88, 12, 0.25) !important;
        }

        .modal-action-btn-save:active {
          transform: translateY(0);
        }

        /* =====================================================
           SCROLLBAR
           ===================================================== */

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f4a77c;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f26522;
        }

        /* =====================================================
           MOBILE
           ===================================================== */

        @media (max-width: 767px) {
          .bhajan-page {
            padding: 10px;
            gap: 10px;
          }

          .bhajan-header {
            align-items: stretch;
            flex-direction: column;
            padding: 12px;
          }

          .bhajan-header-actions {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
          }

          .bhajan-search-wrapper {
            width: 100%;
          }

          .bhajan-add-button {
            width: 100%;
          }

          .bhajan-form-row {
            grid-template-columns: 1fr;
            row-gap: 7px;
          }

          .bhajan-modal-form {
            gap: 7px !important;
          }

          .bhajan-textarea {
            height: 96px !important;
            min-height: 96px !important;
          }

          .bhavarth-textarea {
            height: 78px !important;
            min-height: 78px !important;
          }

          .bhajan-modal-actions {
            gap: 7px;
          }

          .modal-action-btn-cancel,
          .modal-action-btn-save {
            flex: 1;
            min-width: 0 !important;
          }
        }
      `}</style>

      {/* =====================================================
          MAIN PAGE
          ===================================================== */}

      <div className="bhajan-page">
        {/* ===================================================
            HEADER
            =================================================== */}

        <div className="premium-card bhajan-header">
          <h4 className="bhajan-header-title">
            Bhajan &amp; Satsang Library
          </h4>

          <div className="bhajan-header-actions">
            <div className="bhajan-search-wrapper">
              <span className="bhajan-search-icon">
                <SearchIcon size={16} />
              </span>

              <input
                type="text"
                className="bhajan-search-input"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="સાહિત્ય, શીર્ષક, ભજન, કડી કે રાગ શોધો..."
              />
            </div>

            <Button
              onClick={openAddModal}
              className="bhajan-add-button"
            >
              + Add New Bhajan
            </Button>
          </div>
        </div>

        {/* ===================================================
            TABLE
            =================================================== */}

        <div className="table-custom-wrapper premium-card">
          <div className="table-responsive-wrapper custom-scrollbar">
            <table className="table table-hover align-middle table-custom">
              <thead
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 1
                }}
              >
                <tr>
                  <th
                    className="py-3 px-4"
                    style={{ width: '80px' }}
                  >
                    ક્રમ
                  </th>

                  <th className="py-3 px-4">
                    સાહિત્યનું નામ
                  </th>

                  <th className="py-3 px-4">
                    શીર્ષકનું નામ
                  </th>

                  <th className="py-3 px-4">
                    ભજનનું નામ
                  </th>

                  <th className="py-3 px-4">
                    ભજનની કડી
                  </th>

                  <th className="py-3 px-4">
                    ભજનનો રાગ
                  </th>

                  <th className="py-3 px-4">
                    પૃષ્ઠ ક્રમાંક
                  </th>

                  <th className="py-3 px-4 text-center">
                    YouTube Link
                  </th>
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
                      <td
                        className="py-3 px-4 serial-cell"
                        style={{
                          width: '80px',
                          minWidth: '80px'
                        }}
                      >
                        <span className="serial-number text-secondary fw-bold">
                          {index + 1}
                        </span>

                        <div className="delete-btn-wrapper">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item._id);
                            }}
                            className="btn btn-sm btn-danger border-0 p-1 d-flex align-items-center justify-content-center shadow-sm"
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '4px'
                            }}
                            title="Delete"
                          >
                            <Trash2Icon size={14} />
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-dark">
                        {item.sahitya_name}
                      </td>

                      <td className="py-3 px-4 text-muted">
                        {item.heading_name || '-'}
                      </td>

                      <td
                        className="py-3 px-4 fw-bold"
                        style={{ color: '#f26522' }}
                      >
                        {item.bhajan_name}
                      </td>

                      <td
                        className="py-3 px-4 text-muted text-truncate"
                        style={{ maxWidth: '200px' }}
                      >
                        {item.bhajan_kadi || '-'}
                      </td>

                      <td className="py-3 px-4 text-muted">
                        {item.bhajan_rag || '-'}
                      </td>

                      <td className="py-3 px-4 text-muted">
                        {item.page_no || '-'}
                      </td>

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
                          <span className="text-muted">
                            -
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-5 text-center text-muted"
                    >
                      કોઈ ડેટા મળ્યો નથી. (No data found)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===================================================
            ADD / EDIT MODAL
            =================================================== */}

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={
            isEditing
              ? 'ભજનમાં સુધારો કરો (Edit)'
              : 'નવું ભજન ઉમેરો (Add New)'
          }
          size="lg"
        >
          <form
            onSubmit={handleSubmit}
            className="bhajan-modal-form"
          >
            {/* =================================================
                ROW 1
                ================================================= */}

            <div className="bhajan-form-row">
              <div className="bhajan-form-field">
                <Input
                  name="sahitya_name"
                  value={formData.sahitya_name}
                  onChange={handleInputChange}
                  placeholder="સાહિત્યનું નામ *"
                  required
                />
              </div>

              <div className="bhajan-form-field">
                <Input
                  name="heading_name"
                  value={formData.heading_name}
                  onChange={handleInputChange}
                  placeholder="શીર્ષકનું નામ"
                />
              </div>
            </div>

            {/* =================================================
                ROW 2
                ================================================= */}

            <div className="bhajan-form-row">
              <div className="bhajan-form-field">
                <Input
                  name="bhajan_name"
                  value={formData.bhajan_name}
                  onChange={handleInputChange}
                  placeholder="ભજનનું નામ *"
                  required
                />
              </div>

              <div className="bhajan-form-field">
                <Input
                  name="bhajan_kadi"
                  value={formData.bhajan_kadi}
                  onChange={handleInputChange}
                  placeholder="ભજનની કડી"
                />
              </div>
            </div>

            {/* =================================================
                ROW 3
                ================================================= */}

            <div className="bhajan-form-row">
              <div className="bhajan-form-field">
                <Input
                  name="bhajan_rag"
                  value={formData.bhajan_rag}
                  onChange={handleInputChange}
                  placeholder="ભજનનો રાગ"
                />
              </div>

              <div className="bhajan-form-field">
                <Input
                  name="page_no"
                  value={formData.page_no}
                  onChange={handleInputChange}
                  placeholder="પૃષ્ઠ ક્રમાંક"
                />
              </div>
            </div>

            {/* =================================================
                YOUTUBE LINK
                ================================================= */}

            <div className="bhajan-form-full bhajan-youtube-field">
              <Input
                type="url"
                name="youtube_link"
                value={formData.youtube_link}
                onChange={handleInputChange}
                placeholder="YouTube Link (https://youtube.com/...)"
              />
            </div>

            {/* =================================================
                BHAJAN + BHAVARTH
                ================================================= */}

            <div className="bhajan-textarea-group">
              <div className="bhajan-form-full">
                <textarea
                  required
                  name="bhajan"
                  value={formData.bhajan}
                  onChange={handleInputChange}
                  rows={4}
                  className="form-control custom-scrollbar bhajan-textarea"
                  placeholder="ભજનનો પાઠ દાખલ કરો *"
                />
              </div>

              <div className="bhajan-form-full">
                <textarea
                  name="bhajan_bhavarth"
                  value={formData.bhajan_bhavarth}
                  onChange={handleInputChange}
                  rows={3}
                  className="form-control custom-scrollbar bhavarth-textarea"
                  placeholder="ભજનનો અર્થ / ભાવાર્થ દાખલ કરો"
                />
              </div>
            </div>

            {/* =================================================
                ACTION BUTTONS
                ================================================= */}

            <div className="bhajan-modal-actions">
              <Button
                type="button"
                onClick={closeModal}
                className="modal-action-btn-cancel"
                disabled={isLoading}
              >
                રદ કરો
              </Button>

              <Button
                type="submit"
                loading={isLoading}
                className="modal-action-btn-save"
              >
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