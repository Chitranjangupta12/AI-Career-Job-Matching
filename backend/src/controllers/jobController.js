const db = require('../config/db');
const aiService = require('../services/aiService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Helper to fetch full student candidate profile for AI matching
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
  const projects = projRes.rows.map((p) => `${p.title}: ${p.technologies || ''} - ${p.description || ''}`);

  return {
    skills,
    experience_years: parseFloat(profile.experience_years || 0),
    education_level: profile.education_level || "Bachelor's",
    major: profile.major || '',
    projects,
    bio: profile.bio || '',
  };
}

// Create Job (Recruiter)
exports.createJob = async (req, res) => {
  try {
    const recruiterId = req.user.recruiterProfileId;
    const {
      title,
      company_name,
      location,
      job_type,
      experience_level,
      min_exp_years,
      education_required,
      salary_range,
      description,
      responsibilities,
      benefits,
      required_skills,
      preferred_skills,
    } = req.body;

    if (!title || !description || !location) {
      return errorResponse(res, 'Job title, location, and description are required.', 400);
    }

    const cName = company_name || req.user.companyName || 'Company';

    const jobRes = await db.query(
      `INSERT INTO jobs (
        recruiter_id, title, company_name, location, job_type, experience_level,
        min_exp_years, education_required, salary_range, description, responsibilities, benefits, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Active')
      RETURNING *`,
      [
        recruiterId,
        title,
        cName,
        location,
        job_type || 'Full-Time',
        experience_level || 'Mid-Level',
        min_exp_years || 0,
        education_required || "Bachelor's Degree",
        salary_range || 'Competitive',
        description,
        responsibilities,
        benefits,
      ]
    );

    const job = jobRes.rows[0];

    // Helper to map and insert skills
    const insertSkills = async (skillList, isRequired) => {
      if (!Array.isArray(skillList)) return;
      for (const skillName of skillList) {
        if (!skillName || !skillName.trim()) continue;
        let sRes = await db.query('SELECT id FROM skills WHERE LOWER(name) = LOWER($1)', [skillName.trim()]);
        let skillId;
        if (sRes.rows.length > 0) {
          skillId = sRes.rows[0].id;
        } else {
          const newSkill = await db.query(
            `INSERT INTO skills (name, category, normalized_name) VALUES ($1, 'Technical', LOWER($1)) RETURNING id`,
            [skillName.trim()]
          );
          skillId = newSkill.rows[0].id;
        }

        await db.query(
          `INSERT INTO job_skills (job_id, skill_id, is_required) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [job.id, skillId, isRequired]
        );
      }
    };

    await insertSkills(required_skills, true);
    await insertSkills(preferred_skills, false);

    return successResponse(res, { job }, 'Job posted successfully!', 201);
  } catch (error) {
    console.error('createJob Error:', error);
    return errorResponse(res, 'Failed to post job.', 500, error.message);
  }
};

// Get All Jobs (with search, filter, and match percentage if student)
exports.getJobs = async (req, res) => {
  try {
    const { search, location, job_type, experience_level } = req.query;

    let query = `
      SELECT j.*, rp.company_logo,
        (SELECT json_agg(json_build_object('id', s.id, 'name', s.name, 'is_required', js.is_required))
         FROM job_skills js
         JOIN skills s ON js.skill_id = s.id
         WHERE js.job_id = j.id) as skills,
        (SELECT COUNT(id) FROM applications WHERE job_id = j.id) as applicant_count
      FROM jobs j
      JOIN recruiter_profiles rp ON j.recruiter_id = rp.id
      WHERE j.status = 'Active'
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (j.title ILIKE $${params.length} OR j.description ILIKE $${params.length} OR j.company_name ILIKE $${params.length})`;
    }

    if (location) {
      params.push(`%${location}%`);
      query += ` AND j.location ILIKE $${params.length}`;
    }

    if (job_type) {
      params.push(job_type);
      query += ` AND j.job_type = $${params.length}`;
    }

    if (experience_level) {
      params.push(experience_level);
      query += ` AND j.experience_level = $${params.length}`;
    }

    query += ` ORDER BY j.created_at DESC`;

    const jobsRes = await db.query(query, params);
    let jobs = jobsRes.rows;

    // If student is logged in, calculate live match percentages
    if (req.user && req.user.role === 'student' && req.user.studentProfileId) {
      const studentCandidate = await getStudentCandidateProfile(req.user.studentProfileId);
      if (studentCandidate) {
        jobs = await Promise.all(
          jobs.map(async (job) => {
            try {
              const reqSkills = (job.skills || []).filter((s) => s.is_required).map((s) => s.name);
              const prefSkills = (job.skills || []).filter((s) => !s.is_required).map((s) => s.name);

              const matchRes = await aiService.matchJob(studentCandidate, {
                title: job.title,
                required_skills: reqSkills,
                preferred_skills: prefSkills,
                min_exp_years: parseFloat(job.min_exp_years || 0),
                education_required: job.education_required,
                description: job.description,
              });

              return {
                ...job,
                match_percentage: matchRes.match_percentage,
                match_breakdown: matchRes.breakdown,
                matched_skills: matchRes.matched_skills,
                missing_skills: matchRes.missing_skills,
                explanation: matchRes.explanation,
              };
            } catch (err) {
              return { ...job, match_percentage: null };
            }
          })
        );
      }
    }

    return successResponse(res, { jobs });
  } catch (error) {
    console.error('getJobs Error:', error);
    return errorResponse(res, 'Failed to fetch jobs.', 500, error.message);
  }
};

// Get Job Details by ID
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const jobRes = await db.query(
      `SELECT j.*, rp.company_website, rp.company_description, rp.company_logo, rp.location as company_location
       FROM jobs j
       JOIN recruiter_profiles rp ON j.recruiter_id = rp.id
       WHERE j.id = $1`,
      [id]
    );

    if (jobRes.rows.length === 0) {
      return errorResponse(res, 'Job not found.', 404);
    }

    const job = jobRes.rows[0];

    const skillsRes = await db.query(
      `SELECT s.id, s.name, s.category, js.is_required
       FROM job_skills js
       JOIN skills s ON js.skill_id = s.id
       WHERE js.job_id = $1`,
      [id]
    );

    job.skills = skillsRes.rows;

    // If student is logged in, perform AI job match scoring
    let matchAnalysis = null;
    let hasApplied = false;

    if (req.user && req.user.role === 'student' && req.user.studentProfileId) {
      const studentCandidate = await getStudentCandidateProfile(req.user.studentProfileId);
      if (studentCandidate) {
        const reqSkills = job.skills.filter((s) => s.is_required).map((s) => s.name);
        const prefSkills = job.skills.filter((s) => !s.is_required).map((s) => s.name);

        try {
          matchAnalysis = await aiService.matchJob(studentCandidate, {
            title: job.title,
            required_skills: reqSkills,
            preferred_skills: prefSkills,
            min_exp_years: parseFloat(job.min_exp_years || 0),
            education_required: job.education_required,
            description: job.description,
          });
        } catch (e) {
          console.error('AI match analysis failed:', e.message);
        }

        const appRes = await db.query(
          `SELECT id, status, applied_at FROM applications WHERE job_id = $1 AND student_id = $2`,
          [id, req.user.studentProfileId]
        );
        if (appRes.rows.length > 0) {
          hasApplied = true;
          job.application = appRes.rows[0];
        }
      }
    }

    return successResponse(res, { job, matchAnalysis, hasApplied });
  } catch (error) {
    console.error('getJobById Error:', error);
    return errorResponse(res, 'Failed to fetch job details.', 500, error.message);
  }
};

// Recruiter Manage Jobs
exports.getRecruiterJobs = async (req, res) => {
  try {
    const recruiterId = req.user.recruiterProfileId;

    const jobsRes = await db.query(
      `SELECT j.*,
        (SELECT COUNT(id) FROM applications WHERE job_id = j.id) as applicant_count,
        (SELECT json_agg(json_build_object('name', s.name, 'is_required', js.is_required))
         FROM job_skills js JOIN skills s ON js.skill_id = s.id WHERE js.job_id = j.id) as skills
       FROM jobs j
       WHERE j.recruiter_id = $1
       ORDER BY j.created_at DESC`,
      [recruiterId]
    );

    return successResponse(res, { jobs: jobsRes.rows });
  } catch (error) {
    console.error('getRecruiterJobs Error:', error);
    return errorResponse(res, 'Failed to fetch recruiter jobs.', 500, error.message);
  }
};

// Update Job
exports.updateJob = async (req, res) => {
  try {
    const recruiterId = req.user.recruiterProfileId;
    const { id } = req.params;
    const {
      title,
      location,
      job_type,
      experience_level,
      min_exp_years,
      education_required,
      salary_range,
      description,
      responsibilities,
      benefits,
      status,
    } = req.body;

    const updateRes = await db.query(
      `UPDATE jobs
       SET title = COALESCE($1, title),
           location = COALESCE($2, location),
           job_type = COALESCE($3, job_type),
           experience_level = COALESCE($4, experience_level),
           min_exp_years = COALESCE($5, min_exp_years),
           education_required = COALESCE($6, education_required),
           salary_range = COALESCE($7, salary_range),
           description = COALESCE($8, description),
           responsibilities = COALESCE($9, responsibilities),
           benefits = COALESCE($10, benefits),
           status = COALESCE($11, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12 AND recruiter_id = $13
       RETURNING *`,
      [
        title,
        location,
        job_type,
        experience_level,
        min_exp_years,
        education_required,
        salary_range,
        description,
        responsibilities,
        benefits,
        status,
        id,
        recruiterId,
      ]
    );

    if (updateRes.rows.length === 0) {
      return errorResponse(res, 'Job not found or unauthorized.', 404);
    }

    return successResponse(res, { job: updateRes.rows[0] }, 'Job updated successfully.');
  } catch (error) {
    console.error('updateJob Error:', error);
    return errorResponse(res, 'Failed to update job.', 500, error.message);
  }
};

// Delete Job
exports.deleteJob = async (req, res) => {
  try {
    const recruiterId = req.user.recruiterProfileId;
    const { id } = req.params;

    const delRes = await db.query('DELETE FROM jobs WHERE id = $1 AND recruiter_id = $2 RETURNING id', [id, recruiterId]);
    if (delRes.rows.length === 0) {
      return errorResponse(res, 'Job not found or unauthorized.', 404);
    }

    return successResponse(res, null, 'Job deleted successfully.');
  } catch (error) {
    console.error('deleteJob Error:', error);
    return errorResponse(res, 'Failed to delete job.', 500, error.message);
  }
};

// Intelligent Job Recommendations for Student
exports.getJobRecommendations = async (req, res) => {
  try {
    const studentId = req.user.studentProfileId;
    const studentCandidate = await getStudentCandidateProfile(studentId);

    if (!studentCandidate) {
      return errorResponse(res, 'Student profile not found.', 404);
    }

    // Fetch all active jobs with skills
    const jobsRes = await db.query(
      `SELECT j.*, rp.company_logo,
        (SELECT json_agg(json_build_object('name', s.name, 'is_required', js.is_required))
         FROM job_skills js JOIN skills s ON js.skill_id = s.id WHERE js.job_id = j.id) as skills
       FROM jobs j
       JOIN recruiter_profiles rp ON j.recruiter_id = rp.id
       WHERE j.status = 'Active'`
    );

    const jobs = jobsRes.rows;

    const scoredJobs = await Promise.all(
      jobs.map(async (job) => {
        const reqSkills = (job.skills || []).filter((s) => s.is_required).map((s) => s.name);
        const prefSkills = (job.skills || []).filter((s) => !s.is_required).map((s) => s.name);

        try {
          const matchRes = await aiService.matchJob(studentCandidate, {
            title: job.title,
            required_skills: reqSkills,
            preferred_skills: prefSkills,
            min_exp_years: parseFloat(job.min_exp_years || 0),
            education_required: job.education_required,
            description: job.description,
          });

          return {
            ...job,
            match_score: matchRes.match_percentage,
            breakdown: matchRes.breakdown,
            matched_skills: matchRes.matched_skills,
            missing_skills: matchRes.missing_skills,
            explanation: matchRes.explanation,
            verdict: matchRes.recommendation_verdict,
          };
        } catch (e) {
          return {
            ...job,
            match_score: 50.0,
            breakdown: { skill_score: 30, experience_score: 10, education_score: 5, project_score: 5, total_score: 50 },
            matched_skills: [],
            missing_skills: reqSkills,
            explanation: 'Match score computed with baseline profile.',
          };
        }
      })
    );

    // Sort descending by match_score
    scoredJobs.sort((a, b) => b.match_score - a.match_score);

    return successResponse(res, {
      student_skills: studentCandidate.skills,
      recommendations: scoredJobs,
    });
  } catch (error) {
    console.error('getJobRecommendations Error:', error);
    return errorResponse(res, 'Failed to fetch job recommendations.', 500, error.message);
  }
};
