import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DocumentRegistryTable } from './DocumentRegistryTable';

describe('DocumentRegistryTable', () => {
  const samplePersons = [
    { id: 'person1', primaryName: 'John Doe' },
    { id: 'person2', primaryName: 'Jane Smith' },
    { id: 'person3', primaryName: 'Bob Johnson' }
  ];

  const sampleDocuments = [
    {
      id: 'doc1',
      instrumentNumber: '12345',
      book: '100',
      page: '50',
      dateRecorded: '01/15/2024',
      documentDate: '01/10/2024',
      grantor: 'Original Owner',
      documentTitle: 'Warranty Deed'
    },
    {
      id: 'doc2',
      instrumentNumber: '67890',
      book: '200',
      page: '75',
      dateRecorded: '02/20/2024',
      documentDate: '02/15/2024',
      grantor: 'John Doe',
      documentTitle: 'Quitclaim Deed'
    }
  ];

  const mockGetDocumentGrantees = vi.fn((docId) => {
    if (docId === 'doc1') {
      return [
        { personId: 'person1', name: 'John Doe' },
        { personId: 'person2', name: 'Jane Smith' }
      ];
    }
    if (docId === 'doc2') {
      return [{ personId: 'person3', name: 'Bob Johnson' }];
    }
    return [];
  });

  const mockOnExportExcel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('empty state', () => {
    it('renders empty state message when documents array is empty', () => {
      render(
        <DocumentRegistryTable
          documents={[]}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onExportExcel={mockOnExportExcel}
        />
      );

      expect(screen.getByText(/No documents have been recorded yet/)).toBeInTheDocument();
    });
  });

  describe('rendering with documents', () => {
    it('renders the table when documents exist', () => {
      render(
        <DocumentRegistryTable
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onExportExcel={mockOnExportExcel}
        />
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders the table when documents exist', () => {
      render(
        <DocumentRegistryTable
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onExportExcel={mockOnExportExcel}
        />
      );

      // No separate section title - just verify table exists
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders export button', () => {
      render(
        <DocumentRegistryTable
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onExportExcel={mockOnExportExcel}
        />
      );

      expect(screen.getByRole('button', { name: /Export to Excel/i })).toBeInTheDocument();
    });

    it('renders table headers', () => {
      render(
        <DocumentRegistryTable
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onExportExcel={mockOnExportExcel}
        />
      );

      expect(screen.getByText('Grantor')).toBeInTheDocument();
      expect(screen.getByText('Grantees')).toBeInTheDocument();
      expect(screen.getByText('Document')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Recorded')).toBeInTheDocument();
      expect(screen.getByText('Book/Page')).toBeInTheDocument();
      expect(screen.getByText('Instrument #')).toBeInTheDocument();
    });
  });

  describe('document data display', () => {
    it('displays grantor name', () => {
      render(
        <DocumentRegistryTable
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onExportExcel={mockOnExportExcel}
        />
      );

      expect(screen.getByText('Original Owner')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('displays document title', () => {
      render(
        <DocumentRegistryTable
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onExportExcel={mockOnExportExcel}
        />
      );

      expect(screen.getByText('Warranty Deed')).toBeInTheDocument();
      expect(screen.getByText('Quitclaim Deed')).toBeInTheDocument();
    });

    it('displays document date', () => {
      render(
        <DocumentRegistryTable
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onExportExcel={mockOnExportExcel}
        />
      );

      expect(screen.getByText('01/10/2024')).toBeInTheDocument();
      expect(screen.getByText('02/15/2024')).toBeInTheDocument();
    });

    it('displays date recorded', () => {
      render(
        <DocumentRegistryTable
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onExportExcel={mockOnExportExcel}
        />
      );

      expect(screen.getByText('01/15/2024')).toBeInTheDocument();
      expect(screen.getByText('02/20/2024')).toBeInTheDocument();
    });

    it('displays book/page combined', () => {
      render(
        <DocumentRegistryTable
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onExportExcel={mockOnExportExcel}
        />
      );

      expect(screen.getByText('100 / 50')).toBeInTheDocument();
      expect(screen.getByText('200 / 75')).toBeInTheDocument();
    });

    it('displays instrument number', () => {
      render(
        <DocumentRegistryTable
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onExportExcel={mockOnExportExcel}
        />
      );

      expect(screen.getByText('12345')).toBeInTheDocument();
      expect(screen.getByText('67890')).toBeInTheDocument();
    });
  });

  describe('grantee display', () => {
    it('displays grantee names', () => {
      render(
        <DocumentRegistryTable
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onExportExcel={mockOnExportExcel}
        />
      );

      // doc1 has John Doe and Jane Smith as grantees
      expect(screen.getByText('John Doe; Jane Smith')).toBeInTheDocument();
    });

    it('uses person primaryName when found', () => {
      render(
        <DocumentRegistryTable
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onExportExcel={mockOnExportExcel}
        />
      );

      // Bob Johnson is in doc2
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('calls getDocumentGrantees for each document', () => {
      render(
        <DocumentRegistryTable
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onExportExcel={mockOnExportExcel}
        />
      );

      expect(mockGetDocumentGrantees).toHaveBeenCalledWith('doc1');
      expect(mockGetDocumentGrantees).toHaveBeenCalledWith('doc2');
    });
  });

  describe('missing data handling', () => {
    it('displays em-dash for missing grantor', () => {
      const docsWithMissing = [
        { id: 'doc1', instrumentNumber: '12345' }
      ];

      render(
        <DocumentRegistryTable
          documents={docsWithMissing}
          persons={samplePersons}
          getDocumentGrantees={() => []}
          onExportExcel={mockOnExportExcel}
        />
      );

      const cells = screen.getAllByRole('cell');
      expect(cells[0]).toHaveTextContent('—'); // Grantor cell (em-dash)
    });

    it('displays em-dash for missing document title', () => {
      const docsWithMissing = [
        { id: 'doc1', grantor: 'Owner' }
      ];

      render(
        <DocumentRegistryTable
          documents={docsWithMissing}
          persons={samplePersons}
          getDocumentGrantees={() => []}
          onExportExcel={mockOnExportExcel}
        />
      );

      const cells = screen.getAllByRole('cell');
      expect(cells[2]).toHaveTextContent('—'); // Document title cell (em-dash)
    });

    it('displays em-dash for missing dates', () => {
      const docsWithMissing = [
        { id: 'doc1', grantor: 'Owner' }
      ];

      render(
        <DocumentRegistryTable
          documents={docsWithMissing}
          persons={samplePersons}
          getDocumentGrantees={() => []}
          onExportExcel={mockOnExportExcel}
        />
      );

      const cells = screen.getAllByRole('cell');
      expect(cells[3]).toHaveTextContent('—'); // Document date (em-dash)
      expect(cells[4]).toHaveTextContent('—'); // Date recorded (em-dash)
    });

    it('displays em-dash for missing book/page', () => {
      const docsWithMissing = [
        { id: 'doc1', grantor: 'Owner' }
      ];

      render(
        <DocumentRegistryTable
          documents={docsWithMissing}
          persons={samplePersons}
          getDocumentGrantees={() => []}
          onExportExcel={mockOnExportExcel}
        />
      );

      const cells = screen.getAllByRole('cell');
      expect(cells[5]).toHaveTextContent('—'); // Book/Page (em-dash)
    });

    it('displays em-dash for missing instrument number', () => {
      const docsWithMissing = [
        { id: 'doc1', grantor: 'Owner' }
      ];

      render(
        <DocumentRegistryTable
          documents={docsWithMissing}
          persons={samplePersons}
          getDocumentGrantees={() => []}
          onExportExcel={mockOnExportExcel}
        />
      );

      const cells = screen.getAllByRole('cell');
      expect(cells[6]).toHaveTextContent('—'); // Instrument # (em-dash)
    });

    it('displays partial book/page when only book exists', () => {
      const docsWithPartial = [
        { id: 'doc1', book: '100' }
      ];

      render(
        <DocumentRegistryTable
          documents={docsWithPartial}
          persons={samplePersons}
          getDocumentGrantees={() => []}
          onExportExcel={mockOnExportExcel}
        />
      );

      expect(screen.getByText('100 / ?')).toBeInTheDocument();
    });

    it('displays partial book/page when only page exists', () => {
      const docsWithPartial = [
        { id: 'doc1', page: '50' }
      ];

      render(
        <DocumentRegistryTable
          documents={docsWithPartial}
          persons={samplePersons}
          getDocumentGrantees={() => []}
          onExportExcel={mockOnExportExcel}
        />
      );

      expect(screen.getByText('? / 50')).toBeInTheDocument();
    });
  });

  describe('export functionality', () => {
    it('calls onExportExcel when export button is clicked', () => {
      render(
        <DocumentRegistryTable
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onExportExcel={mockOnExportExcel}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Export to Excel/i }));

      expect(mockOnExportExcel).toHaveBeenCalledTimes(1);
    });
  });

  describe('row styling', () => {
    it('alternates row background colors', () => {
      render(
        <DocumentRegistryTable
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onExportExcel={mockOnExportExcel}
        />
      );

      const rows = screen.getAllByRole('row');
      // Skip header row (index 0)
      const dataRows = rows.slice(1);

      expect(dataRows[0]).toHaveStyle({ background: 'var(--parchment-light)' }); // Even index
      expect(dataRows[1]).toHaveStyle({ background: 'var(--cream)' }); // Odd index
    });
  });

  describe('empty grantees', () => {
    it('displays em-dash when no grantees', () => {
      const mockEmptyGrantees = vi.fn(() => []);

      render(
        <DocumentRegistryTable
          documents={[{ id: 'doc1', grantor: 'Owner' }]}
          persons={samplePersons}
          getDocumentGrantees={mockEmptyGrantees}
          onExportExcel={mockOnExportExcel}
        />
      );

      const cells = screen.getAllByRole('cell');
      expect(cells[1]).toHaveTextContent('—'); // Grantees cell (em-dash)
    });
  });

  describe('grantee name fallback', () => {
    it('uses grantee name when person not found in persons array', () => {
      const mockGranteesWithUnknown = vi.fn(() => [
        { personId: 'unknown-person', name: 'Unknown Grantee Name' }
      ]);

      render(
        <DocumentRegistryTable
          documents={[{ id: 'doc1', grantor: 'Owner' }]}
          persons={samplePersons}
          getDocumentGrantees={mockGranteesWithUnknown}
          onExportExcel={mockOnExportExcel}
        />
      );

      expect(screen.getByText('Unknown Grantee Name')).toBeInTheDocument();
    });
  });

  describe('print styling', () => {
    it('applies no-print class to export button container', () => {
      render(
        <DocumentRegistryTable
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onExportExcel={mockOnExportExcel}
        />
      );

      const button = screen.getByRole('button', { name: /Export to Excel/i });
      // The no-print class is on the button's parent div
      expect(button.closest('.no-print')).toBeInTheDocument();
    });
  });

  describe('many documents', () => {
    it('renders all documents in a list', () => {
      const manyDocuments = Array.from({ length: 10 }, (_, i) => ({
        id: `doc${i}`,
        instrumentNumber: `${10000 + i}`,
        grantor: `Grantor ${i}`
      }));

      render(
        <DocumentRegistryTable
          documents={manyDocuments}
          persons={samplePersons}
          getDocumentGrantees={() => []}
          onExportExcel={mockOnExportExcel}
        />
      );

      expect(screen.getByText('Grantor 0')).toBeInTheDocument();
      expect(screen.getByText('Grantor 9')).toBeInTheDocument();
      expect(screen.getByText('10000')).toBeInTheDocument();
      expect(screen.getByText('10009')).toBeInTheDocument();
    });
  });
});
