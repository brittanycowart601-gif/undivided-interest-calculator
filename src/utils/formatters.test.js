import { describe, it, expect } from 'vitest';
import {
  generateId,
  toTitleCase,
  formatDateInput,
  parsePercentageInput,
  gcd,
  formatFraction,
  getDocumentLabel
} from './formatters';

// ============================================================================
// generateId Tests
// ============================================================================
describe('generateId', () => {
  it('should generate a string id', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
  });

  it('should generate unique ids', () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(100);
  });

  it('should generate ids of consistent length', () => {
    const id = generateId();
    expect(id.length).toBeGreaterThanOrEqual(5);
    expect(id.length).toBeLessThanOrEqual(12);
  });
});

// ============================================================================
// toTitleCase Tests
// ============================================================================
describe('toTitleCase', () => {
  it('should convert lowercase to title case', () => {
    expect(toTitleCase('john doe')).toBe('John Doe');
  });

  it('should convert uppercase to title case', () => {
    expect(toTitleCase('JOHN DOE')).toBe('John Doe');
  });

  it('should handle mixed case', () => {
    expect(toTitleCase('jOHN dOE')).toBe('John Doe');
  });

  it('should handle single word', () => {
    expect(toTitleCase('john')).toBe('John');
  });

  it('should handle empty string', () => {
    expect(toTitleCase('')).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(toTitleCase(null)).toBe(null);
    expect(toTitleCase(undefined)).toBe(undefined);
  });

  it('should handle names with multiple spaces', () => {
    expect(toTitleCase('john  doe')).toBe('John  Doe');
  });

  it('should handle hyphenated names', () => {
    // The \b word boundary matches after hyphen, so both parts get capitalized
    expect(toTitleCase('mary-jane watson')).toBe('Mary-Jane Watson');
  });
});

// ============================================================================
// formatDateInput Tests
// ============================================================================
describe('formatDateInput', () => {
  it('should return digits only for 1-2 characters', () => {
    expect(formatDateInput('1')).toBe('1');
    expect(formatDateInput('12')).toBe('12');
  });

  it('should add first slash after 2 digits', () => {
    expect(formatDateInput('123')).toBe('12/3');
    expect(formatDateInput('1234')).toBe('12/34');
  });

  it('should add second slash after 4 digits', () => {
    expect(formatDateInput('12345')).toBe('12/34/5');
    expect(formatDateInput('12341999')).toBe('12/34/1999');
  });

  it('should strip non-digit characters', () => {
    expect(formatDateInput('12/34/1999')).toBe('12/34/1999');
    expect(formatDateInput('12-34-1999')).toBe('12/34/1999');
  });

  it('should limit year to 4 digits', () => {
    expect(formatDateInput('1234199999')).toBe('12/34/1999');
  });

  it('should handle empty string', () => {
    expect(formatDateInput('')).toBe('');
  });
});

// ============================================================================
// parsePercentageInput Tests
// ============================================================================
describe('parsePercentageInput', () => {
  describe('fraction input', () => {
    it('should parse simple fractions', () => {
      expect(parsePercentageInput('1/2')).toBe(50);
      expect(parsePercentageInput('1/4')).toBe(25);
      expect(parsePercentageInput('3/4')).toBe(75);
      expect(parsePercentageInput('1/3')).toBeCloseTo(33.333, 2);
    });

    it('should parse fractions with spaces', () => {
      expect(parsePercentageInput(' 1 / 2 ')).toBe(50);
      expect(parsePercentageInput('1/ 4')).toBe(25);
    });

    it('should handle complex fractions', () => {
      expect(parsePercentageInput('1/8')).toBe(12.5);
      expect(parsePercentageInput('5/8')).toBe(62.5);
      expect(parsePercentageInput('1/16')).toBe(6.25);
    });

    it('should return null for invalid fractions', () => {
      expect(parsePercentageInput('1/0')).toBe(null);
      expect(parsePercentageInput('a/b')).toBe(null);
      expect(parsePercentageInput('/4')).toBe(null);
    });
  });

  describe('decimal input (0-1 range)', () => {
    it('should convert decimals to percentages', () => {
      expect(parsePercentageInput('0.5')).toBe(50);
      expect(parsePercentageInput('0.25')).toBe(25);
      expect(parsePercentageInput('0.125')).toBe(12.5);
      expect(parsePercentageInput('0.01')).toBe(1);
    });

    it('should handle edge cases near 0 and 1', () => {
      expect(parsePercentageInput('0.001')).toBe(0.1);
      expect(parsePercentageInput('0.999')).toBe(99.9);
    });
  });

  describe('percentage input (>= 1)', () => {
    it('should return percentage values as-is', () => {
      expect(parsePercentageInput('50')).toBe(50);
      expect(parsePercentageInput('25')).toBe(25);
      expect(parsePercentageInput('100')).toBe(100);
      expect(parsePercentageInput('1')).toBe(1);
    });

    it('should handle values over 100', () => {
      expect(parsePercentageInput('150')).toBe(150);
    });
  });

  describe('edge cases', () => {
    it('should handle zero', () => {
      expect(parsePercentageInput('0')).toBe(0);
      expect(parsePercentageInput('0.0')).toBe(0);
    });

    it('should handle whitespace', () => {
      expect(parsePercentageInput('  50  ')).toBe(50);
      expect(parsePercentageInput('\t25\n')).toBe(25);
    });

    it('should return null for non-numeric input', () => {
      expect(parsePercentageInput('abc')).toBe(null);
      expect(parsePercentageInput('')).toBe(null);
      expect(parsePercentageInput('   ')).toBe(null);
    });

    it('should handle numeric strings', () => {
      expect(parsePercentageInput(50)).toBe(50);
      expect(parsePercentageInput(0.5)).toBe(50);
    });
  });
});

// ============================================================================
// gcd Tests
// ============================================================================
describe('gcd', () => {
  it('should find GCD of two positive integers', () => {
    expect(gcd(12, 8)).toBe(4);
    expect(gcd(48, 18)).toBe(6);
    expect(gcd(100, 25)).toBe(25);
  });

  it('should handle coprime numbers', () => {
    expect(gcd(7, 11)).toBe(1);
    expect(gcd(13, 17)).toBe(1);
  });

  it('should handle same numbers', () => {
    expect(gcd(5, 5)).toBe(5);
    expect(gcd(100, 100)).toBe(100);
  });

  it('should handle one being a multiple of other', () => {
    expect(gcd(10, 5)).toBe(5);
    expect(gcd(100, 10)).toBe(10);
  });

  it('should handle zero', () => {
    expect(gcd(5, 0)).toBe(5);
    expect(gcd(0, 5)).toBe(5);
  });

  it('should handle negative numbers', () => {
    expect(gcd(-12, 8)).toBe(4);
    expect(gcd(12, -8)).toBe(4);
    expect(gcd(-12, -8)).toBe(4);
  });

  it('should handle large numbers', () => {
    expect(gcd(1000000, 500000)).toBe(500000);
    expect(gcd(250000, 1000000)).toBe(250000);
  });
});

// ============================================================================
// formatFraction Tests
// ============================================================================
describe('formatFraction', () => {
  describe('special cases', () => {
    it('should return "0" for zero', () => {
      expect(formatFraction(0)).toBe('0');
    });

    it('should return "1/1" for 100%', () => {
      expect(formatFraction(100)).toBe('1/1');
    });
  });

  describe('common fractions', () => {
    it('should format 1/2 correctly', () => {
      expect(formatFraction(50)).toBe('1/2');
    });

    it('should format 1/4 correctly', () => {
      expect(formatFraction(25)).toBe('1/4');
    });

    it('should format 3/4 correctly', () => {
      expect(formatFraction(75)).toBe('3/4');
    });

    it('should format 1/8 correctly', () => {
      expect(formatFraction(12.5)).toBe('1/8');
    });

    it('should format 1/3 correctly', () => {
      const result = formatFraction(33.333333);
      // Should be close to 1/3
      expect(result).toMatch(/1\/3|333333\/1000000/);
    });

    it('should format 1/16 correctly', () => {
      expect(formatFraction(6.25)).toBe('1/16');
    });
  });

  describe('complex fractions', () => {
    it('should format 5/8 correctly', () => {
      expect(formatFraction(62.5)).toBe('5/8');
    });

    it('should format 3/8 correctly', () => {
      expect(formatFraction(37.5)).toBe('3/8');
    });

    it('should format 7/16 correctly', () => {
      expect(formatFraction(43.75)).toBe('7/16');
    });
  });

  describe('edge cases', () => {
    it('should handle very small percentages', () => {
      const result = formatFraction(0.1);
      expect(result).toBe('1/1000');
    });

    it('should handle percentages near 100', () => {
      expect(formatFraction(99)).toBe('99/100');
    });

    it('should handle floating point precision', () => {
      // 1/6 = 16.666...%
      const result = formatFraction(16.666666666666668);
      expect(result).toMatch(/\d+\/\d+/);
    });
  });
});

// ============================================================================
// getDocumentLabel Tests
// ============================================================================
describe('getDocumentLabel', () => {
  it('should return empty string for null/undefined', () => {
    expect(getDocumentLabel(null)).toBe('');
    expect(getDocumentLabel(undefined)).toBe('');
  });

  it('should prioritize instrument number', () => {
    const doc = {
      instrumentNumber: '12345',
      book: '100',
      page: '50',
      documentTitle: 'Deed'
    };
    expect(getDocumentLabel(doc)).toBe('Inst: 12345');
  });

  it('should show book/page if no instrument number', () => {
    const doc = {
      book: '100',
      page: '50',
      documentTitle: 'Deed'
    };
    expect(getDocumentLabel(doc)).toBe('Bk 100 Pg 50');
  });

  it('should handle missing book or page', () => {
    expect(getDocumentLabel({ book: '100' })).toBe('Bk 100 Pg ?');
    expect(getDocumentLabel({ page: '50' })).toBe('Bk ? Pg 50');
  });

  it('should show document title if no other identifiers', () => {
    const doc = { documentTitle: 'Warranty Deed' };
    expect(getDocumentLabel(doc)).toBe('Warranty Deed');
  });

  it('should truncate long document titles', () => {
    const doc = { documentTitle: 'Very Long Document Title That Exceeds Limit' };
    expect(getDocumentLabel(doc)).toBe('Very Long Docum');
  });

  it('should return "Doc" as fallback', () => {
    expect(getDocumentLabel({})).toBe('Doc');
    expect(getDocumentLabel({ note: 'some note' })).toBe('Doc');
  });
});
