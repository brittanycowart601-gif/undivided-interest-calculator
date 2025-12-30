/**
 * Button row for modal actions
 * Design: Modern, clean styling
 */
export function ModalActions({ onSubmit, onCancel, submitLabel = 'Confirm', cancelLabel = 'Cancel', submitDisabled = false }) {
  return (
    <div style={{
      display: 'flex',
      gap: 'var(--space-3)',
      marginTop: 'var(--space-6)',
      paddingTop: 'var(--space-5)',
      borderTop: '1px solid var(--slate-100)',
    }}>
      <button
        onClick={onCancel}
        style={{
          flex: 1,
          background: 'var(--white)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--slate-200)',
          padding: 'var(--space-3) var(--space-5)',
          fontWeight: '500',
          fontSize: '0.9375rem',
          cursor: 'pointer',
          borderRadius: 'var(--radius-sm)',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--slate-50)';
          e.currentTarget.style.borderColor = 'var(--slate-300)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--white)';
          e.currentTarget.style.borderColor = 'var(--slate-200)';
        }}
      >
        {cancelLabel}
      </button>
      <button
        onClick={onSubmit}
        disabled={submitDisabled}
        style={{
          flex: 1,
          background: submitDisabled ? 'var(--slate-300)' : 'var(--accent-primary)',
          color: 'var(--white)',
          border: 'none',
          padding: 'var(--space-3) var(--space-5)',
          fontWeight: '600',
          fontSize: '0.9375rem',
          cursor: submitDisabled ? 'not-allowed' : 'pointer',
          borderRadius: 'var(--radius-sm)',
          boxShadow: submitDisabled ? 'none' : '0 2px 8px rgba(99, 102, 241, 0.25)',
          transition: 'all 0.15s ease',
          opacity: submitDisabled ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!submitDisabled) {
            e.currentTarget.style.background = 'var(--accent-primary-dark)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.35)';
          }
        }}
        onMouseLeave={(e) => {
          if (!submitDisabled) {
            e.currentTarget.style.background = 'var(--accent-primary)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.25)';
          }
        }}
      >
        {submitLabel}
      </button>
    </div>
  );
}
