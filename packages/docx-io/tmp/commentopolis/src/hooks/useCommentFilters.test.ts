import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCommentFilters } from './useCommentFilters';
import type { DocumentComment, MetaComment } from '../types';

describe('useCommentFilters', () => {
  const mockComments: DocumentComment[] = [
    {
      id: 'comment1',
      author: 'John Doe',
      date: new Date('2023-01-01T10:00:00Z'),
      plainText: 'This is a test comment about implementation #budget',
      content: '<p>This is a test comment about implementation #budget</p>',
      documentId: 'doc1',
      reference: 'Page 1',
    },
    {
      id: 'comment2',
      author: 'Jane Smith',
      date: new Date('2023-01-02T11:00:00Z'),
      plainText: 'Another comment about the project #timeline',
      content: '<p>Another comment about the project #timeline</p>',
      documentId: 'doc1',
      reference: 'Page 2',
    },
    {
      id: 'comment3',
      author: 'John Doe',
      date: new Date('2023-01-03T12:00:00Z'),
      plainText: 'Final comment on the design #budget #review',
      content: '<p>Final comment on the design #budget #review</p>',
      documentId: 'doc2',
    },
  ];

  const mockMetaComments: MetaComment[] = [];

  it('should initialize with default filters', () => {
    const { result } = renderHook(() => useCommentFilters());

    expect(result.current.filters.author).toBe('');
    expect(result.current.filters.dateRange.start).toBeNull();
    expect(result.current.filters.dateRange.end).toBeNull();
    expect(result.current.filters.searchText).toBe('');
    expect(result.current.filters.hashtags).toEqual([]);
  });

  it('should filter comments by author', () => {
    const { result } = renderHook(() => useCommentFilters());

    act(() => {
      result.current.setAuthorFilter('John Doe');
    });

    const filtered = result.current.getFilteredComments(mockComments, mockMetaComments);
    expect(filtered.wordComments).toHaveLength(2);
    expect(filtered.wordComments.every(comment => comment.author === 'John Doe')).toBe(true);
  });

  it('should filter comments by search text', () => {
    const { result } = renderHook(() => useCommentFilters());

    act(() => {
      result.current.setSearchTextFilter('implementation');
    });

    const filtered = result.current.getFilteredComments(mockComments, mockMetaComments);
    expect(filtered.wordComments).toHaveLength(1);
    expect(filtered.wordComments[0].plainText).toContain('implementation');
  });

  it('should filter comments by date range', () => {
    const { result } = renderHook(() => useCommentFilters());

    act(() => {
      result.current.setDateRangeFilter(
        new Date('2023-01-01'),
        new Date('2023-01-02T23:59:59') // Include the end of the day
      );
    });

    const filtered = result.current.getFilteredComments(mockComments, mockMetaComments);
    expect(filtered.wordComments).toHaveLength(2);
  });

  it('should apply multiple filters together', () => {
    const { result } = renderHook(() => useCommentFilters());

    act(() => {
      result.current.setAuthorFilter('John Doe');
      result.current.setSearchTextFilter('design');
    });

    const filtered = result.current.getFilteredComments(mockComments, mockMetaComments);
    expect(filtered.wordComments).toHaveLength(1);
    expect(filtered.wordComments[0].author).toBe('John Doe');
    expect(filtered.wordComments[0].plainText).toContain('design');
  });

  it('should reset all filters', () => {
    const { result } = renderHook(() => useCommentFilters());

    act(() => {
      result.current.setAuthorFilter('John Doe');
      result.current.setSearchTextFilter('test');
      result.current.setHashtagsFilter(['budget']);
      result.current.setDateRangeFilter(new Date('2023-01-01'), new Date('2023-01-02'));
    });

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filters.author).toBe('');
    expect(result.current.filters.dateRange.start).toBeNull();
    expect(result.current.filters.dateRange.end).toBeNull();
    expect(result.current.filters.searchText).toBe('');
    expect(result.current.filters.hashtags).toEqual([]);
  });

  it('should get unique authors from comments', () => {
    const { result } = renderHook(() => useCommentFilters());

    const uniqueAuthors = result.current.getUniqueAuthors(mockComments, mockMetaComments);
    expect(uniqueAuthors).toEqual(['Jane Smith', 'John Doe']);
  });

  it('should search in author names and references', () => {
    const { result } = renderHook(() => useCommentFilters());

    act(() => {
      result.current.setSearchTextFilter('Jane');
    });

    const filtered = result.current.getFilteredComments(mockComments, mockMetaComments);
    expect(filtered.wordComments).toHaveLength(1);
    expect(filtered.wordComments[0].author).toBe('Jane Smith');
  });

  it('should handle empty search text', () => {
    const { result } = renderHook(() => useCommentFilters());

    act(() => {
      result.current.setSearchTextFilter('');
    });

    const filtered = result.current.getFilteredComments(mockComments, mockMetaComments);
    expect(filtered.wordComments).toHaveLength(3);
  });

  it('should filter comments by single hashtag', () => {
    const { result } = renderHook(() => useCommentFilters());

    act(() => {
      result.current.setHashtagsFilter(['budget']);
    });

    const filtered = result.current.getFilteredComments(mockComments, mockMetaComments);
    expect(filtered.wordComments).toHaveLength(2);
    expect(filtered.wordComments.every(comment => comment.plainText.includes('#budget'))).toBe(true);
  });

  it('should filter comments by multiple hashtags', () => {
    const { result } = renderHook(() => useCommentFilters());

    act(() => {
      result.current.setHashtagsFilter(['budget', 'timeline']);
    });

    const filtered = result.current.getFilteredComments(mockComments, mockMetaComments);
    // Should include comments with #budget OR #timeline
    expect(filtered.wordComments).toHaveLength(3);
  });

  it('should filter comments by hashtag with # symbol', () => {
    const { result } = renderHook(() => useCommentFilters());

    act(() => {
      result.current.setHashtagsFilter(['#budget']);
    });

    const filtered = result.current.getFilteredComments(mockComments, mockMetaComments);
    expect(filtered.wordComments).toHaveLength(2);
  });

  it('should be case-insensitive for hashtag filter', () => {
    const { result } = renderHook(() => useCommentFilters());

    act(() => {
      result.current.setHashtagsFilter(['BUDGET']);
    });

    const filtered = result.current.getFilteredComments(mockComments, mockMetaComments);
    expect(filtered.wordComments).toHaveLength(2);
  });

  it('should return all comments when hashtags filter is empty array', () => {
    const { result } = renderHook(() => useCommentFilters());

    act(() => {
      result.current.setHashtagsFilter([]);
    });

    const filtered = result.current.getFilteredComments(mockComments, mockMetaComments);
    expect(filtered.wordComments).toHaveLength(3);
  });

  it('should get unique hashtags from comments', () => {
    const { result } = renderHook(() => useCommentFilters());

    const uniqueHashtags = result.current.getUniqueHashtags(mockComments, mockMetaComments);
    expect(uniqueHashtags).toEqual(['budget', 'review', 'timeline']);
  });

  it('should combine hashtag filter with other filters', () => {
    const { result } = renderHook(() => useCommentFilters());

    act(() => {
      result.current.setAuthorFilter('John Doe');
      result.current.setHashtagsFilter(['budget']);
    });

    const filtered = result.current.getFilteredComments(mockComments, mockMetaComments);
    expect(filtered.wordComments).toHaveLength(2);
    expect(filtered.wordComments.every(comment => 
      comment.author === 'John Doe' && comment.plainText.includes('#budget')
    )).toBe(true);
  });

  // New filter tests
  describe('New filtering features', () => {
    const mockMetaCommentsWithData: MetaComment[] = [
      {
        id: 'meta1',
        type: 'synthesis',
        text: 'This synthesizes comments about budget #budget',
        author: 'John Doe',
        created: new Date('2023-01-04T10:00:00Z'),
        linkedComments: ['comment1', 'comment3'],
        tags: ['budget'],
        includeInReport: true,
      },
      {
        id: 'meta2',
        type: 'question',
        text: 'What about the timeline? #timeline',
        author: 'Jane Smith',
        created: new Date('2023-01-05T11:00:00Z'),
        linkedComments: ['comment2'],
        tags: ['timeline'],
        includeInReport: false,
      },
      {
        id: 'meta3',
        type: 'observation',
        text: 'Interesting pattern here',
        author: 'John Doe',
        created: new Date('2023-01-06T12:00:00Z'),
        linkedComments: [],
        tags: [],
        includeInReport: true,
      },
    ];

    it('should filter by comment type - word only', () => {
      const { result } = renderHook(() => useCommentFilters());

      act(() => {
        result.current.setCommentTypeFilter('word');
      });

      const filtered = result.current.getFilteredComments(mockComments, mockMetaCommentsWithData);
      expect(filtered.wordComments).toHaveLength(3);
      expect(filtered.metaComments).toHaveLength(0);
    });

    it('should filter by comment type - meta only', () => {
      const { result } = renderHook(() => useCommentFilters());

      act(() => {
        result.current.setCommentTypeFilter('meta');
      });

      const filtered = result.current.getFilteredComments(mockComments, mockMetaCommentsWithData);
      expect(filtered.wordComments).toHaveLength(0);
      expect(filtered.metaComments).toHaveLength(3);
    });

    it('should filter by comment type - all (default)', () => {
      const { result } = renderHook(() => useCommentFilters());

      const filtered = result.current.getFilteredComments(mockComments, mockMetaCommentsWithData);
      expect(filtered.wordComments).toHaveLength(3);
      expect(filtered.metaComments).toHaveLength(3);
    });

    it('should filter by hasLinks - show only word comments linked by meta-comments', () => {
      const { result } = renderHook(() => useCommentFilters());

      act(() => {
        result.current.setHasLinksFilter(true);
      });

      const filtered = result.current.getFilteredComments(mockComments, mockMetaCommentsWithData);
      expect(filtered.wordComments).toHaveLength(3); // comment1, comment2, comment3 are all linked
      expect(filtered.metaComments).toHaveLength(2); // meta1 and meta2 have linked comments, meta3 doesn't
    });

    it('should filter by inReport - show only meta-comments in report', () => {
      const { result } = renderHook(() => useCommentFilters());

      act(() => {
        result.current.setInReportFilter(true);
      });

      const filtered = result.current.getFilteredComments(mockComments, mockMetaCommentsWithData);
      expect(filtered.wordComments).toHaveLength(3); // Word comments not affected
      expect(filtered.metaComments).toHaveLength(2); // Only meta1 and meta3 are in report
    });

    it('should filter by meta-comment type', () => {
      const { result } = renderHook(() => useCommentFilters());

      act(() => {
        result.current.setMetaCommentTypeFilter('synthesis');
      });

      const filtered = result.current.getFilteredComments(mockComments, mockMetaCommentsWithData);
      expect(filtered.metaComments).toHaveLength(1);
      expect(filtered.metaComments[0].type).toBe('synthesis');
    });

    it('should search in meta-comment text', () => {
      const { result } = renderHook(() => useCommentFilters());

      act(() => {
        result.current.setSearchTextFilter('synthesizes');
      });

      const filtered = result.current.getFilteredComments(mockComments, mockMetaCommentsWithData);
      expect(filtered.wordComments).toHaveLength(0);
      expect(filtered.metaComments).toHaveLength(1);
      expect(filtered.metaComments[0].text).toContain('synthesizes');
    });

    it('should search in meta-comment tags', () => {
      const { result } = renderHook(() => useCommentFilters());

      act(() => {
        result.current.setSearchTextFilter('timeline');
      });

      const filtered = result.current.getFilteredComments(mockComments, mockMetaCommentsWithData);
      // Should find comment2 (has #timeline) and meta2 (has #timeline tag)
      expect(filtered.wordComments).toHaveLength(1);
      expect(filtered.metaComments).toHaveLength(1);
    });

    it('should get unique authors from both word comments and meta-comments', () => {
      const { result } = renderHook(() => useCommentFilters());

      const uniqueAuthors = result.current.getUniqueAuthors(mockComments, mockMetaCommentsWithData);
      expect(uniqueAuthors).toEqual(['Jane Smith', 'John Doe']); // Should be sorted
    });

    it('should get unique hashtags from both word comments and meta-comments', () => {
      const { result } = renderHook(() => useCommentFilters());

      const uniqueHashtags = result.current.getUniqueHashtags(mockComments, mockMetaCommentsWithData);
      expect(uniqueHashtags).toEqual(['budget', 'review', 'timeline']); // Should be sorted
    });

    it('should combine new filters with existing filters', () => {
      const { result } = renderHook(() => useCommentFilters());

      act(() => {
        result.current.setAuthorFilter('John Doe');
        result.current.setCommentTypeFilter('meta');
        result.current.setMetaCommentTypeFilter('synthesis');
      });

      const filtered = result.current.getFilteredComments(mockComments, mockMetaCommentsWithData);
      expect(filtered.wordComments).toHaveLength(0); // Filtered to meta only
      expect(filtered.metaComments).toHaveLength(1); // Only John Doe's synthesis
      expect(filtered.metaComments[0].id).toBe('meta1');
    });
  });
});