/**
 * IndexedDB service for project persistence
 * Database name: commentopolis-db
 */

import type { Project, MetaComment, ReportConfig } from '../types';

// Interface for stored config that may not have new fields
interface StoredReportConfig extends Omit<ReportConfig, 'title' | 'includeQuestions'> {
  title?: string;
  includeQuestions?: boolean;
}

const DB_NAME = 'commentopolis-db';
const DB_VERSION = 2; // Incremented to add meta-comments store
const PROJECTS_STORE = 'projects';
const META_COMMENTS_STORE = 'metaComments';

/**
 * Initialize IndexedDB database
 */
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create projects object store if it doesn't exist
      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        const objectStore = db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
        
        // Create indexes for efficient queries
        objectStore.createIndex('name', 'name', { unique: false });
        objectStore.createIndex('lastModified', 'lastModified', { unique: false });
        objectStore.createIndex('created', 'created', { unique: false });
      }

      // Create meta-comments object store if it doesn't exist
      if (!db.objectStoreNames.contains(META_COMMENTS_STORE)) {
        const metaStore = db.createObjectStore(META_COMMENTS_STORE, { keyPath: 'id' });
        
        // Create indexes for efficient queries
        metaStore.createIndex('author', 'author', { unique: false });
        metaStore.createIndex('created', 'created', { unique: false });
        metaStore.createIndex('type', 'type', { unique: false });
        metaStore.createIndex('includeInReport', 'includeInReport', { unique: false });
      }
    };
  });
}

/**
 * Type for stored project data in IndexedDB
 */
interface StoredProject {
  id: string;
  name: string;
  created: string;
  lastModified: string;
  documents: Array<{
    id: string;
    name: string;
    fileHash: string;
    uploadDate: string;
    wordComments: Array<{
      id: string;
      author: string;
      date: string;
      plainText: string;
      content: string;
      documentId: string;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  }>;
  metaComments?: Array<{
    id: string;
    type: string;
    text: string;
    author: string;
    created: string;
    modified?: string;
    linkedComments: string[];
    tags: string[];
    includeInReport: boolean;
  }>;
  reportConfigs?: Array<{
    id: string;
    name: string;
    selectedCommentIds: string[];
    sections: Array<{
      id: string;
      title: string;
      description?: string;
      commentIds: string[];
    }>;
    options: {
      showAuthor: boolean;
      showDate: boolean;
      showContext: boolean;
      format: 'human' | 'hybrid';
    };
  }>;
}

/**
 * Convert stored project to runtime Project type
 */
function deserializeProject(stored: StoredProject): Project {
  return {
    ...stored,
    created: new Date(stored.created),
    lastModified: new Date(stored.lastModified),
    documents: stored.documents.map((doc) => ({
      ...doc,
      uploadDate: new Date(doc.uploadDate),
      wordComments: doc.wordComments.map((comment) => ({
        ...comment,
        date: new Date(comment.date)
      }))
    })),
    metaComments: stored.metaComments?.map((metaComment) => ({
      ...metaComment,
      type: metaComment.type as 'synthesis' | 'link' | 'question' | 'observation',
      created: new Date(metaComment.created),
      modified: metaComment.modified ? new Date(metaComment.modified) : undefined
    })) || [],
    reportConfigs: stored.reportConfigs?.map((config) => ({
      ...config,
      title: (config as StoredReportConfig).title || '',
      includeQuestions: (config as StoredReportConfig).includeQuestions ?? false
    })) || []
  };
}

/**
 * Get a database connection
 */
async function getDB(): Promise<IDBDatabase> {
  return initDB();
}

/**
 * Save a project to IndexedDB
 */
export async function saveProject(project: Project): Promise<void> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROJECTS_STORE], 'readwrite');
    const objectStore = transaction.objectStore(PROJECTS_STORE);
    
    // Convert dates to ISO strings for storage
    const projectToStore = {
      ...project,
      created: project.created.toISOString(),
      lastModified: project.lastModified.toISOString(),
      documents: project.documents.map(doc => ({
        ...doc,
        uploadDate: doc.uploadDate.toISOString(),
        wordComments: doc.wordComments.map(comment => ({
          ...comment,
          date: comment.date.toISOString()
        }))
      })),
      metaComments: project.metaComments?.map(metaComment => ({
        ...metaComment,
        created: metaComment.created.toISOString(),
        modified: metaComment.modified?.toISOString()
      }))
    };
    
    const request = objectStore.put(projectToStore);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      reject(new Error('Failed to save project'));
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Load a project from IndexedDB by ID
 */
export async function loadProject(id: string): Promise<Project | null> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROJECTS_STORE], 'readonly');
    const objectStore = transaction.objectStore(PROJECTS_STORE);
    const request = objectStore.get(id);
    
    request.onsuccess = () => {
      if (request.result) {
        const project = deserializeProject(request.result as StoredProject);
        resolve(project);
      } else {
        resolve(null);
      }
    };
    
    request.onerror = () => {
      reject(new Error('Failed to load project'));
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * List all projects in IndexedDB
 */
export async function listProjects(): Promise<Project[]> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROJECTS_STORE], 'readonly');
    const objectStore = transaction.objectStore(PROJECTS_STORE);
    const request = objectStore.getAll();
    
    request.onsuccess = () => {
      // Convert ISO strings back to Date objects
      const results = request.result as StoredProject[];
      const projects = results.map(deserializeProject);
      resolve(projects);
    };
    
    request.onerror = () => {
      reject(new Error('Failed to list projects'));
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Delete a project from IndexedDB
 */
export async function deleteProject(id: string): Promise<void> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROJECTS_STORE], 'readwrite');
    const objectStore = transaction.objectStore(PROJECTS_STORE);
    const request = objectStore.delete(id);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      reject(new Error('Failed to delete project'));
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Export a project to JSON
 */
export function exportProjectToJSON(project: Project): string {
  return JSON.stringify(project, null, 2);
}

/**
 * Import a project from JSON
 */
export function importProjectFromJSON(json: string): Project {
  try {
    const data = JSON.parse(json) as StoredProject;
    
    // Validate required fields
    if (!data.id || !data.name || !data.created || !data.lastModified || !Array.isArray(data.documents)) {
      throw new Error('Invalid project format: missing required fields');
    }
    
    // Convert to Project type
    return deserializeProject(data);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format');
    }
    throw error;
  }
}

/**
 * Save a meta-comment to IndexedDB
 */
export async function saveMetaComment(metaComment: MetaComment): Promise<void> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([META_COMMENTS_STORE], 'readwrite');
    const objectStore = transaction.objectStore(META_COMMENTS_STORE);
    
    // Convert dates to ISO strings for storage
    const metaCommentToStore = {
      ...metaComment,
      created: metaComment.created.toISOString(),
      modified: metaComment.modified?.toISOString()
    };
    
    const request = objectStore.put(metaCommentToStore);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      reject(new Error('Failed to save meta-comment'));
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Load all meta-comments from IndexedDB
 */
export async function loadMetaComments(): Promise<MetaComment[]> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([META_COMMENTS_STORE], 'readonly');
    const objectStore = transaction.objectStore(META_COMMENTS_STORE);
    const request = objectStore.getAll();
    
    request.onsuccess = () => {
      const results = request.result as Array<{
        id: string;
        type: string;
        text: string;
        author: string;
        created: string;
        modified?: string;
        linkedComments: string[];
        tags: string[];
        includeInReport: boolean;
      }>;
      
      const metaComments = results.map((mc) => ({
        ...mc,
        created: new Date(mc.created),
        modified: mc.modified ? new Date(mc.modified) : undefined
      })) as MetaComment[];
      
      resolve(metaComments);
    };
    
    request.onerror = () => {
      reject(new Error('Failed to load meta-comments'));
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Delete a meta-comment from IndexedDB
 */
export async function deleteMetaComment(id: string): Promise<void> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([META_COMMENTS_STORE], 'readwrite');
    const objectStore = transaction.objectStore(META_COMMENTS_STORE);
    const request = objectStore.delete(id);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      reject(new Error('Failed to delete meta-comment'));
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
}
