import React from 'react';
import { X, CheckCircle, AlertTriangle, Info, Award, Brain } from 'lucide-react';
import SkillBadge from './SkillBadge';

const ScoreBreakdownModal = ({ isOpen, onClose, jobTitle, matchScore, breakdown, matchedSkills = [], missingSkills = [], explanation }) => {
  if (!isOpen) return null;

  const getScoreColor = (score) => {
    if (score >= 75) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const skillScore = breakdown?.skill_score ?? 0;
  const expScore = breakdown?.experience_score ?? 0;
  const eduScore = breakdown?.education_score ?? 0;
  const projScore = breakdown?.project_score ?? 0;
  const totalScore = matchScore ?? (skillScore + expScore + eduScore + projScore);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4f46e5', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <Brain size={16} />
              <span>AI Job Match Explainability Engine</span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
              {jobTitle}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} color="#64748b" />
          </button>
        </div>

        {/* Overall Match Score Banner */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>Overall Match Percentage</div>
            <div style={{ fontSize: '0.85rem', color: '#0f172a', marginTop: '0.2rem' }}>
              Formula: 60% Skills + 20% Experience + 10% Education + 10% Projects
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: getScoreColor(totalScore) }}>
            {totalScore}%
          </div>
        </div>

        {/* 4-Component Score Progress Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Skill Score (60%) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              <span style={{ color: '#334155' }}>Technical & Core Skills Match (Max: 60%)</span>
              <span style={{ color: '#4f46e5', fontWeight: 700 }}>{skillScore} / 60 pts</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${(skillScore / 60) * 100}%`, height: '100%', background: '#4f46e5', borderRadius: '4px' }} />
            </div>
          </div>

          {/* Experience Score (20%) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              <span style={{ color: '#334155' }}>Experience Requirements (Max: 20%)</span>
              <span style={{ color: '#0ea5e9', fontWeight: 700 }}>{expScore} / 20 pts</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${(expScore / 20) * 100}%`, height: '100%', background: '#0ea5e9', borderRadius: '4px' }} />
            </div>
          </div>

          {/* Education Score (10%) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              <span style={{ color: '#334155' }}>Degree & Education Alignment (Max: 10%)</span>
              <span style={{ color: '#8b5cf6', fontWeight: 700 }}>{eduScore} / 10 pts</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${(eduScore / 10) * 100}%`, height: '100%', background: '#8b5cf6', borderRadius: '4px' }} />
            </div>
          </div>

          {/* Project Relevance (10%) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              <span style={{ color: '#334155' }}>Project Domain Relevance (Max: 10%)</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>{projScore} / 10 pts</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${(projScore / 10) * 100}%`, height: '100%', background: '#10b981', borderRadius: '4px' }} />
            </div>
          </div>
        </div>

        {/* Explainable Text Summary */}
        {explanation && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <Info size={20} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.88rem', color: '#1e40af', lineHeight: 1.5 }}>
              <strong>AI Score Explanation:</strong> {explanation}
            </div>
          </div>
        )}

        {/* Matched vs Missing Skills */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Matched */}
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#065f46', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.65rem' }}>
              <CheckCircle size={16} />
              <span>Matched Skills ({matchedSkills.length})</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {matchedSkills.length > 0 ? (
                matchedSkills.map((s, idx) => <SkillBadge key={idx} name={s} type="matched" />)
              ) : (
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>No skills matched directly.</span>
              )}
            </div>
          </div>

          {/* Missing */}
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#991b1b', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.65rem' }}>
              <AlertTriangle size={16} />
              <span>Missing Required Skills ({missingSkills.length})</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {missingSkills.length > 0 ? (
                missingSkills.map((s, idx) => <SkillBadge key={idx} name={s} type="missing" />)
              ) : (
                <span style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 600 }}>All required skills matched!</span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreBreakdownModal;
