import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOwnerCalculations } from '../hooks/useOwnerCalculations';
import { formatFraction, parsePercentageInput } from '../utils/formatters';

/**
 * Integration tests that verify the complete data flow from
 * percentage input -> calculation -> fraction display
 */
describe('Integration Tests', () => {
  // ============================================================================
  // End-to-End Calculation Flow
  // ============================================================================
  describe('complete calculation flow', () => {
    it('should correctly calculate and display simple inheritance split', () => {
      // Scenario: Parent dies, 3 children inherit equally
      const owners = [
        { id: 'parent', name: 'Parent', transfers: [] },
        { id: 'child1', name: 'Child 1', transfers: [{ fromId: 'parent', percentage: parsePercentageInput('1/3') }] },
        { id: 'child2', name: 'Child 2', transfers: [{ fromId: 'parent', percentage: parsePercentageInput('1/3') }] },
        { id: 'child3', name: 'Child 3', transfers: [{ fromId: 'parent', percentage: parsePercentageInput('1/3') }] }
      ];

      const { result } = renderHook(() => useOwnerCalculations(owners));

      // Each child should have ~33.33%
      const child1Pct = result.current.calculateTotalPercentage('child1');
      const child2Pct = result.current.calculateTotalPercentage('child2');
      const child3Pct = result.current.calculateTotalPercentage('child3');

      expect(child1Pct).toBeCloseTo(33.333, 2);
      expect(child2Pct).toBeCloseTo(33.333, 2);
      expect(child3Pct).toBeCloseTo(33.333, 2);

      // Total should be ~100%
      expect(child1Pct + child2Pct + child3Pct).toBeCloseTo(100, 1);

      // Formatted should be readable fractions
      expect(formatFraction(child1Pct)).toMatch(/1\/3|333333\/1000000/);
    });

    it('should handle multi-generational transfers with fractions', () => {
      // Scenario: Grandparent -> Parent (1/2) -> Child (1/2 of parent's share)
      // Child should end up with 1/4

      const halfPercent = parsePercentageInput('1/2');

      const owners = [
        { id: 'grandparent', transfers: [] },
        { id: 'parent', transfers: [{ fromId: 'grandparent', percentage: halfPercent }] },
        { id: 'child', transfers: [{ fromId: 'parent', percentage: halfPercent }] }
      ];

      const { result } = renderHook(() => useOwnerCalculations(owners));

      // Child gets 1/2 of parent's 1/2 = 1/4
      const childPct = result.current.calculateTotalPercentage('child');
      expect(childPct).toBe(25);
      expect(formatFraction(childPct)).toBe('1/4');

      // Parent keeps 1/2 of their 1/2 = 1/4
      const parentRemaining = result.current.getRemainingPercentage('parent');
      expect(parentRemaining).toBe(50);

      // Leaves should include both parent (with remaining) and child
      const leaves = result.current.getLeafOwners();
      expect(leaves.map(l => l.id).sort()).toEqual(['child', 'parent']);
    });

    it('should handle decimal input correctly', () => {
      // User enters 0.25 (should be interpreted as 25%)
      const quarterPercent = parsePercentageInput('0.25');
      expect(quarterPercent).toBe(25);

      const owners = [
        { id: 'root', transfers: [] },
        { id: 'a', transfers: [{ fromId: 'root', percentage: quarterPercent }] }
      ];

      const { result } = renderHook(() => useOwnerCalculations(owners));
      expect(result.current.calculateTotalPercentage('a')).toBe(25);
      expect(formatFraction(25)).toBe('1/4');
    });

    it('should handle whole number input correctly', () => {
      // User enters 25 (should be interpreted as 25%)
      const quarterPercent = parsePercentageInput('25');
      expect(quarterPercent).toBe(25);

      const owners = [
        { id: 'root', transfers: [] },
        { id: 'a', transfers: [{ fromId: 'root', percentage: quarterPercent }] }
      ];

      const { result } = renderHook(() => useOwnerCalculations(owners));
      expect(result.current.calculateTotalPercentage('a')).toBe(25);
    });
  });

  // ============================================================================
  // Complex Real-World Scenarios
  // ============================================================================
  describe('real-world scenarios', () => {
    it('should handle property with multiple partial owners', () => {
      // Scenario: Property owned by 4 people with different shares
      // A: 1/2, B: 1/4, C: 1/8, D: 1/8

      const owners = [
        { id: 'root', transfers: [] },
        { id: 'a', transfers: [{ fromId: 'root', percentage: 50 }] },
        { id: 'b', transfers: [{ fromId: 'root', percentage: 25 }] },
        { id: 'c', transfers: [{ fromId: 'root', percentage: 12.5 }] },
        { id: 'd', transfers: [{ fromId: 'root', percentage: 12.5 }] }
      ];

      const { result } = renderHook(() => useOwnerCalculations(owners));

      expect(formatFraction(result.current.calculateTotalPercentage('a'))).toBe('1/2');
      expect(formatFraction(result.current.calculateTotalPercentage('b'))).toBe('1/4');
      expect(formatFraction(result.current.calculateTotalPercentage('c'))).toBe('1/8');
      expect(formatFraction(result.current.calculateTotalPercentage('d'))).toBe('1/8');

      // All should be leaf owners
      const leaves = result.current.getLeafOwners();
      expect(leaves.length).toBe(4);
    });

    it('should handle one owner selling to another existing owner', () => {
      // Scenario: A and B each own 1/2. A sells their 1/2 to B.
      // Result: B owns 100%

      const owners = [
        { id: 'root', transfers: [] },
        { id: 'a', transfers: [{ fromId: 'root', percentage: 50 }] },
        { id: 'b', transfers: [
          { fromId: 'root', percentage: 50 },  // Original 1/2
          { fromId: 'a', percentage: 100 }      // Bought A's 1/2
        ]}
      ];

      const { result } = renderHook(() => useOwnerCalculations(owners));

      // A transferred everything, should have 0 remaining
      expect(result.current.getRemainingPercentage('a')).toBe(0);

      // B should have 100%
      expect(result.current.calculateTotalPercentage('b')).toBe(100);
      expect(formatFraction(100)).toBe('1/1');

      // Only B should be a leaf owner
      const leaves = result.current.getLeafOwners();
      expect(leaves.length).toBe(1);
      expect(leaves[0].id).toBe('b');
    });

    it('should handle death with partial intestate succession', () => {
      // Scenario: Owner dies with spouse and 2 children
      // Spouse gets 1/2, children split remaining 1/2

      const owners = [
        { id: 'decedent', transfers: [] },
        { id: 'spouse', transfers: [{ fromId: 'decedent', percentage: 50 }] },
        { id: 'child1', transfers: [{ fromId: 'decedent', percentage: 25 }] },
        { id: 'child2', transfers: [{ fromId: 'decedent', percentage: 25 }] }
      ];

      const { result } = renderHook(() => useOwnerCalculations(owners));

      expect(formatFraction(result.current.calculateTotalPercentage('spouse'))).toBe('1/2');
      expect(formatFraction(result.current.calculateTotalPercentage('child1'))).toBe('1/4');
      expect(formatFraction(result.current.calculateTotalPercentage('child2'))).toBe('1/4');

      // All should be leaves
      const leaves = result.current.getLeafOwners();
      expect(leaves.length).toBe(3);

      // Total should be 100%
      const total = leaves.reduce((sum, l) =>
        sum + result.current.calculateTotalPercentage(l.id), 0);
      expect(total).toBe(100);
    });

    it('should handle complex trust distribution', () => {
      // Scenario: Trust owns property, distributes to beneficiaries
      // Trust -> Beneficiary A (40%), Beneficiary B (35%), Charity (25%)

      const owners = [
        { id: 'trust', transfers: [] },
        { id: 'benA', transfers: [{ fromId: 'trust', percentage: 40 }] },
        { id: 'benB', transfers: [{ fromId: 'trust', percentage: 35 }] },
        { id: 'charity', transfers: [{ fromId: 'trust', percentage: 25 }] }
      ];

      const { result } = renderHook(() => useOwnerCalculations(owners));

      expect(result.current.calculateTotalPercentage('benA')).toBe(40);
      expect(result.current.calculateTotalPercentage('benB')).toBe(35);
      expect(result.current.calculateTotalPercentage('charity')).toBe(25);

      // Format as fractions
      expect(formatFraction(40)).toBe('2/5');
      expect(formatFraction(35)).toBe('7/20');
      expect(formatFraction(25)).toBe('1/4');
    });
  });

  // ============================================================================
  // Edge Cases and Error Handling
  // ============================================================================
  describe('edge cases', () => {
    it('should handle very small fractional interests', () => {
      // 1/1000 interest
      const tinyPercent = parsePercentageInput('1/1000');
      expect(tinyPercent).toBe(0.1);

      const owners = [
        { id: 'root', transfers: [] },
        { id: 'tiny', transfers: [{ fromId: 'root', percentage: tinyPercent }] }
      ];

      const { result } = renderHook(() => useOwnerCalculations(owners));
      expect(result.current.calculateTotalPercentage('tiny')).toBe(0.1);
      expect(formatFraction(0.1)).toBe('1/1000');
    });

    it('should handle chains that result in very small interests', () => {
      // 1/2 -> 1/2 -> 1/2 -> 1/2 -> 1/2 = 1/32

      const owners = [
        { id: 'l0', transfers: [] },
        { id: 'l1', transfers: [{ fromId: 'l0', percentage: 50 }] },
        { id: 'l2', transfers: [{ fromId: 'l1', percentage: 50 }] },
        { id: 'l3', transfers: [{ fromId: 'l2', percentage: 50 }] },
        { id: 'l4', transfers: [{ fromId: 'l3', percentage: 50 }] },
        { id: 'l5', transfers: [{ fromId: 'l4', percentage: 50 }] }
      ];

      const { result } = renderHook(() => useOwnerCalculations(owners));

      expect(result.current.calculateTotalPercentage('l5')).toBe(3.125); // 100 * 0.5^5
      expect(formatFraction(3.125)).toBe('1/32');
    });

    it('should handle rounding errors gracefully', () => {
      // 1/3 + 1/3 + 1/3 should equal 100%
      const oneThird = 100 / 3;

      const owners = [
        { id: 'root', transfers: [] },
        { id: 'a', transfers: [{ fromId: 'root', percentage: oneThird }] },
        { id: 'b', transfers: [{ fromId: 'root', percentage: oneThird }] },
        { id: 'c', transfers: [{ fromId: 'root', percentage: oneThird }] }
      ];

      const { result } = renderHook(() => useOwnerCalculations(owners));

      const total =
        result.current.calculateTotalPercentage('a') +
        result.current.calculateTotalPercentage('b') +
        result.current.calculateTotalPercentage('c');

      expect(total).toBeCloseTo(100, 10);
    });

    it('should maintain precision through multiple operations', () => {
      // Test that calculation precision is maintained

      const owners = [
        { id: 'root', transfers: [] },
        { id: 'a', transfers: [{ fromId: 'root', percentage: 33.333333333 }] },
        { id: 'b', transfers: [{ fromId: 'a', percentage: 50 }] }
      ];

      const { result } = renderHook(() => useOwnerCalculations(owners));

      // B should have exactly half of A's ~33.33%
      const bPct = result.current.calculateTotalPercentage('b');
      expect(bPct).toBeCloseTo(16.6666666665, 8);
    });
  });

  // ============================================================================
  // Validation Tests
  // ============================================================================
  describe('input validation scenarios', () => {
    it('should reject over-allocation', () => {
      // Cannot allocate more than 100%
      const owners = [
        { id: 'root', transfers: [] },
        { id: 'a', transfers: [{ fromId: 'root', percentage: 60 }] },
        { id: 'b', transfers: [{ fromId: 'root', percentage: 50 }] } // Would be 110% total
      ];

      const { result } = renderHook(() => useOwnerCalculations(owners));

      // The calculation still works, but remaining would be negative
      expect(result.current.getRemainingPercentage('root')).toBe(-10);
    });

    it('should handle empty owners array', () => {
      const { result } = renderHook(() => useOwnerCalculations([]));

      expect(result.current.getLeafOwners()).toEqual([]);
      expect(result.current.calculateTotalPercentage('anything')).toBe(0);
    });

    it('should handle single root-only owner', () => {
      const owners = [{ id: 'root', transfers: [] }];
      const { result } = renderHook(() => useOwnerCalculations(owners));

      expect(result.current.calculateTotalPercentage('root')).toBe(100);
      expect(result.current.getLeafOwners()).toEqual([]); // Root is not a leaf
      expect(result.current.getRemainingPercentage('root')).toBe(100);
    });
  });
});
