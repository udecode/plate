/**
 * Comment Extended Handler - Handles nested/threaded comments for DOCX export
 *
 * This module provides support for extended comment features in OOXML:
 * - Comment threading (parent-child relationships)
 * - commentsExtended.xml generation for Word 2013+ features
 * - Comment state tracking (done/resolved status)
 *
 * Per ECMA-376 Part 1 and ISO/IEC 29500-1, comments can have:
 * - parentId attribute for replies (in comments.xml)
 * - Extended properties in commentsExtended.xml (w15 namespace)
 *
 * @module comment-extended-handler
 */

import type { CommentManager, Comment } from '../docXMLater/src';
import type { TrackingOptions } from './tracking-bridge';
import { XMLBuilder } from '../docXMLater/src/xml/XMLBuilder';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Extended comment properties for Word 2013+ features
 *
 * Per ISO/IEC 29500-1:2016, commentsExtended.xml stores additional
 * metadata about comments that isn't in the main comments.xml
 */
export interface ExtendedCommentProperties {
  /** The comment ID this extends */
  paraId: string;
  /** GUID for the paragraph containing the comment anchor */
  paraIdParent?: string;
  /** Whether the comment thread is done/resolved */
  done?: boolean;
}

/**
 * Represents a comment thread with its replies
 */
export interface CommentThread {
  /** The root/parent comment */
  root: Comment;
  /** Reply comments in order */
  replies: Comment[];
  /** Original Plate ID of the root comment */
  originalId: string;
  /** Whether the thread is resolved */
  isResolved: boolean;
}

/**
 * Options for comment extended processing
 */
export interface CommentExtendedOptions extends TrackingOptions {
  /** Whether to generate commentsExtended.xml (Word 2013+ feature) */
  generateExtended?: boolean;
  /** Whether to track paragraph IDs for comment anchors */
  trackParagraphIds?: boolean;
}

/**
 * Result of processing extended comments
 */
export interface ExtendedCommentsResult {
  /** Generated commentsExtended.xml content (if enabled) */
  commentsExtendedXml: string | null;
  /** Map of comment IDs to their extended properties */
  extendedProperties: Map<number, ExtendedCommentProperties>;
  /** Organized comment threads */
  threads: CommentThread[];
  /** Whether commentsExtended.xml should be included in the package */
  hasExtendedContent: boolean;
}

// ============================================================================
// Comment Threading
// ============================================================================

/**
 * Organizes comments into threads based on parentId relationships
 *
 * @param manager - The CommentManager with registered comments
 * @param idMapping - Map from original Plate IDs to DOCX numeric IDs
 * @returns Array of CommentThread objects
 *
 * @example
 * ```typescript
 * const threads = organizeCommentThreads(manager, idMapping);
 * for (const thread of threads) {
 *   console.log(`Thread ${thread.root.getId()} has ${thread.replies.length} replies`);
 * }
 * ```
 */
export function organizeCommentThreads(
  manager: CommentManager,
  idMapping: Map<string, number>
): CommentThread[] {
  const threads: CommentThread[] = [];
  const topLevelComments = manager.getAllComments();

  // Create a reverse mapping from DOCX ID to original ID
  const reverseIdMapping = new Map<number, string>();
  Array.from(idMapping.entries()).forEach(([originalId, docxId]) => {
    reverseIdMapping.set(docxId, originalId);
  });

  for (const comment of topLevelComments) {
    const replies = manager.getReplies(comment.getId());
    const originalId =
      reverseIdMapping.get(comment.getId()) || comment.getId().toString();

    // Check if thread is resolved (root or any reply marked as resolved)
    const isResolved =
      comment.isResolved() || replies.some((r) => r.isResolved());

    threads.push({
      root: comment,
      replies,
      originalId,
      isResolved,
    });
  }

  return threads;
}

/**
 * Finds the thread containing a specific comment
 *
 * @param commentId - The DOCX numeric comment ID
 * @param threads - Array of organized threads
 * @returns The thread containing the comment, or undefined
 */
export function findThreadForComment(
  commentId: number,
  threads: CommentThread[]
): CommentThread | undefined {
  for (const thread of threads) {
    if (thread.root.getId() === commentId) {
      return thread;
    }
    if (thread.replies.some((r) => r.getId() === commentId)) {
      return thread;
    }
  }
  return;
}

/**
 * Gets the depth of a comment in its thread (0 for root, 1+ for replies)
 *
 * @param comment - The Comment instance
 * @returns The nesting depth
 */
export function getCommentDepth(comment: Comment): number {
  if (!comment.isReply()) {
    return 0;
  }
  // In OOXML, replies are flat (depth 1), but we support nested check
  return 1;
}

// ============================================================================
// Extended Properties Generation
// ============================================================================

/**
 * Generates extended properties for a comment
 *
 * @param comment - The Comment instance
 * @param paragraphId - Optional paragraph ID for the comment anchor
 * @returns Extended properties object
 */
export function generateExtendedProperties(
  comment: Comment,
  paragraphId?: string
): ExtendedCommentProperties {
  const props: ExtendedCommentProperties = {
    paraId: generateParaId(comment.getId()),
    done: comment.isResolved(),
  };

  if (paragraphId) {
    props.paraIdParent = paragraphId;
  }

  return props;
}

/**
 * Generates a paragraph ID for comment extended properties
 *
 * Per OOXML spec, paraId is an 8-character hexadecimal string
 *
 * @param commentId - The comment ID to base the paraId on
 * @returns 8-character hexadecimal paraId
 */
export function generateParaId(commentId: number): string {
  // Create a unique 8-char hex ID based on comment ID
  // Use padding and hashing-like approach for uniqueness
  const base = (commentId * 0x1_00_01 + 0x1_23_45_67) >>> 0; // unsigned 32-bit
  return base.toString(16).toUpperCase().padStart(8, '0').slice(-8);
}

// ============================================================================
// commentsExtended.xml Generation
// ============================================================================

/**
 * XML namespace for Word 2015 (commentsExtended)
 */
export const W15_NAMESPACE =
  'http://schemas.microsoft.com/office/word/2012/wordml';

/**
 * Generates commentsExtended.xml content
 *
 * This file is part of the Word 2013+ extended features and contains
 * additional metadata about comments like paragraph IDs and done status.
 *
 * @param manager - The CommentManager with registered comments
 * @param extendedProperties - Map of comment IDs to extended properties
 * @returns XML string for word/commentsExtended.xml
 *
 * @example
 * ```typescript
 * const extProps = new Map();
 * extProps.set(0, { paraId: '00000001', done: true });
 *
 * const xml = generateCommentsExtendedXml(manager, extProps);
 * ```
 */
export function generateCommentsExtendedXml(
  manager: CommentManager,
  extendedProperties: Map<number, ExtendedCommentProperties>
): string {
  const comments = manager.getAllCommentsWithReplies();

  if (comments.length === 0 || extendedProperties.size === 0) {
    // Return minimal commentsExtended.xml
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w15:commentsEx xmlns:w15="${W15_NAMESPACE}" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="w15">
</w15:commentsEx>`;
  }

  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += `<w15:commentsEx xmlns:w15="${W15_NAMESPACE}"`;
  xml +=
    ' xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"';
  xml += ' mc:Ignorable="w15">\n';

  // Add extended properties for each comment
  for (const comment of comments) {
    const props = extendedProperties.get(comment.getId());
    if (props) {
      xml += '  <w15:commentEx';
      xml += ` w15:paraId="${XMLBuilder.escapeXmlAttribute(props.paraId)}"`;

      if (props.paraIdParent) {
        xml += ` w15:paraIdParent="${XMLBuilder.escapeXmlAttribute(props.paraIdParent)}"`;
      }

      if (props.done) {
        xml += ' w15:done="1"';
      }

      xml += '/>\n';
    }
  }

  xml += '</w15:commentsEx>';
  return xml;
}

/**
 * Checks if commentsExtended.xml is needed
 *
 * The file is needed when there are:
 * - Resolved/done comments
 * - Comments with paragraph ID tracking
 *
 * @param manager - The CommentManager to check
 * @returns True if commentsExtended.xml should be generated
 */
export function needsCommentsExtended(manager: CommentManager): boolean {
  // Check if any comment is resolved
  const resolvedComments = manager.getResolvedComments();
  if (resolvedComments.length > 0) {
    return true;
  }

  // Also needed if we want to track paragraph IDs for proper anchor display
  // For now, return true if there are any comments for future compatibility
  return manager.getCount() > 0;
}

// ============================================================================
// Complete Extended Processing
// ============================================================================

/**
 * Processes comments with extended features
 *
 * This function:
 * 1. Organizes comments into threads
 * 2. Generates extended properties
 * 3. Creates commentsExtended.xml if needed
 *
 * @param manager - The CommentManager with registered comments
 * @param idMapping - Map from original Plate IDs to DOCX numeric IDs
 * @param options - Processing options
 * @returns Complete extended comments result
 *
 * @example
 * ```typescript
 * const manager = new CommentManager();
 * // ... register comments ...
 *
 * const result = processExtendedComments(manager, idMapping, {
 *   generateExtended: true
 * });
 *
 * if (result.hasExtendedContent && result.commentsExtendedXml) {
 *   // Add word/commentsExtended.xml to the package
 * }
 * ```
 */
export function processExtendedComments(
  manager: CommentManager,
  idMapping: Map<string, number>,
  options: CommentExtendedOptions = {}
): ExtendedCommentsResult {
  const { generateExtended = true, trackParagraphIds = false } = options;

  // Organize threads
  const threads = organizeCommentThreads(manager, idMapping);

  // Generate extended properties for all comments
  const extendedProperties = new Map<number, ExtendedCommentProperties>();
  const comments = manager.getAllCommentsWithReplies();

  for (const comment of comments) {
    const props = generateExtendedProperties(
      comment,
      trackParagraphIds ? generateParaId(comment.getId()) : undefined
    );
    extendedProperties.set(comment.getId(), props);
  }

  // Determine if we need extended content
  const hasExtendedContent = generateExtended && needsCommentsExtended(manager);

  // Generate XML if needed
  const commentsExtendedXml = hasExtendedContent
    ? generateCommentsExtendedXml(manager, extendedProperties)
    : null;

  return {
    commentsExtendedXml,
    extendedProperties,
    threads,
    hasExtendedContent,
  };
}

// ============================================================================
// Relationship Helpers
// ============================================================================

/**
 * Content type for commentsExtended.xml
 */
export const COMMENTS_EXTENDED_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.commentsExtended+xml';

/**
 * Relationship type for commentsExtended.xml
 */
export const COMMENTS_EXTENDED_RELATIONSHIP_TYPE =
  'http://schemas.microsoft.com/office/2011/relationships/commentsExtended';

/**
 * Default path for commentsExtended.xml in the package
 */
export const COMMENTS_EXTENDED_PATH = 'word/commentsExtended.xml';

/**
 * Creates a relationship entry for commentsExtended.xml
 *
 * @param relationshipId - The relationship ID (e.g., 'rId5')
 * @returns Relationship definition for document.xml.rels
 */
export function createCommentsExtendedRelationship(relationshipId: string): {
  id: string;
  type: string;
  target: string;
} {
  return {
    id: relationshipId,
    type: COMMENTS_EXTENDED_RELATIONSHIP_TYPE,
    target: 'commentsExtended.xml',
  };
}

/**
 * Creates a content type entry for commentsExtended.xml
 *
 * @returns Content type definition for [Content_Types].xml
 */
export function createCommentsExtendedContentType(): {
  partName: string;
  contentType: string;
} {
  return {
    partName: `/${COMMENTS_EXTENDED_PATH}`,
    contentType: COMMENTS_EXTENDED_CONTENT_TYPE,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Validates that a comment thread has proper structure
 *
 * @param thread - The thread to validate
 * @returns True if the thread is valid
 */
export function validateCommentThread(thread: CommentThread): boolean {
  // Root must exist and not be a reply
  if (!thread.root || thread.root.isReply()) {
    return false;
  }

  // All replies must reference the root as parent
  const rootId = thread.root.getId();
  for (const reply of thread.replies) {
    if (reply.getParentId() !== rootId) {
      return false;
    }
  }

  return true;
}

/**
 * Sorts comment threads by date (oldest first)
 *
 * @param threads - Array of threads to sort
 * @returns Sorted array of threads
 */
export function sortThreadsByDate(threads: CommentThread[]): CommentThread[] {
  return [...threads].sort(
    (a, b) => a.root.getDate().getTime() - b.root.getDate().getTime()
  );
}

/**
 * Gets all comments from threads as a flat array
 *
 * @param threads - Array of threads
 * @returns Flat array of all comments (roots and replies)
 */
export function flattenThreads(threads: CommentThread[]): Comment[] {
  const comments: Comment[] = [];
  for (const thread of threads) {
    comments.push(thread.root);
    comments.push(...thread.replies);
  }
  return comments;
}

/**
 * Counts total replies across all threads
 *
 * @param threads - Array of threads
 * @returns Total number of replies
 */
export function countTotalReplies(threads: CommentThread[]): number {
  return threads.reduce((sum, thread) => sum + thread.replies.length, 0);
}

/**
 * Gets unique authors from threads
 *
 * @param threads - Array of threads
 * @returns Array of unique author names
 */
export function getThreadAuthors(threads: CommentThread[]): string[] {
  const authorsSet = new Set<string>();
  for (const thread of threads) {
    authorsSet.add(thread.root.getAuthor());
    for (const reply of thread.replies) {
      authorsSet.add(reply.getAuthor());
    }
  }
  return Array.from(authorsSet);
}
