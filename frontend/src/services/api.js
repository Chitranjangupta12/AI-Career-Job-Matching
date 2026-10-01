import axios from 'axios';

const API_BASE_URL = 'https://ai-career-job-matching.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT Token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('career_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      // localStorage.removeItem('career_token');
      // localStorage.removeItem('career_user');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin/login', data),
  getMe: () => api.get('/auth/me'),
};

export const studentAPI = {
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data) => api.put('/students/profile', data),
  getAvailableSkills: () => api.get('/students/skills/available'),
  addSkill: (data) => api.post('/students/skills', data),
  deleteSkill: (skillId) => api.delete(`/students/skills/${skillId}`),
  addEducation: (data) => api.post('/students/education', data),
  deleteEducation: (id) => api.delete(`/students/education/${id}`),
  addExperience: (data) => api.post('/students/experience', data),
  deleteExperience: (id) => api.delete(`/students/experience/${id}`),
  addProject: (data) => api.post('/students/projects', data),
  deleteProject: (id) => api.delete(`/students/projects/${id}`),
};

export const resumeAPI = {
  uploadResume: (formData) => api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  parseText: (text) => api.post('/resumes/parse-text', { text }),
  getMyResumes: () => api.get('/resumes/my-resumes'),
};

export const careerAPI = {
  getCareerRoles: () => api.get('/careers/roles'),
  getRecommendations: () => api.get('/careers/recommendations'),
  getSkillGap: (data) => api.post('/careers/skill-gap', data),
};

export const jobAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  getRecommendations: () => api.get('/jobs/recommendations'),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getRecruiterJobs: () => api.get('/jobs/recruiter/my-jobs'),
};

export const applicationAPI = {
  apply: (data) => api.post('/applications/apply', data),
  getMyApplications: () => api.get('/applications/student/my-applications'),
  getJobApplicants: (jobId) => api.get(`/applications/job/${jobId}/applicants`),
  getCandidateDetails: (studentId) => api.get(`/applications/candidate/${studentId}`),
  updateStatus: (applicationId, status) => api.patch(`/applications/${applicationId}/status`, { status }),
};

export const recruiterAPI = {
  getProfile: () => api.get('/recruiters/profile'),
  updateProfile: (data) => api.put('/recruiters/profile', data),
  getStats: () => api.get('/recruiters/stats'),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  getStudents: () => api.get('/admin/students'),
  getRecruiters: () => api.get('/admin/recruiters'),
  getJobs: () => api.get('/admin/jobs'),
  getApplications: () => api.get('/admin/applications'),
  toggleUserStatus: (userId) => api.patch(`/admin/users/${userId}/toggle-status`),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
};

export default api;
