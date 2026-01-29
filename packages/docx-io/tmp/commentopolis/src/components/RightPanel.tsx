import React, { useState } from 'react';
import type { PanelState } from '../types';
import { Panel } from './Panel';
import { CommentDetails } from './CommentDetails';
import { MultipleCommentDetails } from './MultipleCommentDetails';
import { ReportPreview } from './ReportPreview';
import { useDocumentContext } from '../hooks/useDocumentContext';

interface RightPanelProps {
  state: PanelState;
  onToggle: () => void;
}

/**
 * Right Panel component with state-specific content
 */
export const RightPanel: React.FC<RightPanelProps> = ({ state, onToggle }) => {
  const { documents, comments, metaComments, selectedCommentId, selectedCommentIds } = useDocumentContext();
  const [showReportPreview, setShowReportPreview] = useState(false);
  
  // Find the selected comments
  const selectedComments = selectedCommentIds.length > 0
    ? comments.filter(comment => selectedCommentIds.includes(comment.id))
    : [];
  
  // Find the single selected comment (for backward compatibility)
  const selectedComment = selectedCommentId 
    ? comments.find(comment => comment.id === selectedCommentId) || null
    : null;
  
  // Helper function to get document name by ID
  const getDocumentName = (documentId: string): string => {
    const doc = documents.find(d => d.id === documentId);
    return doc?.name || 'Unknown Document';
  };

  // Helper function to get comment by ID or paraId
  const getCommentById = (idOrParaId: string) => {
    // First try to find by regular ID
    let comment = comments.find(comment => comment.id === idOrParaId);
    if (comment) return comment;
    
    // If not found, try to find by paraId
    comment = comments.find(comment => comment.paraId === idOrParaId);
    return comment || null;
  };
  const renderMinimizedContent = () => (
    <div className="flex flex-col items-center space-y-4 p-2">
      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
        <span className="text-blue-600">💬</span>
      </div>
      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
        <span className="text-yellow-600">📝</span>
      </div>
      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
        <span className="text-red-600">⚙️</span>
      </div>
    </div>
  );

  const renderNormalContent = () => {
    // Show report preview if enabled
    if (showReportPreview) {
      return (
        <ReportPreview
          selectedCommentIds={selectedCommentIds}
          wordComments={comments}
          metaComments={metaComments}
          documents={documents}
          onClose={() => setShowReportPreview(false)}
        />
      );
    }
    
    // If multiple comments are selected, show all of them with their paragraphs
    if (selectedComments.length > 1) {
      return (
        <div className="p-4 space-y-4">
          {/* Report Generation Button */}
          <button
            onClick={() => setShowReportPreview(true)}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <span>📄</span>
            <span>Generate Report</span>
          </button>
          
          <MultipleCommentDetails 
            comments={selectedComments}
            documents={documents}
            getDocumentName={getDocumentName}
          />
        </div>
      );
    }
    
    // If a single comment is selected, show comment details
    if (selectedComment) {
      // Get the document paragraphs array for extracting referenced paragraphs
      const document = documents.find(d => d.id === selectedComment.documentId);
      const documentParagraphs = document?.transformedContent?.paragraphs || [];
      const documentFootnotes = document?.footnotes || [];
      const documentEndnotes = document?.endnotes || [];
      
      return (
        <div className="p-4">
          <CommentDetails 
            comment={selectedComment} 
            getDocumentName={getDocumentName}
            getCommentById={getCommentById}
            documentParagraphs={documentParagraphs}
            documentFootnotes={documentFootnotes}
            documentEndnotes={documentEndnotes}
          />
        </div>
      );
    }

    // Default tools and notes view
    return (
      <div className="p-4 space-y-4">
        <div className="text-center text-gray-500 mt-8">
          <p className="text-sm">Select a comment to view details</p>
        </div>
      </div>
    );
  };

  const renderFocusedContent = () => {
    // Show report preview if enabled
    if (showReportPreview) {
      return (
        <ReportPreview
          selectedCommentIds={selectedCommentIds}
          wordComments={comments}
          metaComments={metaComments}
          documents={documents}
          onClose={() => setShowReportPreview(false)}
        />
      );
    }
    
    // If multiple comments are selected, show all of them with their paragraphs
    if (selectedComments.length > 1) {
      return (
        <div className="p-4 space-y-4">
          {/* Report Generation Button */}
          <button
            onClick={() => setShowReportPreview(true)}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <span>📄</span>
            <span>Generate Report</span>
          </button>
          
          <MultipleCommentDetails 
            comments={selectedComments}
            documents={documents}
            getDocumentName={getDocumentName}
          />
        </div>
      );
    }
    
    // If a single comment is selected, show comment details with expanded view
    if (selectedComment) {
      // Get the document paragraphs array for extracting referenced paragraphs
      const document = documents.find(d => d.id === selectedComment.documentId);
      const documentParagraphs = document?.transformedContent?.paragraphs || [];
      const documentFootnotes = document?.footnotes || [];
      const documentEndnotes = document?.endnotes || [];
      
      return (
        <div className="p-4">
          <CommentDetails 
            comment={selectedComment} 
            getDocumentName={getDocumentName}
            getCommentById={getCommentById}
            documentParagraphs={documentParagraphs}
            documentFootnotes={documentFootnotes}
            documentEndnotes={documentEndnotes}
          />
        </div>
      );
    }

    // Default expanded view with comment center and tools
    return (
      <div className="p-4 space-y-6">
        <div className="text-center text-gray-500 mt-8">
          <p className="text-sm">Select a comment to view details</p>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (state) {
      case 'minimized':
        return renderMinimizedContent();
      case 'normal':
        return renderNormalContent();
      case 'focused':
        return renderFocusedContent();
      default:
        return renderNormalContent();
    }
  };

  return (
    <Panel state={state} position="right" onToggle={onToggle}>
      {renderContent()}
    </Panel>
  );
};