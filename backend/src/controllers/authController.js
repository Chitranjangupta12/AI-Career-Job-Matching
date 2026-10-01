const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const env = require('../config/env');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return errorResponse(res, 'Name, email, password, and role are required.', 400);
    }

    const validRoles = ['student', 'recruiter'];
    if (!validRoles.includes(role.toLowerCase())) {
      return errorResponse(res, 'Invalid role. Must be student or recruiter.', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existingUser.rows.length > 0) {
      return errorResponse(res, 'An account with this email already exists.', 409);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const newUserRes = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name.trim(), normalizedEmail, passwordHash, role.toLowerCase()]
    );

    const user = newUserRes.rows[0];

    // Create corresponding profile
    if (user.role === 'student') {
      const studentProfileRes = await db.query(
        `INSERT INTO student_profiles (user_id, headline)
         VALUES ($1, $2)
         RETURNING id`,
        [user.id, 'Computer Science Student']
      );
      user.studentProfileId = studentProfileRes.rows[0].id;
    } else if (user.role === 'recruiter') {
      const companyName = req.body.company_name || `${name}'s Organization`;
      const recruiterProfileRes = await db.query(
        `INSERT INTO recruiter_profiles (user_id, company_name)
         VALUES ($1, $2)
         RETURNING id, company_name`,
        [user.id, companyName]
      );
      user.recruiterProfileId = recruiterProfileRes.rows[0].id;
      user.companyName = recruiterProfileRes.rows[0].company_name;
    }

    const token = generateToken(user);

    return successResponse(
      res,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentProfileId: user.studentProfileId,
          recruiterProfileId: user.recruiterProfileId,
        },
        token,
      },
      'Registration successful!',
      201
    );
  } catch (error) {
    console.error('Registration Error:', error);
    return errorResponse(res, 'Internal server error during registration.', 500, error.message);
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required.', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    const userRes = await db.query(
      `SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = $1`,
      [normalizedEmail]
    );

    if (userRes.rows.length === 0) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      return errorResponse(res, 'Your account has been deactivated. Please contact support.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    // Attach profile ID
    let profileData = {};
    if (user.role === 'student') {
      const pRes = await db.query('SELECT id, headline FROM student_profiles WHERE user_id = $1', [user.id]);
      if (pRes.rows.length > 0) {
        user.studentProfileId = pRes.rows[0].id;
        profileData.headline = pRes.rows[0].headline;
      }
    } else if (user.role === 'recruiter') {
      const pRes = await db.query('SELECT id, company_name FROM recruiter_profiles WHERE user_id = $1', [user.id]);
      if (pRes.rows.length > 0) {
        user.recruiterProfileId = pRes.rows[0].id;
        user.companyName = pRes.rows[0].company_name;
        profileData.company_name = pRes.rows[0].company_name;
      }
    }

    const token = generateToken(user);

    return successResponse(
      res,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentProfileId: user.studentProfileId,
          recruiterProfileId: user.recruiterProfileId,
          companyName: user.companyName,
          ...profileData,
        },
        token,
      },
      'Login successful!'
    );
  } catch (error) {
    console.error('Login Error:', error);
    return errorResponse(res, 'Internal server error during login.', 500, error.message);
  }
};

// Get current user details
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRes = await db.query(
      `SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      return errorResponse(res, 'User not found.', 404);
    }

    const user = userRes.rows[0];

    if (user.role === 'student') {
      const pRes = await db.query('SELECT * FROM student_profiles WHERE user_id = $1', [userId]);
      user.profile = pRes.rows[0] || null;
    } else if (user.role === 'recruiter') {
      const pRes = await db.query('SELECT * FROM recruiter_profiles WHERE user_id = $1', [userId]);
      user.profile = pRes.rows[0] || null;
    }

    return successResponse(res, { user }, 'User details fetched successfully.');
  } catch (error) {
    console.error('GetMe Error:', error);
    return errorResponse(res, 'Failed to fetch user profile.', 500, error.message);
  }
};

// Admin Login (Secure Backend-Only Comparison)
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const configAdminEmail = (env.ADMIN_EMAIL || '').trim().toLowerCase();
    const configAdminPassword = env.ADMIN_PASSWORD || '';

    // Verify credentials strictly against backend environment configuration
    const isEmailMatch = normalizedEmail === configAdminEmail;
    const isPasswordMatch = password === configAdminPassword;

    if (!isEmailMatch || !isPasswordMatch) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    // Ensure administrator user record exists in the database for consistency
    const adminUserRes = await db.query(
      `SELECT id, name, email, role, is_active FROM users WHERE LOWER(email) = $1`,
      [configAdminEmail]
    );

    let adminUser;
    if (adminUserRes.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(configAdminPassword, salt);
      const insertRes = await db.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'admin')
         RETURNING id, name, email, role, is_active`,
        ['System Administrator', configAdminEmail, passwordHash]
      );
      adminUser = insertRes.rows[0];
    } else {
      adminUser = adminUserRes.rows[0];
      if (adminUser.role !== 'admin' || !adminUser.is_active) {
        await db.query(`UPDATE users SET role = 'admin', is_active = TRUE WHERE id = $1`, [adminUser.id]);
        adminUser.role = 'admin';
        adminUser.is_active = true;
      }
    }

    const token = generateToken(adminUser);

    return successResponse(
      res,
      {
        user: {
          id: adminUser.id,
          name: adminUser.name || 'System Administrator',
          email: adminUser.email,
          role: 'admin',
        },
        token,
      },
      'Admin authentication successful!'
    );
  } catch (error) {
    console.error('Admin Login Error:', error.message);
    return errorResponse(res, 'Internal server error during authentication.', 500);
  }
};

