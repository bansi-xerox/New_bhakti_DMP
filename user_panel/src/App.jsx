import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SahityaDetailsPage from './pages/SahityaDetailsPage';
import HeadingBhajansPage from './pages/HeadingBhajansPage';
import BhajanDetailPage from './pages/BhajanDetailPage';
import './assets/userTheme.css';
import GalleryPage from './pages/GalleryPage';


function App() {
  return (
    <Router>
      <Routes>
        {/* Screen 1: Home / Sahitya Unique List */}
        <Route path="/" element={<HomePage />} />

        {/* Screen 2: Sahitya Details (Headings or Bhajans) */}
        <Route path="/sahitya/:sahityaName" element={<SahityaDetailsPage />} />

        {/* Screen 3: Heading Bhajans List */}
        <Route path="/sahitya/:sahityaName/heading/:headingName" element={<HeadingBhajansPage />} />

        {/* Screen 4: Full Bhajan Detail with 4-Tab Bottom Nav */}
        <Route path="/bhajan/:id" element={<BhajanDetailPage />} />

        <Route path="/gallery" element={<GalleryPage />} />
      </Routes>
    </Router>
  );
}

export default App;