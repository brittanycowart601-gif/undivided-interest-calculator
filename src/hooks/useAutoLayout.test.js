import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAutoLayout } from './useAutoLayout';

describe('useAutoLayout', () => {
  describe('basic layout calculations', () => {
    it('returns empty positions for empty owners array', () => {
      const { result } = renderHook(() => useAutoLayout([], () => []));
      const positions = result.current();
      expect(positions).toEqual({});
    });

    it('positions a single root node at the top center', () => {
      const owners = [
        { id: 'root', name: 'Owner 1', transfers: [], originalLevel: 0 }
      ];
      const getChildren = () => [];

      const { result } = renderHook(() => useAutoLayout(owners, getChildren));
      const positions = result.current();

      expect(positions).toHaveProperty('root');
      expect(positions.root.y).toBe(50); // First level starts at y=50
      expect(positions.root.x).toBeGreaterThan(0);
    });

    it('positions two root nodes side by side', () => {
      const owners = [
        { id: 'root1', name: 'Owner 1', transfers: [], originalLevel: 0 },
        { id: 'root2', name: 'Owner 2', transfers: [], originalLevel: 0 }
      ];
      const getChildren = () => [];

      const { result } = renderHook(() => useAutoLayout(owners, getChildren));
      const positions = result.current();

      expect(positions.root1.y).toBe(positions.root2.y);
      expect(positions.root1.x).not.toBe(positions.root2.x);
    });
  });

  describe('hierarchical positioning', () => {
    it('positions child nodes below parent nodes', () => {
      const owners = [
        { id: 'root', name: 'Root', transfers: [], originalLevel: 0 },
        { id: 'child1', name: 'Child 1', transfers: [{ fromId: 'root', percentage: 50 }], originalLevel: 1 }
      ];
      const getChildren = (id) => id === 'root' ? [owners[1]] : [];

      const { result } = renderHook(() => useAutoLayout(owners, getChildren));
      const positions = result.current();

      expect(positions.child1.y).toBeGreaterThan(positions.root.y);
    });

    it('positions grandchildren below children', () => {
      const owners = [
        { id: 'root', name: 'Root', transfers: [], originalLevel: 0 },
        { id: 'child', name: 'Child', transfers: [{ fromId: 'root', percentage: 50 }], originalLevel: 1 },
        { id: 'grandchild', name: 'Grandchild', transfers: [{ fromId: 'child', percentage: 25 }], originalLevel: 2 }
      ];
      const getChildren = (id) => {
        if (id === 'root') return [owners[1]];
        if (id === 'child') return [owners[2]];
        return [];
      };

      const { result } = renderHook(() => useAutoLayout(owners, getChildren));
      const positions = result.current();

      expect(positions.root.y).toBeLessThan(positions.child.y);
      expect(positions.child.y).toBeLessThan(positions.grandchild.y);
    });

    it('uses originalLevel for positioning when available', () => {
      const owners = [
        { id: 'root', name: 'Root', transfers: [], originalLevel: 0 },
        { id: 'child1', name: 'Child 1', transfers: [{ fromId: 'root', percentage: 25 }], originalLevel: 1 },
        { id: 'child2', name: 'Child 2', transfers: [{ fromId: 'root', percentage: 25 }], originalLevel: 2 }
      ];
      const getChildren = (id) => {
        if (id === 'root') return [owners[1], owners[2]];
        return [];
      };

      const { result } = renderHook(() => useAutoLayout(owners, getChildren));
      const positions = result.current();

      // child2 has originalLevel 2, so it should be positioned below child1 (level 1)
      expect(positions.child2.y).toBeGreaterThan(positions.child1.y);
    });

    it('calculates level from parent when originalLevel is undefined', () => {
      const owners = [
        { id: 'root', name: 'Root', transfers: [], originalLevel: 0 },
        { id: 'child', name: 'Child', transfers: [{ fromId: 'root', percentage: 50 }] }
        // child has no originalLevel, should calculate from parent
      ];
      const getChildren = (id) => id === 'root' ? [owners[1]] : [];

      const { result } = renderHook(() => useAutoLayout(owners, getChildren));
      const positions = result.current();

      // Child should be at level 1 (root level + 1)
      expect(positions.child.y).toBeGreaterThan(positions.root.y);
    });
  });

  describe('multiple children on same level', () => {
    it('horizontally centers multiple children on the same level', () => {
      const owners = [
        { id: 'root', name: 'Root', transfers: [], originalLevel: 0 },
        { id: 'child1', name: 'Child 1', transfers: [{ fromId: 'root', percentage: 25 }], originalLevel: 1 },
        { id: 'child2', name: 'Child 2', transfers: [{ fromId: 'root', percentage: 25 }], originalLevel: 1 },
        { id: 'child3', name: 'Child 3', transfers: [{ fromId: 'root', percentage: 25 }], originalLevel: 1 }
      ];
      const getChildren = (id) => id === 'root' ? owners.slice(1) : [];

      const { result } = renderHook(() => useAutoLayout(owners, getChildren));
      const positions = result.current();

      // All children should be on the same y level
      expect(positions.child1.y).toBe(positions.child2.y);
      expect(positions.child2.y).toBe(positions.child3.y);

      // Children should be spread out horizontally
      expect(positions.child1.x).toBeLessThan(positions.child2.x);
      expect(positions.child2.x).toBeLessThan(positions.child3.x);
    });
  });

  describe('complex tree structures', () => {
    it('handles a deep tree with 4 levels', () => {
      const owners = [
        { id: 'root', name: 'Root', transfers: [], originalLevel: 0 },
        { id: 'l1', name: 'Level 1', transfers: [{ fromId: 'root', percentage: 100 }], originalLevel: 1 },
        { id: 'l2', name: 'Level 2', transfers: [{ fromId: 'l1', percentage: 100 }], originalLevel: 2 },
        { id: 'l3', name: 'Level 3', transfers: [{ fromId: 'l2', percentage: 100 }], originalLevel: 3 }
      ];
      const getChildren = (id) => {
        const childMap = { root: ['l1'], l1: ['l2'], l2: ['l3'] };
        return (childMap[id] || []).map(cid => owners.find(o => o.id === cid));
      };

      const { result } = renderHook(() => useAutoLayout(owners, getChildren));
      const positions = result.current();

      expect(positions.root.y).toBeLessThan(positions.l1.y);
      expect(positions.l1.y).toBeLessThan(positions.l2.y);
      expect(positions.l2.y).toBeLessThan(positions.l3.y);
    });

    it('handles multiple branches at different depths', () => {
      const owners = [
        { id: 'root', name: 'Root', transfers: [], originalLevel: 0 },
        { id: 'a', name: 'Branch A', transfers: [{ fromId: 'root', percentage: 50 }], originalLevel: 1 },
        { id: 'b', name: 'Branch B', transfers: [{ fromId: 'root', percentage: 50 }], originalLevel: 1 },
        { id: 'a1', name: 'A Child', transfers: [{ fromId: 'a', percentage: 50 }], originalLevel: 2 }
      ];
      const getChildren = (id) => {
        const childMap = { root: ['a', 'b'], a: ['a1'] };
        return (childMap[id] || []).map(cid => owners.find(o => o.id === cid));
      };

      const { result } = renderHook(() => useAutoLayout(owners, getChildren));
      const positions = result.current();

      // a and b should be on same level
      expect(positions.a.y).toBe(positions.b.y);
      // a1 should be below a and b
      expect(positions.a1.y).toBeGreaterThan(positions.a.y);
    });

    it('handles nodes with multiple transfer sources', () => {
      const owners = [
        { id: 'root1', name: 'Root 1', transfers: [], originalLevel: 0 },
        { id: 'root2', name: 'Root 2', transfers: [], originalLevel: 0 },
        { id: 'child', name: 'Child', transfers: [
          { fromId: 'root1', percentage: 25 },
          { fromId: 'root2', percentage: 25 }
        ], originalLevel: 1 }
      ];
      const getChildren = () => [];

      const { result } = renderHook(() => useAutoLayout(owners, getChildren));
      const positions = result.current();

      // Both roots on same level
      expect(positions.root1.y).toBe(positions.root2.y);
      // Child below roots
      expect(positions.child.y).toBeGreaterThan(positions.root1.y);
    });
  });

  describe('layout spacing', () => {
    it('maintains consistent vertical spacing between levels', () => {
      const owners = [
        { id: 'root', name: 'Root', transfers: [], originalLevel: 0 },
        { id: 'child', name: 'Child', transfers: [{ fromId: 'root', percentage: 50 }], originalLevel: 1 },
        { id: 'grandchild', name: 'Grandchild', transfers: [{ fromId: 'child', percentage: 50 }], originalLevel: 2 }
      ];
      const getChildren = () => [];

      const { result } = renderHook(() => useAutoLayout(owners, getChildren));
      const positions = result.current();

      const gap1 = positions.child.y - positions.root.y;
      const gap2 = positions.grandchild.y - positions.child.y;

      expect(gap1).toBe(gap2); // Vertical spacing should be consistent
    });

    it('maintains consistent horizontal spacing between siblings', () => {
      const owners = [
        { id: 'root', name: 'Root', transfers: [], originalLevel: 0 },
        { id: 'c1', name: 'C1', transfers: [{ fromId: 'root', percentage: 25 }], originalLevel: 1 },
        { id: 'c2', name: 'C2', transfers: [{ fromId: 'root', percentage: 25 }], originalLevel: 1 },
        { id: 'c3', name: 'C3', transfers: [{ fromId: 'root', percentage: 25 }], originalLevel: 1 }
      ];
      const getChildren = () => [];

      const { result } = renderHook(() => useAutoLayout(owners, getChildren));
      const positions = result.current();

      const gap1 = positions.c2.x - positions.c1.x;
      const gap2 = positions.c3.x - positions.c2.x;

      expect(gap1).toBe(gap2); // Horizontal spacing should be consistent
    });
  });

  describe('edge cases', () => {
    it('handles owner with no matching id in owners array', () => {
      const owners = [
        { id: 'root', name: 'Root', transfers: [], originalLevel: 0 },
        { id: 'orphan', name: 'Orphan', transfers: [{ fromId: 'nonexistent', percentage: 50 }], originalLevel: 1 }
      ];
      const getChildren = () => [];

      const { result } = renderHook(() => useAutoLayout(owners, getChildren));
      const positions = result.current();

      // Should still calculate positions without crashing
      expect(positions).toHaveProperty('root');
      expect(positions).toHaveProperty('orphan');
    });

    it('handles owners array update through re-render', () => {
      const owners1 = [{ id: 'root', name: 'Root', transfers: [], originalLevel: 0 }];
      const owners2 = [
        ...owners1,
        { id: 'child', name: 'Child', transfers: [{ fromId: 'root', percentage: 50 }], originalLevel: 1 }
      ];

      const { result, rerender } = renderHook(
        ({ owners }) => useAutoLayout(owners, () => []),
        { initialProps: { owners: owners1 } }
      );

      const positions1 = result.current();
      expect(Object.keys(positions1)).toHaveLength(1);

      rerender({ owners: owners2 });
      const positions2 = result.current();
      expect(Object.keys(positions2)).toHaveLength(2);
    });

    it('handles many nodes on the same level', () => {
      const owners = [
        { id: 'root', name: 'Root', transfers: [], originalLevel: 0 },
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `child-${i}`,
          name: `Child ${i}`,
          transfers: [{ fromId: 'root', percentage: 10 }],
          originalLevel: 1
        }))
      ];
      const getChildren = () => [];

      const { result } = renderHook(() => useAutoLayout(owners, getChildren));
      const positions = result.current();

      // Should have positions for all 11 nodes
      expect(Object.keys(positions)).toHaveLength(11);

      // All children should be on the same y level
      const childYPositions = Array.from({ length: 10 }, (_, i) => positions[`child-${i}`].y);
      expect(new Set(childYPositions).size).toBe(1);
    });
  });

  describe('memoization', () => {
    it('returns stable function reference when dependencies do not change', () => {
      const owners = [{ id: 'root', name: 'Root', transfers: [], originalLevel: 0 }];
      const getChildren = () => [];

      const { result, rerender } = renderHook(() => useAutoLayout(owners, getChildren));
      const func1 = result.current;

      rerender();
      const func2 = result.current;

      expect(func1).toBe(func2);
    });

    it('returns new function when owners change', () => {
      const getChildren = () => [];
      let owners = [{ id: 'root', name: 'Root', transfers: [], originalLevel: 0 }];

      const { result, rerender } = renderHook(
        ({ owners }) => useAutoLayout(owners, getChildren),
        { initialProps: { owners } }
      );
      const func1 = result.current;

      owners = [...owners, { id: 'new', name: 'New', transfers: [], originalLevel: 0 }];
      rerender({ owners });
      const func2 = result.current;

      expect(func1).not.toBe(func2);
    });
  });
});
