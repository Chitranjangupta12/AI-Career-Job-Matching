const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const aiService = require('../services/aiService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Upload and Parse Resume PDF / Document
exports.uploadAndParseResume = async (req, res) => {
  try {
    let studentId = req.user?.studentProfileId;

    // Fallback: If studentProfileId is not populated on req.user, resolve or create profile
    if (!studentId && req.user?.id) {
      const pRes = await db.query('SELECT id FROM student_profiles WHERE user_id = $1', [req.user.id]);
      if (pRes.rows.length > 0) {
        studentId = pRes.rows[0].id;
        req.user.studentProfileId = studentId;
      } else {
        const newProfile = await db.query(
          `INSERT INTO student_profiles (user_id, headline) VALUES ($1, 'Student') RETURNING id`,
          [req.user.id]
        );
        studentId = newProfile.rows[0].id;
        req.user.studentProfileId = studentId;
      }
    }

    if (!studentId) {
      return errorResponse(res, 'Student profile not found. Please log in as a student.', 403);
    }

    if (!req.file) {
      return errorResponse(res, 'Please select and upload a valid PDF, DOCX, or text resume file.', 400);
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const fileSize = req.file.size;
    const mimeType = req.file.mimetype;

    console.log(`[ResumeUpload] Processing upload for student #${studentId}: ${originalName} (${fileSize} bytes)`);

    // Call Python FastAPI AI NLP Service
    const aiParseResult = await aiService.parseResumeFile(filePath, originalName);

    // Save resume record in DB
    const resumeRes = await db.query(
      `INSERT INTO resumes (student_id, file_name, file_path, file_size, mime_type, raw_text, parsed_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, file_name, file_size, uploaded_at, parsed_data`,
      [
        studentId,
        originalName,
        filePath,
        fileSize,
        mimeType,
        aiParseResult.raw_text || '',
        JSON.stringify(aiParseResult),
      ]
    );

    const savedResume = resumeRes.rows[0];

    // Auto-sync extracted skills to student profile if non-empty
    const autoExtractedSkills = Array.isArray(aiParseResult.skills) ? aiParseResult.skills : [];
    let syncedSkillsCount = 0;

    for (const rawSkill of autoExtractedSkills) {
      if (!rawSkill || typeof rawSkill !== 'string') continue;
      const skillName = rawSkill.trim().slice(0, 100);
      if (!skillName) continue;

      let sRes = await db.query('SELECT id FROM skills WHERE LOWER(name) = LOWER($1)', [skillName]);
      let skillId;
      if (sRes.rows.length > 0) {
        skillId = sRes.rows[0].id;
      } else {
        const normalizedSkill = skillName.toLowerCase();
        const newSkill = await db.query(
          `INSERT INTO skills (name, category, normalized_name)
           VALUES ($1, 'Technical', $2)
           ON CONFLICT (name) DO UPDATE SET normalized_name = EXCLUDED.normalized_name
           RETURNING id`,
          [skillName, normalizedSkill]
        );
        skillId = newSkill.rows[0].id;
      }

      await db.query(
        `INSERT INTO student_skills (student_id, skill_id, proficiency_level, years_of_experience)
         VALUES ($1, $2, 'Intermediate', 1.0)
         ON CONFLICT (student_id, skill_id) DO NOTHING`,
        [studentId, skillId]
      );
      syncedSkillsCount++;
    }

    // Update experience years if estimated and currently 0
    const estExp = Number(aiParseResult.experience_years_estimated);
    if (estExp > 0) {
      await db.query(
        `UPDATE student_profiles
         SET experience_years = CASE WHEN COALESCE(experience_years, 0) = 0 THEN $1 ELSE experience_years END
         WHERE id = $2`,
        [estExp, studentId]
      );
    }

    return successResponse(
      res,
      {
        resume: savedResume,
        extracted: aiParseResult,
        synced_skills_count: syncedSkillsCount,
      },
      'Resume uploaded, parsed with NLP, and skills extracted successfully!',
      201
    );
  } catch (error) {
    console.error('[ResumeUpload] uploadAndParseResume Error:', error.message || error);
    const errorMessage = error.message || 'Failed to process resume.';
    return errorResponse(res, errorMessage, 500, errorMessage);
  }
};

// Parse Raw Text Resume
exports.parseRawText = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length < 10) {
      return errorResponse(res, 'Resume text must be at least 10 characters.', 400);
    }

    const aiParseResult = await aiService.parseResumeText(text);
    return successResponse(res, { extracted: aiParseResult }, 'Resume text analyzed successfully.');
  } catch (error) {
    console.error('parseRawText Error:', error);
    return errorResponse(res, 'Failed to analyze text.', 500, error.message);
  }
};

// Get student resumes
exports.getStudentResumes = async (req, res) => {
  try {
    let studentId = req.user?.studentProfileId;
    if (!studentId && req.user?.id) {
      const pRes = await db.query('SELECT id FROM student_profiles WHERE user_id = $1', [req.user.id]);
      if (pRes.rows.length > 0) {
        studentId = pRes.rows[0].id;
        req.user.studentProfileId = studentId;
      }
    }

    if (!studentId) {
      return successResponse(res, { resumes: [] });
    }

    const resumesRes = await db.query(
      `SELECT id, file_name, file_size, uploaded_at, parsed_data FROM resumes WHERE student_id = $1 ORDER BY uploaded_at DESC`,
      [studentId]
    );

    return successResponse(res, { resumes: resumesRes.rows });
  } catch (error) {
    console.error('getStudentResumes Error:', error);
    return errorResponse(res, 'Failed to fetch resumes.', 500, error.message);
  }
};
