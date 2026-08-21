import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import { PlusCircle, AlertCircle, Plus } from 'lucide-react';
import SkillBadge from '../../components/SkillBadge';

const CreateJob = () => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Remote');
  const [jobType, setJobType] = useState('Full-Time');
  const [expLevel, setExpLevel] = useState('Mid-Level');
  const [minExp, setMinExp] = useState(1.0);
  const [educationReq, setEducationReq] = useState("Bachelor's in Computer Science");
  const [salary, setSalary] = useState('$90,000 - $120,000');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [benefits, setBenefits] = useState('');

  const [reqSkills, setReqSkills] = useState(['JavaScript', 'React', 'Node.js']);
  const [prefSkills, setPrefSkills] = useState(['Docker', 'PostgreSQL']);
  const [newReqSkill, setNewReqSkill] = useState('');
  const [newPrefSkill, setNewPrefSkill] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAddReqSkill = (e) => {
    e.preventDefault();
    if (newReqSkill.trim() && !reqSkills.includes(newReqSkill.trim())) {
      setReqSkills([...reqSkills, newReqSkill.trim()]);
      setNewReqSkill('');
    }
  };

  const handleAddPrefSkill = (e) => {
    e.preventDefault();
    if (newPrefSkill.trim() && !prefSkills.includes(newPrefSkill.trim())) {
      setPrefSkills([...prefSkills, newPrefSkill.trim()]);
      setNewPrefSkill('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !location) {
      setError('Please provide title, description, and location.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await jobAPI.createJob({
        title,
        location,
        job_type: jobType,
        experience_level: expLevel,
        min_exp_years: parseFloat(minExp),
        education_required: educationReq,
        salary_range: salary,
        description,
        responsibilities,
        benefits,
        required_skills: reqSkills,
        preferred_skills: prefSkills,
      });

      navigate('/recruiter/manage-jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Post a New Job Opportunity</h1>
        <p style={{ color: '#64748b' }}>Define role specifications, required technical competencies, and experience parameters.</p>
      </div>

      {error && (
        <div style={{ padding: '0.85rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Job Title *</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Full Stack Engineer"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Location *</label>
            <input
              type="text"
              className="form-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Remote / New York, NY"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Employment Type</label>
            <select className="form-select" value={jobType} onChange={(e) => setJobType(e.target.value)}>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Experience Level</label>
            <select className="form-select" value={expLevel} onChange={(e) => setExpLevel(e.target.value)}>
              <option value="Entry-Level">Entry-Level</option>
              <option value="Junior">Junior</option>
              <option value="Mid-Level">Mid-Level</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Minimum Experience (Years)</label>
            <input
              type="number"
              step="0.5"
              className="form-input"
              value={minExp}
              onChange={(e) => setMinExp(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Salary Range</label>
            <input
              type="text"
              className="form-input"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="e.g. $90,000 - $120,000"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Education Requirement</label>
          <input
            type="text"
            className="form-input"
            value={educationReq}
            onChange={(e) => setEducationReq(e.target.value)}
            placeholder="e.g. Bachelor's in Computer Science or related degree"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Required Technical Skills (Used in 60% Match Weight)</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <input
              type="text"
              className="form-input"
              style={{ maxWidth: '300px' }}
              value={newReqSkill}
              onChange={(e) => setNewReqSkill(e.target.value)}
              placeholder="e.g. Python, SQL, React"
            />
            <button type="button" onClick={handleAddReqSkill} className="btn btn-secondary btn-sm">
              <Plus size={14} />
              <span>Add Required</span>
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {reqSkills.map((s, idx) => (
              <SkillBadge key={idx} name={s} type="strong" onRemove={() => setReqSkills(reqSkills.filter((_, i) => i !== idx))} />
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Preferred / Good-to-Have Skills</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <input
              type="text"
              className="form-input"
              style={{ maxWidth: '300px' }}
              value={newPrefSkill}
              onChange={(e) => setNewPrefSkill(e.target.value)}
              placeholder="e.g. AWS, Redis, GraphQL"
            />
            <button type="button" onClick={handleAddPrefSkill} className="btn btn-secondary btn-sm">
              <Plus size={14} />
              <span>Add Preferred</span>
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {prefSkills.map((s, idx) => (
              <SkillBadge key={idx} name={s} type="default" onRemove={() => setPrefSkills(prefSkills.filter((_, i) => i !== idx))} />
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Job Description *</label>
          <textarea
            className="form-textarea"
            style={{ minHeight: '120px' }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Comprehensive overview of the role..."
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Responsibilities</label>
          <textarea
            className="form-textarea"
            style={{ minHeight: '80px' }}
            value={responsibilities}
            onChange={(e) => setResponsibilities(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Benefits & Perks</label>
          <textarea
            className="form-textarea"
            style={{ minHeight: '80px' }}
            value={benefits}
            onChange={(e) => setBenefits(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          <PlusCircle size={18} />
          <span>{loading ? 'Publishing Job...' : 'Publish Job Listing'}</span>
        </button>
      </form>
    </div>
  );
};

export default CreateJob;
