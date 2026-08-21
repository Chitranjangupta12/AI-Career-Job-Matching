import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Users, CheckCircle, XCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const res = await adminAPI.getStudents();
      setStudents(res.data.data.students || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleToggleStatus = async (userId) => {
    try {
      await adminAPI.toggleUserStatus(userId);
      fetchStudents();
    } catch (err) {
      alert('Failed to update student status.');
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading students directory..." />;

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Manage Students ({students.length})</h1>
        <p style={{ color: '#64748b' }}>View all enrolled students, verified skills, and application activity.</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Student Name & Email</th>
              <th>Education & Major</th>
              <th>Skills Count</th>
              <th>Applications</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.student_id}>
                <td>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.name}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{s.email}</div>
                  <div style={{ fontSize: '0.8rem', color: '#4f46e5' }}>{s.headline}</div>
                </td>
                <td>
                  <div>{s.education_level || "Bachelor's"}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{s.major || 'Computer Science'}</div>
                </td>
                <td>
                  <span className="badge badge-secondary">{s.skills_count || 0} Skills</span>
                </td>
                <td>
                  <span className="badge badge-primary">{s.applications_count || 0} Applied</span>
                </td>
                <td>
                  <span className={`badge ${s.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {s.is_active ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleToggleStatus(s.user_id)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.78rem' }}
                  >
                    {s.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageStudents;
