const jwt = require('jsonwebtoken');
const env = require('../config/env');
const db = require('../config/db');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    jwt.verify(token, env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired authentication token.',
        });
      }

      // Fetch user from DB to confirm active status
      const userRes = await db.query(
        'SELECT id, name, email, role, is_active FROM users WHERE id = $1',
        [decoded.id]
      );

      if (userRes.rows.length === 0 || !userRes.rows[0].is_active) {
        return res.status(403).json({
          success: false,
          message: 'User account not found or deactivated.',
        });
      }

      req.user = userRes.rows[0];

      // If student, attach student_profile id
      if (req.user.role === 'student') {
        const profileRes = await db.query(
          'SELECT id FROM student_profiles WHERE user_id = $1',
          [req.user.id]
        );
        if (profileRes.rows.length > 0) {
          req.user.studentProfileId = profileRes.rows[0].id;
        }
      }

      // If recruiter, attach recruiter_profile id
      if (req.user.role === 'recruiter') {
        const profileRes = await db.query(
          'SELECT id, company_name FROM recruiter_profiles WHERE user_id = $1',
          [req.user.id]
        );
        if (profileRes.rows.length > 0) {
          req.user.recruiterProfileId = profileRes.rows[0].id;
          req.user.companyName = profileRes.rows[0].company_name;
        }
      }

      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication server error.',
      error: error.message,
    });
  }
};

// Role authorization checks
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles: ${roles.join(', ')}`,
      });
    }
    next();
  };
};

const isStudent = requireRole('student');
const isRecruiter = requireRole('recruiter');
const isAdmin = requireRole('admin');

module.exports = {
  authenticateToken,
  requireRole,
  isStudent,
  isRecruiter,
  isAdmin,
};
