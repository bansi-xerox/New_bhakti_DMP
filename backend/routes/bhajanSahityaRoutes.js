const express = require('express');
const router = express.Router();
const bhajanController = require('../controllers/bhajanSahityaController');

// Import middleware
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, bhajanController.createBhajan);
router.put('/:id', protect, bhajanController.updateBhajan);
router.delete('/:id', protect, bhajanController.deleteBhajan);

router.get('/', bhajanController.getAllBhajans);
router.get('/search', bhajanController.searchBhajans); 

module.exports = router;