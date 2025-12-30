import { Modal } from '../ui/Modal';

export function NotesModal({ isOpen, notes, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="NOTES" maxWidth="500px">
      <div style={{
        background: 'var(--gray-light)',
        padding: '15px',
        minHeight: '100px',
        whiteSpace: 'pre-wrap'
      }}>
        {notes || 'No notes.'}
      </div>
      <button
        onClick={onClose}
        style={{
          marginTop: '20px',
          width: '100%',
          background: 'var(--navy)',
          color: 'white',
          border: 'none',
          padding: '12px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        Close
      </button>
    </Modal>
  );
}
