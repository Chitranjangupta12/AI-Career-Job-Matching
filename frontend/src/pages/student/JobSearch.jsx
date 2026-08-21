import React, { useState, useEffect } from 'react';
import { jobAPI } from '../../services/api';
import { Search, MapPin, Briefcase, Filter } from 'lucide-react';
import JobCard from '../../components/JobCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const JobSearch = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [expLevel, setExpLevel] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await jobAPI.getJobs({
        search: search || undefined,
        location: location || undefined,
        job_type: jobType || undefined,
        experience_level: expLevel || undefined,
      });
      setJobs(res.data.data.jobs || []);
    } catch (err) {
      console.error('Job search fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Explore Opportunities</h1>
        <p style={{ color: '#64748b' }}>Search and discover positions matching your engineering skills and career focus.</p>
      </div>

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Job title, skills, or company..."
            />
          </div>

          <div style={{ position: 'relative' }}>
            <MapPin size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State or Remote..."
            />
          </div>

          <select className="form-select" value={jobType} onChange={(e) => setJobType(e.target.value)}>
            <option value="">All Job Types</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
            <option value="Remote">Remote</option>
          </select>

          <select className="form-select" value={expLevel} onChange={(e) => setExpLevel(e.target.value)}>
            <option value="">All Experience</option>
            <option value="Entry-Level">Entry-Level</option>
            <option value="Junior">Junior</option>
            <option value="Mid-Level">Mid-Level</option>
            <option value="Senior">Senior</option>
          </select>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <LoadingSpinner fullPage text="Loading job listings..." />
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
            <span>Found <strong>{jobs.length}</strong> active job postings</span>
          </div>

          <div className="grid-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} isStudent={true} />
            ))}
          </div>

          {jobs.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
              <h3>No jobs matched your search criteria</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Try clearing filters or searching for general keywords like "React" or "Python".</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JobSearch;
