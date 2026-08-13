export default function Field({ label, error, ...inputProps }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <label
        htmlFor={inputProps.id}
        style={{
          display: 'block',
          fontSize: '13.5px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '6px',
        }}
      >
        {label}
      </label>
      <input
        {...inputProps}
        style={{
          width: '100%',
          padding: '11px 14px',
          borderRadius: '10px',
          border: `1.5px solid ${error ? 'var(--emergency)' : 'var(--border)'}`,
          background: '#fff',
          fontSize: '14.5px',
          color: 'var(--text-primary)',
          outline: 'none',
          transition: 'border-color .15s ease',
        }}
        onFocus={(e) => {
          if (!error) e.target.style.borderColor = 'var(--teal)';
        }}
        onBlur={(e) => {
          if (!error) e.target.style.borderColor = 'var(--border)';
        }}
      />
      {error && (
        <div style={{ color: 'var(--emergency)', fontSize: '12.5px', marginTop: '5px' }}>
          {error}
        </div>
      )}
    </div>
  );
}
