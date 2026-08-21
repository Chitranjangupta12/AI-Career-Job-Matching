const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Get full student profile with skills, education, experience, projects, and resumes
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profileRes = await db.query(
      `SELECT sp.*, u.name, u.email
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.user_id = $1`,
      [userId]
    );

    if (profileRes.rows.length === 0) {
      return errorResponse(res, 'Student profile not found.', 404);
    }

    const profile = profileRes.rows[0];
    const studentId = profile.id;

    // Fetch Skills
    const skillsRes = await db.query(
      `SELECT s.id as skill_id, s.name, s.category, ss.proficiency_level, ss.years_of_experience
       FROM student_skills ss
       JOIN skills s ON ss.skill_id = s.id
       WHERE ss.student_id = $1
       ORDER BY s.name ASC`,
      [studentId]
    );

    // Fetch Education
    const educationRes = await db.query(
      `SELECT * FROM student_education WHERE student_id = $1 ORDER BY start_year DESC`,
      [studentId]
    );

    // Fetch Experience
    const experienceRes = await db.query(
      `SELECT * FROM student_experience WHERE student_id = $1 ORDER BY start_date DESC`,
      [studentId]
    );

    // Fetch Projects
    const projectsRes = await db.query(
      `SELECT * FROM student_projects WHERE student_id = $1 ORDER BY created_at DESC`,
      [studentId]
    );

    // Fetch Resumes
    const resumesRes = await db.query(
      `SELECT id, file_name, file_size, uploaded_at, summary FROM resumes WHERE student_id = $1 ORDER BY uploaded_at DESC`,
      [studentId]
    );

    return successResponse(res, {
      profile,
      skills: skillsRes.rows,
      education: educationRes.rows,
      experience: experienceRes.rows,
      projects: projectsRes.rows,
      resumes: resumesRes.rows,
    });
  } catch (error) {
    console.error('getProfile Error:', error);
    return errorResponse(res, 'Failed to fetch student profile.', 500, error.message);
  }
};

// Update personal details
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      headline,
      phone,
      location,
      bio,
      education_level,
      major,
      experience_years,
      interests,
      github_url,
      linkedin_url,
      portfolio_url,
    } = req.body;

    const updateRes = await db.query(
      `UPDATE student_profiles
       SET headline = COALESCE($1, headline),
           phone = COALESCE($2, phone),
           location = COALESCE($3, location),
           bio = COALESCE($4, bio),
           education_level = COALESCE($5, education_level),
           major = COALESCE($6, major),
           experience_years = COALESCE($7, experience_years),
           interests = COALESCE($8, interests),
           github_url = COALESCE($9, github_url),
           linkedin_url = COALESCE($10, linkedin_url),
           portfolio_url = COALESCE($11, portfolio_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $12
       RETURNING *`,
      [
        headline,
        phone,
        location,
        bio,
        education_level,
        major,
        experience_years,
        interests,
        github_url,
        linkedin_url,
        portfolio_url,
        userId,
      ]
    );

    return successResponse(res, { profile: updateRes.rows[0] }, 'Profile updated successfully.');
  } catch (error) {
    console.error('updateProfile Error:', error);
    return errorResponse(res, 'Failed to update profile.', 500, error.message);
  }
};

// Education CRUD
exports.addEducation = async (req, res) => {
  try {
    const studentId = req.user.studentProfileId;
    const { institution, degree, field_of_study, start_year, end_year, grade } = req.body;

    if (!institution || !degree) {
      return errorResponse(res, 'Institution and degree are required.', 400);
    }

    const newEdu = await db.query(
      `INSERT INTO student_education (student_id, institution, degree, field_of_study, start_year, end_year, grade)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [studentId, institution, degree, field_of_study, start_year, end_year, grade]
    );

    return successResponse(res, { education: newEdu.rows[0] }, 'Education added successfully.', 201);
  } catch (error) {
    console.error('addEducation Error:', error);
    return errorResponse(res, 'Failed to add education.', 500, error.message);
  }
};

exports.deleteEducation = async (req, res) => {
  try {
    const studentId = req.user.studentProfileId;
    const { id } = req.params;

    await db.query('DELETE FROM student_education WHERE id = $1 AND student_id = $2', [id, studentId]);
    return successResponse(res, null, 'Education record deleted successfully.');
  } catch (error) {
    console.error('deleteEducation Error:', error);
    return errorResponse(res, 'Failed to delete education.', 500, error.message);
  }
};

// Experience CRUD
exports.addExperience = async (req, res) => {
  try {
    const studentId = req.user.studentProfileId;
    const { title, company, location, start_date, end_date, is_current, description } = req.body;

    if (!title || !company) {
      return errorResponse(res, 'Job title and company name are required.', 400);
    }

    const newExp = await db.query(
      `INSERT INTO student_experience (student_id, title, company, location, start_date, end_date, is_current, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [studentId, title, company, location, start_date || null, end_date || null, is_current || false, description]
    );

    return successResponse(res, { experience: newExp.rows[0] }, 'Experience added successfully.', 201);
  } catch (error) {
    console.error('addExperience Error:', error);
    return errorResponse(res, 'Failed to add experience.', 500, error.message);
  }
};

exports.deleteExperience = async (req, res) => {
  try {
    const studentId = req.user.studentProfileId;
    const { id } = req.params;

    await db.query('DELETE FROM student_experience WHERE id = $1 AND student_id = $2', [id, studentId]);
    return successResponse(res, null, 'Experience record deleted successfully.');
  } catch (error) {
    console.error('deleteExperience Error:', error);
    return errorResponse(res, 'Failed to delete experience.', 500, error.message);
  }
};

// Projects CRUD
exports.addProject = async (req, res) => {
  try {
    const studentId = req.user.studentProfileId;
    const { title, description, technologies, project_url } = req.body;

    if (!title) {
      return errorResponse(res, 'Project title is required.', 400);
    }

    const newProj = await db.query(
      `INSERT INTO student_projects (student_id, title, description, technologies, project_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [studentId, title, description, technologies, project_url]
    );

    return successResponse(res, { project: newProj.rows[0] }, 'Project added successfully.', 201);
  } catch (error) {
    console.error('addProject Error:', error);
    return errorResponse(res, 'Failed to add project.', 500, error.message);
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const studentId = req.user.studentProfileId;
    const { id } = req.params;

    await db.query('DELETE FROM student_projects WHERE id = $1 AND student_id = $2', [id, studentId]);
    return successResponse(res, null, 'Project deleted successfully.');
  } catch (error) {
    console.error('deleteProject Error:', error);
    return errorResponse(res, 'Failed to delete project.', 500, error.message);
  }
};

// Skills CRUD
exports.addSkill = async (req, res) => {
  try {
    const studentId = req.user.studentProfileId;
    const { skill_name, proficiency_level, years_of_experience } = req.body;

    if (!skill_name) {
      return errorResponse(res, 'Skill name is required.', 400);
    }

    // Find or create skill in skills taxonomy
    let skillRes = await db.query('SELECT id FROM skills WHERE LOWER(name) = LOWER($1)', [skill_name.trim()]);
    let skillId;

    if (skillRes.rows.length > 0) {
      skillId = skillRes.rows[0].id;
    } else {
      const newSkillRes = await db.query(
        `INSERT INTO skills (name, category, normalized_name)
         VALUES ($1, 'Technical', LOWER($1))
         RETURNING id`,
        [skill_name.trim()]
      );
      skillId = newSkillRes.rows[0].id;
    }

    // Insert student skill mapping
    await db.query(
      `INSERT INTO student_skills (student_id, skill_id, proficiency_level, years_of_experience)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (student_id, skill_id)
       DO UPDATE SET proficiency_level = EXCLUDED.proficiency_level, years_of_experience = EXCLUDED.years_of_experience`,
      [studentId, skillId, proficiency_level || 'Intermediate', years_of_experience || 1.0]
    );

    return successResponse(res, null, 'Skill added/updated successfully.', 201);
  } catch (error) {
    console.error('addSkill Error:', error);
    return errorResponse(res, 'Failed to add skill.', 500, error.message);
  }
};

exports.deleteSkill = async (req, res) => {
  try {
    const studentId = req.user.studentProfileId;
    const { skill_id } = req.params;

    await db.query('DELETE FROM student_skills WHERE student_id = $1 AND skill_id = $2', [studentId, skill_id]);
    return successResponse(res, null, 'Skill removed successfully.');
  } catch (error) {
    console.error('deleteSkill Error:', error);
    return errorResponse(res, 'Failed to remove skill.', 500, error.message);
  }
};

exports.getAvailableSkills = async (req, res) => {
  try {
    const skillsRes = await db.query('SELECT id, name, category FROM skills ORDER BY category, name ASC');
    return successResponse(res, { skills: skillsRes.rows }, 'Skills taxonomy fetched.');
  } catch (error) {
    console.error('getAvailableSkills Error:', error);
    return errorResponse(res, 'Failed to fetch skills.', 500, error.message);
  }
};
