import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Building } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageRecruiters = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecruiters = async () => {
    try {
      const res = await adminAPI.getRecruiters();
      setRecruiters(res.data.data.recruiters || []);
    } catch (err) {
      console.error('Error fetching recruiters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const handleToggleStatus = async (userId) => {
    try {
      await adminAPI.toggleUserStatus(userId);
      fetchRecruiters();
    } catch (err) {
      alert('Failed to update recruiter status.');
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading recruiters directory..." />;

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Manage Recruiters ({recruiters.length})</h1>
        <p style={{ color: '#64748b' }}>Supervise verified corporate recruiters and talent acquisition partners.</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Recruiter & Contact</th>
              <th>Company & Industry</th>
              <th>Jobs Posted</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {recruiters.map((r) => (
              <tr key={r.recruiter_id}>
                <td>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{r.name}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{r.email}</div>
                  <div style={{ fontSize: '0.8rem', color: '#4f46e5' }}>{r.designation || 'Recruiter'}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{r.company_name}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{r.industry || 'Technology'} • {r.location || 'Remote'}</div>
                </td>
                <td>
                  <span className="badge badge-secondary">{r.jobs_count || 0} Posted</span>
                </td>
                <td>
                  <span className={`badge ${r.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {r.is_active ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleToggleStatus(r.user_id)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.78rem' }}
                  >
                    {r.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageRecruiters;
