import { formatDateInput } from '../../utils/formatters';

/**
 * Document form fields
 */
export function DocumentForm({ docForm, setDocForm, compact = false }) {
  const inputStyle = {
    padding: compact ? '6px' : '8px',
    border: '1px solid var(--gray)'
  };

  const handleChange = (field) => (e) => {
    const value = field.includes('Date') || field === 'dateRecorded'
      ? formatDateInput(e.target.value)
      : e.target.value;
    setDocForm({ ...docForm, [field]: value });
  };

  return (
    <div style={{
      background: 'var(--gray-light)',
      padding: compact ? '10px' : '15px',
      fontSize: compact ? '12px' : '14px'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: compact ? '1fr 1fr' : '1fr 1fr 1fr',
        gap: compact ? '8px' : '10px'
      }}>
        <input
          type="text"
          value={docForm.instrumentNumber}
          onChange={handleChange('instrumentNumber')}
          placeholder="Instrument #"
          style={inputStyle}
        />
        <input
          type="text"
          value={docForm.book}
          onChange={handleChange('book')}
          placeholder="Book"
          style={inputStyle}
        />
        <input
          type="text"
          value={docForm.page}
          onChange={handleChange('page')}
          placeholder="Page"
          style={inputStyle}
        />
        <input
          type="text"
          value={docForm.documentDate}
          onChange={handleChange('documentDate')}
          placeholder="Doc Date"
          style={inputStyle}
        />
        <input
          type="text"
          value={docForm.dateRecorded}
          onChange={handleChange('dateRecorded')}
          placeholder="Recorded"
          style={inputStyle}
        />
        <input
          type="text"
          value={docForm.grantor}
          onChange={handleChange('grantor')}
          placeholder="Grantor"
          style={inputStyle}
        />
        <input
          type="text"
          value={docForm.documentTitle}
          onChange={handleChange('documentTitle')}
          placeholder="Title"
          style={{ ...inputStyle, gridColumn: '1/-1' }}
        />
        {!compact && (
          <textarea
            value={docForm.note}
            onChange={handleChange('note')}
            placeholder="Notes"
            style={{ ...inputStyle, gridColumn: '1/-1', minHeight: '50px' }}
          />
        )}
      </div>
    </div>
  );
}
