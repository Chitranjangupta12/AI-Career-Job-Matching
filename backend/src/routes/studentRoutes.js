const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, isStudent } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.get('/skills/available', studentController.getAvailableSkills);

// Student Protected Routes
router.get('/profile', isStudent, studentController.getProfile);
router.put('/profile', isStudent, studentController.updateProfile);

router.post('/education', isStudent, studentController.addEducation);
router.delete('/education/:id', isStudent, studentController.deleteEducation);

router.post('/experience', isStudent, studentController.addExperience);
router.delete('/experience/:id', isStudent, studentController.deleteExperience);

router.post('/projects', isStudent, studentController.addProject);
router.delete('/projects/:id', isStudent, studentController.deleteProject);

router.post('/skills', isStudent, studentController.addSkill);
router.delete('/skills/:skill_id', isStudent, studentController.deleteSkill);

module.exports = router;
