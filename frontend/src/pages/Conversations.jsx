import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import { listMySessions } from '../services/chatService';

export default function Conversations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listMySessions()
      .then((data) => {
        if (!cancelled) setSessions(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load your conversations right now.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppLayout>
      <Link
        to="/professionals"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13.5px',
          color: 'var(--text-secondary)',
          marginBottom: '20px',
        }}
      >
        <ArrowLeft size={15} /> Back to Professionals
      </Link>

      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>My conversations</h1>

      {error && <Card style={{ padding: '20px', color: 'var(--emergency)' }}>{error}</Card>}

      {!sessions && !error && <Card style={{ padding: '32px', opacity: 0.5, height: '100px' }} />}

      {sessions && sessions.length === 0 && (
        <Card style={{ padding: '36px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            No conversations yet.
          </p>
          <Link to="/professionals" style={{ color: 'var(--teal)', fontWeight: 600, fontSize: '14px' }}>
            Talk to a professional
          </Link>
        </Card>
      )}

      <div style={{ display: 'grid', gap: '10px' }}>
        {sessions?.map((s) => {
          const otherName = user?.id === s.patient_id ? s.expert_name : s.patient_name;
          return (
            <Card
              key={s.id}
              style={{ padding: '18px 22px', cursor: 'pointer' }}
              onClick={() => navigate(`/chat/${s.id}`, { state: { otherName } })}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: 'var(--sage-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MessageCircle size={17} color="var(--teal)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14.5px' }}>{otherName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Started {new Date(s.started_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                {!s.ended_at ? (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--teal)',
                      background: 'var(--sage-light)',
                      padding: '4px 10px',
                      borderRadius: '999px',
                    }}
                  >
                    Active
                  </span>
                ) : (
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Ended
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
}
