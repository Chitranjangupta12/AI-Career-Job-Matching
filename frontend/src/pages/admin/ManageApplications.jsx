import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Layers } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await adminAPI.getApplications();
        setApplications(res.data.data.applications || []);
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) return <LoadingSpinner fullPage text="Loading system application records..." />;

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>System Applications ({applications.length})</h1>
        <p style={{ color: '#64748b' }}>Review all submitted candidate applications and matching scores.</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Candidate Name</th>
              <th>Target Job & Company</th>
              <th>Recruiter</th>
              <th>AI Match Score</th>
              <th>Application Status</th>
              <th>Date Applied</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((a) => (
              <tr key={a.id}>
                <td>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{a.candidate_name}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{a.candidate_email}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{a.job_title}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{a.company_name}</div>
                </td>
                <td>{a.recruiter_name}</td>
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
      </div>
    </div>
  );
};

export default ManageApplications;
