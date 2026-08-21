import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, MapPin, DollarSign, Briefcase, Sparkles, ChevronRight } from 'lucide-react';
import SkillBadge from './SkillBadge';
import ScoreBreakdownModal from './ScoreBreakdownModal';

const JobCard = ({ job, isStudent = false, onApply = null }) => {
  const [showModal, setShowModal] = useState(false);

  const getMatchPillClass = (score) => {
    if (score >= 75) return 'match-pill match-high';
    if (score >= 50) return 'match-pill match-mid';
    return 'match-pill match-low';
  };

  const skillsList = job.skills || [];

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <span className="badge badge-secondary" style={{ marginBottom: '0.5rem' }}>
            {job.job_type || 'Full-Time'}
          </span>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
            <Link to={`/jobs/${job.id}`} style={{ color: 'inherit' }}>
              {job.title}
            </Link>
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            <Building size={15} />
            <span>{job.company_name}</span>
          </div>
        </div>

        {/* AI Match Pill */}
        {job.match_score !== undefined && job.match_score !== null && (
          <div style={{ textAlign: 'right' }}>
            <div className={getMatchPillClass(job.match_score)}>
              <Sparkles size={14} />
              <span>{job.match_score}% Match</span>
            </div>
          </div>
        )}
      </div>

      {/* Meta Info */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: '#64748b', margin: '0.75rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <MapPin size={14} />
          <span>{job.location}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <DollarSign size={14} />
          <span>{job.salary_range || 'Competitive'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Briefcase size={14} />
          <span>{job.experience_level || 'Mid-Level'} ({job.min_exp_years} yrs exp)</span>
        </div>
      </div>

      {/* Description Snippet */}
      <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {job.description}
      </p>

      {/* Skills Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
        {skillsList.slice(0, 5).map((s, idx) => (
          <SkillBadge key={idx} name={typeof s === 'string' ? s : s.name} />
        ))}
        {skillsList.length > 5 && (
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', alignSelf: 'center', fontWeight: 600 }}>
            +{skillsList.length - 5} more
          </span>
        )}
      </div>

      {/* Card Action Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: 'auto' }}>
        <Link to={`/jobs/${job.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
          <span>View Details</span>
          <ChevronRight size={14} />
        </Link>

        {job.match_score !== undefined && job.match_score !== null && (
          <button onClick={() => setShowModal(true)} className="btn btn-outline btn-sm" title="View Match Breakdown">
            <Sparkles size={14} />
            <span>Score Breakdown</span>
          </button>
        )}
      </div>

      {/* Explainability Breakdown Modal */}
      <ScoreBreakdownModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        jobTitle={job.title}
        matchScore={job.match_score}
        breakdown={job.breakdown || job.match_breakdown}
        matchedSkills={job.matched_skills || []}
        missingSkills={job.missing_skills || []}
        explanation={job.explanation}
      />
    </div>
  );
};

export default JobCard;
