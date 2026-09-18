import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import Modal from "../../../components/common/Modal";
import Button from "../../../components/common/Button";
import { showErrorAlert } from "../../../components/common/Alert";

const FaceSearchModal = ({ isOpen, onClose, onSearch }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Capture the current frame from the webcam
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef]);

  // Retake the photo
  const retake = () => {
    setImgSrc(null);
  };

  // Convert Base64 to Blob and send to backend
  const handleSearch = async () => {
    if (!imgSrc) return;
    setIsSearching(true);
    
    try {
      // Convert base64 to a Blob for uploading
      const res = await fetch(imgSrc);
      const blob = await res.blob();
      const file = new File([blob], "search-face.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("face", file);

      // Pass the formData up to the Gallery component to handle the API call
      await onSearch(formData);
      onClose();
      setImgSrc(null);
    } catch (error) {
      showErrorAlert("Error", "Failed to process image.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Find Yourself in the Gallery" size="md">
      <div className="d-flex flex-column align-items-center justify-content-center p-3">
        {!imgSrc ? (
          <>
            <div className="rounded overflow-hidden mb-3 shadow-sm" style={{ border: '3px solid #ea580c' }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={100}
                style={{ width: "100%", maxWidth: "400px" }}
                videoConstraints={{ facingMode: "user" }} // Forces front camera on mobile
              />
            </div>
            <Button onClick={capture} className="btn theme-orange-gradient w-100 fw-bold rounded-pill py-2">
              📸 Capture Face
            </Button>
          </>
        ) : (
          <>
            <div className="rounded overflow-hidden mb-3 shadow-sm" style={{ border: '3px solid #10b981' }}>
              <img src={imgSrc} alt="Captured face" style={{ width: "100%", maxWidth: "400px" }} />
            </div>
            <div className="d-flex gap-2 w-100">
              <Button onClick={retake} className="btn btn-light border w-50 fw-bold rounded-pill" disabled={isSearching}>
                Retake
              </Button>
              <Button onClick={handleSearch} className="btn theme-orange-gradient w-50 fw-bold rounded-pill" loading={isSearching}>
                🔍 Search Matches
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default FaceSearchModal;