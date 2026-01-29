import React, { useState, useMemo } from 'react';
import type { DocumentComment, MetaComment } from '../types';
import { useDocumentContext } from '../hooks/useDocumentContext';
import { useCommentFilterContext } from '../hooks/useCommentFilterContext';
import { MetaCommentItem } from './MetaCommentItem';

export type SortOption = 'document-order' | 'date-desc' | 'date-asc' | 'author-asc' | 'author-desc';

// Combined type for word comments and meta-comments
type CombinedComment = (DocumentComment | MetaComment) & { commentType: 'word' | 'meta' };

interface CommentListProps {
  className?: string;
}

/**
 * CommentList component for displaying extracted comments from documents
 */
export const CommentList: React.FC<CommentListProps> = ({ className = '' }) => {
  const { documents, activeDocumentId, selectedDocumentIds, comments, metaComments, selectedCommentIds, toggleCommentSelection, updateMetaComment, removeMetaComment } = useDocumentContext();
  const { getFilteredComments } = useCommentFilterContext();
  const [sortBy, setSortBy] = useState<SortOption>('document-order');

  // Filter comments based on selected document(s)
  const selectedComments = useMemo(() => {
    // If there are selected documents, show comments from those
    if (selectedDocumentIds.length > 0) {
      return comments.filter(comment => selectedDocumentIds.includes(comment.documentId));
    }
    
    // Fall back to activeDocumentId for backward compatibility
    if (activeDocumentId) {
      return comments.filter(comment => comment.documentId === activeDocumentId);
    }
    
    // If no documents are selected, show no comments
    return [];
  }, [comments, selectedDocumentIds, activeDocumentId]);

  // Apply comment filters to the selected comments and meta-comments
  const { wordComments: filteredComments, metaComments: filteredMetaComments } = useMemo(() => {
    return getFilteredComments(selectedComments, metaComments);
  }, [selectedComments, metaComments, getFilteredComments]);

  // Combine word comments and meta-comments
  const combinedComments = useMemo(() => {
    const wordCommentsWithType: CombinedComment[] = filteredComments.map(c => ({ ...c, commentType: 'word' as const }));
    const metaCommentsWithType: CombinedComment[] = filteredMetaComments.map(mc => ({ ...mc, commentType: 'meta' as const }));
    return [...wordCommentsWithType, ...metaCommentsWithType];
  }, [filteredComments, filteredMetaComments]);

  // Sort comments based on selected option
  const sortedComments = useMemo(() => {
    const sorted = [...combinedComments];
    
    switch (sortBy) {
      case 'document-order':
        // Sort by comment ID which represents document order
        // Meta-comments go at the end
        return sorted.sort((a, b) => {
          // Meta-comments after word comments
          if (a.commentType === 'meta' && b.commentType !== 'meta') return 1;
          if (a.commentType !== 'meta' && b.commentType === 'meta') return -1;
          
          if (a.commentType === 'word' && b.commentType === 'word') {
            // Extract the numeric part of the comment ID (after the last hyphen)
            const getIdNumber = (id: string) => {
              const parts = id.split('-');
              const lastPart = parts[parts.length - 1];
              const num = parseInt(lastPart, 10);
              return isNaN(num) ? 0 : num;
            };
            
            const numA = getIdNumber(a.id);
            const numB = getIdNumber(b.id);
            
            // If both have valid numbers, sort by them
            if (numA !== numB) {
              return numA - numB;
            }
            
            // Fall back to string comparison if numbers are equal
            return a.id.localeCompare(b.id);
          }
          
          // Both are meta-comments, sort by created date
          const dateA = a.commentType === 'meta' ? (a as MetaComment).created : (a as DocumentComment).date;
          const dateB = b.commentType === 'meta' ? (b as MetaComment).created : (b as DocumentComment).date;
          return new Date(dateA).getTime() - new Date(dateB).getTime();
        });
      case 'date-desc':
        return sorted.sort((a, b) => {
          const dateA = a.commentType === 'meta' ? (a as MetaComment).created : (a as DocumentComment).date;
          const dateB = b.commentType === 'meta' ? (b as MetaComment).created : (b as DocumentComment).date;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
      case 'date-asc':
        return sorted.sort((a, b) => {
          const dateA = a.commentType === 'meta' ? (a as MetaComment).created : (a as DocumentComment).date;
          const dateB = b.commentType === 'meta' ? (b as MetaComment).created : (b as DocumentComment).date;
          return new Date(dateA).getTime() - new Date(dateB).getTime();
        });
      case 'author-asc':
        return sorted.sort((a, b) => a.author.localeCompare(b.author));
      case 'author-desc':
        return sorted.sort((a, b) => b.author.localeCompare(a.author));
      default:
        return sorted;
    }
  }, [combinedComments, sortBy]);

  // Get document name for grouping display
  const getDocumentName = (documentId: string): string => {
    const doc = documents.find(d => d.id === documentId);
    return doc?.name || 'Unknown Document';
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  // Handle comment selection with multi-select support
  const handleCommentClick = (commentId: string, event: React.MouseEvent) => {
    const isMultiSelect = event.ctrlKey || event.metaKey; // Ctrl on Windows/Linux, Cmd on Mac
    toggleCommentSelection(commentId, isMultiSelect);
  };

  // Get comment by ID or paraId
  const getCommentById = (idOrParaId: string): CombinedComment | null => {
    // First try to find by regular ID
    let comment = sortedComments.find(c => c.id === idOrParaId);
    if (comment) return comment;
    
    // Try to find by paraId (only for word comments)
    comment = sortedComments.find(c => c.commentType === 'word' && (c as DocumentComment).paraId === idOrParaId);
    return comment || null;
  };

  // Navigate to a specific comment
  const navigateToComment = (commentId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering parent click
    const isMultiSelect = event.ctrlKey || event.metaKey;
    toggleCommentSelection(commentId, isMultiSelect);
    
    // Scroll to the comment
    setTimeout(() => {
      const element = document.getElementById(`comment-${commentId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Check if a comment is linked by any meta-comment (use all meta-comments, not filtered)
  const isCommentLinked = (commentId: string): boolean => {
    return metaComments.some(mc => mc.linkedComments.includes(commentId));
  };

  // Group comments by document if showing multiple documents (only for word comments)
  const groupedComments = useMemo(() => {
    // Separate word comments and meta-comments
    const wordComments = sortedComments.filter(c => c.commentType === 'word') as (DocumentComment & { commentType: 'word' })[];
    const metaCommentsOnly = sortedComments.filter(c => c.commentType === 'meta') as (MetaComment & { commentType: 'meta' })[];
    
    // If we have selected documents or activeDocumentId, group appropriately
    const isShowingMultiple = selectedDocumentIds.length > 1;
    
    if (!isShowingMultiple && (selectedDocumentIds.length === 1 || activeDocumentId)) {
      // Single document view
      const singleDocId = selectedDocumentIds.length === 1 ? selectedDocumentIds[0] : activeDocumentId!;
      return { 
        wordComments: { [singleDocId]: wordComments },
        metaComments: metaCommentsOnly
      };
    }
    
    // Multiple documents view
    const groups: Record<string, (DocumentComment & { commentType: 'word' })[]> = {};
    wordComments.forEach(comment => {
      const docComment = comment as DocumentComment & { commentType: 'word' };
      if (!groups[docComment.documentId]) {
        groups[docComment.documentId] = [];
      }
      groups[docComment.documentId].push(docComment);
    });
    return { 
      wordComments: groups, 
      metaComments: metaCommentsOnly 
    };
  }, [sortedComments, selectedDocumentIds, activeDocumentId]);

  if (sortedComments.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="text-gray-400 text-6xl mb-4">💬</div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">No comments found</h3>
        <p className="text-sm text-gray-500 text-center">
          {documents.length === 0 
            ? 'Upload a .docx document to see extracted comments'
            : selectedDocumentIds.length === 0 && !activeDocumentId
              ? 'Select one or more documents to view their comments'
              : 'No comments were found in the selected document(s)'
          }
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with sort controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Comments {(() => {
            if (selectedDocumentIds.length === 1) {
              return `(${getDocumentName(selectedDocumentIds[0])})`;
            } else if (selectedDocumentIds.length > 1) {
              return `(${selectedDocumentIds.length} documents, ${sortedComments.length} total)`;
            } else if (activeDocumentId) {
              return `(${getDocumentName(activeDocumentId)})`;
            } else {
              return `(${sortedComments.length})`;
            }
          })()}
        </h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="document-order">Document order</option>
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="author-asc">Author A-Z</option>
          <option value="author-desc">Author Z-A</option>
        </select>
      </div>

      {/* Comments list */}
      <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-auto">
        {/* Word Comments grouped by document */}
        {Object.entries(groupedComments.wordComments).map(([documentId, docComments]) => (
          <div key={documentId}>
            {/* Document header (only show if multiple documents are selected) */}
            {selectedDocumentIds.length > 1 && (
              <div className="sticky top-0 bg-gray-50 px-3 py-2 border-b border-gray-200 mb-3">
                <h3 className="font-medium text-gray-700">
                  📄 {getDocumentName(documentId)} ({docComments.length})
                </h3>
              </div>
            )}
            
            {/* Comments for this document */}
            {docComments.map((comment) => {
              const wordComment = comment as DocumentComment;
              const parentComment = wordComment.parentId ? getCommentById(wordComment.parentId) : null;
              const isReply = !!wordComment.parentId;
              
              return (
                <div
                  key={wordComment.id}
                  id={`comment-${wordComment.id}`}
                  onClick={(e) => handleCommentClick(wordComment.id, e)}
                  className={`bg-white rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isReply ? 'ml-8 border-l-4 border-l-purple-300' : ''
                  } ${
                    selectedCommentIds.includes(wordComment.id)
                      ? 'border-blue-500 ring-2 ring-blue-200 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="p-4">
                    {/* Comment header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {wordComment.initial || wordComment.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-800">{wordComment.author}</span>
                            {wordComment.done && (
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                                ✓ Done
                              </span>
                            )}
                            {wordComment.parentId && (
                              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                                ↳ Reply
                              </span>
                            )}
                            {wordComment.children && wordComment.children.length > 0 && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                {wordComment.children.length} {wordComment.children.length === 1 ? 'reply' : 'replies'}
                              </span>
                            )}
                            {isCommentLinked(wordComment.id) && (
                              <span className="px-1.5 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded" title="Linked by meta-comment">
                                🔗 Linked
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{formatDate(wordComment.date)}</div>
                        </div>
                      </div>
                      {wordComment.reference && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {wordComment.reference}
                        </span>
                      )}
                    </div>

                    {/* Thread navigation - Parent comment */}
                    {parentComment && parentComment.commentType === 'word' && (
                      <div className="mb-2 p-2 bg-purple-50 rounded border-l-2 border-purple-400">
                        <div className="text-xs text-purple-700 mb-1">
                          <span className="font-medium">Replying to:</span>
                        </div>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-purple-800">{parentComment.author}</div>
                            <div className="text-xs text-purple-600 truncate">{(parentComment as DocumentComment).plainText.slice(0, 80)}{(parentComment as DocumentComment).plainText.length > 80 ? '...' : ''}</div>
                          </div>
                          <button
                            onClick={(e) => navigateToComment(parentComment.id, e)}
                            className="ml-2 px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex-shrink-0"
                            title="Go to parent comment"
                          >
                            ↑ View
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Comment text */}
                    <div 
                      className="text-gray-700 leading-relaxed mb-2"
                      dangerouslySetInnerHTML={{ __html: wordComment.content }}
                    />

                    {/* Thread navigation - Child comments */}
                    {wordComment.children && wordComment.children.length > 0 && (
                      <div className="mt-3 p-2 bg-blue-50 rounded border-l-2 border-blue-400">
                        <div className="text-xs font-medium text-blue-700 mb-2">
                          {wordComment.children.length} {wordComment.children.length === 1 ? 'Reply' : 'Replies'}:
                        </div>
                        <div className="space-y-2">
                          {wordComment.children.map((childId) => {
                            const child = getCommentById(childId);
                            if (!child || child.commentType !== 'word') return null;
                            
                            return (
                              <div key={childId} className="flex items-start justify-between bg-white p-2 rounded">
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium text-gray-800">{child.author}</div>
                                  <div className="text-xs text-gray-600 truncate">{(child as DocumentComment).plainText.slice(0, 80)}{(child as DocumentComment).plainText.length > 80 ? '...' : ''}</div>
                                </div>
                                <button
                                  onClick={(e) => navigateToComment(child.id, e)}
                                  className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex-shrink-0"
                                  title="Go to reply"
                                >
                                  ↓ View
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Selection indicator */}
                    {selectedCommentIds.includes(wordComment.id) && (
                      <div className="mt-2 text-xs text-blue-600 font-medium">
                        ✓ Selected for review {selectedCommentIds.length > 1 && `(${selectedCommentIds.indexOf(wordComment.id) + 1} of ${selectedCommentIds.length})`}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCommentClick(wordComment.id, e);
                        }}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
                        title={selectedCommentIds.includes(wordComment.id) ? "Deselect comment" : "Select comment"}
                      >
                        {selectedCommentIds.includes(wordComment.id) ? '✓ Selected' : '+ Select'}
                      </button>
                      {isCommentLinked(wordComment.id) && (
                        <span className="px-3 py-1 text-xs bg-orange-50 text-orange-700 rounded border border-orange-200">
                          🔗 Used in synthesis
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        
        {/* Meta-Comments Section */}
        {groupedComments.metaComments.length > 0 && (
          <div>
            <div className="sticky top-0 bg-purple-100 px-3 py-2 border-b border-purple-300 mb-3">
              <h3 className="font-medium text-purple-800 flex items-center gap-2">
                <span className="text-lg">✨</span>
                Meta-Comments ({groupedComments.metaComments.length})
              </h3>
            </div>
            
            {groupedComments.metaComments.map((metaComment) => (
              <MetaCommentItem
                key={metaComment.id}
                metaComment={metaComment as MetaComment}
                isSelected={selectedCommentIds.includes(metaComment.id)}
                onClick={handleCommentClick}
                onUpdate={updateMetaComment}
                onDelete={removeMetaComment}
                getCommentById={getCommentById}
                onNavigateToComment={navigateToComment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};