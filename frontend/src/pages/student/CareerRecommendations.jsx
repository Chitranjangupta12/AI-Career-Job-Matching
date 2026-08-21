import React, { useState, useEffect } from 'react';
import { careerAPI } from '../../services/api';
import { Compass, Sparkles, TrendingUp, DollarSign, CheckCircle2, AlertCircle, ArrowRight, BookOpen } from 'lucide-react';
import SkillBadge from '../../components/SkillBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const CareerRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [candidateSkills, setCandidateSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await careerAPI.getRecommendations();
        setRecommendations(res.data.data.top_recommendations || []);
        setCandidateSkills(res.data.data.candidate_skills || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load career recommendations.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) return <LoadingSpinner fullPage text="Computing Top 5 Career Recommendations..." />;

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#4f46e5', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          <Compass size={16} />
          <span>AI Career Intelligence</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Top 5 Career Role Recommendations</h1>
        <p style={{ color: '#64748b' }}>
          Ranked career paths calculated based on your technical skills, experience, and academic trajectory.
        </p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Recommendations List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {recommendations.map((role, index) => (
          <div key={role.role_id || index} className="card" style={{ border: index === 0 ? '2px solid #818cf8' : '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="badge badge-primary" style={{ background: index === 0 ? '#4f46e5' : '#e2e8f0', color: index === 0 ? '#ffffff' : '#334155' }}>
                    Rank #{index + 1}
                  </span>
                  <span className="badge badge-secondary">{role.category}</span>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                  {role.title}
                </h2>
              </div>

              {/* Score Indicator */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: role.match_score >= 70 ? '#10b981' : role.match_score >= 45 ? '#f59e0b' : '#64748b' }}>
                  {role.match_score}% Match
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Suitability Score</div>
              </div>
            </div>

            {/* Metric Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem', color: '#334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <DollarSign size={16} color="#10b981" />
                <span><strong>Avg Compensation:</strong> {role.avg_salary}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <TrendingUp size={16} color="#0ea5e9" />
                <span><strong>Industry Demand:</strong> {role.growth_rate}</span>
              </div>
            </div>

            {/* Explanation */}
            <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              <strong>AI Recommendation Analysis:</strong> {role.explanation}
            </p>

            {/* Matched vs Missing Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              {/* Matched Skills */}
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#065f46', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <CheckCircle2 size={15} />
                  <span>Matching Skills You Possess ({role.matched_skills.length})</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {role.matched_skills.map((s, idx) => (
                    <SkillBadge key={idx} name={s} type="matched" />
                  ))}
                  {role.matched_skills.length === 0 && (
                    <span style={{ fontSize: '0.82rem', color: '#64748b' }}>No direct skill match yet.</span>
                  )}
                </div>
              </div>

              {/* Recommended Skills to Learn */}
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#991b1b', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <AlertCircle size={15} />
                  <span>Recommended Skills to Learn ({role.missing_skills.length})</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {role.missing_skills.map((s, idx) => (
                    <SkillBadge key={idx} name={s} type="missing" />
                  ))}
                  {role.missing_skills.length === 0 && (
                    <span style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 600 }}>You satisfy all core requirements!</span>
                  )}
                </div>
              </div>
            </div>

            {/* Learning Roadmap */}
            {role.roadmap && role.roadmap.length > 0 && (
              <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.5rem' }}>
                  <BookOpen size={16} color="#4f46e5" />
                  <span>Recommended Step-by-Step Learning Roadmap:</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {role.roadmap.map((step, sIdx) => (
                    <div key={sIdx} style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: '#4f46e5' }}>{sIdx + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerRecommendations;
