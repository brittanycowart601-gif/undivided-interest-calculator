import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InterestSummaryTable } from './InterestSummaryTable';

// Mock formatters
vi.mock('../../utils/formatters', () => ({
  formatFraction: vi.fn((percentage) => {
    if (percentage === 100) return '100%';
    if (percentage === 50) return '1/2 (50%)';
    if (percentage === 25) return '1/4 (25%)';
    if (percentage === 33.333333333333336) return '1/3 (33.33%)';
    return `${percentage.toFixed(2)}%`;
  }),
  getPersonColor: vi.fn((personId, persons) => {
    const index = persons.findIndex(p => p.id === personId);
    const colors = ['#517f8c', '#3d6670', '#7a9ea8', '#002e54'];
    return colors[index % colors.length] || '#666';
  })
}));

describe('InterestSummaryTable', () => {
  const samplePersons = [
    { id: 'person1', primaryName: 'John Doe', aliases: [] },
    { id: 'person2', primaryName: 'Jane Smith', aliases: [] },
    { id: 'person3', primaryName: 'Bob Johnson', aliases: [] }
  ];

  describe('empty state', () => {
    it('renders empty message when personTotals is empty', () => {
      render(<InterestSummaryTable personTotals={[]} persons={samplePersons} />);

      expect(screen.getByText(/No grantees have been recorded yet/)).toBeInTheDocument();
    });

    it('renders italic styling for empty message', () => {
      render(<InterestSummaryTable personTotals={[]} persons={samplePersons} />);

      const message = screen.getByText(/No grantees have been recorded yet/);
      expect(message).toHaveStyle({ fontStyle: 'italic' });
    });
  });

  describe('table structure', () => {
    const singlePersonTotal = [
      { person: { id: 'person1', primaryName: 'John Doe' }, nodes: ['node1'], totalInterest: 100 }
    ];

    it('renders a table when personTotals has data', () => {
      render(<InterestSummaryTable personTotals={singlePersonTotal} persons={samplePersons} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders table headers', () => {
      render(<InterestSummaryTable personTotals={singlePersonTotal} persons={samplePersons} />);

      expect(screen.getByText('Person')).toBeInTheDocument();
      expect(screen.getByText('Sources')).toBeInTheDocument();
      expect(screen.getByText('Total Interest')).toBeInTheDocument();
    });

    it('renders thead, tbody, and tfoot sections', () => {
      render(<InterestSummaryTable personTotals={singlePersonTotal} persons={samplePersons} />);

      const table = screen.getByRole('table');
      expect(table.querySelector('thead')).toBeInTheDocument();
      expect(table.querySelector('tbody')).toBeInTheDocument();
      expect(table.querySelector('tfoot')).toBeInTheDocument();
    });
  });

  describe('person data display', () => {
    it('displays person name', () => {
      const personTotals = [
        { person: { id: 'person1', primaryName: 'John Doe' }, nodes: ['node1'], totalInterest: 50 }
      ];

      render(<InterestSummaryTable personTotals={personTotals} persons={samplePersons} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('displays node count', () => {
      const personTotals = [
        { person: { id: 'person1', primaryName: 'John Doe' }, nodes: ['node1', 'node2', 'node3'], totalInterest: 50 }
      ];

      render(<InterestSummaryTable personTotals={personTotals} persons={samplePersons} />);

      // Node count should be 3
      const cells = screen.getAllByRole('cell');
      const nodeCountCell = cells.find(cell => cell.textContent === '3');
      expect(nodeCountCell).toBeInTheDocument();
    });

    it('displays formatted interest', () => {
      const personTotals = [
        { person: { id: 'person1', primaryName: 'John Doe' }, nodes: ['node1'], totalInterest: 50 }
      ];

      render(<InterestSummaryTable personTotals={personTotals} persons={samplePersons} />);

      // 1/2 (50%) appears in the data row
      expect(screen.getAllByText('1/2 (50%)').length).toBeGreaterThan(0);
    });

    it('displays multiple persons', () => {
      const personTotals = [
        { person: { id: 'person1', primaryName: 'John Doe' }, nodes: ['node1'], totalInterest: 50 },
        { person: { id: 'person2', primaryName: 'Jane Smith' }, nodes: ['node2'], totalInterest: 50 }
      ];

      render(<InterestSummaryTable personTotals={personTotals} persons={samplePersons} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  describe('person color indicator', () => {
    it('renders a color indicator circle for each person', () => {
      const personTotals = [
        { person: { id: 'person1', primaryName: 'John Doe' }, nodes: ['node1'], totalInterest: 100 }
      ];

      const { container } = render(
        <InterestSummaryTable personTotals={personTotals} persons={samplePersons} />
      );

      // Find span with inline-block display (color indicator)
      const colorIndicator = container.querySelector('span[style*="inline-block"]');
      expect(colorIndicator).toBeInTheDocument();
    });
  });

  describe('unknown person handling', () => {
    it('displays "Unknown" when person is null', () => {
      const personTotals = [
        { person: null, nodes: ['node1'], totalInterest: 25 }
      ];

      render(<InterestSummaryTable personTotals={personTotals} persons={samplePersons} />);

      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    it('displays "Unknown" when person is undefined', () => {
      const personTotals = [
        { person: undefined, nodes: ['node1'], totalInterest: 25 }
      ];

      render(<InterestSummaryTable personTotals={personTotals} persons={samplePersons} />);

      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
  });

  describe('totals row', () => {
    it('calculates and displays total interest', () => {
      const personTotals = [
        { person: { id: 'person1', primaryName: 'John Doe' }, nodes: ['node1'], totalInterest: 50 },
        { person: { id: 'person2', primaryName: 'Jane Smith' }, nodes: ['node2'], totalInterest: 50 }
      ];

      render(<InterestSummaryTable personTotals={personTotals} persons={samplePersons} />);

      // Total should be 100%
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('calculates and displays total node count', () => {
      const personTotals = [
        { person: { id: 'person1', primaryName: 'John Doe' }, nodes: ['node1', 'node2'], totalInterest: 50 },
        { person: { id: 'person2', primaryName: 'Jane Smith' }, nodes: ['node3'], totalInterest: 50 }
      ];

      render(<InterestSummaryTable personTotals={personTotals} persons={samplePersons} />);

      // Total nodes should be 3
      const tfoot = screen.getByRole('table').querySelector('tfoot');
      expect(tfoot).toHaveTextContent('3');
    });

    it('displays "TOTAL RECORDED" label', () => {
      const personTotals = [
        { person: { id: 'person1', primaryName: 'John Doe' }, nodes: ['node1'], totalInterest: 100 }
      ];

      render(<InterestSummaryTable personTotals={personTotals} persons={samplePersons} />);

      expect(screen.getByText('TOTAL RECORDED')).toBeInTheDocument();
    });
  });

  describe('row styling', () => {
    it('alternates row background colors', () => {
      const personTotals = [
        { person: { id: 'person1', primaryName: 'John Doe' }, nodes: ['node1'], totalInterest: 33.333333333333336 },
        { person: { id: 'person2', primaryName: 'Jane Smith' }, nodes: ['node2'], totalInterest: 33.333333333333336 },
        { person: { id: 'person3', primaryName: 'Bob Johnson' }, nodes: ['node3'], totalInterest: 33.333333333333336 }
      ];

      render(<InterestSummaryTable personTotals={personTotals} persons={samplePersons} />);

      const rows = screen.getAllByRole('row');
      // Skip header row (index 0) and footer row (last)
      const dataRows = rows.slice(1, -1);

      expect(dataRows[0]).toHaveStyle({ background: 'var(--parchment-light)' }); // Even index (0)
      expect(dataRows[1]).toHaveStyle({ background: 'var(--cream)' }); // Odd index (1)
      expect(dataRows[2]).toHaveStyle({ background: 'var(--parchment-light)' }); // Even index (2)
    });
  });

  describe('complex scenarios', () => {
    it('handles person with multiple nodes', () => {
      const personTotals = [
        {
          person: { id: 'person1', primaryName: 'John Doe' },
          nodes: ['node1', 'node2', 'node3', 'node4'],
          totalInterest: 100
        }
      ];

      render(<InterestSummaryTable personTotals={personTotals} persons={samplePersons} />);

      const cells = screen.getAllByRole('cell');
      expect(cells.some(cell => cell.textContent === '4')).toBe(true);
    });

    it('handles fractional interests', () => {
      const personTotals = [
        { person: { id: 'person1', primaryName: 'John Doe' }, nodes: ['node1'], totalInterest: 25 },
        { person: { id: 'person2', primaryName: 'Jane Smith' }, nodes: ['node2'], totalInterest: 25 },
        { person: { id: 'person3', primaryName: 'Bob Johnson' }, nodes: ['node3'], totalInterest: 50 }
      ];

      render(<InterestSummaryTable personTotals={personTotals} persons={samplePersons} />);

      // There are two 25% entries, so use getAllByText
      expect(screen.getAllByText('1/4 (25%)').length).toBe(2);
      expect(screen.getByText('1/2 (50%)')).toBeInTheDocument();
    });

    it('handles many persons', () => {
      const manyPersonTotals = Array.from({ length: 10 }, (_, i) => ({
        person: { id: `person${i}`, primaryName: `Person ${i}` },
        nodes: [`node${i}`],
        totalInterest: 10
      }));

      render(<InterestSummaryTable personTotals={manyPersonTotals} persons={samplePersons} />);

      // Check first and last person are rendered
      expect(screen.getByText('Person 0')).toBeInTheDocument();
      expect(screen.getByText('Person 9')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles person with empty nodes array', () => {
      const personTotals = [
        { person: { id: 'person1', primaryName: 'John Doe' }, nodes: [], totalInterest: 0 }
      ];

      render(<InterestSummaryTable personTotals={personTotals} persons={samplePersons} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('handles zero interest', () => {
      const personTotals = [
        { person: { id: 'person1', primaryName: 'John Doe' }, nodes: ['node1'], totalInterest: 0 }
      ];

      render(<InterestSummaryTable personTotals={personTotals} persons={samplePersons} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('handles very small fractional interests', () => {
      const personTotals = [
        { person: { id: 'person1', primaryName: 'John Doe' }, nodes: ['node1'], totalInterest: 0.001 }
      ];

      render(<InterestSummaryTable personTotals={personTotals} persons={samplePersons} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
