import { Handle, Position } from 'reactflow';
import { formatFraction } from '../utils/formatters';

/**
 * Owner node component for ReactFlow
 * Design: Modern card with clear data hierarchy
 */
export function OwnerNode({ data, id }) {
  const {
    owner,
    isRoot,
    totalReceived,
    currentOwnership,
    allocatedOut,
    transferBreakdown,
    onAddGrantee,
    onEdit,
    onDelete,
    onAddTransfer,
    onViewNotes,
    hasNotes,
    transferCount,
    person,
    personColor,
    hasSamePersonNodes,
    nodeColor,
    nodeBorderColor
  } = data;

  // Determine colors - use custom colors if set, otherwise use modern theme
  const bgColor = nodeColor || 'var(--white)';
  const hasCustomColor = !!nodeColor;
  const textColor = hasCustomColor ? '#fff' : 'var(--text-primary)';
  const subtextColor = hasCustomColor ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)';
  const borderColor = nodeBorderColor || (isRoot ? 'var(--accent-primary)' : 'var(--slate-200)');

  // Icon components
  const IconPlus = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 2v8M2 6h8" />
    </svg>
  );

  const IconEdit = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 1.5l2 2L4 10H2V8l6.5-6.5z" />
    </svg>
  );

  const IconTrash = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 3h9M4.5 3V1.5h3V3M3 3l.5 7.5h5L9 3" />
    </svg>
  );

  const IconLink = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 7l2-2M4.5 8.5L3 10a1.5 1.5 0 01-2-2l1.5-1.5M7.5 3.5L9 2a1.5 1.5 0 012 2l-1.5 1.5" />
    </svg>
  );

  const IconNote = () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 1h6a1 1 0 011 1v6a1 1 0 01-1 1H2a1 1 0 01-1-1V2a1 1 0 011-1zM3 3h4M3 5h4M3 7h2" />
    </svg>
  );

  return (
    <div
      className={hasSamePersonNodes ? 'same-person-node' : ''}
      style={{
        width: '200px',
        background: bgColor,
        borderRadius: 'var(--radius-md)',
        border: `2px solid ${borderColor}`,
        boxShadow: isRoot
          ? 'var(--shadow-md), 0 0 0 1px var(--accent-primary-light)'
          : 'var(--shadow-sm)',
        fontFamily: 'var(--font-body)',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = isRoot
          ? 'var(--shadow-md), 0 0 0 1px var(--accent-primary-light)'
          : 'var(--shadow-sm)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <Handle type="target" position={Position.Top} style={{
        width: '12px',
        height: '12px',
        background: 'var(--accent-primary)',
        border: '2px solid var(--white)',
        boxShadow: 'var(--shadow-sm)',
      }} />

      {/* Person Badge - Top */}
      {person && (
        <div style={{
          background: personColor || 'var(--accent-primary)',
          padding: 'var(--space-2) var(--space-3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-2)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: 'var(--white)',
              fontWeight: '600',
            }}>
              {person.primaryName.charAt(0).toUpperCase()}
            </div>
            <span style={{
              color: 'var(--white)',
              fontSize: '0.75rem',
              fontWeight: '500',
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {person.primaryName}
            </span>
          </div>
          {person.aliases?.length > 0 && (
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'var(--white)',
              fontSize: '0.625rem',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
            }}>
              +{person.aliases.length}
            </span>
          )}
        </div>
      )}

      {/* Main Content */}
      <div style={{
        padding: 'var(--space-4)',
        textAlign: 'center',
      }}>
        {/* Name */}
        <h3 style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          color: textColor,
          marginBottom: 'var(--space-1)',
          lineHeight: 1.3,
          wordBreak: 'break-word',
        }}>
          {owner.nameAsWritten || owner.name}
        </h3>

        {/* Relationship label */}
        {owner.relationship && (
          <div style={{
            fontSize: '0.6875rem',
            color: subtextColor,
            fontStyle: 'italic',
            marginBottom: 'var(--space-2)',
          }}>
            {owner.relationship}
          </div>
        )}

        {/* Transfer Calculation */}
        {!isRoot && transferBreakdown && transferBreakdown.length > 0 && (
          <div style={{
            background: hasCustomColor ? 'rgba(255,255,255,0.1)' : 'var(--slate-50)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-2)',
            marginBottom: 'var(--space-3)',
          }}>
            {transferBreakdown.map((tb, idx) => (
              <div key={idx} style={{
                fontSize: '0.6875rem',
                color: subtextColor,
                fontFamily: 'var(--font-mono)',
              }}>
                {tb.transferFraction} × {tb.parentFraction} = {tb.resultFraction}
              </div>
            ))}
          </div>
        )}

        {/* Interest Display - The Hero */}
        <div style={{
          background: isRoot
            ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-primary-dark))'
            : hasCustomColor
              ? 'rgba(255,255,255,0.2)'
              : 'linear-gradient(135deg, var(--slate-800), var(--slate-900))',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3) var(--space-4)',
          margin: '0 auto',
          display: 'inline-block',
          minWidth: '80px',
        }}>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: 'var(--white)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>
            {formatFraction(currentOwnership)}
          </div>
          <div style={{
            fontSize: '0.625rem',
            color: 'rgba(255,255,255,0.8)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginTop: 'var(--space-1)',
          }}>
            Current Interest
          </div>
        </div>

        {/* Transfer Info - if they've conveyed */}
        {allocatedOut > 0.01 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-4)',
            marginTop: 'var(--space-3)',
            fontSize: '0.6875rem',
          }}>
            <div>
              <div style={{ color: subtextColor }}>Received</div>
              <div style={{
                fontWeight: '600',
                color: textColor,
                fontFamily: 'var(--font-mono)',
              }}>
                {formatFraction(totalReceived)}
              </div>
            </div>
            <div>
              <div style={{ color: subtextColor }}>Conveyed</div>
              <div style={{
                fontWeight: '600',
                color: 'var(--accent-tertiary)',
                fontFamily: 'var(--font-mono)',
              }}>
                {formatFraction((totalReceived * allocatedOut) / 100)}
              </div>
            </div>
          </div>
        )}

        {/* Indicators */}
        {(hasNotes || transferCount > 1) && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-3)',
          }}>
            {hasNotes && (
              <button
                onClick={(e) => { e.stopPropagation(); onViewNotes(id); }}
                style={{
                  background: hasCustomColor ? 'rgba(255,255,255,0.15)' : 'var(--slate-100)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-1) var(--space-2)',
                  fontSize: '0.625rem',
                  color: hasCustomColor ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = hasCustomColor ? 'rgba(255,255,255,0.25)' : 'var(--slate-200)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = hasCustomColor ? 'rgba(255,255,255,0.15)' : 'var(--slate-100)';
                }}
              >
                <IconNote /> Notes
              </button>
            )}
            {transferCount > 1 && (
              <span style={{
                background: hasCustomColor ? 'rgba(255,255,255,0.15)' : 'var(--slate-100)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-1) var(--space-2)',
                fontSize: '0.625rem',
                color: hasCustomColor ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <IconLink /> {transferCount} sources
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="no-print" style={{
        display: 'grid',
        gridTemplateColumns: isRoot ? '1fr 1fr 1fr' : '1fr 1fr 1fr 1fr',
        borderTop: `1px solid ${hasCustomColor ? 'rgba(255,255,255,0.15)' : 'var(--slate-100)'}`,
      }}>
        <button
          onClick={(e) => { e.stopPropagation(); onAddGrantee(id); }}
          style={{
            background: 'transparent',
            border: 'none',
            borderRight: `1px solid ${hasCustomColor ? 'rgba(255,255,255,0.15)' : 'var(--slate-100)'}`,
            padding: 'var(--space-2)',
            cursor: 'pointer',
            color: hasCustomColor ? 'rgba(255,255,255,0.8)' : 'var(--text-tertiary)',
            fontSize: '0.6875rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = hasCustomColor ? 'rgba(255,255,255,0.1)' : 'var(--slate-50)';
            e.currentTarget.style.color = 'var(--accent-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = hasCustomColor ? 'rgba(255,255,255,0.8)' : 'var(--text-tertiary)';
          }}
          title="Add Grantee"
        >
          <IconPlus /> Grantee
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onAddTransfer(id); }}
          style={{
            background: 'transparent',
            border: 'none',
            borderRight: `1px solid ${hasCustomColor ? 'rgba(255,255,255,0.15)' : 'var(--slate-100)'}`,
            padding: 'var(--space-2)',
            cursor: 'pointer',
            color: hasCustomColor ? 'rgba(255,255,255,0.8)' : 'var(--text-tertiary)',
            fontSize: '0.6875rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = hasCustomColor ? 'rgba(255,255,255,0.1)' : 'var(--slate-50)';
            e.currentTarget.style.color = 'var(--accent-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = hasCustomColor ? 'rgba(255,255,255,0.8)' : 'var(--text-tertiary)';
          }}
          title="Add Source"
        >
          <IconLink /> Source
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(id); }}
          style={{
            background: 'transparent',
            border: 'none',
            borderRight: !isRoot ? `1px solid ${hasCustomColor ? 'rgba(255,255,255,0.15)' : 'var(--slate-100)'}` : 'none',
            padding: 'var(--space-2)',
            cursor: 'pointer',
            color: hasCustomColor ? 'rgba(255,255,255,0.8)' : 'var(--text-tertiary)',
            fontSize: '0.6875rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = hasCustomColor ? 'rgba(255,255,255,0.1)' : 'var(--slate-50)';
            e.currentTarget.style.color = 'var(--accent-tertiary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = hasCustomColor ? 'rgba(255,255,255,0.8)' : 'var(--text-tertiary)';
          }}
          title="Edit"
        >
          <IconEdit /> Edit
        </button>
        {!isRoot && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(id); }}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 'var(--space-2)',
              cursor: 'pointer',
              color: hasCustomColor ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)',
              fontSize: '0.6875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.color = 'var(--error)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = hasCustomColor ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)';
            }}
            title="Delete"
          >
            <IconTrash />
          </button>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} style={{
        width: '12px',
        height: '12px',
        background: 'var(--accent-primary)',
        border: '2px solid var(--white)',
        boxShadow: 'var(--shadow-sm)',
      }} />
    </div>
  );
}
