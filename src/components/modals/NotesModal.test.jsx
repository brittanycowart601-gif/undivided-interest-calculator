import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotesModal } from './NotesModal';

// Mock Modal component
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

describe('NotesModal', () => {
  describe('rendering', () => {
    it('renders nothing when isOpen is false', () => {
      const { container } = render(
        <NotesModal isOpen={false} notes="Some notes" onClose={() => {}} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders modal when isOpen is true', () => {
      render(
        <NotesModal isOpen={true} notes="Some notes" onClose={() => {}} />
      );
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('displays the title "NOTES"', () => {
      render(
        <NotesModal isOpen={true} notes="Some notes" onClose={() => {}} />
      );
      expect(screen.getByText('NOTES')).toBeInTheDocument();
    });

    it('passes maxWidth of 500px to Modal', () => {
      render(
        <NotesModal isOpen={true} notes="Some notes" onClose={() => {}} />
      );
      expect(screen.getByTestId('modal')).toHaveAttribute('data-maxwidth', '500px');
    });
  });

  describe('notes display', () => {
    it('displays the provided notes', () => {
      const notes = 'These are my important notes about this property transfer.';
      render(
        <NotesModal isOpen={true} notes={notes} onClose={() => {}} />
      );
      expect(screen.getByText(notes)).toBeInTheDocument();
    });

    it('displays "No notes." when notes is empty string', () => {
      render(
        <NotesModal isOpen={true} notes="" onClose={() => {}} />
      );
      expect(screen.getByText('No notes.')).toBeInTheDocument();
    });

    it('displays "No notes." when notes is null', () => {
      render(
        <NotesModal isOpen={true} notes={null} onClose={() => {}} />
      );
      expect(screen.getByText('No notes.')).toBeInTheDocument();
    });

    it('displays "No notes." when notes is undefined', () => {
      render(
        <NotesModal isOpen={true} notes={undefined} onClose={() => {}} />
      );
      expect(screen.getByText('No notes.')).toBeInTheDocument();
    });

    it('preserves whitespace in notes', () => {
      const notesWithNewlines = 'Line 1\nLine 2\nLine 3';
      render(
        <NotesModal isOpen={true} notes={notesWithNewlines} onClose={() => {}} />
      );

      const notesContainer = screen.getByText(/Line 1/);
      expect(notesContainer).toHaveStyle({ whiteSpace: 'pre-wrap' });
    });

    it('displays long notes', () => {
      const longNotes = 'A'.repeat(1000);
      render(
        <NotesModal isOpen={true} notes={longNotes} onClose={() => {}} />
      );
      expect(screen.getByText(longNotes)).toBeInTheDocument();
    });

    it('displays notes with special characters', () => {
      const specialNotes = 'Property transfer from O\'Brien & Associates, LLC (50% interest)';
      render(
        <NotesModal isOpen={true} notes={specialNotes} onClose={() => {}} />
      );
      expect(screen.getByText(specialNotes)).toBeInTheDocument();
    });
  });

  describe('close button', () => {
    it('renders a Close button', () => {
      render(
        <NotesModal isOpen={true} notes="Notes" onClose={() => {}} />
      );
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('calls onClose when Close button is clicked', () => {
      const onClose = vi.fn();
      render(
        <NotesModal isOpen={true} notes="Notes" onClose={onClose} />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('has full width styling', () => {
      render(
        <NotesModal isOpen={true} notes="Notes" onClose={() => {}} />
      );

      const button = screen.getByRole('button', { name: 'Close' });
      expect(button).toHaveStyle({ width: '100%' });
    });
  });

  describe('notes container styling', () => {
    it('has gray-light background', () => {
      render(
        <NotesModal isOpen={true} notes="Notes" onClose={() => {}} />
      );

      const notesContainer = screen.getByText('Notes').closest('div');
      expect(notesContainer).toHaveStyle({ background: 'var(--gray-light)' });
    });

    it('has padding', () => {
      render(
        <NotesModal isOpen={true} notes="Notes" onClose={() => {}} />
      );

      const notesContainer = screen.getByText('Notes').closest('div');
      expect(notesContainer).toHaveStyle({ padding: '15px' });
    });

    it('has minimum height', () => {
      render(
        <NotesModal isOpen={true} notes="Notes" onClose={() => {}} />
      );

      const notesContainer = screen.getByText('Notes').closest('div');
      expect(notesContainer).toHaveStyle({ minHeight: '100px' });
    });
  });

  describe('visibility transitions', () => {
    it('transitions from closed to open', () => {
      const { rerender, container } = render(
        <NotesModal isOpen={false} notes="Notes" onClose={() => {}} />
      );
      expect(container.firstChild).toBeNull();

      rerender(
        <NotesModal isOpen={true} notes="Notes" onClose={() => {}} />
      );
      expect(screen.getByText('Notes')).toBeInTheDocument();
    });

    it('transitions from open to closed', () => {
      const { rerender, container } = render(
        <NotesModal isOpen={true} notes="Notes" onClose={() => {}} />
      );
      expect(screen.getByText('Notes')).toBeInTheDocument();

      rerender(
        <NotesModal isOpen={false} notes="Notes" onClose={() => {}} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('notes content changes', () => {
    it('updates displayed notes when prop changes', () => {
      const { rerender } = render(
        <NotesModal isOpen={true} notes="Original notes" onClose={() => {}} />
      );
      expect(screen.getByText('Original notes')).toBeInTheDocument();

      rerender(
        <NotesModal isOpen={true} notes="Updated notes" onClose={() => {}} />
      );
      expect(screen.getByText('Updated notes')).toBeInTheDocument();
      expect(screen.queryByText('Original notes')).not.toBeInTheDocument();
    });
  });
});
