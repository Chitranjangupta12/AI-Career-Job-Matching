const express = require('express');
const router = express.Router();
const recruiterController = require('../controllers/recruiterController');
const { authenticateToken, isRecruiter } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.get('/profile', isRecruiter, recruiterController.getProfile);
router.put('/profile', isRecruiter, recruiterController.updateProfile);
router.get('/stats', isRecruiter, recruiterController.getDashboardStats);

module.exports = router;
