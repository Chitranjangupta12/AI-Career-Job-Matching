import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  FileText,
  Compass,
  Briefcase,
  Layers,
  Sparkles,
  PlusCircle,
  Users,
  Shield,
  LogOut,
  Building,
  TrendingUp
} from 'lucide-react';

const Sidebar = () => {
  const { user, isStudent, isRecruiter, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Compass size={24} color="#818cf8" />
        <div>
          <div style={{ fontSize: '1rem', lineHeight: 1.2 }}>CareerAI</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, textTransform: 'capitalize' }}>
            {user?.role} Workspace
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* STUDENT NAV */}
        {isStudent && (
          <>
            <NavLink to="/student/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </NavLink>
            <NavLink to="/student/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <User size={18} />
              <span>My Profile & Skills</span>
            </NavLink>
            <NavLink to="/student/resume" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FileText size={18} />
              <span>Resume AI Parser</span>
            </NavLink>
            <NavLink to="/student/career-recommendations" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Compass size={18} />
              <span>Career Guidance</span>
            </NavLink>
            <NavLink to="/student/job-recommendations" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Sparkles size={18} />
              <span>Job Match Engine</span>
            </NavLink>
            <NavLink to="/student/jobs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Briefcase size={18} />
              <span>Search All Jobs</span>
            </NavLink>
            <NavLink to="/student/skill-gap" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <TrendingUp size={18} />
              <span>Skill-Gap Analysis</span>
            </NavLink>
            <NavLink to="/student/applications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Layers size={18} />
              <span>Applications Tracker</span>
            </NavLink>
          </>
        )}

        {/* RECRUITER NAV */}
        {isRecruiter && (
          <>
            <NavLink to="/recruiter/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Recruiter Overview</span>
            </NavLink>
            <NavLink to="/recruiter/create-job" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <PlusCircle size={18} />
              <span>Post New Job</span>
            </NavLink>
            <NavLink to="/recruiter/manage-jobs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Briefcase size={18} />
              <span>Manage Posted Jobs</span>
            </NavLink>
            <NavLink to="/recruiter/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Building size={18} />
              <span>Company Profile</span>
            </NavLink>
          </>
        )}

        {/* ADMIN NAV */}
        {isAdmin && (
          <>
            <NavLink to="/admin/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Shield size={18} />
              <span>Admin Metrics</span>
            </NavLink>
            <NavLink to="/admin/students" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Users size={18} />
              <span>Manage Students</span>
            </NavLink>
            <NavLink to="/admin/recruiters" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Building size={18} />
              <span>Manage Recruiters</span>
            </NavLink>
            <NavLink to="/admin/jobs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Briefcase size={18} />
              <span>Manage All Jobs</span>
            </NavLink>
            <NavLink to="/admin/applications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Layers size={18} />
              <span>All Applications</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="sidebar-link"
          style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
