import React, { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import { uploadGalleryMedia, updateGalleryMedia } from '../../../services/api';
import { showGalleryToast, showErrorAlert } from '../../../components/common/Alert';

const GalleryModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const isEditMode = Boolean(initialData);

  const [formData, setFormData] = useState({
    main_folder_name: '',
    sub_folder_name: '',
    media_type: 'Photos',
    files: [],
  });
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Edit Mode: Prefill existing data
        setFormData({
          main_folder_name: initialData.main_folder_name || '',
          sub_folder_name: initialData.sub_folder_name || '',
          media_type: initialData.photo_path ? 'Photos' : 'Videos',
          files: [],
        });
        setPreviews([]);
      } else {
        // Insert Mode: Reset fields
        setFormData({
          main_folder_name: '',
          sub_folder_name: '',
          media_type: 'Photos',
          files: [],
        });
        setPreviews([]);
      }
    }
  }, [isOpen, initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'media_type' ? { files: [] } : {}),
    }));
    if (name === 'media_type') setPreviews([]);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    setFormData((prev) => ({
      ...prev,
      files: selectedFiles,
    }));

    const filePreviews = selectedFiles.map((file) => ({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2),
      url: URL.createObjectURL(file),
    }));
    setPreviews(filePreviews);
  };

  const removeFile = (index) => {
    const updatedFiles = formData.files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, files: updatedFiles }));
    setPreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.main_folder_name.trim() || !formData.sub_folder_name.trim()) {
      showErrorAlert('Missing Information', 'Please fill in both Folder names.');
      return;
    }

    if (!isEditMode && formData.files.length === 0) {
      showErrorAlert('No Files', 'Please select at least one media file.');
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        // Update API Call
        const payload = new FormData();
        payload.append('main_folder_name', formData.main_folder_name.trim());
        payload.append('sub_folder_name', formData.sub_folder_name.trim());
        payload.append('media_type', formData.media_type);

        if (formData.files.length > 0) {
          formData.files.forEach((file) => payload.append('files', file));
        }

        const res = await updateGalleryMedia(initialData.id, payload);
        if (res.data?.success) {
          showGalleryToast(res.data.message || 'Updated successfully!');
          onSuccess();
          onClose();
        }
      } else {
        // Insert API Call
        const payload = new FormData();
        payload.append('main_folder_name', formData.main_folder_name.trim());
        payload.append('sub_folder_name', formData.sub_folder_name.trim());
        payload.append('media_type', formData.media_type);

        formData.files.forEach((file) => payload.append('files', file));

        const res = await uploadGalleryMedia(payload);
        if (res.data?.success) {
          showGalleryToast(res.data.message || 'Uploaded successfully!');
          onSuccess();
          onClose();
        }
      }
    } catch (err) {
      showErrorAlert('Operation Failed', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Media Details' : 'Upload Bhajan & Satsang Media'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        {/* Folder Details */}
        <div className="row g-3 mb-3">
          <div className="col-12 col-md-6">
            <Input
              label="MAIN FOLDER / YEAR"
              name="main_folder_name"
              placeholder="e.g. 2026"
              value={formData.main_folder_name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-12 col-md-6">
            <Input
              label="SUB FOLDER / EVENT NAME"
              name="sub_folder_name"
              placeholder="e.g. Guru Purnima"
              value={formData.sub_folder_name}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        {/* Media Type */}
        <div className="mb-3">
          <Select
            label="MEDIA TYPE"
            name="media_type"
            value={formData.media_type}
            onChange={handleInputChange}
            options={[
              { value: 'Photos', label: '📷 Photos (.jpg, .jpeg, .png)' },
              { value: 'Videos', label: '🎥 Videos (.mp4)' },
            ]}
          />
        </div>

        {/* File Picker Section */}
        <div className="mb-3">
          <label className="form-label small fw-bold text-secondary mb-1">
            {isEditMode ? 'REPLACE MEDIA (OPTIONAL)' : `SELECT ${formData.media_type.toUpperCase()}`}
          </label>
          <label
            htmlFor="galleryFileInput"
            className="d-flex flex-column align-items-center justify-content-center p-4 border border-2 border-success border-opacity-25 rounded-4 bg-success-subtle bg-opacity-10 text-center w-100"
            style={{ borderStyle: 'dashed', cursor: 'pointer' }}
          >
            <div className="fs-2 text-success mb-1">☁️</div>
            <span className="fw-semibold text-success mb-1">
              {isEditMode ? 'Click to replace current file' : `Click to select ${formData.media_type.toLowerCase()}`}
            </span>
            <small className="text-secondary">
              {formData.media_type === 'Photos' ? 'JPG, PNG, JPEG formats' : 'MP4 video formats'}
            </small>
          </label>
          <input
            id="galleryFileInput"
            type="file"
            multiple={!isEditMode}
            accept={formData.media_type === 'Photos' ? 'image/*' : 'video/*'}
            onChange={handleFileChange}
            className="d-none"
          />
        </div>

        {/* Selected Previews */}
        {previews.length > 0 && (
          <div className="mb-3">
            <span className="small fw-bold text-secondary d-block mb-2">
              Selected Files ({previews.length})
            </span>
            <div className="row g-2 overflow-auto" style={{ maxHeight: '150px' }}>
              {previews.map((file, idx) => (
                <div key={idx} className="col-12 col-sm-6">
                  <div className="d-flex align-items-center justify-content-between p-2 bg-light border rounded-3">
                    <div className="d-flex align-items-center gap-2 text-truncate">
                      {formData.media_type === 'Photos' ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="rounded object-fit-cover"
                          style={{ width: '36px', height: '36px' }}
                        />
                      ) : (
                        <span className="fs-5">🎥</span>
                      )}
                      <div className="text-truncate">
                        <p className="mb-0 small fw-bold text-truncate" style={{ maxWidth: '140px' }}>
                          {file.name}
                        </p>
                        <small className="text-secondary">{file.size} MB</small>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm text-danger border-0"
                      onClick={() => removeFile(idx)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="d-flex justify-content-end gap-2 pt-3 border-top">
          <Button
            type="button"
            className="btn btn-light px-4 rounded-3 fw-semibold text-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="btn btn-success px-4 rounded-3 fw-semibold shadow-sm"
            loading={loading}
          >
            {loading
              ? isEditMode
                ? 'Updating...'
                : 'Uploading...'
              : isEditMode
              ? 'Update Changes'
              : 'Save & Upload'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GalleryModal;