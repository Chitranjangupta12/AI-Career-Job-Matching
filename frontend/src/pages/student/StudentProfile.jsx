import React, { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import { User, BookOpen, Briefcase, Code, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import SkillBadge from '../../components/SkillBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const StudentProfile = () => {
  const [profile, setProfile] = useState({});
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Add Skill Form State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');

  // Add Education Form State
  const [eduInst, setEduInst] = useState('');
  const [eduDegree, setEduDegree] = useState('');
  const [eduField, setEduField] = useState('');
  const [eduStart, setEduStart] = useState('');
  const [eduEnd, setEduEnd] = useState('');
  const [eduGrade, setEduGrade] = useState('');
  const [showAddEdu, setShowAddEdu] = useState(false);

  // Add Experience Form State
  const [expTitle, setExpTitle] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expLocation, setExpLocation] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [showAddExp, setShowAddExp] = useState(false);

  // Add Project Form State
  const [projTitle, setProjTitle] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projUrl, setProjUrl] = useState('');
  const [showAddProj, setShowAddProj] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await studentAPI.getProfile();
      const data = res.data.data;
      setProfile(data.profile || {});
      setSkills(data.skills || []);
      setEducation(data.education || []);
      setExperience(data.experience || []);
      setProjects(data.projects || []);
    } catch (err) {
      setMsg({ type: 'danger', text: 'Failed to load profile details.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await studentAPI.updateProfile(profile);
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMsg({ type: 'danger', text: 'Failed to update profile.' });
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    try {
      await studentAPI.addSkill({ skill_name: newSkillName.trim(), proficiency_level: newSkillLevel });
      setNewSkillName('');
      fetchProfile();
    } catch (err) {
      setMsg({ type: 'danger', text: 'Failed to add skill.' });
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      await studentAPI.deleteSkill(skillId);
      fetchProfile();
    } catch (err) {
      setMsg({ type: 'danger', text: 'Failed to remove skill.' });
    }
  };

  const handleAddEducation = async (e) => {
    e.preventDefault();
    try {
      await studentAPI.addEducation({
        institution: eduInst,
        degree: eduDegree,
        field_of_study: eduField,
        start_year: eduStart ? parseInt(eduStart) : null,
        end_year: eduEnd ? parseInt(eduEnd) : null,
        grade: eduGrade,
      });
      setEduInst(''); setEduDegree(''); setEduField(''); setEduStart(''); setEduEnd(''); setEduGrade('');
      setShowAddEdu(false);
      fetchProfile();
    } catch (err) {
      setMsg({ type: 'danger', text: 'Failed to add education.' });
    }
  };

  const handleDeleteEducation = async (id) => {
    try {
      await studentAPI.deleteEducation(id);
      fetchProfile();
    } catch (err) {
      setMsg({ type: 'danger', text: 'Failed to delete education.' });
    }
  };

  const handleAddExperience = async (e) => {
    e.preventDefault();
    try {
      await studentAPI.addExperience({
        title: expTitle,
        company: expCompany,
        location: expLocation,
        description: expDesc,
      });
      setExpTitle(''); setExpCompany(''); setExpLocation(''); setExpDesc('');
      setShowAddExp(false);
      fetchProfile();
    } catch (err) {
      setMsg({ type: 'danger', text: 'Failed to add experience.' });
    }
  };

  const handleDeleteExperience = async (id) => {
    try {
      await studentAPI.deleteExperience(id);
      fetchProfile();
    } catch (err) {
      setMsg({ type: 'danger', text: 'Failed to delete experience.' });
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      await studentAPI.addProject({
        title: projTitle,
        technologies: projTech,
        description: projDesc,
        project_url: projUrl,
      });
      setProjTitle(''); setProjTech(''); setProjDesc(''); setProjUrl('');
      setShowAddProj(false);
      fetchProfile();
    } catch (err) {
      setMsg({ type: 'danger', text: 'Failed to add project.' });
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await studentAPI.deleteProject(id);
      fetchProfile();
    } catch (err) {
      setMsg({ type: 'danger', text: 'Failed to delete project.' });
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading profile details..." />;

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Candidate Profile & Skills</h1>
        <p style={{ color: '#64748b' }}>Maintain your academic background, experience, verified skills, and project portfolio.</p>
      </div>

      {msg.text && (
        <div style={{ padding: '0.85rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: msg.type === 'success' ? '#ecfdf5' : '#fef2f2', color: msg.type === 'success' ? '#065f46' : '#991b1b', border: `1px solid ${msg.type === 'success' ? '#a7f3d0' : '#fecaca'}` }}>
          {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* 1. Basic Details Form */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <User size={20} color="#4f46e5" />
          <span>Personal & Academic Details</span>
        </h2>

        <form onSubmit={handleProfileUpdate}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Professional Headline</label>
              <input
                type="text"
                className="form-input"
                value={profile.headline || ''}
                onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                placeholder="e.g. B.Tech Computer Science Student | Aspiring Full Stack Engineer"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Highest Education Level</label>
              <input
                type="text"
                className="form-input"
                value={profile.education_level || ''}
                onChange={(e) => setProfile({ ...profile, education_level: e.target.value })}
                placeholder="e.g. Bachelor of Technology (B.Tech)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Major / Branch</label>
              <input
                type="text"
                className="form-input"
                value={profile.major || ''}
                onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                placeholder="e.g. Computer Science and Engineering"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Experience (Years)</label>
              <input
                type="number"
                step="0.5"
                className="form-input"
                value={profile.experience_years || 0}
                onChange={(e) => setProfile({ ...profile, experience_years: parseFloat(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-input"
                value={profile.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="e.g. Austin, TX (or Remote)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Career Interests</label>
              <input
                type="text"
                className="form-input"
                value={profile.interests || ''}
                onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
                placeholder="e.g. Full Stack Web Development, Machine Learning, Cloud Systems"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Professional Bio</label>
            <textarea
              className="form-textarea"
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Brief summary of your academic journey, strengths, and career aspirations..."
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Save Profile Changes
          </button>
        </form>
      </div>

      {/* 2. Skills Inventory */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code size={20} color="#0ea5e9" />
            <span>Skills Inventory ({skills.length})</span>
          </h2>
        </div>

        <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-input"
            style={{ flex: 1, minWidth: '220px' }}
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="Add new skill (e.g. React, Docker, Python, SQL)"
          />
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={newSkillLevel}
            onChange={(e) => setNewSkillLevel(e.target.value)}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>
          <button type="submit" className="btn btn-primary">
            <Plus size={16} />
            <span>Add Skill</span>
          </button>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {skills.map((s) => (
            <SkillBadge
              key={s.skill_id}
              name={`${s.name} (${s.proficiency_level})`}
              onRemove={() => handleDeleteSkill(s.skill_id)}
            />
          ))}
          {skills.length === 0 && (
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No skills added. Add your top skills or upload your resume to extract automatically.</div>
          )}
        </div>
      </div>

      {/* 3. Education Details */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} color="#8b5cf6" />
            <span>Education</span>
          </h2>
          <button onClick={() => setShowAddEdu(!showAddEdu)} className="btn btn-secondary btn-sm">
            <Plus size={14} />
            <span>{showAddEdu ? 'Cancel' : 'Add Education'}</span>
          </button>
        </div>

        {showAddEdu && (
          <form onSubmit={handleAddEducation} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Institution / University</label>
                <input type="text" className="form-input" value={eduInst} onChange={(e) => setEduInst(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Degree</label>
                <input type="text" className="form-input" value={eduDegree} onChange={(e) => setEduDegree(e.target.value)} placeholder="e.g. B.Tech" required />
              </div>
              <div className="form-group">
                <label className="form-label">Field of Study</label>
                <input type="text" className="form-input" value={eduField} onChange={(e) => setEduField(e.target.value)} placeholder="e.g. Computer Science" />
              </div>
              <div className="form-group">
                <label className="form-label">Grade / GPA</label>
                <input type="text" className="form-input" value={eduGrade} onChange={(e) => setEduGrade(e.target.value)} placeholder="e.g. 3.8 / 4.0 or 8.5 CGPA" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Save Education</button>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {education.map((edu) => (
            <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{edu.degree} in {edu.field_of_study || 'Engineering'}</div>
                <div style={{ fontSize: '0.88rem', color: '#64748b' }}>{edu.institution} {edu.grade ? `• Grade: ${edu.grade}` : ''}</div>
              </div>
              <button onClick={() => handleDeleteEducation(edu.id)} className="btn btn-outline btn-sm" style={{ color: '#ef4444', borderColor: '#fca5a5' }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {education.length === 0 && <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No education records added.</div>}
        </div>
      </div>

      {/* 4. Experience & Projects */}
      <div className="grid-2">
        {/* Experience */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={20} color="#10b981" />
              <span>Experience</span>
            </h2>
            <button onClick={() => setShowAddExp(!showAddExp)} className="btn btn-secondary btn-sm">
              <Plus size={14} />
              <span>{showAddExp ? 'Cancel' : 'Add'}</span>
            </button>
          </div>

          {showAddExp && (
            <form onSubmit={handleAddExperience} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input type="text" className="form-input" value={expTitle} onChange={(e) => setExpTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input type="text" className="form-input" value={expCompany} onChange={(e) => setExpCompany(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" style={{ minHeight: '60px' }} value={expDesc} onChange={(e) => setExpDesc(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">Save Experience</button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {experience.map((exp) => (
              <div key={exp.id} style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{exp.title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{exp.company} • {exp.location || 'Remote'}</div>
                  {exp.description && <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.35rem' }}>{exp.description}</div>}
                </div>
                <button onClick={() => handleDeleteExperience(exp.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {experience.length === 0 && <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No experience recorded.</div>}
          </div>
        </div>

        {/* Projects */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code size={20} color="#f59e0b" />
              <span>Projects</span>
            </h2>
            <button onClick={() => setShowAddProj(!showAddProj)} className="btn btn-secondary btn-sm">
              <Plus size={14} />
              <span>{showAddProj ? 'Cancel' : 'Add'}</span>
            </button>
          </div>

          {showAddProj && (
            <form onSubmit={handleAddProject} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
              <div className="form-group">
                <label className="form-label">Project Title</label>
                <input type="text" className="form-input" value={projTitle} onChange={(e) => setProjTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Technologies Used</label>
                <input type="text" className="form-input" value={projTech} onChange={(e) => setProjTech(e.target.value)} placeholder="e.g. React, Node.js, PostgreSQL" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" style={{ minHeight: '60px' }} value={projDesc} onChange={(e) => setProjDesc(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">Save Project</button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {projects.map((proj) => (
              <div key={proj.id} style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{proj.title}</div>
                  <div style={{ fontSize: '0.82rem', color: '#4f46e5', fontWeight: 600 }}>{proj.technologies}</div>
                  {proj.description && <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.25rem' }}>{proj.description}</div>}
                </div>
                <button onClick={() => handleDeleteProject(proj.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {projects.length === 0 && <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No projects listed.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
