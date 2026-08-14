import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, MessageSquare, History } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import { listExperts, startSession } from '../services/chatService';

const ROLE_LABEL = {
  doctor: 'Doctor',
  responder: 'Trained Responder',
};

export default function Professionals() {
  const navigate = useNavigate();
  const [experts, setExperts] = useState(null);
  const [error, setError] = useState(null);
  const [startingId, setStartingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listExperts()
      .then((data) => {
        if (!cancelled) setExperts(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load available professionals right now.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleStart = async (expertId) => {
    setStartingId(expertId);
    try {
      const session = await startSession(expertId);
      navigate(`/chat/${session.id}`, { state: { otherName: experts.find((x) => x.id === expertId)?.name } });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not start a conversation right now.');
      setStartingId(null);
    }
  };

  return (
    <AppLayout>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '10px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>
            Talk to a Professional
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '520px' }}>
            Connect one-on-one with a trained responder or doctor.
          </p>
        </div>
        <Link
          to="/conversations"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13.5px',
            fontWeight: 600,
            color: 'var(--teal)',
          }}
        >
          <History size={16} /> My conversations
        </Link>
      </div>

      {error && <Card style={{ padding: '20px', color: 'var(--emergency)', marginTop: '16px' }}>{error}</Card>}

      {!experts && !error && (
        <div style={{ display: 'grid', gap: '14px', marginTop: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {[1, 2, 3].map((i) => (
            <Card key={i} style={{ padding: '22px', opacity: 0.5, height: '140px' }} />
          ))}
        </div>
      )}

      {experts && experts.length === 0 && (
        <Card style={{ padding: '36px', textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)' }}>
          No professionals are available right now. Please check back soon, or use the Community forum
          or Emergency Help if you need support sooner.
        </Card>
      )}

      <div style={{ display: 'grid', gap: '14px', marginTop: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {experts?.map((e) => (
          <Card key={e.id} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'var(--sage-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Stethoscope size={20} color="var(--teal)" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>{e.name}</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  {ROLE_LABEL[e.role] || e.role}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleStart(e.id)}
              disabled={startingId === e.id}
              style={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--teal)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '13.5px',
                cursor: startingId === e.id ? 'not-allowed' : 'pointer',
                opacity: startingId === e.id ? 0.7 : 1,
              }}
            >
              <MessageSquare size={15} />
              {startingId === e.id ? 'Starting…' : 'Start Conversation'}
            </button>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
