const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const galleryController = require('../controllers/galleryController');

// Define API Routes
router.post('/upload', upload.array('files'), galleryController.uploadMedia);
router.get('/', galleryController.getGalleryItems);
router.put('/update/:id', galleryController.updateMedia);
router.delete('/delete', galleryController.deleteMedia);

module.exports = router;