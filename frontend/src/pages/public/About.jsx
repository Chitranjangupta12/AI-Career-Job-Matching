import React from 'react';
import { Compass, Server, Cpu, Database, CheckCircle, ShieldCheck } from 'lucide-react';

const About = () => {
  return (
    <div className="page-wrapper" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>System Architecture</span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>
            About CareerAI System
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '0.5rem' }}>
            Major Project: AI-Powered Personalized Career Guidance & Intelligent Job Matching System
          </p>
        </div>

        {/* System Overview Card */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
            Project Overview & Objectives
          </h2>
          <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '1rem' }}>
            Traditional job portals rely on rudimentary keyword searches that lead to high mismatch rates and career disorientation for university graduates.
            This project provides an end-to-end intelligent platform that bridges student skill profiles with market demand through natural language processing, taxonomy normalization, and explainable multi-factor scoring.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '3px' }} />
              <span style={{ fontSize: '0.92rem', color: '#334155' }}>
                <strong>Automated Resume Parsing:</strong> Ingests PDF documents and extracts technical skills, soft skills, education, and experience.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '3px' }} />
              <span style={{ fontSize: '0.92rem', color: '#334155' }}>
                <strong>Skill Normalization:</strong> Maps hundreds of technology aliases to unified canonical taxonomies.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '3px' }} />
              <span style={{ fontSize: '0.92rem', color: '#334155' }}>
                <strong>Career Roadmapping:</strong> Recommends top 5 career paths with salary projections and targeted roadmaps.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '3px' }} />
              <span style={{ fontSize: '0.92rem', color: '#334155' }}>
                <strong>Transparent Scoring:</strong> Explainable 60/20/10/10 job match scoring with detailed breakdown.
              </span>
            </div>
          </div>
        </div>

        {/* Tech Stack Breakdown */}
        <div className="card">
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem', color: '#0f172a' }}>
            Technology Stack & Microservices
          </h2>

          <div className="grid-2">
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4f46e5', fontWeight: 700, marginBottom: '0.5rem' }}>
                <Server size={18} />
                <span>Backend & Database</span>
              </div>
              <ul style={{ paddingLeft: '1.25rem', color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
                <li>Node.js & Express.js REST API</li>
                <li>PostgreSQL 18 Relational Database</li>
                <li>JWT Authentication & Bcrypt Hashing</li>
                <li>Multer PDF File Upload Pipeline</li>
              </ul>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0ea5e9', fontWeight: 700, marginBottom: '0.5rem' }}>
                <Cpu size={18} />
                <span>AI & NLP Engine</span>
              </div>
              <ul style={{ paddingLeft: '1.25rem', color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
                <li>Python 3.12 & FastAPI Microservice</li>
                <li>PyPDF Text Extraction Pipeline</li>
                <li>Taxonomy Normalization & Regex Entity Extraction</li>
                <li>Explainable 60/20/10/10 Scoring Engine</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
