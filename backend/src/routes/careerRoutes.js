const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const { authenticateToken, isStudent } = require('../middleware/authMiddleware');

router.get('/roles', careerController.getCareerRoles);

// Student protected endpoints
router.get('/recommendations', authenticateToken, isStudent, careerController.getCareerRecommendations);
router.post('/skill-gap', authenticateToken, isStudent, careerController.getSkillGap);

module.exports = router;
