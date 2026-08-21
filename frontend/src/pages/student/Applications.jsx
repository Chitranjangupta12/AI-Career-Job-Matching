import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationAPI } from '../../services/api';
import { Layers, Building, Calendar, Sparkles, Clock, CheckCircle, XCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await applicationAPI.getMyApplications();
        setApplications(res.data.data.applications || []);
      } catch (err) {
        console.error('Applications loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selected':
        return <span className="badge badge-success" style={{ background: '#dcfce7', color: '#15803d' }}>Selected / Hired</span>;
      case 'Shortlisted':
        return <span className="badge badge-success">Shortlisted</span>;
      case 'Under Review':
        return <span className="badge badge-warning">Under Review</span>;
      case 'Rejected':
        return <span className="badge badge-danger">Not Selected</span>;
      default:
        return <span className="badge badge-primary">Applied</span>;
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading application history..." />;

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Application Pipeline</h1>
        <p style={{ color: '#64748b' }}>Track the status of all submitted job applications in real-time.</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Job & Company</th>
              <th>Location & Type</th>
              <th>AI Match Score</th>
              <th>Status</th>
              <th>Date Applied</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.job_title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{app.company_name}</div>
                </td>
                <td>
                  <div>{app.job_location}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.job_type}</div>
                </td>
                <td>
                  <span className="badge badge-primary" style={{ fontWeight: 700 }}>
                    {app.match_score}% Match
                  </span>
                </td>
                <td>{getStatusBadge(app.status)}</td>
                <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  {new Date(app.applied_at).toLocaleDateString()}
                </td>
                <td>
                  <Link to={`/jobs/${app.job_id}`} className="btn btn-secondary btn-sm">
                    View Job
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {applications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
            <h3>No applications submitted yet</h3>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Explore recommended positions to submit your first application.</p>
            <Link to="/student/job-recommendations" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
              Explore Matching Jobs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;
