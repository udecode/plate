import React, { useState } from 'react';
import { Panel } from './Panel';
import { CommentList } from './CommentList';
import { DocumentViewer } from './DocumentViewer';
import { MetaCommentForm } from './MetaCommentForm';
import { useDocumentContext } from '../hooks/useDocumentContext';

/**
 * Center Panel component - main content area
 */
export const CenterPanel: React.FC = () => {
  const { documents, activeDocumentId, comments, metaComments, selectedCommentIds, addMetaComment, clearSelectedComments } = useDocumentContext();
  const [showMetaCommentForm, setShowMetaCommentForm] = useState(false);

  // Show CommentList if there are documents uploaded, otherwise show welcome
  const showComments = documents.length > 0;
  
  // Find the active document if one is set
  const activeDocument = activeDocumentId 
    ? documents.find(doc => doc.id === activeDocumentId)
    : null;
  
  // Show document content if there's an active document with transformed content
  const showDocumentContent = activeDocument && activeDocument.transformedContent;

  // Helper to get comment by ID (combines word comments and meta-comments)
  const getCommentById = (id: string) => {
    const wordComment = comments.find(c => c.id === id);
    if (wordComment) return wordComment;
    
    const metaComment = metaComments.find(mc => mc.id === id);
    return metaComment || null;
  };

  const handleCreateSynthesis = () => {
    setShowMetaCommentForm(true);
  };

  const handleMetaCommentSubmit = (metaComment: Omit<import('../types').MetaComment, 'id' | 'created'>) => {
    addMetaComment(metaComment);
    setShowMetaCommentForm(false);
    clearSelectedComments();
  };

  return (
    <Panel state="normal" position="center">
      <div className="p-8 h-full flex flex-col">
        {/* Main content area */}
        <div className="flex-1 bg-gray-50 rounded-lg p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {showDocumentContent && activeDocument ? (
              <DocumentViewer document={activeDocument} />
            ) : showComments ? (
              <>
                {/* Action buttons */}
                <div className="mb-4 flex gap-2">
                  {/* Create synthesis from selected comments */}
                  {selectedCommentIds.length > 0 && !showMetaCommentForm && (
                    <button
                      onClick={handleCreateSynthesis}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                    >
                      <span className="text-lg">💡</span>
                      Create Synthesis from {selectedCommentIds.length} Selected
                    </button>
                  )}
                  
                  {/* Add Meta-Comment Button */}
                  {!showMetaCommentForm && selectedCommentIds.length === 0 && (
                    <button
                      onClick={() => setShowMetaCommentForm(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
                    >
                      <span className="text-lg">✨</span>
                      Create Meta-Comment
                    </button>
                  )}
                </div>
                
                {/* Meta-Comment Form */}
                {showMetaCommentForm && (
                  <MetaCommentForm
                    onSubmit={handleMetaCommentSubmit}
                    onCancel={() => setShowMetaCommentForm(false)}
                    linkedComments={selectedCommentIds}
                    getCommentById={getCommentById}
                  />
                )}
                
                {/* Comment List */}
                <CommentList />
              </>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload a document to get started</h3>
                  <p className="text-gray-600">
                    Use the Documents panel on the left to import .docx files. Comments and document content will appear here once parsing completes.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
};