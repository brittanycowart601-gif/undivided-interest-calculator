import { Handle, Position } from 'reactflow';
import { formatFraction } from '../utils/formatters';

/**
 * Owner node component for ReactFlow
 * Design: Compact card with clear data hierarchy
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
    nodeColor,
    nodeBorderColor
  } = data;

  // Determine colors
  const bgColor = nodeColor || 'var(--white)';
  const hasCustomColor = !!nodeColor;
  const textColor = hasCustomColor ? '#fff' : 'var(--text-primary)';
  const subtextColor = hasCustomColor ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)';
  const borderColor = nodeBorderColor || (isRoot ? 'var(--accent-primary)' : 'var(--slate-200)');

  // Icon components
  const IconPlus = () => (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 2v8M2 6h8" />
    </svg>
  );

  const IconEdit = () => (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 1.5l2 2L4 10H2V8l6.5-6.5z" />
    </svg>
  );

  const IconLink = () => (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 7l2-2M4.5 8.5L3 10a1.5 1.5 0 01-2-2l1.5-1.5M7.5 3.5L9 2a1.5 1.5 0 012 2l-1.5 1.5" />
    </svg>
  );

  return (
    <div
      style={{
        width: '160px',
        background: bgColor,
        borderRadius: '8px',
        border: `2px solid ${borderColor}`,
        boxShadow: isRoot
          ? '0 4px 12px rgba(15, 23, 42, 0.1), 0 0 0 1px var(--accent-primary-light)'
          : '0 2px 4px rgba(15, 23, 42, 0.06)',
        fontFamily: 'var(--font-body)',
        overflow: 'hidden',
      }}
    >
      <Handle type="target" position={Position.Top} style={{
        width: '10px',
        height: '10px',
        background: 'var(--accent-primary)',
        border: '2px solid var(--white)',
      }} />

      {/* Main Content - Compact */}
      <div style={{
        padding: '10px 12px 8px',
        textAlign: 'center',
      }}>
        {/* Name */}
        <h3 style={{
          fontSize: '0.8125rem',
          fontWeight: '600',
          color: textColor,
          marginBottom: '4px',
          lineHeight: 1.2,
          wordBreak: 'break-word',
        }}>
          {owner.nameAsWritten || owner.name}
        </h3>

        {/* Transfer Calculation - Compact */}
        {!isRoot && transferBreakdown && transferBreakdown.length > 0 && (
          <div style={{
            background: hasCustomColor ? 'rgba(255,255,255,0.1)' : 'var(--slate-50)',
            borderRadius: '4px',
            padding: '4px 6px',
            marginBottom: '6px',
          }}>
            {transferBreakdown.map((tb, idx) => (
              <div key={idx} style={{
                fontSize: '0.625rem',
                color: subtextColor,
                fontFamily: 'var(--font-mono)',
              }}>
                {tb.transferFraction} × {tb.parentFraction} = {tb.resultFraction}
              </div>
            ))}
          </div>
        )}

        {/* Interest Display - Compact */}
        <div style={{
          background: isRoot
            ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-primary-dark))'
            : hasCustomColor
              ? 'rgba(255,255,255,0.2)'
              : 'linear-gradient(135deg, var(--slate-800), var(--slate-900))',
          borderRadius: '6px',
          padding: '6px 10px',
          display: 'inline-block',
        }}>
          <div style={{
            fontSize: '1rem',
            fontWeight: '700',
            color: 'var(--white)',
            fontFamily: 'var(--font-mono)',
            lineHeight: 1,
          }}>
            {formatFraction(currentOwnership)}
          </div>
        </div>
      </div>

      {/* Action Buttons - Compact */}
      <div className="no-print" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        borderTop: `1px solid ${hasCustomColor ? 'rgba(255,255,255,0.15)' : 'var(--slate-100)'}`,
      }}>
        <button
          onClick={(e) => { e.stopPropagation(); onAddGrantee(id); }}
          style={{
            background: 'transparent',
            border: 'none',
            borderRight: `1px solid ${hasCustomColor ? 'rgba(255,255,255,0.15)' : 'var(--slate-100)'}`,
            padding: '6px 4px',
            cursor: 'pointer',
            color: hasCustomColor ? 'rgba(255,255,255,0.8)' : 'var(--text-tertiary)',
            fontSize: '0.625rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
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
            padding: '6px 4px',
            cursor: 'pointer',
            color: hasCustomColor ? 'rgba(255,255,255,0.8)' : 'var(--text-tertiary)',
            fontSize: '0.625rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
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
            padding: '6px 4px',
            cursor: 'pointer',
            color: hasCustomColor ? 'rgba(255,255,255,0.8)' : 'var(--text-tertiary)',
            fontSize: '0.625rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
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
      </div>

      <Handle type="source" position={Position.Bottom} style={{
        width: '10px',
        height: '10px',
        background: 'var(--accent-primary)',
        border: '2px solid var(--white)',
      }} />
    </div>
  );
}
