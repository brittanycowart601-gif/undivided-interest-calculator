import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { ModalActions } from '../ui/ModalActions';
import { STYLES } from '../../utils/constants';
import { getDocumentLabel } from '../../utils/formatters';

export function EditOwnerModal({ isOpen, owner, persons, owners, documents, onSubmit, onClose }) {
  const [name, setName] = useState('');
  const [nameAsWritten, setNameAsWritten] = useState('');
  const [notes, setNotes] = useState('');
  const [personId, setPersonId] = useState('');
  const [transfers, setTransfers] = useState([]);
  const [fillColor, setFillColor] = useState(null);
  const [borderColor, setBorderColor] = useState(null);
  const [lineColor, setLineColor] = useState(null);
  const [relationship, setRelationship] = useState('');

  useEffect(() => {
    if (owner) {
      setName(owner.name);
      setNameAsWritten(owner.nameAsWritten || owner.name);
      setNotes(owner.notes || '');
      setPersonId(owner.personId || '');
      setFillColor(owner.color || null);
      setBorderColor(owner.borderColor || null);
      setLineColor(owner.lineColor || null);
      setRelationship(owner.relationship || '');
      // Deep copy transfers to allow editing
      setTransfers(owner.transfers.map(t => ({ ...t })));
    }
  }, [owner]);

  const handleTransferPercentageChange = (index, value) => {
    setTransfers(prev => prev.map((t, i) =>
      i === index ? { ...t, percentageInput: value } : t
    ));
  };

  const handleTransferDocumentChange = (index, docId) => {
    setTransfers(prev => prev.map((t, i) =>
      i === index ? { ...t, documentId: docId || null } : t
    ));
  };

  const handleDeleteTransfer = (index) => {
    if (transfers.length <= 1) {
      alert('Cannot delete the last transfer. Delete the node instead.');
      return;
    }
    setTransfers(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Parse and validate all transfer percentages
    const parsedTransfers = transfers.map((t, i) => {
      const inputValue = t.percentageInput !== undefined ? t.percentageInput : t.percentage;
      const pct = parseFloat(inputValue);
      if (isNaN(pct) || pct <= 0) {
        return { ...t, error: true };
      }
      return { ...t, percentage: pct, error: false };
    });

    if (parsedTransfers.some(t => t.error)) {
      alert('Invalid percentage value in one or more transfers');
      return;
    }

    // Clean up the transfer objects (remove temporary fields)
    const cleanTransfers = parsedTransfers.map(({ fromId, percentage, documentId, edgeColor }) => ({
      fromId,
      percentage,
      documentId: documentId || null,
      edgeColor: edgeColor || null
    }));

    onSubmit({ name, nameAsWritten, notes, personId, transfers: cleanTransfers, fillColor, borderColor, lineColor, relationship });
  };

  const getOwnerName = (ownerId) => {
    const o = owners.find(x => x.id === ownerId);
    return o ? o.name : 'Unknown';
  };

  const isRoot = owner && owner.transfers.length === 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="EDIT NODE" maxWidth="600px">
      <FormField label="Display Name">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={STYLES.input.base}
        />
      </FormField>

      <FormField label="Name As Written">
        <input
          type="text"
          value={nameAsWritten}
          onChange={(e) => setNameAsWritten(e.target.value)}
          style={STYLES.input.base}
        />
      </FormField>

      <FormField label="Relationship (e.g., 'Husband of Jane Doe')">
        <input
          type="text"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          placeholder="Husband of, Wife of, Child of..."
          style={STYLES.input.base}
        />
      </FormField>

      <FormField label="Linked Person">
        <select
          value={personId}
          onChange={(e) => setPersonId(e.target.value)}
          style={{ ...STYLES.input.base, border: '2px solid var(--teal-dark)' }}
        >
          {persons.map(p => <option key={p.id} value={p.id}>{p.primaryName}</option>)}
        </select>
      </FormField>

      {/* Transfer editing section - only show for non-root nodes */}
      {!isRoot && transfers.length > 0 && (
        <FormField label="Transfers Received">
          <div style={{ background: 'var(--gray-light)', padding: '10px' }}>
            {transfers.map((transfer, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: idx < transfers.length - 1 ? '10px' : 0,
                  padding: '10px',
                  background: 'white',
                  border: '1px solid var(--gray)'
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ flex: '0 0 auto', fontSize: '12px', color: 'var(--teal-dark)' }}>
                    From: <strong>{getOwnerName(transfer.fromId)}</strong>
                  </div>
                  <div style={{ flex: '1' }}>
                    <input
                      type="text"
                      value={transfer.percentageInput !== undefined ? transfer.percentageInput : transfer.percentage}
                      onChange={(e) => handleTransferPercentageChange(idx, e.target.value)}
                      placeholder="Amount (1/4, 25, 0.25)"
                      style={{ width: '100%', padding: '6px', border: '1px solid var(--gray)', fontSize: '12px' }}
                    />
                  </div>
                  <div style={{ flex: '1' }}>
                    <select
                      value={transfer.documentId || ''}
                      onChange={(e) => handleTransferDocumentChange(idx, e.target.value)}
                      style={{ width: '100%', padding: '6px', border: '1px solid var(--gray)', fontSize: '12px' }}
                    >
                      <option value="">-- No Document --</option>
                      {documents.map(d => (
                        <option key={d.id} value={d.id}>
                          {getDocumentLabel(d, null)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {transfers.length > 1 && (
                    <button
                      onClick={() => handleDeleteTransfer(idx)}
                      style={{
                        background: 'var(--gray)',
                        color: 'var(--navy)',
                        border: 'none',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
                {/* Edge color picker for this transfer */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--teal-dark)' }}>Line Color:</span>
                  <input
                    type="color"
                    value={transfer.edgeColor || '#002e54'}
                    onChange={(e) => {
                      setTransfers(prev => prev.map((t, i) =>
                        i === idx ? { ...t, edgeColor: e.target.value } : t
                      ));
                    }}
                    style={{ width: '40px', height: '24px', padding: '0', cursor: 'pointer', border: '1px solid var(--gray)' }}
                  />
                  {transfer.edgeColor && (
                    <button
                      onClick={() => {
                        setTransfers(prev => prev.map((t, i) =>
                          i === idx ? { ...t, edgeColor: null } : t
                        ));
                      }}
                      style={{ fontSize: '10px', color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </FormField>
      )}

      <FormField label="🎨 Node Colors">
        <div style={{ background: 'var(--gray-light)', padding: '12px' }}>
          {/* Fill Color */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', width: '80px' }}>Fill:</span>
            <input
              type="color"
              value={fillColor || '#FFFFFF'}
              onChange={(e) => setFillColor(e.target.value)}
              style={{ width: '50px', height: '30px', padding: '0', cursor: 'pointer', border: '1px solid var(--gray)' }}
            />
            {fillColor && (
              <button
                onClick={() => setFillColor(null)}
                style={{ fontSize: '10px', color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Reset
              </button>
            )}
          </div>
          {/* Border Color */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', width: '80px' }}>Border:</span>
            <input
              type="color"
              value={borderColor || '#002e54'}
              onChange={(e) => setBorderColor(e.target.value)}
              style={{ width: '50px', height: '30px', padding: '0', cursor: 'pointer', border: '1px solid var(--gray)' }}
            />
            {borderColor && (
              <button
                onClick={() => setBorderColor(null)}
                style={{ fontSize: '10px', color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Reset
              </button>
            )}
          </div>
          {/* Line Color (for outgoing edges) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', width: '80px' }}>Lines Out:</span>
            <input
              type="color"
              value={lineColor || '#002e54'}
              onChange={(e) => setLineColor(e.target.value)}
              style={{ width: '50px', height: '30px', padding: '0', cursor: 'pointer', border: '1px solid var(--gray)' }}
            />
            {lineColor && (
              <button
                onClick={() => setLineColor(null)}
                style={{ fontSize: '10px', color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Reset
              </button>
            )}
            <span style={{ fontSize: '10px', color: 'var(--teal-dark)', fontStyle: 'italic' }}>(default for outgoing lines)</span>
          </div>
        </div>
      </FormField>

      <FormField label="Notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ ...STYLES.input.base, minHeight: '80px' }}
        />
      </FormField>

      <ModalActions onSubmit={handleSubmit} onCancel={onClose} />
    </Modal>
  );
}
