import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModalActions } from './ModalActions';

describe('ModalActions', () => {
  describe('rendering', () => {
    it('renders submit and cancel buttons', () => {
      render(
        <ModalActions
          onSubmit={() => {}}
          onCancel={() => {}}
        />
      );
      // New default label is "Confirm" with a checkmark icon
      expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('renders two buttons total', () => {
      render(
        <ModalActions
          onSubmit={() => {}}
          onCancel={() => {}}
        />
      );
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });
  });

  describe('default labels', () => {
    it('shows "Confirm" as default submit label', () => {
      render(
        <ModalActions
          onSubmit={() => {}}
          onCancel={() => {}}
        />
      );
      expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
    });

    it('shows "Cancel" as default cancel label', () => {
      render(
        <ModalActions
          onSubmit={() => {}}
          onCancel={() => {}}
        />
      );
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
  });

  describe('custom labels', () => {
    it('renders custom submit label', () => {
      render(
        <ModalActions
          onSubmit={() => {}}
          onCancel={() => {}}
          submitLabel="Add Grantee"
        />
      );
      expect(screen.getByRole('button', { name: /Add Grantee/i })).toBeInTheDocument();
    });

    it('renders custom cancel label', () => {
      render(
        <ModalActions
          onSubmit={() => {}}
          onCancel={() => {}}
          cancelLabel="Close"
        />
      );
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    });

    it('renders both custom labels together', () => {
      render(
        <ModalActions
          onSubmit={() => {}}
          onCancel={() => {}}
          submitLabel="Save"
          cancelLabel="Dismiss"
        />
      );
      expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    });

    it('handles long labels', () => {
      render(
        <ModalActions
          onSubmit={() => {}}
          onCancel={() => {}}
          submitLabel="Save and Continue Editing"
          cancelLabel="Discard Changes and Close"
        />
      );
      expect(screen.getByRole('button', { name: /Save and Continue Editing/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Discard Changes and Close' })).toBeInTheDocument();
    });
  });

  describe('click handlers', () => {
    it('calls onSubmit when submit button is clicked', () => {
      const onSubmit = vi.fn();
      render(
        <ModalActions
          onSubmit={onSubmit}
          onCancel={() => {}}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button is clicked', () => {
      const onCancel = vi.fn();
      render(
        <ModalActions
          onSubmit={() => {}}
          onCancel={onCancel}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('only calls the respective handler for each button', () => {
      const onSubmit = vi.fn();
      const onCancel = vi.fn();
      render(
        <ModalActions
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onCancel).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('handles multiple clicks', () => {
      const onSubmit = vi.fn();
      render(
        <ModalActions
          onSubmit={onSubmit}
          onCancel={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /Confirm/i });
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      expect(onSubmit).toHaveBeenCalledTimes(3);
    });
  });

  describe('styling', () => {
    it('renders buttons with flex: 1 style', () => {
      render(
        <ModalActions
          onSubmit={() => {}}
          onCancel={() => {}}
        />
      );
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveStyle({ flex: '1' });
      });
    });

    it('has flex container with gap', () => {
      render(
        <ModalActions
          onSubmit={() => {}}
          onCancel={() => {}}
        />
      );
      const buttons = screen.getAllByRole('button');
      const container = buttons[0].parentElement;
      expect(container).toHaveStyle({ display: 'flex', gap: '12px' });
    });
  });

  describe('button order', () => {
    it('renders submit button before cancel button in DOM', () => {
      render(
        <ModalActions
          onSubmit={() => {}}
          onCancel={() => {}}
        />
      );
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveTextContent(/Confirm/i);
      expect(buttons[1]).toHaveTextContent('Cancel');
    });
  });

  describe('accessibility', () => {
    it('buttons are focusable', () => {
      render(
        <ModalActions
          onSubmit={() => {}}
          onCancel={() => {}}
        />
      );
      const submitButton = screen.getByRole('button', { name: /Confirm/i });
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });

      submitButton.focus();
      expect(document.activeElement).toBe(submitButton);

      cancelButton.focus();
      expect(document.activeElement).toBe(cancelButton);
    });

    it('buttons can be activated with Enter key', () => {
      const onSubmit = vi.fn();
      render(
        <ModalActions
          onSubmit={onSubmit}
          onCancel={() => {}}
        />
      );

      const button = screen.getByRole('button', { name: /Confirm/i });
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    });
  });

  describe('edge cases', () => {
    it('handles empty string labels', () => {
      render(
        <ModalActions
          onSubmit={() => {}}
          onCancel={() => {}}
          submitLabel=""
          cancelLabel=""
        />
      );
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });

    it('calls handler when button is clicked', () => {
      const handler = vi.fn();

      render(
        <ModalActions
          onSubmit={handler}
          onCancel={() => {}}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));
      expect(handler).toHaveBeenCalled();
    });
  });
});
