import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DocumentManagerModal } from './DocumentManagerModal';

// Mock dependencies
vi.mock('../ui/Modal', () => ({
  Modal: ({ isOpen, onClose, title, children, maxWidth }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="modal" data-maxwidth={maxWidth}>
        <h3>{title}</h3>
        {children}
      </div>
    );
  }
}));

vi.mock('../ui/DocumentForm', () => ({
  DocumentForm: ({ docForm, setDocForm }) => (
    <div data-testid="document-form">
      <input
        data-testid="instrument-input"
        value={docForm.instrumentNumber}
        onChange={(e) => setDocForm({ ...docForm, instrumentNumber: e.target.value })}
        placeholder="Instrument Number"
      />
      <input
        data-testid="book-input"
        value={docForm.book}
        onChange={(e) => setDocForm({ ...docForm, book: e.target.value })}
        placeholder="Book"
      />
      <input
        data-testid="title-input"
        value={docForm.documentTitle}
        onChange={(e) => setDocForm({ ...docForm, documentTitle: e.target.value })}
        placeholder="Title"
      />
    </div>
  )
}));

vi.mock('../../utils/constants', () => ({
  EMPTY_DOC_FORM: {
    instrumentNumber: '',
    book: '',
    page: '',
    dateRecorded: '',
    documentDate: '',
    grantor: '',
    documentTitle: '',
    note: ''
  }
}));

vi.mock('../../utils/formatters', () => ({
  getDocumentLabel: vi.fn((doc) => {
    if (doc.instrumentNumber) return `Inst: ${doc.instrumentNumber}`;
    if (doc.book) return `Bk: ${doc.book}`;
    return 'Untitled';
  })
}));

describe('DocumentManagerModal', () => {
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
      book: '',
      page: '',
      dateRecorded: '',
      documentDate: '02/15/2024',
      grantor: 'John Doe',
      documentTitle: 'Quitclaim Deed'
    }
  ];

  const samplePersons = [
    { id: 'person1', primaryName: 'John Doe' },
    { id: 'person2', primaryName: 'Jane Smith' }
  ];

  const mockGetDocumentGrantees = vi.fn((docId) => {
    if (docId === 'doc1') {
      return [
        { personId: 'person1', name: 'John Doe' },
        { personId: 'person2', name: 'Jane Smith' }
      ];
    }
    return [];
  });

  const mockOnAddDocument = vi.fn();
  const mockOnUpdateDocument = vi.fn();
  const mockOnDeleteDocument = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders nothing when isOpen is false', () => {
      const { container } = render(
        <DocumentManagerModal
          isOpen={false}
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders modal when isOpen is true', () => {
      render(
        <DocumentManagerModal
          isOpen={true}
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('displays the title with emoji', () => {
      render(
        <DocumentManagerModal
          isOpen={true}
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText(/DOCUMENT REGISTRY/)).toBeInTheDocument();
    });

    it('passes maxWidth of 900px to Modal', () => {
      render(
        <DocumentManagerModal
          isOpen={true}
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByTestId('modal')).toHaveAttribute('data-maxwidth', '900px');
    });
  });

  describe('add document form', () => {
    it('displays "Add New Document" heading', () => {
      render(
        <DocumentManagerModal
          isOpen={true}
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText('Add New Document')).toBeInTheDocument();
    });

    it('renders document form', () => {
      render(
        <DocumentManagerModal
          isOpen={true}
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByTestId('document-form')).toBeInTheDocument();
    });

    it('renders Add Document button', () => {
      render(
        <DocumentManagerModal
          isOpen={true}
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByRole('button', { name: 'Add Document' })).toBeInTheDocument();
    });
  });

  describe('add document functionality', () => {
    it('calls onAddDocument when Add Document is clicked with valid data', () => {
      render(
        <DocumentManagerModal
          isOpen={true}
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );

      const instrumentInput = screen.getByTestId('instrument-input');
      fireEvent.change(instrumentInput, { target: { value: 'NEW123' } });

      fireEvent.click(screen.getByRole('button', { name: 'Add Document' }));

      expect(mockOnAddDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          instrumentNumber: 'NEW123'
        })
      );
    });

    it('does not call onAddDocument when form is empty', () => {
      render(
        <DocumentManagerModal
          isOpen={true}
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Add Document' }));

      expect(mockOnAddDocument).not.toHaveBeenCalled();
    });

    it('clears form after successful add', () => {
      render(
        <DocumentManagerModal
          isOpen={true}
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );

      const instrumentInput = screen.getByTestId('instrument-input');
      fireEvent.change(instrumentInput, { target: { value: 'NEW123' } });

      fireEvent.click(screen.getByRole('button', { name: 'Add Document' }));

      expect(instrumentInput).toHaveValue('');
    });
  });

  describe('document list display', () => {
    it('displays all documents', () => {
      render(
        <DocumentManagerModal
          isOpen={true}
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Warranty Deed')).toBeInTheDocument();
      expect(screen.getByText('Quitclaim Deed')).toBeInTheDocument();
    });

    it('displays instrument number', () => {
      render(
        <DocumentManagerModal
          isOpen={true}
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/Inst: 12345/)).toBeInTheDocument();
    });

    it('displays grantees', () => {
      render(
        <DocumentManagerModal
          isOpen={true}
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/Grantees: John Doe, Jane Smith/)).toBeInTheDocument();
    });

    it('displays Edit button for each document', () => {
      render(
        <DocumentManagerModal
          isOpen={true}
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      expect(editButtons).toHaveLength(2);
    });

    it('displays Delete button for each document', () => {
      render(
        <DocumentManagerModal
          isOpen={true}
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
      expect(deleteButtons).toHaveLength(2);
    });
  });

  describe('empty documents list', () => {
    it('displays "No documents yet" when list is empty', () => {
      render(
        <DocumentManagerModal
          isOpen={true}
          documents={[]}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('No documents yet')).toBeInTheDocument();
    });
  });

  describe('edit document functionality', () => {
    it('shows edit form when Edit is clicked', () => {
      render(
        <DocumentManagerModal
          isOpen={true}
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      fireEvent.click(editButtons[0]);

      expect(screen.getByText('Edit Document')).toBeInTheDocument();
    });

    it('populates form with document data when editing', () => {
      render(
        <DocumentManagerModal
          isOpen={true}
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      fireEvent.click(editButtons[0]);

      expect(screen.getByTestId('instrument-input')).toHaveValue('12345');
    });

    it('shows Update button when editing', () => {
      render(
        <DocumentManagerModal
          isOpen={true}
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      fireEvent.click(editButtons[0]);

      expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    });

    it('calls onUpdateDocument when Update is clicked', () => {
      render(
        <DocumentManagerModal
          isOpen={true}
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      fireEvent.click(editButtons[0]);

      const instrumentInput = screen.getByTestId('instrument-input');
      fireEvent.change(instrumentInput, { target: { value: 'UPDATED123' } });

      fireEvent.click(screen.getByRole('button', { name: 'Update' }));

      expect(mockOnUpdateDocument).toHaveBeenCalledWith(
        'doc1',
        expect.objectContaining({
          instrumentNumber: 'UPDATED123'
        })
      );
    });

    it('shows Cancel button when editing', () => {
      render(
        <DocumentManagerModal
          isOpen={true}
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      fireEvent.click(editButtons[0]);

      // There should be a Cancel button for the edit form
      const cancelButtons = screen.getAllByRole('button', { name: 'Cancel' });
      expect(cancelButtons.length).toBeGreaterThan(0);
    });

    it('closes edit form when Cancel is clicked', () => {
      render(
        <DocumentManagerModal
          isOpen={true}
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      fireEvent.click(editButtons[0]);

      const cancelButtons = screen.getAllByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButtons[0]);

      expect(screen.getByText('Add New Document')).toBeInTheDocument();
    });
  });

  describe('delete document functionality', () => {
    it('calls onDeleteDocument when Delete is clicked and confirmed', () => {
      render(
        <DocumentManagerModal
          isOpen={true}
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
      fireEvent.click(deleteButtons[0]);

      expect(mockOnDeleteDocument).toHaveBeenCalledWith('doc1');
    });
  });

  describe('close modal', () => {
    it('renders Close button at bottom', () => {
      render(
        <DocumentManagerModal
          isOpen={true}
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('calls onClose when Close button is clicked', () => {
      render(
        <DocumentManagerModal
          isOpen={true}
          documents={sampleDocuments}
          persons={samplePersons}
          getDocumentGrantees={mockGetDocumentGrantees}
          onAddDocument={mockOnAddDocument}
          onUpdateDocument={mockOnUpdateDocument}
          onDeleteDocument={mockOnDeleteDocument}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Close' }));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
