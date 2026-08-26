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
      showErrorAlert('અપૂર્ણ માહિતી', 'કૃપા કરીને મુખ્ય ફોલ્ડર અને સબ ફોલ્ડર બંનેના નામ દાખલ કરો.');
      return;
    }

    if (!isEditMode && formData.files.length === 0) {
      showErrorAlert('કોઈ ફાઇલ નથી', 'કૃપા કરીને ઓછામાં ઓછી એક ફાઇલ પસંદ કરો.');
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        // FIX: Send a plain JSON object so the backend can read req.body easily!
        const payload = {
          main_folder_name: formData.main_folder_name.trim(),
          sub_folder_name: formData.sub_folder_name.trim()
        };
        
        const res = await updateGalleryMedia(initialData.id, payload);
        if (res.data?.success) {
          showGalleryToast(res.data.message || 'સફળતાપૂર્વક ખસેડવામાં આવ્યું!');
          onSuccess();
          onClose();
        }
      } else {
        // Insert API Call (Keep FormData here because we are uploading files)
        const payload = new FormData();
        payload.append('main_folder_name', formData.main_folder_name.trim());
        payload.append('sub_folder_name', formData.sub_folder_name.trim());
        payload.append('media_type', formData.media_type);

        formData.files.forEach((file) => payload.append('files', file));

        const res = await uploadGalleryMedia(payload);
        if (res.data?.success) {
          showGalleryToast(res.data.message || 'સફળતાપૂર્વક અપલોડ કરવામાં આવ્યું!');
          onSuccess();
          onClose();
        }
      }
    } catch (err) {
      // Now this will properly catch your 400 error and show the Gujarati message
      showErrorAlert('પ્રક્રિયા નિષ્ફળ', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Move Media File' : 'Upload Bhajan & Satsang Media'}
      size="lg"
    >
      <style>{`
        .theme-orange-gradient { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%) !important; color: white !important; border: none !important; }
        .theme-orange-text { color: #ea580c !important; }
        .theme-orange-light-bg { background-color: #fff7ed !important; }
        .theme-orange-border-light { border-color: #fdba74 !important; }
        .drag-drop-zone { transition: all 0.3s ease; }
        .drag-drop-zone:hover { background-color: #ffedd5 !important; border-color: #f97316 !important; transform: translateY(-2px); }
      `}</style>

      <form onSubmit={handleSubmit}>
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

        {isEditMode ? (
          // IF EDITING: Hide upload box and show an informational warning
          <div className="alert border theme-orange-border-light theme-orange-light-bg rounded-3 mt-4 mb-4">
            <div className="d-flex gap-2 align-items-center">
              <span className="fs-5">ℹ️</span>
              <div>
                <p className="mb-0 fw-bold theme-orange-text">Move Mode Active</p>
                <small className="text-secondary">You cannot change the file itself. Updating these folder names will move the media to the new destination (if it exists).</small>
              </div>
            </div>
          </div>
        ) : (
          // IF CREATING: Show file upload options
          <>
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

            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary mb-1">
                SELECT {formData.media_type.toUpperCase()}
              </label>
              <label
                htmlFor="galleryFileInput"
                className="drag-drop-zone d-flex flex-column align-items-center justify-content-center p-4 border border-2 theme-orange-border-light rounded-4 theme-orange-light-bg text-center w-100 shadow-sm"
                style={{ borderStyle: 'dashed', cursor: 'pointer' }}
              >
                <div className="fs-1 mb-2 theme-orange-text">
                  <span>☁️</span>
                </div>
                <span className="fw-bolder theme-orange-text mb-1 fs-5">
                  Click to select {formData.media_type.toLowerCase()}
                </span>
                <small className="text-secondary fw-medium">
                  {formData.media_type === 'Photos' ? 'Supported formats: JPG, PNG, JPEG' : 'Supported format: MP4 Video'}
                </small>
              </label>
              <input
                id="galleryFileInput"
                type="file"
                multiple
                accept={formData.media_type === 'Photos' ? 'image/*' : 'video/*'}
                onChange={handleFileChange}
                className="d-none"
              />
            </div>

            {previews.length > 0 && (
              <div className="mb-3">
                <span className="small fw-bold text-secondary d-block mb-2">
                  Selected Files ({previews.length})
                </span>
                <div className="row g-2 overflow-auto" style={{ maxHeight: '160px' }}>
                  {previews.map((file, idx) => (
                    <div key={idx} className="col-12 col-sm-6">
                      <div className="d-flex align-items-center justify-content-between p-2 bg-white border rounded-3 shadow-sm">
                        <div className="d-flex align-items-center gap-2 text-truncate">
                          {formData.media_type === 'Photos' ? (
                            <img src={file.url} alt={file.name} className="rounded object-fit-cover shadow-sm border" style={{ width: '40px', height: '40px' }}/>
                          ) : (
                            <span className="fs-4">🎥</span>
                          )}
                          <div className="text-truncate">
                            <p className="mb-0 small fw-bold text-truncate text-dark" style={{ maxWidth: '140px' }}>{file.name}</p>
                            <small className="text-secondary fw-medium">{file.size} MB</small>
                          </div>
                        </div>
                        <button type="button" className="btn btn-sm text-danger border-0 hover-opacity" onClick={() => removeFile(idx)} title="Remove file">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="d-flex justify-content-end gap-3 pt-3 border-top">
          <Button type="button" className="btn btn-light px-4 rounded-3 fw-bold text-secondary border shadow-sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" className="btn theme-orange-gradient px-4 rounded-3 fw-bold" loading={loading}>
            {loading ? (isEditMode ? 'Moving...' : 'Uploading...') : (isEditMode ? 'Move File' : 'Save & Upload')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GalleryModal;