import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, FileText, Briefcase, TrendingUp, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const { isAuthenticated, isStudent, isRecruiter, isAdmin } = useAuth();

  const getStartedLink = () => {
    if (isStudent) return '/student/dashboard';
    if (isRecruiter) return '/recruiter/dashboard';
    if (isAdmin) return '/admin/dashboard';
    return '/register';
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', color: 'white', padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(129, 140, 248, 0.3)', padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', color: '#c7d2fe', marginBottom: '1.5rem' }}>
            <Sparkles size={15} />
            <span>Powered by Advanced NLP & Explainable AI Scoring</span>
          </div>

          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
            Personalized Career Guidance & <br />
            <span style={{ background: 'linear-gradient(135deg, #818cf8 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Intelligent Job Matching
            </span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#94a3b8', maxWidth: '750px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            Upload your resume, extract technical and soft skills using NLP, explore top-ranked career recommendations, and match with jobs using our transparent 60/20/10/10 scoring engine.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to={getStartedLink()} className="btn btn-primary btn-lg">
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Explore Platform Now'}</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/about" className="btn btn-secondary btn-lg" style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              How Matching Works
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Pillars / Feature Highlights */}
      <section className="page-wrapper" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
            Everything You Need for Career Success
          </h2>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
            An integrated platform connecting Students, Recruiters, and Administrators.
          </p>
        </div>

        <div className="grid-3">
          {/* Card 1 */}
          <div className="card card-hover">
            <div style={{ width: 48, height: 48, borderRadius: 10, background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <FileText size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              NLP Resume Extraction
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5 }}>
              Upload your PDF resume to automatically extract technical skills, soft skills, education, certifications, and experience with zero manual data entry.
            </p>
          </div>

          {/* Card 2 */}
          <div className="card card-hover">
            <div style={{ width: 48, height: 48, borderRadius: 10, background: '#eff6ff', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Compass size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Career Guidance & Pathways
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5 }}>
              Discover Top 5 ranked career roles tailored to your skill set, complete with salary outlooks, growth metrics, and step-by-step learning roadmaps.
            </p>
          </div>

          {/* Card 3 */}
          <div className="card card-hover">
            <div style={{ width: 48, height: 48, borderRadius: 10, background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Sparkles size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Explainable Job Matching
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5 }}>
              Transparent job matching evaluating 60% Skills, 20% Experience, 10% Education, and 10% Projects with matched/missing skill itemization.
            </p>
          </div>
        </div>
      </section>

      {/* Explainable Weighting Banner */}
      <section style={{ background: '#f1f5f9', padding: '4rem 1.5rem', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
            Transparent AI Scoring Architecture
          </h2>
          <p style={{ color: '#64748b', marginBottom: '2.5rem' }}>
            We eliminate "black box" algorithms. Every match score is calculated with explicit mathematical weights:
          </p>

          <div className="grid-4" style={{ textAlign: 'left' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4f46e5' }}>60%</div>
              <div style={{ fontWeight: 700, marginTop: '0.25rem' }}>Skill Match</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem' }}>Required & preferred canonical skill comparison</div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0ea5e9' }}>20%</div>
              <div style={{ fontWeight: 700, marginTop: '0.25rem' }}>Experience</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem' }}>Years of work history vs minimum threshold</div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8b5cf6' }}>10%</div>
              <div style={{ fontWeight: 700, marginTop: '0.25rem' }}>Education</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem' }}>Degree level and major alignment</div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>10%</div>
              <div style={{ fontWeight: 700, marginTop: '0.25rem' }}>Projects</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem' }}>Project portfolio domain & keyword relevance</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
