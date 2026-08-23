import React, { useState, useEffect } from "react";
import Modal from "../../../components/common/Modal";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import Button from "../../../components/common/Button";
import { uploadGalleryMedia, updateGalleryMedia } from "../../../services/api";
import {
  showGalleryToast,
  showErrorAlert,
} from "../../../components/common/Alert";

const GalleryModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const isEditMode = Boolean(initialData);

  const [formData, setFormData] = useState({
    main_folder_name: "",
    sub_folder_name: "",
    media_type: "Photos",
    files: [],
  });
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Edit Mode: Prefill existing data
        setFormData({
          main_folder_name: initialData.main_folder_name || "",
          sub_folder_name: initialData.sub_folder_name || "",
          media_type: initialData.photo_path ? "Photos" : "Videos",
          files: [],
        });
        setPreviews([]);
      } else {
        // Insert Mode: Reset fields
        setFormData({
          main_folder_name: "",
          sub_folder_name: "",
          media_type: "Photos",
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
      ...(name === "media_type" ? { files: [] } : {}),
    }));
    if (name === "media_type") setPreviews([]);
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
      showErrorAlert(
        "Missing Information",
        "Please fill in both Folder names.",
      );
      return;
    }

    if (!isEditMode && formData.files.length === 0) {
      showErrorAlert("No Files", "Please select at least one media file.");
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        const payload = new FormData();
        payload.append(
          "new_main_folder_name",
          formData.main_folder_name.trim(),
        );
        payload.append("new_sub_folder_name", formData.sub_folder_name.trim());
        payload.append("main_folder_name", formData.main_folder_name.trim());
        payload.append("sub_folder_name", formData.sub_folder_name.trim());
        payload.append("media_type", formData.media_type);

        if (formData.files.length > 0) {
          formData.files.forEach((file) => payload.append("files", file));
        }

        const res = await updateGalleryMedia(initialData.id, payload);
        if (res.data?.success) {
          showGalleryToast(res.data.message || "Updated successfully!");
          onSuccess();
          onClose();
        }
      } else {
        // Insert API Call
        const payload = new FormData();
        payload.append("main_folder_name", formData.main_folder_name.trim());
        payload.append("sub_folder_name", formData.sub_folder_name.trim());
        payload.append("media_type", formData.media_type);

        formData.files.forEach((file) => payload.append("files", file));

        const res = await uploadGalleryMedia(payload);
        if (res.data?.success) {
          showGalleryToast(res.data.message || "Uploaded successfully!");
          onSuccess();
          onClose();
        }
      }
    } catch (err) {
      showErrorAlert(
        "Operation Failed",
        err.response?.data?.message || err.message,
      );
    } finally {
      setLoading(false);
    }
  };
/*chnages*/ 
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditMode ? "Edit Media Details" : "Upload Bhajan & Satsang Media"
      }
      size="lg"
    >
      {/* Re-inject the orange theme styles for the modal context */}
      <style>{`
        .theme-orange-gradient { 
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%) !important; 
          color: white !important; 
          border: none !important;
          box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25) !important;
          transition: all 0.3s ease !important;
        }
        .theme-orange-gradient:hover { 
          background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%) !important; 
          box-shadow: 0 6px 16px rgba(234, 88, 12, 0.4) !important;
          transform: translateY(-2px);
        }
        .theme-orange-text { color: #ea580c !important; }
        .theme-orange-light-bg { background-color: #fff7ed !important; }
        .theme-orange-border-light { border-color: #fdba74 !important; }
        .drag-drop-zone {
          transition: all 0.3s ease;
        }
        .drag-drop-zone:hover {
          background-color: #ffedd5 !important;
          border-color: #f97316 !important;
          transform: translateY(-2px);
        }
      `}</style>

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
              { value: "Photos", label: "📷 Photos (.jpg, .jpeg, .png)" },
              { value: "Videos", label: "🎥 Videos (.mp4)" },
            ]}
          />
        </div>

        {/* File Picker Section */}
        <div className="mb-3">
          <label className="form-label small fw-bold text-secondary mb-1">
            {isEditMode
              ? "REPLACE MEDIA (OPTIONAL)"
              : `SELECT ${formData.media_type.toUpperCase()}`}
          </label>
          <label
            htmlFor="galleryFileInput"
            className="drag-drop-zone d-flex flex-column align-items-center justify-content-center p-4 border border-2 theme-orange-border-light rounded-4 theme-orange-light-bg text-center w-100 shadow-sm"
            style={{ borderStyle: "dashed", cursor: "pointer" }}
          >
            <div
              className="fs-1 mb-2 theme-orange-text"
              style={{
                filter: "drop-shadow(0 4px 6px rgba(234, 88, 12, 0.2))",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                fill="currentColor"
                className="bi bi-cloud-arrow-up-fill"
                viewBox="0 0 16 16"
              >
                <path d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2zm2.354 5.146a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2z" />
              </svg>
            </div>
            <span className="fw-bolder theme-orange-text mb-1 fs-5">
              {isEditMode
                ? "Click to replace current file"
                : `Click to select ${formData.media_type.toLowerCase()}`}
            </span>
            <small className="text-secondary fw-medium">
              {formData.media_type === "Photos"
                ? "Supported formats: JPG, PNG, JPEG"
                : "Supported format: MP4 Video"}
            </small>
          </label>
          <input
            id="galleryFileInput"
            type="file"
            multiple={!isEditMode}
            accept={formData.media_type === "Photos" ? "image/*" : "video/*"}
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
            <div
              className="row g-2 overflow-auto"
              style={{ maxHeight: "160px" }}
            >
              {previews.map((file, idx) => (
                <div key={idx} className="col-12 col-sm-6">
                  <div className="d-flex align-items-center justify-content-between p-2 bg-white border rounded-3 shadow-sm">
                    <div className="d-flex align-items-center gap-2 text-truncate">
                      {formData.media_type === "Photos" ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="rounded object-fit-cover shadow-sm border"
                          style={{ width: "40px", height: "40px" }}
                        />
                      ) : (
                        <span className="fs-4">🎥</span>
                      )}
                      <div className="text-truncate">
                        <p
                          className="mb-0 small fw-bold text-truncate text-dark"
                          style={{ maxWidth: "140px" }}
                        >
                          {file.name}
                        </p>
                        <small className="text-secondary fw-medium">
                          {file.size} MB
                        </small>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm text-danger border-0 hover-opacity"
                      onClick={() => removeFile(idx)}
                      title="Remove file"
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
        <div className="d-flex justify-content-end gap-3 pt-3 border-top">
          <Button
            type="button"
            className="btn btn-light px-4 rounded-3 fw-bold text-secondary border shadow-sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="btn theme-orange-gradient px-4 rounded-3 fw-bold"
            loading={loading}
          >
            {loading
              ? isEditMode
                ? "Updating..."
                : "Uploading..."
              : isEditMode
                ? "Update Changes"
                : "Save & Upload"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GalleryModal;
