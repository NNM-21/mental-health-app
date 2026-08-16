import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Trash2, ShieldCheck, HeartPulse } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import {
  getPendingResponses,
  approveResponse,
  rejectResponse,
  getPendingFlags,
  reviewFlag,
} from '../services/forumService';
import { getPendingCheckinAlerts, reviewCheckinAlert } from '../services/checkinService';
import { timeAgo } from '../lib/timeAgo';

export default function ModeratorDashboard() {
  const [tab, setTab] = useState('responses'); // 'responses' | 'flags' | 'checkins'

  const [responses, setResponses] = useState(null);
  const [flags, setFlags] = useState(null);
  const [checkinAlerts, setCheckinAlerts] = useState(null);
  const [error, setError] = useState(null);
  const [actingId, setActingId] = useState(null);

  const loadAll = () => {
    setError(null);
    getPendingResponses()
      .then(setResponses)
      .catch(() => setError('Could not load the response queue right now.'));
    getPendingFlags()
      .then(setFlags)
      .catch(() => setError('Could not load the flag queue right now.'));
    getPendingCheckinAlerts()
      .then(setCheckinAlerts)
      .catch(() => setError('Could not load wellness check-in alerts right now.'));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleResponseAction = async (id, action) => {
    setActingId(id);
    try {
      if (action === 'approve') await approveResponse(id);
      else await rejectResponse(id);
      setResponses((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError(`Could not ${action} that response. Please try again.`);
    } finally {
      setActingId(null);
    }
  };

  const handleFlagAction = async (id, deletePost) => {
    setActingId(id);
    try {
      await reviewFlag(id, { deletePost });
      setFlags((prev) => prev.filter((f) => f.id !== id));
    } catch {
      setError('Could not review that flag. Please try again.');
    } finally {
      setActingId(null);
    }
  };

  const handleCheckinReview = async (id) => {
    setActingId(id);
    try {
      await reviewCheckinAlert(id);
      setCheckinAlerts((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError('Could not mark that check-in reviewed. Please try again.');
    } finally {
      setActingId(null);
    }
  };

  const responseCount = responses?.length ?? '–';
  const flagCount = flags?.length ?? '–';
  const checkinCount = checkinAlerts?.length ?? '–';

  return (
    <AppLayout>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>
          Moderator Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Review responder drafts, act on flagged content, and follow up on wellness check-in alerts.
        </p>
      </div>

      {error && (
        <Card style={{ padding: '18px 20px', color: 'var(--emergency)', marginBottom: '20px' }}>
          {error}
        </Card>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '22px' }}>
        <TabButton active={tab === 'responses'} onClick={() => setTab('responses')}>
          Pending Responses ({responseCount})
        </TabButton>
        <TabButton active={tab === 'flags'} onClick={() => setTab('flags')}>
          Flagged Content ({flagCount})
        </TabButton>
        <TabButton active={tab === 'checkins'} onClick={() => setTab('checkins')}>
          Wellness Alerts ({checkinCount})
        </TabButton>
      </div>

      {tab === 'responses' && (
        <div style={{ display: 'grid', gap: '14px' }}>
          {responses === null && !error && <SkeletonCards />}
          {responses?.length === 0 && (
            <Card style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={22} style={{ marginBottom: '8px', color: 'var(--sage)' }} />
              <p>No draft responses waiting on review.</p>
            </Card>
          )}
          {responses?.map((r) => (
            <Card key={r.id} style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Re: {r.post_title}
                </span>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{timeAgo(r.created_at)}</span>
              </div>
              <p style={{ fontSize: '14.5px', marginBottom: '6px' }}>{r.content}</p>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Drafted by {r.responder_name}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button
                  variant="primary"
                  disabled={actingId === r.id}
                  onClick={() => handleResponseAction(r.id, 'approve')}
                  style={{ width: 'auto', display: 'inline-flex' }}
                >
                  <CheckCircle2 size={16} /> Approve
                </Button>
                <Button
                  variant="secondary"
                  disabled={actingId === r.id}
                  onClick={() => handleResponseAction(r.id, 'reject')}
                  style={{ width: 'auto', display: 'inline-flex' }}
                >
                  <XCircle size={16} /> Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'flags' && (
        <div style={{ display: 'grid', gap: '14px' }}>
          {flags === null && !error && <SkeletonCards />}
          {flags?.length === 0 && (
            <Card style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={22} style={{ marginBottom: '8px', color: 'var(--sage)' }} />
              <p>No flagged posts waiting on review.</p>
            </Card>
          )}
          {flags?.map((f) => (
            <Card key={f.id} style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <AlertTriangle size={15} style={{ color: 'var(--emergency)' }} />
                <span style={{ fontSize: '15px', fontWeight: 700 }}>{f.post_title}</span>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  {timeAgo(f.created_at)}
                </span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {f.post_content}
              </p>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Reported by {f.flagged_by_name}
                {f.reason ? ` · reason: ${f.reason}` : ''}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button
                  variant="secondary"
                  disabled={actingId === f.id}
                  onClick={() => handleFlagAction(f.id, false)}
                  style={{ width: 'auto', display: 'inline-flex' }}
                >
                  <CheckCircle2 size={16} /> Keep Post
                </Button>
                <Button
                  variant="primary"
                  disabled={actingId === f.id}
                  onClick={() => handleFlagAction(f.id, true)}
                  style={{ width: 'auto', display: 'inline-flex', background: 'var(--emergency)' }}
                >
                  <Trash2 size={16} /> Delete Post
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'checkins' && (
        <div style={{ display: 'grid', gap: '14px' }}>
          {checkinAlerts === null && !error && <SkeletonCards />}
          {checkinAlerts?.length === 0 && (
            <Card style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={22} style={{ marginBottom: '8px', color: 'var(--sage)' }} />
              <p>No wellness check-ins need review right now.</p>
            </Card>
          )}
          {checkinAlerts?.map((c) => (
            <Card
              key={c.id}
              style={{ padding: '20px 22px', background: 'var(--emergency-bg)', border: '1px solid var(--emergency)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <HeartPulse size={15} style={{ color: 'var(--emergency)' }} />
                <span style={{ fontSize: '14px', fontWeight: 700 }}>
                  {c.user_name} ({c.user_email})
                </span>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  {timeAgo(c.created_at)}
                </span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                {c.content}
              </p>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                AI classification: {c.ai_classification ?? 'unclassified (AI call failed — needs a closer look)'}
              </p>
              <Button
                variant="primary"
                disabled={actingId === c.id}
                onClick={() => handleCheckinReview(c.id)}
                style={{ width: 'auto', display: 'inline-flex', background: 'var(--emergency)' }}
              >
                <CheckCircle2 size={16} /> Mark reviewed
              </Button>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: '14px',
        fontWeight: 600,
        padding: '9px 16px',
        borderRadius: 'var(--radius-sm)',
        border: 'none',
        background: active ? 'var(--teal)' : 'var(--sage-light)',
        color: active ? '#fff' : 'var(--teal)',
      }}
    >
      {children}
    </button>
  );
}

function SkeletonCards() {
  return (
    <>
      {[1, 2].map((i) => (
        <Card key={i} style={{ padding: '22px', opacity: 0.5 }}>
          <div style={{ height: '14px', width: '40%', background: 'var(--border)', borderRadius: '6px', marginBottom: '10px' }} />
          <div style={{ height: '12px', width: '80%', background: 'var(--border)', borderRadius: '6px' }} />
        </Card>
      ))}
    </>
  );
}
