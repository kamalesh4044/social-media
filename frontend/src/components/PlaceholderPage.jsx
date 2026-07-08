export default function PlaceholderPage({ title, description }) {
  return (
    <div className="animate-slide-up" style={{ width: '100%', maxWidth: '600px', margin: '40px auto' }}>
      <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '16px', background: 'linear-gradient(to right, #3b82f6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2.5rem' }}>
          {title}
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
          {description}
        </p>
        <div style={{ marginTop: '40px', padding: '20px', border: '1px dashed var(--border-glass)', borderRadius: '12px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            This page is interactive in the sidebar, but the content is under construction in Phase 3.
          </p>
        </div>
      </div>
    </div>
  );
}
