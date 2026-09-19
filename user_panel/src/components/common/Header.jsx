import React, { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Image as ImageIcon, Camera } from 'lucide-react';
import '../../assets/userTheme.css';

const Header = ({ onFaceSearch, faceSearching }) => {
  const location = useLocation();
  const fileInputRef = useRef(null);

  // Trigger camera / file picker when header face recognition button is clicked
  const handleFaceTrigger = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Forward the selected face image file to the parent handler
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onFaceSearch) {
      onFaceSearch(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <header className="royal-header">
      <div className="royal-header-inner">
        {/* Brand Logo & Name */}
        <Link to="/" className="royal-brand-group">
          <div className="royal-brand-emblem">
            <Sparkles size={28} />
          </div>
          <div className="royal-brand-titles">
            <h1>ભજન કીર્તન પોર્ટલ</h1>
          </div>
        </Link>

        {/* Header Right Actions */}
        <div className="header-right-actions">
          {/* Hidden File Input for Face Recognition Camera */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="user"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {/* Only render Face Recognition Icon on the Gallery page */}
          {location.pathname === '/gallery' && (
            <button
              type="button"
              className={`header-icon-btn header-face-btn ${faceSearching ? 'loading' : ''}`}
              onClick={handleFaceTrigger}
              title="ફેસ રેકગ્નિશન (ચહેરો ઓળખી ફોટો શોધો)"
              aria-label="ફેસ રેકગ્નિશન"
            >
              <Camera size={20} />
            </button>
          )}

          {/* Gallery Page Icon Button */}
          <Link
            to="/gallery"
            className={`header-icon-btn header-gallery-btn ${location.pathname === '/gallery' ? 'active' : ''}`}
            title="ગેલેરી દર્શન"
            aria-label="ગેલેરી દર્શન"
          >
            <ImageIcon size={20} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;