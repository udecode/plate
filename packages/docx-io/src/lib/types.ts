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
