import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Home' },
  { to: '/resources', label: 'Resources' },
  { to: '/assessments', label: 'Self-Assessment' },
  { to: '/forum', label: 'Community' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(248, 250, 248, 0.92)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          to="/dashboard"
          style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: '18px', color: 'var(--teal)' }}
        >
          MindSpace
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          {NAV_LINKS.map((link) => {
            const active = location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  fontSize: '14.5px',
                  fontWeight: 600,
                  color: active ? 'var(--teal)' : 'var(--text-secondary)',
                  paddingBottom: '2px',
                  borderBottom: active ? '2px solid var(--teal)' : '2px solid transparent',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link
            to="/emergency"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--emergency)',
              background: 'var(--emergency-bg)',
              borderRadius: '8px',
              padding: '7px 12px',
            }}
          >
            <Phone size={13} /> Emergency
          </Link>
          <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            {user?.name?.split(' ')[0]} · <span style={{ color: 'var(--teal)', fontWeight: 600 }}>{user?.role}</span>
          </span>
          <button
            onClick={handleLogout}
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--teal)',
              background: 'var(--sage-light)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              cursor: 'pointer',
            }}
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
