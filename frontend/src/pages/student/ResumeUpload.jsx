import React, { useState, useEffect } from 'react';
import { resumeAPI } from '../../services/api';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, Brain, Award, Layers } from 'lucide-react';
import SkillBadge from '../../components/SkillBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'text'
  const [uploading, setUploading] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchResumes = async () => {
    try {
      const res = await resumeAPI.getMyResumes();
      setResumes(res.data.data.resumes || []);
    } catch (err) {
      console.error('Error fetching resumes:', err);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMsg({ type: 'danger', text: 'Please select a resume file (PDF, DOCX, or TXT) to upload.' });
      return;
    }

    setUploading(true);
    setMsg({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await resumeAPI.uploadResume(formData);
      const data = res.data.data;

      setParsedResult(data.extracted);
      setMsg({
        type: 'success',
        text: `Resume parsed successfully! Extracted ${data.extracted?.skills?.length || 0} skills and synced to your profile.`,
      });
      fetchResumes();
    } catch (err) {
      console.error('Resume upload error:', err);
      const errorMsg =
        err.response?.data?.errors ||
        err.response?.data?.message ||
        err.message ||
        'Failed to upload and parse resume. Please ensure the file contains valid text.';
      setMsg({
        type: 'danger',
        text: errorMsg,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleTextParse = async (e) => {
    e.preventDefault();
    if (!rawText.trim() || rawText.trim().length < 10) {
      setMsg({ type: 'danger', text: 'Please paste at least 10 characters of resume text.' });
      return;
    }

    setUploading(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await resumeAPI.parseText(rawText);
      const data = res.data.data;
      setParsedResult(data.extracted);
      setMsg({
        type: 'success',
        text: `Text analyzed successfully! Extracted ${data.extracted?.skills?.length || 0} skills.`,
      });
    } catch (err) {
      console.error('Resume text parse error:', err);
      const errorMsg =
        err.response?.data?.errors ||
        err.response?.data?.message ||
        err.message ||
        'Failed to parse resume text.';
      setMsg({
        type: 'danger',
        text: errorMsg,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>AI Resume Analyzer & NLP Extractor</h1>
        <p style={{ color: '#64748b' }}>
          Upload your resume PDF to extract technical and soft skills, education, and experience using our Python NLP pipeline.
        </p>
      </div>

      {msg.text && (
        <div style={{ padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', background: msg.type === 'success' ? '#ecfdf5' : '#fef2f2', color: msg.type === 'success' ? '#065f46' : '#991b1b', border: `1px solid ${msg.type === 'success' ? '#a7f3d0' : '#fecaca'}` }}>
          {msg.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span style={{ fontWeight: 500 }}>{msg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('upload')}
          className={`btn ${activeTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <UploadCloud size={16} />
          <span>Upload PDF Document</span>
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`btn ${activeTab === 'text' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <FileText size={16} />
          <span>Paste Resume Text</span>
        </button>
      </div>

      <div className="grid-2">
        {/* Left Column: Upload / Input Form */}
        <div>
          {activeTab === 'upload' ? (
            <div className="card">
              <h2 className="card-title" style={{ marginBottom: '1rem' }}>Upload Resume File</h2>
              <form onSubmit={handleFileUpload}>
                <div
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '2.5rem 1.5rem',
                    textAlign: 'center',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    marginBottom: '1.25rem',
                  }}
                  onClick={() => document.getElementById('file-upload-input').click()}
                >
                  <UploadCloud size={42} color="#4f46e5" style={{ margin: '0 auto 0.75rem' }} />
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>
                    {file ? file.name : 'Click or Drag & Drop Resume PDF'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Supported formats: .pdf, .txt, .docx (Max 10MB)
                  </div>
                  <input
                    id="file-upload-input"
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem' }}
                  disabled={uploading || !file}
                >
                  {uploading ? <LoadingSpinner text="Running Python NLP Extractor..." /> : (
                    <>
                      <Brain size={18} />
                      <span>Analyze Resume & Extract Skills</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="card">
              <h2 className="card-title" style={{ marginBottom: '1rem' }}>Paste Resume Text</h2>
              <form onSubmit={handleTextParse}>
                <div className="form-group">
                  <textarea
                    className="form-textarea"
                    style={{ minHeight: '220px' }}
                    placeholder="Paste resume content here including skills, education, experience, and projects..."
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem' }}
                  disabled={uploading}
                >
                  {uploading ? <LoadingSpinner text="Parsing text..." /> : (
                    <>
                      <Sparkles size={18} />
                      <span>Parse Skills from Text</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Upload History */}
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
              Uploaded Resumes ({resumes.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {resumes.map((r) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={16} color="#4f46e5" />
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.file_name}</span>
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                    {new Date(r.uploaded_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {resumes.length === 0 && (
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No resumes uploaded yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: NLP Extraction Results Preview */}
        <div>
          {parsedResult ? (
            <div className="card" style={{ border: '2px solid #818cf8', background: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4f46e5', fontWeight: 700, marginBottom: '1rem' }}>
                <Sparkles size={20} />
                <h2 style={{ fontSize: '1.25rem', color: '#0f172a' }}>Structured NLP Extraction Output</h2>
              </div>

              {/* Summary Banner */}
              <div style={{ background: '#eef2ff', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.88rem', color: '#3730a3', lineHeight: 1.5 }}>
                {parsedResult.summary}
              </div>

              {/* Technical Skills */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Technical Skills ({parsedResult.technical_skills?.length || 0})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {parsedResult.technical_skills?.map((s, idx) => (
                    <SkillBadge key={idx} name={s} type="strong" />
                  ))}
                  {(!parsedResult.technical_skills || parsedResult.technical_skills.length === 0) && (
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>None detected</span>
                  )}
                </div>
              </div>

              {/* Soft Skills */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Soft & Collaboration Skills ({parsedResult.soft_skills?.length || 0})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {parsedResult.soft_skills?.map((s, idx) => (
                    <SkillBadge key={idx} name={s} type="moderate" />
                  ))}
                  {(!parsedResult.soft_skills || parsedResult.soft_skills.length === 0) && (
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>None detected</span>
                  )}
                </div>
              </div>

              {/* Education & Experience Highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Degrees & Education</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: '0.25rem' }}>
                    {parsedResult.education && parsedResult.education.length > 0 ? (
                      parsedResult.education.map((e, idx) => (
                        <div key={idx} style={{ marginBottom: '0.25rem' }}>
                          {e.degree || 'Degree'} {e.institution ? `• ${e.institution}` : ''} {e.year ? `(${e.year})` : ''}
                        </div>
                      ))
                    ) : (
                      'Inferred from profile'
                    )}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Estimated Experience</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: '0.25rem' }}>
                    ~{parsedResult.experience_years_estimated || 0} Years
                  </div>
                </div>
              </div>

              {/* Projects & Certifications (if detected) */}
              {(parsedResult.projects?.length > 0 || parsedResult.certifications?.length > 0) && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                  {parsedResult.projects?.length > 0 && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Detected Projects ({parsedResult.projects.length})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {parsedResult.projects.map((p, idx) => (
                          <div key={idx} style={{ fontSize: '0.85rem', color: '#1e293b', background: '#f8fafc', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                            <span style={{ fontWeight: 600 }}>{p.title}</span>
                            {p.technologies?.length > 0 && (
                              <span style={{ color: '#64748b', marginLeft: '0.5rem', fontSize: '0.78rem' }}>
                                [{p.technologies.join(', ')}]
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {parsedResult.certifications?.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Certifications ({parsedResult.certifications.length})
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {parsedResult.certifications.map((c, idx) => (
                          <span key={idx} style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: '#fef3c7', color: '#92400e', borderRadius: '4px', fontWeight: 600 }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: '#64748b' }}>
              <Brain size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#334155' }}>Awaiting Resume Analysis</h3>
              <p style={{ fontSize: '0.88rem', maxWidth: '360px', margin: '0.5rem auto 0' }}>
                Upload your resume PDF on the left. The extracted skills, degrees, and qualifications will appear here in real-time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
