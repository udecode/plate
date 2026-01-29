// Panel states for left and right panels
export type PanelState = 'minimized' | 'normal' | 'focused';

// Configuration for panel dimensions
export interface PanelConfig {
  minimized: string;
  normal: string;
  focused: string;
}

// Panel state management
export interface PanelStateManager {
  leftPanel: PanelState;
  rightPanel: PanelState;
  setLeftPanel: (state: PanelState) => void;
  setRightPanel: (state: PanelState) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
}

// Comment range specification for highlighting
export interface CommentRange {
  paragraphIndex: number; // Index of paragraph in document order
  startSpanIndex: number; // Zero-based index of first span to highlight (inclusive)
  endSpanIndex: number; // Zero-based index of last span to highlight (exclusive)
}

// Comment data extracted from .docx files
export interface DocumentComment {
  id: string; // From w:id in comments.xml - used to link comment with text in document.xml
  paraId?: string; // From w14:paraId in first paragraph of comment - used for threading and done status
  durableId?: string; // From w16cid:durableId in commentsIds.xml - for future use
  author: string;
  initial?: string;
  date: Date;
  plainText: string; // Plain text version for search
  content: string; // HTML content of the comment
  documentId: string;
  reference?: string; // Reference to the commented text/location
  // Extended comment properties
  done?: boolean; // Whether the comment is marked as done
  parentId?: string; // paraId of parent comment for threading
  children?: string[]; // Array of child comment paraIds
  paragraphIds?: number[]; // Array of paragraph indices that this comment refers to (array positions in document order)
  ranges?: CommentRange[]; // Array of ranges specifying exact spans to highlight
}

// Footnote/Endnote data extracted from .docx files
export interface DocumentFootnote {
  id: string;
  type: 'footnote' | 'endnote';
  content: string; // HTML content of the footnote/endnote
  plainText: string; // Plain text version for search
  documentId: string;
  noteType?: 'normal' | 'separator' | 'continuationSeparator'; // Special footnote types
}

// Document upload and management
export interface UploadedDocument {
  id: string;
  name: string;
  file: File;
  uploadDate: Date;
  size: number;
  type: string;
  comments?: DocumentComment[]; // Comments extracted from the document
  footnotes?: DocumentFootnote[]; // Footnotes extracted from the document
  endnotes?: DocumentFootnote[]; // Endnotes extracted from the document
  isProcessing?: boolean; // Flag to indicate if document is being parsed
  processingError?: string; // Error message if parsing failed
  // Additional XML metadata for advanced features
  xmlMetadata?: {
    documentXml?: Document;
    stylesXml?: Document;
    numberingXml?: Document;
    commentsXml?: Document;
    commentsExtendedXml?: Document;
    footnotesXml?: Document;
    endnotesXml?: Document;
  };
  // Transformed HTML content
  transformedContent?: {
    html: string;
    plainText: string;
    paragraphs: string[]; // Array of paragraph HTML strings in document order
  };
}

// Comment filter types
export interface CommentFilters {
  author: string; // Empty string means no filter
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  searchText: string; // Full-text search
  hashtags: string[]; // Filter by hashtags (without # symbol, empty array means no filter)
  commentType: 'all' | 'word' | 'meta'; // Filter by comment type
  hasLinks: boolean; // Show only comments with linked comments (word comments linked by meta-comments, or meta-comments with links)
  inReport: boolean; // Show only comments included in current report (meta-comments only)
  metaCommentType: MetaComment['type'] | 'all'; // Filter meta-comments by type
}

export interface CommentFilterState {
  filters: CommentFilters;
  setAuthorFilter: (author: string) => void;
  setDateRangeFilter: (start: Date | null, end: Date | null) => void;
  setSearchTextFilter: (searchText: string) => void;
  setHashtagsFilter: (hashtags: string[]) => void;
  setCommentTypeFilter: (commentType: CommentFilters['commentType']) => void;
  setHasLinksFilter: (hasLinks: boolean) => void;
  setInReportFilter: (inReport: boolean) => void;
  setMetaCommentTypeFilter: (metaCommentType: CommentFilters['metaCommentType']) => void;
  resetFilters: () => void;
  getFilteredComments: (comments: DocumentComment[], metaComments: MetaComment[]) => { 
    wordComments: DocumentComment[]; 
    metaComments: MetaComment[] 
  };
  getUniqueAuthors: (comments: DocumentComment[], metaComments: MetaComment[]) => string[];
  getUniqueHashtags: (comments: DocumentComment[], metaComments: MetaComment[]) => string[];
}

export interface DocumentStateManager {
  documents: UploadedDocument[];
  activeDocumentId: string | null; // Keep for backward compatibility, will be deprecated
  selectedDocumentIds: string[]; // New: array of selected document IDs
  comments: DocumentComment[]; // All comments from all documents
  metaComments: MetaComment[]; // All meta-comments across all projects
  reportConfigs: ReportConfig[]; // All report configurations for current project
  selectedCommentId: string | null; // Currently selected comment for right panel (backward compatible)
  selectedCommentIds: string[]; // New: array of selected comment IDs for multi-selection
  // Project state
  currentProjectId: string | null; // ID of currently loaded project
  currentProjectName: string | null; // Name of currently loaded project
  hasUnsavedChanges: boolean; // Whether there are unsaved changes
  addDocument: (file: File) => void;
  removeDocument: (id: string) => void;
  setActiveDocument: (id: string | null) => void; // Keep for backward compatibility
  setSelectedComment: (id: string | null) => void; // Keep for backward compatibility
  // New methods for multiple comment selection
  selectComment: (id: string) => void;
  deselectComment: (id: string) => void;
  toggleCommentSelection: (id: string, multiSelect?: boolean) => void;
  clearSelectedComments: () => void;
  // New methods for multiple document selection
  selectDocument: (id: string) => void;
  deselectDocument: (id: string) => void;
  selectAllDocuments: () => void;
  deselectAllDocuments: () => void;
  toggleDocumentSelection: (id: string) => void;
  // Meta-comment management methods
  addMetaComment: (metaComment: Omit<MetaComment, 'id' | 'created'>) => void;
  updateMetaComment: (id: string, updates: Partial<MetaComment>) => void;
  removeMetaComment: (id: string) => void;
  // Report configuration management methods
  addReportConfig: (config: Omit<ReportConfig, 'id'>) => void;
  updateReportConfig: (id: string, updates: Partial<ReportConfig>) => void;
  removeReportConfig: (id: string) => void;
  // Project management methods
  setCurrentProject: (projectId: string | null, projectName: string | null) => void;
  markAsUnsaved: () => void;
  markAsSaved: () => void;
  clearProject: () => void;
}

// Project persistence types
export interface Project {
  id: string;
  name: string;
  created: Date;
  lastModified: Date;
  documents: DocumentMetadata[];
  metaComments?: MetaComment[]; // Meta-comments for this project
  reportConfigs?: ReportConfig[]; // Report configurations for this project
}

export interface DocumentMetadata {
  id: string;
  name: string;
  fileHash: string;
  uploadDate: Date;
  wordComments: DocumentComment[];
  footnotes?: DocumentFootnote[];
  endnotes?: DocumentFootnote[];
  textContent?: string; // For search/anchoring
}

// Meta-comment data for synthesis and analysis
export interface MetaComment {
  id: string; // "meta-{uuid}"
  type: 'synthesis' | 'link' | 'question' | 'observation';
  text: string;
  author: string; // Current user
  created: Date;
  modified?: Date;
  linkedComments: string[]; // Array of comment IDs (word or meta)
  tags: string[]; // Extracted hashtags
  includeInReport: boolean;
}

export interface ReportSection {
  id: string;
  title: string;
  description?: string;
  commentIds: string[]; // IDs of word comments and meta-comments to include
}

// Report configuration and generation types
export interface ReportConfig {
  id: string;
  name: string;
  selectedCommentIds: string[]; // IDs of Word + meta comments
  title: string;
  sections: ReportSection[];
  includeQuestions: boolean; // Whether to include "Questions for Follow-up" section
  options: ReportOptions;
  generatedDate?: Date;
}

export interface ReportOptions {
  showAuthor: boolean;
  showDate: boolean;
  showContext: boolean; // Include surrounding document text
  format: 'human' | 'hybrid';
}