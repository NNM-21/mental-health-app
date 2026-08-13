import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import { listAssessments, submitAssessment, ANSWER_OPTIONS } from '../services/assessmentService';

export default function TakeAssessment() {
  const { type } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listAssessments()
      .then((data) => {
        const found = data.find((a) => a.type === type);
        if (!cancelled) {
          if (found) {
            setAssessment(found);
            setAnswers(new Array(found.questions.length).fill(null));
          } else {
            setError('This assessment could not be found.');
          }
        }
      })
      .catch(() => {
        if (!cancelled) setError('Could not load this assessment right now.');
      });
    return () => {
      cancelled = true;
    };
  }, [type]);

  if (error) {
    return (
      <AppLayout>
        <Card style={{ padding: '32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{error}</p>
          <Link to="/assessments" style={{ color: 'var(--teal)', fontWeight: 600, fontSize: '14px' }}>
            ← Back to Self-Assessment
          </Link>
        </Card>
      </AppLayout>
    );
  }

  if (!assessment) {
    return (
      <AppLayout>
        <Card style={{ padding: '32px', opacity: 0.5, height: '260px' }} />
      </AppLayout>
    );
  }

  const total = assessment.questions.length;
  const progress = ((step + 1) / total) * 100;

  const selectAnswer = (value) => {
    const next = [...answers];
    next[step] = value;
    setAnswers(next);

    if (step < total - 1) {
      setTimeout(() => setStep(step + 1), 180);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else navigate('/assessments');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await submitAssessment(type, answers);
      navigate(`/assessments/${type}/result`, { state: { result, answers, assessment } });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit your assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const allAnswered = answers.every((a) => a !== null);
  const isLastStep = step === total - 1;

  return (
    <AppLayout>
      <button
        onClick={handleBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13.5px',
          color: 'var(--text-secondary)',
          marginBottom: '24px',
          background: 'none',
          border: 'none',
        }}
      >
        <ArrowLeft size={15} /> {step === 0 ? 'Back to Self-Assessment' : 'Previous question'}
      </button>

      <Card style={{ padding: '36px', maxWidth: '620px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--teal)', letterSpacing: '0.02em' }}>
            {assessment.title.split(' ')[0]}
          </span>
          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Question {step + 1} of {total}
          </span>
        </div>

        <div style={{ height: '6px', background: 'var(--border)', borderRadius: '999px', marginBottom: '32px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--teal)',
              borderRadius: '999px',
              transition: 'width .25s ease',
            }}
          />
        </div>

        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          Over the last 2 weeks, how often have you been bothered by:
        </p>
        <h2 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '28px', lineHeight: 1.4 }}>
          {assessment.questions[step]}
        </h2>

        <div style={{ display: 'grid', gap: '10px', marginBottom: allAnswered && isLastStep ? '24px' : 0 }}>
          {ANSWER_OPTIONS.map((opt) => {
            const selected = answers[step] === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => selectAnswer(opt.value)}
                style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: `1.5px solid ${selected ? 'var(--teal)' : 'var(--border)'}`,
                  background: selected ? 'var(--sage-light)' : '#fff',
                  color: 'var(--text-primary)',
                  fontSize: '14.5px',
                  fontWeight: selected ? 600 : 500,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'border-color .12s ease, background .12s ease',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {isLastStep && allAnswered && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%',
              marginTop: '24px',
              padding: '13px',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--teal)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '14.5px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Submitting…' : 'See my results →'}
          </button>
        )}
      </Card>
    </AppLayout>
  );
}
