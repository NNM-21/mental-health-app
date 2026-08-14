import { Link } from 'react-router-dom';
import { MessageCircle, Brain, BookOpen, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';

function QuickAction({ to, icon, title, subtitle }) {
  return (
    <Link to={to}>
      <Card
        style={{
          padding: '24px',
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
          {icon}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>{title}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{subtitle}</div>
        </div>
      </Card>
    </Link>
  );
}

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

      <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', maxWidth: '700px' }}>
        <QuickAction
          to="/assessments"
          icon={<Brain size={20} color="var(--teal)" />}
          title="Take a Self-Assessment"
          subtitle="GAD-7 or PHQ-9 screening"
        />
        <QuickAction
          to="/resources"
          icon={<BookOpen size={20} color="var(--teal)" />}
          title="Explore Resources"
          subtitle="Curated articles &amp; videos"
        />
        <QuickAction
          to="/forum"
          icon={<MessageCircle size={20} color="var(--teal)" />}
          title="Ask the Community"
          subtitle="Browse Q&amp;A or ask your own question"
        />
        <QuickAction
          to="/professionals"
          icon={<Stethoscope size={20} color="var(--teal)" />}
          title="Talk to a Professional"
          subtitle="Chat with a responder or doctor"
        />
      </div>
    </AppLayout>
  );
}

