export const STORAGE_KEY = 'undividedInterestDataV8';

// Modern color palette for person identification
export const PERSON_COLORS = [
  '#6366f1', // Indigo (primary)
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#3b82f6', // Blue
  '#84cc16', // Lime
];

export const INITIAL_PERSON = {
  id: 'person-root',
  primaryName: 'Original Owner',
  aliases: []
};

export const INITIAL_OWNER = {
  id: 'root',
  name: 'Original Owner',
  nameAsWritten: 'Original Owner',
  personId: 'person-root',
  notes: '',
  transfers: [],
  originalLevel: 0
};

export const EMPTY_DOC_FORM = {
  instrumentNumber: '',
  book: '',
  page: '',
  dateRecorded: '',
  documentDate: '',
  grantor: '',
  documentTitle: '',
  note: ''
};

// Legacy STYLES object - kept for backward compatibility but components should use inline styles
export const STYLES = {
  modal: {
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      overflow: 'auto',
      backdropFilter: 'blur(8px)',
    },
    content: {
      background: 'var(--white)',
      padding: '0',
      maxWidth: '520px',
      width: '100%',
      borderRadius: 'var(--radius-lg)',
      maxHeight: '90vh',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-xl)',
    },
    title: {
      color: 'var(--text-primary)',
      marginBottom: '0',
      fontSize: '1.125rem',
      fontWeight: '600',
    }
  },
  button: {
    primary: {
      background: 'var(--accent-primary)',
      color: 'var(--white)',
      border: 'none',
      padding: 'var(--space-3) var(--space-5)',
      fontWeight: '600',
      fontSize: '0.9375rem',
      cursor: 'pointer',
      borderRadius: 'var(--radius-sm)',
      boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)',
    },
    secondary: {
      background: 'var(--white)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--slate-200)',
      padding: 'var(--space-3) var(--space-5)',
      fontWeight: '500',
      fontSize: '0.9375rem',
      cursor: 'pointer',
      borderRadius: 'var(--radius-sm)',
    }
  },
  input: {
    base: {
      width: '100%',
      padding: 'var(--space-3) var(--space-4)',
      border: '1px solid var(--slate-200)',
      borderRadius: 'var(--radius-sm)',
      fontSize: '0.9375rem',
      background: 'var(--white)',
      color: 'var(--text-primary)',
    }
  }
};
