import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>
        Welcome back, {user?.name?.split(' ')[0]} 👋
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>
        Logged in as <strong>{user?.role}</strong>.
      </p>

      <Link to="/forum">
        <Card
          style={{
            padding: '24px',
            maxWidth: '340px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            transition: 'transform .15s ease, box-shadow .15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-card)';
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'var(--sage-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <MessageCircle size={20} color="var(--teal)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>
              Ask the Community
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Browse Q&amp;A or ask your own question
            </div>
          </div>
        </Card>
      </Link>
    </AppLayout>
  );
}
