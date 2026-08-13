import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Field from '../components/Field';
import Button from '../components/Button';
import { createPost } from '../services/forumService';

export default function AskQuestion() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Give your question a short title.';
    if (!form.content.trim()) errs.content = 'Add some detail so others can help.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const post = await createPost(form);
      navigate(`/forum/${post.id}`, { replace: true });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not submit your question right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <Link
        to="/forum"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13.5px',
          color: 'var(--text-secondary)',
          marginBottom: '20px',
        }}
      >
        <ArrowLeft size={15} /> Back to Community
      </Link>

      <Card style={{ padding: '32px', maxWidth: '620px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px' }}>
          Ask a question
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginBottom: '24px' }}>
          Your question will be visible to the community once reviewed. Please avoid sharing
          personally identifiable information.
        </p>

        {formError && (
          <div
            role="alert"
            style={{
              background: 'var(--emergency-bg)',
              color: 'var(--emergency)',
              padding: '13px 16px',
              borderRadius: '10px',
              fontSize: '14px',
              marginBottom: '20px',
            }}
          >
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Field
            id="title"
            label="Title"
            type="text"
            placeholder="e.g. How do I manage anxiety before an exam?"
            value={form.title}
            error={fieldErrors.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <div style={{ marginBottom: '18px' }}>
            <label
              htmlFor="content"
              style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}
            >
              Details
            </label>
            <textarea
              id="content"
              rows={6}
              placeholder="Share what's on your mind — as much or as little detail as you're comfortable with."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: `1.5px solid ${fieldErrors.content ? 'var(--emergency)' : 'var(--border)'}`,
                fontSize: '14.5px',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
              }}
            />
            {fieldErrors.content && (
              <div style={{ color: 'var(--emergency)', fontSize: '12.5px', marginTop: '5px' }}>
                {fieldErrors.content}
              </div>
            )}
          </div>

          <div style={{ maxWidth: '220px' }}>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit question'}
            </Button>
          </div>
        </form>
      </Card>
    </AppLayout>
  );
}
