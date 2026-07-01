import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// ─────────────────────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const getProjectStatusStyle = (status) => {
  switch (status) {
    case 'SCHEDULED':             return { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8', border: 'rgba(148,163,184,0.3)', label: 'Scheduled' };
    case 'INSTALLATION_STARTED':  return { bg: 'rgba(99,102,241,0.15)',  color: '#818cf8', border: 'rgba(99,102,241,0.3)',  label: 'Installation Started' };
    case 'WORK_IN_PROGRESS':      return { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa', border: 'rgba(59,130,246,0.3)',  label: 'Work In Progress' };
    case 'HALFWAY_COMPLETED':     return { bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24', border: 'rgba(245,158,11,0.3)',  label: 'Halfway Completed' };
    case 'INSTALLATION_COMPLETED':return { bg: 'rgba(16,185,129,0.15)',  color: '#10b981', border: 'rgba(16,185,129,0.3)',  label: 'Installation Completed' };
    default:                      return { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: 'rgba(255,255,255,0.1)', label: status };
  }
};

const getTicketStatusStyle = (status) => {
  switch (status) {
    case 'OPEN':                  return { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', border: 'rgba(239,68,68,0.3)',   label: 'Open' };
    case 'ASSIGNED':              return { bg: 'rgba(99,102,241,0.15)',  color: '#818cf8', border: 'rgba(99,102,241,0.3)',  label: 'Assigned' };
    case 'IN_PROGRESS':           return { bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24', border: 'rgba(245,158,11,0.3)',  label: 'In Progress' };
    case 'RESOLVED':              return { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa', border: 'rgba(59,130,246,0.3)',  label: 'Resolved' };
    case 'SUCCESSFULLY_RESOLVED': return { bg: 'rgba(16,185,129,0.15)',  color: '#10b981', border: 'rgba(16,185,129,0.3)',  label: '✓ Successfully Resolved' };
    default:                      return { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: 'rgba(255,255,255,0.1)', label: status };
  }
};

const StatusBadge = ({ status, styleGetter }) => {
  const s = styleGetter(status);
  return (
    <span style={{
      padding: '3px 9px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '700',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap'
    }}>
      {s.label}
    </span>
  );
};

const Notification = ({ msg, type }) => msg ? (
  <div style={{
    padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem',
    background: type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
    color: type === 'success' ? 'var(--success)' : 'var(--danger)',
    border: `1px solid ${type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
  }}>{msg}</div>
) : null;

const SectionHeader = ({ icon, title }) => (
  <h2 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    {icon} {title}
  </h2>
);

const EmptyState = ({ msg }) => (
  <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
    {msg}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD SHELL
// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  if (!user) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="glass-panel" style={{
        padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderRadius: 0, borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h2 style={{ margin: 0, color: 'var(--primary)' }}>☀️ Solar ERP</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            Logged in as <strong>{user.username}</strong> ({user.role.replace('_', ' ')})
          </span>
          <button onClick={handleLogout} className="btn" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)' }}>
            Logout
          </button>
        </div>
      </header>

      <main className="container animate-fade-in" style={{ flex: 1, padding: '2rem 24px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome to your workspace, {user.username}.</p>
        </div>

        {user.role === 'ADMIN'          && <AdminDashboard />}
        {user.role === 'SALES_EXECUTIVE'&& <SalesExecutiveDashboard />}
        {user.role === 'TECHNICIAN'     && <TechnicianDashboard />}
        {user.role === 'CUSTOMER_CARE'  && <CustomerCareDashboard />}
        {user.role === 'CUSTOMER'       && <CustomerDashboard />}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function CustomerDashboard() {
  const { api } = useContext(AuthContext);
  const [quotes, setQuotes]   = useState([]);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [tickets, setTickets]  = useState([]);
  const [msg, setMsg] = useState(''); const [msgType, setMsgType] = useState('success');
  const [ticketForm, setTicketForm] = useState({ subject: '', description: '', project: '' });
  const [showTicketForm, setShowTicketForm] = useState(false);

  const flash = (text, type = 'success') => { setMsgType(type); setMsg(text); setTimeout(() => setMsg(''), 5000); };

  const fetchAll = useCallback(async () => {
    try {
      const [q, p, inv, t] = await Promise.all([
        api.get('quotations/'), api.get('projects/'),
        api.get('invoices/'),   api.get('tickets/')
      ]);
      setQuotes(q.data); setProjects(p.data);
      setInvoices(inv.data); setTickets(t.data);
    } catch (e) { console.error(e); }
  }, [api]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleUpdateQuote = async (id, status) => {
    try {
      await api.patch(`quotations/${id}/`, { status });
      flash(`Quotation ${status === 'ACCEPTED' ? 'approved' : 'rejected'}!`);
      fetchAll();
    } catch { flash('Failed to update quotation.', 'error'); }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const payload = { subject: ticketForm.subject, description: ticketForm.description };
      if (ticketForm.project) payload.project = parseInt(ticketForm.project);
      await api.post('tickets/', payload);
      flash('Support ticket submitted successfully!');
      setTicketForm({ subject: '', description: '', project: '' });
      setShowTicketForm(false);
      fetchAll();
    } catch { flash('Failed to submit ticket.', 'error'); }
  };

  const completedProjects = projects.filter(p => p.status === 'INSTALLATION_COMPLETED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <Notification msg={msg} type={msgType} />

      {/* ── QUOTATIONS ── */}
      <section>
        <SectionHeader icon="📋" title="My Quotations" />
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {quotes.length === 0 ? <EmptyState msg="No quotations received yet." /> :
            quotes.map(q => (
              <div key={q.id} className="glass-panel animate-fade-in" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', minHeight: '240px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Quote #{q.id}</span>
                  <StatusBadge status={q.status} styleGetter={(s) => ({
                    bg: s === 'PENDING' ? 'rgba(245,158,11,0.15)' : s === 'ACCEPTED' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    color: s === 'PENDING' ? '#fbbf24' : s === 'ACCEPTED' ? '#10b981' : '#f87171',
                    border: s === 'PENDING' ? 'rgba(245,158,11,0.3)' : s === 'ACCEPTED' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
                    label: s
                  })} />
                </div>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                  ${parseFloat(q.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
                <p style={{ color: 'var(--text-main)', flex: 1, fontSize: '0.95rem' }}>{q.items_description}</p>
                {q.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button onClick={() => handleUpdateQuote(q.id, 'ACCEPTED')} className="btn btn-primary" style={{ flex: 1 }}>Approve</button>
                    <button onClick={() => handleUpdateQuote(q.id, 'REJECTED')} className="btn btn-secondary" style={{ flex: 1, borderColor: 'var(--danger)', color: 'var(--danger)' }}>Reject</button>
                  </div>
                )}
              </div>
            ))
          }
        </div>
      </section>

      {/* ── INSTALLATION PROJECTS ── */}
      <section>
        <SectionHeader icon="☀️" title="My Installation Projects" />
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {projects.length === 0 ? <EmptyState msg="No projects yet. Approve a quotation to get started." /> :
            projects.map(proj => {
              return (
                <div key={proj.id} className="glass-panel animate-fade-in" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Project #{proj.id}</span>
                    <StatusBadge status={proj.status} styleGetter={getProjectStatusStyle} />
                  </div>
                  <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>{proj.lead_name}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    <strong>Technician:</strong> {proj.technician_username || 'Assigning...'}
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{proj.quotation_items}</p>
                </div>
              );
            })
          }
        </div>
      </section>

      {/* ── INVOICES ── */}
      <section>
        <SectionHeader icon="🧾" title="My Invoices" />
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {invoices.length === 0 ? <EmptyState msg="No invoices yet. Invoice is generated once installation is completed." /> :
            invoices.map(inv => (
              <div key={inv.id} className="glass-panel animate-fade-in" style={{ padding: '1.75rem', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Invoice #{inv.id}</span>
                  <StatusBadge status={inv.status} styleGetter={(s) => ({
                    bg: s === 'PAID' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                    color: s === 'PAID' ? '#10b981' : '#fbbf24',
                    border: s === 'PAID' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)',
                    label: s
                  })} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.75rem' }}>
                  ${parseFloat(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}><strong>Project:</strong> {inv.project_lead_name}</p>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}><strong>System:</strong> {inv.project_quotation_items}</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}><strong>Technician:</strong> {inv.project_technician_username}</p>
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Issued: {new Date(inv.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          }
        </div>
      </section>

      {/* ── SUPPORT TICKETS ── */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <SectionHeader icon="🎫" title="Support Tickets" />
          {completedProjects.length > 0 && (
            <button onClick={() => setShowTicketForm(!showTicketForm)} className="btn btn-primary">
              {showTicketForm ? 'Cancel' : '+ Raise a Ticket'}
            </button>
          )}
        </div>

        {showTicketForm && (
          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem', border: '1px solid rgba(99,102,241,0.3)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Describe Your Issue</h3>
            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <select required className="input-field" value={ticketForm.project} onChange={e => setTicketForm({ ...ticketForm, project: e.target.value })}>
                  <option value="">Select a completed project</option>
                  {completedProjects.map(p => <option key={p.id} value={p.id}>Project #{p.id} — {p.lead_name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <input required type="text" className="input-field" placeholder="Issue subject (e.g. Panel not generating power)" value={ticketForm.subject} onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })} />
              </div>
              <div className="input-group">
                <textarea required className="input-field" rows="4" placeholder="Describe the issue in detail..." value={ticketForm.description} onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 2rem' }}>
                Submit Ticket
              </button>
            </form>
          </div>
        )}

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {tickets.length === 0 ? <EmptyState msg="No support tickets yet." /> :
            tickets.map(t => (
              <div key={t.id} className="glass-panel animate-fade-in" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ticket #{t.id}</span>
                  <StatusBadge status={t.status} styleGetter={getTicketStatusStyle} />
                </div>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>{t.subject}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t.description}</p>
                {t.project_lead_name && (
                  <p style={{ fontSize: '0.85rem' }}><strong>Project:</strong> {t.project_lead_name}</p>
                )}
                {t.assigned_technician_username && (
                  <p style={{ fontSize: '0.85rem' }}><strong>Technician:</strong> {t.assigned_technician_username}</p>
                )}
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  {new Date(t.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          }
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SALES EXECUTIVE DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function SalesExecutiveDashboard() {
  const { user, api } = useContext(AuthContext);
  const [leads, setLeads]     = useState([]);
  const [quotes, setQuotes]   = useState([]);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [tickets, setTickets]  = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [quoteData, setQuoteData] = useState({ items_description: '', total_amount: '' });
  const [msg, setMsg] = useState(''); const [msgType, setMsgType] = useState('success');

  const flash = (text, type = 'success') => { setMsgType(type); setMsg(text); setTimeout(() => setMsg(''), 5000); };

  const fetchAll = useCallback(async () => {
    try {
      const [l, q, p, inv, t] = await Promise.all([
        api.get('leads/'), api.get('quotations/'), api.get('projects/'),
        api.get('invoices/'), api.get('tickets/')
      ]);
      setLeads(l.data); setQuotes(q.data); setProjects(p.data);
      setInvoices(inv.data); setTickets(t.data);
    } catch (e) { console.error(e); }
  }, [api]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleGenerateQuote = async (e) => {
    e.preventDefault();
    try {
      await api.post('quotations/', { lead: selectedLead.id, ...quoteData });
      flash('Quotation sent to customer!');
      setSelectedLead(null);
      setQuoteData({ items_description: '', total_amount: '' });
      fetchAll();
    } catch { flash('Error generating quotation.', 'error'); }
  };

  const myProjects = projects.filter(p => p.sales_exec_id === user.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

      {/* Notifications for completed projects */}
      {myProjects.filter(p => p.status === 'INSTALLATION_COMPLETED').length > 0 && (
        <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)', color: '#10b981' }}>
          🎉 {myProjects.filter(p => p.status === 'INSTALLATION_COMPLETED').length} project(s) completed! Invoices have been auto-generated.
        </div>
      )}

      <Notification msg={msg} type={msgType} />

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>

        {/* ── ASSIGNED LEADS ── */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>📂 Assigned Leads</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {leads.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No leads assigned yet.</p> :
              leads.map(lead => (
                <div key={lead.id} style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--primary)' }}>{lead.name}</h3>
                    <StatusBadge status={lead.status} styleGetter={(s) => ({
                      bg: s === 'PENDING' ? 'rgba(239,68,68,0.15)' : s === 'CONVERTED' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                      color: s === 'PENDING' ? '#f87171' : s === 'CONVERTED' ? '#10b981' : '#fbbf24',
                      border: s === 'PENDING' ? 'rgba(239,68,68,0.3)' : s === 'CONVERTED' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)',
                      label: s
                    })} />
                  </div>
                  <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{lead.email}</p>
                  <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{lead.interest_details}</p>

                  {selectedLead?.id === lead.id ? (
                    <form onSubmit={handleGenerateQuote} style={{ padding: '1rem', background: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-sm)' }}>
                      <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Generate Quotation</h4>
                      <textarea required className="input-field" rows="2" placeholder="System Description" value={quoteData.items_description} onChange={e => setQuoteData({ ...quoteData, items_description: e.target.value })} style={{ marginBottom: '0.5rem' }} />
                      <input required type="number" step="0.01" className="input-field" placeholder="Total Amount ($)" value={quoteData.total_amount} onChange={e => setQuoteData({ ...quoteData, total_amount: e.target.value })} style={{ marginBottom: '0.5rem' }} />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Send</button>
                        <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => setSelectedLead(null)}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    lead.status !== 'CONVERTED' && (
                      <button onClick={() => setSelectedLead(lead)} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                        Prepare Quotation
                      </button>
                    )
                  )}
                </div>
              ))
            }
          </div>
        </div>

        {/* ── QUOTATIONS ── */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>📋 Prepared Quotations</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {quotes.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No quotations yet.</p> :
              quotes.map(q => (
                <div key={q.id} style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Quote #{q.id}</h4>
                    <StatusBadge status={q.status} styleGetter={(s) => ({
                      bg: s === 'PENDING' ? 'rgba(245,158,11,0.15)' : s === 'ACCEPTED' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      color: s === 'PENDING' ? '#fbbf24' : s === 'ACCEPTED' ? '#10b981' : '#f87171',
                      border: s === 'PENDING' ? 'rgba(245,158,11,0.3)' : s === 'ACCEPTED' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
                      label: s
                    })} />
                  </div>
                  <p style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}><strong>Lead:</strong> {q.lead_details?.name || '—'}</p>
                  <p style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>{q.items_description}</p>
                  <p style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: '700' }}>${parseFloat(q.total_amount).toLocaleString()}</p>
                  {q.status === 'REJECTED' && (
                    <button onClick={() => { setSelectedLead(q.lead_details); setQuoteData({ items_description: q.items_description, total_amount: q.total_amount }); }}
                      className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '4px 10px', marginTop: '0.5rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                      Revise
                    </button>
                  )}
                </div>
              ))
            }
          </div>
        </div>

        {/* ── INSTALLATION PROJECTS ── */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>🔧 Installation Projects</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {myProjects.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No projects yet.</p> :
              myProjects.map(proj => (
                <div key={proj.id} style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0 }}>Project #{proj.id}</h4>
                    <StatusBadge status={proj.status} styleGetter={getProjectStatusStyle} />
                  </div>
                  <p style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}><strong>Customer:</strong> {proj.customer_username}</p>
                  <p style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}><strong>Technician:</strong> {proj.technician_username || 'Unassigned'}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{proj.quotation_items}</p>
                </div>
              ))
            }
          </div>
        </div>

        {/* ── INVOICES ── */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>🧾 Invoices</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {invoices.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No invoices generated yet.</p> :
              invoices.map(inv => (
                <div key={inv.id} style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0 }}>Invoice #{inv.id}</h4>
                    <StatusBadge status={inv.status} styleGetter={(s) => ({
                      bg: s === 'PAID' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                      color: s === 'PAID' ? '#10b981' : '#fbbf24',
                      border: s === 'PAID' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)',
                      label: s
                    })} />
                  </div>
                  <p style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                    ${parseFloat(inv.amount).toLocaleString()}
                  </p>
                  <p style={{ fontSize: '0.85rem' }}><strong>Customer:</strong> {inv.customer_username}</p>
                  <p style={{ fontSize: '0.85rem' }}><strong>Project:</strong> {inv.project_lead_name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{new Date(inv.created_at).toLocaleDateString()}</p>
                </div>
              ))
            }
          </div>
        </div>

        {/* ── SUPPORT TICKETS ── */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>🎫 Customer Support Tickets</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {tickets.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No support tickets yet.</p> :
              tickets.map(t => (
                <div key={t.id} style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Ticket #{t.id}</h4>
                    <StatusBadge status={t.status} styleGetter={getTicketStatusStyle} />
                  </div>
                  <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>{t.subject}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}><strong>Customer:</strong> {t.customer_username}</p>
                  {t.assigned_technician_username && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}><strong>Tech Assigned:</strong> {t.assigned_technician_username}</p>
                  )}
                </div>
              ))
            }
          </div>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TECHNICIAN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function TechnicianDashboard() {
  const { api } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [tickets, setTickets]   = useState([]);
  const [msg, setMsg] = useState(''); const [msgType, setMsgType] = useState('success');

  const flash = (text, type = 'success') => { setMsgType(type); setMsg(text); setTimeout(() => setMsg(''), 5000); };

  const fetchAll = useCallback(async () => {
    try {
      const [p, t] = await Promise.all([api.get('projects/'), api.get('tickets/')]);
      setProjects(p.data); setTickets(t.data);
    } catch (e) { console.error(e); }
  }, [api]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleProjectStatus = async (id, status) => {
    try {
      await api.patch(`projects/${id}/`, { status });
      flash(`Status updated to: ${status.replace(/_/g, ' ')}`);
      fetchAll();
    } catch { flash('Failed to update.', 'error'); }
  };

  const handleTicketStatus = async (id, status) => {
    try {
      await api.patch(`tickets/${id}/`, { status });
      flash(`Ticket marked as: ${status.replace(/_/g, ' ')}`);
      fetchAll();
    } catch { flash('Failed to update ticket.', 'error'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <Notification msg={msg} type={msgType} />

      {/* ── INSTALLATION PROJECTS ── */}
      <section>
        <SectionHeader icon="🔧" title="My Installation Projects" />
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {projects.length === 0 ? <EmptyState msg="No installation projects assigned to you." /> :
            projects.map(proj => (
              <div key={proj.id} className="glass-panel animate-fade-in" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', minHeight: '280px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Project #{proj.id}</span>
                  <StatusBadge status={proj.status} styleGetter={getProjectStatusStyle} />
                </div>
                <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{proj.lead_name}</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}><strong>Customer:</strong> {proj.customer_username}</p>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}><strong>Amount:</strong> ${parseFloat(proj.quotation_amount).toLocaleString()}</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', flex: 1 }}>{proj.quotation_items}</p>
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {proj.status === 'SCHEDULED'           && <button onClick={() => handleProjectStatus(proj.id, 'INSTALLATION_STARTED')} className="btn btn-primary" style={{ width: '100%' }}>⚡ Accept &amp; Start Installation</button>}
                  {proj.status === 'INSTALLATION_STARTED'&& <button onClick={() => handleProjectStatus(proj.id, 'WORK_IN_PROGRESS')} className="btn btn-primary" style={{ width: '100%', background: '#3b82f6', borderColor: '#3b82f6' }}>⚙️ Mark as Work in Progress</button>}
                  {proj.status === 'WORK_IN_PROGRESS'    && <button onClick={() => handleProjectStatus(proj.id, 'HALFWAY_COMPLETED')} className="btn btn-primary" style={{ width: '100%', background: '#f59e0b', borderColor: '#f59e0b' }}>🌗 Mark as Halfway Completed</button>}
                  {proj.status === 'HALFWAY_COMPLETED'   && <button onClick={() => handleProjectStatus(proj.id, 'INSTALLATION_COMPLETED')} className="btn btn-primary" style={{ width: '100%', background: '#10b981', borderColor: '#10b981' }}>✅ Mark as Installation Completed</button>}
                  {proj.status === 'INSTALLATION_COMPLETED' && (
                    <button disabled className="btn" style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }}>✓ Installation Finished — Report available in Admin</button>
                  )}
                </div>
              </div>
            ))
          }
        </div>
      </section>

      {/* ── SUPPORT TICKETS ── */}
      <section>
        <SectionHeader icon="🎫" title="Assigned Support Tickets" />
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {tickets.length === 0 ? <EmptyState msg="No support tickets assigned to you." /> :
            tickets.map(t => (
              <div key={t.id} className="glass-panel animate-fade-in" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', minHeight: '200px', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ticket #{t.id}</span>
                  <StatusBadge status={t.status} styleGetter={getTicketStatusStyle} />
                </div>
                <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1rem' }}>{t.subject}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', flex: 1 }}>{t.description}</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}><strong>Customer:</strong> {t.customer_username}</p>
                {t.project_lead_name && <p style={{ fontSize: '0.85rem' }}><strong>Project:</strong> {t.project_lead_name}</p>}
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                  {t.status === 'ASSIGNED' && (
                    <button onClick={() => handleTicketStatus(t.id, 'IN_PROGRESS')} className="btn btn-primary" style={{ flex: 1, background: '#f59e0b', borderColor: '#f59e0b' }}>
                      ▶ Mark In Progress
                    </button>
                  )}
                  {t.status === 'IN_PROGRESS' && (
                    <button onClick={() => handleTicketStatus(t.id, 'RESOLVED')} className="btn btn-primary" style={{ flex: 1, background: '#3b82f6', borderColor: '#3b82f6' }}>
                      ✔ Mark as Resolved
                    </button>
                  )}
                  {(t.status === 'RESOLVED' || t.status === 'SUCCESSFULLY_RESOLVED') && (
                    <button disabled className="btn" style={{ flex: 1, opacity: 0.6, cursor: 'not-allowed' }}>
                      {t.status === 'SUCCESSFULLY_RESOLVED' ? '✓ Successfully Resolved' : '⏳ Awaiting Customer Care'}
                    </button>
                  )}
                </div>
              </div>
            ))
          }
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER CARE DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function CustomerCareDashboard() {
  const { api } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [msg, setMsg] = useState(''); const [msgType, setMsgType] = useState('success');

  const flash = (text, type = 'success') => { setMsgType(type); setMsg(text); setTimeout(() => setMsg(''), 5000); };

  const fetchTickets = useCallback(async () => {
    try {
      const res = await api.get('tickets/');
      setTickets(res.data);
    } catch (e) { console.error(e); }
  }, [api]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleAssignTechnician = async (ticketId, technicianId) => {
    if (!technicianId) return;
    try {
      await api.patch(`tickets/${ticketId}/`, { assigned_technician: technicianId, status: 'ASSIGNED' });
      flash('Ticket assigned to technician!');
      fetchTickets();
    } catch { flash('Failed to assign technician.', 'error'); }
  };

  const handleCloseTicket = async (ticketId) => {
    try {
      await api.patch(`tickets/${ticketId}/`, { status: 'SUCCESSFULLY_RESOLVED' });
      flash('Ticket closed as Successfully Resolved!');
      fetchTickets();
    } catch { flash('Failed to close ticket.', 'error'); }
  };

  const open    = tickets.filter(t => ['OPEN'].includes(t.status));
  const active  = tickets.filter(t => ['ASSIGNED', 'IN_PROGRESS'].includes(t.status));
  const resolved= tickets.filter(t => ['RESOLVED', 'SUCCESSFULLY_RESOLVED'].includes(t.status));

  const TicketCard = ({ t }) => (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ticket #{t.id}</span>
        <StatusBadge status={t.status} styleGetter={getTicketStatusStyle} />
      </div>
      <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0 }}>{t.subject}</h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>{t.description}</p>

      <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <p style={{ fontSize: '0.85rem', margin: 0 }}><strong>👤 Customer:</strong> {t.customer_username} ({t.customer_email})</p>
        {t.project_lead_name && <p style={{ fontSize: '0.85rem', margin: 0 }}><strong>🏗 Project:</strong> {t.project_lead_name}</p>}
        {t.project_quotation_items && <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-muted)' }}><strong>System:</strong> {t.project_quotation_items}</p>}
        {t.project_technician_username && <p style={{ fontSize: '0.85rem', margin: 0 }}><strong>🔧 Installer:</strong> {t.project_technician_username}</p>}
        {t.assigned_technician_username && <p style={{ fontSize: '0.85rem', margin: 0 }}><strong>📌 Assigned To:</strong> {t.assigned_technician_username}</p>}
      </div>

      {/* Assign to technician (only if has a project technician and ticket is OPEN) */}
      {t.status === 'OPEN' && t.project_technician_id && (
        <button
          onClick={() => handleAssignTechnician(t.id, t.project_technician_id)}
          className="btn btn-primary"
          style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.9rem' }}
        >
          📌 Assign to {t.project_technician_username}
        </button>
      )}

      {/* Close ticket if technician has resolved it */}
      {t.status === 'RESOLVED' && (
        <button
          onClick={() => handleCloseTicket(t.id)}
          className="btn btn-primary"
          style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.9rem', background: '#10b981', borderColor: '#10b981' }}
        >
          ✅ Close as Successfully Resolved
        </button>
      )}

      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
        {new Date(t.created_at).toLocaleString()}
      </p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <Notification msg={msg} type={msgType} />

      {/* Summary stats */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Open', count: open.length, color: '#f87171' },
          { label: 'In Progress', count: active.length, color: '#fbbf24' },
          { label: 'Resolved', count: resolved.length, color: '#10b981' },
          { label: 'Total', count: tickets.length, color: 'var(--primary)' },
        ].map(s => (
          <div key={s.label} className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: s.color }}>{s.count}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Open tickets */}
      <section>
        <SectionHeader icon="🔴" title={`Open Tickets (${open.length})`} />
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {open.length === 0 ? <EmptyState msg="No open tickets." /> : open.map(t => <TicketCard key={t.id} t={t} />)}
        </div>
      </section>

      {/* Active tickets */}
      <section>
        <SectionHeader icon="🟡" title={`Active Tickets (${active.length})`} />
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {active.length === 0 ? <EmptyState msg="No active tickets." /> : active.map(t => <TicketCard key={t.id} t={t} />)}
        </div>
      </section>

      {/* Resolved tickets */}
      <section>
        <SectionHeader icon="🟢" title={`Resolved Tickets (${resolved.length})`} />
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {resolved.length === 0 ? <EmptyState msg="No resolved tickets." /> : resolved.map(t => <TicketCard key={t.id} t={t} />)}
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function AdminDashboard() {
  const { api } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats]       = useState({ leads: 0, quotations: 0, projects: 0, tickets: 0, invoices: 0 });
  const [leads, setLeads]       = useState([]);
  const [projects, setProjects] = useState([]);

  // Reports tab state
  const [activeTab, setActiveTab]         = useState('overview');
  const [searchQuery, setSearchQuery]     = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo]     = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lr, qr, pr, tr, ir] = await Promise.all([
          api.get('leads/'), api.get('quotations/'), api.get('projects/'),
          api.get('tickets/'), api.get('invoices/')
        ]);
        setStats({ leads: lr.data.length, quotations: qr.data.length, projects: pr.data.length, tickets: tr.data.length, invoices: ir.data.length });
        setLeads(lr.data);
        setProjects(pr.data);
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, [api]);

  // Filter logic for reports tab
  const completedProjects = projects.filter(p => p.status === 'INSTALLATION_COMPLETED');
  const filteredReports = completedProjects.filter(proj => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      proj.lead_name?.toLowerCase().includes(q) ||
      proj.customer_username?.toLowerCase().includes(q) ||
      proj.technician_username?.toLowerCase().includes(q) ||
      String(proj.id).includes(q);
    const created = new Date(proj.created_at);
    const matchFrom = !filterDateFrom || created >= new Date(filterDateFrom);
    const matchTo   = !filterDateTo   || created <= new Date(filterDateTo + 'T23:59:59');
    return matchSearch && matchFrom && matchTo;
  });

  const tabStyle = (tab) => ({
    padding: '10px 24px',
    borderRadius: 'var(--radius-md)',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    fontSize: '0.95rem',
    transition: 'var(--transition)',
    background: activeTab === tab ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'rgba(255,255,255,0.05)',
    color: activeTab === tab ? '#111' : 'var(--text-muted)',
    boxShadow: activeTab === tab ? '0 4px 15px rgba(255,177,0,0.3)' : 'none',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── Tab switcher ── */}
      <div style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', width: 'fit-content' }}>
        <button onClick={() => setActiveTab('overview')} style={tabStyle('overview')}>📊 System Overview</button>
        <button onClick={() => setActiveTab('reports')}  style={tabStyle('reports')}>
          📄 Completion Reports
          {completedProjects.length > 0 && (
            <span style={{ marginLeft: '8px', background: 'rgba(16,185,129,0.25)', color: '#10b981', borderRadius: '99px', padding: '1px 8px', fontSize: '0.75rem', fontWeight: '800' }}>
              {completedProjects.length}
            </span>
          )}
        </button>
      </div>

      {/* ═══════════════════════ OVERVIEW TAB ═══════════════════════ */}
      {activeTab === 'overview' && (
        <>
          {/* Stats grid */}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            {[
              { key: 'leads',      label: 'Total Leads',    icon: '📝', color: '#818cf8' },
              { key: 'quotations', label: 'Quotations',     icon: '📋', color: '#fbbf24' },
              { key: 'projects',   label: 'Projects',       icon: '☀️', color: '#60a5fa' },
              { key: 'tickets',    label: 'Support Tickets',icon: '🎫', color: '#f87171' },
              { key: 'invoices',   label: 'Invoices',       icon: '🧾', color: '#10b981' },
            ].map(s => (
              <div key={s.key} className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                <div style={{ fontSize: '2.2rem', fontWeight: '800', color: s.color, lineHeight: 1 }}>{stats[s.key]}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Recent leads table */}
          <div className="glass-panel" style={{ padding: '1.75rem', overflowX: 'auto' }}>
            <h2 style={{ marginBottom: '1.25rem' }}>📝 Recent Leads</h2>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['#', 'Name', 'Email', 'Status', 'Assigned To'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 10).map(lead => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>#{lead.id}</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '600' }}>{lead.name}</td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{lead.email}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <StatusBadge status={lead.status} styleGetter={(s) => ({
                        bg: s === 'PENDING' ? 'rgba(239,68,68,0.15)' : s === 'CONVERTED' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                        color: s === 'PENDING' ? '#f87171' : s === 'CONVERTED' ? '#10b981' : '#fbbf24',
                        border: s === 'PENDING' ? 'rgba(239,68,68,0.3)' : s === 'CONVERTED' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)',
                        label: s
                      })} />
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{lead.assigned_sales_exec || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {leads.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>No leads found.</p>}
          </div>
        </>
      )}

      {/* ═══════════════════════ REPORTS TAB ═══════════════════════ */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ margin: 0 }}>📄 Project Completion Reports</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                View and download detailed reports for all completed installation projects.
              </p>
            </div>
            <div style={{
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 'var(--radius-md)', padding: '0.75rem 1.25rem', textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981' }}>{completedProjects.length}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Completed Projects</div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 240px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.4rem' }}>
                  🔍 Search
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Search by project ID, customer, technician, or lead..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ margin: 0 }}
                />
              </div>
              <div style={{ flex: '0 1 180px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.4rem' }}>
                  📅 From Date
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={filterDateFrom}
                  onChange={e => setFilterDateFrom(e.target.value)}
                  style={{ margin: 0 }}
                />
              </div>
              <div style={{ flex: '0 1 180px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.4rem' }}>
                  📅 To Date
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={filterDateTo}
                  onChange={e => setFilterDateTo(e.target.value)}
                  style={{ margin: 0 }}
                />
              </div>
              {(searchQuery || filterDateFrom || filterDateTo) && (
                <button
                  onClick={() => { setSearchQuery(''); setFilterDateFrom(''); setFilterDateTo(''); }}
                  className="btn btn-secondary"
                  style={{ padding: '10px 16px', fontSize: '0.85rem', alignSelf: 'flex-end' }}
                >
                  ✕ Clear Filters
                </button>
              )}
            </div>
            <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing <strong style={{ color: 'var(--text-main)' }}>{filteredReports.length}</strong> of {completedProjects.length} completed project{completedProjects.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Reports Table */}
          {completedProjects.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <h3 style={{ color: 'var(--text-muted)' }}>No completed projects yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Reports will appear here once a technician marks an installation as completed.</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔎</div>
              <h3 style={{ color: 'var(--text-muted)' }}>No results found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Try adjusting your search or date filter.</p>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '0', overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                    {['Project', 'Customer', 'Lead / System', 'Technician', 'Invoice Amount', 'Completed On', 'Report'].map(h => (
                      <th key={h} style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map(proj => (
                    <tr
                      key={proj.id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,177,0,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '1rem' }}>#{proj.id}</div>
                        <StatusBadge status={proj.status} styleGetter={getProjectStatusStyle} />
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: '600' }}>{proj.customer_username}</div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', maxWidth: '220px' }}>
                        <div style={{ fontWeight: '600', marginBottom: '0.15rem' }}>{proj.lead_name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                          {proj.quotation_items}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: '600' }}>
                        {proj.technician_username || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: '700', color: '#10b981', fontSize: '1rem' }}>
                          ${parseFloat(proj.quotation_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(proj.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <button
                          onClick={() => navigate(`/report/${proj.id}`)}
                          className="btn btn-primary"
                          style={{ padding: '8px 18px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
                        >
                          📄 View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}



