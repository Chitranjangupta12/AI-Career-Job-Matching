const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Admin Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const statsRes = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'recruiter') as total_recruiters,
        (SELECT COUNT(*) FROM jobs) as total_jobs,
        (SELECT COUNT(*) FROM jobs WHERE status = 'Active') as active_jobs,
        (SELECT COUNT(*) FROM applications) as total_applications,
        (SELECT COUNT(*) FROM skills) as total_skills
    `);

    const recentUsersRes = await db.query(
      `SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 6`
    );

    const recentJobsRes = await db.query(
      `SELECT j.id, j.title, j.company_name, j.location, j.job_type, j.status, j.created_at,
              (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as applicant_count
       FROM jobs j
       ORDER BY j.created_at DESC
       LIMIT 6`
    );

    const recentAppsRes = await db.query(
      `SELECT a.id, a.match_score, a.status, a.applied_at,
              j.title as job_title, j.company_name,
              u.name as candidate_name, u.email as candidate_email
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN student_profiles sp ON a.student_id = sp.id
       JOIN users u ON sp.user_id = u.id
       ORDER BY a.applied_at DESC
       LIMIT 6`
    );

    return successResponse(res, {
      stats: statsRes.rows[0],
      recentUsers: recentUsersRes.rows,
      recentJobs: recentJobsRes.rows,
      recentApplications: recentAppsRes.rows,
    });
  } catch (error) {
    console.error('Admin getDashboardStats Error:', error);
    return errorResponse(res, 'Failed to fetch admin stats.', 500, error.message);
  }
};

// Manage All Users (GET /api/admin/users)
exports.getAllUsers = async (req, res) => {
  try {
    const usersRes = await db.query(`
      SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at,
             sp.headline, rp.company_name
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN recruiter_profiles rp ON u.id = rp.user_id
      ORDER BY u.created_at DESC
    `);

    return successResponse(res, { users: usersRes.rows });
  } catch (error) {
    console.error('Admin getAllUsers Error:', error);
    return errorResponse(res, 'Failed to fetch users.', 500, error.message);
  }
};

// Manage Students
exports.getAllStudents = async (req, res) => {
  try {
    const studentsRes = await db.query(`
      SELECT u.id as user_id, u.name, u.email, u.is_active, u.created_at,
             sp.id as student_id, sp.headline, sp.education_level, sp.major, sp.experience_years,
             (SELECT COUNT(*) FROM applications WHERE student_id = sp.id) as applications_count,
             (SELECT COUNT(*) FROM student_skills WHERE student_id = sp.id) as skills_count
      FROM users u
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.role = 'student'
      ORDER BY u.created_at DESC
    `);

    return successResponse(res, { students: studentsRes.rows });
  } catch (error) {
    console.error('Admin getAllStudents Error:', error);
    return errorResponse(res, 'Failed to fetch students.', 500, error.message);
  }
};

// Manage Recruiters
exports.getAllRecruiters = async (req, res) => {
  try {
    const recruitersRes = await db.query(`
      SELECT u.id as user_id, u.name, u.email, u.is_active, u.created_at,
             rp.id as recruiter_id, rp.company_name, rp.designation, rp.location, rp.industry,
             (SELECT COUNT(*) FROM jobs WHERE recruiter_id = rp.id) as jobs_count
      FROM users u
      JOIN recruiter_profiles rp ON u.id = rp.user_id
      WHERE u.role = 'recruiter'
      ORDER BY u.created_at DESC
    `);

    return successResponse(res, { recruiters: recruitersRes.rows });
  } catch (error) {
    console.error('Admin getAllRecruiters Error:', error);
    return errorResponse(res, 'Failed to fetch recruiters.', 500, error.message);
  }
};

// Manage Jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobsRes = await db.query(`
      SELECT j.*, rp.company_name, u.name as recruiter_name,
             (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as applicant_count
      FROM jobs j
      JOIN recruiter_profiles rp ON j.recruiter_id = rp.id
      JOIN users u ON rp.user_id = u.id
      ORDER BY j.created_at DESC
    `);

    return successResponse(res, { jobs: jobsRes.rows });
  } catch (error) {
    console.error('Admin getAllJobs Error:', error);
    return errorResponse(res, 'Failed to fetch jobs.', 500, error.message);
  }
};

// Manage Applications
exports.getAllApplications = async (req, res) => {
  try {
    const appsRes = await db.query(`
      SELECT a.*, j.title as job_title, j.company_name,
             u_cand.name as candidate_name, u_cand.email as candidate_email,
             u_rec.name as recruiter_name
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN recruiter_profiles rp ON j.recruiter_id = rp.id
      JOIN users u_rec ON rp.user_id = u_rec.id
      JOIN student_profiles sp ON a.student_id = sp.id
      JOIN users u_cand ON sp.user_id = u_cand.id
      ORDER BY a.applied_at DESC
    `);

    return successResponse(res, { applications: appsRes.rows });
  } catch (error) {
    console.error('Admin getAllApplications Error:', error);
    return errorResponse(res, 'Failed to fetch applications.', 500, error.message);
  }
};

// Delete / Toggle User Active State
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateRes = await db.query(
      'UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING id, name, is_active',
      [userId]
    );

    if (updateRes.rows.length === 0) {
      return errorResponse(res, 'User not found.', 404);
    }

    return successResponse(res, { user: updateRes.rows[0] }, 'User status toggled successfully.');
  } catch (error) {
    console.error('Admin toggleUserStatus Error:', error);
    return errorResponse(res, 'Failed to update user status.', 500, error.message);
  }
};

// Delete Job (Admin)
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM jobs WHERE id = $1', [id]);
    return successResponse(res, null, 'Job deleted by Admin.');
  } catch (error) {
    console.error('Admin deleteJob Error:', error);
    return errorResponse(res, 'Failed to delete job.', 500, error.message);
  }
};
