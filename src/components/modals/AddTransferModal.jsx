import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { ModalActions } from '../ui/ModalActions';
import { DocumentSelector } from '../ui/DocumentSelector';
import { STYLES, EMPTY_DOC_FORM } from '../../utils/constants';
import { formatFraction } from '../../utils/formatters';

export function AddTransferModal({
  isOpen,
  targetOwner,
  owners,
  documents,
  getRemainingPercentage,
  onSubmit,
  onClose
}) {
  const [fromId, setFromId] = useState('');
  const [percentage, setPercentage] = useState('');
  const [documentId, setDocumentId] = useState('new');
  const [newDocForm, setNewDocForm] = useState(EMPTY_DOC_FORM);

  useEffect(() => {
    if (isOpen) {
      setFromId('');
      setPercentage('');
      setDocumentId('new');
      setNewDocForm(EMPTY_DOC_FORM);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    onSubmit({ fromId, percentage, documentId, newDocForm });
  };

  const availableOwners = owners.filter(o => o.id !== targetOwner?.id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ADD ADDITIONAL SOURCE">
      <p style={{ fontSize: '12px', color: 'var(--teal)', marginBottom: '15px' }}>
        Adding source to: <strong>{targetOwner?.name}</strong>
      </p>

      <FormField label="From (Grantor)">
        <select
          value={fromId}
          onChange={(e) => setFromId(e.target.value)}
          style={{ ...STYLES.input.base, border: '2px solid var(--teal-dark)' }}
        >
          <option value="">-- Select Source --</option>
          {availableOwners.map(o => (
            <option key={o.id} value={o.id}>
              {o.name} ({formatFraction(getRemainingPercentage(o.id))} available)
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Interest Received">
        <input
          type="text"
          value={percentage}
          onChange={(e) => setPercentage(e.target.value)}
          placeholder="1/4, 0.25, or 25"
          style={STYLES.input.base}
        />
      </FormField>

      <FormField label="📄 Document">
        <DocumentSelector
          value={documentId}
          onChange={setDocumentId}
          documents={documents}
          newDocForm={newDocForm}
          setNewDocForm={setNewDocForm}
        />
      </FormField>

      <ModalActions
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Add Source"
      />
    </Modal>
  );
}
