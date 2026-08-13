import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import Field from '../components/Field';
import Button from '../components/Button';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);

  const redirectTo = location.state?.from || '/dashboard';

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Enter your email address.';
    if (!form.password) errs.password = 'Enter your password.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <AuthLayout>
      <div style={{ marginBottom: '36px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
          Welcome back
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
          Log in to continue your journey with MindSpace.
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
          autoComplete="current-password"
          placeholder="••••••••"
          value={form.password}
          error={fieldErrors.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <div style={{ marginTop: '4px', marginBottom: '20px' }}>
          <Button type="submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in →'}
          </Button>
        </div>
      </form>

      <p style={{ textAlign: 'center', fontSize: '15.5px', color: 'var(--text-secondary)' }}>
        New to MindSpace?{' '}
        <Link to="/register" style={{ color: 'var(--teal)', fontWeight: 600 }}>
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
