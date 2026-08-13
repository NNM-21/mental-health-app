import { useState } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const REASONS = [
  'Harmful content',
  'Harassment',
  'Misinformation',
  'Self-harm concern',
  'Spam',
  'Other',
];

export default function FlagModal({ onClose, onSubmit }) {
  const [reason, setReason] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    try {
      await onSubmit(reason);
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(31, 41, 55, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 24px 60px rgba(22,78,99,0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {!done ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Why are you reporting this?</h3>
              <button
                onClick={onClose}
                aria-label="Close"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gap: '8px', marginBottom: '22px' }}>
              {REASONS.map((r) => (
                <label
                  key={r}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: `1.5px solid ${reason === r ? 'var(--teal)' : 'var(--border)'}`,
                    background: reason === r ? 'var(--sage-light)' : '#fff',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="flag-reason"
                    checked={reason === r}
                    onChange={() => setReason(r)}
                  />
                  {r}
                </label>
              ))}
            </div>

            <Button onClick={handleSubmit} disabled={!reason || submitting}>
              {submitting ? 'Submitting…' : 'Submit report'}
            </Button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <p style={{ fontSize: '15px', marginBottom: '20px' }}>
              Thank you. Our moderation team will review this content.
            </p>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
