import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const successMessage = location.state?.successMessage;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.username, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome Back</h2>
        {successMessage && (
          <div style={{
            color: 'var(--success)',
            marginBottom: '1.5rem',
            textAlign: 'center',
            padding: '0.75rem',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            fontSize: '0.9rem'
          }}>
            {successMessage}
          </div>
        )}
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Username</label>
            <input required type="text" className="input-field" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input required type="password" className="input-field" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>Login</button>
        </form>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
