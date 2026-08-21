const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticateToken, isRecruiter, isStudent } = require('../middleware/authMiddleware');

// Optional auth helper middleware for public browsing with student score enhancement
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();
  authenticateToken(req, res, () => next());
};

router.get('/', optionalAuth, jobController.getJobs);
router.get('/recommendations', authenticateToken, isStudent, jobController.getJobRecommendations);
router.get('/recruiter/my-jobs', authenticateToken, isRecruiter, jobController.getRecruiterJobs);
router.get('/:id', optionalAuth, jobController.getJobById);

router.post('/', authenticateToken, isRecruiter, jobController.createJob);
router.put('/:id', authenticateToken, isRecruiter, jobController.updateJob);
router.delete('/:id', authenticateToken, isRecruiter, jobController.deleteJob);

module.exports = router;
