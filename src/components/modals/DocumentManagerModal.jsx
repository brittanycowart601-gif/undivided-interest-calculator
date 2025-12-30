import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { DocumentForm } from '../ui/DocumentForm';
import { EMPTY_DOC_FORM } from '../../utils/constants';
import { getDocumentLabel } from '../../utils/formatters';

export function DocumentManagerModal({
  isOpen,
  documents,
  persons,
  getDocumentGrantees,
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument,
  onClose
}) {
  const [editingId, setEditingId] = useState(null);
  const [docForm, setDocForm] = useState(EMPTY_DOC_FORM);

  const handleStartEdit = (doc) => {
    setEditingId(doc.id);
    setDocForm({
      instrumentNumber: doc.instrumentNumber || '',
      book: doc.book || '',
      page: doc.page || '',
      dateRecorded: doc.dateRecorded || '',
      documentDate: doc.documentDate || '',
      grantor: doc.grantor || '',
      documentTitle: doc.documentTitle || '',
      note: doc.note || ''
    });
  };

  const handleAdd = () => {
    if (docForm.instrumentNumber || docForm.book || docForm.documentTitle) {
      onAddDocument(docForm);
      setDocForm(EMPTY_DOC_FORM);
    }
  };

  const handleUpdate = () => {
    onUpdateDocument(editingId, docForm);
    setEditingId(null);
    setDocForm(EMPTY_DOC_FORM);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setDocForm(EMPTY_DOC_FORM);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📄 DOCUMENT REGISTRY" maxWidth="900px">
      {/* Add/Edit form */}
      <div style={{ background: 'var(--gray-light)', padding: '15px', marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', fontSize: '14px' }}>
          {editingId ? 'Edit Document' : 'Add New Document'}
        </h4>
        <DocumentForm docForm={docForm} setDocForm={setDocForm} />
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          {editingId ? (
            <>
              <button onClick={handleUpdate} style={{ background: 'var(--teal)', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer' }}>Update</button>
              <button onClick={handleCancelEdit} style={{ background: 'var(--gray)', color: 'var(--navy)', border: 'none', padding: '8px 15px', cursor: 'pointer' }}>Cancel</button>
            </>
          ) : (
            <button onClick={handleAdd} style={{ background: 'var(--teal)', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer' }}>Add Document</button>
          )}
        </div>
      </div>

      {/* Document list */}
      <div style={{ maxHeight: '300px', overflow: 'auto' }}>
        {documents.length === 0 ? (
          <p style={{ color: 'var(--gray-medium)', textAlign: 'center', padding: '20px' }}>No documents yet</p>
        ) : (
          documents.map(doc => {
            const grantees = getDocumentGrantees(doc.id);
            const granteeNames = grantees
              .map(g => persons.find(p => p.id === g.personId)?.primaryName || g.name)
              .join(', ');

            return (
              <div key={doc.id} style={{ padding: '12px', border: '1px solid var(--gray-light)', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong>{doc.documentTitle || getDocumentLabel(doc)}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--teal)' }}>
                      {doc.instrumentNumber && <span>Inst: {doc.instrumentNumber} | </span>}
                      {doc.book && <span>Bk: {doc.book} </span>}
                      {doc.page && <span>Pg: {doc.page} | </span>}
                      {doc.documentDate && <span>Date: {doc.documentDate}</span>}
                    </div>
                    {grantees.length > 0 && (
                      <div style={{ fontSize: '11px', color: 'var(--teal-dark)', marginTop: '3px' }}>
                        Grantees: {granteeNames}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => handleStartEdit(doc)} style={{ background: 'var(--navy)', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                    <button onClick={() => { if (confirm('Delete?')) onDeleteDocument(doc.id); }} style={{ background: 'var(--gray)', color: 'var(--navy)', border: 'none', padding: '5px 10px', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={onClose}
        style={{ width: '100%', background: 'var(--navy)', color: 'white', border: 'none', padding: '12px', fontWeight: '600', cursor: 'pointer', marginTop: '20px' }}
      >
        Close
      </button>
    </Modal>
  );
}
