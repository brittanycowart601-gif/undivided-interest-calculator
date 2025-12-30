import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddTransferModal } from './AddTransferModal';

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

describe('AddTransferModal', () => {
  const sampleOwners = [
    { id: 'owner1', name: 'John Doe' },
    { id: 'owner2', name: 'Jane Smith' },
    { id: 'owner3', name: 'Bob Johnson' }
  ];

  const sampleDocuments = [
    { id: 'doc1', instrumentNumber: '12345' },
    { id: 'doc2', instrumentNumber: '67890' }
  ];

  const targetOwner = { id: 'owner3', name: 'Bob Johnson' };

  const mockGetRemainingPercentage = vi.fn((ownerId) => {
    if (ownerId === 'owner1') return 50;
    if (ownerId === 'owner2') return 75;
    return 100;
  });

  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders nothing when isOpen is false', () => {
      const { container } = render(
        <AddTransferModal
          isOpen={false}
          targetOwner={targetOwner}
          owners={sampleOwners}
          documents={sampleDocuments}
          getRemainingPercentage={mockGetRemainingPercentage}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders modal when isOpen is true', () => {
      render(
        <AddTransferModal
          isOpen={true}
          targetOwner={targetOwner}
          owners={sampleOwners}
          documents={sampleDocuments}
          getRemainingPercentage={mockGetRemainingPercentage}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('displays the title "ADD ADDITIONAL SOURCE"', () => {
      render(
        <AddTransferModal
          isOpen={true}
          targetOwner={targetOwner}
          owners={sampleOwners}
          documents={sampleDocuments}
          getRemainingPercentage={mockGetRemainingPercentage}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText('ADD ADDITIONAL SOURCE')).toBeInTheDocument();
    });

    it('displays target owner name', () => {
      render(
        <AddTransferModal
          isOpen={true}
          targetOwner={targetOwner}
          owners={sampleOwners}
          documents={sampleDocuments}
          getRemainingPercentage={mockGetRemainingPercentage}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
  });

  describe('grantor selection', () => {
    it('renders grantor select dropdown', () => {
      render(
        <AddTransferModal
          isOpen={true}
          targetOwner={targetOwner}
          owners={sampleOwners}
          documents={sampleDocuments}
          getRemainingPercentage={mockGetRemainingPercentage}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('form-field-FromGrantor')).toBeInTheDocument();
    });

    it('shows "Select Source" as default option', () => {
      render(
        <AddTransferModal
          isOpen={true}
          targetOwner={targetOwner}
          owners={sampleOwners}
          documents={sampleDocuments}
          getRemainingPercentage={mockGetRemainingPercentage}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText('-- Select Source --')).toBeInTheDocument();
    });

    it('excludes target owner from available sources', () => {
      render(
        <AddTransferModal
          isOpen={true}
          targetOwner={targetOwner}
          owners={sampleOwners}
          documents={sampleDocuments}
          getRemainingPercentage={mockGetRemainingPercentage}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      const select = screen.getByTestId('form-field-FromGrantor').querySelector('select');
      const options = Array.from(select.querySelectorAll('option'));

      // Should not include target owner (Bob Johnson) as an option
      const optionTexts = options.map(o => o.textContent);
      expect(optionTexts.some(t => t.includes('John Doe'))).toBe(true);
      expect(optionTexts.some(t => t.includes('Jane Smith'))).toBe(true);
      expect(optionTexts.filter(t => t.includes('Bob Johnson')).length).toBe(0);
    });

    it('shows remaining percentage for each source', () => {
      render(
        <AddTransferModal
          isOpen={true}
          targetOwner={targetOwner}
          owners={sampleOwners}
          documents={sampleDocuments}
          getRemainingPercentage={mockGetRemainingPercentage}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/John Doe.*50%/)).toBeInTheDocument();
      expect(screen.getByText(/Jane Smith.*75%/)).toBeInTheDocument();
    });
  });

  describe('percentage input', () => {
    it('renders interest received input', () => {
      render(
        <AddTransferModal
          isOpen={true}
          targetOwner={targetOwner}
          owners={sampleOwners}
          documents={sampleDocuments}
          getRemainingPercentage={mockGetRemainingPercentage}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('form-field-InterestReceived')).toBeInTheDocument();
    });

    it('shows placeholder with examples', () => {
      render(
        <AddTransferModal
          isOpen={true}
          targetOwner={targetOwner}
          owners={sampleOwners}
          documents={sampleDocuments}
          getRemainingPercentage={mockGetRemainingPercentage}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByPlaceholderText('1/4, 0.25, or 25')).toBeInTheDocument();
    });

    it('allows typing percentage', () => {
      render(
        <AddTransferModal
          isOpen={true}
          targetOwner={targetOwner}
          owners={sampleOwners}
          documents={sampleDocuments}
          getRemainingPercentage={mockGetRemainingPercentage}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByPlaceholderText('1/4, 0.25, or 25');
      fireEvent.change(input, { target: { value: '25' } });

      expect(input).toHaveValue('25');
    });
  });

  describe('document selection', () => {
    it('renders document selector', () => {
      render(
        <AddTransferModal
          isOpen={true}
          targetOwner={targetOwner}
          owners={sampleOwners}
          documents={sampleDocuments}
          getRemainingPercentage={mockGetRemainingPercentage}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('document-selector')).toBeInTheDocument();
    });

    it('shows available documents', () => {
      render(
        <AddTransferModal
          isOpen={true}
          targetOwner={targetOwner}
          owners={sampleOwners}
          documents={sampleDocuments}
          getRemainingPercentage={mockGetRemainingPercentage}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('12345')).toBeInTheDocument();
      expect(screen.getByText('67890')).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('submits form data when Add Source is clicked', () => {
      render(
        <AddTransferModal
          isOpen={true}
          targetOwner={targetOwner}
          owners={sampleOwners}
          documents={sampleDocuments}
          getRemainingPercentage={mockGetRemainingPercentage}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      // Select a source
      const sourceSelect = screen.getByTestId('form-field-FromGrantor').querySelector('select');
      fireEvent.change(sourceSelect, { target: { value: 'owner1' } });

      // Fill in percentage
      const percentageInput = screen.getByPlaceholderText('1/4, 0.25, or 25');
      fireEvent.change(percentageInput, { target: { value: '25' } });

      fireEvent.click(screen.getByRole('button', { name: 'Add Source' }));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        fromId: 'owner1',
        percentage: '25',
        documentId: 'new',
        newDocForm: expect.any(Object)
      });
    });

    it('submits with existing document when selected', () => {
      render(
        <AddTransferModal
          isOpen={true}
          targetOwner={targetOwner}
          owners={sampleOwners}
          documents={sampleDocuments}
          getRemainingPercentage={mockGetRemainingPercentage}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      // Select a source
      const sourceSelect = screen.getByTestId('form-field-FromGrantor').querySelector('select');
      fireEvent.change(sourceSelect, { target: { value: 'owner1' } });

      // Select existing document
      const docSelect = screen.getByTestId('document-selector');
      fireEvent.change(docSelect, { target: { value: 'doc1' } });

      // Fill in percentage
      const percentageInput = screen.getByPlaceholderText('1/4, 0.25, or 25');
      fireEvent.change(percentageInput, { target: { value: '50' } });

      fireEvent.click(screen.getByRole('button', { name: 'Add Source' }));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          documentId: 'doc1'
        })
      );
    });
  });

  describe('cancel functionality', () => {
    it('calls onClose when Cancel is clicked', () => {
      render(
        <AddTransferModal
          isOpen={true}
          targetOwner={targetOwner}
          owners={sampleOwners}
          documents={sampleDocuments}
          getRemainingPercentage={mockGetRemainingPercentage}
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
        <AddTransferModal
          isOpen={true}
          targetOwner={targetOwner}
          owners={sampleOwners}
          documents={sampleDocuments}
          getRemainingPercentage={mockGetRemainingPercentage}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      // Select a source and type percentage
      const sourceSelect = screen.getByTestId('form-field-FromGrantor').querySelector('select');
      fireEvent.change(sourceSelect, { target: { value: 'owner1' } });

      const percentageInput = screen.getByPlaceholderText('1/4, 0.25, or 25');
      fireEvent.change(percentageInput, { target: { value: '50' } });

      // Close and reopen
      rerender(
        <AddTransferModal
          isOpen={false}
          targetOwner={targetOwner}
          owners={sampleOwners}
          documents={sampleDocuments}
          getRemainingPercentage={mockGetRemainingPercentage}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      rerender(
        <AddTransferModal
          isOpen={true}
          targetOwner={targetOwner}
          owners={sampleOwners}
          documents={sampleDocuments}
          getRemainingPercentage={mockGetRemainingPercentage}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      // Check that fields are reset
      const newSourceSelect = screen.getByTestId('form-field-FromGrantor').querySelector('select');
      expect(newSourceSelect).toHaveValue('');

      const newPercentageInput = screen.getByPlaceholderText('1/4, 0.25, or 25');
      expect(newPercentageInput).toHaveValue('');
    });
  });

  describe('null target owner', () => {
    it('handles null target owner gracefully', () => {
      render(
        <AddTransferModal
          isOpen={true}
          targetOwner={null}
          owners={sampleOwners}
          documents={sampleDocuments}
          getRemainingPercentage={mockGetRemainingPercentage}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
  });

  describe('single owner scenario', () => {
    it('shows only non-target owners when there is just one other owner', () => {
      const twoOwners = [
        { id: 'owner1', name: 'John Doe' },
        { id: 'owner2', name: 'Jane Smith' }
      ];

      render(
        <AddTransferModal
          isOpen={true}
          targetOwner={{ id: 'owner2', name: 'Jane Smith' }}
          owners={twoOwners}
          documents={sampleDocuments}
          getRemainingPercentage={mockGetRemainingPercentage}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      const select = screen.getByTestId('form-field-FromGrantor').querySelector('select');
      const options = Array.from(select.querySelectorAll('option'));

      // Should have "Select Source" and "John Doe"
      expect(options.some(o => o.textContent.includes('John Doe'))).toBe(true);
      expect(options.filter(o => o.textContent.includes('Jane Smith')).length).toBe(0);
    });
  });

  describe('getRemainingPercentage calls', () => {
    it('calls getRemainingPercentage for each available source', () => {
      render(
        <AddTransferModal
          isOpen={true}
          targetOwner={targetOwner}
          owners={sampleOwners}
          documents={sampleDocuments}
          getRemainingPercentage={mockGetRemainingPercentage}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      // Should have called for owner1 and owner2 (not owner3 which is target)
      expect(mockGetRemainingPercentage).toHaveBeenCalledWith('owner1');
      expect(mockGetRemainingPercentage).toHaveBeenCalledWith('owner2');
    });
  });
});
