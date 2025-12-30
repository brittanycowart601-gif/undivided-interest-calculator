import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SubgroupManagerModal } from './SubgroupManagerModal';

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

describe('SubgroupManagerModal', () => {
  const sampleSubgroups = [
    { id: 'group1', name: 'Family A', color: '#517f8c' },
    { id: 'group2', name: 'Family B', color: '#3d6670' }
  ];

  const sampleOwners = [
    { id: 'owner1', name: 'John Doe', subgroupId: 'group1' },
    { id: 'owner2', name: 'Jane Smith', subgroupId: 'group1' },
    { id: 'owner3', name: 'Bob Johnson', subgroupId: 'group2' },
    { id: 'owner4', name: 'Alice Brown', subgroupId: null }
  ];

  const mockOnAddSubgroup = vi.fn();
  const mockOnUpdateSubgroup = vi.fn();
  const mockOnDeleteSubgroup = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders nothing when isOpen is false', () => {
      const { container } = render(
        <SubgroupManagerModal
          isOpen={false}
          subgroups={sampleSubgroups}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders modal when isOpen is true', () => {
      render(
        <SubgroupManagerModal
          isOpen={true}
          subgroups={sampleSubgroups}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('displays the title with emoji', () => {
      render(
        <SubgroupManagerModal
          isOpen={true}
          subgroups={sampleSubgroups}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText(/SUBGROUPS/)).toBeInTheDocument();
    });

    it('passes maxWidth of 700px to Modal', () => {
      render(
        <SubgroupManagerModal
          isOpen={true}
          subgroups={sampleSubgroups}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByTestId('modal')).toHaveAttribute('data-maxwidth', '700px');
    });
  });

  describe('add subgroup form', () => {
    it('displays "Add New Subgroup" heading', () => {
      render(
        <SubgroupManagerModal
          isOpen={true}
          subgroups={sampleSubgroups}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText('Add New Subgroup')).toBeInTheDocument();
    });

    it('renders name input', () => {
      render(
        <SubgroupManagerModal
          isOpen={true}
          subgroups={sampleSubgroups}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByPlaceholderText('Subgroup name')).toBeInTheDocument();
    });

    it('renders color picker', () => {
      render(
        <SubgroupManagerModal
          isOpen={true}
          subgroups={sampleSubgroups}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );

      const colorInputs = screen.getAllByDisplayValue('#517f8c');
      expect(colorInputs.length).toBeGreaterThan(0);
    });

    it('renders Add button', () => {
      render(
        <SubgroupManagerModal
          isOpen={true}
          subgroups={sampleSubgroups}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });
  });

  describe('add subgroup functionality', () => {
    it('calls onAddSubgroup when Add is clicked with valid name', () => {
      render(
        <SubgroupManagerModal
          isOpen={true}
          subgroups={sampleSubgroups}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );

      const nameInput = screen.getByPlaceholderText('Subgroup name');
      fireEvent.change(nameInput, { target: { value: 'New Family' } });

      fireEvent.click(screen.getByRole('button', { name: 'Add' }));

      expect(mockOnAddSubgroup).toHaveBeenCalledWith({
        name: 'New Family',
        color: '#517f8c',
        nodeIds: []
      });
    });

    it('does not call onAddSubgroup when name is empty', () => {
      render(
        <SubgroupManagerModal
          isOpen={true}
          subgroups={sampleSubgroups}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Add' }));

      expect(mockOnAddSubgroup).not.toHaveBeenCalled();
    });

    it('does not call onAddSubgroup when name is only whitespace', () => {
      render(
        <SubgroupManagerModal
          isOpen={true}
          subgroups={sampleSubgroups}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );

      const nameInput = screen.getByPlaceholderText('Subgroup name');
      fireEvent.change(nameInput, { target: { value: '   ' } });

      fireEvent.click(screen.getByRole('button', { name: 'Add' }));

      expect(mockOnAddSubgroup).not.toHaveBeenCalled();
    });

    it('clears form after successful add', () => {
      render(
        <SubgroupManagerModal
          isOpen={true}
          subgroups={sampleSubgroups}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );

      const nameInput = screen.getByPlaceholderText('Subgroup name');
      fireEvent.change(nameInput, { target: { value: 'New Family' } });

      fireEvent.click(screen.getByRole('button', { name: 'Add' }));

      expect(nameInput).toHaveValue('');
    });
  });

  describe('subgroup list display', () => {
    it('displays all subgroups', () => {
      render(
        <SubgroupManagerModal
          isOpen={true}
          subgroups={sampleSubgroups}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Family A')).toBeInTheDocument();
      expect(screen.getByText('Family B')).toBeInTheDocument();
    });

    it('displays node count for each subgroup', () => {
      render(
        <SubgroupManagerModal
          isOpen={true}
          subgroups={sampleSubgroups}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );

      // Family A has 2 nodes
      expect(screen.getByText('(2 nodes)')).toBeInTheDocument();
      // Family B has 1 node
      expect(screen.getByText('(1 node)')).toBeInTheDocument();
    });

    it('displays Edit button for each subgroup', () => {
      render(
        <SubgroupManagerModal
          isOpen={true}
          subgroups={sampleSubgroups}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      expect(editButtons).toHaveLength(2);
    });

    it('displays Delete button for each subgroup', () => {
      render(
        <SubgroupManagerModal
          isOpen={true}
          subgroups={sampleSubgroups}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
      expect(deleteButtons).toHaveLength(2);
    });
  });

  describe('empty subgroups list', () => {
    it('displays empty message when no subgroups', () => {
      render(
        <SubgroupManagerModal
          isOpen={true}
          subgroups={[]}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/No subgroups yet/)).toBeInTheDocument();
    });
  });

  describe('edit subgroup functionality', () => {
    it('shows edit form when Edit is clicked', () => {
      render(
        <SubgroupManagerModal
          isOpen={true}
          subgroups={sampleSubgroups}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      fireEvent.click(editButtons[0]);

      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('populates form with subgroup data when editing', () => {
      render(
        <SubgroupManagerModal
          isOpen={true}
          subgroups={sampleSubgroups}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      fireEvent.click(editButtons[0]);

      // Find the edit form's input (should have the current name)
      const inputs = screen.getAllByRole('textbox');
      const editInput = inputs.find(input => input.value === 'Family A');
      expect(editInput).toBeInTheDocument();
    });

    it('calls onUpdateSubgroup when Save is clicked', () => {
      render(
        <SubgroupManagerModal
          isOpen={true}
          subgroups={sampleSubgroups}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      fireEvent.click(editButtons[0]);

      const inputs = screen.getAllByRole('textbox');
      const editInput = inputs.find(input => input.value === 'Family A');
      fireEvent.change(editInput, { target: { value: 'Updated Family A' } });

      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(mockOnUpdateSubgroup).toHaveBeenCalledWith('group1', {
        name: 'Updated Family A',
        color: '#517f8c'
      });
    });

    it('closes edit form when Cancel is clicked', () => {
      render(
        <SubgroupManagerModal
          isOpen={true}
          subgroups={sampleSubgroups}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: 'Edit' });
      fireEvent.click(editButtons[0]);

      // Find and click cancel in the edit form
      const cancelButtons = screen.getAllByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButtons[0]);

      // Save button should no longer be present (edit form closed)
      expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });
  });

  describe('delete subgroup functionality', () => {
    it('calls onDeleteSubgroup when Delete is clicked and confirmed', () => {
      render(
        <SubgroupManagerModal
          isOpen={true}
          subgroups={sampleSubgroups}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
      fireEvent.click(deleteButtons[0]);

      expect(mockOnDeleteSubgroup).toHaveBeenCalledWith('group1');
    });
  });

  describe('close modal', () => {
    it('renders Close button at bottom', () => {
      render(
        <SubgroupManagerModal
          isOpen={true}
          subgroups={sampleSubgroups}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('calls onClose when Close button is clicked', () => {
      render(
        <SubgroupManagerModal
          isOpen={true}
          subgroups={sampleSubgroups}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Close' }));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('color selection', () => {
    it('allows changing color when adding', () => {
      render(
        <SubgroupManagerModal
          isOpen={true}
          subgroups={sampleSubgroups}
          owners={sampleOwners}
          onAddSubgroup={mockOnAddSubgroup}
          onUpdateSubgroup={mockOnUpdateSubgroup}
          onDeleteSubgroup={mockOnDeleteSubgroup}
          onClose={mockOnClose}
        />
      );

      const colorInput = screen.getAllByDisplayValue('#517f8c')[0];
      fireEvent.change(colorInput, { target: { value: '#ff0000' } });

      const nameInput = screen.getByPlaceholderText('Subgroup name');
      fireEvent.change(nameInput, { target: { value: 'Red Group' } });

      fireEvent.click(screen.getByRole('button', { name: 'Add' }));

      expect(mockOnAddSubgroup).toHaveBeenCalledWith({
        name: 'Red Group',
        color: '#ff0000',
        nodeIds: []
      });
    });
  });
});
