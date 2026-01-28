import { useState, useCallback } from 'react';
import type { CommentFilters, CommentFilterState, DocumentComment, MetaComment } from '../types';
import { hasAnyHashtag, getUniqueHashtags as getHashtagsFromTexts } from '../utils/hashtagUtils';

const DEFAULT_FILTERS: CommentFilters = {
  author: '',
  dateRange: {
    start: null,
    end: null,
  },
  searchText: '',
  hashtags: [],
  commentType: 'all',
  hasLinks: false,
  inReport: false,
  metaCommentType: 'all',
};

/**
 * Custom hook for managing comment filters
 */
export const useCommentFilters = (): CommentFilterState => {
  const [filters, setFilters] = useState<CommentFilters>(DEFAULT_FILTERS);

  const setAuthorFilter = useCallback((author: string) => {
    setFilters(prev => ({ ...prev, author }));
  }, []);

  const setDateRangeFilter = useCallback((start: Date | null, end: Date | null) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { start, end },
    }));
  }, []);

  const setSearchTextFilter = useCallback((searchText: string) => {
    setFilters(prev => ({ ...prev, searchText }));
  }, []);

  const setHashtagsFilter = useCallback((hashtags: string[]) => {
    setFilters(prev => ({ ...prev, hashtags }));
  }, []);

  const setCommentTypeFilter = useCallback((commentType: CommentFilters['commentType']) => {
    setFilters(prev => ({ ...prev, commentType }));
  }, []);

  const setHasLinksFilter = useCallback((hasLinks: boolean) => {
    setFilters(prev => ({ ...prev, hasLinks }));
  }, []);

  const setInReportFilter = useCallback((inReport: boolean) => {
    setFilters(prev => ({ ...prev, inReport }));
  }, []);

  const setMetaCommentTypeFilter = useCallback((metaCommentType: CommentFilters['metaCommentType']) => {
    setFilters(prev => ({ ...prev, metaCommentType }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const getFilteredComments = useCallback((comments: DocumentComment[], metaComments: MetaComment[]): { 
    wordComments: DocumentComment[]; 
    metaComments: MetaComment[] 
  } => {
    // Build a set of comment IDs that are linked by meta-comments
    const linkedCommentIds = new Set<string>();
    metaComments.forEach(mc => {
      mc.linkedComments.forEach(id => linkedCommentIds.add(id));
    });

    // Filter word comments
    const filteredWordComments = comments.filter(comment => {
      // Author filter
      if (filters.author && comment.author !== filters.author) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const commentDate = new Date(comment.date);
        if (filters.dateRange.start && commentDate < filters.dateRange.start) {
          return false;
        }
        if (filters.dateRange.end && commentDate > filters.dateRange.end) {
          return false;
        }
      }

      // Full-text search filter
      if (filters.searchText) {
        const searchTerm = filters.searchText.toLowerCase();
        const matchesText = comment.plainText.toLowerCase().includes(searchTerm);
        const matchesAuthor = comment.author.toLowerCase().includes(searchTerm);
        const matchesReference = comment.reference?.toLowerCase().includes(searchTerm) || false;
        
        if (!matchesText && !matchesAuthor && !matchesReference) {
          return false;
        }
      }

      // Hashtag filter
      if (filters.hashtags.length > 0) {
        if (!hasAnyHashtag(comment.plainText, filters.hashtags)) {
          return false;
        }
      }

      // Has links filter - show only comments that are linked by meta-comments
      if (filters.hasLinks && !linkedCommentIds.has(comment.id)) {
        return false;
      }

      return true;
    });

    // Filter meta-comments
    const filteredMetaComments = metaComments.filter(metaComment => {
      // Author filter
      if (filters.author && metaComment.author !== filters.author) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const commentDate = new Date(metaComment.created);
        if (filters.dateRange.start && commentDate < filters.dateRange.start) {
          return false;
        }
        if (filters.dateRange.end && commentDate > filters.dateRange.end) {
          return false;
        }
      }

      // Full-text search filter - search in meta-comment text
      if (filters.searchText) {
        const searchTerm = filters.searchText.toLowerCase();
        const matchesText = metaComment.text.toLowerCase().includes(searchTerm);
        const matchesAuthor = metaComment.author.toLowerCase().includes(searchTerm);
        const matchesTags = metaComment.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
        if (!matchesText && !matchesAuthor && !matchesTags) {
          return false;
        }
      }

      // Hashtag filter
      if (filters.hashtags.length > 0) {
        if (!hasAnyHashtag(metaComment.text, filters.hashtags)) {
          return false;
        }
      }

      // Has links filter - show only meta-comments that have linked comments
      if (filters.hasLinks && metaComment.linkedComments.length === 0) {
        return false;
      }

      // In report filter - show only meta-comments included in report
      if (filters.inReport && !metaComment.includeInReport) {
        return false;
      }

      // Meta-comment type filter
      if (filters.metaCommentType !== 'all' && metaComment.type !== filters.metaCommentType) {
        return false;
      }

      return true;
    });

    // Apply comment type filter
    switch (filters.commentType) {
      case 'word':
        return { wordComments: filteredWordComments, metaComments: [] };
      case 'meta':
        return { wordComments: [], metaComments: filteredMetaComments };
      case 'all':
      default:
        return { wordComments: filteredWordComments, metaComments: filteredMetaComments };
    }
  }, [filters]);

  const getUniqueAuthors = useCallback((comments: DocumentComment[], metaComments: MetaComment[]): string[] => {
    const authors = new Set<string>();
    comments.forEach(comment => authors.add(comment.author));
    metaComments.forEach(metaComment => authors.add(metaComment.author));
    return Array.from(authors).sort();
  }, []);

  const getUniqueHashtags = useCallback((comments: DocumentComment[], metaComments: MetaComment[]): string[] => {
    const texts = [
      ...comments.map(comment => comment.plainText),
      ...metaComments.map(metaComment => metaComment.text)
    ];
    return getHashtagsFromTexts(texts);
  }, []);

  return {
    filters,
    setAuthorFilter,
    setDateRangeFilter,
    setSearchTextFilter,
    setHashtagsFilter,
    setCommentTypeFilter,
    setHasLinksFilter,
    setInReportFilter,
    setMetaCommentTypeFilter,
    resetFilters,
    getFilteredComments,
    getUniqueAuthors,
    getUniqueHashtags,
  };
};