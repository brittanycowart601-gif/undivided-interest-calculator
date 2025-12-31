import { getSmoothStepPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';

/**
 * Custom edge that positions the label closer to the target (arrow end)
 */
export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  markerEnd,
  style,
}) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  // Position label closer to target (75% of the way from source to target)
  // Default labelX/labelY is at 50%, we want it at ~80%
  const labelOffsetX = sourceX + (targetX - sourceX) * 0.75;
  const labelOffsetY = sourceY + (targetY - sourceY) * 0.75;

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelOffsetX}px, ${labelOffsetY}px)`,
              background: 'var(--white)',
              border: '1px solid var(--slate-200)',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              pointerEvents: 'all',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
