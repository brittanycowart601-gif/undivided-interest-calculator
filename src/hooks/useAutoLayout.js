import { useCallback } from 'react';

/**
 * Manages auto-layout calculation for the flow chart
 * Uses originalLevel when available to preserve node positions
 * Supports both vertical (top-to-bottom) and horizontal (left-to-right) layouts
 */
export function useAutoLayout(owners, getChildren, direction = 'vertical') {
  return useCallback(() => {
    const NODE_WIDTH = 180;
    const NODE_HEIGHT = 160;
    const H_GAP = 60;
    const V_GAP = 120;

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

    // Calculate positions based on direction
    const positions = {};
    const maxNodes = Math.max(...Object.values(levels).map(l => l.length), 1);

    if (direction === 'vertical') {
      // Top-to-bottom layout (original)
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
    } else {
      // Left-to-right layout (horizontal)
      const totalHeight = Math.max(500, maxNodes * (NODE_HEIGHT + V_GAP));

      Object.keys(levels).forEach(level => {
        const nodes = levels[level];
        const colHeight = nodes.length * NODE_HEIGHT + (nodes.length - 1) * V_GAP;
        const startY = (totalHeight - colHeight) / 2;

        nodes.forEach((node, i) => {
          positions[node.id] = {
            x: 50 + parseInt(level) * (NODE_WIDTH + H_GAP + 40),
            y: startY + i * (NODE_HEIGHT + V_GAP)
          };
        });
      });
    }

    return positions;
  }, [owners, getChildren, direction]);
}
