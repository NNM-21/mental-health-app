import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import { getMyScores } from '../services/assessmentService';

const SEVERITY_COLOR = {
  minimal: 'var(--sage)',
  mild: '#7FB3A3',
  moderate: '#E0A458',
  'moderately severe': '#D98254',
  severe: 'var(--emergency)',
};

export default function AssessmentHistory() {
  const [scores, setScores] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getMyScores()
      .then((data) => {
        if (!cancelled) setScores(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load your history right now.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppLayout>
      <Link
        to="/assessments"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13.5px',
          color: 'var(--text-secondary)',
          marginBottom: '20px',
        }}
      >
        <ArrowLeft size={15} /> Back to Self-Assessment
      </Link>

      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>Your score history</h1>

      {error && <Card style={{ padding: '20px', color: 'var(--emergency)' }}>{error}</Card>}

      {!scores && !error && <Card style={{ padding: '32px', opacity: 0.5, height: '120px' }} />}

      {scores && scores.length === 0 && (
        <Card style={{ padding: '36px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            No assessments taken yet.
          </p>
          <Link to="/assessments" style={{ color: 'var(--teal)', fontWeight: 600, fontSize: '14px' }}>
            Take your first assessment
          </Link>
        </Card>
      )}

      <div style={{ display: 'grid', gap: '10px' }}>
        {scores?.slice().reverse().map((s) => (
          <Card key={s.id} style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14.5px', marginBottom: '3px' }}>{s.title}</div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                {new Date(s.taken_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  color: SEVERITY_COLOR[s.severity] || 'var(--teal)',
                }}
              >
                {s.severity}
              </span>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: `3px solid ${SEVERITY_COLOR[s.severity] || 'var(--teal)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                {s.score}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
