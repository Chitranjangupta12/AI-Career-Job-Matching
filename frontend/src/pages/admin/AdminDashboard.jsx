import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Shield, Users, Briefcase, Layers, UserCheck, CheckCircle2, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await adminAPI.getStats();
        setStats(res.data.data.stats || {});
        setRecentUsers(res.data.data.recentUsers || []);
        setRecentJobs(res.data.data.recentJobs || []);
      } catch (err) {
        console.error('Admin stats loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) return <LoadingSpinner fullPage text="Loading system analytics and admin dashboard..." />;

  return (
    <div className="page-wrapper">
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', borderRadius: '16px', color: 'white', padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.82rem', color: '#c7d2fe', marginBottom: '0.5rem' }}>
          <Shield size={14} />
          <span>System Administration Control Center</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Platform Administration</h1>
        <p style={{ color: '#cbd5e1', fontSize: '0.92rem', marginTop: '0.25rem' }}>
          Monitor system metrics, user growth, job distribution, and applicant analytics.
        </p>
      </div>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.total_students || 0}</div>
            <div className="stat-label">Registered Students</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#0ea5e9' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.total_recruiters || 0}</div>
            <div className="stat-label">Recruiter Accounts</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <Briefcase size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.total_jobs || 0}</div>
            <div className="stat-label">Jobs Posted ({stats.active_jobs || 0} Active)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
            <Layers size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.total_applications || 0}</div>
            <div className="stat-label">Total Applications</div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Recent Users */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent User Registrations</h2>
          </div>
          <table className="custom-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{u.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.email}</div>
                  </td>
                  <td>
                    <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Jobs */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Job Listings</h2>
          </div>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Title & Company</th>
                <th>Type</th>
                <th>Applicants</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.map((j) => (
                <tr key={j.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{j.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{j.company_name}</div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{j.job_type}</td>
                  <td>
                    <span className="badge badge-secondary">{j.applicant_count || 0}</span>
                  </td>
                  <td>
                    <span className={`badge ${j.status === 'Active' ? 'badge-success' : 'badge-secondary'}`}>
                      {j.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
