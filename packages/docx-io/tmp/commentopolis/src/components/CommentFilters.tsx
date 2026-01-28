import React, { useState, useEffect } from 'react';
import { useCommentFilterContext } from '../hooks/useCommentFilterContext';
import { useDocumentContext } from '../hooks/useDocumentContext';
import { useDebounce } from '../hooks/useDebounce';

interface CommentFiltersProps {
  className?: string;
}

/**
 * CommentFilters component for filtering comments in the left panel
 */
export const CommentFilters: React.FC<CommentFiltersProps> = ({ className = '' }) => {
  const { 
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
    getUniqueAuthors, 
    getUniqueHashtags 
  } = useCommentFilterContext();
  const { comments, metaComments } = useDocumentContext();
  
  // Local state for search input to handle debouncing
  const [searchInput, setSearchInput] = useState(filters.searchText);
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update the filter when debounced search changes
  useEffect(() => {
    setSearchTextFilter(debouncedSearch);
  }, [debouncedSearch, setSearchTextFilter]);

  // Get unique authors for dropdown
  const uniqueAuthors = getUniqueAuthors(comments, metaComments);

  // Get unique hashtags for dropdown
  const uniqueHashtags = getUniqueHashtags(comments, metaComments);

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  // Parse date from input
  const parseDateFromInput = (dateString: string): Date | null => {
    if (!dateString) return null;
    return new Date(dateString);
  };

  const handleReset = () => {
    setSearchInput('');
    resetFilters();
  };

  // Handler for hashtag checkbox changes
  const handleHashtagToggle = (hashtag: string) => {
    const currentHashtags = filters.hashtags;
    if (currentHashtags.includes(hashtag)) {
      // Remove hashtag from filter
      setHashtagsFilter(currentHashtags.filter(h => h !== hashtag));
    } else {
      // Add hashtag to filter
      setHashtagsFilter([...currentHashtags, hashtag]);
    }
  };

  // Check if any filters are active
  const hasActiveFilters = filters.author || filters.dateRange.start || filters.dateRange.end || filters.searchText || filters.hashtags.length > 0 || filters.commentType !== 'all' || filters.hasLinks || filters.inReport || filters.metaCommentType !== 'all';

  if (comments.length === 0 && metaComments.length === 0) {
    return null; // Don't show filters if there are no comments
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Comment Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Author Filter */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Author
        </label>
        <select
          value={filters.author}
          onChange={(e) => setAuthorFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All authors</option>
          {uniqueAuthors.map(author => (
            <option key={author} value={author}>
              {author}
            </option>
          ))}
        </select>
      </div>

      {/* Comment Type Filter */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Comment Type
        </label>
        <select
          value={filters.commentType}
          onChange={(e) => setCommentTypeFilter(e.target.value as 'all' | 'word' | 'meta')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Both (Word + Meta)</option>
          <option value="word">Word Comments Only</option>
          <option value="meta">Meta-Comments Only</option>
        </select>
      </div>

      {/* Meta-Comment Type Filter - only show when meta-comments are included */}
      {filters.commentType !== 'word' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Meta-Comment Type
          </label>
          <select
            value={filters.metaCommentType}
            onChange={(e) => setMetaCommentTypeFilter(e.target.value as typeof filters.metaCommentType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All types</option>
            <option value="synthesis">💡 Synthesis</option>
            <option value="link">🔗 Link</option>
            <option value="question">❓ Question</option>
            <option value="observation">👁️ Observation</option>
          </select>
        </div>
      )}

      {/* Linked Comments Filter */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.hasLinks}
            onChange={(e) => setHasLinksFilter(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Show only comments with links
          </span>
        </label>
        <p className="text-xs text-gray-500 ml-6">
          Word comments linked by meta-comments, or meta-comments with linked comments
        </p>
      </div>

      {/* In Report Filter - only show when meta-comments are included */}
      {filters.commentType !== 'word' && (
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.inReport}
              onChange={(e) => setInReportFilter(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Show only comments in report
            </span>
          </label>
          <p className="text-xs text-gray-500 ml-6">
            Meta-comments marked for inclusion in current report
          </p>
        </div>
      )}

      {/* Date Range Filter */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Date Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="date"
              value={formatDateForInput(filters.dateRange.start)}
              onChange={(e) => setDateRangeFilter(
                parseDateFromInput(e.target.value),
                filters.dateRange.end
              )}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Start date"
            />
          </div>
          <div>
            <input
              type="date"
              value={formatDateForInput(filters.dateRange.end)}
              onChange={(e) => setDateRangeFilter(
                filters.dateRange.start,
                parseDateFromInput(e.target.value)
              )}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="End date"
            />
          </div>
        </div>
      </div>

      {/* Full-text Search */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Search Comments
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search comments, meta-comments, authors..."
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Hashtag Filter */}
      {uniqueHashtags.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Hashtags
          </label>
          <div className="space-y-1 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2">
            {uniqueHashtags.map(hashtag => (
              <label 
                key={hashtag} 
                className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.hashtags.includes(hashtag)}
                  onChange={() => handleHashtagToggle(hashtag)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">#{hashtag}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Filter Status */}
      {hasActiveFilters && (
        <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
          Active filters: {[
            filters.author && `Author: ${filters.author}`,
            (filters.dateRange.start || filters.dateRange.end) && 'Date range',
            filters.searchText && `Search: "${filters.searchText}"`,
            filters.hashtags.length > 0 && `Hashtags: ${filters.hashtags.map(h => `#${h}`).join(', ')}`,
            filters.commentType !== 'all' && `Type: ${filters.commentType === 'word' ? 'Word only' : 'Meta only'}`,
            filters.hasLinks && 'With links',
            filters.inReport && 'In report',
            filters.metaCommentType !== 'all' && `Meta type: ${filters.metaCommentType}`
          ].filter(Boolean).join(', ')}
        </div>
      )}
    </div>
  );
};