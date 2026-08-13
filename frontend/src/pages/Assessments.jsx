import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, History, ArrowRight } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import { listAssessments } from '../services/assessmentService';

const BLURBS = {
  GAD7: 'A short screening tool that reflects on anxiety symptoms over the last two weeks.',
  PHQ9: 'A short screening tool that reflects on depression symptoms over the last two weeks.',
};

export default function Assessments() {
  const [assessments, setAssessments] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listAssessments()
      .then((data) => {
        if (!cancelled) setAssessments(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load assessments right now. Please try again shortly.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
            Self-Assessment
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '520px' }}>
            These are screening and self-reflection tools, not a diagnosis. Take a few quiet
            minutes for yourself.
          </p>
        </div>
        <Link
          to="/assessments/history"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13.5px',
            fontWeight: 600,
            color: 'var(--teal)',
          }}
        >
          <History size={16} /> View history
        </Link>
      </div>

      {error && (
        <Card style={{ padding: '20px', color: 'var(--emergency)', marginTop: '20px' }}>{error}</Card>
      )}

      <div style={{ display: 'grid', gap: '16px', marginTop: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {!assessments && !error &&
          [1, 2].map((i) => (
            <Card key={i} style={{ padding: '26px', opacity: 0.5, height: '150px' }} />
          ))}

        {assessments?.map((a) => (
          <Card key={a.id} style={{ padding: '26px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'var(--sage-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Brain size={20} color="var(--teal)" />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>{a.title}</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              {BLURBS[a.type] || `${a.questions.length} questions · takes about 2 minutes`}
            </p>
            <Link
              to={`/assessments/${a.type}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--teal)',
              }}
            >
              Take assessment <ArrowRight size={15} />
            </Link>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
