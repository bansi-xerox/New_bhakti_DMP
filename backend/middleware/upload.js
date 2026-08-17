const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.mp4'];

  if (allowedExtensions.includes(ext)) {
    return cb(null, true);
  }
  return cb(new Error('Invalid file type. Only .jpg, .jpeg, .png, and .mp4 files are allowed.'));
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: 100 * 1024 * 1024
  }
});

module.exports = upload;