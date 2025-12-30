import { getDocumentLabel } from '../../utils/formatters';
import { DocumentForm } from './DocumentForm';

/**
 * Document selector with inline creation form
 */
export function DocumentSelector({ value, onChange, documents, newDocForm, setNewDocForm, showNew = true }) {
  return (
    <div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px',
          border: '2px solid var(--teal)',
          fontSize: '14px',
          marginBottom: '10px'
        }}
      >
        {showNew && <option value="new">+ Add New Document</option>}
        <option value="">-- No Document --</option>
        {documents.map(d => (
          <option key={d.id} value={d.id}>
            {getDocumentLabel(d)} {d.documentTitle ? `- ${d.documentTitle}` : ''}
          </option>
        ))}
      </select>

      {value === 'new' && (
        <DocumentForm docForm={newDocForm} setDocForm={setNewDocForm} compact />
      )}
    </div>
  );
}
