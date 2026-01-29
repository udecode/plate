/**
 * Tracking Bridge - Connects Plate's track changes and comments to docXMLater
 *
 * This module provides the bridge between Plate editor's suggestion/comment
 * system and the docXMLater library's RevisionManager and CommentManager.
 *
 * @module tracking-bridge
 */

import {
  RevisionManager,
  CommentManager,
  Revision,
  Comment,
  Run,
  type Document,
} from '../docXMLater/src';
import type { RevisionType } from '../docXMLater/src';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Options for initializing tracking features in document export
 */
export interface TrackingOptions {
  /** Enable track changes/revisions export */
  enableRevisions?: boolean;
  /** Enable comments export */
  enableComments?: boolean;
  /** Default author name for revisions without author info */
  defaultAuthor?: string;
  /** Default date for revisions without timestamp */
  defaultDate?: Date;
  /** Whether to auto-create managers if not present */
  autoCreateManagers?: boolean;
}

/**
 * Plate suggestion node structure (simplified)
 * Compatible with @udecode/plate-suggestion
 */
export interface PlateSuggestion {
  id: string;
  type: 'insert' | 'delete' | 'update';
  author?: string;
  createdAt?: string | number | Date;
  text?: string;
  children?: unknown[];
  /** Properties being changed (for update type) */
  properties?: Record<string, unknown>;
  /** Previous properties (for update type) */
  previousProperties?: Record<string, unknown>;
}

/**
 * Plate comment node structure (simplified)
 * Compatible with @udecode/plate-comments
 */
export interface PlateComment {
  id: string;
  authorId?: string;
  authorName?: string;
  createdAt?: string | number | Date;
  value?: unknown[];
  parentId?: string;
  isResolved?: boolean;
}

/**
 * Result of setting up tracking on a document
 */
export interface TrackingSetupResult {
  revisionManager: RevisionManager | null;
  commentManager: CommentManager | null;
  enabled: {
    revisions: boolean;
    comments: boolean;
  };
}

/**
 * Converted revision data ready for docXMLater
 */
export interface ConvertedRevision {
  type: RevisionType;
  author: string;
  date: Date;
  content?: string;
  originalId?: string;
  previousProperties?: Record<string, unknown>;
  newProperties?: Record<string, unknown>;
}

/**
 * Converted comment data ready for docXMLater
 */
export interface ConvertedComment {
  author: string;
  date: Date;
  content: string;
  parentId?: number;
  originalId?: string;
  initials?: string;
}

/**
 * Mapping from original Plate IDs to DOCX numeric IDs
 */
export interface IdMapping {
  /** Original Plate ID -> DOCX numeric ID */
  commentIds: Map<string, number>;
  /** Original Plate ID -> DOCX revision ID */
  revisionIds: Map<string, number>;
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Sets up tracking features (revisions and comments) for a document export
 *
 * @param doc - The docXMLater Document instance
 * @param options - Tracking configuration options
 * @returns Object containing managers and enabled status
 *
 * @example
 * ```typescript
 * const result = setupTracking(doc, {
 *   enableRevisions: true,
 *   enableComments: true,
 *   defaultAuthor: 'Unknown Author'
 * });
 *
 * if (result.revisionManager) {
 *   // Process suggestions...
 * }
 * ```
 */
export function setupTracking(
  doc: Document,
  options: TrackingOptions = {}
): TrackingSetupResult {
  const {
    enableRevisions = false,
    enableComments = false,
    autoCreateManagers = true,
  } = options;

  let revisionManager: RevisionManager | null = null;
  let commentManager: CommentManager | null = null;

  // Initialize RevisionManager from document
  if (enableRevisions) {
    // Try to get existing manager from document
    const existingRevisionManager = doc.getRevisionManager?.();
    if (existingRevisionManager) {
      revisionManager = existingRevisionManager;
    } else if (autoCreateManagers) {
      // Create new manager
      revisionManager = new RevisionManager();
      // Document may have a setRevisionManager method in some versions
      // Use a type-safe approach with 'as unknown as' pattern
      const docWithSetter = doc as unknown as {
        setRevisionManager?: (rm: RevisionManager) => void;
      };
      if (typeof docWithSetter.setRevisionManager === 'function') {
        docWithSetter.setRevisionManager(revisionManager);
      }
    }
  }

  // Initialize CommentManager from document
  if (enableComments) {
    // Try to get existing manager from document
    const existingCommentManager = doc.getCommentManager?.();
    if (existingCommentManager) {
      commentManager = existingCommentManager;
    } else if (autoCreateManagers) {
      // Create new manager
      commentManager = new CommentManager();
      // Document may have a setCommentManager method in some versions
      // Use a type-safe approach with 'as unknown as' pattern
      const docWithSetter = doc as unknown as {
        setCommentManager?: (cm: CommentManager) => void;
      };
      if (typeof docWithSetter.setCommentManager === 'function') {
        docWithSetter.setCommentManager(commentManager);
      }
    }
  }

  return {
    revisionManager,
    commentManager,
    enabled: {
      revisions: enableRevisions && revisionManager !== null,
      comments: enableComments && commentManager !== null,
    },
  };
}

/**
 * Converts a Plate suggestion to a DOCX revision
 *
 * Maps Plate's suggestion types to OOXML revision types:
 * - 'insert' -> RevisionType.Insert (w:ins)
 * - 'delete' -> RevisionType.Delete (w:del)
 * - 'update' -> RevisionType.RunPropertiesChange (w:rPrChange)
 *
 * @param suggestion - The Plate suggestion node
 * @param options - Optional tracking options for defaults
 * @returns Converted revision data or null if conversion fails
 *
 * @example
 * ```typescript
 * const revision = convertSuggestionToRevision(suggestion, {
 *   defaultAuthor: 'Anonymous'
 * });
 * ```
 */
export function convertSuggestionToRevision(
  suggestion: PlateSuggestion,
  options: TrackingOptions = {}
): ConvertedRevision | null {
  const { defaultAuthor = 'Unknown Author', defaultDate = new Date() } =
    options;

  // Map Plate suggestion type to OOXML revision type
  const typeMapping: Record<PlateSuggestion['type'], RevisionType> = {
    insert: 'insert',
    delete: 'delete',
    update: 'runPropertiesChange',
  };

  const revisionType = typeMapping[suggestion.type];

  if (!revisionType) {
    console.warn(
      `[tracking-bridge] Unknown suggestion type: ${suggestion.type}`
    );
    return null;
  }

  // Parse date from suggestion
  let date: Date;
  if (suggestion.createdAt) {
    date =
      suggestion.createdAt instanceof Date
        ? suggestion.createdAt
        : new Date(suggestion.createdAt);

    // Validate date
    if (isNaN(date.getTime())) {
      date = defaultDate;
    }
  } else {
    date = defaultDate;
  }

  // Extract content from children if not provided directly
  let content = suggestion.text;
  if (!content && suggestion.children) {
    content = extractTextFromNodes(suggestion.children);
  }

  return {
    type: revisionType,
    author: suggestion.author || defaultAuthor,
    date,
    content,
    originalId: suggestion.id,
    previousProperties: suggestion.previousProperties,
    newProperties: suggestion.properties,
  };
}

/**
 * Converts a Plate comment to a DOCX comment
 *
 * Creates the data structure needed for docXMLater's CommentManager
 *
 * @param comment - The Plate comment data
 * @param options - Optional tracking options for defaults
 * @param idMapping - Optional ID mapping for parent comment resolution
 * @returns Converted comment data or null if conversion fails
 *
 * @example
 * ```typescript
 * const docxComment = convertCommentToDocx(plateComment, {
 *   defaultAuthor: 'Anonymous'
 * });
 * ```
 */
export function convertCommentToDocx(
  comment: PlateComment,
  options: TrackingOptions = {},
  idMapping?: IdMapping
): ConvertedComment | null {
  const { defaultAuthor = 'Unknown Author', defaultDate = new Date() } =
    options;

  // Extract text content from comment value
  const content = extractCommentText(comment.value);

  if (!content) {
    console.warn(
      `[tracking-bridge] Empty comment content for comment ${comment.id}`
    );
    return null;
  }

  // Parse date from comment
  let date: Date;
  if (comment.createdAt) {
    date =
      comment.createdAt instanceof Date
        ? comment.createdAt
        : new Date(comment.createdAt);

    // Validate date
    if (isNaN(date.getTime())) {
      date = defaultDate;
    }
  } else {
    date = defaultDate;
  }

  // Map parent comment ID if this is a reply
  let parentId: number | undefined;
  if (comment.parentId && idMapping) {
    parentId = idMapping.commentIds.get(comment.parentId);
  }

  // Generate initials from author name
  const authorName = comment.authorName || defaultAuthor;
  const initials = generateInitials(authorName);

  return {
    author: authorName,
    date,
    content,
    originalId: comment.id,
    parentId,
    initials,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extracts plain text from Plate node array structure
 *
 * @param nodes - Array of Plate nodes
 * @returns Plain text content
 */
function extractTextFromNodes(nodes: unknown[]): string {
  if (!nodes || !Array.isArray(nodes)) {
    return '';
  }

  return nodes
    .map((node) => {
      if (typeof node === 'string') return node;
      if (node && typeof node === 'object') {
        const nodeObj = node as Record<string, unknown>;
        if (typeof nodeObj.text === 'string') return nodeObj.text;
        if (Array.isArray(nodeObj.children)) {
          return extractTextFromNodes(nodeObj.children);
        }
      }
      return '';
    })
    .join('');
}

/**
 * Extracts plain text from Plate comment value structure
 *
 * @param value - The comment value (Plate node array)
 * @returns Plain text content
 */
function extractCommentText(value: unknown[] | undefined): string {
  if (!value || !Array.isArray(value)) {
    return '';
  }

  return extractTextFromNodes(value);
}

/**
 * Generates initials from an author name
 *
 * @param authorName - Full author name
 * @returns Initials (e.g., "John Doe" -> "JD")
 */
function generateInitials(authorName: string): string {
  const words = authorName
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  if (words.length === 0) return 'U';
  if (words.length === 1) {
    const firstWord = words[0];
    return firstWord ? firstWord.substring(0, 2).toUpperCase() : 'U';
  }
  return words
    .map((word) => (word[0] || '').toUpperCase())
    .join('')
    .substring(0, 3);
}

/**
 * Creates a revision using RevisionManager
 *
 * @param manager - The RevisionManager instance
 * @param data - Converted revision data
 * @returns The created Revision or null
 */
export function createRevision(
  manager: RevisionManager,
  data: ConvertedRevision
): Revision | null {
  try {
    // Create Run with content if available
    const content = data.content ? [new Run(data.content)] : [];

    // Create revision with proper properties
    const revision = new Revision({
      type: data.type,
      author: data.author,
      date: data.date,
      content,
      previousProperties: data.previousProperties,
      newProperties: data.newProperties,
    });

    // Register with manager (assigns unique ID)
    return manager.register(revision);
  } catch (error) {
    console.error('[tracking-bridge] Failed to create revision:', error);
    return null;
  }
}

/**
 * Creates a comment using CommentManager
 *
 * @param manager - The CommentManager instance
 * @param data - Converted comment data
 * @returns The created Comment or null
 */
export function createComment(
  manager: CommentManager,
  data: ConvertedComment
): Comment | null {
  try {
    // Create comment with proper properties
    const comment = new Comment({
      author: data.author,
      date: data.date,
      content: data.content,
      parentId: data.parentId,
      initials: data.initials,
    });

    // Register with manager (assigns unique ID)
    return manager.register(comment);
  } catch (error) {
    console.error('[tracking-bridge] Failed to create comment:', error);
    return null;
  }
}

/**
 * Processes all suggestions from Plate content and adds them to RevisionManager
 *
 * @param manager - The RevisionManager instance
 * @param suggestions - Array of Plate suggestions
 * @param options - Tracking options
 * @returns Object with created revisions and ID mapping
 */
export function processSuggestions(
  manager: RevisionManager,
  suggestions: PlateSuggestion[],
  options: TrackingOptions = {}
): { revisions: Revision[]; idMapping: Map<string, number> } {
  const revisions: Revision[] = [];
  const idMapping = new Map<string, number>();

  for (const suggestion of suggestions) {
    const converted = convertSuggestionToRevision(suggestion, options);
    if (converted) {
      const revision = createRevision(manager, converted);
      if (revision) {
        revisions.push(revision);
        // Store ID mapping
        if (converted.originalId) {
          idMapping.set(converted.originalId, revision.getId());
        }
      }
    }
  }

  return { revisions, idMapping };
}

/**
 * Processes all comments from Plate content and adds them to CommentManager
 *
 * @param manager - The CommentManager instance
 * @param comments - Array of Plate comments
 * @param options - Tracking options
 * @returns Object with created comments and ID mapping
 */
export function processComments(
  manager: CommentManager,
  comments: PlateComment[],
  options: TrackingOptions = {}
): { comments: Comment[]; idMapping: Map<string, number> } {
  const createdComments: Comment[] = [];
  const idMapping: IdMapping = {
    commentIds: new Map<string, number>(),
    revisionIds: new Map<string, number>(),
  };

  // Sort comments to process parent comments before replies
  const sortedComments = [...comments].sort((a, b) => {
    if (a.parentId && !b.parentId) return 1;
    if (!a.parentId && b.parentId) return -1;
    return 0;
  });

  for (const comment of sortedComments) {
    const converted = convertCommentToDocx(comment, options, idMapping);
    if (converted) {
      const created = createComment(manager, converted);
      if (created) {
        createdComments.push(created);
        // Store ID mapping for reply resolution
        if (converted.originalId) {
          idMapping.commentIds.set(converted.originalId, created.getId());
        }
      }
    }
  }

  // Link replies to their parents
  manager.linkReplies();

  return { comments: createdComments, idMapping: idMapping.commentIds };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Creates an ID mapping object for tracking original Plate IDs
 *
 * @returns Empty ID mapping object
 */
export function createIdMapping(): IdMapping {
  return {
    commentIds: new Map<string, number>(),
    revisionIds: new Map<string, number>(),
  };
}

/**
 * Gets the DOCX ID for an original Plate ID
 *
 * @param mapping - ID mapping object
 * @param type - Type of ID ('comment' or 'revision')
 * @param originalId - Original Plate ID
 * @returns DOCX numeric ID or undefined if not found
 */
export function getDocxId(
  mapping: IdMapping,
  type: 'comment' | 'revision',
  originalId: string
): number | undefined {
  if (type === 'comment') {
    return mapping.commentIds.get(originalId);
  }
  return mapping.revisionIds.get(originalId);
}

/**
 * Validates tracking options and fills in defaults
 *
 * @param options - Partial tracking options
 * @returns Complete tracking options with defaults
 */
export function normalizeTrackingOptions(
  options: Partial<TrackingOptions> = {}
): Required<TrackingOptions> {
  return {
    enableRevisions: options.enableRevisions ?? false,
    enableComments: options.enableComments ?? false,
    defaultAuthor: options.defaultAuthor ?? 'Unknown Author',
    defaultDate: options.defaultDate ?? new Date(),
    autoCreateManagers: options.autoCreateManagers ?? true,
  };
}

// ============================================================================
// Comment Mark Detection (T082)
// ============================================================================

/**
 * Pattern for Plate comment marks in class names
 * Matches patterns like "comment_abc123" or "slate-comment_xyz"
 */
export const COMMENT_MARK_PATTERN = /comment_([a-zA-Z0-9_-]+)/;

/**
 * Data attribute for comment ID (used in Plate HTML serialization)
 */
export const COMMENT_ID_ATTR = 'data-comment-id';

/**
 * Alternative data attribute for comment ID (used in some HTML outputs)
 */
export const COMMENT_ID_ATTR_ALT = 'data-slate-comment';

/**
 * Detects if an HTML element has a comment mark
 *
 * Checks for:
 * 1. data-comment-id attribute
 * 2. data-slate-comment attribute
 * 3. Class names containing "comment_" pattern
 *
 * @param element - The DOM element to check
 * @returns True if the element has a comment mark
 *
 * @example
 * ```typescript
 * // Element with data attribute
 * // <span data-comment-id="abc123">Text</span>
 * isCommentMarked(element) // true
 *
 * // Element with class
 * // <span class="slate-comment_abc123">Text</span>
 * isCommentMarked(element) // true
 * ```
 */
export function isCommentMarked(element: Element): boolean {
  // Check data attributes
  if (element.hasAttribute(COMMENT_ID_ATTR)) return true;
  if (element.hasAttribute(COMMENT_ID_ATTR_ALT)) return true;

  // Check class names for comment_ pattern
  const className = element.className || '';
  if (typeof className === 'string' && COMMENT_MARK_PATTERN.test(className)) {
    return true;
  }

  // Check classList if available (for SVGAnimatedString className)
  if (element.classList) {
    for (const cls of Array.from(element.classList)) {
      if (COMMENT_MARK_PATTERN.test(cls)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Extracts comment ID from a marked element
 *
 * Checks multiple sources in order of priority:
 * 1. data-comment-id attribute
 * 2. data-slate-comment attribute
 * 3. Class name with comment_ pattern
 *
 * @param element - The DOM element to extract ID from
 * @returns The comment ID or null if not found
 *
 * @example
 * ```typescript
 * // Element with data attribute
 * // <span data-comment-id="abc123">Text</span>
 * extractCommentId(element) // "abc123"
 *
 * // Element with class
 * // <span class="comment_xyz789">Text</span>
 * extractCommentId(element) // "xyz789"
 * ```
 */
export function extractCommentId(element: Element): string | null {
  // Try data-comment-id attribute first
  const dataId = element.getAttribute(COMMENT_ID_ATTR);
  if (dataId) return dataId;

  // Try alternative data attribute
  const dataIdAlt = element.getAttribute(COMMENT_ID_ATTR_ALT);
  if (dataIdAlt) return dataIdAlt;

  // Try class name pattern
  const className = element.className;
  if (typeof className === 'string') {
    const match = className.match(COMMENT_MARK_PATTERN);
    if (match) return match[1];
  }

  // Check classList if className is not a simple string (e.g., SVGAnimatedString)
  if (element.classList) {
    for (const cls of Array.from(element.classList)) {
      const match = cls.match(COMMENT_MARK_PATTERN);
      if (match) return match[1];
    }
  }

  return null;
}

/**
 * Extracts all comment IDs from an element (handles overlapping comments)
 *
 * Some elements may be marked with multiple comment IDs when comment ranges
 * overlap. This function extracts all of them.
 *
 * @param element - The DOM element to extract IDs from
 * @returns Array of comment IDs (may be empty)
 *
 * @example
 * ```typescript
 * // Element with multiple comment marks
 * // <span class="comment_abc comment_xyz" data-comment-id="def">Text</span>
 * extractAllCommentIds(element) // ["def", "abc", "xyz"]
 * ```
 */
export function extractAllCommentIds(element: Element): string[] {
  const ids: Set<string> = new Set();

  // Check data attributes
  const dataId = element.getAttribute(COMMENT_ID_ATTR);
  if (dataId) ids.add(dataId);

  const dataIdAlt = element.getAttribute(COMMENT_ID_ATTR_ALT);
  if (dataIdAlt) ids.add(dataIdAlt);

  // Check all class names
  const className = element.className;
  if (typeof className === 'string') {
    const regex = new RegExp(COMMENT_MARK_PATTERN.source, 'g');
    let match;
    while ((match = regex.exec(className)) !== null) {
      ids.add(match[1]);
    }
  }

  // Check classList
  if (element.classList) {
    for (const cls of Array.from(element.classList)) {
      const match = cls.match(COMMENT_MARK_PATTERN);
      if (match) ids.add(match[1]);
    }
  }

  return Array.from(ids);
}

// ============================================================================
// Comment Range Generation (T083)
// ============================================================================

/**
 * Represents a comment range in the document
 */
export interface CommentRange {
  /** The DOCX numeric comment ID */
  commentId: number;
  /** The original Plate comment ID */
  originalId: string;
  /** Whether the range start has been emitted */
  startEmitted: boolean;
  /** Whether the range end has been emitted */
  endEmitted: boolean;
}

/**
 * Represents XML elements for comment range markers
 */
export interface CommentRangeXml {
  /** w:commentRangeStart element */
  rangeStart: {
    name: string;
    attributes: { 'w:id': string };
    selfClosing: true;
  };
  /** w:commentRangeEnd element */
  rangeEnd: {
    name: string;
    attributes: { 'w:id': string };
    selfClosing: true;
  };
  /** w:commentReference element (inside a w:r) */
  reference: {
    name: string;
    children: [
      {
        name: string;
        attributes: { 'w:id': string };
        selfClosing: true;
      },
    ];
  };
}

/**
 * Creates comment range markers for a comment
 *
 * Generates the OOXML elements needed to mark a comment range in the document:
 * - w:commentRangeStart - placed at the start of the commented text
 * - w:commentRangeEnd - placed at the end of the commented text
 * - w:commentReference - placed after the range end, inside a w:r element
 *
 * Per ECMA-376 Part 1, Section 17.13.4.2:
 * - commentRangeStart and commentRangeEnd mark the range of text
 * - commentReference creates a visual anchor for the comment
 *
 * @param commentId - The DOCX numeric comment ID
 * @returns Object containing all three XML element structures
 *
 * @example
 * ```typescript
 * const markers = createCommentRangeMarkers(5);
 * // markers.rangeStart -> <w:commentRangeStart w:id="5"/>
 * // markers.rangeEnd -> <w:commentRangeEnd w:id="5"/>
 * // markers.reference -> <w:r><w:commentReference w:id="5"/></w:r>
 * ```
 */
export function createCommentRangeMarkers(commentId: number): CommentRangeXml {
  const idString = commentId.toString();

  return {
    rangeStart: {
      name: 'w:commentRangeStart',
      attributes: { 'w:id': idString },
      selfClosing: true,
    },
    rangeEnd: {
      name: 'w:commentRangeEnd',
      attributes: { 'w:id': idString },
      selfClosing: true,
    },
    reference: {
      name: 'w:r',
      children: [
        {
          name: 'w:commentReference',
          attributes: { 'w:id': idString },
          selfClosing: true,
        },
      ],
    },
  };
}

/**
 * Creates comment range markers using CommentManager for a registered comment
 *
 * This function uses the Comment instance's built-in XML generation methods
 * which are compatible with docXMLater's XMLElement format.
 *
 * @param comment - The registered Comment instance
 * @returns Object containing XMLElement structures from docXMLater
 *
 * @example
 * ```typescript
 * const comment = manager.createComment('Author', 'Content');
 * const markers = createCommentRangeFromComment(comment);
 * // Use markers.rangeStart.toXML() etc. in document generation
 * ```
 */
export function createCommentRangeFromComment(comment: Comment): {
  rangeStart: ReturnType<Comment['toRangeStartXML']>;
  rangeEnd: ReturnType<Comment['toRangeEndXML']>;
  reference: ReturnType<Comment['toReferenceXML']>;
} {
  return {
    rangeStart: comment.toRangeStartXML(),
    rangeEnd: comment.toRangeEndXML(),
    reference: comment.toReferenceXML(),
  };
}

/**
 * Tracks active comment ranges during document traversal
 */
export class CommentRangeTracker {
  /** Map of original Plate ID to CommentRange */
  private activeRanges: Map<string, CommentRange> = new Map();

  /** Map of original Plate ID to DOCX numeric ID */
  private idMapping: Map<string, number> = new Map();

  /**
   * Registers a comment and returns its numeric ID
   *
   * @param originalId - The original Plate comment ID
   * @param docxId - The DOCX numeric ID assigned by CommentManager
   */
  registerComment(originalId: string, docxId: number): void {
    this.idMapping.set(originalId, docxId);
  }

  /**
   * Starts tracking a comment range
   *
   * @param originalId - The original Plate comment ID
   * @returns The CommentRange object or null if ID not registered
   */
  startRange(originalId: string): CommentRange | null {
    const docxId = this.idMapping.get(originalId);
    if (docxId === undefined) {
      console.warn(`[CommentRangeTracker] Unknown comment ID: ${originalId}`);
      return null;
    }

    let range = this.activeRanges.get(originalId);
    if (!range) {
      range = {
        commentId: docxId,
        originalId,
        startEmitted: false,
        endEmitted: false,
      };
      this.activeRanges.set(originalId, range);
    }

    return range;
  }

  /**
   * Gets an active range by original ID
   *
   * @param originalId - The original Plate comment ID
   * @returns The CommentRange or undefined
   */
  getRange(originalId: string): CommentRange | undefined {
    return this.activeRanges.get(originalId);
  }

  /**
   * Gets the DOCX ID for an original Plate ID
   *
   * @param originalId - The original Plate comment ID
   * @returns The DOCX numeric ID or undefined
   */
  getDocxId(originalId: string): number | undefined {
    return this.idMapping.get(originalId);
  }

  /**
   * Marks a range start as emitted
   *
   * @param originalId - The original Plate comment ID
   */
  markStartEmitted(originalId: string): void {
    const range = this.activeRanges.get(originalId);
    if (range) {
      range.startEmitted = true;
    }
  }

  /**
   * Marks a range end as emitted
   *
   * @param originalId - The original Plate comment ID
   */
  markEndEmitted(originalId: string): void {
    const range = this.activeRanges.get(originalId);
    if (range) {
      range.endEmitted = true;
    }
  }

  /**
   * Gets all ranges that need their start marker emitted
   *
   * @returns Array of CommentRange objects needing start markers
   */
  getPendingStarts(): CommentRange[] {
    return Array.from(this.activeRanges.values()).filter(
      (range) => !range.startEmitted
    );
  }

  /**
   * Gets all ranges that have started but not ended
   *
   * @returns Array of CommentRange objects needing end markers
   */
  getPendingEnds(): CommentRange[] {
    return Array.from(this.activeRanges.values()).filter(
      (range) => range.startEmitted && !range.endEmitted
    );
  }

  /**
   * Ends a range and removes it from tracking
   *
   * @param originalId - The original Plate comment ID
   */
  endRange(originalId: string): void {
    this.activeRanges.delete(originalId);
  }

  /**
   * Clears all tracking state
   */
  clear(): void {
    this.activeRanges.clear();
    this.idMapping.clear();
  }

  /**
   * Gets the ID mapping for external use
   *
   * @returns Map of original Plate IDs to DOCX numeric IDs
   */
  getIdMapping(): Map<string, number> {
    return new Map(this.idMapping);
  }
}

// ============================================================================
// Comments.xml Generation (T084)
// ============================================================================

/**
 * Generates comments.xml content through CommentManager
 *
 * This function wraps the CommentManager's generateCommentsXml method
 * to provide a consistent interface with the tracking bridge.
 *
 * @param manager - The CommentManager instance with registered comments
 * @returns XML string for word/comments.xml
 *
 * @example
 * ```typescript
 * const manager = new CommentManager();
 * manager.createComment('Author', 'This is a comment');
 * const xml = generateCommentsXml(manager);
 * // Returns complete word/comments.xml content
 * ```
 */
export function generateCommentsXml(manager: CommentManager): string {
  return manager.generateCommentsXml();
}

/**
 * Result of processing comments including XML and metadata
 */
export interface CommentProcessingResult {
  /** Generated comments.xml content */
  commentsXml: string;
  /** Array of created Comment instances */
  comments: Comment[];
  /** Mapping from original Plate IDs to DOCX numeric IDs */
  idMapping: Map<string, number>;
  /** Comment range tracker for document generation */
  rangeTracker: CommentRangeTracker;
  /** Statistics about processed comments */
  stats: {
    total: number;
    topLevel: number;
    replies: number;
    authors: string[];
  };
}

/**
 * Processes all comments and generates complete output
 *
 * This function combines multiple operations:
 * 1. Registers all comments with CommentManager
 * 2. Links reply comments to their parents
 * 3. Generates comments.xml content
 * 4. Creates a CommentRangeTracker for document generation
 *
 * @param manager - The CommentManager instance
 * @param comments - Array of Plate comments to process
 * @param options - Tracking options for defaults
 * @returns Complete processing result with XML and metadata
 *
 * @example
 * ```typescript
 * const manager = new CommentManager();
 * const plateComments = [
 *   { id: 'abc', authorName: 'Author', value: [{ text: 'Comment' }] },
 *   { id: 'xyz', authorName: 'Author', value: [{ text: 'Reply' }], parentId: 'abc' }
 * ];
 *
 * const result = processCommentsWithXml(manager, plateComments);
 * // result.commentsXml - complete XML for word/comments.xml
 * // result.rangeTracker - use during document generation
 * ```
 */
export function processCommentsWithXml(
  manager: CommentManager,
  comments: PlateComment[],
  options: TrackingOptions = {}
): CommentProcessingResult {
  // Process comments using existing function
  const { comments: createdComments, idMapping } = processComments(
    manager,
    comments,
    options
  );

  // Create range tracker and register all comments
  const rangeTracker = new CommentRangeTracker();
  Array.from(idMapping.entries()).forEach(([originalId, docxId]) => {
    rangeTracker.registerComment(originalId, docxId);
  });

  // Generate XML
  const commentsXml = generateCommentsXml(manager);

  // Get statistics
  const stats = manager.getStats();

  return {
    commentsXml,
    comments: createdComments,
    idMapping,
    rangeTracker,
    stats: {
      total: stats.total,
      topLevel: stats.topLevel,
      replies: stats.replies,
      authors: stats.authors,
    },
  };
}

// ============================================================================
// Suggestion Mark Detection (T086)
// ============================================================================

/** Pattern for Plate suggestion marks (matches suggestion_{userId}) */
export const SUGGESTION_MARK_PATTERN = /^suggestion_(.+)$/;

/** Whitespace splitting pattern for class names */
const WHITESPACE_SPLIT_PATTERN = /\s+/;

/** Data attributes for suggestions in HTML elements */
export const SUGGESTION_ID_ATTR = 'data-suggestion-id';
export const SUGGESTION_USER_ATTR = 'data-suggestion-user';
export const SUGGESTION_TYPE_ATTR = 'data-suggestion-type';
export const SUGGESTION_CREATED_AT_ATTR = 'data-suggestion-created-at';

/**
 * Suggestion mark metadata extracted from HTML elements
 */
export interface SuggestionMark {
  /** Unique suggestion ID */
  suggestionId: string;
  /** User ID who created the suggestion */
  userId?: string;
  /** Type of suggestion operation */
  type: 'insert' | 'delete' | 'update';
  /** Date when suggestion was created */
  createdAt?: Date;
}

/**
 * Detects if an HTML element has a suggestion mark
 *
 * Checks for:
 * 1. data-suggestion-id attribute
 * 2. Class name matching suggestion_{userId} pattern
 *
 * @param element - HTML element to check
 * @returns True if element has a suggestion mark
 *
 * @example
 * ```typescript
 * // Element with data attribute
 * // <span data-suggestion-id="abc123">text</span>
 * isSuggestionMarked(element) // => true
 *
 * // Element with class name
 * // <span class="suggestion_user1">text</span>
 * isSuggestionMarked(element) // => true
 * ```
 */
export function isSuggestionMarked(element: Element): boolean {
  // Check for explicit suggestion ID attribute
  if (element.hasAttribute(SUGGESTION_ID_ATTR)) {
    return true;
  }

  // Check class names for suggestion pattern
  const className = element.getAttribute('class') || '';
  const classNames = className.split(WHITESPACE_SPLIT_PATTERN);

  for (const cls of classNames) {
    if (SUGGESTION_MARK_PATTERN.test(cls)) {
      return true;
    }
  }

  return false;
}

/**
 * Extracts suggestion metadata from a marked HTML element
 *
 * Parses suggestion information from data attributes or class names.
 * Returns null if the element is not properly marked.
 *
 * @param element - HTML element with suggestion marks
 * @returns Suggestion metadata or null if not a valid suggestion
 *
 * @example
 * ```typescript
 * // <span data-suggestion-id="abc123" data-suggestion-type="insert" data-suggestion-user="user1">
 * const mark = extractSuggestionMark(element);
 * // => { suggestionId: 'abc123', type: 'insert', userId: 'user1' }
 * ```
 */
export function extractSuggestionMark(element: Element): SuggestionMark | null {
  // Try to get suggestion ID from data attribute first
  let suggestionId = element.getAttribute(SUGGESTION_ID_ATTR);
  let userId: string | undefined;

  // If no data attribute, try to extract from class name
  if (!suggestionId) {
    const className = element.getAttribute('class') || '';
    const classNames = className.split(WHITESPACE_SPLIT_PATTERN);

    for (const cls of classNames) {
      const match = SUGGESTION_MARK_PATTERN.exec(cls);
      if (match) {
        // The full class name is the suggestionId, extract userId from it
        suggestionId = cls;
        userId = match[1];
        break;
      }
    }
  }

  if (!suggestionId) {
    return null;
  }

  // Get user ID from data attribute if not extracted from class
  if (!userId) {
    userId = element.getAttribute(SUGGESTION_USER_ATTR) || undefined;
  }

  // Get suggestion type (default to 'insert')
  const typeAttr = element.getAttribute(SUGGESTION_TYPE_ATTR);
  let type: SuggestionMark['type'] = 'insert';
  if (typeAttr === 'delete' || typeAttr === 'update') {
    type = typeAttr;
  }

  // Get creation date
  let createdAt: Date | undefined;
  const createdAtAttr = element.getAttribute(SUGGESTION_CREATED_AT_ATTR);
  if (createdAtAttr) {
    const parsedDate = new Date(createdAtAttr);
    if (!isNaN(parsedDate.getTime())) {
      createdAt = parsedDate;
    }
  }

  return {
    suggestionId,
    userId,
    type,
    createdAt,
  };
}

// ============================================================================
// Insertion Handler (T087)
// ============================================================================

/**
 * Creates an insertion revision wrapper (w:ins element)
 *
 * Wraps content in a tracked insertion revision that will render
 * as tracked changes in Word.
 *
 * @param content - Run or array of Runs to wrap
 * @param author - Author who made the insertion
 * @param date - Date of the insertion
 * @param manager - RevisionManager for ID assignment
 * @returns The created Revision registered with the manager
 *
 * @example
 * ```typescript
 * const run = new Run('inserted text');
 * const revision = createInsertionRevision(run, 'John Doe', new Date(), manager);
 * // Creates: <w:ins w:id="1" w:author="John Doe" w:date="..."><w:r>...</w:r></w:ins>
 * ```
 */
export function createInsertionRevision(
  content: Run | Run[],
  author: string,
  date: Date,
  manager: RevisionManager
): Revision {
  const runs = Array.isArray(content) ? content : [content];

  const revision = new Revision({
    type: 'insert',
    author,
    date,
    content: runs,
  });

  return manager.register(revision);
}

// ============================================================================
// Deletion Handler (T088)
// ============================================================================

/**
 * Creates a deletion revision wrapper (w:del element)
 *
 * Wraps content in a tracked deletion revision. The content will be
 * serialized with w:delText elements instead of w:t for proper rendering.
 *
 * @param content - Run or array of Runs to wrap
 * @param author - Author who made the deletion
 * @param date - Date of the deletion
 * @param manager - RevisionManager for ID assignment
 * @returns The created Revision registered with the manager
 *
 * @example
 * ```typescript
 * const run = new Run('deleted text');
 * const revision = createDeletionRevision(run, 'Jane Doe', new Date(), manager);
 * // Creates: <w:del w:id="1" w:author="Jane Doe" w:date="...">
 * //            <w:r><w:delText>deleted text</w:delText></w:r>
 * //          </w:del>
 * ```
 */
export function createDeletionRevision(
  content: Run | Run[],
  author: string,
  date: Date,
  manager: RevisionManager
): Revision {
  const runs = Array.isArray(content) ? content : [content];

  const revision = new Revision({
    type: 'delete',
    author,
    date,
    content: runs,
  });

  return manager.register(revision);
}

// ============================================================================
// Block-Level Suggestion Handling (T089)
// ============================================================================

/**
 * Block-level suggestion information
 */
export interface BlockSuggestionInfo {
  /** Whether the entire block is a suggestion */
  isBlockSuggestion: boolean;
  /** Type of block suggestion */
  type?: 'insert' | 'delete' | 'update';
  /** Author of the suggestion */
  author?: string;
  /** Date of the suggestion */
  date?: Date;
  /** Previous paragraph properties (for update type) */
  previousProperties?: Record<string, unknown>;
}

/**
 * Extended Paragraph interface for handling block-level suggestions
 * This is used for type-safe access to paragraph methods
 */
interface ParagraphWithMethods {
  getContent(): unknown[];
  addContent?(element: unknown): void;
}

/**
 * Result of block suggestion handling
 */
export interface BlockSuggestionResult {
  /** The original paragraph (modified or unmodified) */
  paragraph: unknown;
  /** The revision created (if any) */
  revision?: Revision;
  /** Whether this was processed as a block insertion */
  isBlockInsertion?: boolean;
  /** Whether this was processed as a block deletion */
  isBlockDeletion?: boolean;
  /** Whether this was processed as a block update */
  isBlockUpdate?: boolean;
  /** Property change revision for updates */
  propertyChangeRevision?: Revision;
}

/**
 * Handles block-level suggestions that span entire paragraphs
 *
 * For block-level suggestions, this function:
 * - Wraps paragraph content in appropriate revision elements
 * - Handles paragraph property changes (w:pPrChange)
 * - Supports insert/delete/update operations on entire blocks
 *
 * @param paragraph - The Paragraph to process
 * @param suggestion - Plate suggestion data
 * @param manager - RevisionManager for tracking
 * @returns Result containing modified paragraph and revision info
 *
 * @example
 * ```typescript
 * const suggestion: PlateSuggestion = {
 *   id: 'suggestion1',
 *   type: 'insert',
 *   author: 'John',
 *   createdAt: new Date()
 * };
 * const result = handleBlockSuggestion(paragraph, suggestion, manager);
 * ```
 */
export function handleBlockSuggestion(
  paragraph: unknown,
  suggestion: PlateSuggestion,
  manager: RevisionManager
): BlockSuggestionResult {
  // Type guard for paragraph with methods
  const para = paragraph as ParagraphWithMethods;
  if (typeof para.getContent !== 'function') {
    console.warn('[tracking-bridge] Invalid paragraph object');
    return { paragraph };
  }

  const author = suggestion.author || 'Unknown Author';
  const date =
    suggestion.createdAt instanceof Date
      ? suggestion.createdAt
      : suggestion.createdAt
        ? new Date(suggestion.createdAt)
        : new Date();

  // Validate date
  const validDate = isNaN(date.getTime()) ? new Date() : date;

  switch (suggestion.type) {
    case 'insert': {
      // Wrap all paragraph content in an insertion revision
      const content = para.getContent();
      const runs = content.filter((item): item is Run => item instanceof Run);

      if (runs.length > 0) {
        const revision = createInsertionRevision(
          runs,
          author,
          validDate,
          manager
        );
        return {
          paragraph,
          revision,
          isBlockInsertion: true,
        };
      }
      break;
    }

    case 'delete': {
      // Wrap all paragraph content in a deletion revision
      const content = para.getContent();
      const runs = content.filter((item): item is Run => item instanceof Run);

      if (runs.length > 0) {
        const revision = createDeletionRevision(
          runs,
          author,
          validDate,
          manager
        );
        return {
          paragraph,
          revision,
          isBlockDeletion: true,
        };
      }
      break;
    }

    case 'update': {
      // Create paragraph property change revision (w:pPrChange)
      if (suggestion.previousProperties) {
        const revision = new Revision({
          type: 'paragraphPropertiesChange',
          author,
          date: validDate,
          content: [],
          previousProperties: suggestion.previousProperties as Record<
            string,
            unknown
          >,
          newProperties: suggestion.properties as Record<string, unknown>,
        });

        manager.register(revision);
        return {
          paragraph,
          propertyChangeRevision: revision,
          isBlockUpdate: true,
        };
      }
      break;
    }
  }

  return { paragraph };
}

/**
 * Detects if a suggestion applies to an entire block/paragraph
 *
 * @param suggestion - Plate suggestion to analyze
 * @returns Block suggestion information
 */
export function detectBlockSuggestion(
  suggestion: PlateSuggestion
): BlockSuggestionInfo {
  // A suggestion is block-level if it has previousProperties or properties
  // This indicates a paragraph property change rather than inline content change
  const hasPropertyChanges = !!(
    suggestion.previousProperties || suggestion.properties
  );

  // Also consider suggestions without text content as potentially block-level
  const hasNoInlineContent =
    !suggestion.text &&
    (!suggestion.children || suggestion.children.length === 0);

  return {
    isBlockSuggestion:
      hasPropertyChanges ||
      (hasNoInlineContent && suggestion.type !== 'insert'),
    type: suggestion.type,
    author: suggestion.author,
    date:
      suggestion.createdAt instanceof Date
        ? suggestion.createdAt
        : suggestion.createdAt
          ? new Date(suggestion.createdAt)
          : undefined,
    previousProperties: suggestion.previousProperties,
  };
}

// ============================================================================
// Author/Date Extraction (T090)
// ============================================================================

/**
 * Extracts author information from a suggestion mark
 *
 * Priority order:
 * 1. data-suggestion-user attribute
 * 2. User ID extracted from class name pattern
 * 3. Default author from options
 *
 * @param element - HTML element with suggestion marks
 * @param options - Tracking options with default author
 * @returns Author name/ID
 *
 * @example
 * ```typescript
 * // <span data-suggestion-user="john.doe">text</span>
 * extractAuthorFromMark(element, options) // => 'john.doe'
 * ```
 */
export function extractAuthorFromMark(
  element: Element,
  options: TrackingOptions = {}
): string {
  const defaultAuthor = options.defaultAuthor || 'Unknown Author';

  // Try data attribute first
  const userAttr = element.getAttribute(SUGGESTION_USER_ATTR);
  if (userAttr) {
    return userAttr;
  }

  // Try to extract from class name
  const className = element.getAttribute('class') || '';
  const classNames = className.split(WHITESPACE_SPLIT_PATTERN);

  for (const cls of classNames) {
    const match = SUGGESTION_MARK_PATTERN.exec(cls);
    if (match && match[1]) {
      return match[1];
    }
  }

  return defaultAuthor;
}

/**
 * Extracts and validates date from a suggestion mark
 *
 * Priority order:
 * 1. data-suggestion-created-at attribute
 * 2. Default date from options
 *
 * @param element - HTML element with suggestion marks
 * @param options - Tracking options with default date
 * @returns Validated Date object
 *
 * @example
 * ```typescript
 * // <span data-suggestion-created-at="2024-01-15T10:30:00Z">text</span>
 * extractDateFromMark(element, options) // => Date('2024-01-15T10:30:00Z')
 * ```
 */
export function extractDateFromMark(
  element: Element,
  options: TrackingOptions = {}
): Date {
  const defaultDate = options.defaultDate || new Date();

  const createdAtAttr = element.getAttribute(SUGGESTION_CREATED_AT_ATTR);

  if (createdAtAttr) {
    const parsedDate = new Date(createdAtAttr);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }

  return defaultDate;
}

/**
 * Parses author/date from a Plate suggestion object
 *
 * @param suggestion - Plate suggestion data
 * @param options - Tracking options with defaults
 * @returns Object with validated author and date
 */
export function parseAuthorDateFromSuggestion(
  suggestion: PlateSuggestion,
  options: TrackingOptions = {}
): { author: string; date: Date } {
  const defaultAuthor = options.defaultAuthor || 'Unknown Author';
  const defaultDate = options.defaultDate || new Date();

  const author = suggestion.author || defaultAuthor;

  let date: Date;
  if (suggestion.createdAt instanceof Date) {
    date = suggestion.createdAt;
  } else if (suggestion.createdAt) {
    const parsed = new Date(suggestion.createdAt);
    date = isNaN(parsed.getTime()) ? defaultDate : parsed;
  } else {
    date = defaultDate;
  }

  return { author, date };
}

// ============================================================================
// Diff Mark Detection (T091)
// ============================================================================

/** Data attributes for algorithmic diff marks */
export const DIFF_MARK_ATTR = 'data-diff';
export const DIFF_OPERATION_ATTR = 'data-diff-operation';

/**
 * Diff mark metadata extracted from HTML elements
 */
export interface DiffMark {
  /** Whether this is a diff mark */
  isDiff: boolean;
  /** Type of diff operation */
  operation: 'insert' | 'delete' | 'update';
}

/**
 * Detects if an HTML element has a diff mark
 *
 * Diff marks indicate algorithmic differences (e.g., from document comparison)
 * rather than user-created suggestions.
 *
 * @param element - HTML element to check
 * @returns True if element has diff marks
 *
 * @example
 * ```typescript
 * // <span data-diff="true" data-diff-operation="insert">new text</span>
 * isDiffMarked(element) // => true
 * ```
 */
export function isDiffMarked(element: Element): boolean {
  const diffAttr = element.getAttribute(DIFF_MARK_ATTR);
  return diffAttr === 'true' || diffAttr === '1';
}

/**
 * Extracts diff metadata from an HTML element
 *
 * @param element - HTML element with diff marks
 * @returns Diff metadata or null if not a valid diff mark
 *
 * @example
 * ```typescript
 * // <span data-diff="true" data-diff-operation="delete">removed text</span>
 * const diff = extractDiffMark(element);
 * // => { isDiff: true, operation: 'delete' }
 * ```
 */
export function extractDiffMark(element: Element): DiffMark | null {
  if (!isDiffMarked(element)) {
    return null;
  }

  const operationAttr = element.getAttribute(DIFF_OPERATION_ATTR);
  let operation: DiffMark['operation'] = 'insert'; // Default

  if (operationAttr === 'delete') {
    operation = 'delete';
  } else if (operationAttr === 'update') {
    operation = 'update';
  }

  return {
    isDiff: true,
    operation,
  };
}

// ============================================================================
// Diff Operation Mapping (T092)
// ============================================================================

/**
 * Maps diff operation to OOXML revision type
 *
 * Mapping:
 * - 'insert' -> 'insert' (w:ins)
 * - 'delete' -> 'delete' (w:del)
 * - 'update' -> 'runPropertiesChange' (w:rPrChange)
 *
 * @param operation - Diff operation type
 * @returns Corresponding OOXML revision type
 */
export function mapDiffToRevisionType(
  operation: DiffMark['operation']
): RevisionType {
  const mapping: Record<DiffMark['operation'], RevisionType> = {
    insert: 'insert',
    delete: 'delete',
    update: 'runPropertiesChange',
  };
  return mapping[operation];
}

/**
 * Creates a revision from a diff-marked element
 *
 * Processes diff marks and creates appropriate revision wrappers.
 * Handles insert, delete, and update operations.
 *
 * @param element - HTML element with diff marks
 * @param content - Run or array of Runs representing the diff content
 * @param options - Tracking options for author/date defaults
 * @param manager - RevisionManager for registration
 * @returns The created Revision or null if creation failed
 *
 * @example
 * ```typescript
 * // <span data-diff="true" data-diff-operation="insert">new text</span>
 * const run = new Run('new text');
 * const revision = createDiffRevision(element, run, options, manager);
 * ```
 */
export function createDiffRevision(
  element: Element,
  content: Run | Run[],
  options: TrackingOptions,
  manager: RevisionManager
): Revision | null {
  const diffMark = extractDiffMark(element);

  if (!diffMark) {
    return null;
  }

  const runs = Array.isArray(content) ? content : [content];
  const author = extractAuthorFromMark(element, options);
  const date = extractDateFromMark(element, options);
  const revisionType = mapDiffToRevisionType(diffMark.operation);

  try {
    const revision = new Revision({
      type: revisionType,
      author,
      date,
      content: runs,
    });

    return manager.register(revision);
  } catch (error) {
    console.error('[tracking-bridge] Failed to create diff revision:', error);
    return null;
  }
}

/**
 * Processes all suggestion and diff marks in an element tree
 *
 * Recursively processes an element and its children, creating appropriate
 * revisions for both user suggestions and algorithmic diffs.
 *
 * @param element - Root element to process
 * @param options - Tracking options
 * @param manager - RevisionManager for registration
 * @returns Array of created revisions
 */
export function processElementRevisions(
  element: Element,
  options: TrackingOptions,
  manager: RevisionManager
): Revision[] {
  const revisions: Revision[] = [];

  // Check for suggestion mark
  if (isSuggestionMarked(element)) {
    const suggestionMark = extractSuggestionMark(element);
    if (suggestionMark) {
      const textContent = element.textContent || '';
      if (textContent) {
        const run = new Run(textContent);
        const author =
          suggestionMark.userId || options.defaultAuthor || 'Unknown Author';
        const date =
          suggestionMark.createdAt || options.defaultDate || new Date();

        let revision: Revision;
        switch (suggestionMark.type) {
          case 'insert':
            revision = createInsertionRevision(run, author, date, manager);
            revisions.push(revision);
            break;
          case 'delete':
            revision = createDeletionRevision(run, author, date, manager);
            revisions.push(revision);
            break;
          case 'update':
            // For updates, create a run properties change revision
            revision = new Revision({
              type: 'runPropertiesChange',
              author,
              date,
              content: [run],
            });
            manager.register(revision);
            revisions.push(revision);
            break;
        }
      }
    }
  }

  // Check for diff mark
  if (isDiffMarked(element)) {
    const textContent = element.textContent || '';
    if (textContent) {
      const run = new Run(textContent);
      const revision = createDiffRevision(element, run, options, manager);
      if (revision) {
        revisions.push(revision);
      }
    }
  }

  // Process child elements
  const children = element.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child) {
      const childRevisions = processElementRevisions(child, options, manager);
      revisions.push(...childRevisions);
    }
  }

  return revisions;
}

/**
 * Determines if content should be wrapped in a revision based on marks
 *
 * Utility function to check if an element has either suggestion or diff marks
 * that require revision wrapping.
 *
 * @param element - HTML element to check
 * @returns Object indicating what type of revision is needed
 */
export function getRevisionRequirement(element: Element): {
  needsRevision: boolean;
  isSuggestion: boolean;
  isDiff: boolean;
  type?: 'insert' | 'delete' | 'update';
} {
  const hasSuggestion = isSuggestionMarked(element);
  const hasDiff = isDiffMarked(element);

  if (!hasSuggestion && !hasDiff) {
    return { needsRevision: false, isSuggestion: false, isDiff: false };
  }

  let type: 'insert' | 'delete' | 'update' | undefined;

  if (hasSuggestion) {
    const mark = extractSuggestionMark(element);
    type = mark?.type;
  } else if (hasDiff) {
    const mark = extractDiffMark(element);
    type = mark?.operation;
  }

  return {
    needsRevision: true,
    isSuggestion: hasSuggestion,
    isDiff: hasDiff,
    type,
  };
}

/**
 * Creates a revision from a suggestion mark on an element
 *
 * Convenience function that extracts suggestion info from an element
 * and creates the appropriate revision.
 *
 * @param element - HTML element with suggestion marks
 * @param content - Content to wrap in the revision
 * @param options - Tracking options
 * @param manager - RevisionManager for registration
 * @returns Created revision or null
 */
export function createSuggestionRevision(
  element: Element,
  content: Run | Run[],
  options: TrackingOptions,
  manager: RevisionManager
): Revision | null {
  const suggestionMark = extractSuggestionMark(element);

  if (!suggestionMark) {
    return null;
  }

  const runs = Array.isArray(content) ? content : [content];
  const author =
    suggestionMark.userId || options.defaultAuthor || 'Unknown Author';
  const date = suggestionMark.createdAt || options.defaultDate || new Date();

  try {
    switch (suggestionMark.type) {
      case 'insert':
        return createInsertionRevision(runs, author, date, manager);
      case 'delete':
        return createDeletionRevision(runs, author, date, manager);
      case 'update': {
        const revision = new Revision({
          type: 'runPropertiesChange',
          author,
          date,
          content: runs,
        });
        return manager.register(revision);
      }
    }
  } catch (error) {
    console.error(
      '[tracking-bridge] Failed to create suggestion revision:',
      error
    );
    return null;
  }
}

/**
 * Unified revision creation from either suggestion or diff marks
 *
 * Detects the type of mark (suggestion or diff) and creates the appropriate
 * revision. Returns null if no marks are present.
 *
 * @param element - HTML element to check for marks
 * @param content - Content to wrap in the revision
 * @param options - Tracking options
 * @param manager - RevisionManager for registration
 * @returns Created revision or null
 */
export function createRevisionFromMarks(
  element: Element,
  content: Run | Run[],
  options: TrackingOptions,
  manager: RevisionManager
): Revision | null {
  // Check for suggestion mark first (takes priority)
  if (isSuggestionMarked(element)) {
    return createSuggestionRevision(element, content, options, manager);
  }

  // Check for diff mark
  if (isDiffMarked(element)) {
    return createDiffRevision(element, content, options, manager);
  }

  return null;
}

// ============================================================================
// Tracking Token Functions (T094)
// ============================================================================

/** Token patterns for track changes - matches docXMLater format */
export const TRACKING_TOKEN_START = '{{TC:';
export const TRACKING_TOKEN_END = '}}';

/** Regex to match tracking tokens */
const TRACKING_TOKEN_REGEX_PATTERN = /\{\{TC:([^}]+)\}\}/g;

/**
 * Tracking token data structure
 */
export interface TrackingToken {
  /** Type of tracking: insert, delete, or comment */
  type: 'insert' | 'delete' | 'comment';
  /** Unique identifier for this tracked change */
  id: string;
  /** Author who made the change */
  author?: string;
  /** ISO date string of when the change was made */
  date?: string;
  /** Whether this is a start or end token */
  isStart: boolean;
  /** For comments, the comment text content */
  text?: string;
}

/**
 * Result of splitting content by tracking tokens
 */
export interface TrackingTokenSplitResult {
  /** Text segments between tokens */
  segments: string[];
  /** Parsed tokens in order of appearance */
  tokens: TrackingToken[];
  /** Token positions (index in segments array where token appears) */
  tokenPositions: number[];
}

/**
 * Parses a single tracking token string into a TrackingToken object.
 *
 * Token formats:
 * - Start: {{TC:type:id:author:date:start}} or {{TC:comment:id:author:date:start|text}}
 * - End: {{TC:type:id:end}}
 *
 * @param tokenContent - The content inside {{TC: and }}
 * @returns Parsed TrackingToken or null if invalid
 */
export function parseTrackingToken(tokenContent: string): TrackingToken | null {
  if (!tokenContent) return null;

  const pipeIndex = tokenContent.indexOf('|');
  let mainPart = tokenContent;
  let textContent: string | undefined;

  if (pipeIndex !== -1) {
    mainPart = tokenContent.substring(0, pipeIndex);
    textContent = tokenContent
      .substring(pipeIndex + 1)
      .replace(/\|\|/g, '|')
      .replace(/}\u200B/g, '}');
  }

  const parts: string[] = [];
  let current = '';
  let i = 0;

  while (i < mainPart.length) {
    if (mainPart[i] === ':') {
      if (mainPart[i + 1] === ':') {
        current += ':';
        i += 2;
      } else {
        parts.push(current);
        current = '';
        i += 1;
      }
    } else {
      current += mainPart[i];
      i += 1;
    }
  }
  parts.push(current);

  if (parts.length < 2) return null;

  const type = parts[0] as TrackingToken['type'];
  if (type !== 'insert' && type !== 'delete' && type !== 'comment') {
    return null;
  }

  const id = parts[1];
  if (!id) return null;

  if (parts.length === 3 && parts[2] === 'end') {
    return { type, id, isStart: false };
  }

  if (parts.length >= 5 && parts[4] === 'start') {
    return {
      type,
      id,
      author: parts[2] || undefined,
      date: parts[3] || undefined,
      isStart: true,
      text: textContent,
    };
  }

  return null;
}

/**
 * Splits content by tracking tokens for processing.
 */
export function splitDocxTrackingTokens(
  content: string
): TrackingTokenSplitResult {
  const segments: string[] = [];
  const tokens: TrackingToken[] = [];
  const tokenPositions: number[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(TRACKING_TOKEN_REGEX_PATTERN.source, 'g');

  while ((match = regex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore || segments.length === 0) {
      segments.push(textBefore);
    }
    const tokenContent = match[1];
    const token = parseTrackingToken(tokenContent);
    if (token) {
      tokens.push(token);
      tokenPositions.push(segments.length);
    }
    lastIndex = match.index + match[0].length;
  }

  const remainingText = content.substring(lastIndex);
  segments.push(remainingText);

  return { segments, tokens, tokenPositions };
}

/**
 * Checks if content contains any tracking tokens
 */
export function hasTrackingTokens(content: string): boolean {
  const regex = new RegExp(TRACKING_TOKEN_REGEX_PATTERN.source, 'g');
  return regex.test(content);
}

/**
 * Removes all tracking tokens from content
 */
export function stripTrackingTokens(content: string): string {
  return content.replace(
    new RegExp(TRACKING_TOKEN_REGEX_PATTERN.source, 'g'),
    ''
  );
}

// ============================================================================
// RevisionManager Integration (T095)
// ============================================================================

/**
 * Configuration for RevisionManager integration
 */
export interface RevisionManagerConfig {
  enableTracking: boolean;
  preserveIds: boolean;
  defaultAuthor: string;
  defaultDate: Date;
  linkMoves?: boolean;
}

export const DEFAULT_REVISION_CONFIG: RevisionManagerConfig = {
  enableTracking: true,
  preserveIds: true,
  defaultAuthor: 'Unknown Author',
  defaultDate: new Date(),
  linkMoves: true,
};

export interface RevisionIntegrationResult {
  manager: RevisionManager;
  enabled: boolean;
  revisionCount: number;
  idMapping: Map<string, number>;
}

/**
 * Integrates RevisionManager with document export.
 */
export function integrateRevisionManager(
  doc: Document,
  config: Partial<RevisionManagerConfig> = {}
): RevisionIntegrationResult {
  const fullConfig: RevisionManagerConfig = {
    ...DEFAULT_REVISION_CONFIG,
    ...config,
  };

  let manager: RevisionManager;
  const existingManager = doc.getRevisionManager?.();

  if (existingManager) {
    manager = existingManager;
  } else {
    manager = new RevisionManager();
    const docWithIdManager = doc as unknown as {
      getIdManager?: () =>
        | {
            getNextAnnotationId: () => number;
            notifyExistingId?: (id: number) => void;
          }
        | undefined;
    };
    const idManager = docWithIdManager.getIdManager?.();
    if (idManager && typeof idManager.getNextAnnotationId === 'function') {
      manager.setIdProvider(
        () => idManager.getNextAnnotationId(),
        (existingId: number) => idManager.notifyExistingId?.(existingId)
      );
    }
    const docWithSetter = doc as unknown as {
      setRevisionManager?: (rm: RevisionManager) => void;
    };
    if (typeof docWithSetter.setRevisionManager === 'function') {
      docWithSetter.setRevisionManager(manager);
    }
  }

  return {
    manager,
    enabled: fullConfig.enableTracking,
    revisionCount: manager.getCount(),
    idMapping: new Map(),
  };
}

/**
 * Exports all revisions to XML string.
 */
export function exportRevisionsToXml(manager: RevisionManager): string {
  const revisions = manager.getAllRevisions();
  const xmlParts: string[] = [];

  for (const revision of revisions) {
    const xmlElement = revision.toXML();
    if (xmlElement) {
      xmlParts.push(serializeRevisionXmlT095(revision));
    }
  }

  return xmlParts.join('\n');
}

function serializeRevisionXmlT095(revision: Revision): string {
  const type = revision.getType();
  const id = revision.getId();
  const author = revision.getAuthor();
  const date = revision.getDate().toISOString();

  const elementMap: Record<string, string> = {
    insert: 'w:ins',
    delete: 'w:del',
    moveFrom: 'w:moveFrom',
    moveTo: 'w:moveTo',
    runPropertiesChange: 'w:rPrChange',
    paragraphPropertiesChange: 'w:pPrChange',
  };

  const elementName = elementMap[type] ?? 'w:ins';
  const runs = revision.getRuns();
  const textContent = runs.map((run) => run.getText()).join('');

  const escXmlText = (text: string): string =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escXmlAttr = (text: string): string =>
    escXmlText(text).replace(/"/g, '&quot;');

  if (type === 'delete') {
    return (
      '<' +
      elementName +
      ' w:id="' +
      id +
      '" w:author="' +
      escXmlAttr(author) +
      '" w:date="' +
      date +
      '"><w:r><w:delText>' +
      escXmlText(textContent) +
      '</w:delText></w:r></' +
      elementName +
      '>'
    );
  }

  return (
    '<' +
    elementName +
    ' w:id="' +
    id +
    '" w:author="' +
    escXmlAttr(author) +
    '" w:date="' +
    date +
    '"><w:r><w:t>' +
    escXmlText(textContent) +
    '</w:t></w:r></' +
    elementName +
    '>'
  );
}

/**
 * Gets comprehensive revision statistics.
 */
export function getRevisionStats(manager: RevisionManager): {
  total: number;
  insertions: number;
  deletions: number;
  propertyChanges: number;
  moves: number;
  authors: string[];
  dateRange: { earliest: Date; latest: Date } | null;
} {
  const summary = manager.getSummary();
  return {
    total: summary.total,
    insertions: summary.byType.insertions,
    deletions: summary.byType.deletions,
    propertyChanges: summary.byType.propertyChanges,
    moves: summary.byType.moves,
    authors: summary.authors,
    dateRange: summary.dateRange,
  };
}

/**
 * Validates all revisions in the manager.
 */
export function validateRevisions(manager: RevisionManager): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  const idValidation = manager.validateRevisionIds();
  if (!idValidation.valid) {
    issues.push(
      'Duplicate revision IDs: ' + idValidation.duplicates.join(', ')
    );
  }

  const moveValidation = manager.validateMovePairs();
  if (!moveValidation.valid) {
    if (moveValidation.orphanedMoveFrom.length > 0) {
      issues.push(
        'Orphaned moveFrom IDs: ' + moveValidation.orphanedMoveFrom.join(', ')
      );
    }
    if (moveValidation.orphanedMoveTo.length > 0) {
      issues.push(
        'Orphaned moveTo IDs: ' + moveValidation.orphanedMoveTo.join(', ')
      );
    }
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Creates revisions from parsed tracking tokens.
 */
export function createRevisionsFromTokens(
  manager: RevisionManager,
  tokens: TrackingToken[],
  textSegments: string[],
  config: Partial<RevisionManagerConfig> = {}
): Map<string, Revision> {
  const fullConfig = { ...DEFAULT_REVISION_CONFIG, ...config };
  const revisionMap = new Map<string, Revision>();
  const activeTokens = new Map<
    string,
    { token: TrackingToken; startIdx: number }
  >();

  tokens.forEach((token, tokenIdx) => {
    const tokenKey = token.type + ':' + token.id;

    if (token.isStart) {
      activeTokens.set(tokenKey, { token, startIdx: tokenIdx });
    } else {
      const startInfo = activeTokens.get(tokenKey);
      if (startInfo) {
        const startToken = startInfo.token;
        const textBetween = textSegments
          .slice(startInfo.startIdx + 1, tokenIdx + 1)
          .join('');
        const run = new Run(textBetween);
        const revisionType =
          token.type === 'insert'
            ? 'insert'
            : token.type === 'delete'
              ? 'delete'
              : 'insert';

        const revision = new Revision({
          type: revisionType,
          author: startToken.author ?? fullConfig.defaultAuthor,
          date: startToken.date
            ? new Date(startToken.date)
            : fullConfig.defaultDate,
          content: run,
        });

        manager.register(revision);
        revisionMap.set(token.id, revision);
        activeTokens.delete(tokenKey);
      }
    }
  });

  return revisionMap;
}

/**
 * Synchronizes revision IDs between Plate and DOCX formats.
 */
export function synchronizeRevisionIds(
  manager: RevisionManager,
  plateSuggestions: PlateSuggestion[]
): {
  plateToDocx: Map<string, number>;
  docxToPlate: Map<number, string>;
} {
  const plateToDocx = new Map<string, number>();
  const docxToPlate = new Map<number, string>();
  const revisions = manager.getAllRevisions();

  for (const suggestion of plateSuggestions) {
    for (const revision of revisions) {
      const revType = revision.getType();
      const suggType = suggestion.type === 'delete' ? 'delete' : 'insert';

      if (revType === suggType) {
        const revText = revision
          .getRuns()
          .map((r) => r.getText())
          .join('');
        const suggText = suggestion.text || '';

        if (revText === suggText && !docxToPlate.has(revision.getId())) {
          plateToDocx.set(suggestion.id, revision.getId());
          docxToPlate.set(revision.getId(), suggestion.id);
          break;
        }
      }
    }
  }

  return { plateToDocx, docxToPlate };
}
