import React from 'react';
import type { DocumentComment, DocumentFootnote } from '../types';
import { extractParagraphsByIndex } from '../utils/paragraphExtractor';
import { extractAndHighlightParagraphs } from '../utils/commentHighlighting';
import { appendNotesToParagraphs } from '../utils/noteExtractor';

interface CommentDetailsProps {
  comment: DocumentComment | null;
  getDocumentName?: (documentId: string) => string;
  getCommentById?: (commentId: string) => DocumentComment | null;
  documentParagraphs?: string[]; // Array of paragraph HTML strings
  documentFootnotes?: DocumentFootnote[]; // Array of document footnotes
  documentEndnotes?: DocumentFootnote[]; // Array of document endnotes
}

/**
 * CommentDetails component for displaying detailed information about a selected comment
 */
export const CommentDetails: React.FC<CommentDetailsProps> = ({ 
  comment, 
  getDocumentName,
  getCommentById,
  documentParagraphs = [],
  documentFootnotes = [],
  documentEndnotes = []
}) => {
  // Empty state when no comment is selected
  if (!comment) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-gray-400 text-4xl mb-4">💬</div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Select a comment to view details
        </h3>
        <p className="text-sm text-gray-500">
          Click on any comment in the center panel to see its details here.
        </p>
      </div>
    );
  }

  // Format date for display
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Comment Details</h2>
        <div className="h-px bg-gray-200"></div>
      </div>

      {/* Comment Information */}
      <div className="space-y-4">
        {/* Author Info */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {comment.initial || comment.author.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-800">{comment.author}</span>
              {comment.done && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  ✓ Done
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">{formatDate(comment.date)}</div>
          </div>
        </div>

        {/* Threading Information */}
        {(comment.parentId || (comment.children && comment.children.length > 0)) && (
          <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400">
            <div className="text-sm font-medium text-purple-800 mb-2">
              Comment Thread
            </div>
            <div className="space-y-2">
              {comment.parentId && getCommentById && (
                <div className="text-sm text-purple-700">
                  <span className="font-medium">Reply to:</span>
                  {(() => {
                    const parent = getCommentById(comment.parentId);
                    return parent ? (
                      <div className="mt-1 pl-3 border-l-2 border-purple-300">
                        <div className="font-medium">{parent.author}</div>
                        <div className="text-purple-600 truncate">{parent.plainText.slice(0, 100)}{parent.plainText.length > 100 ? '...' : ''}</div>
                      </div>
                    ) : (
                      <span className="text-purple-600"> Comment not found</span>
                    );
                  })()}
                </div>
              )}
              {comment.children && comment.children.length > 0 && (
                <div className="text-sm text-purple-700">
                  <span className="font-medium">Replies ({comment.children.length}):</span>
                  <div className="mt-1 space-y-1">
                    {comment.children.map((childId) => {
                      const child = getCommentById ? getCommentById(childId) : null;
                      return (
                        <div key={childId} className="pl-3 border-l-2 border-purple-300">
                          {child ? (
                            <div>
                              <span className="font-medium">{child.author}</span>
                              <div className="text-purple-600 truncate">{child.plainText.slice(0, 80)}{child.plainText.length > 80 ? '...' : ''}</div>
                            </div>
                          ) : (
                            <div className="text-purple-500">Reply not found</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Document Info */}
        {getDocumentName && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Document:</span>
            </div>
            <div className="text-sm text-gray-800 mt-1">
              📄 {getDocumentName(comment.documentId)}
            </div>
          </div>
        )}

        {/* Referenced Paragraph(s) */}
        {comment.paragraphIds && comment.paragraphIds.length > 0 && documentParagraphs.length > 0 ? (
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-400">
            <div className="text-sm font-medium text-blue-800 mb-2">
              Referenced Paragraph{comment.paragraphIds.length > 1 ? 's' : ''}
            </div>
            <div 
              className="text-sm text-gray-900 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: (() => {
                  const paragraphsHtml = comment.ranges && comment.ranges.length > 0
                    ? extractAndHighlightParagraphs(documentParagraphs, comment.paragraphIds, comment.ranges)
                    : extractParagraphsByIndex(documentParagraphs, comment.paragraphIds);
                  
                  // Append footnotes/endnotes if any are referenced in the paragraphs
                  return appendNotesToParagraphs(
                    paragraphsHtml,
                    documentFootnotes,
                    documentEndnotes,
                    comment.documentId
                  );
                })()
              }}
            />
          </div>
        ) : comment.reference ? (
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-400">
            <div className="text-sm font-medium text-blue-800 mb-2">
              Referenced Paragraph
            </div>
            <div className="text-sm text-gray-900">
              {comment.reference}
            </div>
          </div>
        ) : null}

        {/* Metadata */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              <span className="font-medium">Comment ID:</span> {comment.id}
            </div>
            {comment.paraId && (
              <div>
                <span className="font-medium">Para ID:</span> {comment.paraId}
              </div>
            )}
            {comment.durableId && (
              <div>
                <span className="font-medium">Durable ID:</span> {comment.durableId}
              </div>
            )}
            {comment.initial && (
              <div>
                <span className="font-medium">Initials:</span> {comment.initial}
              </div>
            )}
            <div>
              <span className="font-medium">Status:</span> 
              <span className={`ml-1 ${comment.done ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                {comment.done ? 'Done' : 'Open'}
              </span>
            </div>
            {comment.parentId && (
              <div>
                <span className="font-medium">Parent Comment:</span> {comment.parentId}
              </div>
            )}
            {comment.children && comment.children.length > 0 && (
              <div>
                <span className="font-medium">Child Comments:</span> {comment.children.length}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};