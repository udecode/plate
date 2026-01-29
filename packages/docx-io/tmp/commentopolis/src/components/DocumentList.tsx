import React from 'react';
import { useDocumentContext } from '../hooks/useDocumentContext';

interface DocumentListProps {
  className?: string;
  maxHeight?: string;
  showDetails?: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({ 
  className = '', 
  maxHeight = 'max-h-64',
  showDetails = true 
}) => {
  const { 
    documents, 
    activeDocumentId, 
    selectedDocumentIds,
    setActiveDocument, 
    removeDocument,
    selectAllDocuments,
    deselectAllDocuments,
    toggleDocumentSelection
  } = useDocumentContext();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (documents.length === 0) {
    return (
      <div className={`${className} text-center py-8`}>
        <div className="text-4xl mb-2">📄</div>
        <p className="text-sm text-gray-500">No documents uploaded yet</p>
      </div>
    );
  }

  const allSelected = documents.length > 0 && selectedDocumentIds.length === documents.length;

  return (
    <div className={`${className} space-y-2`}>
      {/* Selection controls */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <span className="text-sm text-gray-600">
          {selectedDocumentIds.length} of {documents.length} selected
        </span>
        <div className="flex gap-2">
          <button
            onClick={allSelected ? deselectAllDocuments : selectAllDocuments}
            className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      <div className={`${maxHeight} overflow-y-auto space-y-2`}>
        {documents.map((doc) => {
          const isSelected = selectedDocumentIds.includes(doc.id);
          const isActive = activeDocumentId === doc.id;
          
          return (
            <div
              key={doc.id}
              className={`
                p-3 rounded-lg border transition-colors duration-200
                ${isSelected
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Checkbox for selection */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleDocumentSelection(doc.id)}
                    className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setActiveDocument(isActive ? null : doc.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">📄</span>
                      <h4 className="font-medium text-gray-800 truncate text-sm">
                        {doc.name}
                      </h4>
                      {isActive && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          Active
                        </span>
                      )}
                      {doc.isProcessing && (
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full animate-pulse">
                          Processing...
                        </span>
                      )}
                    </div>
                    
                    {/* Comments info */}
                    {doc.comments && doc.comments.length > 0 && (
                      <div className="flex items-center mt-1 text-xs text-green-600 gap-1">
                        <span>💬</span>
                        <span>{doc.comments.length} comment{doc.comments.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    
                    {/* Processing error */}
                    {doc.processingError && (
                      <div className="flex items-center mt-1 text-xs text-red-600 gap-1">
                        <span>⚠️</span>
                        <span className="truncate">Error: {doc.processingError}</span>
                      </div>
                    )}
                    
                    {showDetails && (
                      <div className="flex items-center mt-1 text-xs text-gray-500 gap-2">
                        <span>{formatFileSize(doc.size)}</span>
                        <span>•</span>
                        <span>{formatDate(doc.uploadDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDocument(doc.id);
                  }}
                  className="ml-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                  title="Remove document"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};