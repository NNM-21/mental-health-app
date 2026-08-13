export default function Button({ variant = 'primary', children, disabled, ...rest }) {
  const base = {
    fontWeight: 600,
    fontSize: '14.5px',
    padding: '12px 22px',
    borderRadius: '10px',
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'transform .15s ease, box-shadow .15s ease, opacity .15s ease',
    width: '100%',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  const variants = {
    primary: {
      background: 'var(--teal)',
      color: '#fff',
    },
    secondary: {
      background: 'var(--sage-light)',
      color: 'var(--teal)',
    },
    tertiary: {
      background: 'transparent',
      color: 'var(--teal)',
      padding: '12px 8px',
    },
  };

  return (
    <button
      style={{ ...base, ...variants[variant] }}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
