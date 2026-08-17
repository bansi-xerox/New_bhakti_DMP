const multer = require('multer');
const path = require('path');

// Use memory storage to process files before saving them physically
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const mediaType = req.body.media_type ? req.body.media_type.toLowerCase() : '';
  const ext = path.extname(file.originalname).toLowerCase();

  if (mediaType === 'photos') {
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    if (allowedExtensions.includes(ext)) {
      return cb(null, true);
    }
    return cb(new Error('Invalid photo format. Only .jpg, .jpeg, and .png are allowed.'));
  } else if (mediaType === 'videos') {
    if (ext === '.mp4') {
      return cb(null, true);
    }
    return cb(new Error('Invalid video format. Only .mp4 files are allowed.'));
  } else {
    return cb(new Error('Invalid media type specified. Must be "Photos" or "Videos".'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100 MB Limit per file
});

module.exports = upload;