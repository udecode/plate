import React from 'react';
import type { UploadedDocument } from '../types';

interface DocumentViewerProps {
  document: UploadedDocument;
}

/**
 * Component to display transformed Word document content as HTML
 */
export const DocumentViewer: React.FC<DocumentViewerProps> = ({ document }) => {
  if (document.isProcessing) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div 
            className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
            data-testid="loading-spinner"
          ></div>
          <span className="ml-3 text-gray-600">Processing document...</span>
        </div>
      </div>
    );
  }

  if (document.processingError) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-red-400">⚠️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error Processing Document
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {document.processingError}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!document.transformedContent) {
    return (
      <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-yellow-400">ℹ️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              No Content Available
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              Document content could not be transformed to HTML.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Document header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {document.name}
            </h2>
            <p className="text-sm text-gray-500">
              Uploaded {document.uploadDate.toLocaleDateString()} • {Math.round(document.size / 1024)} KB
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {document.comments && document.comments.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {document.comments.length} comment{document.comments.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Document content */}
      <div className="px-6 py-6">
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: document.transformedContent.html 
          }}
        />
      </div>

      {/* Document metadata */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="font-medium">File size:</span> {Math.round(document.size / 1024)} KB
            </div>
            <div>
              <span className="font-medium">Type:</span> Word Document
            </div>
            <div>
              <span className="font-medium">Characters:</span> {document.transformedContent.plainText.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};