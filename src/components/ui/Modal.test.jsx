import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Modal } from './Modal';

// Mock the constants module
vi.mock('../../utils/constants', () => ({
  STYLES: {
    modal: {
      overlay: { position: 'fixed', inset: 0, background: 'rgba(0,46,84,0.95)' },
      content: { background: 'white', padding: '30px', maxWidth: '550px' },
      title: { color: 'var(--navy)', marginBottom: '20px' }
    }
  }
}));

describe('Modal', () => {
  describe('rendering', () => {
    it('renders nothing when isOpen is false', () => {
      const { container } = render(
        <Modal isOpen={false} onClose={() => {}} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders modal when isOpen is true', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('renders title correctly', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="My Custom Title">
          <p>Content</p>
        </Modal>
      );
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('My Custom Title');
    });

    it('renders children content', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Title">
          <button>Click me</button>
          <input type="text" placeholder="Enter text" />
        </Modal>
      );
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Title">
          <p>First paragraph</p>
          <p>Second paragraph</p>
          <p>Third paragraph</p>
        </Modal>
      );
      expect(screen.getByText('First paragraph')).toBeInTheDocument();
      expect(screen.getByText('Second paragraph')).toBeInTheDocument();
      expect(screen.getByText('Third paragraph')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies default maxWidth of 550px', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Title">
          <p>Content</p>
        </Modal>
      );
      // The modal content container has the maxWidth - it contains the header div
      const title = screen.getByText('Title');
      // title -> h3 -> header -> content
      const content = title.closest('h3').parentElement.parentElement;
      expect(content).toHaveStyle({ maxWidth: '550px' });
    });

    it('applies custom maxWidth when provided', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Title" maxWidth="800px">
          <p>Content</p>
        </Modal>
      );
      const title = screen.getByText('Title');
      const content = title.closest('h3').parentElement.parentElement;
      expect(content).toHaveStyle({ maxWidth: '800px' });
    });

    it('has no-print class on overlay', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Title">
          <p>Content</p>
        </Modal>
      );
      const title = screen.getByText('Title');
      // Navigate up to the overlay (outermost container with no-print class)
      const overlay = title.closest('.no-print');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('visibility transitions', () => {
    it('transitions from closed to open', () => {
      const { rerender, container } = render(
        <Modal isOpen={false} onClose={() => {}} title="Title">
          <p>Content</p>
        </Modal>
      );
      expect(container.firstChild).toBeNull();

      rerender(
        <Modal isOpen={true} onClose={() => {}} title="Title">
          <p>Content</p>
        </Modal>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('starts animation when transitioning from open to closed', async () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={() => {}} title="Title">
          <p>Content</p>
        </Modal>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();

      rerender(
        <Modal isOpen={false} onClose={() => {}} title="Title">
          <p>Content</p>
        </Modal>
      );
      // Modal uses animation, so it may still be visible briefly during transition
      // The isVisible state gets set to false after animation timeout
      expect(screen.getByText('Title')).toBeInTheDocument();
    });
  });

  describe('different content types', () => {
    it('renders form elements correctly', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Form Modal">
          <form>
            <input type="text" name="name" data-testid="name-input" />
            <select name="option">
              <option value="1">Option 1</option>
              <option value="2">Option 2</option>
            </select>
            <textarea name="description" data-testid="description-textarea" />
          </form>
        </Modal>
      );
      expect(screen.getByTestId('name-input')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders nested components', () => {
      const NestedComponent = () => <div data-testid="nested">Nested content</div>;

      render(
        <Modal isOpen={true} onClose={() => {}} title="Nested Modal">
          <NestedComponent />
        </Modal>
      );
      expect(screen.getByTestId('nested')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles empty title', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="">
          <p>Content</p>
        </Modal>
      );
      const heading = screen.getByRole('heading', { level: 3 });
      // Title contains an icon span (✦) plus the empty title text
      expect(heading).toBeInTheDocument();
    });

    it('handles no children', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Empty Modal">
          {null}
        </Modal>
      );
      expect(screen.getByText('Empty Modal')).toBeInTheDocument();
    });

    it('handles undefined children', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Title">
          {undefined}
        </Modal>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
    });
  });
});
