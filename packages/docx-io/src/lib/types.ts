import type { TNode } from 'platejs';

// ============================================================================
// Tracked Changes Types
// ============================================================================

/** Tracked change (insertion or deletion) from DOCX file */
export type DocxTrackedChange = {
  /** Unique ID for this change */
  id: string;
  /** Type of change: 'insert' for additions, 'remove' for deletions */
  type: 'insert' | 'remove';
  /** Author who made the change */
  author?: string;
  /** Date when the change was made (ISO string) */
  date?: string;
  /** The full start token string (for searching in editor) */
  startToken: string;
  /** The full end token string (for searching in editor) */
  endToken: string;
};

/** Comment with full metadata from DOCX file */
export type DocxTrackedComment = {
  /** Unique ID for this comment */
  id: string;
  /** Author display name */
  authorName?: string;
  /** Author initials (for Word compatibility) */
  authorInitials?: string;
  /** Date when the comment was made (ISO string) */
  date?: string;
  /** Comment text content */
  text?: string;
  /** The full start token string (for searching in editor) */
  startToken: string;
  /** The full end token string (for searching in editor) */
  endToken: string;
  /** Whether the start token was found in HTML */
  hasStartToken: boolean;
  /** Whether the end token was found in HTML */
  hasEndToken: boolean;
};

// ============================================================================
// Import Result Types
// ============================================================================

/** Result of importing a DOCX file with tracking support */
export type ImportDocxResult = {
  /** Deserialized editor nodes */
  nodes: TNode[];
  /** Tracked changes (insertions and deletions) */
  trackedChanges: DocxTrackedChange[];
  /** Comments with full metadata */
  trackedComments: DocxTrackedComment[];
  /** Number of insertions found */
  insertionCount: number;
  /** Number of deletions found */
  deletionCount: number;
  /** Whether any tracking tokens were found */
  hasTracking: boolean;
  /** Warnings from mammoth conversion */
  warnings: string[];
};

/** Options for importing a DOCX file */
export type ImportDocxOptions = {
  /** RTF data for image extraction (optional) */
  rtf?: string;
};

// ============================================================================
// Export Types (Adapter Layer)
// ============================================================================

/** Options for exporting content to DOCX format */
export type DocxExportOptions = {
  /** HTML content to export (alternative to Plate nodes) */
  html?: string;
  /** Document margins in twips (1/20th of a point) */
  margins?: DocumentMargins;
  /** Page size preset or custom dimensions */
  pageSize?: PageSize;
  /** Page orientation */
  orientation?: 'portrait' | 'landscape';
  /** Default font settings for the document */
  defaultFont?: FontSettings;
  /** Track changes and comments options */
  tracking?: TrackingOptions;
  /** Header content (HTML string or configuration) */
  header?: HeaderFooterConfig;
  /** Footer content (HTML string or configuration) */
  footer?: HeaderFooterConfig;
};

/** Document margins in twips */
export type DocumentMargins = {
  /** Top margin in twips (default: 1440 = 1 inch) */
  top?: number;
  /** Right margin in twips (default: 1440 = 1 inch) */
  right?: number;
  /** Bottom margin in twips (default: 1440 = 1 inch) */
  bottom?: number;
  /** Left margin in twips (default: 1440 = 1 inch) */
  left?: number;
  /** Header distance from top edge in twips */
  header?: number;
  /** Footer distance from bottom edge in twips */
  footer?: number;
};

/** Page size preset names or custom dimensions */
export type PageSize =
  | 'letter' // 8.5" x 11" (US Letter)
  | 'a4' // 210mm x 297mm (ISO A4)
  | 'legal' // 8.5" x 14" (US Legal)
  | 'a3' // 297mm x 420mm (ISO A3)
  | 'a5' // 148mm x 210mm (ISO A5)
  | PageSizeCustom;

/** Custom page size dimensions */
export type PageSizeCustom = {
  /** Width in twips */
  width: number;
  /** Height in twips */
  height: number;
};

/** Font settings for default document font */
export type FontSettings = {
  /** Font family name (e.g., 'Calibri', 'Times New Roman') */
  family?: string;
  /** Font size in half-points (e.g., 24 = 12pt) */
  size?: number;
  /** Font color in hex format without # (e.g., '000000') */
  color?: string;
};

/** Track changes and comments options */
export type TrackingOptions = {
  /** Enable revision tracking in exported document */
  enableRevisions?: boolean;
  /** Enable comments in exported document */
  enableComments?: boolean;
  /** Default author name for new revisions/comments */
  defaultAuthor?: string;
  /** Default author initials for comments */
  defaultInitials?: string;
};

/** Header/Footer configuration */
export type HeaderFooterConfig = {
  /** HTML content for header/footer */
  content?: string;
  /** Whether to show on first page */
  showOnFirstPage?: boolean;
  /** Different content for first page */
  firstPageContent?: string;
  /** Different content for odd/even pages */
  oddEvenContent?: {
    odd: string;
    even: string;
  };
};

// ============================================================================
// Export Result Types
// ============================================================================

/** Result of exporting to DOCX */
export type ExportResult = {
  /** The generated DOCX file as a Blob */
  blob: Blob;
  /** Warnings encountered during export */
  warnings?: ExportWarning[];
  /** Statistics about the export */
  stats?: ExportStats;
};

/** Warning generated during export */
export type ExportWarning = {
  /** Type of warning */
  type: 'unsupported' | 'conversion' | 'validation' | 'deprecation';
  /** Human-readable warning message */
  message: string;
  /** Element or feature that triggered the warning */
  element?: string;
  /** Suggestion for resolution */
  suggestion?: string;
};

/** Statistics about the export process */
export type ExportStats = {
  /** Number of paragraphs exported */
  paragraphCount: number;
  /** Number of images exported */
  imageCount: number;
  /** Number of tables exported */
  tableCount: number;
  /** Number of list items exported */
  listItemCount: number;
  /** Number of hyperlinks exported */
  hyperlinkCount: number;
  /** Export duration in milliseconds */
  durationMs: number;
};

// ============================================================================
// Element Adapter Types
// ============================================================================

/** Base interface for element adapters */
export type ElementAdapter<TNode = unknown> = {
  /** Element type this adapter handles (e.g., 'paragraph', 'heading', 'list') */
  type: string;
  /** Priority for adapter selection (higher = checked first) */
  priority?: number;
  /** Check if this adapter can handle the given node */
  canHandle: (node: TNode) => boolean;
  /** Convert the node to DOCX elements */
  convert: (node: TNode, context: AdapterContext) => AdapterResult;
};

/** Context passed to element adapters */
export type AdapterContext = {
  /** Document being built */
  document: unknown; // DocXMLater Document
  /** Current list context for nested lists */
  listContext?: ListContext;
  /** Current table context for nested tables */
  tableContext?: TableContext;
  /** Options passed to the export function */
  options: DocxExportOptions;
  /** Registry of all available adapters */
  adapterRegistry: ElementAdapter[];
  /** Convert a child node using the appropriate adapter */
  convertChild: (node: unknown) => AdapterResult;
};

/** Result from an element adapter */
export type AdapterResult = {
  /** DOCX elements generated (Paragraph, Table, etc.) */
  elements: unknown[];
  /** Warnings generated during conversion */
  warnings?: ExportWarning[];
  /** Whether to skip processing children (adapter handled them) */
  skipChildren?: boolean;
};

/** Context for list processing */
export type ListContext = {
  /** Current list nesting level (0-indexed) */
  level: number;
  /** List type (bullet or numbered) */
  listType: 'bullet' | 'numbered';
  /** Numbering definition ID for this list */
  numberingId?: number;
  /** Parent list context for nested lists */
  parent?: ListContext;
};

/** Context for table processing */
export type TableContext = {
  /** Current row index */
  rowIndex: number;
  /** Current cell index */
  cellIndex: number;
  /** Total number of columns in the table */
  columnCount: number;
  /** Column widths in twips */
  columnWidths?: number[];
};
