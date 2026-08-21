const db = require('../config/db');
const aiService = require('../services/aiService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Apply for Job (Student)
exports.applyForJob = async (req, res) => {
  try {
    const studentId = req.user.studentProfileId;
    const { job_id, resume_id, cover_letter } = req.body;

    if (!job_id) {
      return errorResponse(res, 'Job ID is required.', 400);
    }

    // Check if already applied
    const checkApp = await db.query(
      'SELECT id FROM applications WHERE job_id = $1 AND student_id = $2',
      [job_id, studentId]
    );
    if (checkApp.rows.length > 0) {
      return errorResponse(res, 'You have already applied for this job.', 409);
    }

    // Fetch Job & Requirements
    const jobRes = await db.query('SELECT * FROM jobs WHERE id = $1 AND status = $2', [job_id, 'Active']);
    if (jobRes.rows.length === 0) {
      return errorResponse(res, 'Job posting not found or no longer active.', 404);
    }
    const job = jobRes.rows[0];

    const jobSkillsRes = await db.query(
      `SELECT s.name, js.is_required FROM job_skills js JOIN skills s ON js.skill_id = s.id WHERE js.job_id = $1`,
      [job_id]
    );
    const reqSkills = jobSkillsRes.rows.filter((s) => s.is_required).map((s) => s.name);
    const prefSkills = jobSkillsRes.rows.filter((s) => !s.is_required).map((s) => s.name);

    // Fetch Student Candidate Profile for match calculation
    const sProfileRes = await db.query('SELECT * FROM student_profiles WHERE id = $1', [studentId]);
    const sProfile = sProfileRes.rows[0];

    const sSkillsRes = await db.query(
      `SELECT s.name FROM student_skills ss JOIN skills s ON ss.skill_id = s.id WHERE ss.student_id = $1`,
      [studentId]
    );
    const candSkills = sSkillsRes.rows.map((r) => r.name);

    const candProjectsRes = await db.query('SELECT title, technologies FROM student_projects WHERE student_id = $1', [studentId]);
    const candProjects = candProjectsRes.rows.map((p) => `${p.title}: ${p.technologies || ''}`);

    let matchPercentage = 50.0;
    let matchDetails = {};

    try {
      const matchResult = await aiService.matchJob(
        {
          skills: candSkills,
          experience_years: parseFloat(sProfile.experience_years || 0),
          education_level: sProfile.education_level || "Bachelor's",
          major: sProfile.major || '',
          projects: candProjects,
          bio: sProfile.bio || '',
        },
        {
          title: job.title,
          required_skills: reqSkills,
          preferred_skills: prefSkills,
          min_exp_years: parseFloat(job.min_exp_years || 0),
          education_required: job.education_required,
          description: job.description,
        }
      );

      matchPercentage = matchResult.match_percentage;
      matchDetails = matchResult;
    } catch (e) {
      console.error('Match score computation warning:', e.message);
    }

    const newApp = await db.query(
      `INSERT INTO applications (job_id, student_id, resume_id, match_score, match_details, cover_letter, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Applied')
       RETURNING *`,
      [job_id, studentId, resume_id || null, matchPercentage, JSON.stringify(matchDetails), cover_letter || '']
    );

    return successResponse(res, { application: newApp.rows[0] }, 'Application submitted successfully!', 201);
  } catch (error) {
    console.error('applyForJob Error:', error);
    return errorResponse(res, 'Failed to submit application.', 500, error.message);
  }
};

// Get My Applications (Student)
exports.getStudentApplications = async (req, res) => {
  try {
    const studentId = req.user.studentProfileId;

    const appsRes = await db.query(
      `SELECT a.*, j.title as job_title, j.company_name, j.location as job_location, j.job_type, j.salary_range,
              r.file_name as resume_file_name
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       LEFT JOIN resumes r ON a.resume_id = r.id
       WHERE a.student_id = $1
       ORDER BY a.applied_at DESC`,
      [studentId]
    );

    return successResponse(res, { applications: appsRes.rows });
  } catch (error) {
    console.error('getStudentApplications Error:', error);
    return errorResponse(res, 'Failed to fetch applications.', 500, error.message);
  }
};

// Get Job Applicants (Recruiter)
exports.getJobApplicants = async (req, res) => {
  try {
    const recruiterId = req.user.recruiterProfileId;
    const { jobId } = req.params;

    // Verify job belongs to recruiter
    const jobCheck = await db.query('SELECT id, title FROM jobs WHERE id = $1 AND recruiter_id = $2', [jobId, recruiterId]);
    if (jobCheck.rows.length === 0) {
      return errorResponse(res, 'Job not found or unauthorized.', 404);
    }

    const applicantsRes = await db.query(
      `SELECT a.*, u.name as candidate_name, u.email as candidate_email,
              sp.headline, sp.education_level, sp.major, sp.experience_years, sp.phone, sp.location as candidate_location,
              r.file_name as resume_file_name, r.id as resume_id,
              (SELECT json_agg(s.name) FROM student_skills ss JOIN skills s ON ss.skill_id = s.id WHERE ss.student_id = sp.id) as candidate_skills
       FROM applications a
       JOIN student_profiles sp ON a.student_id = sp.id
       JOIN users u ON sp.user_id = u.id
       LEFT JOIN resumes r ON a.resume_id = r.id
       WHERE a.job_id = $1
       ORDER BY a.match_score DESC, a.applied_at DESC`,
      [jobId]
    );

    return successResponse(res, {
      job: jobCheck.rows[0],
      applicants: applicantsRes.rows,
    });
  } catch (error) {
    console.error('getJobApplicants Error:', error);
    return errorResponse(res, 'Failed to fetch applicants.', 500, error.message);
  }
};

// Get Candidate Full Details for Recruiter View
exports.getCandidateDetails = async (req, res) => {
  try {
    const { studentId } = req.params;

    const profileRes = await db.query(
      `SELECT sp.*, u.name, u.email
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.id = $1`,
      [studentId]
    );

    if (profileRes.rows.length === 0) {
      return errorResponse(res, 'Candidate not found.', 404);
    }

    const profile = profileRes.rows[0];

    const skillsRes = await db.query(
      `SELECT s.name, s.category, ss.proficiency_level, ss.years_of_experience
       FROM student_skills ss
       JOIN skills s ON ss.skill_id = s.id
       WHERE ss.student_id = $1`,
      [studentId]
    );

    const educationRes = await db.query(
      `SELECT * FROM student_education WHERE student_id = $1 ORDER BY start_year DESC`,
      [studentId]
    );

    const experienceRes = await db.query(
      `SELECT * FROM student_experience WHERE student_id = $1 ORDER BY start_date DESC`,
      [studentId]
    );

    const projectsRes = await db.query(
      `SELECT * FROM student_projects WHERE student_id = $1 ORDER BY created_at DESC`,
      [studentId]
    );

    return successResponse(res, {
      profile,
      skills: skillsRes.rows,
      education: educationRes.rows,
      experience: experienceRes.rows,
      projects: projectsRes.rows,
    });
  } catch (error) {
    console.error('getCandidateDetails Error:', error);
    return errorResponse(res, 'Failed to fetch candidate details.', 500, error.message);
  }
};

// Update Application Status (Recruiter)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const recruiterId = req.user.recruiterProfileId;
    const { applicationId } = req.params;
    const { status } = req.body;

    const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, `Invalid status. Valid values: ${validStatuses.join(', ')}`, 400);
    }

    // Check recruiter ownership
    const appCheck = await db.query(
      `SELECT a.id FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.id = $1 AND j.recruiter_id = $2`,
      [applicationId, recruiterId]
    );

    if (appCheck.rows.length === 0) {
      return errorResponse(res, 'Application not found or unauthorized.', 404);
    }

    const updateRes = await db.query(
      `UPDATE applications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, applicationId]
    );

    return successResponse(res, { application: updateRes.rows[0] }, `Application status updated to "${status}".`);
  } catch (error) {
    console.error('updateApplicationStatus Error:', error);
    return errorResponse(res, 'Failed to update application status.', 500, error.message);
  }
};
