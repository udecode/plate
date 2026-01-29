import React from 'react';
import type { DocumentComment, UploadedDocument } from '../types';
import { extractParagraphsByIndex } from '../utils/paragraphExtractor';
import { extractAndHighlightParagraphs } from '../utils/commentHighlighting';
import { appendNotesToParagraphs } from '../utils/noteExtractor';

interface MultipleCommentDetailsProps {
  comments: DocumentComment[];
  documents: UploadedDocument[];
  getDocumentName: (documentId: string) => string;
}

/**
 * MultipleCommentDetails component for displaying multiple selected comments
 * with their referenced paragraphs grouped together
 */
export const MultipleCommentDetails: React.FC<MultipleCommentDetailsProps> = ({ 
  comments, 
  documents,
  getDocumentName 
}) => {
  // Empty state when no comments are selected
  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-gray-400 text-4xl mb-4">💬</div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Select comments to view details
        </h3>
        <p className="text-sm text-gray-500">
          Click on comments in the center panel to see their details here.
          <br />
          Hold Ctrl (or Cmd on Mac) to select multiple comments.
        </p>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {comments.length === 1 ? 'Comment Details' : `${comments.length} Selected Comments`}
        </h2>
        <div className="h-px bg-gray-200"></div>
      </div>

      {/* Comments with their paragraphs */}
      <div className="space-y-6">
        {comments.map((comment, index) => {
          const document = documents.find(d => d.id === comment.documentId);
          const documentParagraphs = document?.transformedContent?.paragraphs || [];

          return (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
              {/* Comment header with number indicator */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="font-semibold text-gray-800">{comment.author}</span>
                      {comment.done && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          ✓ Done
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{formatDate(comment.date)}</div>
                  </div>
                </div>
              </div>

              {/* Comment content */}
              <div className="bg-white rounded-lg p-3">
                <div 
                  className="text-sm text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: comment.content }}
                />
              </div>

              {/* Document info */}
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <span className="font-medium">Document:</span>
                <span>📄 {getDocumentName(comment.documentId)}</span>
              </div>

              {/* Referenced Paragraph(s) */}
              {comment.paragraphIds && comment.paragraphIds.length > 0 && documentParagraphs.length > 0 ? (
                <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                  <div className="text-xs font-medium text-blue-800 mb-2">
                    Referenced Paragraph{comment.paragraphIds.length > 1 ? 's' : ''} from {getDocumentName(comment.documentId)}
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
                          document?.footnotes || [],
                          document?.endnotes || [],
                          comment.documentId
                        );
                      })()
                    }}
                  />
                </div>
              ) : comment.reference ? (
                <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                  <div className="text-xs font-medium text-blue-800 mb-2">
                    Referenced Paragraph from {getDocumentName(comment.documentId)}
                  </div>
                  <div className="text-sm text-gray-900">
                    {comment.reference}
                  </div>
                </div>
              ) : null}

              {/* Threading info */}
              {(comment.parentId || (comment.children && comment.children.length > 0)) && (
                <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                  {comment.parentId && '↳ Reply'}
                  {comment.parentId && comment.children && comment.children.length > 0 && ' • '}
                  {comment.children && comment.children.length > 0 && `${comment.children.length} ${comment.children.length === 1 ? 'reply' : 'replies'}`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary footer */}
      {comments.length > 1 && (
        <div className="bg-gray-100 p-3 rounded-lg">
          <div className="text-sm text-gray-700 space-y-1">
            <div><span className="font-medium">Total comments:</span> {comments.length}</div>
            <div><span className="font-medium">Documents:</span> {new Set(comments.map(c => c.documentId)).size}</div>
            <div><span className="font-medium">Authors:</span> {new Set(comments.map(c => c.author)).size === 1 ? comments[0].author : `${new Set(comments.map(c => c.author)).size} different authors`}</div>
          </div>
        </div>
      )}
    </div>
  );
};
