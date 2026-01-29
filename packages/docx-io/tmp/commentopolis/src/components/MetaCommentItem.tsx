import React from 'react';
import type { MetaComment, DocumentComment } from '../types';

interface MetaCommentItemProps {
  metaComment: MetaComment;
  isSelected: boolean;
  onClick: (id: string, event: React.MouseEvent) => void;
  onUpdate?: (id: string, updates: Partial<MetaComment>) => void;
  onDelete?: (id: string) => void;
  getCommentById?: (id: string) => (DocumentComment | MetaComment) | null; // Function to get linked comment details
  onNavigateToComment?: (id: string, event: React.MouseEvent) => void; // Function to navigate to a linked comment
}

const typeIcons: Record<MetaComment['type'], string> = {
  synthesis: '💡',
  link: '🔗',
  question: '❓',
  observation: '👁️'
};

const typeLabels: Record<MetaComment['type'], string> = {
  synthesis: 'Synthesis',
  link: 'Link',
  question: 'Question',
  observation: 'Observation'
};

/**
 * Component for displaying a single meta-comment
 */
export const MetaCommentItem: React.FC<MetaCommentItemProps> = ({
  metaComment,
  isSelected,
  onClick,
  onUpdate,
  onDelete,
  getCommentById,
  onNavigateToComment
}) => {
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const handleToggleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdate) {
      onUpdate(metaComment.id, { includeInReport: !metaComment.includeInReport });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && confirm('Delete this meta-comment?')) {
      onDelete(metaComment.id);
    }
  };

  const handleUnlink = (e: React.MouseEvent, commentId: string) => {
    e.stopPropagation();
    if (onUpdate) {
      const updatedLinkedComments = metaComment.linkedComments.filter(id => id !== commentId);
      onUpdate(metaComment.id, { linkedComments: updatedLinkedComments });
    }
  };

  const getLinkedCommentPreview = (commentId: string): { author: string; text: string } | null => {
    if (!getCommentById) return null;
    
    const comment = getCommentById(commentId);
    if (!comment) return null;
    
    // Check if it's a MetaComment or DocumentComment
    if ('plainText' in comment) {
      // DocumentComment
      return { author: comment.author, text: comment.plainText };
    } else {
      // MetaComment
      return { author: comment.author, text: comment.text };
    }
  };

  return (
    <div
      onClick={(e) => onClick(metaComment.id, e)}
      className={`bg-purple-50 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? 'border-purple-500 ring-2 ring-purple-200 shadow-md'
          : 'border-purple-200 hover:border-purple-300'
      }`}
    >
      <div className="p-4">
        {/* Meta-comment header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-lg">
              {typeIcons[metaComment.type]}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-800">{metaComment.author}</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                  ✨ {typeLabels[metaComment.type]}
                </span>
                {metaComment.includeInReport && (
                  <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                    📄 In Report
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(metaComment.created)}
                {metaComment.modified && ` (edited ${formatDate(metaComment.modified)})`}
              </div>
            </div>
          </div>
        </div>

        {/* Meta-comment text */}
        <div className="text-gray-700 leading-relaxed mb-2 whitespace-pre-wrap">
          {metaComment.text}
        </div>

        {/* Hashtags */}
        {metaComment.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {metaComment.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Linked comments indicator */}
        {metaComment.linkedComments.length > 0 && (
          <div className="mb-2">
            <div className="text-xs font-medium text-purple-700 mb-2">
              🔗 Linked to {metaComment.linkedComments.length} comment{metaComment.linkedComments.length !== 1 ? 's' : ''}:
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {metaComment.linkedComments.map(commentId => {
                const preview = getLinkedCommentPreview(commentId);
                return (
                  <div
                    key={commentId}
                    className="flex items-start justify-between bg-white p-2 rounded border border-purple-200"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-800">{preview?.author || 'Unknown'}</div>
                      <div className="text-xs text-gray-600 truncate">
                        {preview?.text.slice(0, 80) || commentId}
                        {preview && preview.text.length > 80 ? '...' : ''}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2 flex-shrink-0">
                      {onNavigateToComment && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToComment(commentId, e);
                          }}
                          className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                          title="Go to comment"
                        >
                          →
                        </button>
                      )}
                      {onUpdate && (
                        <button
                          onClick={(e) => handleUnlink(e, commentId)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          title="Unlink comment"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-purple-200">
          <button
            onClick={handleToggleReport}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              metaComment.includeInReport
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {metaComment.includeInReport ? '✓ In Report' : 'Add to Report'}
          </button>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
