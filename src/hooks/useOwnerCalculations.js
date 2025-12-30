import { useCallback } from 'react';

/**
 * Manages owner-related calculations and operations
 */
export function useOwnerCalculations(owners) {
  const calculateTotalPercentage = useCallback((ownerId, visited = new Set()) => {
    if (visited.has(ownerId)) return 0; // Prevent cycles
    visited.add(ownerId);

    const owner = owners.find(o => o.id === ownerId);
    if (!owner) return 0;
    if (owner.transfers.length === 0) return 100; // Root node

    let total = 0;
    for (const transfer of owner.transfers) {
      const parentTotal = calculateTotalPercentage(transfer.fromId, new Set(visited));
      total += (transfer.percentage / 100) * parentTotal;
    }
    return total;
  }, [owners]);

  const getChildren = useCallback((ownerId) => {
    return owners.filter(o => o.transfers.some(t => t.fromId === ownerId));
  }, [owners]);

  const getAllocatedPercentage = useCallback((ownerId) => {
    const children = getChildren(ownerId);
    return children.reduce((allocated, child) => {
      const fromThisOwner = child.transfers
        .filter(t => t.fromId === ownerId)
        .reduce((sum, t) => sum + t.percentage, 0);
      return allocated + fromThisOwner;
    }, 0);
  }, [getChildren]);

  const getRemainingPercentage = useCallback((ownerId) => {
    return 100 - getAllocatedPercentage(ownerId);
  }, [getAllocatedPercentage]);

  const getLeafOwners = useCallback(() => {
    // Return all owners who have remaining interest (current ownership > 0)
    // This includes:
    // 1. Owners with no children (terminal nodes)
    // 2. Owners who transferred only PART of their interest (still own the remainder)
    return owners.filter(o => {
      // Skip root nodes (they have no transfers - they ARE the source)
      if (o.transfers.length === 0) return false;

      // Calculate how much they've allocated to children
      const children = getChildren(o.id);
      const allocatedOut = children.reduce((allocated, child) => {
        const fromThisOwner = child.transfers
          .filter(t => t.fromId === o.id)
          .reduce((sum, t) => sum + t.percentage, 0);
        return allocated + fromThisOwner;
      }, 0);

      // They're a "leaf" owner if they haven't transferred out 100%
      return allocatedOut < 99.99; // Use threshold for floating point
    });
  }, [owners, getChildren]);

  // Get the level of a node (uses originalLevel if available, else calculates from first parent)
  const getNodeLevel = useCallback((ownerId) => {
    const owner = owners.find(o => o.id === ownerId);
    if (!owner) return 0;
    if (owner.transfers.length === 0) return 0;  // Root
    if (owner.originalLevel !== undefined) return owner.originalLevel;
    // Fallback for legacy nodes: calculate from first parent only
    const firstParent = owners.find(o => o.id === owner.transfers[0].fromId);
    if (!firstParent) return 1;
    return getNodeLevel(owner.transfers[0].fromId) + 1;
  }, [owners]);

  return {
    calculateTotalPercentage,
    getChildren,
    getAllocatedPercentage,
    getRemainingPercentage,
    getLeafOwners,
    getNodeLevel
  };
}
