import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import { Briefcase, Users, PlusCircle, Trash2, Eye } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await jobAPI.getRecruiterJobs();
      setJobs(res.data.data.jobs || []);
    } catch (err) {
      console.error('Manage jobs loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing?')) return;
    try {
      await jobAPI.deleteJob(jobId);
      fetchJobs();
    } catch (err) {
      alert('Failed to delete job.');
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading your posted jobs..." />;

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Manage Posted Jobs</h1>
          <p style={{ color: '#64748b' }}>View application volumes and evaluate candidates for your listings.</p>
        </div>
        <Link to="/recruiter/create-job" className="btn btn-primary">
          <PlusCircle size={16} />
          <span>Post New Job</span>
        </Link>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Location & Type</th>
              <th>Experience Req</th>
              <th>Applicants</th>
              <th>Status</th>
              <th>Date Posted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{job.title}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{job.salary_range || 'Competitive'}</div>
                </td>
                <td>
                  <div>{job.location}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{job.job_type}</div>
                </td>
                <td>{job.min_exp_years} yrs</td>
                <td>
                  <Link to={`/recruiter/jobs/${job.id}/applicants`} className="badge badge-primary" style={{ fontWeight: 700, textDecoration: 'none' }}>
                    <Users size={13} />
                    <span>{job.applicant_count || 0} Candidates</span>
                  </Link>
                </td>
                <td>
                  <span className={`badge ${job.status === 'Active' ? 'badge-success' : 'badge-secondary'}`}>
                    {job.status}
                  </span>
                </td>
                <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  {new Date(job.created_at).toLocaleDateString()}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <Link to={`/recruiter/jobs/${job.id}/applicants`} className="btn btn-secondary btn-sm" title="View Applicants">
                      <Users size={14} />
                    </Link>
                    <button onClick={() => handleDeleteJob(job.id)} className="btn btn-outline btn-sm" style={{ color: '#ef4444', borderColor: '#fca5a5' }} title="Delete Job">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {jobs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
            <h3>No jobs posted yet</h3>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Create your first job listing to start receiving AI-matched applications.</p>
            <Link to="/recruiter/create-job" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
              Post Job Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageJobs;
