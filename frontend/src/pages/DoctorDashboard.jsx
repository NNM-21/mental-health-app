import { useEffect, useState } from 'react';
import { BarChart3, MessageSquare, ClipboardList } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import { getForumAnalytics, getChatAnalytics, getScoreAnalytics } from '../services/analyticsService';

export default function DoctorDashboard() {
  const [forum, setForum] = useState(null);
  const [chat, setChat] = useState(null);
  const [scores, setScores] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getForumAnalytics().then(setForum).catch(() => setError('Could not load forum analytics.'));
    getChatAnalytics().then(setChat).catch(() => setError('Could not load chat analytics.'));
    getScoreAnalytics().then(setScores).catch(() => setError('Could not load score analytics.'));
  }, []);

  return (
    <AppLayout>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>
          Analytics Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Aggregated, anonymized activity across the platform — no patient names or
          message content are ever included here.
        </p>
      </div>

      {error && (
        <Card style={{ padding: '18px 20px', color: 'var(--emergency)', marginBottom: '20px' }}>
          {error}
        </Card>
      )}

      <SectionHeader icon={<BarChart3 size={17} />} title="Community Forum" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '32px' }}>
        <StatCard label="Total posts" value={forum?.posts?.total_posts} />
        <StatCard label="Flagged posts" value={forum?.posts?.flagged_posts} />
        <StatCard label="AI-flagged crisis" value={forum?.posts?.ai_flagged_crisis} />
        <StatCard label="AI-flagged harmful" value={forum?.posts?.ai_flagged_harmful} />
        {forum?.responsesByStatus?.map((r) => (
          <StatCard key={r.status} label={`Responses: ${r.status}`} value={r.count} />
        ))}
      </div>

      <SectionHeader icon={<MessageSquare size={17} />} title="Expert Chat" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '32px' }}>
        <StatCard label="Total sessions" value={chat?.sessions?.total_sessions} />
        <StatCard label="Active sessions" value={chat?.sessions?.active_sessions} />
        <StatCard label="Ended sessions" value={chat?.sessions?.ended_sessions} />
        <StatCard label="Total messages" value={chat?.messages?.total_messages} />
        <StatCard label="Avg msgs / session" value={chat?.messages?.avg_messages_per_session} />
      </div>

      <SectionHeader icon={<ClipboardList size={17} />} title="Self-Assessment Scores" />
      <div style={{ display: 'grid', gap: '14px' }}>
        {scores?.map((s) => (
          <Card key={s.type} style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: '15px' }}>{s.title} ({s.type})</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {s.total_submissions} submissions
              </p>
            </div>
            <div style={{ display: 'flex', gap: '20px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              <span>Avg: <strong style={{ color: 'var(--teal)' }}>{s.average_score ?? '—'}</strong></span>
              <span>Min: {s.min_score ?? '—'}</span>
              <span>Max: {s.max_score ?? '—'}</span>
            </div>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--teal)' }}>
      {icon}
      <h2 style={{ fontSize: '17px', fontWeight: 700 }}>{title}</h2>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <Card style={{ padding: '16px 18px' }}>
      <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--teal)', marginBottom: '4px' }}>
        {value ?? '—'}
      </div>
      <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{label}</div>
    </Card>
  );
}
