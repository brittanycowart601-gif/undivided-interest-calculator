import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PersonManagerModal } from './PersonManagerModal';

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

vi.mock('../../utils/formatters', () => ({
  getPersonColor: vi.fn((personId, persons) => {
    const colors = ['#517f8c', '#3d6670', '#7a9ea8'];
    const index = persons.findIndex(p => p.id === personId);
    return colors[index % colors.length];
  }),
  toTitleCase: vi.fn((str) => str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '))
}));

describe('PersonManagerModal', () => {
  const samplePersons = [
    { id: 'person1', primaryName: 'John Doe', aliases: ['Johnny', 'J.D.'] },
    { id: 'person2', primaryName: 'Jane Smith', aliases: [] },
    { id: 'person3', primaryName: 'Bob Johnson', aliases: ['Robert'] }
  ];

  const sampleOwners = [
    { id: 'owner1', personId: 'person1', name: 'John Doe' },
    { id: 'owner2', personId: 'person1', name: 'Johnny Doe' },
    { id: 'owner3', personId: 'person2', name: 'Jane Smith' }
  ];

  const mockOnUpdatePerson = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders nothing when isOpen is false', () => {
      const { container } = render(
        <PersonManagerModal
          isOpen={false}
          persons={samplePersons}
          owners={sampleOwners}
          onUpdatePerson={mockOnUpdatePerson}
          onClose={mockOnClose}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders modal when isOpen is true', () => {
      render(
        <PersonManagerModal
          isOpen={true}
          persons={samplePersons}
          owners={sampleOwners}
          onUpdatePerson={mockOnUpdatePerson}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('displays the title with emoji', () => {
      render(
        <PersonManagerModal
          isOpen={true}
          persons={samplePersons}
          owners={sampleOwners}
          onUpdatePerson={mockOnUpdatePerson}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText(/PERSON REGISTRY/)).toBeInTheDocument();
    });

    it('passes maxWidth of 700px to Modal', () => {
      render(
        <PersonManagerModal
          isOpen={true}
          persons={samplePersons}
          owners={sampleOwners}
          onUpdatePerson={mockOnUpdatePerson}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByTestId('modal')).toHaveAttribute('data-maxwidth', '700px');
    });
  });

  describe('person list display', () => {
    it('displays all persons', () => {
      render(
        <PersonManagerModal
          isOpen={true}
          persons={samplePersons}
          owners={sampleOwners}
          onUpdatePerson={mockOnUpdatePerson}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('displays node count for each person', () => {
      render(
        <PersonManagerModal
          isOpen={true}
          persons={samplePersons}
          owners={sampleOwners}
          onUpdatePerson={mockOnUpdatePerson}
          onClose={mockOnClose}
        />
      );

      // John Doe has 2 nodes
      expect(screen.getByText('(2 nodes)')).toBeInTheDocument();
      // Jane Smith has 1 node
      expect(screen.getByText('(1 node)')).toBeInTheDocument();
      // Bob Johnson has 0 nodes
      expect(screen.getByText('(0 nodes)')).toBeInTheDocument();
    });

    it('displays aliases when present', () => {
      render(
        <PersonManagerModal
          isOpen={true}
          persons={samplePersons}
          owners={sampleOwners}
          onUpdatePerson={mockOnUpdatePerson}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/Also: Johnny, J.D./)).toBeInTheDocument();
      expect(screen.getByText(/Also: Robert/)).toBeInTheDocument();
    });

    it('does not display alias section when aliases are empty', () => {
      render(
        <PersonManagerModal
          isOpen={true}
          persons={samplePersons}
          owners={sampleOwners}
          onUpdatePerson={mockOnUpdatePerson}
          onClose={mockOnClose}
        />
      );

      // Jane Smith has no aliases - verify by checking there's no "Also:" after her name
      const janeRow = screen.getByText('Jane Smith').closest('div');
      expect(janeRow).not.toHaveTextContent('Also:');
    });
  });

  describe('edit button', () => {
    it('renders Edit button for each person', () => {
      render(
        <PersonManagerModal
          isOpen={true}
          persons={samplePersons}
          owners={sampleOwners}
          onUpdatePerson={mockOnUpdatePerson}
          onClose={mockOnClose}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      expect(editButtons).toHaveLength(3);
    });

    it('shows edit form when Edit button is clicked', () => {
      render(
        <PersonManagerModal
          isOpen={true}
          persons={samplePersons}
          owners={sampleOwners}
          onUpdatePerson={mockOnUpdatePerson}
          onClose={mockOnClose}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      fireEvent.click(editButtons[0]);

      expect(screen.getByPlaceholderText('Primary Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Aliases (comma-separated)')).toBeInTheDocument();
    });

    it('populates edit form with current values', () => {
      render(
        <PersonManagerModal
          isOpen={true}
          persons={samplePersons}
          owners={sampleOwners}
          onUpdatePerson={mockOnUpdatePerson}
          onClose={mockOnClose}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      fireEvent.click(editButtons[0]);

      expect(screen.getByPlaceholderText('Primary Name')).toHaveValue('John Doe');
      expect(screen.getByPlaceholderText('Aliases (comma-separated)')).toHaveValue('Johnny, J.D.');
    });
  });

  describe('edit form interactions', () => {
    it('allows editing primary name', () => {
      render(
        <PersonManagerModal
          isOpen={true}
          persons={samplePersons}
          owners={sampleOwners}
          onUpdatePerson={mockOnUpdatePerson}
          onClose={mockOnClose}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      fireEvent.click(editButtons[0]);

      const nameInput = screen.getByPlaceholderText('Primary Name');
      fireEvent.change(nameInput, { target: { value: 'Jonathan Doe' } });

      expect(nameInput).toHaveValue('Jonathan Doe');
    });

    it('allows editing aliases', () => {
      render(
        <PersonManagerModal
          isOpen={true}
          persons={samplePersons}
          owners={sampleOwners}
          onUpdatePerson={mockOnUpdatePerson}
          onClose={mockOnClose}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      fireEvent.click(editButtons[0]);

      const aliasesInput = screen.getByPlaceholderText('Aliases (comma-separated)');
      fireEvent.change(aliasesInput, { target: { value: 'Jon, JD' } });

      expect(aliasesInput).toHaveValue('Jon, JD');
    });
  });

  describe('save functionality', () => {
    it('calls onUpdatePerson with updated values when Save is clicked', () => {
      render(
        <PersonManagerModal
          isOpen={true}
          persons={samplePersons}
          owners={sampleOwners}
          onUpdatePerson={mockOnUpdatePerson}
          onClose={mockOnClose}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      fireEvent.click(editButtons[0]);

      const nameInput = screen.getByPlaceholderText('Primary Name');
      fireEvent.change(nameInput, { target: { value: 'jonathan doe' } });

      const aliasesInput = screen.getByPlaceholderText('Aliases (comma-separated)');
      fireEvent.change(aliasesInput, { target: { value: 'Jon, JD' } });

      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(mockOnUpdatePerson).toHaveBeenCalledWith('person1', {
        primaryName: 'Jonathan Doe', // Title cased
        aliases: ['Jon', 'JD']
      });
    });

    it('filters out empty aliases', () => {
      render(
        <PersonManagerModal
          isOpen={true}
          persons={samplePersons}
          owners={sampleOwners}
          onUpdatePerson={mockOnUpdatePerson}
          onClose={mockOnClose}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      fireEvent.click(editButtons[0]);

      const aliasesInput = screen.getByPlaceholderText('Aliases (comma-separated)');
      fireEvent.change(aliasesInput, { target: { value: 'Jon, , JD, ' } });

      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(mockOnUpdatePerson).toHaveBeenCalledWith('person1', {
        primaryName: 'John Doe',
        aliases: ['Jon', 'JD']
      });
    });

    it('closes edit form after save', () => {
      render(
        <PersonManagerModal
          isOpen={true}
          persons={samplePersons}
          owners={sampleOwners}
          onUpdatePerson={mockOnUpdatePerson}
          onClose={mockOnClose}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      fireEvent.click(editButtons[0]);

      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(screen.queryByPlaceholderText('Primary Name')).not.toBeInTheDocument();
    });
  });

  describe('cancel editing', () => {
    it('closes edit form when Cancel is clicked', () => {
      render(
        <PersonManagerModal
          isOpen={true}
          persons={samplePersons}
          owners={sampleOwners}
          onUpdatePerson={mockOnUpdatePerson}
          onClose={mockOnClose}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      fireEvent.click(editButtons[0]);

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(screen.queryByPlaceholderText('Primary Name')).not.toBeInTheDocument();
    });

    it('does not call onUpdatePerson when Cancel is clicked', () => {
      render(
        <PersonManagerModal
          isOpen={true}
          persons={samplePersons}
          owners={sampleOwners}
          onUpdatePerson={mockOnUpdatePerson}
          onClose={mockOnClose}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      fireEvent.click(editButtons[0]);

      const nameInput = screen.getByPlaceholderText('Primary Name');
      fireEvent.change(nameInput, { target: { value: 'Changed Name' } });

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(mockOnUpdatePerson).not.toHaveBeenCalled();
    });
  });

  describe('close modal', () => {
    it('renders Close button at bottom', () => {
      render(
        <PersonManagerModal
          isOpen={true}
          persons={samplePersons}
          owners={sampleOwners}
          onUpdatePerson={mockOnUpdatePerson}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('calls onClose when Close button is clicked', () => {
      render(
        <PersonManagerModal
          isOpen={true}
          persons={samplePersons}
          owners={sampleOwners}
          onUpdatePerson={mockOnUpdatePerson}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Close' }));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('empty persons list', () => {
    it('renders empty modal when no persons', () => {
      render(
        <PersonManagerModal
          isOpen={true}
          persons={[]}
          owners={[]}
          onUpdatePerson={mockOnUpdatePerson}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    });
  });

  describe('person with no aliases', () => {
    it('handles person with undefined aliases', () => {
      const personsNoAliases = [
        { id: 'person1', primaryName: 'John Doe' }
      ];

      render(
        <PersonManagerModal
          isOpen={true}
          persons={personsNoAliases}
          owners={[]}
          onUpdatePerson={mockOnUpdatePerson}
          onClose={mockOnClose}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      fireEvent.click(editButtons[0]);

      expect(screen.getByPlaceholderText('Aliases (comma-separated)')).toHaveValue('');
    });
  });

  describe('editing different persons', () => {
    it('can switch between editing different persons', () => {
      render(
        <PersonManagerModal
          isOpen={true}
          persons={samplePersons}
          owners={sampleOwners}
          onUpdatePerson={mockOnUpdatePerson}
          onClose={mockOnClose}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });

      // Start editing first person
      fireEvent.click(editButtons[0]);
      expect(screen.getByPlaceholderText('Primary Name')).toHaveValue('John Doe');

      // Switch to editing second person
      fireEvent.click(editButtons[1]);
      expect(screen.getByPlaceholderText('Primary Name')).toHaveValue('Jane Smith');
    });
  });
});
