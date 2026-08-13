import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Phone, MessageCircle, History } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';

const SEVERITY_COPY = {
  minimal: 'Your responses suggest minimal symptoms right now.',
  mild: 'Your responses suggest mild symptoms.',
  moderate: 'Your responses suggest moderate symptoms — support could help.',
  'moderately severe': 'Your responses suggest moderately severe symptoms. Talking to a professional could help.',
  severe: 'Your responses suggest severe symptoms. It may help to talk with a professional soon.',
};

const SEVERITY_COLOR = {
  minimal: 'var(--sage)',
  mild: '#7FB3A3',
  moderate: '#E0A458',
  'moderately severe': '#D98254',
  severe: 'var(--emergency)',
};

export default function AssessmentResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, answers, assessment } = location.state || {};

  if (!result) {
    return (
      <AppLayout>
        <Card style={{ padding: '32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            No result to show. Take an assessment first.
          </p>
          <Link to="/assessments" style={{ color: 'var(--teal)', fontWeight: 600, fontSize: '14px' }}>
            ← Back to Self-Assessment
          </Link>
        </Card>
      </AppLayout>
    );
  }

  // PHQ-9 question index 8 (the 9th question) is the standard self-harm
  // screening item. Any non-zero answer surfaces immediate support,
  // regardless of the overall severity band.
  const isPHQ9 = assessment?.type === 'PHQ9';
  const selfHarmFlag = isPHQ9 && answers?.[8] > 0;

  const severityLabel = result.severity || 'unknown';
  const severityColor = SEVERITY_COLOR[severityLabel] || 'var(--teal)';
  const severityCopy = SEVERITY_COPY[severityLabel] || 'Here are your results.';

  return (
    <AppLayout>
      {selfHarmFlag && (
        <Card
          style={{
            padding: '22px 24px',
            marginBottom: '20px',
            background: 'var(--emergency-bg)',
            border: '1.5px solid var(--emergency)',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--emergency)', marginBottom: '8px' }}>
            We're concerned that you may need immediate support.
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '16px' }}>
            One of your answers suggests you may be having thoughts of harming yourself. You don't
            have to go through this alone — support is available right now.
          </p>
          <Link
            to="/emergency"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--emergency)',
              color: '#fff',
              padding: '11px 20px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            <Phone size={16} /> Get emergency support
          </Link>
        </Card>
      )}

      <Card style={{ padding: '36px', maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
          {assessment?.title}
        </p>

        <div
          style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            border: `6px solid ${severityColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '18px auto',
          }}
        >
          <span style={{ fontSize: '30px', fontWeight: 700 }}>{result.score}</span>
        </div>

        <div
          style={{
            display: 'inline-block',
            background: 'var(--sage-light)',
            color: 'var(--teal)',
            fontSize: '13px',
            fontWeight: 700,
            padding: '5px 14px',
            borderRadius: '999px',
            marginBottom: '14px',
            textTransform: 'capitalize',
          }}
        >
          {severityLabel}
        </div>

        <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.6 }}>
          {severityCopy}
        </p>

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          This is a screening tool, not a diagnosis. Only a qualified professional can diagnose a
          condition.
        </p>

        <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', textAlign: 'left' }}>
          What you can do
        </h4>
        <div style={{ display: 'grid', gap: '10px' }}>
          <Link
            to="/forum"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              textAlign: 'left',
            }}
          >
            <MessageCircle size={16} color="var(--teal)" /> Ask the community
          </Link>
          <Link
            to="/assessments/history"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              textAlign: 'left',
            }}
          >
            <History size={16} color="var(--teal)" /> View your score history
          </Link>
        </div>

        <button
          onClick={() => navigate('/assessments')}
          style={{
            marginTop: '24px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          ← Back to Self-Assessment
        </button>
      </Card>
    </AppLayout>
  );
}
