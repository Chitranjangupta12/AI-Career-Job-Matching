import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import ResumeUpload from './pages/student/ResumeUpload';
import CareerRecommendations from './pages/student/CareerRecommendations';
import JobRecommendations from './pages/student/JobRecommendations';
import JobSearch from './pages/student/JobSearch';
import JobDetails from './pages/student/JobDetails';
import Applications from './pages/student/Applications';
import SkillGap from './pages/student/SkillGap';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterProfile from './pages/recruiter/RecruiterProfile';
import CreateJob from './pages/recruiter/CreateJob';
import ManageJobs from './pages/recruiter/ManageJobs';
import Applicants from './pages/recruiter/Applicants';
import CandidateDetails from './pages/recruiter/CandidateDetails';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageRecruiters from './pages/admin/ManageRecruiters';
import AdminManageJobs from './pages/admin/ManageJobs';
import ManageApplications from './pages/admin/ManageApplications';

// App Layout Wrapper
const AppLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const showSidebar = isAuthenticated && (user?.role === 'student' || user?.role === 'recruiter' || user?.role === 'admin');

  return (
    <div className="app-container">
      {showSidebar && <Sidebar />}
      <div className="main-content">
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<JobSearch />} />
            <Route path="/jobs/:id" element={<JobDetails />} />

            {/* Student Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/profile" element={<StudentProfile />} />
              <Route path="/student/resume" element={<ResumeUpload />} />
              <Route path="/student/career-recommendations" element={<CareerRecommendations />} />
              <Route path="/student/job-recommendations" element={<JobRecommendations />} />
              <Route path="/student/jobs" element={<JobSearch />} />
              <Route path="/student/applications" element={<Applications />} />
              <Route path="/student/skill-gap" element={<SkillGap />} />
            </Route>

            {/* Recruiter Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
              <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
              <Route path="/recruiter/profile" element={<RecruiterProfile />} />
              <Route path="/recruiter/create-job" element={<CreateJob />} />
              <Route path="/recruiter/manage-jobs" element={<ManageJobs />} />
              <Route path="/recruiter/jobs/:jobId/applicants" element={<Applicants />} />
              <Route path="/recruiter/candidate/:studentId" element={<CandidateDetails />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<ManageStudents />} />
              <Route path="/admin/recruiters" element={<ManageRecruiters />} />
              <Route path="/admin/jobs" element={<AdminManageJobs />} />
              <Route path="/admin/applications" element={<ManageApplications />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {!showSidebar && <Footer />}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
