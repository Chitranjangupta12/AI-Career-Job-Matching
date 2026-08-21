import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recruiterAPI } from '../../services/api';
import { Briefcase, Users, CheckCircle, PlusCircle, ArrowRight, Sparkles, Building } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const RecruiterDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await recruiterAPI.getStats();
        setStats(res.data.data.stats || {});
        setRecentApplicants(res.data.data.recentApplicants || []);
      } catch (err) {
        console.error('Recruiter stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner fullPage text="Loading recruiter workspace..." />;

  return (
    <div className="page-wrapper">
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '16px', color: 'white', padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(99, 102, 241, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.82rem', color: '#c7d2fe', marginBottom: '0.5rem' }}>
            <Building size={14} />
            <span>Recruiter Talent Portal</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Recruiter Dashboard</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '0.25rem' }}>
            Manage job postings and evaluate candidate skill profiles with AI match scoring.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/recruiter/create-job" className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Post New Job</span>
          </Link>
          <Link to="/recruiter/manage-jobs" className="btn btn-secondary" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'transparent' }}>
            <span>Manage Jobs</span>
          </Link>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <Briefcase size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.total_jobs || 0}</div>
            <div className="stat-label">Total Jobs Posted</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <Briefcase size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.active_jobs || 0}</div>
            <div className="stat-label">Active Listings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#0ea5e9' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.total_applications || 0}</div>
            <div className="stat-label">Total Applications</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.shortlisted_count || 0}</div>
            <div className="stat-label">Shortlisted Candidates</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Candidate Applications</h2>
          <Link to="/recruiter/manage-jobs" style={{ color: '#4f46e5', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>View All Jobs</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Candidate Name</th>
              <th>Applied For Job</th>
              <th>AI Match Score</th>
              <th>Status</th>
              <th>Date Applied</th>
            </tr>
          </thead>
          <tbody>
            {recentApplicants.map((a) => (
              <tr key={a.id}>
                <td>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{a.candidate_name}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{a.headline || 'Candidate'}</div>
                </td>
                <td style={{ fontWeight: 600, color: '#334155' }}>{a.job_title}</td>
                <td>
                  <span className="badge badge-primary" style={{ fontWeight: 700 }}>
                    {a.match_score}% Match
                  </span>
                </td>
                <td>
                  <span className="badge badge-secondary">{a.status}</span>
                </td>
                <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  {new Date(a.applied_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {recentApplicants.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            No applications received yet. Post jobs to attract top student talent.
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
