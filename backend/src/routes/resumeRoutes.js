const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const uploadResume = require('../middleware/uploadMiddleware');
const { authenticateToken, isStudent } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/upload', isStudent, uploadResume.single('resume'), resumeController.uploadAndParseResume);
router.post('/parse-text', isStudent, resumeController.parseRawText);
router.get('/my-resumes', isStudent, resumeController.getStudentResumes);

module.exports = router;
