const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const galleryController = require('../controllers/galleryController');

router.post('/upload', upload.array('files'), galleryController.uploadMedia);
router.get('/', galleryController.getGalleryItems);

router.put('/update/:id', upload.array('files'), galleryController.updateMedia);
router.delete('/delete', galleryController.deleteMedia);
router.get('/search', galleryController.searchMedia);


// router.post('/face-search', upload.single('face'), galleryController.searchByFace);
module.exports = router;