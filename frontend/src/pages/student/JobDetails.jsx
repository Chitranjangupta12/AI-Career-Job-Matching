import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jobAPI, applicationAPI, resumeAPI } from '../../services/api';
import { Building, MapPin, DollarSign, Briefcase, BookOpen, CheckCircle, AlertCircle, Sparkles, Send } from 'lucide-react';
import SkillBadge from '../../components/SkillBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [matchAnalysis, setMatchAnalysis] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const [jobRes, resumeRes] = await Promise.allSettled([
          jobAPI.getJobById(id),
          resumeAPI.getMyResumes(),
        ]);

        if (jobRes.status === 'fulfilled') {
          const data = jobRes.value.data.data;
          setJob(data.job);
          setMatchAnalysis(data.matchAnalysis);
          setHasApplied(data.hasApplied);
        }

        if (resumeRes.status === 'fulfilled') {
          const rList = resumeRes.value.data.data.resumes || [];
          setResumes(rList);
          if (rList.length > 0) setSelectedResume(rList[0].id);
        }
      } catch (err) {
        console.error('Job details loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ type: '', text: '' });

    try {
      await applicationAPI.apply({
        job_id: parseInt(id),
        resume_id: selectedResume ? parseInt(selectedResume) : null,
        cover_letter: coverLetter,
      });

      setHasApplied(true);
      setMsg({ type: 'success', text: 'Application submitted successfully! Track status in your Applications dashboard.' });
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to submit application.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading job specifications..." />;
  if (!job) return <div className="page-wrapper">Job posting not found.</div>;

  const requiredSkills = (job.skills || []).filter((s) => s.is_required);
  const preferredSkills = (job.skills || []).filter((s) => !s.is_required);

  return (
    <div className="page-wrapper">
      <div className="grid-2" style={{ alignItems: 'start', gridTemplateColumns: '2fr 1fr' }}>
        {/* Left Column: Job Description & Details */}
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
                  {job.job_type} • {job.experience_level}
                </span>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{job.title}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '1rem', marginTop: '0.35rem' }}>
                  <Building size={18} />
                  <span>{job.company_name}</span>
                </div>
              </div>
            </div>

            {/* Quick Meta Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} color="#4f46e5" />
                <span>{job.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <DollarSign size={16} color="#10b981" />
                <span>{job.salary_range || 'Competitive'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Briefcase size={16} color="#0ea5e9" />
                <span>Min {job.min_exp_years} yrs exp</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BookOpen size={16} color="#8b5cf6" />
                <span>{job.education_required || "Bachelor's Degree"}</span>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.65rem' }}>
                About the Role
              </h2>
              <p style={{ color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{job.description}</p>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && (
              <div style={{ marginBottom: '1.75rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.65rem' }}>
                  Key Responsibilities
                </h2>
                <p style={{ color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{job.responsibilities}</p>
              </div>
            )}

            {/* Skills Requirements */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.65rem' }}>
                Required Technical Skills ({requiredSkills.length})
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                {requiredSkills.map((s, idx) => (
                  <SkillBadge key={idx} name={s.name} type="strong" />
                ))}
              </div>

              {preferredSkills.length > 0 && (
                <>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                    Preferred Additional Skills ({preferredSkills.length})
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {preferredSkills.map((s, idx) => (
                      <SkillBadge key={idx} name={s.name} type="default" />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Benefits */}
            {job.benefits && (
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.65rem' }}>
                  Benefits & Perks
                </h2>
                <p style={{ color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{job.benefits}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Match Scorecard & Application Action */}
        <div>
          {/* AI Match Scorecard */}
          {matchAnalysis && (
            <div className="card" style={{ marginBottom: '1.5rem', border: '2px solid #818cf8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4f46e5', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                <Sparkles size={16} />
                <span>AI Candidate Match Engine</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.1rem' }}>Match Suitability</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: matchAnalysis.match_percentage >= 70 ? '#10b981' : '#f59e0b' }}>
                  {matchAnalysis.match_percentage}%
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem' }}>
                {matchAnalysis.explanation}
              </div>

              {/* Matched Skills List */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#065f46', marginBottom: '0.35rem' }}>
                  Matched Skills ({matchAnalysis.matched_skills?.length || 0}):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {matchAnalysis.matched_skills?.map((s, idx) => (
                    <SkillBadge key={idx} name={s} type="matched" />
                  ))}
                </div>
              </div>

              {/* Missing Skills List */}
              {matchAnalysis.missing_skills && matchAnalysis.missing_skills.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.35rem' }}>
                    Missing Required Skills ({matchAnalysis.missing_skills.length}):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {matchAnalysis.missing_skills.map((s, idx) => (
                      <SkillBadge key={idx} name={s} type="missing" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Application Form */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>Apply for Position</h2>

            {msg.text && (
              <div style={{ padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem', background: msg.type === 'success' ? '#ecfdf5' : '#fef2f2', color: msg.type === 'success' ? '#065f46' : '#991b1b' }}>
                {msg.text}
              </div>
            )}

            {hasApplied ? (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1.25rem', borderRadius: '8px', textAlign: 'center' }}>
                <CheckCircle size={32} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 700, color: '#065f46' }}>Application Submitted</div>
                <div style={{ fontSize: '0.85rem', color: '#047857', marginTop: '0.25rem' }}>
                  Status: <strong>{job.application?.status || 'Applied'}</strong>
                </div>
                <Link to="/student/applications" className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>
                  View in Applications
                </Link>
              </div>
            ) : (
              <form onSubmit={handleApply}>
                <div className="form-group">
                  <label className="form-label">Select Resume Document</label>
                  <select
                    className="form-select"
                    value={selectedResume}
                    onChange={(e) => setSelectedResume(e.target.value)}
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.file_name} ({new Date(r.uploaded_at).toLocaleDateString()})
                      </option>
                    ))}
                    {resumes.length === 0 && <option value="">No resumes uploaded - will use profile</option>}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Cover Letter / Note to Recruiter</label>
                  <textarea
                    className="form-textarea"
                    style={{ minHeight: '90px' }}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Describe your qualifications and interest in this role..."
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem' }}
                  disabled={submitting}
                >
                  {submitting ? <LoadingSpinner text="Submitting..." /> : (
                    <>
                      <Send size={16} />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
