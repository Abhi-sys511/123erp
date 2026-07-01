import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'CUSTOMER' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:8000/api/auth/register/', formData);
      if (formData.role === 'CUSTOMER') {
        // Customers go to the interest form on the landing page
        navigate('/', { state: { step: 'interest', email: formData.email } });
      } else {
        // Other roles go to the login page
        navigate('/login', { state: { successMessage: 'Registration successful! Please login.' } });
      }
    } catch (err) {
      const detail =
        err?.response?.data?.username?.[0] ||
        err?.response?.data?.email?.[0] ||
        err?.response?.data?.detail ||
        'Registration failed. Please check your details.';
      setError(detail);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '450px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Username</label>
            <input required type="text" className="input-field" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input required type="email" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input required type="password" className="input-field" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Role (For Testing)</label>
            <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="CUSTOMER">Customer</option>
              <option value="SALES_EXECUTIVE">Sales Executive</option>
              <option value="TECHNICIAN">Technician</option>
              <option value="CUSTOMER_CARE">Customer Care</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>Register</button>
        </form>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
