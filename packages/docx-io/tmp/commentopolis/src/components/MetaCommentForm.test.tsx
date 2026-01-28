import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MetaCommentForm } from './MetaCommentForm';
import type { DocumentComment, MetaComment } from '../types';

describe('MetaCommentForm', () => {
  it('should render form with all fields', () => {
    render(
      <MetaCommentForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /Create Meta-Comment/i })).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Comment Text')).toBeInTheDocument();
    expect(screen.getByText('Author')).toBeInTheDocument();
    expect(screen.getByText('Include in Report')).toBeInTheDocument();
  });

  it('should have default values', () => {
    render(
      <MetaCommentForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const typeSelect = screen.getByRole('combobox') as HTMLSelectElement;
    const authorInput = screen.getByDisplayValue('Current User') as HTMLInputElement;
    const reportCheckbox = screen.getByRole('checkbox') as HTMLInputElement;

    expect(typeSelect.value).toBe('synthesis');
    expect(authorInput.value).toBe('Current User');
    expect(reportCheckbox.checked).toBe(false);
  });

  it('should call onCancel when cancel button is clicked', () => {
    const handleCancel = vi.fn();
    render(
      <MetaCommentForm
        onSubmit={vi.fn()}
        onCancel={handleCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(handleCancel).toHaveBeenCalled();
  });

  it('should call onSubmit with correct data when form is submitted', () => {
    const handleSubmit = vi.fn();
    render(
      <MetaCommentForm
        onSubmit={handleSubmit}
        onCancel={vi.fn()}
      />
    );

    const textArea = screen.getByPlaceholderText(/Enter your meta-comment/);
    const submitButton = screen.getByRole('button', { name: /Create Meta-Comment/i });

    fireEvent.change(textArea, { target: { value: 'Test meta-comment #test' } });
    fireEvent.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'synthesis',
        text: 'Test meta-comment #test',
        author: 'Current User',
        linkedComments: [],
        tags: [],
        includeInReport: false
      })
    );
  });

  it('should not submit when text is empty', () => {
    const handleSubmit = vi.fn();
    render(
      <MetaCommentForm
        onSubmit={handleSubmit}
        onCancel={vi.fn()}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Create Meta-Comment/i });
    fireEvent.click(submitButton);

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('should update type when changed', () => {
    render(
      <MetaCommentForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const typeSelect = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(typeSelect, { target: { value: 'question' } });

    expect(typeSelect.value).toBe('question');
  });

  it('should toggle includeInReport checkbox', () => {
    render(
      <MetaCommentForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it('should display linked comments when provided', () => {
    const mockComment: DocumentComment = {
      id: 'comment-1',
      author: 'Test Author',
      plainText: 'This is a test comment',
      content: '<p>This is a test comment</p>',
      date: new Date(),
      documentId: 'doc-1'
    };

    const getCommentById = vi.fn((id: string) => {
      if (id === 'comment-1') return mockComment;
      return null;
    });

    render(
      <MetaCommentForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        linkedComments={['comment-1']}
        getCommentById={getCommentById}
      />
    );

    expect(screen.getByText('Linked Comments (1)')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText(/This is a test comment/)).toBeInTheDocument();
  });

  it('should allow removing linked comments', () => {
    const mockComment: DocumentComment = {
      id: 'comment-1',
      author: 'Test Author',
      plainText: 'This is a test comment',
      content: '<p>This is a test comment</p>',
      date: new Date(),
      documentId: 'doc-1'
    };

    const getCommentById = vi.fn((id: string) => {
      if (id === 'comment-1') return mockComment;
      return null;
    });

    const handleSubmit = vi.fn();

    render(
      <MetaCommentForm
        onSubmit={handleSubmit}
        onCancel={vi.fn()}
        linkedComments={['comment-1']}
        getCommentById={getCommentById}
      />
    );

    // Should show linked comment
    expect(screen.getByText('Linked Comments (1)')).toBeInTheDocument();

    // Click remove button
    const removeButton = screen.getByTitle('Remove link');
    fireEvent.click(removeButton);

    // Linked comments section should be removed
    expect(screen.queryByText('Linked Comments (1)')).not.toBeInTheDocument();
  });

  it('should submit with linked comments', () => {
    const mockComment: DocumentComment = {
      id: 'comment-1',
      author: 'Test Author',
      plainText: 'This is a test comment',
      content: '<p>This is a test comment</p>',
      date: new Date(),
      documentId: 'doc-1'
    };

    const getCommentById = vi.fn((id: string) => {
      if (id === 'comment-1') return mockComment;
      return null;
    });

    const handleSubmit = vi.fn();

    render(
      <MetaCommentForm
        onSubmit={handleSubmit}
        onCancel={vi.fn()}
        linkedComments={['comment-1']}
        getCommentById={getCommentById}
      />
    );

    const textArea = screen.getByPlaceholderText(/Enter your meta-comment/);
    const submitButton = screen.getByRole('button', { name: /Create Meta-Comment/i });

    fireEvent.change(textArea, { target: { value: 'Test synthesis' } });
    fireEvent.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        linkedComments: ['comment-1']
      })
    );
  });

  it('should display meta-comment in linked comments', () => {
    const mockMetaComment: MetaComment = {
      id: 'meta-1',
      type: 'synthesis',
      text: 'This is a meta comment',
      author: 'Meta Author',
      created: new Date(),
      linkedComments: [],
      tags: [],
      includeInReport: false
    };

    const getCommentById = vi.fn((id: string) => {
      if (id === 'meta-1') return mockMetaComment;
      return null;
    });

    render(
      <MetaCommentForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        linkedComments={['meta-1']}
        getCommentById={getCommentById}
      />
    );

    expect(screen.getByText('Linked Comments (1)')).toBeInTheDocument();
    expect(screen.getByText('Meta Author')).toBeInTheDocument();
    expect(screen.getByText(/This is a meta comment/)).toBeInTheDocument();
  });
});
