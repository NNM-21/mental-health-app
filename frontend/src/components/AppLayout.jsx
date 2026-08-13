import Navbar from './Navbar';

export default function AppLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '32px 24px 64px' }}>
        {children}
      </main>
    </div>
  );
}
