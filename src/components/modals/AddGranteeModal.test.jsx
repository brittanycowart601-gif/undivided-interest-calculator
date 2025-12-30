import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddGranteeModal } from './AddGranteeModal';

// Mock dependencies
vi.mock('../ui/Modal', () => ({
  Modal: ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        <h3>{title}</h3>
        {children}
      </div>
    );
  }
}));

vi.mock('../ui/FormField', () => ({
  FormField: ({ label, children }) => (
    <div data-testid={`form-field-${label.replace(/[^a-zA-Z]/g, '')}`}>
      <label>{label}</label>
      {children}
    </div>
  )
}));

vi.mock('../ui/ModalActions', () => ({
  ModalActions: ({ onSubmit, onCancel, submitLabel }) => (
    <div>
      <button onClick={onSubmit}>{submitLabel || 'Save'}</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}));

vi.mock('../ui/DocumentSelector', () => ({
  DocumentSelector: ({ value, onChange, documents }) => (
    <select
      data-testid="document-selector"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="new">+ Add New Document</option>
      <option value="">-- No Document --</option>
      {documents.map(d => (
        <option key={d.id} value={d.id}>{d.instrumentNumber}</option>
      ))}
    </select>
  )
}));

vi.mock('../../utils/constants', () => ({
  STYLES: {
    input: { base: { width: '100%', padding: '10px' } }
  },
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
  formatFraction: vi.fn((pct) => `${pct}%`)
}));

describe('AddGranteeModal', () => {
  const samplePersons = [
    { id: 'person1', primaryName: 'John Doe' },
    { id: 'person2', primaryName: 'Jane Smith' }
  ];

  const sampleDocuments = [
    { id: 'doc1', instrumentNumber: '12345' },
    { id: 'doc2', instrumentNumber: '67890' }
  ];

  const sampleParentOwner = {
    id: 'parent1',
    name: 'Original Owner'
  };

  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders nothing when isOpen is false', () => {
      const { container } = render(
        <AddGranteeModal
          isOpen={false}
          parentOwner={sampleParentOwner}
          remainingPercentage={100}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders modal when isOpen is true', () => {
      render(
        <AddGranteeModal
          isOpen={true}
          parentOwner={sampleParentOwner}
          remainingPercentage={100}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('displays the title "ADD GRANTEE"', () => {
      render(
        <AddGranteeModal
          isOpen={true}
          parentOwner={sampleParentOwner}
          remainingPercentage={100}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText('ADD GRANTEE')).toBeInTheDocument();
    });

    it('displays parent owner name', () => {
      render(
        <AddGranteeModal
          isOpen={true}
          parentOwner={sampleParentOwner}
          remainingPercentage={100}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText('Original Owner')).toBeInTheDocument();
    });

    it('displays remaining percentage', () => {
      render(
        <AddGranteeModal
          isOpen={true}
          parentOwner={sampleParentOwner}
          remainingPercentage={75}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText(/75%/)).toBeInTheDocument();
    });
  });

  describe('person selection', () => {
    it('renders person select dropdown', () => {
      render(
        <AddGranteeModal
          isOpen={true}
          parentOwner={sampleParentOwner}
          remainingPercentage={100}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });

    it('shows "Create New Person" as default option', () => {
      render(
        <AddGranteeModal
          isOpen={true}
          parentOwner={sampleParentOwner}
          remainingPercentage={100}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText('+ Create New Person')).toBeInTheDocument();
    });

    it('lists all existing persons', () => {
      render(
        <AddGranteeModal
          isOpen={true}
          parentOwner={sampleParentOwner}
          remainingPercentage={100}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('shows name input when "new" is selected', () => {
      render(
        <AddGranteeModal
          isOpen={true}
          parentOwner={sampleParentOwner}
          remainingPercentage={100}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      // Default is "new", so name input should be visible
      expect(screen.getByTestId('form-field-Nameaswritten')).toBeInTheDocument();
    });

    it('hides name input when existing person is selected', () => {
      render(
        <AddGranteeModal
          isOpen={true}
          parentOwner={sampleParentOwner}
          remainingPercentage={100}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      const personSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(personSelect, { target: { value: 'person1' } });

      expect(screen.queryByTestId('form-field-Nameaswritten')).not.toBeInTheDocument();
    });
  });

  describe('percentage input', () => {
    it('renders interest received input', () => {
      render(
        <AddGranteeModal
          isOpen={true}
          parentOwner={sampleParentOwner}
          remainingPercentage={100}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('form-field-InterestReceived')).toBeInTheDocument();
    });

    it('shows placeholder with examples', () => {
      render(
        <AddGranteeModal
          isOpen={true}
          parentOwner={sampleParentOwner}
          remainingPercentage={100}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByPlaceholderText('1/4, 0.25, or 25')).toBeInTheDocument();
    });

    it('allows typing percentage', () => {
      render(
        <AddGranteeModal
          isOpen={true}
          parentOwner={sampleParentOwner}
          remainingPercentage={100}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByPlaceholderText('1/4, 0.25, or 25');
      fireEvent.change(input, { target: { value: '50' } });

      expect(input).toHaveValue('50');
    });
  });

  describe('document selection', () => {
    it('renders document selector', () => {
      render(
        <AddGranteeModal
          isOpen={true}
          parentOwner={sampleParentOwner}
          remainingPercentage={100}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('document-selector')).toBeInTheDocument();
    });

    it('shows available documents', () => {
      render(
        <AddGranteeModal
          isOpen={true}
          parentOwner={sampleParentOwner}
          remainingPercentage={100}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('12345')).toBeInTheDocument();
      expect(screen.getByText('67890')).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('submits form data when Add Grantee is clicked', () => {
      render(
        <AddGranteeModal
          isOpen={true}
          parentOwner={sampleParentOwner}
          remainingPercentage={100}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      // Fill in name
      const nameInput = screen.getByTestId('form-field-Nameaswritten').querySelector('input');
      fireEvent.change(nameInput, { target: { value: 'New Grantee' } });

      // Fill in percentage
      const percentageInput = screen.getByPlaceholderText('1/4, 0.25, or 25');
      fireEvent.change(percentageInput, { target: { value: '50' } });

      fireEvent.click(screen.getByRole('button', { name: 'Add Grantee' }));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        selectedPersonId: 'new',
        newGranteeName: 'New Grantee',
        percentage: '50',
        selectedDocumentId: 'new',
        newDocForm: expect.any(Object),
        fillColor: null,
        borderColor: null,
        lineColor: null
      });
    });

    it('submits with existing person when selected', () => {
      render(
        <AddGranteeModal
          isOpen={true}
          parentOwner={sampleParentOwner}
          remainingPercentage={100}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      // Select existing person
      const personSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(personSelect, { target: { value: 'person1' } });

      // Fill in percentage
      const percentageInput = screen.getByPlaceholderText('1/4, 0.25, or 25');
      fireEvent.change(percentageInput, { target: { value: '25' } });

      fireEvent.click(screen.getByRole('button', { name: 'Add Grantee' }));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedPersonId: 'person1'
        })
      );
    });

    it('submits with existing document when selected', () => {
      render(
        <AddGranteeModal
          isOpen={true}
          parentOwner={sampleParentOwner}
          remainingPercentage={100}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      // Fill in name
      const nameInput = screen.getByTestId('form-field-Nameaswritten').querySelector('input');
      fireEvent.change(nameInput, { target: { value: 'New Grantee' } });

      // Select existing document
      const docSelect = screen.getByTestId('document-selector');
      fireEvent.change(docSelect, { target: { value: 'doc1' } });

      // Fill in percentage
      const percentageInput = screen.getByPlaceholderText('1/4, 0.25, or 25');
      fireEvent.change(percentageInput, { target: { value: '50' } });

      fireEvent.click(screen.getByRole('button', { name: 'Add Grantee' }));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedDocumentId: 'doc1'
        })
      );
    });
  });

  describe('cancel functionality', () => {
    it('calls onClose when Cancel is clicked', () => {
      render(
        <AddGranteeModal
          isOpen={true}
          parentOwner={sampleParentOwner}
          remainingPercentage={100}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('form reset on open', () => {
    it('resets form when modal opens', () => {
      const { rerender } = render(
        <AddGranteeModal
          isOpen={true}
          parentOwner={sampleParentOwner}
          remainingPercentage={100}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      // Type some values
      const nameInput = screen.getByTestId('form-field-Nameaswritten').querySelector('input');
      fireEvent.change(nameInput, { target: { value: 'Test Name' } });

      const percentageInput = screen.getByPlaceholderText('1/4, 0.25, or 25');
      fireEvent.change(percentageInput, { target: { value: '50' } });

      // Close and reopen
      rerender(
        <AddGranteeModal
          isOpen={false}
          parentOwner={sampleParentOwner}
          remainingPercentage={100}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      rerender(
        <AddGranteeModal
          isOpen={true}
          parentOwner={sampleParentOwner}
          remainingPercentage={100}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      // Check that fields are reset
      const newNameInput = screen.getByTestId('form-field-Nameaswritten').querySelector('input');
      expect(newNameInput).toHaveValue('');

      const newPercentageInput = screen.getByPlaceholderText('1/4, 0.25, or 25');
      expect(newPercentageInput).toHaveValue('');
    });
  });

  describe('null parent owner', () => {
    it('handles null parent owner gracefully', () => {
      render(
        <AddGranteeModal
          isOpen={true}
          parentOwner={null}
          remainingPercentage={100}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
  });

  describe('fractional remaining percentage', () => {
    it('displays formatted fractional percentage', () => {
      render(
        <AddGranteeModal
          isOpen={true}
          parentOwner={sampleParentOwner}
          remainingPercentage={33.333333}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/33.333333%/)).toBeInTheDocument();
    });
  });
});
