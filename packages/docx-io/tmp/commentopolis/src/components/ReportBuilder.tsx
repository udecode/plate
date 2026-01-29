import React, { useState } from 'react';
import type { DocumentComment, MetaComment, ReportConfig, ReportSection, ReportOptions } from '../types';

interface ReportBuilderProps {
  comments: DocumentComment[];
  metaComments: MetaComment[];
  reportConfigs: ReportConfig[];
  onSave: (config: Omit<ReportConfig, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<ReportConfig>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const ReportBuilder: React.FC<ReportBuilderProps> = ({
  comments,
  metaComments,
  reportConfigs,
  onSave,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'new' | 'edit' | null>(null);
  const [configName, setConfigName] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [includeQuestions, setIncludeQuestions] = useState(false);
  const [selectedCommentIds, setSelectedCommentIds] = useState<string[]>([]);
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    showAuthor: true,
    showDate: true,
    showContext: false,
    format: 'human'
  });
  const [draggedCommentId, setDraggedCommentId] = useState<string | null>(null);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);

  // Combined list of all comments (Word + meta)
  const allComments = [
    ...comments.map(c => ({ ...c, commentType: 'word' as const })),
    ...metaComments.map(mc => ({ ...mc, commentType: 'meta' as const }))
  ];

  const handleNewConfig = () => {
    setEditMode('new');
    setConfigName('');
    setReportTitle('');
    setIncludeQuestions(false);
    setSelectedCommentIds([]);
    setSections([]);
    setReportOptions({
      showAuthor: true,
      showDate: true,
      showContext: false,
      format: 'human'
    });
    setSelectedConfigId(null);
  };

  const handleLoadConfig = (configId: string) => {
    const config = reportConfigs.find(c => c.id === configId);
    if (config) {
      setSelectedConfigId(configId);
      setEditMode('edit');
      setConfigName(config.name);
      setReportTitle(config.title);
      setIncludeQuestions(config.includeQuestions);
      setSelectedCommentIds(config.selectedCommentIds);
      setSections(config.sections);
      setReportOptions(config.options);
    }
  };

  const handleSaveConfig = () => {
    if (!configName.trim()) {
      return;
    }

    const config = {
      name: configName.trim(),
      title: reportTitle.trim(),
      includeQuestions,
      selectedCommentIds,
      sections,
      options: reportOptions
    };

    if (editMode === 'edit' && selectedConfigId) {
      onUpdate(selectedConfigId, config);
    } else {
      onSave(config);
    }

    setEditMode(null);
    setSelectedConfigId(null);
  };

  const handleDeleteConfig = (configId: string) => {
    if (window.confirm('Are you sure you want to delete this report configuration?')) {
      onDelete(configId);
      if (selectedConfigId === configId) {
        setSelectedConfigId(null);
        setEditMode(null);
      }
    }
  };

  const toggleCommentSelection = (commentId: string) => {
    setSelectedCommentIds(prev => {
      if (prev.includes(commentId)) {
        return prev.filter(id => id !== commentId);
      } else {
        return [...prev, commentId];
      }
    });
  };

  const handleAddSection = () => {
    const newSection: ReportSection = {
      id: `section-${crypto.randomUUID()}`,
      title: 'New Section',
      description: '',
      commentIds: []
    };
    setSections(prev => [...prev, newSection]);
  };

  const handleUpdateSection = (sectionId: string, updates: Partial<ReportSection>) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, ...updates } : s));
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
  };

  const handleDragStart = (commentId: string, fromSection?: string) => {
    setDraggedCommentId(commentId);
    setDraggedSectionId(fromSection || null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnSection = (sectionId: string) => {
    if (!draggedCommentId) return;

    // Remove from previous section if it came from one
    if (draggedSectionId) {
      setSections(prev => prev.map(s => 
        s.id === draggedSectionId 
          ? { ...s, commentIds: s.commentIds.filter(id => id !== draggedCommentId) }
          : s
      ));
    }

    // Add to new section if not already there
    setSections(prev => prev.map(s => 
      s.id === sectionId && !s.commentIds.includes(draggedCommentId)
        ? { ...s, commentIds: [...s.commentIds, draggedCommentId] }
        : s
    ));

    setDraggedCommentId(null);
    setDraggedSectionId(null);
  };

  const handleReorderWithinSection = (sectionId: string, commentId: string, direction: 'up' | 'down') => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      
      const index = s.commentIds.indexOf(commentId);
      if (index === -1) return s;
      
      const newCommentIds = [...s.commentIds];
      if (direction === 'up' && index > 0) {
        [newCommentIds[index - 1], newCommentIds[index]] = [newCommentIds[index], newCommentIds[index - 1]];
      } else if (direction === 'down' && index < newCommentIds.length - 1) {
        [newCommentIds[index], newCommentIds[index + 1]] = [newCommentIds[index + 1], newCommentIds[index]];
      }
      
      return { ...s, commentIds: newCommentIds };
    }));
  };

  const getCommentById = (id: string) => {
    return allComments.find(c => c.id === id);
  };

  const getAvailableComments = () => {
    const usedCommentIds = new Set(sections.flatMap(s => s.commentIds));
    return allComments.filter(c => 
      selectedCommentIds.includes(c.id) && !usedCommentIds.has(c.id)
    );
  };

  if (!editMode) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Report Builder</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            <div className="mb-6">
              <button
                onClick={handleNewConfig}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                + New Report Configuration
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Saved Configurations</h3>
              {reportConfigs.length === 0 ? (
                <p className="text-gray-500 text-sm">No report configurations yet. Create one to get started.</p>
              ) : (
                <div className="grid gap-3">
                  {reportConfigs.map(config => (
                    <div key={config.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{config.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {config.selectedCommentIds.length} comments, {config.sections.length} sections
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleLoadConfig(config.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteConfig(config.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {editMode === 'edit' ? 'Edit' : 'Create'} Report Configuration
            </h2>
            <button
              onClick={() => {
                setEditMode(null);
                setSelectedConfigId(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Configuration Name
              </label>
              <input
                type="text"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder="e.g., Executive Summary, Technical Deep Dive"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Title
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="e.g., Document Analysis Report"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeQuestions}
                  onChange={(e) => setIncludeQuestions(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="text-sm text-gray-700">Include Questions for Follow-up Section</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={reportOptions.showAuthor}
                    onChange={(e) => setReportOptions(prev => ({ ...prev, showAuthor: e.target.checked }))}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Show Author</span>
                </label>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={reportOptions.showDate}
                    onChange={(e) => setReportOptions(prev => ({ ...prev, showDate: e.target.checked }))}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Show Date</span>
                </label>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={reportOptions.showContext}
                    onChange={(e) => setReportOptions(prev => ({ ...prev, showContext: e.target.checked }))}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Show Context</span>
                </label>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Format</label>
                <select
                  value={reportOptions.format}
                  onChange={(e) => setReportOptions(prev => ({ ...prev, format: e.target.value as 'human' | 'hybrid' }))}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                >
                  <option value="human">Human</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 p-6">
            {/* Left column: Comment selection */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Select Comments</h3>
                <span className="text-sm text-gray-600">
                  {selectedCommentIds.length} selected
                </span>
              </div>

              <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                {allComments.map(comment => (
                  <div
                    key={comment.id}
                    className="border-b border-gray-100 last:border-b-0 p-3 hover:bg-gray-50"
                  >
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCommentIds.includes(comment.id)}
                        onChange={() => toggleCommentSelection(comment.id)}
                        className="mt-1 rounded text-blue-600"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                            comment.commentType === 'meta' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {comment.commentType === 'meta' ? 'Meta' : 'Word'}
                          </span>
                          {'author' in comment && (
                            <span className="text-xs text-gray-600">{comment.author}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-800 mt-1 line-clamp-2">
                          {comment.commentType === 'meta' ? comment.text : comment.plainText}
                        </p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Available Comments</h4>
                <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                  {getAvailableComments().length === 0 ? (
                    <p className="text-xs text-gray-500">All selected comments are organized into sections</p>
                  ) : (
                    <div className="space-y-2">
                      {getAvailableComments().map(comment => (
                        <div
                          key={comment.id}
                          draggable
                          onDragStart={() => handleDragStart(comment.id)}
                          className="p-2 bg-white border border-gray-200 rounded cursor-move hover:border-blue-300"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                              comment.commentType === 'meta' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {comment.commentType === 'meta' ? 'Meta' : 'Word'}
                            </span>
                            <p className="text-xs text-gray-800 line-clamp-1">
                              {comment.commentType === 'meta' ? comment.text : comment.plainText}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right column: Sections */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Report Sections</h3>
                <button
                  onClick={handleAddSection}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1.5 px-3 rounded transition-colors"
                >
                  + Add Section
                </button>
              </div>

              <div className="space-y-3">
                {sections.map(section => (
                  <div
                    key={section.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    onDragOver={handleDragOver}
                    onDrop={() => handleDropOnSection(section.id)}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => handleUpdateSection(section.id, { title: e.target.value })}
                            placeholder="Section title"
                            className="w-full px-2 py-1 text-sm font-semibold border border-gray-300 rounded"
                          />
                          <textarea
                            value={section.description || ''}
                            onChange={(e) => handleUpdateSection(section.id, { description: e.target.value })}
                            placeholder="Section description (optional)"
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded resize-none"
                            rows={2}
                          />
                        </div>
                        <button
                          onClick={() => handleDeleteSection(section.id)}
                          className="text-red-600 hover:text-red-800 ml-2"
                          title="Delete section"
                        >
                          <span className="text-lg">&times;</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-600">
                          Comments ({section.commentIds.length})
                        </div>
                        {section.commentIds.length === 0 ? (
                          <p className="text-xs text-gray-500 italic p-2 border border-dashed border-gray-300 rounded">
                            Drag comments here
                          </p>
                        ) : (
                          <div className="space-y-1">
                            {section.commentIds.map((commentId, index) => {
                              const comment = getCommentById(commentId);
                              if (!comment) return null;
                              
                              return (
                                <div
                                  key={commentId}
                                  draggable
                                  onDragStart={() => handleDragStart(commentId, section.id)}
                                  className="p-2 bg-white border border-gray-200 rounded text-xs flex items-center justify-between hover:border-blue-300"
                                >
                                  <div className="flex-1 min-w-0">
                                    <span className={`inline-block text-xs font-medium px-1.5 py-0.5 rounded mr-2 ${
                                      comment.commentType === 'meta' 
                                        ? 'bg-purple-100 text-purple-800' 
                                        : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {comment.commentType === 'meta' ? 'M' : 'W'}
                                    </span>
                                    <span className="text-gray-800 line-clamp-1">
                                      {comment.commentType === 'meta' ? comment.text : comment.plainText}
                                    </span>
                                  </div>
                                  <div className="flex gap-1 ml-2">
                                    <button
                                      onClick={() => handleReorderWithinSection(section.id, commentId, 'up')}
                                      disabled={index === 0}
                                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                      title="Move up"
                                    >
                                      ↑
                                    </button>
                                    <button
                                      onClick={() => handleReorderWithinSection(section.id, commentId, 'down')}
                                      disabled={index === section.commentIds.length - 1}
                                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                      title="Move down"
                                    >
                                      ↓
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={() => {
              setEditMode(null);
              setSelectedConfigId(null);
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveConfig}
            disabled={!configName.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
