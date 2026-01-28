/**
 * Hook for managing project storage operations
 */

import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import type { Project, DocumentMetadata, UploadedDocument, MetaComment, ReportConfig } from '../types';
import { 
  saveProject as saveProjectToDB, 
  loadProject as loadProjectFromDB,
  listProjects as listProjectsFromDB,
  deleteProject as deleteProjectFromDB,
  exportProjectToJSON,
  importProjectFromJSON
} from '../utils/indexedDB';
import { hashFile, compareHashes } from '../utils/fileHash';

export interface ProjectStorageHook {
  saveProject: (name: string, documents: UploadedDocument[], metaComments?: MetaComment[], reportConfigs?: ReportConfig[], projectId?: string) => Promise<string>;
  loadProject: (id: string) => Promise<Project | null>;
  listProjects: () => Promise<Project[]>;
  deleteProject: (id: string) => Promise<void>;
  exportProject: (project: Project) => void;
  importProject: (jsonString: string) => Promise<Project>;
  createDocumentMetadata: (document: UploadedDocument) => Promise<DocumentMetadata>;
  detectDocumentChanges: (document: UploadedDocument, metadata: DocumentMetadata) => Promise<boolean>;
}

/**
 * Custom hook for project storage operations
 */
export const useProjectStorage = (): ProjectStorageHook => {
  
  /**
   * Create document metadata from an uploaded document
   */
  const createDocumentMetadata = useCallback(async (document: UploadedDocument): Promise<DocumentMetadata> => {
    const fileHash = await hashFile(document.file);
    
    return {
      id: document.id,
      name: document.name,
      fileHash,
      uploadDate: document.uploadDate,
      wordComments: document.comments || [],
      footnotes: document.footnotes,
      endnotes: document.endnotes,
      textContent: document.transformedContent?.plainText
    };
  }, []);

  /**
   * Detect if a document has changed by comparing hashes
   */
  const detectDocumentChanges = useCallback(async (
    document: UploadedDocument, 
    metadata: DocumentMetadata
  ): Promise<boolean> => {
    try {
      const currentHash = await hashFile(document.file);
      return !compareHashes(currentHash, metadata.fileHash);
    } catch (error) {
      console.error('Error detecting document changes:', error);
      return false;
    }
  }, []);

  /**
   * Save current project state to IndexedDB
   * @param name Project name
   * @param documents Documents to save
   * @param metaComments Optional meta-comments to save
   * @param reportConfigs Optional report configurations to save
   * @param projectId Optional project ID for updates (generates new ID if not provided)
   */
  const saveProject = useCallback(async (
    name: string, 
    documents: UploadedDocument[],
    metaComments: MetaComment[] = [],
    reportConfigs: ReportConfig[] = [],
    projectId?: string
  ): Promise<string> => {
    try {
      // Create document metadata for all documents
      const documentMetadata = await Promise.all(
        documents.map(doc => createDocumentMetadata(doc))
      );

      const now = new Date();
      const project: Project = {
        id: projectId || crypto.randomUUID(),
        name,
        created: projectId ? now : now, // Keep original if updating (would need to load it)
        lastModified: now,
        documents: documentMetadata,
        metaComments,
        reportConfigs
      };

      await saveProjectToDB(project);
      toast.success(`Project "${name}" saved successfully`);
      return project.id;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to save project: ${message}`);
      throw error;
    }
  }, [createDocumentMetadata]);

  /**
   * Load a project from IndexedDB
   */
  const loadProject = useCallback(async (id: string): Promise<Project | null> => {
    try {
      const project = await loadProjectFromDB(id);
      if (project) {
        toast.success(`Project "${project.name}" loaded successfully`);
      } else {
        toast.error('Project not found');
      }
      return project;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to load project: ${message}`);
      throw error;
    }
  }, []);

  /**
   * List all projects from IndexedDB
   */
  const listProjects = useCallback(async (): Promise<Project[]> => {
    try {
      return await listProjectsFromDB();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to list projects: ${message}`);
      throw error;
    }
  }, []);

  /**
   * Delete a project from IndexedDB
   */
  const deleteProject = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteProjectFromDB(id);
      toast.success('Project deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to delete project: ${message}`);
      throw error;
    }
  }, []);

  /**
   * Export a project as JSON file
   */
  const exportProject = useCallback((project: Project): void => {
    try {
      const json = exportProjectToJSON(project);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}_${project.id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Project exported successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to export project: ${message}`);
      throw error;
    }
  }, []);

  /**
   * Import a project from JSON string
   */
  const importProject = useCallback(async (jsonString: string): Promise<Project> => {
    try {
      const project = importProjectFromJSON(jsonString);
      // Generate new ID for imported project to avoid conflicts
      const importedProject = {
        ...project,
        id: crypto.randomUUID(),
        name: `${project.name} (imported)`,
        lastModified: new Date()
      };
      await saveProjectToDB(importedProject);
      toast.success(`Project "${importedProject.name}" imported successfully`);
      return importedProject;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to import project: ${message}`);
      throw error;
    }
  }, []);

  return {
    saveProject,
    loadProject,
    listProjects,
    deleteProject,
    exportProject,
    importProject,
    createDocumentMetadata,
    detectDocumentChanges
  };
};
