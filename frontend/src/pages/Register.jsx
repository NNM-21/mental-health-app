import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import Field from '../components/Field';
import Button from '../components/Button';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Enter your name.';
    if (!form.email.trim()) errs.email = 'Enter your email address.';
    if (!form.password) errs.password = 'Create a password.';
    else if (form.password.length < 6) errs.password = 'Password should be at least 6 characters.';
    if (form.confirm !== form.password) errs.confirm = "Passwords don't match.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    try {
      // Public sign-up is always a patient account; staff roles (responder,
      // moderator, doctor, senior doctor) are assigned separately, not
      // self-selected here.
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'patient',
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <AuthLayout>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
          Create your account
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
          Join MindSpace — a calm space to reflect, learn, and get support.
        </p>
      </div>

      {formError && (
        <div
          role="alert"
          style={{
            background: 'var(--emergency-bg)',
            color: 'var(--emergency)',
            padding: '13px 16px',
            borderRadius: '10px',
            fontSize: '15px',
            marginBottom: '20px',
          }}
        >
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <Field
          id="name"
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          value={form.name}
          error={fieldErrors.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          error={fieldErrors.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={form.password}
          error={fieldErrors.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Field
          id="confirm"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={form.confirm}
          error={fieldErrors.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        />

        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '18px' }}>
          By creating an account you agree to MindSpace's terms and privacy policy.
        </p>

        <div style={{ marginBottom: '20px' }}>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account →'}
          </Button>
        </div>
      </form>

      <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--teal)', fontWeight: 600 }}>
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
