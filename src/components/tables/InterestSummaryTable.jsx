import { formatFraction, getPersonColor } from '../../utils/formatters';

/**
 * Interest Summary Table
 * Design: Modern data table with clean lines
 */
export function InterestSummaryTable({ personTotals, persons }) {
  if (personTotals.length === 0) {
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
        No interests have been recorded yet.
      </div>
    );
  }

  const totalInterest = personTotals.reduce((s, pt) => s + pt.totalInterest, 0);
  const totalNodes = personTotals.reduce((s, pt) => s + pt.nodes.length, 0);

  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--slate-200)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.9375rem',
      }}>
        <thead>
          <tr style={{
            background: 'var(--slate-50)',
            borderBottom: '1px solid var(--slate-200)',
          }}>
            <th style={{
              padding: 'var(--space-4) var(--space-5)',
              textAlign: 'left',
              fontWeight: '600',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-secondary)',
            }}>
              Person
            </th>
            <th style={{
              padding: 'var(--space-4) var(--space-5)',
              textAlign: 'center',
              fontWeight: '600',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-secondary)',
            }}>
              Sources
            </th>
            <th style={{
              padding: 'var(--space-4) var(--space-5)',
              textAlign: 'right',
              fontWeight: '600',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-secondary)',
            }}>
              Total Interest
            </th>
          </tr>
        </thead>
        <tbody>
          {personTotals.map((pt, idx) => (
            <tr
              key={pt.person?.id || idx}
              style={{
                borderBottom: idx < personTotals.length - 1 ? '1px solid var(--slate-100)' : 'none',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--slate-50)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <td style={{
                padding: 'var(--space-4) var(--space-5)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: pt.person ? getPersonColor(pt.person.id, persons) : 'var(--slate-300)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--white)',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    flexShrink: 0,
                  }}>
                    {(pt.person?.primaryName || '?').charAt(0).toUpperCase()}
                  </div>
                  <span style={{
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                  }}>
                    {pt.person?.primaryName || 'Unknown'}
                  </span>
                </div>
              </td>
              <td style={{
                padding: 'var(--space-4) var(--space-5)',
                textAlign: 'center',
              }}>
                <span style={{
                  background: 'var(--slate-100)',
                  padding: 'var(--space-1) var(--space-3)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8125rem',
                  fontWeight: '500',
                  color: 'var(--text-secondary)',
                }}>
                  {pt.nodes.length}
                </span>
              </td>
              <td style={{
                padding: 'var(--space-4) var(--space-5)',
                textAlign: 'right',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: '600',
                  fontSize: '1rem',
                  color: 'var(--accent-primary)',
                }}>
                  {formatFraction(pt.totalInterest)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{
            background: 'linear-gradient(135deg, var(--slate-800), var(--slate-900))',
          }}>
            <td style={{
              padding: 'var(--space-4) var(--space-5)',
              color: 'var(--white)',
              fontWeight: '600',
            }}>
              Total Recorded
            </td>
            <td style={{
              padding: 'var(--space-4) var(--space-5)',
              textAlign: 'center',
            }}>
              <span style={{
                background: 'rgba(255,255,255,0.15)',
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem',
                fontWeight: '500',
                color: 'var(--white)',
              }}>
                {totalNodes}
              </span>
            </td>
            <td style={{
              padding: 'var(--space-4) var(--space-5)',
              textAlign: 'right',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: '700',
                fontSize: '1.125rem',
                color: 'var(--white)',
              }}>
                {formatFraction(totalInterest)}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
