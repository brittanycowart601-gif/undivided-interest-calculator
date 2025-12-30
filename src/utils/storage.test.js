import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadFromStorage, saveToStorage } from './storage';
import { STORAGE_KEY } from './constants';

describe('storage utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.getItem.mockReturnValue(null);
  });

  // ============================================================================
  // loadFromStorage Tests
  // ============================================================================
  describe('loadFromStorage', () => {
    it('should return null when no data is saved', () => {
      localStorage.getItem.mockReturnValue(null);
      expect(loadFromStorage()).toBe(null);
    });

    it('should parse and return saved data', () => {
      const savedData = { owners: [], persons: [], projectName: 'Test' };
      localStorage.getItem.mockReturnValue(JSON.stringify(savedData));

      const result = loadFromStorage();
      expect(result).toEqual(savedData);
    });

    it('should call localStorage.getItem with correct key', () => {
      loadFromStorage();
      expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('should return null on parse error', () => {
      localStorage.getItem.mockReturnValue('invalid json {{{');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(loadFromStorage()).toBe(null);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle complex nested data', () => {
      const complexData = {
        owners: [
          { id: '1', transfers: [{ fromId: 'root', percentage: 50 }] }
        ],
        persons: [{ id: 'p1', primaryName: 'John', aliases: ['Johnny'] }],
        documents: [{ id: 'd1', instrumentNumber: '12345' }],
        nodePositions: { '1': { x: 100, y: 200 } }
      };
      localStorage.getItem.mockReturnValue(JSON.stringify(complexData));

      expect(loadFromStorage()).toEqual(complexData);
    });
  });

  // ============================================================================
  // saveToStorage Tests
  // ============================================================================
  describe('saveToStorage', () => {
    it('should call localStorage.setItem with correct key', () => {
      saveToStorage({ projectName: 'Test' });
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.any(String)
      );
    });

    it('should include all provided data', () => {
      const data = {
        owners: [{ id: '1' }],
        persons: [{ id: 'p1' }],
        projectName: 'My Project'
      };

      saveToStorage(data);

      const savedString = localStorage.setItem.mock.calls[0][1];
      const savedData = JSON.parse(savedString);

      expect(savedData.owners).toEqual([{ id: '1' }]);
      expect(savedData.persons).toEqual([{ id: 'p1' }]);
      expect(savedData.projectName).toBe('My Project');
    });

    it('should add lastSaved timestamp', () => {
      const before = new Date().toISOString();
      saveToStorage({ projectName: 'Test' });
      const after = new Date().toISOString();

      const savedString = localStorage.setItem.mock.calls[0][1];
      const savedData = JSON.parse(savedString);

      expect(savedData.lastSaved).toBeDefined();
      expect(savedData.lastSaved >= before).toBe(true);
      expect(savedData.lastSaved <= after).toBe(true);
    });

    it('should stringify complex nested objects', () => {
      const data = {
        owners: [
          {
            id: '1',
            name: 'John',
            transfers: [{ fromId: 'root', percentage: 50, documentId: 'd1' }]
          }
        ],
        nodePositions: { '1': { x: 100, y: 200 } }
      };

      saveToStorage(data);

      const savedString = localStorage.setItem.mock.calls[0][1];
      const savedData = JSON.parse(savedString);

      expect(savedData.owners[0].transfers[0].percentage).toBe(50);
      expect(savedData.nodePositions['1'].x).toBe(100);
    });
  });

  // ============================================================================
  // Round-trip Tests
  // ============================================================================
  describe('round-trip (save then load)', () => {
    it('should preserve data through save/load cycle', () => {
      const originalData = {
        owners: [
          { id: 'root', name: 'Original', transfers: [] },
          { id: 'a', name: 'Owner A', transfers: [{ fromId: 'root', percentage: 50 }] }
        ],
        persons: [
          { id: 'p1', primaryName: 'John Doe', aliases: ['J. Doe'] }
        ],
        documents: [
          { id: 'd1', instrumentNumber: '12345', book: '100', page: '50' }
        ],
        projectName: 'Test Project',
        nodePositions: { root: { x: 0, y: 0 }, a: { x: 100, y: 100 } },
        subgroups: [{ id: 's1', name: 'Group 1', color: '#ff0000' }]
      };

      // Save
      saveToStorage(originalData);

      // Get what was saved
      const savedString = localStorage.setItem.mock.calls[0][1];

      // Simulate loading
      localStorage.getItem.mockReturnValue(savedString);
      const loadedData = loadFromStorage();

      // Verify core data preserved
      expect(loadedData.owners).toEqual(originalData.owners);
      expect(loadedData.persons).toEqual(originalData.persons);
      expect(loadedData.documents).toEqual(originalData.documents);
      expect(loadedData.projectName).toBe(originalData.projectName);
      expect(loadedData.nodePositions).toEqual(originalData.nodePositions);
      expect(loadedData.subgroups).toEqual(originalData.subgroups);

      // Verify lastSaved was added
      expect(loadedData.lastSaved).toBeDefined();
    });
  });
});
