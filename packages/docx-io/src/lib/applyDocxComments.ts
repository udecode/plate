/**
 * DOCX Comments Application
 *
 * This module provides utilities for applying comments from parsed DOCX
 * tokens to a Plate editor.
 *
 * Two modes are supported:
 * 1. API mode: Uses external API to create discussions (applyTrackedComments)
 * 2. Local mode: Returns discussion data for local storage (applyTrackedCommentsLocal)
 *
 * Usage flow:
 * 1. Convert DOCX to HTML with mammoth (with tracking token support)
 * 2. Parse tokens from HTML using parseDocxComments
 * 3. Deserialize HTML to editor nodes
 * 4. Apply comments using applyTrackedComments or applyTrackedCommentsLocal
 */

import {
  formatAuthorAsUserId,
  isPointAfter,
  parseDateToDate,
  type SearchRangeFn,
  type TPoint,
  type TrackingEditor,
} from './applyDocxTrackingChanges';
import type { DocxImportComment } from './parseDocxTracking';
import type { TRange } from './searchRange';

// Re-export shared types
export type {
  SearchRangeFn,
  TPoint,
  TrackingEditor,
} from './applyDocxTrackingChanges';
export type { TRange } from './searchRange';

// ============================================================================
// Point/Range Comparison Utilities
// ============================================================================

/**
 * Check if two points are equal.
 */
export function isPointEqual(a: TPoint, b: TPoint): boolean {
  if (a.path.length !== b.path.length) return false;
  for (let i = 0; i < a.path.length; i++) {
    if (a.path[i] !== b.path[i]) return false;
  }
  return a.offset === b.offset;
}

/**
 * Check if two ranges are equal.
 */
export function isRangeEqual(a: TRange | null, b: TRange | null): boolean {
  if (!a || !b) return a === b;
  return isPointEqual(a.anchor, b.anchor) && isPointEqual(a.focus, b.focus);
}

/**
 * Check if two paths are equal.
 */
export function isPathEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// ============================================================================
// Point Comment Range Expansion
// ============================================================================

type PointCommentMarkRangeOptions = {
  preferBefore?: boolean;
  skipCurrentNode?: boolean;
  isText: (node: unknown) => boolean;
};

/**
 * Get a non-empty range for a point comment.
 *
 * When a comment is at a single point (start === end), we need to expand
 * it to cover at least one character so it can be marked. This function
 * handles various edge cases:
 *
 * 1. If the point has text after it, expand forward by 1 character
 * 2. If the point is at end of node, try to expand backward by 1 character
 * 3. If current node is empty, scan other text nodes in the document
 *
 * @param editor - The editor instance
 * @param point - The point to expand
 * @param options - Range expansion options
 * @param options.preferBefore - Whether to prefer expanding backward (default: false = prefer after)
 * @param options.skipCurrentNode - Whether to skip the current node and scan others (default: false)
 * @param options.isText - Function to check if a node is text
 * @returns A range covering at least 1 character, or null if no text found
 */
export function getPointCommentMarkRange(
  editor: TrackingEditor,
  point: TPoint,
  options: PointCommentMarkRangeOptions | boolean,
  ...legacyArgs: [boolean?, ((node: unknown) => boolean)?]
): TRange | null {
  const resolvedOptions: PointCommentMarkRangeOptions =
    typeof options === 'object' && options
      ? options
      : {
          preferBefore: Boolean(options),
          skipCurrentNode: legacyArgs[0] ?? false,
          isText: legacyArgs[1] as (node: unknown) => boolean,
        };
  const {
    preferBefore = false,
    skipCurrentNode = false,
    isText,
  } = resolvedOptions;

  if (!isText) return null;
  // Try current node first if not skipping
  if (!skipCurrentNode && editor.api.nodes) {
    // Get all text nodes to find the one at point.path
    const textEntries = Array.from(
      editor.api.nodes<{ text?: string }>({
        at: [],
        match: isText,
      })
    );

    // Find the entry at point.path
    const currentEntry = textEntries.find(([, path]) =>
      isPathEqual(path, point.path)
    );

    if (currentEntry) {
      const [node] = currentEntry;
      if (typeof node.text === 'string') {
        const textLength = node.text.length;
        const beforeRange: TRange | null =
          point.offset > 0
            ? {
                anchor: { offset: point.offset - 1, path: point.path },
                focus: { offset: point.offset, path: point.path },
              }
            : null;
        const afterRange: TRange | null =
          point.offset < textLength
            ? {
                anchor: { offset: point.offset, path: point.path },
                focus: { offset: point.offset + 1, path: point.path },
              }
            : null;

        if (preferBefore) return beforeRange ?? afterRange;
        return afterRange ?? beforeRange;
      }
    }
  }

  // Scan all text nodes if current node didn't work
  if (!editor.api.nodes) return null;

  const textEntries = Array.from(
    editor.api.nodes<{ text?: string }>({
      at: [],
      match: isText,
    })
  );

  if (textEntries.length === 0) return null;

  const entryIndex = textEntries.findIndex(([, path]) =>
    isPathEqual(path, point.path)
  );

  const rangeFromEntry = (
    entry: (typeof textEntries)[number],
    tail: boolean
  ): TRange | null => {
    const [entryNode, entryPath] = entry;
    if (typeof entryNode.text !== 'string') return null;
    if (!entryNode.text || entryNode.text.length === 0) return null;

    if (tail) {
      const endOffset = entryNode.text.length;
      return {
        anchor: { offset: endOffset - 1, path: entryPath },
        focus: { offset: endOffset, path: entryPath },
      };
    }

    return {
      anchor: { offset: 0, path: entryPath },
      focus: { offset: 1, path: entryPath },
    };
  };

  const scanFromIndex = (
    start: number,
    end: number,
    step: number,
    tail: boolean
  ): TRange | null => {
    for (let i = start; i !== end; i += step) {
      const range = rangeFromEntry(textEntries[i]!, tail);
      if (range) return range;
    }
    return null;
  };

  if (entryIndex !== -1) {
    if (preferBefore) {
      return (
        scanFromIndex(entryIndex - 1, -1, -1, true) ??
        scanFromIndex(entryIndex + 1, textEntries.length, 1, false)
      );
    }

    return (
      scanFromIndex(entryIndex + 1, textEntries.length, 1, false) ??
      scanFromIndex(entryIndex - 1, -1, -1, true)
    );
  }

  if (preferBefore) {
    return scanFromIndex(textEntries.length - 1, -1, -1, true);
  }

  return scanFromIndex(0, textEntries.length, 1, false);
}

// ============================================================================
// Types for API-based Comment Application
// ============================================================================

/** Function to create a discussion with comment via API */
export type CreateDiscussionFn = {
  mutateAsync: (input: {
    contentRich?: unknown;
    documentContent: string;
    documentId: string;
  }) => Promise<{ id: string }>;
};

/** Options for applying tracked comments via API */
export type ApplyCommentsOptions = {
  /** The editor instance */
  editor: TrackingEditor;
  /** Comments to apply */
  comments: DocxImportComment[];
  /** Function to search for ranges in editor */
  searchRange: SearchRangeFn;
  /** Document ID for creating discussions */
  documentId: string;
  /** Function to create a discussion with comment */
  createDiscussionWithComment: CreateDiscussionFn;
  /** Key constant for comment marks (e.g., 'comment') */
  commentKey: string;
  /** Function to generate comment key property (e.g., getCommentKey) */
  getCommentKey: (discussionId: string) => string;
  /** Function to generate transient comment key (optional) */
  getTransientCommentKey?: () => string;
  /** Function to check if node is text (e.g., TextApi.isText) */
  isText: (node: unknown) => boolean;
  /** Optional comment plugin for update notifications */
  commentPlugin?: unknown;
  /** Optional callback when comments are created */
  onCommentsCreated?: () => void;
};

/** Result of applying tracked comments via API */
export type ApplyCommentsResult = {
  /** Number of comments created */
  created: number;
  /** Number of comments skipped (no location) */
  skipped: number;
  /** Errors encountered */
  errors: string[];
};

// ============================================================================
// Types for Local Comment Application
// ============================================================================

/** Discussion data created from DOCX comment (for local storage/import) */
export type DocxImportDiscussion = {
  /** Unique discussion ID */
  id: string;
  /** Comments in this discussion */
  comments?: Array<{
    /** Rich content of the comment */
    contentRich?: unknown;
    /** When the comment was created */
    createdAt?: Date;
    /** User ID of the commenter */
    userId?: string;
    /** Optional user object for direct author info */
    user?: { id: string; name: string };
  }>;
  /** When the discussion was created */
  createdAt?: Date;
  /** The document text that was commented on */
  documentContent?: string;
  /** User ID who created the discussion */
  userId?: string;
  /** Optional user object for direct author info */
  user?: { id: string; name: string };
};

/** Options for applying tracked comments locally (without API) */
export type ApplyCommentsLocalOptions = {
  /** The editor instance */
  editor: TrackingEditor;
  /** Comments to apply */
  comments: DocxImportComment[];
  /** Function to search for ranges in editor */
  searchRange: SearchRangeFn;
  /** Key constant for comment marks (e.g., 'comment') */
  commentKey: string;
  /** Function to generate comment key property (e.g., getCommentKey) */
  getCommentKey: (discussionId: string) => string;
  /** Function to check if node is text (e.g., TextApi.isText) */
  isText: (node: unknown) => boolean;
  /** Function to generate unique IDs (e.g., nanoid) */
  generateId: () => string;
  /** Fallback date when comment has no date (Word doesn't export dates) */
  documentDate?: Date;
};

/** Result of applying tracked comments locally */
export type ApplyCommentsLocalResult = {
  /** Number of comments applied */
  applied: number;
  /** Errors encountered */
  errors: string[];
  /** Created discussions (for storing in plugin state) */
  discussions: DocxImportDiscussion[];
};

// ============================================================================
// Apply Tracked Comments (API Mode)
// ============================================================================

/**
 * Apply tracked comments to the editor using an external API.
 *
 * This function:
 * 1. Finds start/end tokens in the editor using searchRange
 * 2. Creates discussions via the provided API
 * 3. Applies comment marks to the text between tokens
 * 4. Removes the tokens from the document
 *
 * Golden rule: If we have ANY location marker, preserve the comment.
 * - Has start, no end → end = start (point comment)
 * - Has end, no start → start = end (point comment)
 * - Has neither → skip (no location available)
 *
 * @param options - Options for applying comments
 * @returns Result with counts and errors
 *
 * @example
 * ```ts
 * import { parseDocxComments } from './parseDocxTracking';
 * import { applyTrackedComments } from './applyDocxComments';
 * import { getCommentKey } from '@platejs/comment';
 *
 * const { comments } = parseDocxComments(html);
 *
 * const result = await applyTrackedComments({
 *   editor,
 *   comments,
 *   searchRange: mySearchRangeFn,
 *   documentId: 'doc-123',
 *   createDiscussionWithComment: api.comment.createDiscussionWithComment,
 *   commentKey: 'comment',
 *   getCommentKey,
 *   isText: TextApi.isText,
 * });
 *
 * console.log(`Created ${result.created} comments`);
 * ```
 */
export async function applyTrackedComments(
  options: ApplyCommentsOptions
): Promise<ApplyCommentsResult> {
  const {
    editor,
    comments,
    searchRange,
    documentId,
    createDiscussionWithComment,
    commentKey,
    getCommentKey,
    getTransientCommentKey,
    isText,
    commentPlugin,
    onCommentsCreated,
  } = options;

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const comment of comments) {
    try {
      const startTokenRange = comment.hasStartToken
        ? searchRange(editor, comment.startToken)
        : null;
      const endTokenRange = comment.hasEndToken
        ? searchRange(editor, comment.endToken)
        : null;

      const hasStartMarker = Boolean(startTokenRange);
      const hasEndMarker = Boolean(endTokenRange);

      // Golden rule: if we have ANY location marker, preserve the comment
      if (!startTokenRange && !endTokenRange) {
        skipped++;
        continue;
      }

      // Use whichever marker we have, fallback to the other for point comments
      const effectiveStartRange = startTokenRange ?? endTokenRange;
      const effectiveEndRange = endTokenRange ?? startTokenRange;

      if (!effectiveStartRange || !effectiveEndRange) {
        skipped++;
        continue;
      }

      // Use rangeRef to track ranges through operations
      const startTokenRef = editor.api.rangeRef(effectiveStartRange);
      const endTokenRef = editor.api.rangeRef(effectiveEndRange);

      const currentStartRange = startTokenRef.current;
      const currentEndRange = endTokenRef.current;

      if (!currentStartRange || !currentEndRange) {
        startTokenRef.unref();
        endTokenRef.unref();
        skipped++;
        continue;
      }

      // Determine the content range
      let anchor = currentStartRange.focus;
      let focus = currentEndRange.anchor;

      if (isPointAfter(anchor, focus)) {
        [anchor, focus] = [focus, anchor];
      }

      const contentRange = { anchor, focus };

      // Get the document content (the text that was commented)
      let documentContent = editor.api.string(contentRange);
      if (!documentContent || documentContent.trim().length === 0) {
        documentContent = 'Imported comment';
      }

      // Build the comment content
      const commentText = comment.text ?? '';
      const contentRich = commentText
        ? [{ children: [{ text: commentText }], type: 'p' }]
        : undefined;

      // Create discussion via API
      const discussion = await createDiscussionWithComment.mutateAsync({
        contentRich,
        documentContent,
        documentId,
      });

      created++;

      // Apply comment marks to the text
      editor.tf.withMerging(() => {
        const currentStart = startTokenRef.current;
        const currentEnd = endTokenRef.current;

        if (currentStart && currentEnd) {
          let markAnchor = currentStart.focus;
          let markFocus = currentEnd.anchor;

          if (isPointAfter(markAnchor, markFocus)) {
            [markAnchor, markFocus] = [markFocus, markAnchor];
          }

          const markRange = { anchor: markAnchor, focus: markFocus };

          const marks: Record<string, unknown> = {
            [getCommentKey(discussion.id)]: true,
            [commentKey]: true,
          };

          if (getTransientCommentKey) {
            marks[getTransientCommentKey()] = true;
          }

          editor.tf.setNodes(marks, {
            at: markRange,
            match: isText,
            split: true,
          });

          if (commentPlugin && editor.setOption) {
            editor.setOption(commentPlugin, 'updateTimestamp', Date.now());
          }
        }
      });

      // Delete the tokens (only delete tokens that actually existed)
      const endRange = endTokenRef.unref();
      const startRange = startTokenRef.unref();

      if (hasEndMarker && endRange) {
        editor.tf.delete({ at: endRange });
      }
      if (hasStartMarker && startRange) {
        editor.tf.delete({ at: startRange });
      }
    } catch (error) {
      errors.push(
        `Failed to apply comment ${comment.id}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  if (created > 0 && onCommentsCreated) {
    onCommentsCreated();
  }

  return {
    created,
    skipped,
    errors,
  };
}

// ============================================================================
// Apply Tracked Comments (Local Mode)
// ============================================================================

/**
 * Apply tracked comments to the editor locally (without API calls).
 *
 * This function:
 * 1. Finds start/end tokens in the editor using searchRange
 * 2. Creates discussion objects locally
 * 3. Applies comment marks to the text between tokens
 * 4. Removes the tokens from the document
 * 5. Returns created discussions for storage in plugin state
 *
 * Golden rule: If we have ANY location marker, preserve the comment.
 * - Has start, no end → end = start (point comment)
 * - Has end, no start → start = end (point comment)
 * - Has neither → skip (no location available)
 *
 * For point comments (same start/end), the range is expanded to cover
 * at least 1 character using getPointCommentMarkRange.
 *
 * @param options - Options for applying comments
 * @returns Result with counts, errors, and created discussions
 *
 * @example
 * ```ts
 * import { parseDocxComments } from './parseDocxTracking';
 * import { applyTrackedCommentsLocal } from './applyDocxComments';
 * import { getCommentKey } from '@platejs/comment';
 * import { nanoid } from 'nanoid';
 *
 * const { comments } = parseDocxComments(html);
 *
 * const result = applyTrackedCommentsLocal({
 *   editor,
 *   comments,
 *   searchRange: mySearchRangeFn,
 *   commentKey: 'comment',
 *   getCommentKey,
 *   isText: TextApi.isText,
 *   generateId: nanoid,
 *   documentDate: new Date(file.lastModified),
 * });
 *
 * // Store discussions in plugin state
 * editor.setOption(discussionPlugin, 'discussions', [
 *   ...existingDiscussions,
 *   ...result.discussions,
 * ]);
 *
 * console.log(`Applied ${result.applied} comments`);
 * ```
 */
export function applyTrackedCommentsLocal(
  options: ApplyCommentsLocalOptions
): ApplyCommentsLocalResult {
  const {
    editor,
    comments,
    searchRange,
    commentKey,
    getCommentKey,
    isText,
    generateId,
    documentDate,
  } = options;

  const errors: string[] = [];
  let applied = 0;
  const discussions: DocxImportDiscussion[] = [];

  for (const comment of comments) {
    try {
      // Find the token ranges - search for actual tokens in editor
      const startTokenRange = comment.hasStartToken
        ? searchRange(editor, comment.startToken)
        : null;
      const endTokenRange = comment.hasEndToken
        ? searchRange(editor, comment.endToken)
        : null;

      const hasStartMarker = Boolean(startTokenRange);
      const hasEndMarker = Boolean(endTokenRange);

      // Golden rule: if we have ANY location marker, preserve the comment
      if (!startTokenRange && !endTokenRange) {
        errors.push(`Comment ${comment.id}: no location markers found`);
        continue;
      }

      // Check if both tokens exist but resolve to the same range (same token string)
      const isSameTokenString = comment.startToken === comment.endToken;
      const isSameRange = isRangeEqual(startTokenRange, endTokenRange);

      // Use whichever marker we have, fallback to the other for point comments
      const effectiveStartRange = startTokenRange ?? endTokenRange;
      const effectiveEndRange = endTokenRange ?? startTokenRange;

      if (!effectiveStartRange || !effectiveEndRange) {
        errors.push(`Comment ${comment.id}: invalid ranges`);
        continue;
      }

      // Use rangeRef to track ranges through operations
      const startTokenRef = editor.api.rangeRef(effectiveStartRange);
      // Only create separate endTokenRef if it's a different range
      const endTokenRef =
        isSameRange || isSameTokenString
          ? startTokenRef
          : editor.api.rangeRef(effectiveEndRange);

      const currentStartRange = startTokenRef.current;
      const currentEndRange = endTokenRef.current;

      if (!currentStartRange || !currentEndRange) {
        startTokenRef.unref();
        if (!isSameRange && !isSameTokenString) {
          endTokenRef.unref();
        }
        errors.push(`Comment ${comment.id}: ranges became invalid`);
        continue;
      }

      // Detect point comment: both tokens adjacent or same location
      const startEnd = currentStartRange.focus;
      const endStart = currentEndRange.anchor;
      const isPointComment =
        isSameRange ||
        isSameTokenString ||
        isPointEqual(startEnd, endStart) ||
        (!hasStartMarker && hasEndMarker) ||
        (hasStartMarker && !hasEndMarker);

      // Create discussion data - use exact author name from DOCX
      const discussionId = generateId();
      // Use author name directly (not as userId for lookup)
      const authorName = comment.authorName ?? undefined;
      // userId for internal tracking - use author name or fallback
      const userId = formatAuthorAsUserId(comment.authorName);
      // Use comment date if available, else document date, else current date
      const createdAt = parseDateToDate(comment.date, documentDate);

      // Create the discussion with comment
      const discussion: DocxImportDiscussion = {
        id: discussionId,
        comments: [
          {
            contentRich: [
              {
                type: 'p',
                children: [{ text: comment.text ?? '' }],
              },
            ],
            createdAt,
            userId,
            // Pass direct author info from DOCX (displayed directly in UI)
            user: authorName ? { id: userId, name: authorName } : undefined,
          },
        ],
        createdAt,
        documentContent: comment.text ?? '',
        userId,
        // Pass exact author info from DOCX
        user: authorName ? { id: userId, name: authorName } : undefined,
      };

      discussions.push(discussion);

      // Apply comment marks to the text between tokens
      editor.tf.withMerging(() => {
        const currentStart = startTokenRef.current;
        const currentEnd = endTokenRef.current;

        if (currentStart && currentEnd) {
          let markAnchor = currentStart.focus;
          let markFocus = currentEnd.anchor;

          if (isPointAfter(markAnchor, markFocus)) {
            [markAnchor, markFocus] = [markFocus, markAnchor];
          }

          // For point comments, expand range to include adjacent character
          if (isPointComment || isPointEqual(markAnchor, markFocus)) {
            // Try to use getPointCommentMarkRange for robust expansion
            const expandedRange = getPointCommentMarkRange(editor, markFocus, {
              preferBefore: false,
              skipCurrentNode: false,
              isText,
            });

            if (expandedRange) {
              markAnchor = expandedRange.anchor;
              markFocus = expandedRange.focus;
            } else {
              // Fallback: simple expansion
              // Try to expand the range to mark at least 1 character
              // Prefer text AFTER the token position
              const expandedFocus = {
                ...markFocus,
                offset: markFocus.offset + 1,
              };
              markFocus = expandedFocus;

              // If still empty (at end of node), try expanding anchor backward
              if (
                isPointEqual(markAnchor, markFocus) &&
                markAnchor.offset > 0
              ) {
                markAnchor = { ...markAnchor, offset: markAnchor.offset - 1 };
              }
            }
          }

          const markRange = { anchor: markAnchor, focus: markFocus };

          // Only apply marks if we have a non-empty range
          if (!isPointEqual(markRange.anchor, markRange.focus)) {
            // Apply comment marks
            editor.tf.setNodes(
              {
                [commentKey]: true,
                [getCommentKey(discussionId)]: true,
              },
              {
                at: markRange,
                match: isText,
                split: true,
              }
            );
          }
        }
      });

      // Delete the tokens - handle same range case to avoid double-delete
      if (isSameRange || isSameTokenString) {
        // Both refs point to same range - only delete once
        const tokenRange = startTokenRef.unref();
        if (tokenRange && (hasStartMarker || hasEndMarker)) {
          editor.tf.delete({ at: tokenRange });
        }
      } else {
        // Different ranges - delete both, but unref first to get stable ranges
        // Unref BOTH before deleting to capture ranges before mutations
        const endRange = endTokenRef.unref();
        const startRange = startTokenRef.unref();

        // Delete end first (usually after start in document), then start
        if (hasEndMarker && endRange) {
          editor.tf.delete({ at: endRange });
        }
        if (hasStartMarker && startRange) {
          // Re-search for start token since document changed after end deletion
          const updatedStartRange = searchRange(editor, comment.startToken);
          if (updatedStartRange) {
            editor.tf.delete({ at: updatedStartRange });
          }
        }
      }

      applied++;
    } catch (error) {
      errors.push(
        `Comment ${comment.id}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return { applied, errors, discussions };
}
