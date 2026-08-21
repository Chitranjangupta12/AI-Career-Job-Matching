import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { applicationAPI } from '../../services/api';
import { User, Mail, Phone, MapPin, BookOpen, Briefcase, Code, ChevronLeft } from 'lucide-react';
import SkillBadge from '../../components/SkillBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const CandidateDetails = () => {
  const { studentId } = useParams();
  const [candidateData, setCandidateData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const res = await applicationAPI.getCandidateDetails(studentId);
        setCandidateData(res.data.data);
      } catch (err) {
        console.error('Candidate details error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [studentId]);

  if (loading) return <LoadingSpinner fullPage text="Loading candidate dossier..." />;
  if (!candidateData) return <div className="page-wrapper">Candidate profile not found.</div>;

  const { profile, skills, education, experience, projects } = candidateData;

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/recruiter/manage-jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#4f46e5', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.75rem' }}>
          <ChevronLeft size={16} />
          <span>Back to Manage Jobs</span>
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{profile.name}</h1>
        <p style={{ color: '#64748b' }}>{profile.headline || 'Computer Science Candidate'}</p>
      </div>

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <User size={18} color="#4f46e5" />
            <span>Contact & Bio</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem', color: '#334155', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={16} color="#64748b" />
              <span>{profile.email}</span>
            </div>
            {profile.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} color="#64748b" />
                <span>{profile.phone}</span>
              </div>
            )}
            {profile.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="#64748b" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>
          {profile.bio && (
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, background: '#f8fafc', padding: '0.85rem', borderRadius: '8px' }}>
              {profile.bio}
            </p>
          )}
        </div>

        <div className="card">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Code size={18} color="#0ea5e9" />
            <span>Verified Candidate Skills ({skills.length})</span>
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {skills.map((s, idx) => (
              <SkillBadge key={idx} name={`${s.name} (${s.proficiency_level})`} type="strong" />
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <BookOpen size={18} color="#8b5cf6" />
            <span>Education</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {education.map((e) => (
              <div key={e.id} style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700 }}>{e.degree} in {e.field_of_study}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{e.institution} {e.grade ? `• Grade: ${e.grade}` : ''}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Briefcase size={18} color="#10b981" />
            <span>Experience & Projects</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {experience.map((exp) => (
              <div key={exp.id} style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700 }}>{exp.title}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{exp.company} • {exp.location}</div>
                {exp.description && <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.25rem' }}>{exp.description}</div>}
              </div>
            ))}
            {projects.map((p) => (
              <div key={p.id} style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700 }}>Project: {p.title}</div>
                <div style={{ fontSize: '0.82rem', color: '#4f46e5', fontWeight: 600 }}>{p.technologies}</div>
                {p.description && <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.25rem' }}>{p.description}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetails;
