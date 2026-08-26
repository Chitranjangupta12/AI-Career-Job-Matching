const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const env = require('../config/env');

const AI_BASE_URL = env.AI_SERVICE_URL;

class AIService {
  /**
   * Sends uploaded resume file to Python FastAPI service for text extraction & NLP skill parsing
   */
  async parseResumeFile(filePath, originalFilename) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Resume file not found on server at: ${filePath}`);
      }

      const form = new FormData();
      form.append('file', fs.createReadStream(filePath), {
        filename: originalFilename || path.basename(filePath),
      });

      const response = await axios.post(`${AI_BASE_URL}/api/ai/parse-resume`, form, {
        headers: {
          ...form.getHeaders(),
        },
        timeout: 30000,
        maxContentLength: 50 * 1024 * 1024,
        maxBodyLength: 50 * 1024 * 1024,
      });

      return response.data;
    } catch (error) {
      const errMsg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        (error.code === 'ECONNREFUSED'
          ? `Could not connect to Python AI microservice at ${AI_BASE_URL}. Please ensure the AI service is running.`
          : error.message) ||
        'Failed to parse resume via AI service.';
      console.error('AI Service Error (parseResumeFile):', errMsg);
      throw new Error(errMsg);
    }
  }

  /**
   * Parses raw resume text directly
   */
  async parseResumeText(text) {
    try {
      const response = await axios.post(`${AI_BASE_URL}/api/ai/parse-resume-text`, { text }, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      const errMsg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        (error.code === 'ECONNREFUSED'
          ? `Could not connect to Python AI microservice at ${AI_BASE_URL}. Please ensure the AI service is running.`
          : error.message) ||
        'Failed to parse resume text.';
      console.error('AI Service Error (parseResumeText):', errMsg);
      throw new Error(errMsg);
    }
  }

  /**
   * Performs 60/20/10/10 job match scoring
   */
  async matchJob(candidateProfile, jobRequirement) {
    try {
      const response = await axios.post(`${AI_BASE_URL}/api/ai/match-job`, {
        candidate: candidateProfile,
        job: jobRequirement,
      }, {
        timeout: 15000,
      });
      return response.data;
    } catch (error) {
      console.error('AI Service Error (matchJob):', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to compute job match.');
    }
  }

  /**
   * Gets top 5 career recommendations
   */
  async getCareerRecommendations(candidateProfile, interests = '') {
    try {
      const response = await axios.post(`${AI_BASE_URL}/api/ai/career-recommendation`, {
        candidate: candidateProfile,
        interests: interests,
      }, {
        timeout: 15000,
      });
      return response.data;
    } catch (error) {
      console.error('AI Service Error (getCareerRecommendations):', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to fetch career recommendations.');
    }
  }

  /**
   * Performs categorized skill gap analysis
   */
  async analyzeSkillGap(candidateSkills, targetRoleOrJobTitle, targetSkills = []) {
    try {
      const response = await axios.post(`${AI_BASE_URL}/api/ai/skill-gap`, {
        candidate_skills: candidateSkills,
        target_role_or_job_title: targetRoleOrJobTitle,
        target_skills: targetSkills,
      }, {
        timeout: 15000,
      });
      return response.data;
    } catch (error) {
      console.error('AI Service Error (analyzeSkillGap):', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to analyze skill gap.');
    }
  }

  /**
   * Fetches career roles knowledge base
   */
  async getCareerRoles() {
    try {
      const response = await axios.get(`${AI_BASE_URL}/api/ai/career-roles`, {
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      console.error('AI Service Error (getCareerRoles):', error.response?.data || error.message);
      throw new Error('Failed to retrieve career roles.');
    }
  }
}

module.exports = new AIService();
