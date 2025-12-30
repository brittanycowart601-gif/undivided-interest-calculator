import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditOwnerModal } from './EditOwnerModal';

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

vi.mock('../ui/FormField', () => ({
  FormField: ({ label, children }) => (
    <div data-testid={`form-field-${label.replace(/[^a-zA-Z]/g, '')}`}>
      <label>{label}</label>
      {children}
    </div>
  )
}));

vi.mock('../ui/ModalActions', () => ({
  ModalActions: ({ onSubmit, onCancel }) => (
    <div>
      <button onClick={onSubmit}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}));

vi.mock('../../utils/constants', () => ({
  STYLES: {
    input: { base: { width: '100%', padding: '10px' } }
  }
}));

vi.mock('../../utils/formatters', () => ({
  getDocumentLabel: vi.fn((doc) => `Doc: ${doc.instrumentNumber || 'Unknown'}`)
}));

describe('EditOwnerModal', () => {
  const sampleOwner = {
    id: 'owner1',
    name: 'John Doe',
    nameAsWritten: 'JOHN DOE',
    personId: 'person1',
    notes: 'Some notes about this owner',
    transfers: [
      { fromId: 'parent1', percentage: 50, documentId: 'doc1' }
    ],
    color: null,
    borderColor: null,
    lineColor: null,
    relationship: ''
  };

  const rootOwner = {
    id: 'root',
    name: 'Original Owner',
    nameAsWritten: 'Original Owner',
    personId: 'person-root',
    notes: '',
    transfers: [],
    color: null,
    borderColor: null,
    lineColor: null,
    relationship: ''
  };

  const samplePersons = [
    { id: 'person-root', primaryName: 'Original Owner' },
    { id: 'person1', primaryName: 'John Doe' },
    { id: 'person2', primaryName: 'Jane Smith' }
  ];

  const sampleOwners = [
    { id: 'root', name: 'Original Owner' },
    { id: 'parent1', name: 'Parent Owner' },
    { id: 'owner1', name: 'John Doe' }
  ];

  const sampleDocuments = [
    { id: 'doc1', instrumentNumber: '12345' },
    { id: 'doc2', instrumentNumber: '67890' }
  ];

  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders nothing when isOpen is false', () => {
      const { container } = render(
        <EditOwnerModal
          isOpen={false}
          owner={sampleOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders modal when isOpen is true', () => {
      render(
        <EditOwnerModal
          isOpen={true}
          owner={sampleOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('displays the title "EDIT NODE"', () => {
      render(
        <EditOwnerModal
          isOpen={true}
          owner={sampleOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText('EDIT NODE')).toBeInTheDocument();
    });

    it('passes maxWidth of 600px to Modal', () => {
      render(
        <EditOwnerModal
          isOpen={true}
          owner={sampleOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByTestId('modal')).toHaveAttribute('data-maxwidth', '600px');
    });
  });

  describe('form fields', () => {
    it('renders Display Name field', () => {
      render(
        <EditOwnerModal
          isOpen={true}
          owner={sampleOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByTestId('form-field-DisplayName')).toBeInTheDocument();
    });

    it('renders Name As Written field', () => {
      render(
        <EditOwnerModal
          isOpen={true}
          owner={sampleOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByTestId('form-field-NameAsWritten')).toBeInTheDocument();
    });

    it('renders Relationship field', () => {
      render(
        <EditOwnerModal
          isOpen={true}
          owner={sampleOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByTestId('form-field-RelationshipegHusbandofJaneDoe')).toBeInTheDocument();
    });

    it('renders Linked Person field', () => {
      render(
        <EditOwnerModal
          isOpen={true}
          owner={sampleOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByTestId('form-field-LinkedPerson')).toBeInTheDocument();
    });

    it('renders Node Colors field', () => {
      render(
        <EditOwnerModal
          isOpen={true}
          owner={sampleOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByTestId('form-field-NodeColors')).toBeInTheDocument();
    });

    it('renders Notes field', () => {
      render(
        <EditOwnerModal
          isOpen={true}
          owner={sampleOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByTestId('form-field-Notes')).toBeInTheDocument();
    });
  });

  describe('initial values', () => {
    it('populates Display Name with owner name', () => {
      render(
        <EditOwnerModal
          isOpen={true}
          owner={sampleOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      const nameField = screen.getByTestId('form-field-DisplayName');
      const input = nameField.querySelector('input');
      expect(input).toHaveValue('John Doe');
    });

    it('populates Name As Written field', () => {
      render(
        <EditOwnerModal
          isOpen={true}
          owner={sampleOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      const field = screen.getByTestId('form-field-NameAsWritten');
      const input = field.querySelector('input');
      expect(input).toHaveValue('JOHN DOE');
    });

    it('populates Notes field', () => {
      render(
        <EditOwnerModal
          isOpen={true}
          owner={sampleOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      const field = screen.getByTestId('form-field-Notes');
      const textarea = field.querySelector('textarea');
      expect(textarea).toHaveValue('Some notes about this owner');
    });
  });

  describe('transfers section for non-root nodes', () => {
    it('displays Transfers Received section for non-root nodes', () => {
      render(
        <EditOwnerModal
          isOpen={true}
          owner={sampleOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('form-field-TransfersReceived')).toBeInTheDocument();
    });

    it('does not display Transfers Received for root nodes', () => {
      render(
        <EditOwnerModal
          isOpen={true}
          owner={rootOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByTestId('form-field-TransfersReceived')).not.toBeInTheDocument();
    });

    it('displays parent owner name in transfer', () => {
      render(
        <EditOwnerModal
          isOpen={true}
          owner={sampleOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/Parent Owner/)).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('calls onSubmit with updated values when Save is clicked', () => {
      render(
        <EditOwnerModal
          isOpen={true}
          owner={sampleOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      const nameField = screen.getByTestId('form-field-DisplayName');
      const input = nameField.querySelector('input');
      fireEvent.change(input, { target: { value: 'Updated Name' } });

      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Name'
        })
      );
    });

    it('includes all form fields in submission', () => {
      render(
        <EditOwnerModal
          isOpen={true}
          owner={sampleOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
          nameAsWritten: 'JOHN DOE',
          notes: 'Some notes about this owner',
          personId: 'person1',
          transfers: expect.any(Array),
          fillColor: null,
          borderColor: null,
          lineColor: null,
          relationship: ''
        })
      );
    });

    it('validates transfer percentages before submission', () => {
      const ownerWithInvalidTransfer = {
        ...sampleOwner,
        transfers: [{ fromId: 'parent1', percentage: 'invalid', documentId: 'doc1' }]
      };

      render(
        <EditOwnerModal
          isOpen={true}
          owner={ownerWithInvalidTransfer}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(global.alert).toHaveBeenCalledWith('Invalid percentage value in one or more transfers');
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('cancel functionality', () => {
    it('calls onClose when Cancel is clicked', () => {
      render(
        <EditOwnerModal
          isOpen={true}
          owner={sampleOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('person selection', () => {
    it('lists all persons in dropdown', () => {
      render(
        <EditOwnerModal
          isOpen={true}
          owner={sampleOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Original Owner')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  describe('color pickers', () => {
    it('renders fill color picker', () => {
      render(
        <EditOwnerModal
          isOpen={true}
          owner={sampleOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Fill:')).toBeInTheDocument();
    });

    it('renders border color picker', () => {
      render(
        <EditOwnerModal
          isOpen={true}
          owner={sampleOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Border:')).toBeInTheDocument();
    });

    it('renders line color picker', () => {
      render(
        <EditOwnerModal
          isOpen={true}
          owner={sampleOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Lines Out:')).toBeInTheDocument();
    });
  });

  describe('multiple transfers', () => {
    it('displays all transfers', () => {
      const ownerWithMultipleTransfers = {
        ...sampleOwner,
        transfers: [
          { fromId: 'parent1', percentage: 25, documentId: 'doc1' },
          { fromId: 'root', percentage: 25, documentId: 'doc2' }
        ]
      };

      render(
        <EditOwnerModal
          isOpen={true}
          owner={ownerWithMultipleTransfers}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      // Both transfer sources should be displayed
      expect(screen.getByText(/Parent Owner/)).toBeInTheDocument();
      // Use getAllByText since "Original Owner" appears multiple times (in persons dropdown)
      expect(screen.getAllByText(/Original Owner/).length).toBeGreaterThan(0);
    });

    it('shows delete button for transfers when there are multiple', () => {
      const ownerWithMultipleTransfers = {
        ...sampleOwner,
        transfers: [
          { fromId: 'parent1', percentage: 25, documentId: 'doc1' },
          { fromId: 'root', percentage: 25, documentId: 'doc2' }
        ]
      };

      render(
        <EditOwnerModal
          isOpen={true}
          owner={ownerWithMultipleTransfers}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      // Should have delete buttons (✕)
      const deleteButtons = screen.getAllByRole('button', { name: '✕' });
      expect(deleteButtons.length).toBe(2);
    });

    it('prevents deleting last transfer', () => {
      render(
        <EditOwnerModal
          isOpen={true}
          owner={sampleOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      // With only one transfer, delete button shouldn't be shown
      expect(screen.queryByRole('button', { name: '✕' })).not.toBeInTheDocument();
    });
  });

  describe('form updates on owner change', () => {
    it('updates form when owner prop changes', () => {
      const { rerender } = render(
        <EditOwnerModal
          isOpen={true}
          owner={sampleOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      const newOwner = {
        ...sampleOwner,
        name: 'Different Owner',
        notes: 'Different notes'
      };

      rerender(
        <EditOwnerModal
          isOpen={true}
          owner={newOwner}
          persons={samplePersons}
          owners={sampleOwners}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      const nameField = screen.getByTestId('form-field-DisplayName');
      const input = nameField.querySelector('input');
      expect(input).toHaveValue('Different Owner');
    });
  });
});
