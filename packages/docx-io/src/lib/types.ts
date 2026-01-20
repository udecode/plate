import type { TNode } from 'platejs';

// ============================================================================
// Basic Comment Type (from standard mammoth output)
// ============================================================================

/** Comment extracted from DOCX file (basic format from standard mammoth) */
export type DocxComment = {
  /** Comment ID from the DOCX file */
  id: string;
  /** Comment text content */
  text: string;
};

// ============================================================================
// Tracked Changes Types (from mammoth fork with tracked changes support)
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

/** Comment with full metadata from DOCX file (from mammoth fork) */
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

/** Result of importing a DOCX file */
export type ImportDocxResult = {
  /** Deserialized editor nodes */
  nodes: TNode[];
  /** Comments extracted from the DOCX file (not yet applied to editor) */
  comments: DocxComment[];
  /** Warnings from mammoth conversion */
  warnings: string[];
};

/** Extended result with tracked changes support */
export type ImportDocxWithTrackingResult = ImportDocxResult & {
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
};

/** Options for importing a DOCX file */
export type ImportDocxOptions = {
  /** RTF data for image extraction (optional) */
  rtf?: string;
};

/** Extended options with tracked changes support */
export type ImportDocxWithTrackingOptions = ImportDocxOptions & {
  /**
   * Whether to parse tracked changes tokens from mammoth output.
   * Requires a mammoth.js fork that emits tracked change tokens.
   * @default false
   */
  parseTrackedChanges?: boolean;
};
