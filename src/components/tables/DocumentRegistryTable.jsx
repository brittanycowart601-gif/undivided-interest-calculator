/**
 * Document Registry Table
 * Design: Modern data table with clean styling
 */
export function DocumentRegistryTable({ documents, persons, getDocumentGrantees, onExportExcel }) {
  // Icon for download
  const IconDownload = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 2v8M3.5 7L7 10.5 10.5 7M2 12.5h10" />
    </svg>
  );

  if (documents.length === 0) {
    return (
      <div style={{
        padding: 'var(--space-12)',
        textAlign: 'center',
        color: 'var(--text-tertiary)',
        fontSize: '0.9375rem',
        background: 'var(--white)',
        border: '1px dashed var(--slate-200)',
        borderRadius: 'var(--radius-lg)',
      }}>
        No documents have been recorded yet.
      </div>
    );
  }

  return (
    <div>
      {/* Export Button */}
      <div className="no-print" style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: 'var(--space-4)',
      }}>
        <button
          onClick={onExportExcel}
          style={{
            background: 'var(--accent-secondary)',
            color: 'var(--white)',
            border: 'none',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent-secondary-dark)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--accent-secondary)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <IconDownload /> Export to Excel
        </button>
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--slate-200)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.875rem',
            minWidth: '900px',
          }}>
            <thead>
              <tr style={{
                background: 'var(--slate-50)',
                borderBottom: '1px solid var(--slate-200)',
              }}>
                {['Grantor', 'Grantees', 'Document', 'Date', 'Recorded', 'Book/Page', 'Instrument #'].map((header, i) => (
                  <th key={header} style={{
                    padding: 'var(--space-3) var(--space-4)',
                    textAlign: i < 3 ? 'left' : 'center',
                    fontWeight: '600',
                    fontSize: '0.6875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                  }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, idx) => {
                const grantees = getDocumentGrantees(doc.id);
                const granteeNames = grantees
                  .map(g => persons.find(p => p.id === g.personId)?.primaryName || g.name)
                  .join('; ');

                return (
                  <tr
                    key={doc.id}
                    style={{
                      borderBottom: idx < documents.length - 1 ? '1px solid var(--slate-100)' : 'none',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--slate-50)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      {doc.grantor ? (
                        <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                          {doc.grantor}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      {granteeNames ? (
                        <span style={{ color: 'var(--accent-primary)', fontWeight: '500' }}>
                          {granteeNames}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      {doc.documentTitle ? (
                        <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          {doc.documentTitle}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center' }}>
                      {doc.documentDate ? (
                        <span style={{
                          color: 'var(--text-secondary)',
                          fontSize: '0.8125rem',
                          fontFamily: 'var(--font-mono)',
                        }}>
                          {doc.documentDate}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center' }}>
                      {doc.dateRecorded ? (
                        <span style={{
                          color: 'var(--text-secondary)',
                          fontSize: '0.8125rem',
                          fontFamily: 'var(--font-mono)',
                        }}>
                          {doc.dateRecorded}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center' }}>
                      {doc.book || doc.page ? (
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: '500',
                          color: 'var(--text-primary)',
                          background: 'var(--slate-100)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8125rem',
                        }}>
                          {doc.book || '?'} / {doc.page || '?'}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center' }}>
                      {doc.instrumentNumber ? (
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: '600',
                          color: 'var(--accent-primary)',
                          background: 'rgba(99, 102, 241, 0.1)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8125rem',
                        }}>
                          {doc.instrumentNumber}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
