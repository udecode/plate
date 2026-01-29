import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReportPreview } from './ReportPreview';
import type { DocumentComment, MetaComment, UploadedDocument } from '../types';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('ReportPreview', () => {
  const sampleDocuments: UploadedDocument[] = [
    {
      id: 'doc-1',
      name: 'budget-proposal.docx',
      file: new File([], 'budget-proposal.docx'),
      uploadDate: new Date('2024-10-15'),
      size: 1024,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }
  ];

  const sampleWordComments: DocumentComment[] = [
    {
      id: 'comment-1',
      author: 'Legal Department',
      date: new Date('2024-10-15'),
      plainText: 'Payment terms must remain Net-30',
      content: '<p>Payment terms must remain Net-30</p>',
      documentId: 'doc-1'
    }
  ];

  const sampleMetaComments: MetaComment[] = [
    {
      id: 'meta-1',
      type: 'synthesis',
      text: 'Analysis of payment terms',
      author: 'Analyst',
      created: new Date('2024-10-20'),
      linkedComments: ['comment-1'],
      tags: ['payment'],
      includeInReport: true
    },
    {
      id: 'meta-2',
      type: 'question',
      text: 'Should we revise the payment schedule?',
      author: 'Analyst',
      created: new Date('2024-10-20'),
      linkedComments: [],
      tags: ['question'],
      includeInReport: true
    }
  ];

  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });
  });

  it('should render report preview with header', () => {
    render(
      <ReportPreview
        selectedCommentIds={['comment-1']}
        wordComments={sampleWordComments}
        metaComments={sampleMetaComments}
        documents={sampleDocuments}
      />
    );

    expect(screen.getByText('📄 Report Generator')).toBeInTheDocument();
    expect(screen.getByText(/Generate clean, readable report text/)).toBeInTheDocument();
  });

  it('should render report title input with default value', () => {
    render(
      <ReportPreview
        selectedCommentIds={['comment-1']}
        wordComments={sampleWordComments}
        metaComments={sampleMetaComments}
        documents={sampleDocuments}
      />
    );

    const titleInput = screen.getByDisplayValue('Analysis Report') as HTMLInputElement;
    expect(titleInput).toBeInTheDocument();
  });

  it('should allow changing the report title', () => {
    render(
      <ReportPreview
        selectedCommentIds={['comment-1']}
        wordComments={sampleWordComments}
        metaComments={sampleMetaComments}
        documents={sampleDocuments}
      />
    );

    const titleInput = screen.getByDisplayValue('Analysis Report') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Custom Report Title' } });

    expect(titleInput.value).toBe('Custom Report Title');
  });

  it('should render "Include Questions" checkbox checked by default', () => {
    render(
      <ReportPreview
        selectedCommentIds={['comment-1']}
        wordComments={sampleWordComments}
        metaComments={sampleMetaComments}
        documents={sampleDocuments}
      />
    );

    const checkbox = screen.getByLabelText(/Include "Questions for Follow-up" section/) as HTMLInputElement;
    expect(checkbox).toBeChecked();
  });

  it('should allow toggling include questions checkbox', () => {
    render(
      <ReportPreview
        selectedCommentIds={['comment-1']}
        wordComments={sampleWordComments}
        metaComments={sampleMetaComments}
        documents={sampleDocuments}
      />
    );

    const checkbox = screen.getByLabelText(/Include "Questions for Follow-up" section/) as HTMLInputElement;
    fireEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
  });

  it('should display statistics about selected comments', () => {
    render(
      <ReportPreview
        selectedCommentIds={['comment-1', 'meta-1']}
        wordComments={sampleWordComments}
        metaComments={sampleMetaComments}
        documents={sampleDocuments}
      />
    );

    // Check stats section exists with all labels
    const statsContainer = screen.getByText(/Word Comments:/).closest('div')?.parentElement;
    expect(statsContainer).toBeInTheDocument();
    expect(screen.getAllByText(/Word Comments:/)).toHaveLength(1);
    expect(screen.getAllByText(/Meta-Comments:/)).toHaveLength(1);
  });

  it('should display report preview text', () => {
    render(
      <ReportPreview
        selectedCommentIds={['comment-1']}
        wordComments={sampleWordComments}
        metaComments={sampleMetaComments}
        documents={sampleDocuments}
      />
    );

    // Check for elements that should be in the report
    expect(screen.getByText(/Analysis Report/)).toBeInTheDocument();
    expect(screen.getByText(/Legal Department \(budget-proposal\.docx/)).toBeInTheDocument();
  });

  it('should render Copy to Clipboard button', () => {
    render(
      <ReportPreview
        selectedCommentIds={['comment-1']}
        wordComments={sampleWordComments}
        metaComments={sampleMetaComments}
        documents={sampleDocuments}
      />
    );

    expect(screen.getByRole('button', { name: /Copy to Clipboard/i })).toBeInTheDocument();
  });

  it('should copy report to clipboard when button is clicked', async () => {
    const toast = await import('react-hot-toast');
    
    render(
      <ReportPreview
        selectedCommentIds={['comment-1']}
        wordComments={sampleWordComments}
        metaComments={sampleMetaComments}
        documents={sampleDocuments}
      />
    );

    const copyButton = screen.getByRole('button', { name: /Copy to Clipboard/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(toast.default.success).toHaveBeenCalledWith('Report copied to clipboard!');
    });
  });

  it('should show error toast if clipboard copy fails', async () => {
    const toast = await import('react-hot-toast');
    
    // Mock clipboard to fail
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard error'))
      }
    });

    render(
      <ReportPreview
        selectedCommentIds={['comment-1']}
        wordComments={sampleWordComments}
        metaComments={sampleMetaComments}
        documents={sampleDocuments}
      />
    );

    const copyButton = screen.getByRole('button', { name: /Copy to Clipboard/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalledWith('Failed to copy to clipboard');
    });
  });

  it('should render close button when onClose is provided', () => {
    const handleClose = vi.fn();
    
    render(
      <ReportPreview
        selectedCommentIds={['comment-1']}
        wordComments={sampleWordComments}
        metaComments={sampleMetaComments}
        documents={sampleDocuments}
        onClose={handleClose}
      />
    );

    const closeButton = screen.getByLabelText('Close report preview');
    expect(closeButton).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    
    render(
      <ReportPreview
        selectedCommentIds={['comment-1']}
        wordComments={sampleWordComments}
        metaComments={sampleMetaComments}
        documents={sampleDocuments}
        onClose={handleClose}
      />
    );

    const closeButton = screen.getByLabelText('Close report preview');
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalled();
  });

  it('should not render close button when onClose is not provided', () => {
    render(
      <ReportPreview
        selectedCommentIds={['comment-1']}
        wordComments={sampleWordComments}
        metaComments={sampleMetaComments}
        documents={sampleDocuments}
      />
    );

    expect(screen.queryByLabelText('Close report preview')).not.toBeInTheDocument();
  });

  it('should display helper text about format', () => {
    render(
      <ReportPreview
        selectedCommentIds={['comment-1']}
        wordComments={sampleWordComments}
        metaComments={sampleMetaComments}
        documents={sampleDocuments}
      />
    );

    expect(screen.getByText(/Format is clean prose suitable for email or Word documents/)).toBeInTheDocument();
  });

  it('should update preview when title changes', () => {
    render(
      <ReportPreview
        selectedCommentIds={['comment-1']}
        wordComments={sampleWordComments}
        metaComments={sampleMetaComments}
        documents={sampleDocuments}
      />
    );

    const titleInput = screen.getByDisplayValue('Analysis Report') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'New Title' } });

    // The new title should appear in the preview
    expect(screen.getByText(/New Title/)).toBeInTheDocument();
  });

  it('should handle empty comment selection', () => {
    render(
      <ReportPreview
        selectedCommentIds={[]}
        wordComments={sampleWordComments}
        metaComments={sampleMetaComments}
        documents={sampleDocuments}
      />
    );

    // Should still render without errors
    expect(screen.getByText('📄 Report Generator')).toBeInTheDocument();
    expect(screen.getByText(/Word Comments:/)).toBeInTheDocument();
  });
});
