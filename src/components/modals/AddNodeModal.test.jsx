import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddNodeModal } from './AddNodeModal';

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

vi.mock('../../utils/constants', () => ({
  STYLES: {
    input: { base: { width: '100%', padding: '10px' } }
  },
  EMPTY_DOC_FORM: {
    instrumentNumber: '',
    book: '',
    page: '',
    documentDate: '',
    dateRecorded: '',
    grantor: '',
    documentTitle: '',
    note: ''
  }
}));

vi.mock('../ui/DocumentForm', () => ({
  DocumentForm: () => <div data-testid="document-form">Document Form</div>
}));

describe('AddNodeModal', () => {
  const samplePersons = [
    { id: 'person1', primaryName: 'John Doe' },
    { id: 'person2', primaryName: 'Jane Smith' }
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
        <AddNodeModal
          isOpen={false}
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
        <AddNodeModal
          isOpen={true}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('displays the title "ADD NEW NODE"', () => {
      render(
        <AddNodeModal
          isOpen={true}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText('ADD NEW NODE')).toBeInTheDocument();
    });

    it('displays description text', () => {
      render(
        <AddNodeModal
          isOpen={true}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText(/Create a standalone node/)).toBeInTheDocument();
    });
  });

  describe('person selection', () => {
    it('renders person select dropdown', () => {
      render(
        <AddNodeModal
          isOpen={true}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes.length).toBeGreaterThan(0);
    });

    it('shows "Create New Person" as default option', () => {
      render(
        <AddNodeModal
          isOpen={true}
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
        <AddNodeModal
          isOpen={true}
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
        <AddNodeModal
          isOpen={true}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      // Default is "new", so name input should be visible
      expect(screen.getByTestId('form-field-Name')).toBeInTheDocument();
    });

    it('hides name input when existing person is selected', () => {
      render(
        <AddNodeModal
          isOpen={true}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      // First combobox is the person selector
      const personSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(personSelect, {
        target: { value: 'person1' }
      });

      expect(screen.queryByTestId('form-field-Name')).not.toBeInTheDocument();
    });
  });

  describe('name input', () => {
    it('allows typing a name', () => {
      render(
        <AddNodeModal
          isOpen={true}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      const nameInput = screen.getByTestId('form-field-Name').querySelector('input');
      fireEvent.change(nameInput, { target: { value: 'New Person Name' } });

      expect(nameInput).toHaveValue('New Person Name');
    });
  });

  describe('color pickers', () => {
    it('renders fill color picker', () => {
      render(
        <AddNodeModal
          isOpen={true}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Fill:')).toBeInTheDocument();
    });

    it('renders border color picker', () => {
      render(
        <AddNodeModal
          isOpen={true}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Border:')).toBeInTheDocument();
    });

    it('renders line color picker', () => {
      render(
        <AddNodeModal
          isOpen={true}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Lines:')).toBeInTheDocument();
    });

    it('shows reset button when fill color is changed', () => {
      render(
        <AddNodeModal
          isOpen={true}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      // Get the fill color input (type="color") - label now includes "(optional)"
      const colorInputs = screen.getByTestId('form-field-NodeColorsoptional').querySelectorAll('input[type="color"]');
      expect(colorInputs.length).toBeGreaterThan(0);

      // Change the first color input
      fireEvent.change(colorInputs[0], { target: { value: '#FF0000' } });

      // Reset button should appear
      const resetButtons = screen.getAllByText('Reset');
      expect(resetButtons.length).toBeGreaterThan(0);
    });
  });

  describe('notes field', () => {
    it('renders notes textarea', () => {
      render(
        <AddNodeModal
          isOpen={true}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('form-field-Notes')).toBeInTheDocument();
    });

    it('allows typing notes', () => {
      render(
        <AddNodeModal
          isOpen={true}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      const textarea = screen.getByTestId('form-field-Notes').querySelector('textarea');
      fireEvent.change(textarea, { target: { value: 'Some notes' } });

      expect(textarea).toHaveValue('Some notes');
    });
  });

  describe('form submission', () => {
    it('submits form data when Add Node is clicked', () => {
      render(
        <AddNodeModal
          isOpen={true}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      const nameInput = screen.getByTestId('form-field-Name').querySelector('input');
      fireEvent.change(nameInput, { target: { value: 'Test Person' } });

      fireEvent.click(screen.getByRole('button', { name: 'Add Node' }));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        selectedPersonId: 'new',
        newName: 'Test Person',
        notes: '',
        fillColor: null,
        borderColor: null,
        lineColor: null,
        selectedDocumentId: 'none',
        newDocForm: {
          instrumentNumber: '',
          book: '',
          page: '',
          documentDate: '',
          dateRecorded: '',
          grantor: '',
          documentTitle: '',
          note: ''
        }
      });
    });

    it('shows alert when name is empty for new person', () => {
      render(
        <AddNodeModal
          isOpen={true}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Add Node' }));

      expect(global.alert).toHaveBeenCalledWith('Please enter a name');
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows alert when name is whitespace only', () => {
      render(
        <AddNodeModal
          isOpen={true}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      const nameInput = screen.getByTestId('form-field-Name').querySelector('input');
      fireEvent.change(nameInput, { target: { value: '   ' } });

      fireEvent.click(screen.getByRole('button', { name: 'Add Node' }));

      expect(global.alert).toHaveBeenCalledWith('Please enter a name');
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('allows submission when existing person is selected without name', () => {
      render(
        <AddNodeModal
          isOpen={true}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      // First combobox is the person selector
      const personSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(personSelect, {
        target: { value: 'person1' }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Add Node' }));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        selectedPersonId: 'person1',
        newName: '',
        notes: '',
        fillColor: null,
        borderColor: null,
        lineColor: null,
        selectedDocumentId: 'none',
        newDocForm: {
          instrumentNumber: '',
          book: '',
          page: '',
          documentDate: '',
          dateRecorded: '',
          grantor: '',
          documentTitle: '',
          note: ''
        }
      });
    });
  });

  describe('cancel functionality', () => {
    it('calls onClose when Cancel is clicked', () => {
      render(
        <AddNodeModal
          isOpen={true}
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
        <AddNodeModal
          isOpen={true}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      // Type some values
      const nameInput = screen.getByTestId('form-field-Name').querySelector('input');
      fireEvent.change(nameInput, { target: { value: 'Test Name' } });

      // Close and reopen
      rerender(
        <AddNodeModal
          isOpen={false}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );
      rerender(
        <AddNodeModal
          isOpen={true}
          persons={samplePersons}
          documents={sampleDocuments}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      // Check that name is reset
      const newNameInput = screen.getByTestId('form-field-Name').querySelector('input');
      expect(newNameInput).toHaveValue('');
    });
  });

  describe('with empty persons list', () => {
    it('only shows "Create New Person" option', () => {
      render(
        <AddNodeModal
          isOpen={true}
          persons={[]}
          documents={[]}
          onSubmit={mockOnSubmit}
          onClose={mockOnClose}
        />
      );

      // First combobox is the person selector
      const personSelect = screen.getAllByRole('combobox')[0];
      const options = personSelect.querySelectorAll('option');
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent('+ Create New Person');
    });
  });
});
