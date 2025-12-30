import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DocumentForm } from './DocumentForm';

// Mock formatDateInput
vi.mock('../../utils/formatters', () => ({
  formatDateInput: vi.fn((value) => {
    // Simple mock implementation
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  })
}));

describe('DocumentForm', () => {
  const defaultDocForm = {
    instrumentNumber: '',
    book: '',
    page: '',
    dateRecorded: '',
    documentDate: '',
    grantor: '',
    documentTitle: '',
    note: ''
  };

  const createDocForm = (overrides = {}) => ({
    ...defaultDocForm,
    ...overrides
  });

  describe('rendering', () => {
    it('renders all form fields', () => {
      const setDocForm = vi.fn();
      render(<DocumentForm docForm={defaultDocForm} setDocForm={setDocForm} />);

      expect(screen.getByPlaceholderText('Instrument #')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Book')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Page')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Doc Date')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Recorded')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Grantor')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
    });

    it('renders notes textarea when not compact', () => {
      const setDocForm = vi.fn();
      render(<DocumentForm docForm={defaultDocForm} setDocForm={setDocForm} compact={false} />);

      expect(screen.getByPlaceholderText('Notes')).toBeInTheDocument();
    });

    it('does not render notes textarea when compact', () => {
      const setDocForm = vi.fn();
      render(<DocumentForm docForm={defaultDocForm} setDocForm={setDocForm} compact={true} />);

      expect(screen.queryByPlaceholderText('Notes')).not.toBeInTheDocument();
    });

    it('displays current values in form fields', () => {
      const docForm = createDocForm({
        instrumentNumber: '12345',
        book: '100',
        page: '50',
        grantor: 'John Doe'
      });
      const setDocForm = vi.fn();
      render(<DocumentForm docForm={docForm} setDocForm={setDocForm} />);

      expect(screen.getByPlaceholderText('Instrument #')).toHaveValue('12345');
      expect(screen.getByPlaceholderText('Book')).toHaveValue('100');
      expect(screen.getByPlaceholderText('Page')).toHaveValue('50');
      expect(screen.getByPlaceholderText('Grantor')).toHaveValue('John Doe');
    });
  });

  describe('input handling', () => {
    it('calls setDocForm when instrumentNumber changes', () => {
      const setDocForm = vi.fn();
      render(<DocumentForm docForm={defaultDocForm} setDocForm={setDocForm} />);

      fireEvent.change(screen.getByPlaceholderText('Instrument #'), {
        target: { value: 'ABC123' }
      });

      expect(setDocForm).toHaveBeenCalledWith({
        ...defaultDocForm,
        instrumentNumber: 'ABC123'
      });
    });

    it('calls setDocForm when book changes', () => {
      const setDocForm = vi.fn();
      render(<DocumentForm docForm={defaultDocForm} setDocForm={setDocForm} />);

      fireEvent.change(screen.getByPlaceholderText('Book'), {
        target: { value: '200' }
      });

      expect(setDocForm).toHaveBeenCalledWith({
        ...defaultDocForm,
        book: '200'
      });
    });

    it('calls setDocForm when page changes', () => {
      const setDocForm = vi.fn();
      render(<DocumentForm docForm={defaultDocForm} setDocForm={setDocForm} />);

      fireEvent.change(screen.getByPlaceholderText('Page'), {
        target: { value: '75' }
      });

      expect(setDocForm).toHaveBeenCalledWith({
        ...defaultDocForm,
        page: '75'
      });
    });

    it('calls setDocForm when grantor changes', () => {
      const setDocForm = vi.fn();
      render(<DocumentForm docForm={defaultDocForm} setDocForm={setDocForm} />);

      fireEvent.change(screen.getByPlaceholderText('Grantor'), {
        target: { value: 'Jane Smith' }
      });

      expect(setDocForm).toHaveBeenCalledWith({
        ...defaultDocForm,
        grantor: 'Jane Smith'
      });
    });

    it('calls setDocForm when documentTitle changes', () => {
      const setDocForm = vi.fn();
      render(<DocumentForm docForm={defaultDocForm} setDocForm={setDocForm} />);

      fireEvent.change(screen.getByPlaceholderText('Title'), {
        target: { value: 'Warranty Deed' }
      });

      expect(setDocForm).toHaveBeenCalledWith({
        ...defaultDocForm,
        documentTitle: 'Warranty Deed'
      });
    });

    it('calls setDocForm when note changes', () => {
      const setDocForm = vi.fn();
      render(<DocumentForm docForm={defaultDocForm} setDocForm={setDocForm} compact={false} />);

      fireEvent.change(screen.getByPlaceholderText('Notes'), {
        target: { value: 'This is a test note' }
      });

      expect(setDocForm).toHaveBeenCalledWith({
        ...defaultDocForm,
        note: 'This is a test note'
      });
    });
  });

  describe('date formatting', () => {
    it('formats documentDate input', () => {
      const setDocForm = vi.fn();
      render(<DocumentForm docForm={defaultDocForm} setDocForm={setDocForm} />);

      fireEvent.change(screen.getByPlaceholderText('Doc Date'), {
        target: { value: '12252023' }
      });

      expect(setDocForm).toHaveBeenCalledWith({
        ...defaultDocForm,
        documentDate: '12/25/2023'
      });
    });

    it('formats dateRecorded input', () => {
      const setDocForm = vi.fn();
      render(<DocumentForm docForm={defaultDocForm} setDocForm={setDocForm} />);

      fireEvent.change(screen.getByPlaceholderText('Recorded'), {
        target: { value: '01152024' }
      });

      expect(setDocForm).toHaveBeenCalledWith({
        ...defaultDocForm,
        dateRecorded: '01/15/2024'
      });
    });

    it('handles partial date input', () => {
      const setDocForm = vi.fn();
      render(<DocumentForm docForm={defaultDocForm} setDocForm={setDocForm} />);

      fireEvent.change(screen.getByPlaceholderText('Doc Date'), {
        target: { value: '12' }
      });

      expect(setDocForm).toHaveBeenCalledWith({
        ...defaultDocForm,
        documentDate: '12'
      });
    });
  });

  describe('compact mode styling', () => {
    it('applies compact padding when compact is true', () => {
      const setDocForm = vi.fn();
      const { container } = render(
        <DocumentForm docForm={defaultDocForm} setDocForm={setDocForm} compact={true} />
      );

      const formContainer = container.firstChild;
      expect(formContainer).toHaveStyle({ padding: '10px' });
    });

    it('applies normal padding when compact is false', () => {
      const setDocForm = vi.fn();
      const { container } = render(
        <DocumentForm docForm={defaultDocForm} setDocForm={setDocForm} compact={false} />
      );

      const formContainer = container.firstChild;
      expect(formContainer).toHaveStyle({ padding: '15px' });
    });

    it('applies compact font size when compact is true', () => {
      const setDocForm = vi.fn();
      const { container } = render(
        <DocumentForm docForm={defaultDocForm} setDocForm={setDocForm} compact={true} />
      );

      const formContainer = container.firstChild;
      expect(formContainer).toHaveStyle({ fontSize: '12px' });
    });

    it('applies normal font size when compact is false', () => {
      const setDocForm = vi.fn();
      const { container } = render(
        <DocumentForm docForm={defaultDocForm} setDocForm={setDocForm} compact={false} />
      );

      const formContainer = container.firstChild;
      expect(formContainer).toHaveStyle({ fontSize: '14px' });
    });
  });

  describe('grid layout', () => {
    it('uses 2-column grid when compact', () => {
      const setDocForm = vi.fn();
      const { container } = render(
        <DocumentForm docForm={defaultDocForm} setDocForm={setDocForm} compact={true} />
      );

      const grid = container.firstChild.firstChild;
      expect(grid).toHaveStyle({ gridTemplateColumns: '1fr 1fr' });
    });

    it('uses 3-column grid when not compact', () => {
      const setDocForm = vi.fn();
      const { container } = render(
        <DocumentForm docForm={defaultDocForm} setDocForm={setDocForm} compact={false} />
      );

      const grid = container.firstChild.firstChild;
      expect(grid).toHaveStyle({ gridTemplateColumns: '1fr 1fr 1fr' });
    });
  });

  describe('preserving existing form data', () => {
    it('preserves other fields when updating one field', () => {
      const docForm = createDocForm({
        instrumentNumber: '12345',
        book: '100',
        page: '50'
      });
      const setDocForm = vi.fn();
      render(<DocumentForm docForm={docForm} setDocForm={setDocForm} />);

      fireEvent.change(screen.getByPlaceholderText('Grantor'), {
        target: { value: 'New Grantor' }
      });

      expect(setDocForm).toHaveBeenCalledWith({
        ...docForm,
        grantor: 'New Grantor'
      });
    });
  });

  describe('edge cases', () => {
    it('handles empty values gracefully', () => {
      const docFormWithValue = { ...defaultDocForm, instrumentNumber: 'ABC123' };
      const setDocForm = vi.fn();
      render(<DocumentForm docForm={docFormWithValue} setDocForm={setDocForm} />);

      fireEvent.change(screen.getByPlaceholderText('Instrument #'), {
        target: { value: '' }
      });

      expect(setDocForm).toHaveBeenCalledWith({
        ...docFormWithValue,
        instrumentNumber: ''
      });
    });

    it('handles special characters in input', () => {
      const setDocForm = vi.fn();
      render(<DocumentForm docForm={defaultDocForm} setDocForm={setDocForm} />);

      fireEvent.change(screen.getByPlaceholderText('Grantor'), {
        target: { value: "O'Brien & Associates, LLC" }
      });

      expect(setDocForm).toHaveBeenCalledWith({
        ...defaultDocForm,
        grantor: "O'Brien & Associates, LLC"
      });
    });

    it('handles very long input values', () => {
      const setDocForm = vi.fn();
      const longValue = 'A'.repeat(500);
      render(<DocumentForm docForm={defaultDocForm} setDocForm={setDocForm} />);

      fireEvent.change(screen.getByPlaceholderText('Title'), {
        target: { value: longValue }
      });

      expect(setDocForm).toHaveBeenCalledWith({
        ...defaultDocForm,
        documentTitle: longValue
      });
    });
  });
});
