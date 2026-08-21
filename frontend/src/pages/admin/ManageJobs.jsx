import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Briefcase, Trash2 } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await adminAPI.getJobs();
      setJobs(res.data.data.jobs || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this job listing?')) return;
    try {
      await adminAPI.deleteJob(id);
      fetchJobs();
    } catch (err) {
      alert('Failed to delete job.');
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading system job postings..." />;

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Manage All Jobs ({jobs.length})</h1>
        <p style={{ color: '#64748b' }}>Oversee and moderate job postings across the entire platform.</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Job Title & Company</th>
              <th>Recruiter Account</th>
              <th>Location & Type</th>
              <th>Applicants</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{j.title}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{j.company_name}</div>
                </td>
                <td>
                  <div style={{ fontSize: '0.9rem' }}>{j.recruiter_name}</div>
                </td>
                <td>
                  <div>{j.location}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{j.job_type}</div>
                </td>
                <td>
                  <span className="badge badge-secondary">{j.applicant_count || 0} Candidates</span>
                </td>
                <td>
                  <span className={`badge ${j.status === 'Active' ? 'badge-success' : 'badge-secondary'}`}>
                    {j.status}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleDeleteJob(j.id)} className="btn btn-outline btn-sm" style={{ color: '#ef4444', borderColor: '#fca5a5' }} title="Delete Job">
                    <Trash2 size={14} />
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

export default ManageJobs;
