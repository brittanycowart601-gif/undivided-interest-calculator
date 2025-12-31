import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { ModalActions } from '../ui/ModalActions';
import { DocumentSelector } from '../ui/DocumentSelector';
import { STYLES, EMPTY_DOC_FORM } from '../../utils/constants';
import { formatFraction } from '../../utils/formatters';

export function AddGranteeModal({
  isOpen,
  parentOwner,
  remainingPercentage,
  persons,
  documents,
  onSubmit,
  onClose
}) {
  const [selectedPersonId, setSelectedPersonId] = useState('new');
  const [newGranteeName, setNewGranteeName] = useState('');
  const [percentage, setPercentage] = useState('');
  const [selectedDocumentId, setSelectedDocumentId] = useState('new');
  const [newDocForm, setNewDocForm] = useState(EMPTY_DOC_FORM);
  const [fillColor, setFillColor] = useState(null);
  const [borderColor, setBorderColor] = useState(null);
  const [lineColor, setLineColor] = useState(null);
  const [relationship, setRelationship] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedPersonId('new');
      setNewGranteeName('');
      setPercentage('');
      setSelectedDocumentId('new');
      // Auto-fill grantor from parent owner name
      setNewDocForm({
        ...EMPTY_DOC_FORM,
        grantor: parentOwner?.name || parentOwner?.nameAsWritten || ''
      });
      setFillColor(null);
      setBorderColor(null);
      setLineColor(null);
      setRelationship('');
    }
  }, [isOpen, parentOwner]);

  const handleSubmit = () => {
    onSubmit({
      selectedPersonId,
      newGranteeName,
      percentage,
      selectedDocumentId,
      newDocForm,
      fillColor,
      borderColor,
      lineColor,
      relationship
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ADD GRANTEE">
      <p style={{ fontSize: '12px', color: 'var(--teal)', marginBottom: '15px' }}>
        From: <strong>{parentOwner?.name}</strong> (Available: {formatFraction(remainingPercentage)})
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
        <FormField label="Name (as written)">
          <input
            type="text"
            value={newGranteeName}
            onChange={(e) => setNewGranteeName(e.target.value)}
            style={STYLES.input.base}
          />
        </FormField>
      )}

      <FormField label="Interest Received">
        <input
          type="text"
          value={percentage}
          onChange={(e) => setPercentage(e.target.value)}
          placeholder="1/4, 0.25, or 25"
          style={STYLES.input.base}
        />
      </FormField>

      <FormField label="Relationship (optional)">
        <input
          type="text"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          placeholder="Husband of, Wife of, Child of..."
          style={STYLES.input.base}
        />
      </FormField>

      <FormField label="📄 Document">
        <DocumentSelector
          value={selectedDocumentId}
          onChange={setSelectedDocumentId}
          documents={documents}
          newDocForm={newDocForm}
          setNewDocForm={setNewDocForm}
        />
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

      <ModalActions
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Add Grantee"
      />
    </Modal>
  );
}
