import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// ─── Status helpers ─────────────────────────────────────────────────────────

const PROJECT_STATUS_LABELS = {
  SCHEDULED: 'Scheduled',
  INSTALLATION_STARTED: 'Installation Started',
  WORK_IN_PROGRESS: 'Work in Progress',
  HALFWAY_COMPLETED: 'Halfway Completed',
  INSTALLATION_COMPLETED: 'Installation Completed',
};

const TICKET_STATUS_LABELS = {
  OPEN: 'Open',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  SUCCESSFULLY_RESOLVED: 'Successfully Resolved',
};

const TICKET_STATUS_COLORS = {
  OPEN: '#f87171',
  ASSIGNED: '#818cf8',
  IN_PROGRESS: '#fbbf24',
  RESOLVED: '#60a5fa',
  SUCCESSFULLY_RESOLVED: '#10b981',
};

// ─── Print CSS injected at runtime ───────────────────────────────────────────
const PRINT_STYLE = `
@media print {
  body { background: white !important; color: black !important; }
  .no-print { display: none !important; }
  .report-root { background: white !important; padding: 0 !important; }
  .report-card {
    background: white !important;
    border: 1px solid #e2e8f0 !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    break-inside: avoid;
  }
  .report-header { background: #FFB100 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .section-title { color: #0f172a !important; border-color: #cbd5e1 !important; }
  .data-value { color: #0f172a !important; }
  .data-label { color: #64748b !important; }
  .badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProjectReport() {
  const { projectId } = useParams();
  const { api } = useContext(AuthContext);
  const navigate = useNavigate();
  const printRef = useRef();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Inject print styles
    const style = document.createElement('style');
    style.innerHTML = PRINT_STYLE;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`projects/${projectId}/report/`);
        setReport(res.data);
      } catch (err) {
        setError('Failed to load project report. The project may not be completed yet.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [api, projectId]);

  const handlePrint = () => window.print();

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '48px', height: '48px', border: '4px solid rgba(255,177,0,0.2)', borderTopColor: '#FFB100', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: 'var(--text-muted)' }}>Generating report...</p>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem', padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem' }}>⚠️</div>
      <h2 style={{ color: 'var(--danger)' }}>Report Unavailable</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '420px' }}>{error}</p>
      <button onClick={() => navigate('/dashboard')} className="btn btn-primary">← Back to Dashboard</button>
    </div>
  );

  const { project, customer, lead, quotation, sales_executive, technician, invoice, tickets } = report;
  const generatedAt = new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });
  const projectDate = project?.created_at ? new Date(project.created_at).toLocaleDateString('en-US', { dateStyle: 'long' }) : '—';

  return (
    <div className="report-root" style={{ minHeight: '100vh', background: 'var(--background)', padding: '2rem 1rem' }}>

      {/* ── Action Bar (no-print) ── */}
      <div className="no-print" style={{ maxWidth: '900px', margin: '0 auto 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ padding: '10px 20px' }}>
          ← Dashboard
        </button>
        <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🖨️ Print / Save PDF
        </button>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginLeft: 'auto' }}>
          Generated: {generatedAt}
        </span>
      </div>

      {/* ── Report Document ── */}
      <div ref={printRef} style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── HEADER ── */}
        <div className="report-header" style={{
          background: 'linear-gradient(135deg, #FFB100, #E09C00)',
          borderRadius: '20px',
          padding: '2.5rem',
          color: '#111',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background sun motif */}
          <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', right: '20px', top: '20px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />

          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '2px', opacity: 0.7, marginBottom: '0.5rem' }}>
                  SOLAR ERP SYSTEM
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 0.25rem', color: '#111' }}>
                  Project Completion Report
                </h1>
                <p style={{ fontSize: '1rem', opacity: 0.75, margin: 0 }}>
                  Project #{project.id} &nbsp;·&nbsp; {lead?.name || customer?.username}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(0,0,0,0.15)', borderRadius: '999px', padding: '6px 14px',
                  fontSize: '0.85rem', fontWeight: '700'
                }}>
                  ✅ INSTALLATION COMPLETED
                </div>
                <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.5rem' }}>Initiated: {projectDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── GRID: Customer + Lead ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>

          {/* Customer Details */}
          <ReportCard icon="👤" title="Customer Details">
            <DataRow label="Full Name" value={[customer?.first_name, customer?.last_name].filter(Boolean).join(' ') || customer?.username} />
            <DataRow label="Username" value={customer?.username} />
            <DataRow label="Email" value={customer?.email} />
          </ReportCard>

          {/* Lead Information */}
          <ReportCard icon="📝" title="Lead Information">
            <DataRow label="Lead ID" value={`#${lead?.id}`} />
            <DataRow label="Name" value={lead?.name} />
            <DataRow label="Email" value={lead?.email} />
            <DataRow label="Phone" value={lead?.phone} />
            <DataRow label="Interest" value={lead?.interest_details} wrap />
            <DataRow label="Lead Status" value={
              <span className="badge" style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: '700', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
                {lead?.status}
              </span>
            } />
          </ReportCard>
        </div>

        {/* ── GRID: Sales Exec + Technician ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>

          <ReportCard icon="💼" title="Sales Executive">
            <DataRow label="Name" value={[sales_executive?.first_name, sales_executive?.last_name].filter(Boolean).join(' ') || sales_executive?.username} />
            <DataRow label="Username" value={sales_executive?.username} />
            <DataRow label="Email" value={sales_executive?.email} />
          </ReportCard>

          <ReportCard icon="🔧" title="Assigned Technician">
            <DataRow label="Name" value={[technician?.first_name, technician?.last_name].filter(Boolean).join(' ') || technician?.username} />
            <DataRow label="Username" value={technician?.username} />
            <DataRow label="Email" value={technician?.email} />
          </ReportCard>
        </div>

        {/* ── Quotation Details ── */}
        <ReportCard icon="📋" title="Quotation Details">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
            <DataRow label="Quotation ID" value={`#${quotation?.id}`} />
            <DataRow label="Status" value={
              <span className="badge" style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: '700', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
                {quotation?.status}
              </span>
            } />
            <DataRow label="Total Amount" value={
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>
                ${parseFloat(quotation?.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            } />
          </div>
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '10px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>System / Items Description</p>
            <p style={{ color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{quotation?.items_description}</p>
          </div>
        </ReportCard>

        {/* ── Installation Status Timeline ── */}
        <ReportCard icon="📅" title="Installation Timeline">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <DataRow label="Project Created" value={new Date(project?.created_at).toLocaleString()} />
            <DataRow label="Final Status" value={
              <span className="badge" style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: '700', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
                ✅ {PROJECT_STATUS_LABELS[project?.status] || project?.status}
              </span>
            } />
          </div>
          {/* Status progression bar */}
          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Status Progression</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, position: 'relative' }}>
              {[
                { key: 'SCHEDULED', label: 'Scheduled', icon: '📆' },
                { key: 'INSTALLATION_STARTED', label: 'Started', icon: '⚡' },
                { key: 'WORK_IN_PROGRESS', label: 'In Progress', icon: '⚙️' },
                { key: 'HALFWAY_COMPLETED', label: 'Halfway', icon: '🌗' },
                { key: 'INSTALLATION_COMPLETED', label: 'Completed', icon: '✅' },
              ].map((step, i, arr) => {
                const statusOrder = ['SCHEDULED', 'INSTALLATION_STARTED', 'WORK_IN_PROGRESS', 'HALFWAY_COMPLETED', 'INSTALLATION_COMPLETED'];
                const currentIdx = statusOrder.indexOf(project?.status);
                const stepIdx = statusOrder.indexOf(step.key);
                const done = stepIdx <= currentIdx;
                return (
                  <React.Fragment key={step.key}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 0, minWidth: '70px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: done ? 'linear-gradient(135deg, #FFB100, #E09C00)' : 'rgba(255,255,255,0.05)',
                        border: done ? 'none' : '2px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem', transition: 'all 0.3s', flexShrink: 0,
                      }}>{step.icon}</div>
                      <span style={{ fontSize: '0.65rem', color: done ? 'var(--primary)' : 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'center', fontWeight: done ? '700' : '400' }}>
                        {step.label}
                      </span>
                    </div>
                    {i < arr.length - 1 && (
                      <div style={{
                        flex: 1, height: '3px', borderRadius: '2px',
                        background: stepIdx < currentIdx ? 'linear-gradient(90deg, #FFB100, #E09C00)' : 'rgba(255,255,255,0.08)',
                        margin: '0 4px', marginBottom: '18px',
                      }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </ReportCard>

        {/* ── Invoice Details ── */}
        <ReportCard icon="🧾" title="Invoice Details">
          {invoice ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'start' }}>
              <DataRow label="Invoice ID" value={`#${invoice.id}`} />
              <DataRow label="Amount" value={
                <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary)' }}>
                  ${parseFloat(invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              } />
              <DataRow label="Payment Status" value={
                <span className="badge" style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: '700', background: invoice.status === 'PAID' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: invoice.status === 'PAID' ? '#10b981' : '#fbbf24', border: `1px solid ${invoice.status === 'PAID' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                  {invoice.status}
                </span>
              } />
              <DataRow label="Invoice Date" value={new Date(invoice.created_at).toLocaleString()} />
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No invoice generated yet. Invoice will be created once installation is marked as completed.</p>
          )}
        </ReportCard>

        {/* ── Support Ticket History ── */}
        <ReportCard icon="🎫" title={`Support Ticket History (${tickets?.length || 0} ticket${tickets?.length !== 1 ? 's' : ''})`}>
          {!tickets || tickets.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '1.5rem' }}>✨</span>
              <p style={{ fontStyle: 'italic' }}>No support tickets raised for this project. Excellent installation!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tickets.map((t, idx) => (
                <div key={t.id} style={{
                  padding: '1.25rem',
                  borderRadius: '10px',
                  background: 'rgba(0,0,0,0.15)',
                  border: `1px solid ${TICKET_STATUS_COLORS[t.status] ? TICKET_STATUS_COLORS[t.status] + '30' : 'rgba(255,255,255,0.08)'}`,
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginRight: '0.5rem' }}>#{idx + 1}</span>
                      {t.subject}
                    </h4>
                    <span className="badge" style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: '700', background: TICKET_STATUS_COLORS[t.status] + '20', color: TICKET_STATUS_COLORS[t.status], border: `1px solid ${TICKET_STATUS_COLORS[t.status]}50` }}>
                      {TICKET_STATUS_LABELS[t.status] || t.status}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{t.description}</p>
                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {t.assigned_technician && <span>🔧 Assigned to: <strong style={{ color: 'var(--text-main)' }}>{t.assigned_technician}</strong></span>}
                    <span>📅 Created: {new Date(t.created_at).toLocaleDateString()}</span>
                    <span>🔄 Updated: {new Date(t.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ReportCard>

        {/* ── Footer ── */}
        <div style={{ padding: '1.5rem 2rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>This report is auto-generated by the Solar ERP System.</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Report generated on {generatedAt}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '1.5rem' }}>☀️</span>
            <span style={{ fontWeight: '800', color: 'var(--primary)', letterSpacing: '1px' }}>SOLAR ERP</span>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ReportCard({ icon, title, children }) {
  return (
    <div className="report-card" style={{
      background: 'rgba(30,41,59,0.7)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px',
      padding: '1.75rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    }}>
      <h3 className="section-title" style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        fontSize: '1rem', fontWeight: '700',
        marginBottom: '1.25rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        color: 'var(--text-main)'
      }}>
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

function DataRow({ label, value, wrap }) {
  return (
    <div style={{ marginBottom: '0.6rem' }}>
      <p className="data-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.2rem' }}>
        {label}
      </p>
      {typeof value === 'string' || typeof value === 'number' ? (
        <p className="data-value" style={{ fontSize: '0.95rem', color: 'var(--text-main)', wordBreak: wrap ? 'break-word' : 'normal' }}>
          {value || '—'}
        </p>
      ) : (
        <div className="data-value">{value || <span style={{ color: 'var(--text-muted)' }}>—</span>}</div>
      )}
    </div>
  );
}
