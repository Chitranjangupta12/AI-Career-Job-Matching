import React, { useState, useEffect } from 'react';
import { recruiterAPI } from '../../services/api';
import { Building, Globe, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const RecruiterProfile = () => {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await recruiterAPI.getProfile();
        setProfile(res.data.data.profile || {});
      } catch (err) {
        console.error('Error loading recruiter profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await recruiterAPI.updateProfile(profile);
      setMsg({ type: 'success', text: 'Company profile updated successfully!' });
    } catch (err) {
      setMsg({ type: 'danger', text: 'Failed to update company profile.' });
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading company profile..." />;

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Recruiter & Company Profile</h1>
        <p style={{ color: '#64748b' }}>Manage your organization details, location, and recruitment info.</p>
      </div>

      {msg.text && (
        <div style={{ padding: '0.85rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: msg.type === 'success' ? '#ecfdf5' : '#fef2f2', color: msg.type === 'success' ? '#065f46' : '#991b1b', border: `1px solid ${msg.type === 'success' ? '#a7f3d0' : '#fecaca'}` }}>
          {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="card" style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                className="form-input"
                value={profile.company_name || ''}
                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Designation / Role</label>
              <input
                type="text"
                className="form-input"
                value={profile.designation || ''}
                onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                placeholder="e.g. Lead Technical Recruiter"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company Website URL</label>
              <input
                type="url"
                className="form-input"
                value={profile.company_website || ''}
                onChange={(e) => setProfile({ ...profile, company_website: e.target.value })}
                placeholder="https://company.example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location / Headquarters</label>
              <input
                type="text"
                className="form-input"
                value={profile.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="e.g. San Francisco, CA"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Industry Domain</label>
              <input
                type="text"
                className="form-input"
                value={profile.industry || ''}
                onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                placeholder="e.g. Information Technology, Cloud Computing, FinTech"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Company Overview / Description</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '120px' }}
              value={profile.company_description || ''}
              onChange={(e) => setProfile({ ...profile, company_description: e.target.value })}
              placeholder="Tell candidates about your company culture, mission, and benefits..."
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Save Company Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecruiterProfile;
