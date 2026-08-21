const db = require('../config/db');
const aiService = require('../services/aiService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Helper to fetch student candidate profile
async function getStudentCandidateProfile(studentId) {
  const pRes = await db.query('SELECT * FROM student_profiles WHERE id = $1', [studentId]);
  if (pRes.rows.length === 0) return null;

  const profile = pRes.rows[0];

  const sRes = await db.query(
    `SELECT s.name FROM student_skills ss JOIN skills s ON ss.skill_id = s.id WHERE ss.student_id = $1`,
    [studentId]
  );
  const skills = sRes.rows.map((r) => r.name);

  const projRes = await db.query('SELECT title, description, technologies FROM student_projects WHERE student_id = $1', [studentId]);
  const projects = projRes.rows.map((p) => `${p.title}: ${p.technologies || ''}`);

  return {
    profile,
    candidatePayload: {
      skills,
      experience_years: parseFloat(profile.experience_years || 0),
      education_level: profile.education_level || "Bachelor's",
      major: profile.major || '',
      projects,
      bio: profile.bio || '',
    },
  };
}

// Get AI Career Recommendations
exports.getCareerRecommendations = async (req, res) => {
  try {
    const studentId = req.user.studentProfileId;
    const studentData = await getStudentCandidateProfile(studentId);

    if (!studentData) {
      return errorResponse(res, 'Student profile not found.', 404);
    }

    const { profile, candidatePayload } = studentData;

    // Call Python FastAPI AI Service
    const aiRecommendations = await aiService.getCareerRecommendations(
      candidatePayload,
      profile.interests || ''
    );

    return successResponse(
      res,
      {
        candidate_skills: aiRecommendations.candidate_skills,
        top_recommendations: aiRecommendations.top_recommendations,
      },
      'Top 5 Career recommendations generated successfully!'
    );
  } catch (error) {
    console.error('getCareerRecommendations Error:', error);
    return errorResponse(res, 'Failed to generate career recommendations.', 500, error.message);
  }
};

// Skill Gap Analysis
exports.getSkillGap = async (req, res) => {
  try {
    const studentId = req.user.studentProfileId;
    const { target_role_or_job_title, target_skills } = req.body;

    const studentData = await getStudentCandidateProfile(studentId);
    if (!studentData) {
      return errorResponse(res, 'Student profile not found.', 404);
    }

    const candidateSkills = studentData.candidatePayload.skills;

    const gapResult = await aiService.analyzeSkillGap(
      candidateSkills,
      target_role_or_job_title,
      target_skills || []
    );

    return successResponse(res, { gap_analysis: gapResult }, 'Skill gap analysis generated.');
  } catch (error) {
    console.error('getSkillGap Error:', error);
    return errorResponse(res, 'Failed to perform skill gap analysis.', 500, error.message);
  }
};

// Get Career Roles Knowledge Base
exports.getCareerRoles = async (req, res) => {
  try {
    const rolesRes = await db.query(`
      SELECT cr.*,
        (SELECT json_agg(json_build_object('name', s.name, 'is_core', cs.is_core, 'importance', cs.importance_weight))
         FROM career_skills cs
         JOIN skills s ON cs.skill_id = s.id
         WHERE cs.career_role_id = cr.id) as skills
      FROM career_roles cr
      ORDER BY cr.id ASC
    `);

    return successResponse(res, { roles: rolesRes.rows });
  } catch (error) {
    console.error('getCareerRoles Error:', error);
    return errorResponse(res, 'Failed to fetch career roles.', 500, error.message);
  }
};
