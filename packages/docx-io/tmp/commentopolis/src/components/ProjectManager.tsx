import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDocumentContext } from '../hooks/useDocumentContext';
import { useProjectStorage } from '../hooks/useProjectStorage';
import { saveProject as saveProjectToDB } from '../utils/indexedDB';
import type { Project } from '../types';

interface ProjectManagerProps {
  className?: string;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ className = '' }) => {
  const { 
    documents, 
    comments, 
    metaComments, 
    reportConfigs,
    currentProjectId,
    currentProjectName,
    hasUnsavedChanges,
    setCurrentProject,
    markAsSaved,
    clearProject
  } = useDocumentContext();
  
  const { 
    saveProject, 
    loadProject, 
    listProjects, 
    deleteProject, 
    exportProject, 
    importProject 
  } = useProjectStorage();

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [renameProjectId, setRenameProjectId] = useState<string | null>(null);
  const [renameProjectName, setRenameProjectName] = useState('');
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<number | null>(null);

  // Auto-save functionality
  useEffect(() => {
    // Clear any existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Only auto-save if there's a current project and unsaved changes
    if (currentProjectId && currentProjectName && hasUnsavedChanges && documents.length > 0) {
      autoSaveTimerRef.current = window.setTimeout(async () => {
        try {
          await saveProject(currentProjectName, documents, metaComments, reportConfigs, currentProjectId);
          markAsSaved();
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }, 30000); // 30 seconds
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [currentProjectId, currentProjectName, hasUnsavedChanges, documents, metaComments, reportConfigs, saveProject, markAsSaved]);

  // Load available projects when load dialog is opened
  const loadAvailableProjects = useCallback(async () => {
    try {
      setLoading(true);
      const projects = await listProjects();
      setAvailableProjects(projects.sort((a, b) => 
        b.lastModified.getTime() - a.lastModified.getTime()
      ));
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  }, [listProjects]);

  useEffect(() => {
    if (showLoadDialog) {
      loadAvailableProjects();
    }
  }, [showLoadDialog, loadAvailableProjects]);

  // New Project - Creates a new project
  const handleNewProject = async () => {
    if (!newProjectName.trim()) {
      return;
    }

    try {
      const projectId = await saveProject(newProjectName.trim(), documents, metaComments, reportConfigs);
      setCurrentProject(projectId, newProjectName.trim());
      markAsSaved();
      setNewProjectName('');
      setShowNewDialog(false);
    } catch (error) {
      console.error('Error creating new project:', error);
    }
  };

  // Save Project - Updates existing project
  const handleSaveProject = async () => {
    if (!currentProjectId || !currentProjectName) {
      return;
    }

    try {
      await saveProject(currentProjectName, documents, metaComments, reportConfigs, currentProjectId);
      markAsSaved();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleLoadProject = async (projectId: string) => {
    try {
      const project = await loadProject(projectId);
      if (project) {
        setCurrentProject(project.id, project.name);
        markAsSaved();
        // Note: Full project restoration requires re-uploading actual .docx files
        // since File objects cannot be serialized to IndexedDB.
        // This limitation is documented in the PR description.
        // Future enhancement: Show project metadata and prompt user to upload matching files
        setShowLoadDialog(false);
      }
    } catch (error) {
      console.error('Error loading project:', error);
    }
  };

  const handleRenameProject = async () => {
    if (!renameProjectId || !renameProjectName.trim()) {
      return;
    }

    try {
      const project = availableProjects.find(p => p.id === renameProjectId);
      if (project) {
        // Load the full project to get all data
        const fullProject = await loadProject(renameProjectId);
        if (fullProject) {
          // Update just the name, keep all other data
          const updatedProject = {
            ...fullProject,
            name: renameProjectName.trim(),
            lastModified: new Date()
          };
          
          // Save it back with the same ID
          await saveProjectToDB(updatedProject);
          
          // If this is the current project, update the current project name
          if (currentProjectId === renameProjectId) {
            setCurrentProject(renameProjectId, renameProjectName.trim());
          }
          
          // Refresh the project list
          await loadAvailableProjects();
        }
      }
      
      setShowRenameDialog(false);
      setRenameProjectId(null);
      setRenameProjectName('');
    } catch (error) {
      console.error('Error renaming project:', error);
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (window.confirm(`Are you sure you want to delete "${projectName}"?`)) {
      try {
        await deleteProject(projectId);
        
        // If we deleted the current project, clear it
        if (currentProjectId === projectId) {
          clearProject();
        }
        
        loadAvailableProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleExportProject = async (project: Project) => {
    try {
      exportProject(project);
    } catch (error) {
      console.error('Error exporting project:', error);
    }
  };

  const handleImportProject = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await importProject(text);
      if (showLoadDialog) {
        loadAvailableProjects();
      }
    } catch (error) {
      console.error('Error importing project:', error);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasDocuments = documents.length > 0;
  const hasComments = comments.length > 0;

  return (
    <div className={className}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm">Project</h3>
          {hasUnsavedChanges && (
            <span className="text-xs text-orange-600 font-medium" title="Unsaved changes (auto-saves in 30s)">
              ● Unsaved
            </span>
          )}
        </div>
        
        {/* Current Project Display */}
        {currentProjectName && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm">
            <div className="font-medium text-blue-900 truncate" title={currentProjectName}>
              📁 {currentProjectName}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowNewDialog(true)}
            disabled={!hasDocuments}
            className={`
              px-3 py-2 text-sm rounded-lg transition-colors duration-200
              ${hasDocuments
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
            title={hasDocuments ? 'Create new project' : 'Add documents first'}
          >
            ✨ New
          </button>

          <button
            onClick={handleSaveProject}
            disabled={!currentProjectId || !hasUnsavedChanges}
            className={`
              px-3 py-2 text-sm rounded-lg transition-colors duration-200
              ${currentProjectId && hasUnsavedChanges
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
            title={!currentProjectId ? 'Create a new project first' : !hasUnsavedChanges ? 'No changes to save' : 'Save current project'}
          >
            💾 Save
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowLoadDialog(true)}
            className="px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
          >
            📂 Load
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200"
            title="Import project from JSON file"
          >
            📥 Import
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportProject}
          className="hidden"
        />
      </div>

      {/* New Project Dialog */}
      {showNewDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">New Project</h2>
            
            <div className="mb-4">
              <label htmlFor="newProjectName" className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                id="newProjectName"
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNewProject()}
                placeholder="Enter project name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <div className="text-sm text-gray-600 mb-4">
              <p>This project will contain:</p>
              <ul className="list-disc list-inside mt-2">
                <li>{documents.length} document(s)</li>
                <li>{hasComments ? comments.length : 0} comment(s)</li>
                <li>{metaComments.length} meta-comment(s)</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowNewDialog(false);
                  setNewProjectName('');
                }}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleNewProject}
                disabled={!newProjectName.trim()}
                className={`
                  px-4 py-2 text-sm rounded-lg transition-colors duration-200
                  ${newProjectName.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Project Dialog */}
      {showRenameDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Rename Project</h2>
            
            <div className="mb-4">
              <label htmlFor="renameProjectName" className="block text-sm font-medium text-gray-700 mb-2">
                New Project Name
              </label>
              <input
                id="renameProjectName"
                type="text"
                value={renameProjectName}
                onChange={(e) => setRenameProjectName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRenameProject()}
                placeholder="Enter new name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowRenameDialog(false);
                  setRenameProjectId(null);
                  setRenameProjectName('');
                }}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameProject}
                disabled={!renameProjectName.trim()}
                className={`
                  px-4 py-2 text-sm rounded-lg transition-colors duration-200
                  ${renameProjectName.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Project Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Load Project</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-600">Loading projects...</div>
              </div>
            ) : availableProjects.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-600">No saved projects found</div>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {availableProjects.map((project) => (
                  <div
                    key={project.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                        <div className="text-sm text-gray-600 mt-1">
                          <p>Created: {project.created.toLocaleDateString()}</p>
                          <p>Last modified: {project.lastModified.toLocaleDateString()}</p>
                          <p>{project.documents.length} document(s)</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 ml-4">
                        <button
                          onClick={() => handleLoadProject(project.id)}
                          className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors duration-200"
                          title="Load project"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => {
                            setRenameProjectId(project.id);
                            setRenameProjectName(project.name);
                            setShowRenameDialog(true);
                          }}
                          className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors duration-200"
                          title="Rename project"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => handleExportProject(project)}
                          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200"
                          title="Export to JSON"
                        >
                          Export
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id, project.name)}
                          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-200"
                          title="Delete project"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setShowLoadDialog(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
