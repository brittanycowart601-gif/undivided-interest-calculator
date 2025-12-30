import { useCallback } from 'react';

/**
 * Manages auto-layout calculation for the flow chart
 * Uses originalLevel when available to preserve node positions
 */
export function useAutoLayout(owners, getChildren) {
  return useCallback(() => {
    const NODE_WIDTH = 200;
    const NODE_HEIGHT = 200;
    const H_GAP = 80;
    const V_GAP = 150;

    // Calculate level for each node using originalLevel if available
    // This ensures nodes stay on their original row even with additional transfers
    const getLevel = (ownerId, memo = {}) => {
      if (memo[ownerId] !== undefined) return memo[ownerId];

      const owner = owners.find(o => o.id === ownerId);
      if (!owner) {
        memo[ownerId] = 0;
        return 0;
      }

      // Use stored originalLevel if available
      if (owner.originalLevel !== undefined) {
        memo[ownerId] = owner.originalLevel;
        return owner.originalLevel;
      }

      // Root node (no transfers)
      if (owner.transfers.length === 0) {
        memo[ownerId] = 0;
        return 0;
      }

      // Fallback for legacy nodes: calculate from first parent only
      const firstParentLevel = getLevel(owner.transfers[0].fromId, memo);
      memo[ownerId] = firstParentLevel + 1;
      return memo[ownerId];
    };

    // Group nodes by level
    const levels = {};
    const levelMemo = {};
    owners.forEach(o => {
      const level = getLevel(o.id, levelMemo);
      if (!levels[level]) levels[level] = [];
      levels[level].push(o);
    });

    // Calculate positions
    const positions = {};
    const maxNodes = Math.max(...Object.values(levels).map(l => l.length), 1);
    const totalWidth = Math.max(800, maxNodes * (NODE_WIDTH + H_GAP));

    Object.keys(levels).forEach(level => {
      const nodes = levels[level];
      const rowWidth = nodes.length * NODE_WIDTH + (nodes.length - 1) * H_GAP;
      const startX = (totalWidth - rowWidth) / 2;

      nodes.forEach((node, i) => {
        positions[node.id] = {
          x: startX + i * (NODE_WIDTH + H_GAP),
          y: 50 + parseInt(level) * (NODE_HEIGHT + V_GAP)
        };
      });
    });

    return positions;
  }, [owners, getChildren]);
}
