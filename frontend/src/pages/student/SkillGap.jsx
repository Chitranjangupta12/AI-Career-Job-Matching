import React, { useState, useEffect } from 'react';
import { careerAPI } from '../../services/api';
import { TrendingUp, Sparkles, CheckCircle2, AlertCircle, BookOpen, Target, ArrowRight } from 'lucide-react';
import SkillBadge from '../../components/SkillBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const SkillGap = () => {
  const [careerRoles, setCareerRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer');
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const rolesRes = await careerAPI.getCareerRoles();
        const roles = rolesRes.data.data.roles || [];
        setCareerRoles(roles);

        // Initial analysis with first role
        const defaultTitle = roles.length > 0 ? roles[0].title : 'Full Stack Developer';
        setSelectedRole(defaultTitle);
        runAnalysis(defaultTitle);
      } catch (err) {
        console.error('Skill gap init error:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const runAnalysis = async (roleTitle) => {
    setAnalyzing(true);
    try {
      const res = await careerAPI.getSkillGap({ target_role_or_job_title: roleTitle });
      setGapAnalysis(res.data.data.gap_analysis);
    } catch (err) {
      console.error('Gap analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);
    runAnalysis(newRole);
  };

  if (loading) return <LoadingSpinner fullPage text="Initializing Skill-Gap Engine..." />;

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          <TrendingUp size={16} />
          <span>Competency & Readiness Analysis</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Interactive Skill-Gap Analyzer</h1>
        <p style={{ color: '#64748b' }}>
          Categorize your competencies into Strong, Moderate, and Missing skills against any targeted career trajectory.
        </p>
      </div>

      {/* Target Selector Card */}
      <div className="card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <label className="form-label" style={{ marginBottom: '0.25rem' }}>Select Target Career Path:</label>
          <select
            className="form-select"
            style={{ width: '300px', fontWeight: 600 }}
            value={selectedRole}
            onChange={handleRoleChange}
          >
            {careerRoles.map((r) => (
              <option key={r.id} value={r.title}>{r.title}</option>
            ))}
          </select>
        </div>

        {gapAnalysis && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Overall Readiness Score</div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: gapAnalysis.overall_readiness >= 75 ? '#10b981' : gapAnalysis.overall_readiness >= 50 ? '#f59e0b' : '#ef4444' }}>
              {gapAnalysis.overall_readiness}%
            </div>
          </div>
        )}
      </div>

      {analyzing ? (
        <LoadingSpinner fullPage text={`Analyzing skill gap for ${selectedRole}...`} />
      ) : gapAnalysis ? (
        <div>
          {/* 3 Categories: Strong, Moderate, Missing */}
          <div className="grid-3" style={{ marginBottom: '2rem' }}>
            {/* 1. Strong Skills */}
            <div className="card" style={{ borderTop: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                <CheckCircle2 size={20} color="#10b981" />
                <span>Strong Competencies ({gapAnalysis.strong_skills?.length || 0})</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                Skills already possessed and aligned with the role.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {gapAnalysis.strong_skills?.map((s, idx) => (
                  <SkillBadge key={idx} name={s} type="strong" />
                ))}
                {(!gapAnalysis.strong_skills || gapAnalysis.strong_skills.length === 0) && (
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>None yet identified</span>
                )}
              </div>
            </div>

            {/* 2. Moderate Skills */}
            <div className="card" style={{ borderTop: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400e', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                <Sparkles size={20} color="#f59e0b" />
                <span>Moderate / Adjacent ({gapAnalysis.moderate_skills?.length || 0})</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                Complementary tools in the same technical domain.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {gapAnalysis.moderate_skills?.map((s, idx) => (
                  <SkillBadge key={idx} name={s} type="moderate" />
                ))}
                {(!gapAnalysis.moderate_skills || gapAnalysis.moderate_skills.length === 0) && (
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>None identified</span>
                )}
              </div>
            </div>

            {/* 3. Missing Skills */}
            <div className="card" style={{ borderTop: '4px solid #ef4444' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991b1b', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                <AlertCircle size={20} color="#ef4444" />
                <span>Priority Missing Skills ({gapAnalysis.missing_skills?.length || 0})</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                Critical core skills needed to succeed in this role.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {gapAnalysis.missing_skills?.map((s, idx) => (
                  <SkillBadge key={idx} name={s} type="missing" />
                ))}
                {(!gapAnalysis.missing_skills || gapAnalysis.missing_skills.length === 0) && (
                  <span style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 600 }}>All core competencies mastered!</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Plan Roadmap */}
          <div className="card">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <BookOpen size={20} color="#4f46e5" />
              <span>Recommended Learning Action Plan for {selectedRole}</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {gapAnalysis.action_plan?.map((step, idx) => (
                <div key={idx} style={{ padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>
                    {idx + 1}
                  </div>
                  <span style={{ fontSize: '0.92rem', color: '#334155' }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SkillGap;
