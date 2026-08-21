const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const aiService = require('../services/aiService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Upload and Parse Resume PDF / Document
exports.uploadAndParseResume = async (req, res) => {
  try {
    const studentId = req.user.studentProfileId;

    if (!req.file) {
      return errorResponse(res, 'Please upload a PDF or text resume file.', 400);
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const fileSize = req.file.size;
    const mimeType = req.file.mimetype;

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

    // Auto-sync extracted skills to student profile if requested or non-empty
    const autoExtractedSkills = aiParseResult.skills || [];
    let syncedSkillsCount = 0;

    for (const skillName of autoExtractedSkills) {
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
        `INSERT INTO student_skills (student_id, skill_id, proficiency_level, years_of_experience)
         VALUES ($1, $2, 'Intermediate', 1.0)
         ON CONFLICT (student_id, skill_id) DO NOTHING`,
        [studentId, skillId]
      );
      syncedSkillsCount++;
    }

    // Update experience years if estimated and currently 0
    if (aiParseResult.experience_years_estimated > 0) {
      await db.query(
        `UPDATE student_profiles
         SET experience_years = CASE WHEN experience_years = 0 THEN $1 ELSE experience_years END
         WHERE id = $2`,
        [aiParseResult.experience_years_estimated, studentId]
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
    console.error('uploadAndParseResume Error:', error);
    return errorResponse(res, 'Failed to process resume.', 500, error.message);
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
    const studentId = req.user.studentProfileId;
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
