import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI, careerAPI, jobAPI, applicationAPI } from '../../services/api';
import { Compass, Sparkles, FileText, Briefcase, Layers, TrendingUp, ArrowRight, UserCheck } from 'lucide-react';
import JobCard from '../../components/JobCard';
import SkillBadge from '../../components/SkillBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const StudentDashboard = () => {
  const [profileData, setProfileData] = useState(null);
  const [topCareers, setTopCareers] = useState([]);
  const [jobMatches, setJobMatches] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, careerRes, jobRes, appRes] = await Promise.allSettled([
          studentAPI.getProfile(),
          careerAPI.getRecommendations(),
          jobAPI.getRecommendations(),
          applicationAPI.getMyApplications(),
        ]);

        if (profRes.status === 'fulfilled') setProfileData(profRes.value.data.data);
        if (careerRes.status === 'fulfilled') setTopCareers(careerRes.value.data.data.top_recommendations || []);
        if (jobRes.status === 'fulfilled') setJobMatches(jobRes.value.data.data.recommendations?.slice(0, 3) || []);
        if (appRes.status === 'fulfilled') setApplications(appRes.value.data.data.applications || []);
      } catch (err) {
        console.error('Dashboard loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner fullPage text="Assembling your personalized career workspace..." />;

  const skills = profileData?.skills || [];
  const profile = profileData?.profile || {};

  return (
    <div className="page-wrapper">
      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)', borderRadius: '16px', color: 'white', padding: '2.25rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.82rem', color: '#c7d2fe', marginBottom: '0.75rem' }}>
            <Sparkles size={14} />
            <span>AI Career Profile Active</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Welcome, {profile.name || 'Student'}!</h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginTop: '0.35rem', maxWidth: '600px' }}>
            {profile.headline || 'Configure your profile and analyze your resume to get instant career pathways and smart job matches.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/student/resume" className="btn btn-primary" style={{ background: '#4f46e5' }}>
            <FileText size={16} />
            <span>Upload Resume</span>
          </Link>
          <Link to="/student/career-recommendations" className="btn btn-secondary" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', borderColor: 'transparent' }}>
            <Compass size={16} />
            <span>Career Pathways</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div className="stat-val">{skills.length}</div>
            <div className="stat-label">Verified Skills</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#0ea5e9' }}>
            <Compass size={24} />
          </div>
          <div>
            <div className="stat-val">{topCareers.length}</div>
            <div className="stat-label">Career Recommendations</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
            <Briefcase size={24} />
          </div>
          <div>
            <div className="stat-val">{jobMatches.length > 0 ? `${jobMatches[0]?.match_score || 85}%` : '85%'}</div>
            <div className="stat-label">Top Job Match</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <Layers size={24} />
          </div>
          <div>
            <div className="stat-val">{applications.length}</div>
            <div className="stat-label">Applications Submitted</div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Top Career Recommendations Preview */}
        <div className="card">
          <div className="card-header">
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase' }}>AI Guidance</div>
              <h2 className="card-title">Top Career Pathways</h2>
            </div>
            <Link to="/student/career-recommendations" style={{ color: '#4f46e5', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {topCareers.slice(0, 3).map((career, idx) => (
              <div key={idx} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{career.title}</div>
                  <span className="badge badge-primary">{career.match_score}% Fit</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>{career.explanation}</p>
                <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                  <strong>Avg Salary:</strong> {career.avg_salary} | <strong>Growth:</strong> {career.growth_rate}
                </div>
              </div>
            ))}
            {topCareers.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                Upload your resume to receive AI career guidance.
              </div>
            )}
          </div>
        </div>

        {/* My Skills Preview & Gap Analyzer Callout */}
        <div className="card">
          <div className="card-header">
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0ea5e9', textTransform: 'uppercase' }}>Skills Inventory</div>
              <h2 className="card-title">Your Technical Stack</h2>
            </div>
            <Link to="/student/profile" style={{ color: '#0ea5e9', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>Manage</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
            {skills.map((s, idx) => (
              <SkillBadge key={idx} name={s.name} />
            ))}
            {skills.length === 0 && (
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No skills added yet. Add skills in profile or upload a resume.</div>
            )}
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.95rem' }}>Analyze Your Skill Gaps</div>
              <div style={{ fontSize: '0.85rem', color: '#15803d', marginTop: '0.2rem' }}>
                Compare your current skills with industry standards.
              </div>
            </div>
            <Link to="/student/skill-gap" className="btn btn-sm btn-primary" style={{ background: '#16a34a', flexShrink: 0 }}>
              Launch Gap Analysis
            </Link>
          </div>
        </div>
      </div>

      {/* Recommended Jobs Row */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Top AI-Matched Jobs</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Jobs scored using your skills, experience, education, and projects</p>
          </div>
          <Link to="/student/job-recommendations" className="btn btn-outline btn-sm">
            <span>View All Matching Jobs</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid-3">
          {jobMatches.map((job) => (
            <JobCard key={job.id} job={job} isStudent={true} />
          ))}
          {jobMatches.length === 0 && (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              No active job recommendations currently. Check back shortly.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
