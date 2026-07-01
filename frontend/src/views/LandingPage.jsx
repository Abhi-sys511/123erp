import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const API = 'https://123erp-production.up.railway.app/api';

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Step: 'register' | 'interest' | 'done'
  const [step, setStep] = useState(location.state?.step || 'register');

  // Register form state
  const [regData, setRegData] = useState({ username: '', email: '', password: '', role: 'CUSTOMER' });
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Interest / lead form state
  const [leadData, setLeadData] = useState({ name: '', email: location.state?.email || '', phone: '', interest_details: '' });
  const [leadError, setLeadError] = useState('');
  const [leadLoading, setLeadLoading] = useState(false);

  // ── Step 1: Register directly via API (no auto-login so no redirect side effects) ──
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);
    try {
      await axios.post(`${API}/auth/register/`, regData);
      // Success → check if customer role
      if (regData.role === 'CUSTOMER') {
        setLeadData((prev) => ({ ...prev, email: regData.email }));
        setStep('interest');
      } else {
        // Non-customer roles go directly to login page with a success message
        navigate('/login', { state: { successMessage: 'Registration successful! Please login.' } });
      }
    } catch (err) {
      const detail =
        err?.response?.data?.username?.[0] ||
        err?.response?.data?.email?.[0] ||
        err?.response?.data?.detail ||
        'Registration failed. Please check your details.';
      setRegError(detail);
    } finally {
      setRegLoading(false);
    }
  };

  // ── Step 2: Submit lead / interest ──
  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setLeadError('');
    setLeadLoading(true);
    try {
      await axios.post(`${API}/leads/`, leadData);
      setStep('done');
    } catch (err) {
      setLeadError('Failed to submit. Please try again.');
    } finally {
      setLeadLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '4rem' }}>

      {/* ── Hero Section ── */}
      <header style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(0,74,173,0.85))',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          width: '600px', height: '600px',
          background: 'var(--primary)',
          filter: 'blur(150px)',
          opacity: '0.15',
          borderRadius: '50%',
          top: '-20%', left: '-10%',
        }} />

        <div className="container animate-fade-in" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: '4rem', marginBottom: '1rem',
            background: 'linear-gradient(to right, #fff, #94a3b8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Powering the Future with Solar
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Premium solar distribution and installation services. Sustainable energy solutions delivered to your doorstep.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href="#main-form" className="btn btn-primary">Get Started</a>
            <button onClick={() => navigate('/login')} className="btn btn-secondary">Login</button>
          </div>
        </div>
      </header>

      {/* ── Step Indicator ── */}
      {regData.role === 'CUSTOMER' && (
        <div id="main-form" style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem', gap: '0.75rem', alignItems: 'center' }}>
          {[{ label: 'Register', key: 'register' }, { label: 'Show Interest', key: 'interest' }].map(({ label, key }, i) => {
            const isCompleted = (key === 'register' && (step === 'interest' || step === 'done'));
            const isActive = step === key || (key === 'interest' && step === 'done');
            return (
              <React.Fragment key={key}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  color: isCompleted ? 'var(--success)' : isActive ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: (isActive || isCompleted) ? '600' : '400',
                  fontSize: '0.95rem',
                }}>
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isCompleted ? 'rgba(16,185,129,0.15)' : isActive ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${isCompleted ? 'var(--success)' : isActive ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                    fontSize: '0.8rem', fontWeight: '700',
                    transition: 'all 0.3s ease',
                  }}>
                    {isCompleted ? '✓' : i + 1}
                  </div>
                  {label}
                </div>
                {i === 0 && (
                  <div style={{
                    width: '60px', height: '2px',
                    background: (step === 'interest' || step === 'done') ? 'var(--success)' : 'rgba(255,255,255,0.1)',
                    borderRadius: '2px', transition: 'background 0.5s ease',
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* ── Form Panel ── */}
      <section className="container" style={{ marginTop: '2rem', position: 'relative', zIndex: 2 }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem', maxWidth: '520px', margin: '0 auto' }}>

          {/* ── STEP 1: Register ── */}
          {step === 'register' && (
            <>
              <h2 style={{ textAlign: 'center', marginBottom: '0.4rem' }}>Create Your Account</h2>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                Step 1 of 2 — Register to get started
              </p>

              {regError && (
                <div style={{
                  color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center',
                  padding: '0.75rem', background: 'rgba(239,68,68,0.1)',
                  borderRadius: 'var(--radius-md)', fontSize: '0.9rem',
                }}>
                  {regError}
                </div>
              )}

              <form onSubmit={handleRegister}>
                <div className="input-group">
                  <label className="input-label">Username</label>
                  <input
                    required type="text" className="input-field"
                    placeholder="johndoe"
                    value={regData.username}
                    onChange={e => setRegData({ ...regData, username: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input
                    required type="email" className="input-field"
                    placeholder="john@example.com"
                    value={regData.email}
                    onChange={e => setRegData({ ...regData, email: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Password</label>
                  <input
                    required type="password" className="input-field"
                    placeholder="••••••••"
                    minLength={6}
                    value={regData.password}
                    onChange={e => setRegData({ ...regData, password: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Role</label>
                  <select
                    className="input-field"
                    value={regData.role}
                    onChange={e => setRegData({ ...regData, role: e.target.value })}
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="SALES_EXECUTIVE">Sales Executive</option>
                    <option value="TECHNICIAN">Technician</option>
                    <option value="CUSTOMER_CARE">Customer Care</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginBottom: '1rem' }}
                  disabled={regLoading}
                >
                  {regLoading ? 'Creating Account…' : 'Register & Continue →'}
                </button>
              </form>

              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Login</Link>
              </p>
            </>
          )}

          {/* ── STEP 2: Show Interest ── */}
          {step === 'interest' && (
            <>
              <h2 style={{ textAlign: 'center', marginBottom: '0.4rem' }}>Show Your Interest</h2>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                Step 2 of 2 — Tell us what you need and we'll get in touch
              </p>

              {leadError && (
                <div style={{
                  color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center',
                  padding: '0.75rem', background: 'rgba(239,68,68,0.1)',
                  borderRadius: 'var(--radius-md)', fontSize: '0.9rem',
                }}>
                  {leadError}
                </div>
              )}

              <form onSubmit={handleLeadSubmit}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input
                    required type="text" className="input-field"
                    placeholder="John Doe"
                    value={leadData.name}
                    onChange={e => setLeadData({ ...leadData, name: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input
                    required type="email" className="input-field"
                    placeholder="john@example.com"
                    value={leadData.email}
                    onChange={e => setLeadData({ ...leadData, email: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input
                    required type="tel" className="input-field"
                    placeholder="+91 98765 43210"
                    value={leadData.phone}
                    onChange={e => setLeadData({ ...leadData, phone: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">How can we help you?</label>
                  <textarea
                    required className="input-field" rows="4"
                    placeholder="I am interested in solar panels for my 3-bedroom house…"
                    value={leadData.interest_details}
                    onChange={e => setLeadData({ ...leadData, interest_details: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginBottom: '0.75rem' }}
                  disabled={leadLoading}
                >
                  {leadLoading ? 'Submitting…' : '☀️ Submit My Interest'}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                  onClick={() => navigate('/login')}
                >
                  Skip — Go to Login
                </button>
              </form>
            </>
          )}

          {/* ── DONE ── */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
              <h3 style={{ marginBottom: '0.75rem' }}>You're all set!</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                Your interest has been recorded. Our sales executive will contact you shortly.
              </p>
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => navigate('/login')}
              >
                Continue to Login →
              </button>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
