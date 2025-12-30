/**
 * Reusable form field component
 * Design: Modern, clean styling
 */
export function FormField({ label, children, hint, required, testId }) {
  return (
    <div style={{ marginBottom: 'var(--space-5)' }} data-testid={testId}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-2)',
      }}>
        <label style={{
          display: 'block',
          fontWeight: '500',
          fontSize: '0.875rem',
          color: 'var(--text-primary)',
        }}>
          {label}
          {required && <span style={{ color: 'var(--error)', marginLeft: '2px' }}>*</span>}
        </label>
      </div>
      <div style={{ position: 'relative' }}>
        {children}
      </div>
      {hint && (
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-tertiary)',
          marginTop: 'var(--space-2)',
        }}>
          {hint}
        </div>
      )}
    </div>
  );
}
