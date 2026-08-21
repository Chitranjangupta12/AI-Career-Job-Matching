import React, { useState, useEffect } from 'react';
import { jobAPI } from '../../services/api';
import { Sparkles, Filter, Search, CheckCircle } from 'lucide-react';
import JobCard from '../../components/JobCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const JobRecommendations = () => {
  const [jobs, setJobs] = useState([]);
  const [studentSkills, setStudentSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minMatchFilter, setMinMatchFilter] = useState(0);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await jobAPI.getRecommendations();
        setJobs(res.data.data.recommendations || []);
        setStudentSkills(res.data.data.student_skills || []);
      } catch (err) {
        console.error('Job recommendations fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) return <LoadingSpinner fullPage text="Calculating multi-factor job match percentages..." />;

  const filteredJobs = jobs.filter((j) => (j.match_score || 0) >= minMatchFilter);

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#4f46e5', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            <Sparkles size={16} />
            <span>Explainable 60/20/10/10 Algorithm</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Personalized Job Recommendations</h1>
          <p style={{ color: '#64748b' }}>
            Active job openings ranked specifically for your candidate profile.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Filter size={18} color="#64748b" />
          <select
            className="form-select"
            style={{ width: '200px' }}
            value={minMatchFilter}
            onChange={(e) => setMinMatchFilter(Number(e.target.value))}
          >
            <option value={0}>All Match Scores</option>
            <option value={50}>Match ≥ 50%</option>
            <option value={70}>Match ≥ 70% (High Match)</option>
            <option value={85}>Match ≥ 85% (Top Fit)</option>
          </select>
        </div>
      </div>

      {/* Grid of Recommended Jobs */}
      <div className="grid-3">
        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} isStudent={true} />
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
          <h3>No jobs found matching the {minMatchFilter}% threshold</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Try lowering the filter or updating your skills in profile.</p>
        </div>
      )}
    </div>
  );
};

export default JobRecommendations;
