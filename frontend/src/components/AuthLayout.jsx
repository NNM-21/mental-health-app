export default function AuthLayout({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr',
        background: 'var(--bg)',
      }}
      className="auth-layout"
    >
      <style>{`
        @media (min-width: 900px) {
          .auth-layout { grid-template-columns: 1fr 1fr !important; }
          .auth-brand-panel { display: flex !important; }
        }
      `}</style>

      {/* Brand panel — hidden on mobile, shown on desktop */}
      <div
        className="auth-brand-panel"
        style={{
          display: 'none',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(160deg, var(--teal) 0%, #1b6478 100%)',
          padding: '56px',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '380px',
            height: '380px',
            borderRadius: '50%',
            background: 'var(--lavender)',
            opacity: 0.15,
            filter: 'blur(60px)',
            top: '-100px',
            right: '-100px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'var(--sage)',
            opacity: 0.18,
            filter: 'blur(60px)',
            bottom: '-80px',
            left: '-60px',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: '20px' }}>
            MindSpace
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '420px' }}>
          <h1
            style={{
              fontFamily: 'Manrope',
              fontWeight: 700,
              fontSize: 'clamp(28px, 3vw, 36px)',
              lineHeight: 1.25,
              marginBottom: '16px',
            }}
          >
            Your space to understand, heal and grow.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px' }}>
            Trusted resources, self-assessments, community support, and
            access to professionals — all in one calm place.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1, fontSize: '12.5px', color: 'rgba(255,255,255,0.6)' }}>
          © 2026 MindSpace
        </div>
      </div>

      {/* Form panel */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>{children}</div>
      </div>
    </div>
  );
}
