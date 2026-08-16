import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, AlertTriangle, Phone, Sparkles } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import { submitCheckin, getMyCheckins } from '../services/checkinService';
import { timeAgo } from '../lib/timeAgo';

export default function WellnessCheckin() {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [lastResult, setLastResult] = useState(null); // most recent check-in, shown right after submit

  const [history, setHistory] = useState(null);
  const [historyError, setHistoryError] = useState(null);

  const loadHistory = () => {
    getMyCheckins()
      .then((data) => setHistory(data.slice().reverse())) // newest first for the list
      .catch(() => setHistoryError('Could not load your past check-ins.'));
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitCheckin(content.trim());
      setLastResult(result);
      setContent('');
      loadHistory();
    } catch {
      setSubmitError('Could not submit your check-in right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isCrisisResult = lastResult && lastResult.ai_classification !== 'safe';

  return (
    <AppLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>
          Wellness Check-In
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          A private space to write down how you're feeling. You'll get a short, gentle reflection back.
        </p>
      </div>

      <Card style={{ padding: '24px 26px', marginBottom: '20px' }}>
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind today?"
            rows={5}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              fontSize: '14.5px',
              fontFamily: 'inherit',
              resize: 'vertical',
              marginBottom: '14px',
            }}
          />
          {submitError && (
            <p style={{ fontSize: '13.5px', color: 'var(--emergency)', marginBottom: '12px' }}>
              {submitError}
            </p>
          )}
          <Button
            type="submit"
            variant="primary"
            disabled={submitting || !content.trim()}
            style={{ width: 'auto', display: 'inline-flex' }}
          >
            <Send size={15} /> {submitting ? 'Reflecting...' : 'Check in'}
          </Button>
        </form>
      </Card>

      {/* Result of the most recent submission */}
      {lastResult && !isCrisisResult && (
        <Card
          style={{
            padding: '22px 24px',
            marginBottom: '28px',
            background: 'var(--sage-light)',
            border: '1px solid var(--sage)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={16} style={{ color: 'var(--teal)' }} />
            <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--teal)' }}>Reflection</span>
          </div>
          <p style={{ fontSize: '14.5px', lineHeight: 1.65 }}>{lastResult.ai_reflection}</p>
        </Card>
      )}

      {lastResult && isCrisisResult && (
        <Card
          style={{
            padding: '24px 26px',
            marginBottom: '28px',
            background: 'var(--emergency-bg)',
            border: '1.5px solid var(--emergency)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <AlertTriangle size={17} style={{ color: 'var(--emergency)' }} />
            <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--emergency)' }}>
              You deserve support right now
            </span>
          </div>
          <p style={{ fontSize: '14.5px', color: 'var(--text-primary)', lineHeight: 1.65, marginBottom: '16px' }}>
            {lastResult.ai_reflection}
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link to="/emergency">
              <Button variant="primary" style={{ width: 'auto', display: 'inline-flex', background: 'var(--emergency)' }}>
                <Phone size={15} /> Emergency helplines
              </Button>
            </Link>
            <Link to="/professionals">
              <Button variant="secondary" style={{ width: 'auto', display: 'inline-flex' }}>
                Talk to a professional
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* History */}
      <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
        Your past check-ins
      </h2>

      {historyError && (
        <Card style={{ padding: '18px 20px', color: 'var(--emergency)', marginBottom: '14px' }}>
          {historyError}
        </Card>
      )}

      {history === null && !historyError && (
        <div style={{ display: 'grid', gap: '12px' }}>
          {[1, 2].map((i) => (
            <Card key={i} style={{ padding: '20px', opacity: 0.5, height: '70px' }} />
          ))}
        </div>
      )}

      {history?.length === 0 && (
        <Card style={{ padding: '28px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
          No check-ins yet — your first one will show up here.
        </Card>
      )}

      <div style={{ display: 'grid', gap: '12px' }}>
        {history?.map((c) => (
          <Card key={c.id} style={{ padding: '18px 20px' }}>
            <p style={{ fontSize: '14px', marginBottom: '8px' }}>{c.content}</p>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{timeAgo(c.created_at)}</p>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
