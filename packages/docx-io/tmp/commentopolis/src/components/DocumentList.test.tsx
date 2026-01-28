import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DocumentList } from './DocumentList';
import type { UploadedDocument } from '../types';

// Mock the useDocumentContext hook
const mockSetActiveDocument = vi.fn();
const mockRemoveDocument = vi.fn();
const mockSelectAllDocuments = vi.fn();
const mockDeselectAllDocuments = vi.fn();
const mockToggleDocumentSelection = vi.fn();
const mockUseDocumentContext = vi.fn();

vi.mock('../hooks/useDocumentContext', () => ({
  useDocumentContext: () => mockUseDocumentContext(),
}));

describe('DocumentList', () => {
  const mockDocuments: UploadedDocument[] = [
    {
      id: 'doc1',
      name: 'Test Document 1.docx',
      file: new File([''], 'test1.docx'),
      uploadDate: new Date('2023-01-01'),
      size: 1000,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      comments: [
        {
          id: 'comment1',
          author: 'John Doe',
          date: new Date(),
          plainText: 'Test comment',
          content: '<p>Test comment</p>',
          documentId: 'doc1'
        }
      ]
    },
    {
      id: 'doc2',
      name: 'Test Document 2.docx',
      file: new File([''], 'test2.docx'),
      uploadDate: new Date('2023-01-02'),
      size: 2000,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      comments: []
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: null,
      selectedDocumentIds: [],
      setActiveDocument: mockSetActiveDocument,
      removeDocument: mockRemoveDocument,
      selectAllDocuments: mockSelectAllDocuments,
      deselectAllDocuments: mockDeselectAllDocuments,
      toggleDocumentSelection: mockToggleDocumentSelection,
    });
  });

  it('should render empty state when no documents are available', () => {
    mockUseDocumentContext.mockReturnValue({
      documents: [],
      activeDocumentId: null,
      selectedDocumentIds: [],
      setActiveDocument: mockSetActiveDocument,
      removeDocument: mockRemoveDocument,
      selectAllDocuments: mockSelectAllDocuments,
      deselectAllDocuments: mockDeselectAllDocuments,
      toggleDocumentSelection: mockToggleDocumentSelection,
    });

    render(<DocumentList />);

    expect(screen.getByText('No documents uploaded yet')).toBeInTheDocument();
  });

  it('should render documents with checkboxes for selection', () => {
    render(<DocumentList />);

    expect(screen.getByText('Test Document 1.docx')).toBeInTheDocument();
    expect(screen.getByText('Test Document 2.docx')).toBeInTheDocument();
    
    // Should have checkboxes for each document
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
  });

  it('should show selection controls with correct count', () => {
    render(<DocumentList />);

    expect(screen.getByText('0 of 2 selected')).toBeInTheDocument();
    expect(screen.getByText('Select All')).toBeInTheDocument();
  });

  it('should show deselect all when all documents are selected', () => {
    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: null,
      selectedDocumentIds: ['doc1', 'doc2'],
      setActiveDocument: mockSetActiveDocument,
      removeDocument: mockRemoveDocument,
      selectAllDocuments: mockSelectAllDocuments,
      deselectAllDocuments: mockDeselectAllDocuments,
      toggleDocumentSelection: mockToggleDocumentSelection,
    });

    render(<DocumentList />);

    expect(screen.getByText('2 of 2 selected')).toBeInTheDocument();
    expect(screen.getByText('Deselect All')).toBeInTheDocument();
  });

  it('should call selectAllDocuments when clicking Select All', () => {
    render(<DocumentList />);

    const selectAllButton = screen.getByText('Select All');
    fireEvent.click(selectAllButton);

    expect(mockSelectAllDocuments).toHaveBeenCalledOnce();
  });

  it('should call deselectAllDocuments when clicking Deselect All', () => {
    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: null,
      selectedDocumentIds: ['doc1', 'doc2'],
      setActiveDocument: mockSetActiveDocument,
      removeDocument: mockRemoveDocument,
      selectAllDocuments: mockSelectAllDocuments,
      deselectAllDocuments: mockDeselectAllDocuments,
      toggleDocumentSelection: mockToggleDocumentSelection,
    });

    render(<DocumentList />);

    const deselectAllButton = screen.getByText('Deselect All');
    fireEvent.click(deselectAllButton);

    expect(mockDeselectAllDocuments).toHaveBeenCalledOnce();
  });

  it('should call toggleDocumentSelection when clicking a checkbox', () => {
    render(<DocumentList />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(mockToggleDocumentSelection).toHaveBeenCalledWith('doc1');
  });

  it('should show selected documents with blue styling', () => {
    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: null,
      selectedDocumentIds: ['doc1'],
      setActiveDocument: mockSetActiveDocument,
      removeDocument: mockRemoveDocument,
      selectAllDocuments: mockSelectAllDocuments,
      deselectAllDocuments: mockDeselectAllDocuments,
      toggleDocumentSelection: mockToggleDocumentSelection,
    });

    render(<DocumentList />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });

  it('should show active document indicator', () => {
    mockUseDocumentContext.mockReturnValue({
      documents: mockDocuments,
      activeDocumentId: 'doc1',
      selectedDocumentIds: [],
      setActiveDocument: mockSetActiveDocument,
      removeDocument: mockRemoveDocument,
      selectAllDocuments: mockSelectAllDocuments,
      deselectAllDocuments: mockDeselectAllDocuments,
      toggleDocumentSelection: mockToggleDocumentSelection,
    });

    render(<DocumentList />);

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should call setActiveDocument when clicking on document name', () => {
    render(<DocumentList />);

    const documentName = screen.getByText('Test Document 1.docx');
    fireEvent.click(documentName);

    expect(mockSetActiveDocument).toHaveBeenCalledWith('doc1');
  });

  it('should show comment count for documents with comments', () => {
    render(<DocumentList />);

    expect(screen.getByText('1 comment')).toBeInTheDocument();
  });

  it('should call removeDocument when clicking delete button', () => {
    render(<DocumentList />);

    const deleteButtons = screen.getAllByTitle('Remove document');
    fireEvent.click(deleteButtons[0]);

    expect(mockRemoveDocument).toHaveBeenCalledWith('doc1');
  });
});