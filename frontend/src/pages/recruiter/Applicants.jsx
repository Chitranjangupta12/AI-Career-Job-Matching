import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { applicationAPI } from '../../services/api';
import { Users, Sparkles, Eye, ChevronLeft } from 'lucide-react';
import ScoreBreakdownModal from '../../components/ScoreBreakdownModal';
import LoadingSpinner from '../../components/LoadingSpinner';

const Applicants = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const fetchApplicants = async () => {
    try {
      const res = await applicationAPI.getJobApplicants(jobId);
      setJob(res.data.data.job);
      setApplicants(res.data.data.applicants || []);
    } catch (err) {
      console.error('Error fetching applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await applicationAPI.updateStatus(applicationId, newStatus);
      fetchApplicants();
    } catch (err) {
      alert('Failed to update application status.');
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading candidate applications and match scores..." />;

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/recruiter/manage-jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#4f46e5', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.75rem' }}>
          <ChevronLeft size={16} />
          <span>Back to Manage Jobs</span>
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
          Applicants for: {job?.title}
        </h1>
        <p style={{ color: '#64748b' }}>
          Candidate profiles ranked by transparent 60/20/10/10 AI match percentages.
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Experience & Education</th>
              <th>AI Match Score</th>
              <th>Status</th>
              <th>Date Applied</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((app) => (
              <tr key={app.id}>
                <td>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.candidate_name}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{app.candidate_email}</div>
                  <div style={{ fontSize: '0.8rem', color: '#4f46e5', marginTop: '0.2rem' }}>{app.headline}</div>
                </td>
                <td>
                  <div>{app.experience_years} yrs experience</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{app.education_level || "Bachelor's"} in {app.major || 'CS'}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-primary" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      <Sparkles size={13} />
                      <span>{app.match_score}%</span>
                    </span>
                    <button
                      onClick={() => setSelectedApplicant(app)}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    >
                      Breakdown
                    </button>
                  </div>
                </td>
                <td>
                  <select
                    className="form-select"
                    style={{ fontSize: '0.85rem', padding: '0.35rem 0.65rem', width: '140px' }}
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                  >
                    <option value="Applied">Applied</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
                <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  {new Date(app.applied_at).toLocaleDateString()}
                </td>
                <td>
                  <Link to={`/recruiter/candidate/${app.student_id}`} className="btn btn-secondary btn-sm">
                    <Eye size={14} />
                    <span>View Profile</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {applicants.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
            <h3>No candidates have applied for this position yet</h3>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Candidates will appear here as soon as they submit applications.</p>
          </div>
        )}
      </div>

      {selectedApplicant && (
        <ScoreBreakdownModal
          isOpen={!!selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
          jobTitle={`${selectedApplicant.candidate_name} vs ${job?.title}`}
          matchScore={selectedApplicant.match_score}
          breakdown={selectedApplicant.match_details?.breakdown}
          matchedSkills={selectedApplicant.match_details?.matched_skills || []}
          missingSkills={selectedApplicant.match_details?.missing_skills || []}
          explanation={selectedApplicant.match_details?.explanation}
        />
      )}
    </div>
  );
};

export default Applicants;
