const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

router.use(authenticateToken, isAdmin);

router.get('/stats', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.get('/students', adminController.getAllStudents);
router.get('/recruiters', adminController.getAllRecruiters);
router.get('/jobs', adminController.getAllJobs);
router.get('/applications', adminController.getAllApplications);
router.patch('/users/:userId/toggle-status', adminController.toggleUserStatus);
router.delete('/jobs/:id', adminController.deleteJob);

module.exports = router;
