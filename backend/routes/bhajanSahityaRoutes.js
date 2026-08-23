const express = require('express');
const router = express.Router();
const bhajanController = require('../controllers/bhajanSahityaController');

// 1. Import your middleware (adjust the path if needed)
const { protect } = require('../middleware/authMiddleware');

// 2. Drop 'protect' into the routes you want to secure
router.post('/', protect, bhajanController.createBhajan);
router.put('/:id', protect, bhajanController.updateBhajan);
router.delete('/:id', protect, bhajanController.deleteBhajan);

router.get('/',protect, bhajanController.getAllBhajans);
router.get('/:id',protect, bhajanController.getBhajanById);

module.exports = router;