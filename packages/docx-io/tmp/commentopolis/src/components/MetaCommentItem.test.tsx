import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MetaCommentItem } from './MetaCommentItem';
import type { MetaComment, DocumentComment } from '../types';

describe('MetaCommentItem', () => {
  const mockMetaComment: MetaComment = {
    id: 'meta-123',
    type: 'synthesis',
    text: 'This is a test meta-comment with #hashtag',
    author: 'Test User',
    created: new Date('2024-01-01'),
    linkedComments: [],
    tags: ['hashtag'],
    includeInReport: false
  };

  it('should render meta-comment with correct content', () => {
    render(
      <MetaCommentItem
        metaComment={mockMetaComment}
        isSelected={false}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText(/This is a test meta-comment/)).toBeInTheDocument();
    expect(screen.getByText('#hashtag')).toBeInTheDocument();
  });

  it('should show synthesis type label', () => {
    render(
      <MetaCommentItem
        metaComment={mockMetaComment}
        isSelected={false}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText('✨ Synthesis')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(
      <MetaCommentItem
        metaComment={mockMetaComment}
        isSelected={false}
        onClick={handleClick}
      />
    );

    const container = screen.getByText(/This is a test meta-comment/).closest('div')?.parentElement?.parentElement;
    if (container) {
      fireEvent.click(container);
      expect(handleClick).toHaveBeenCalledWith('meta-123', expect.any(Object));
    }
  });

  it('should show "In Report" indicator when includeInReport is true', () => {
    const metaCommentInReport = { ...mockMetaComment, includeInReport: true };
    render(
      <MetaCommentItem
        metaComment={metaCommentInReport}
        isSelected={false}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText('📄 In Report')).toBeInTheDocument();
  });

  it('should call onUpdate when report toggle is clicked', () => {
    const handleUpdate = vi.fn();
    render(
      <MetaCommentItem
        metaComment={mockMetaComment}
        isSelected={false}
        onClick={vi.fn()}
        onUpdate={handleUpdate}
      />
    );

    const toggleButton = screen.getByText('Add to Report');
    fireEvent.click(toggleButton);
    
    expect(handleUpdate).toHaveBeenCalledWith('meta-123', { includeInReport: true });
  });

  it('should show linked comments count when present', () => {
    const metaCommentWithLinks = {
      ...mockMetaComment,
      linkedComments: ['comment-1', 'comment-2', 'comment-3']
    };
    
    const mockComment: DocumentComment = {
      id: 'comment-1',
      author: 'Comment Author',
      plainText: 'This is a linked comment',
      content: '<p>This is a linked comment</p>',
      date: new Date(),
      documentId: 'doc-1'
    };

    const getCommentById = vi.fn((id: string) => {
      if (id === 'comment-1') return mockComment;
      return null;
    });
    
    render(
      <MetaCommentItem
        metaComment={metaCommentWithLinks}
        isSelected={false}
        onClick={vi.fn()}
        getCommentById={getCommentById}
      />
    );

    expect(screen.getByText('🔗 Linked to 3 comments:')).toBeInTheDocument();
  });

  it('should display linked comment details', () => {
    const mockComment: DocumentComment = {
      id: 'comment-1',
      author: 'Comment Author',
      plainText: 'This is a linked comment',
      content: '<p>This is a linked comment</p>',
      date: new Date(),
      documentId: 'doc-1'
    };

    const metaCommentWithLinks = {
      ...mockMetaComment,
      linkedComments: ['comment-1']
    };

    const getCommentById = vi.fn((id: string) => {
      if (id === 'comment-1') return mockComment;
      return null;
    });
    
    render(
      <MetaCommentItem
        metaComment={metaCommentWithLinks}
        isSelected={false}
        onClick={vi.fn()}
        getCommentById={getCommentById}
      />
    );

    expect(screen.getByText('Comment Author')).toBeInTheDocument();
    expect(screen.getByText(/This is a linked comment/)).toBeInTheDocument();
  });

  it('should call onNavigateToComment when navigate button is clicked', () => {
    const mockComment: DocumentComment = {
      id: 'comment-1',
      author: 'Comment Author',
      plainText: 'This is a linked comment',
      content: '<p>This is a linked comment</p>',
      date: new Date(),
      documentId: 'doc-1'
    };

    const metaCommentWithLinks = {
      ...mockMetaComment,
      linkedComments: ['comment-1']
    };

    const getCommentById = vi.fn((id: string) => {
      if (id === 'comment-1') return mockComment;
      return null;
    });

    const handleNavigate = vi.fn();
    
    render(
      <MetaCommentItem
        metaComment={metaCommentWithLinks}
        isSelected={false}
        onClick={vi.fn()}
        getCommentById={getCommentById}
        onNavigateToComment={handleNavigate}
      />
    );

    const navigateButton = screen.getByTitle('Go to comment');
    fireEvent.click(navigateButton);
    
    expect(handleNavigate).toHaveBeenCalledWith('comment-1', expect.any(Object));
  });

  it('should call onUpdate with unlinked comments when unlink button is clicked', () => {
    const mockComment: DocumentComment = {
      id: 'comment-1',
      author: 'Comment Author',
      plainText: 'This is a linked comment',
      content: '<p>This is a linked comment</p>',
      date: new Date(),
      documentId: 'doc-1'
    };

    const metaCommentWithLinks = {
      ...mockMetaComment,
      linkedComments: ['comment-1', 'comment-2']
    };

    const getCommentById = vi.fn((id: string) => {
      if (id === 'comment-1') return mockComment;
      return null;
    });

    const handleUpdate = vi.fn();
    
    render(
      <MetaCommentItem
        metaComment={metaCommentWithLinks}
        isSelected={false}
        onClick={vi.fn()}
        getCommentById={getCommentById}
        onUpdate={handleUpdate}
      />
    );

    const unlinkButtons = screen.getAllByTitle('Unlink comment');
    fireEvent.click(unlinkButtons[0]); // Click the first unlink button
    
    expect(handleUpdate).toHaveBeenCalledWith('meta-123', { 
      linkedComments: ['comment-2'] 
    });
  });
});
