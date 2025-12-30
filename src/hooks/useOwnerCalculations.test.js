import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOwnerCalculations } from './useOwnerCalculations';

// ============================================================================
// Test Data Fixtures
// ============================================================================

// Simple chain: Root -> A (50%) -> B (100% of A's share)
const simpleChainOwners = [
  { id: 'root', name: 'Original Owner', transfers: [] },
  { id: 'a', name: 'Owner A', transfers: [{ fromId: 'root', percentage: 50 }] },
  { id: 'b', name: 'Owner B', transfers: [{ fromId: 'a', percentage: 100 }] }
];

// Multiple children: Root -> A (25%), B (25%), C (50%)
const multipleChildrenOwners = [
  { id: 'root', name: 'Original Owner', transfers: [] },
  { id: 'a', name: 'Owner A', transfers: [{ fromId: 'root', percentage: 25 }] },
  { id: 'b', name: 'Owner B', transfers: [{ fromId: 'root', percentage: 25 }] },
  { id: 'c', name: 'Owner C', transfers: [{ fromId: 'root', percentage: 50 }] }
];

// Partial transfer: Root -> A (50%), A keeps 50% remaining
const partialTransferOwners = [
  { id: 'root', name: 'Original Owner', transfers: [] },
  { id: 'a', name: 'Owner A', transfers: [{ fromId: 'root', percentage: 100 }] },
  { id: 'b', name: 'Owner B', transfers: [{ fromId: 'a', percentage: 50 }] }
  // Owner A transferred only 50%, so they still own 50%
];

// Multiple sources: C receives from both A and B
const multipleSourcesOwners = [
  { id: 'root', name: 'Original Owner', transfers: [] },
  { id: 'a', name: 'Owner A', transfers: [{ fromId: 'root', percentage: 50 }] },
  { id: 'b', name: 'Owner B', transfers: [{ fromId: 'root', percentage: 50 }] },
  { id: 'c', name: 'Owner C', transfers: [
    { fromId: 'a', percentage: 50 },  // 50% of A's 50% = 25%
    { fromId: 'b', percentage: 50 }   // 50% of B's 50% = 25%
  ]}
];

// Deep chain: Root -> A -> B -> C -> D
const deepChainOwners = [
  { id: 'root', name: 'Original Owner', transfers: [] },
  { id: 'a', name: 'Owner A', transfers: [{ fromId: 'root', percentage: 100 }] },
  { id: 'b', name: 'Owner B', transfers: [{ fromId: 'a', percentage: 50 }] },
  { id: 'c', name: 'Owner C', transfers: [{ fromId: 'b', percentage: 50 }] },
  { id: 'd', name: 'Owner D', transfers: [{ fromId: 'c', percentage: 50 }] }
];

// Complex tree with partial transfers at multiple levels
const complexTreeOwners = [
  { id: 'root', name: 'Original Owner', transfers: [] },
  // Root transfers 100% to A
  { id: 'a', name: 'Owner A', transfers: [{ fromId: 'root', percentage: 100 }] },
  // A transfers 50% to B and 25% to C (keeps 25%)
  { id: 'b', name: 'Owner B', transfers: [{ fromId: 'a', percentage: 50 }] },
  { id: 'c', name: 'Owner C', transfers: [{ fromId: 'a', percentage: 25 }] },
  // B transfers 50% to D (keeps 50% of their 50% = 25% total)
  { id: 'd', name: 'Owner D', transfers: [{ fromId: 'b', percentage: 50 }] }
];

// ============================================================================
// calculateTotalPercentage Tests
// ============================================================================
describe('useOwnerCalculations', () => {
  describe('calculateTotalPercentage', () => {
    it('should return 100 for root node', () => {
      const { result } = renderHook(() => useOwnerCalculations(simpleChainOwners));
      expect(result.current.calculateTotalPercentage('root')).toBe(100);
    });

    it('should calculate simple transfer correctly', () => {
      const { result } = renderHook(() => useOwnerCalculations(simpleChainOwners));
      expect(result.current.calculateTotalPercentage('a')).toBe(50);
    });

    it('should calculate chain transfer correctly', () => {
      const { result } = renderHook(() => useOwnerCalculations(simpleChainOwners));
      // B gets 100% of A's 50% = 50%
      expect(result.current.calculateTotalPercentage('b')).toBe(50);
    });

    it('should calculate multiple children correctly', () => {
      const { result } = renderHook(() => useOwnerCalculations(multipleChildrenOwners));
      expect(result.current.calculateTotalPercentage('a')).toBe(25);
      expect(result.current.calculateTotalPercentage('b')).toBe(25);
      expect(result.current.calculateTotalPercentage('c')).toBe(50);
    });

    it('should calculate multiple sources correctly', () => {
      const { result } = renderHook(() => useOwnerCalculations(multipleSourcesOwners));
      // C gets 50% of A's 50% (25%) + 50% of B's 50% (25%) = 50%
      expect(result.current.calculateTotalPercentage('c')).toBe(50);
    });

    it('should calculate deep chain correctly', () => {
      const { result } = renderHook(() => useOwnerCalculations(deepChainOwners));
      expect(result.current.calculateTotalPercentage('a')).toBe(100);
      expect(result.current.calculateTotalPercentage('b')).toBe(50);
      expect(result.current.calculateTotalPercentage('c')).toBe(25);
      expect(result.current.calculateTotalPercentage('d')).toBe(12.5);
    });

    it('should return 0 for unknown owner', () => {
      const { result } = renderHook(() => useOwnerCalculations(simpleChainOwners));
      expect(result.current.calculateTotalPercentage('unknown')).toBe(0);
    });

    it('should handle fractional percentages', () => {
      const owners = [
        { id: 'root', transfers: [] },
        { id: 'a', transfers: [{ fromId: 'root', percentage: 33.333333 }] }
      ];
      const { result } = renderHook(() => useOwnerCalculations(owners));
      expect(result.current.calculateTotalPercentage('a')).toBeCloseTo(33.333333, 4);
    });
  });

  // ============================================================================
  // getChildren Tests
  // ============================================================================
  describe('getChildren', () => {
    it('should return empty array for leaf nodes', () => {
      const { result } = renderHook(() => useOwnerCalculations(simpleChainOwners));
      expect(result.current.getChildren('b')).toEqual([]);
    });

    it('should return direct children only', () => {
      const { result } = renderHook(() => useOwnerCalculations(simpleChainOwners));
      const children = result.current.getChildren('root');
      expect(children.length).toBe(1);
      expect(children[0].id).toBe('a');
    });

    it('should return multiple children', () => {
      const { result } = renderHook(() => useOwnerCalculations(multipleChildrenOwners));
      const children = result.current.getChildren('root');
      expect(children.length).toBe(3);
      expect(children.map(c => c.id).sort()).toEqual(['a', 'b', 'c']);
    });

    it('should handle nodes with no children', () => {
      const { result } = renderHook(() => useOwnerCalculations(multipleChildrenOwners));
      expect(result.current.getChildren('a')).toEqual([]);
      expect(result.current.getChildren('b')).toEqual([]);
      expect(result.current.getChildren('c')).toEqual([]);
    });
  });

  // ============================================================================
  // getAllocatedPercentage Tests
  // ============================================================================
  describe('getAllocatedPercentage', () => {
    it('should return 0 for nodes with no children', () => {
      const { result } = renderHook(() => useOwnerCalculations(simpleChainOwners));
      expect(result.current.getAllocatedPercentage('b')).toBe(0);
    });

    it('should calculate total allocated to children', () => {
      const { result } = renderHook(() => useOwnerCalculations(multipleChildrenOwners));
      // Root allocated 25 + 25 + 50 = 100%
      expect(result.current.getAllocatedPercentage('root')).toBe(100);
    });

    it('should handle partial allocation', () => {
      const { result } = renderHook(() => useOwnerCalculations(partialTransferOwners));
      // A allocated only 50% to B
      expect(result.current.getAllocatedPercentage('a')).toBe(50);
    });

    it('should count only transfers from this specific owner', () => {
      const { result } = renderHook(() => useOwnerCalculations(multipleSourcesOwners));
      // A allocated 50% to C
      expect(result.current.getAllocatedPercentage('a')).toBe(50);
      // B allocated 50% to C
      expect(result.current.getAllocatedPercentage('b')).toBe(50);
    });
  });

  // ============================================================================
  // getRemainingPercentage Tests
  // ============================================================================
  describe('getRemainingPercentage', () => {
    it('should return 100 for nodes with no children', () => {
      const { result } = renderHook(() => useOwnerCalculations(simpleChainOwners));
      expect(result.current.getRemainingPercentage('b')).toBe(100);
    });

    it('should return 0 when fully allocated', () => {
      const { result } = renderHook(() => useOwnerCalculations(multipleChildrenOwners));
      expect(result.current.getRemainingPercentage('root')).toBe(0);
    });

    it('should calculate remaining correctly', () => {
      const { result } = renderHook(() => useOwnerCalculations(partialTransferOwners));
      // A allocated 50%, so 50% remaining
      expect(result.current.getRemainingPercentage('a')).toBe(50);
    });

    it('should handle complex partial allocations', () => {
      const { result } = renderHook(() => useOwnerCalculations(complexTreeOwners));
      // A allocated 50% to B and 25% to C = 75%, remaining 25%
      expect(result.current.getRemainingPercentage('a')).toBe(25);
      // B allocated 50% to D, remaining 50%
      expect(result.current.getRemainingPercentage('b')).toBe(50);
    });
  });

  // ============================================================================
  // getLeafOwners Tests
  // ============================================================================
  describe('getLeafOwners', () => {
    it('should return terminal nodes in simple chain', () => {
      const { result } = renderHook(() => useOwnerCalculations(simpleChainOwners));
      const leaves = result.current.getLeafOwners();
      expect(leaves.length).toBe(1);
      expect(leaves[0].id).toBe('b');
    });

    it('should return all terminal nodes', () => {
      const { result } = renderHook(() => useOwnerCalculations(multipleChildrenOwners));
      const leaves = result.current.getLeafOwners();
      expect(leaves.length).toBe(3);
      expect(leaves.map(l => l.id).sort()).toEqual(['a', 'b', 'c']);
    });

    it('should NOT include root nodes', () => {
      const { result } = renderHook(() => useOwnerCalculations(simpleChainOwners));
      const leaves = result.current.getLeafOwners();
      expect(leaves.find(l => l.id === 'root')).toBeUndefined();
    });

    it('should include owners with partial transfers (remaining interest)', () => {
      const { result } = renderHook(() => useOwnerCalculations(partialTransferOwners));
      const leaves = result.current.getLeafOwners();
      // Both A (50% remaining) and B (50% received) should be leaves
      expect(leaves.length).toBe(2);
      expect(leaves.map(l => l.id).sort()).toEqual(['a', 'b']);
    });

    it('should handle complex tree with multiple partial transfers', () => {
      const { result } = renderHook(() => useOwnerCalculations(complexTreeOwners));
      const leaves = result.current.getLeafOwners();
      // A keeps 25%, B keeps 25% (50% of their 50%), C has 25%, D has 25%
      expect(leaves.length).toBe(4);
      expect(leaves.map(l => l.id).sort()).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should NOT include owners who transferred 100%', () => {
      const fullyTransferredOwners = [
        { id: 'root', transfers: [] },
        { id: 'a', transfers: [{ fromId: 'root', percentage: 100 }] },
        { id: 'b', transfers: [{ fromId: 'a', percentage: 100 }] }  // A transferred all
      ];
      const { result } = renderHook(() => useOwnerCalculations(fullyTransferredOwners));
      const leaves = result.current.getLeafOwners();
      expect(leaves.length).toBe(1);
      expect(leaves[0].id).toBe('b');
    });
  });

  // ============================================================================
  // getNodeLevel Tests
  // ============================================================================
  describe('getNodeLevel', () => {
    it('should return 0 for root node', () => {
      const { result } = renderHook(() => useOwnerCalculations(simpleChainOwners));
      expect(result.current.getNodeLevel('root')).toBe(0);
    });

    it('should return correct level for simple chain', () => {
      const { result } = renderHook(() => useOwnerCalculations(simpleChainOwners));
      expect(result.current.getNodeLevel('a')).toBe(1);
      expect(result.current.getNodeLevel('b')).toBe(2);
    });

    it('should return correct level for deep chain', () => {
      const { result } = renderHook(() => useOwnerCalculations(deepChainOwners));
      expect(result.current.getNodeLevel('root')).toBe(0);
      expect(result.current.getNodeLevel('a')).toBe(1);
      expect(result.current.getNodeLevel('b')).toBe(2);
      expect(result.current.getNodeLevel('c')).toBe(3);
      expect(result.current.getNodeLevel('d')).toBe(4);
    });

    it('should use originalLevel if set', () => {
      const ownersWithLevels = [
        { id: 'root', transfers: [], originalLevel: 0 },
        { id: 'a', transfers: [{ fromId: 'root', percentage: 50 }], originalLevel: 1 },
        { id: 'b', transfers: [
          { fromId: 'root', percentage: 50 },
          { fromId: 'a', percentage: 50 }
        ], originalLevel: 1 }  // Multiple sources but stays on level 1
      ];
      const { result } = renderHook(() => useOwnerCalculations(ownersWithLevels));
      expect(result.current.getNodeLevel('b')).toBe(1);
    });

    it('should return 0 for unknown owner', () => {
      const { result } = renderHook(() => useOwnerCalculations(simpleChainOwners));
      expect(result.current.getNodeLevel('unknown')).toBe(0);
    });
  });

  // ============================================================================
  // Integration / Scenario Tests
  // ============================================================================
  describe('real-world scenarios', () => {
    it('should handle inheritance split between children', () => {
      // Parent dies, estate split between 3 children
      const inheritanceOwners = [
        { id: 'parent', name: 'Parent', transfers: [] },
        { id: 'child1', name: 'Child 1', transfers: [{ fromId: 'parent', percentage: 33.333333 }] },
        { id: 'child2', name: 'Child 2', transfers: [{ fromId: 'parent', percentage: 33.333333 }] },
        { id: 'child3', name: 'Child 3', transfers: [{ fromId: 'parent', percentage: 33.333334 }] }
      ];
      const { result } = renderHook(() => useOwnerCalculations(inheritanceOwners));

      const leaves = result.current.getLeafOwners();
      expect(leaves.length).toBe(3);

      const total = leaves.reduce((sum, leaf) =>
        sum + result.current.calculateTotalPercentage(leaf.id), 0);
      expect(total).toBeCloseTo(100, 4);
    });

    it('should handle multi-generational transfer', () => {
      // Great-grandparent -> grandparent -> parent -> child
      const generationalOwners = [
        { id: 'ggp', name: 'Great Grandparent', transfers: [] },
        { id: 'gp1', name: 'Grandparent 1', transfers: [{ fromId: 'ggp', percentage: 50 }] },
        { id: 'gp2', name: 'Grandparent 2', transfers: [{ fromId: 'ggp', percentage: 50 }] },
        { id: 'p1', name: 'Parent 1', transfers: [{ fromId: 'gp1', percentage: 100 }] },
        { id: 'p2', name: 'Parent 2', transfers: [{ fromId: 'gp2', percentage: 50 }] },
        { id: 'c1', name: 'Child 1', transfers: [{ fromId: 'p1', percentage: 50 }] }
      ];
      const { result } = renderHook(() => useOwnerCalculations(generationalOwners));

      // Child 1: 50% of Parent 1's 50% = 25%
      expect(result.current.calculateTotalPercentage('c1')).toBe(25);
      // Parent 1 keeps: 50% of 50% = 25%
      expect(result.current.getRemainingPercentage('p1')).toBe(50);
      // GP2 keeps: 50% remaining
      expect(result.current.getRemainingPercentage('gp2')).toBe(50);

      const leaves = result.current.getLeafOwners();
      // P1 (25% remaining), P2 (25% total), GP2 (25% remaining), C1 (25% total)
      expect(leaves.length).toBe(4);
    });

    it('should handle property sold to outsider', () => {
      // Original owner sells 100% to new owner
      const saleOwners = [
        { id: 'seller', name: 'Seller', transfers: [] },
        { id: 'buyer', name: 'Buyer', transfers: [{ fromId: 'seller', percentage: 100 }] }
      ];
      const { result } = renderHook(() => useOwnerCalculations(saleOwners));

      expect(result.current.calculateTotalPercentage('buyer')).toBe(100);
      expect(result.current.getRemainingPercentage('seller')).toBe(0);

      const leaves = result.current.getLeafOwners();
      expect(leaves.length).toBe(1);
      expect(leaves[0].id).toBe('buyer');
    });
  });
});
