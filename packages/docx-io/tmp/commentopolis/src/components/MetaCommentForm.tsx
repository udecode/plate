import React, { useState } from 'react';
import type { MetaComment, DocumentComment } from '../types';

interface MetaCommentFormProps {
  onSubmit: (metaComment: Omit<MetaComment, 'id' | 'created'>) => void;
  onCancel: () => void;
  linkedComments?: string[]; // Pre-linked comment IDs
  getCommentById?: (id: string) => (DocumentComment | MetaComment) | null; // Function to get comment details
}

/**
 * Form component for creating new meta-comments
 */
export const MetaCommentForm: React.FC<MetaCommentFormProps> = ({ 
  onSubmit, 
  onCancel, 
  linkedComments = [], 
  getCommentById 
}) => {
  const [type, setType] = useState<MetaComment['type']>('synthesis');
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('Current User');
  const [includeInReport, setIncludeInReport] = useState(false);
  const [selectedLinkedComments, setSelectedLinkedComments] = useState<string[]>(linkedComments);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      return;
    }

    onSubmit({
      type,
      text: text.trim(),
      author,
      linkedComments: selectedLinkedComments,
      tags: [], // Will be extracted from text
      includeInReport
    });

    // Reset form
    setText('');
    setIncludeInReport(false);
  };

  const handleRemoveLinkedComment = (commentId: string) => {
    setSelectedLinkedComments(prev => prev.filter(id => id !== commentId));
  };

  const getCommentPreview = (commentId: string): { author: string; text: string } | null => {
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
    <form onSubmit={handleSubmit} className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">✨</span>
        <h3 className="text-lg font-semibold text-purple-900">Create Meta-Comment</h3>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as MetaComment['type'])}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="synthesis">💡 Synthesis</option>
          <option value="link">🔗 Link</option>
          <option value="question">❓ Question</option>
          <option value="observation">👁️ Observation</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comment Text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your meta-comment... Use #hashtags to categorize"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Tip: Use #hashtags to categorize your meta-comments
        </p>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Author
        </label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>

      {/* Linked Comments Section */}
      {selectedLinkedComments.length > 0 && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Linked Comments ({selectedLinkedComments.length})
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto border border-purple-200 rounded-lg p-2 bg-white">
            {selectedLinkedComments.map(commentId => {
              const preview = getCommentPreview(commentId);
              return (
                <div
                  key={commentId}
                  className="flex items-start justify-between bg-purple-50 p-2 rounded text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-purple-800">{preview?.author || 'Unknown'}</div>
                    <div className="text-purple-600 truncate">
                      {preview?.text.slice(0, 60) || commentId}
                      {preview && preview.text.length > 60 ? '...' : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveLinkedComment(commentId)}
                    className="ml-2 px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors flex-shrink-0"
                    title="Remove link"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeInReport}
            onChange={(e) => setIncludeInReport(e.target.checked)}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <span className="text-sm text-gray-700">Include in Report</span>
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          Create Meta-Comment
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
