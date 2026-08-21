const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Get recruiter profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profileRes = await db.query(
      `SELECT rp.*, u.name, u.email
       FROM recruiter_profiles rp
       JOIN users u ON rp.user_id = u.id
       WHERE rp.user_id = $1`,
      [userId]
    );

    if (profileRes.rows.length === 0) {
      return errorResponse(res, 'Recruiter profile not found.', 404);
    }

    return successResponse(res, { profile: profileRes.rows[0] });
  } catch (error) {
    console.error('Recruiter getProfile Error:', error);
    return errorResponse(res, 'Failed to fetch recruiter profile.', 500, error.message);
  }
};

// Update recruiter profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { company_name, company_website, company_description, designation, location, industry } = req.body;

    const updateRes = await db.query(
      `UPDATE recruiter_profiles
       SET company_name = COALESCE($1, company_name),
           company_website = COALESCE($2, company_website),
           company_description = COALESCE($3, company_description),
           designation = COALESCE($4, designation),
           location = COALESCE($5, location),
           industry = COALESCE($6, industry),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $7
       RETURNING *`,
      [company_name, company_website, company_description, designation, location, industry, userId]
    );

    return successResponse(res, { profile: updateRes.rows[0] }, 'Company profile updated.');
  } catch (error) {
    console.error('Recruiter updateProfile Error:', error);
    return errorResponse(res, 'Failed to update recruiter profile.', 500, error.message);
  }
};

// Get recruiter dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const recruiterId = req.user.recruiterProfileId;

    const statsRes = await db.query(
      `SELECT
         COUNT(DISTINCT j.id) as total_jobs,
         COUNT(DISTINCT CASE WHEN j.status = 'Active' THEN j.id END) as active_jobs,
         COUNT(a.id) as total_applications,
         COUNT(CASE WHEN a.status = 'Shortlisted' THEN 1 END) as shortlisted_count
       FROM jobs j
       LEFT JOIN applications a ON j.id = a.job_id
       WHERE j.recruiter_id = $1`,
      [recruiterId]
    );

    const recentApplicantsRes = await db.query(
      `SELECT a.id, a.match_score, a.status, a.applied_at, j.title as job_title, u.name as candidate_name, sp.headline
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN student_profiles sp ON a.student_id = sp.id
       JOIN users u ON sp.user_id = u.id
       WHERE j.recruiter_id = $1
       ORDER BY a.applied_at DESC
       LIMIT 5`,
      [recruiterId]
    );

    return successResponse(res, {
      stats: statsRes.rows[0],
      recentApplicants: recentApplicantsRes.rows,
    });
  } catch (error) {
    console.error('Recruiter Stats Error:', error);
    return errorResponse(res, 'Failed to fetch dashboard statistics.', 500, error.message);
  }
};
