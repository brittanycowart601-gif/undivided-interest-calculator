import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { ModalActions } from '../ui/ModalActions';
import { STYLES, EMPTY_DOC_FORM } from '../../utils/constants';
import { DocumentForm } from '../ui/DocumentForm';

export function AddNodeModal({ isOpen, persons, documents, onSubmit, onClose }) {
  const [selectedPersonId, setSelectedPersonId] = useState('new');
  const [newName, setNewName] = useState('');
  const [notes, setNotes] = useState('');
  const [fillColor, setFillColor] = useState(null);
  const [borderColor, setBorderColor] = useState(null);
  const [lineColor, setLineColor] = useState(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState('none');
  const [newDocForm, setNewDocForm] = useState(EMPTY_DOC_FORM);

  useEffect(() => {
    if (isOpen) {
      setSelectedPersonId('new');
      setNewName('');
      setNotes('');
      setFillColor(null);
      setBorderColor(null);
      setLineColor(null);
      setSelectedDocumentId('none');
      setNewDocForm(EMPTY_DOC_FORM);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (selectedPersonId === 'new' && !newName.trim()) {
      alert('Please enter a name');
      return;
    }
    onSubmit({
      selectedPersonId,
      newName,
      notes,
      fillColor,
      borderColor,
      lineColor,
      selectedDocumentId,
      newDocForm
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ADD NEW NODE">
      <p style={{ fontSize: '12px', color: 'var(--teal)', marginBottom: '15px' }}>
        Create a standalone node (not connected to any existing node)
      </p>

      <FormField label="👤 Person">
        <select
          value={selectedPersonId}
          onChange={(e) => setSelectedPersonId(e.target.value)}
          style={{ ...STYLES.input.base, border: '2px solid var(--teal-dark)' }}
        >
          <option value="new">+ Create New Person</option>
          {persons.map(p => <option key={p.id} value={p.id}>{p.primaryName}</option>)}
        </select>
      </FormField>

      {selectedPersonId === 'new' && (
        <FormField label="Name">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={STYLES.input.base}
          />
        </FormField>
      )}

      <FormField label="📄 Source Document (optional)">
        <div style={{ background: 'var(--gray-light)', padding: '10px' }}>
          <select
            value={selectedDocumentId}
            onChange={(e) => setSelectedDocumentId(e.target.value)}
            style={{ ...STYLES.input.base, marginBottom: selectedDocumentId === 'new' ? '10px' : 0, border: '1px solid var(--gray)' }}
          >
            <option value="none">-- No Document --</option>
            <option value="new">+ Create New Document</option>
            {documents?.map(d => (
              <option key={d.id} value={d.id}>
                {d.instrumentNumber || d.documentTitle || `Book ${d.book} Page ${d.page}`}
              </option>
            ))}
          </select>
          {selectedDocumentId === 'new' && (
            <DocumentForm docForm={newDocForm} setDocForm={setNewDocForm} compact />
          )}
        </div>
      </FormField>

      <FormField label="🎨 Node Colors (optional)">
        <div style={{ background: 'var(--gray-light)', padding: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', width: '60px' }}>Fill:</span>
            <input
              type="color"
              value={fillColor || '#FFFFFF'}
              onChange={(e) => setFillColor(e.target.value)}
              style={{ width: '40px', height: '24px', padding: '0', cursor: 'pointer', border: '1px solid var(--gray)' }}
            />
            {fillColor && (
              <button
                onClick={() => setFillColor(null)}
                type="button"
                style={{ fontSize: '10px', color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Reset
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', width: '60px' }}>Border:</span>
            <input
              type="color"
              value={borderColor || '#002e54'}
              onChange={(e) => setBorderColor(e.target.value)}
              style={{ width: '40px', height: '24px', padding: '0', cursor: 'pointer', border: '1px solid var(--gray)' }}
            />
            {borderColor && (
              <button
                onClick={() => setBorderColor(null)}
                type="button"
                style={{ fontSize: '10px', color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Reset
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', width: '60px' }}>Lines:</span>
            <input
              type="color"
              value={lineColor || '#002e54'}
              onChange={(e) => setLineColor(e.target.value)}
              style={{ width: '40px', height: '24px', padding: '0', cursor: 'pointer', border: '1px solid var(--gray)' }}
            />
            {lineColor && (
              <button
                onClick={() => setLineColor(null)}
                type="button"
                style={{ fontSize: '10px', color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </FormField>

      <FormField label="Notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ ...STYLES.input.base, minHeight: '60px' }}
        />
      </FormField>

      <ModalActions
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Add Node"
      />
    </Modal>
  );
}
