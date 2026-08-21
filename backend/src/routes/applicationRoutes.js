const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticateToken, isStudent, isRecruiter } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Student
router.post('/apply', isStudent, applicationController.applyForJob);
router.get('/student/my-applications', isStudent, applicationController.getStudentApplications);

// Recruiter
router.get('/job/:jobId/applicants', isRecruiter, applicationController.getJobApplicants);
router.get('/candidate/:studentId', isRecruiter, applicationController.getCandidateDetails);
router.patch('/:applicationId/status', isRecruiter, applicationController.updateApplicationStatus);

module.exports = router;
