import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DocumentSelector } from './DocumentSelector';

// Mock dependencies
vi.mock('../../utils/formatters', () => ({
  getDocumentLabel: vi.fn((doc) => {
    if (doc.instrumentNumber) return `Inst: ${doc.instrumentNumber}`;
    if (doc.book && doc.page) return `Bk ${doc.book} Pg ${doc.page}`;
    return 'Untitled Document';
  })
}));

vi.mock('./DocumentForm', () => ({
  DocumentForm: vi.fn(({ docForm }) => (
    <div data-testid="document-form">
      Mock DocumentForm: {docForm.instrumentNumber || 'empty'}
    </div>
  ))
}));

describe('DocumentSelector', () => {
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

  const sampleDocuments = [
    { id: 'doc1', instrumentNumber: '12345', documentTitle: 'Warranty Deed' },
    { id: 'doc2', book: '100', page: '50', documentTitle: 'Quitclaim Deed' },
    { id: 'doc3', instrumentNumber: '67890', documentTitle: '' }
  ];

  describe('rendering', () => {
    it('renders a select dropdown', () => {
      render(
        <DocumentSelector
          value=""
          onChange={() => {}}
          documents={[]}
          newDocForm={defaultDocForm}
          setNewDocForm={() => {}}
        />
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders "Add New Document" option when showNew is true', () => {
      render(
        <DocumentSelector
          value=""
          onChange={() => {}}
          documents={[]}
          newDocForm={defaultDocForm}
          setNewDocForm={() => {}}
          showNew={true}
        />
      );

      expect(screen.getByText('+ Add New Document')).toBeInTheDocument();
    });

    it('does not render "Add New Document" option when showNew is false', () => {
      render(
        <DocumentSelector
          value=""
          onChange={() => {}}
          documents={[]}
          newDocForm={defaultDocForm}
          setNewDocForm={() => {}}
          showNew={false}
        />
      );

      expect(screen.queryByText('+ Add New Document')).not.toBeInTheDocument();
    });

    it('renders "No Document" option', () => {
      render(
        <DocumentSelector
          value=""
          onChange={() => {}}
          documents={[]}
          newDocForm={defaultDocForm}
          setNewDocForm={() => {}}
        />
      );

      expect(screen.getByText('-- No Document --')).toBeInTheDocument();
    });

    it('renders all provided documents as options', () => {
      render(
        <DocumentSelector
          value=""
          onChange={() => {}}
          documents={sampleDocuments}
          newDocForm={defaultDocForm}
          setNewDocForm={() => {}}
        />
      );

      expect(screen.getByText(/Inst: 12345.*Warranty Deed/)).toBeInTheDocument();
      expect(screen.getByText(/Bk 100 Pg 50.*Quitclaim Deed/)).toBeInTheDocument();
      expect(screen.getByText('Inst: 67890')).toBeInTheDocument();
    });

    it('shows document title when available', () => {
      render(
        <DocumentSelector
          value=""
          onChange={() => {}}
          documents={sampleDocuments}
          newDocForm={defaultDocForm}
          setNewDocForm={() => {}}
        />
      );

      const option = screen.getByText(/Inst: 12345.*Warranty Deed/);
      expect(option).toHaveTextContent('Warranty Deed');
    });
  });

  describe('selected value', () => {
    it('shows current value as selected', () => {
      render(
        <DocumentSelector
          value="doc1"
          onChange={() => {}}
          documents={sampleDocuments}
          newDocForm={defaultDocForm}
          setNewDocForm={() => {}}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('doc1');
    });

    it('shows "new" when value is "new"', () => {
      render(
        <DocumentSelector
          value="new"
          onChange={() => {}}
          documents={sampleDocuments}
          newDocForm={defaultDocForm}
          setNewDocForm={() => {}}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('new');
    });

    it('shows empty when value is empty string', () => {
      render(
        <DocumentSelector
          value=""
          onChange={() => {}}
          documents={sampleDocuments}
          newDocForm={defaultDocForm}
          setNewDocForm={() => {}}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('');
    });
  });

  describe('onChange handling', () => {
    it('calls onChange when selecting a document', () => {
      const onChange = vi.fn();
      render(
        <DocumentSelector
          value=""
          onChange={onChange}
          documents={sampleDocuments}
          newDocForm={defaultDocForm}
          setNewDocForm={() => {}}
        />
      );

      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: 'doc1' }
      });

      expect(onChange).toHaveBeenCalledWith('doc1');
    });

    it('calls onChange when selecting "new"', () => {
      const onChange = vi.fn();
      render(
        <DocumentSelector
          value=""
          onChange={onChange}
          documents={sampleDocuments}
          newDocForm={defaultDocForm}
          setNewDocForm={() => {}}
        />
      );

      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: 'new' }
      });

      expect(onChange).toHaveBeenCalledWith('new');
    });

    it('calls onChange when selecting "No Document"', () => {
      const onChange = vi.fn();
      render(
        <DocumentSelector
          value="doc1"
          onChange={onChange}
          documents={sampleDocuments}
          newDocForm={defaultDocForm}
          setNewDocForm={() => {}}
        />
      );

      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: '' }
      });

      expect(onChange).toHaveBeenCalledWith('');
    });
  });

  describe('DocumentForm display', () => {
    it('shows DocumentForm when value is "new"', () => {
      render(
        <DocumentSelector
          value="new"
          onChange={() => {}}
          documents={sampleDocuments}
          newDocForm={defaultDocForm}
          setNewDocForm={() => {}}
        />
      );

      expect(screen.getByTestId('document-form')).toBeInTheDocument();
    });

    it('does not show DocumentForm when value is not "new"', () => {
      render(
        <DocumentSelector
          value="doc1"
          onChange={() => {}}
          documents={sampleDocuments}
          newDocForm={defaultDocForm}
          setNewDocForm={() => {}}
        />
      );

      expect(screen.queryByTestId('document-form')).not.toBeInTheDocument();
    });

    it('does not show DocumentForm when value is empty', () => {
      render(
        <DocumentSelector
          value=""
          onChange={() => {}}
          documents={sampleDocuments}
          newDocForm={defaultDocForm}
          setNewDocForm={() => {}}
        />
      );

      expect(screen.queryByTestId('document-form')).not.toBeInTheDocument();
    });
  });

  describe('empty documents list', () => {
    it('renders with no document options when list is empty', () => {
      render(
        <DocumentSelector
          value=""
          onChange={() => {}}
          documents={[]}
          newDocForm={defaultDocForm}
          setNewDocForm={() => {}}
        />
      );

      const select = screen.getByRole('combobox');
      const options = select.querySelectorAll('option');

      // Should only have "Add New" and "No Document" options
      expect(options).toHaveLength(2);
    });
  });

  describe('styling', () => {
    it('applies full width to select', () => {
      render(
        <DocumentSelector
          value=""
          onChange={() => {}}
          documents={[]}
          newDocForm={defaultDocForm}
          setNewDocForm={() => {}}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveStyle({ width: '100%' });
    });

    it('renders select element', () => {
      render(
        <DocumentSelector
          value=""
          onChange={() => {}}
          documents={[]}
          newDocForm={defaultDocForm}
          setNewDocForm={() => {}}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });
  });

  describe('option ordering', () => {
    it('renders options in correct order', () => {
      render(
        <DocumentSelector
          value=""
          onChange={() => {}}
          documents={sampleDocuments}
          newDocForm={defaultDocForm}
          setNewDocForm={() => {}}
          showNew={true}
        />
      );

      const select = screen.getByRole('combobox');
      const options = Array.from(select.querySelectorAll('option'));

      expect(options[0]).toHaveTextContent('+ Add New Document');
      expect(options[1]).toHaveTextContent('-- No Document --');
      // Documents follow
      expect(options[2]).toHaveTextContent('Inst: 12345');
    });
  });

  describe('edge cases', () => {
    it('handles document with no instrumentNumber or book/page', () => {
      const docsWithEmpty = [
        { id: 'empty-doc', documentTitle: 'Empty Doc' }
      ];

      render(
        <DocumentSelector
          value=""
          onChange={() => {}}
          documents={docsWithEmpty}
          newDocForm={defaultDocForm}
          setNewDocForm={() => {}}
        />
      );

      expect(screen.getByText(/Untitled Document.*Empty Doc/)).toBeInTheDocument();
    });

    it('handles rapid value changes', () => {
      const onChange = vi.fn();
      render(
        <DocumentSelector
          value=""
          onChange={onChange}
          documents={sampleDocuments}
          newDocForm={defaultDocForm}
          setNewDocForm={() => {}}
        />
      );

      const select = screen.getByRole('combobox');

      fireEvent.change(select, { target: { value: 'doc1' } });
      fireEvent.change(select, { target: { value: 'doc2' } });
      fireEvent.change(select, { target: { value: 'new' } });

      expect(onChange).toHaveBeenCalledTimes(3);
      expect(onChange).toHaveBeenNthCalledWith(1, 'doc1');
      expect(onChange).toHaveBeenNthCalledWith(2, 'doc2');
      expect(onChange).toHaveBeenNthCalledWith(3, 'new');
    });
  });
});
