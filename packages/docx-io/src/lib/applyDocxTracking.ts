/**
 * DOCX Tracked Changes and Comments Application
 *
 * This module provides utilities for applying tracked changes and comments
 * from parsed DOCX tokens to a Plate editor.
 *
 * It requires:
 * 1. A mammoth.js fork that emits tracking tokens during conversion
 * 2. The parseDocxTracking utilities to extract tokens from HTML
 * 3. The searchRange utility to locate tokens in the editor
 *
 * Usage flow:
 * 1. Convert DOCX to HTML with mammoth (with tracking token support)
 * 2. Parse tokens from HTML using parseDocxTrackedChanges/parseDocxComments
 * 3. Deserialize HTML to editor nodes
 * 4. Apply tracked changes using applyTrackedChangeSuggestions
 * 5. Apply comments using applyTrackedComments
 */

import type { DocxImportComment, DocxTrackedChange } from './parseDocxTracking';

// ============================================================================
// Types
// ============================================================================

/** Range type compatible with Slate/Plate */
export interface TRange {
  anchor: { path: number[]; offset: number };
  focus: { path: number[]; offset: number };
}

/** Point type compatible with Slate/Plate */
export interface TPoint {
  path: number[];
  offset: number;
}

/** Editor interface for applying tracking changes */
export interface TrackingEditor {
  /** Get string content from a range */
  api: {
    string: (range: TRange) => string;
    rangeRef: (range: TRange) => {
      current: TRange | null;
      unref: () => TRange | null;
    };
  };
  /** Transform functions */
  tf: {
    setNodes: (
      props: Record<string, unknown>,
      options: { at: TRange; match: (node: unknown) => boolean; split: boolean }
    ) => void;
    delete: (options: { at: TRange }) => void;
    withMerging: (fn: () => void) => void;
  };
  /** Set plugin option */
  setOption?: (plugin: unknown, key: string, value: unknown) => void;
}

/** Function to search for a string in the editor and return its range */
export type SearchRangeFn = (
  editor: TrackingEditor,
  search: string
) => TRange | null;

/** Function to create a discussion with comment */
export interface CreateDiscussionFn {
  mutateAsync: (input: {
    contentRich?: unknown;
    documentContent: string;
    documentId: string;
  }) => Promise<{ id: string }>;
}

/** Options for applying tracked change suggestions */
export interface ApplySuggestionsOptions {
  /** The editor instance */
  editor: TrackingEditor;
  /** Tracked changes to apply */
  changes: DocxTrackedChange[];
  /** Function to search for ranges in editor */
  searchRange: SearchRangeFn;
  /** Key constant for suggestion marks (e.g., 'suggestion') */
  suggestionKey: string;
  /** Function to generate suggestion key property (e.g., getSuggestionKey) */
  getSuggestionKey: (id: string) => string;
  /** Function to check if node is text (e.g., TextApi.isText) */
  isText: (node: unknown) => boolean;
}

/** Options for applying tracked comments */
export interface ApplyCommentsOptions {
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
}

/** Result of applying tracked change suggestions */
export interface ApplySuggestionsResult {
  /** Number of insertions applied */
  insertions: number;
  /** Number of deletions applied */
  deletions: number;
  /** Total changes applied */
  total: number;
  /** Errors encountered */
  errors: string[];
}

/** Result of applying tracked comments */
export interface ApplyCommentsResult {
  /** Number of comments created */
  created: number;
  /** Number of comments skipped (no location) */
  skipped: number;
  /** Errors encountered */
  errors: string[];
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Compare two points to determine order.
 * Returns true if a is after b.
 */
function isPointAfter(a: TPoint, b: TPoint): boolean {
  for (let i = 0; i < Math.min(a.path.length, b.path.length); i++) {
    if (a.path[i] > b.path[i]) return true;
    if (a.path[i] < b.path[i]) return false;
  }
  if (a.path.length > b.path.length) return true;
  if (a.path.length < b.path.length) return false;
  return a.offset > b.offset;
}

/**
 * Format author name as userId.
 * Uses the author's name directly from the DOCX.
 */
function formatAuthorAsUserId(authorName: string | undefined): string {
  if (!authorName) return 'imported-unknown';
  return authorName;
}

/**
 * Parse date string to timestamp.
 * Returns Date.now() if parsing fails.
 */
function parseDate(dateString: string | undefined): number {
  if (!dateString) return Date.now();
  const parsed = Date.parse(dateString);
  return Number.isNaN(parsed) ? Date.now() : parsed;
}

// ============================================================================
// Apply Tracked Change Suggestions
// ============================================================================

/**
 * Apply tracked change suggestions (insertions and deletions) to the editor.
 *
 * This function:
 * 1. Finds start/end tokens in the editor using searchRange
 * 2. Applies suggestion marks to the text between tokens
 * 3. Removes the tokens from the document
 *
 * @param options - Options for applying suggestions
 * @returns Result with counts and errors
 *
 * @example
 * ```ts
 * import { parseDocxTrackedChanges } from './parseDocxTracking';
 * import { applyTrackedChangeSuggestions } from './applyDocxTracking';
 * import { getSuggestionKey } from '@platejs/suggestion';
 *
 * const { changes } = parseDocxTrackedChanges(html);
 *
 * const result = applyTrackedChangeSuggestions({
 *   editor,
 *   changes,
 *   searchRange: mySearchRangeFn,
 *   suggestionKey: 'suggestion',
 *   getSuggestionKey,
 *   isText: TextApi.isText,
 * });
 *
 * console.log(`Applied ${result.insertions} insertions, ${result.deletions} deletions`);
 * ```
 */
export function applyTrackedChangeSuggestions(
  options: ApplySuggestionsOptions
): ApplySuggestionsResult {
  const {
    editor,
    changes,
    searchRange,
    suggestionKey,
    getSuggestionKey,
    isText,
  } = options;

  let insertions = 0;
  let deletions = 0;
  const errors: string[] = [];

  for (const change of changes) {
    try {
      const startTokenRange = searchRange(editor, change.startToken);
      const endTokenRange = searchRange(editor, change.endToken);

      if (!startTokenRange || !endTokenRange) {
        // Clean up any orphan tokens
        if (startTokenRange) {
          editor.tf.delete({ at: startTokenRange });
        }
        if (endTokenRange) {
          editor.tf.delete({ at: endTokenRange });
        }
        errors.push(`Missing token for change ${change.id}`);
        continue;
      }

      // Use rangeRef to track ranges through node-splitting operations
      const startTokenRef = editor.api.rangeRef(startTokenRange);
      const endTokenRef = editor.api.rangeRef(endTokenRange);

      const currentStartRange = startTokenRef.current;
      const currentEndRange = endTokenRef.current;

      if (!currentStartRange || !currentEndRange) {
        startTokenRef.unref();
        endTokenRef.unref();
        errors.push(`Invalid range for change ${change.id}`);
        continue;
      }

      // Normalize range to ensure anchor comes before focus
      let startPoint = currentStartRange.focus;
      let endPoint = currentEndRange.anchor;

      if (isPointAfter(startPoint, endPoint)) {
        [startPoint, endPoint] = [endPoint, startPoint];
      }

      const changeRange = { anchor: startPoint, focus: endPoint };

      const createdAt = parseDate(change.date);
      const userId = formatAuthorAsUserId(change.author);

      // Apply suggestion marks
      editor.tf.setNodes(
        {
          [suggestionKey]: true,
          [getSuggestionKey(change.id)]: {
            id: change.id,
            type: change.type,
            userId,
            createdAt,
          },
        },
        {
          at: changeRange,
          match: isText,
          split: true,
        }
      );

      if (change.type === 'insert') {
        insertions++;
      } else {
        deletions++;
      }

      // Delete tokens (end first to avoid shifting)
      const endRange = endTokenRef.unref();
      if (endRange) {
        editor.tf.delete({ at: endRange });
      }

      const startRange = startTokenRef.unref();
      if (startRange) {
        editor.tf.delete({ at: startRange });
      }
    } catch (error) {
      errors.push(
        `Failed to apply change ${change.id}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return {
    insertions,
    deletions,
    total: insertions + deletions,
    errors,
  };
}

// ============================================================================
// Apply Tracked Comments
// ============================================================================

/**
 * Apply tracked comments to the editor.
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
 * import { applyTrackedComments } from './applyDocxTracking';
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
// Combined Import with Tracking
// ============================================================================

/** Result of importing DOCX with full tracking support */
export interface ImportWithTrackingResult {
  /** Suggestions result */
  suggestions: ApplySuggestionsResult;
  /** Comments result (may be null if not applied) */
  comments: ApplyCommentsResult | null;
  /** Total tracked items applied */
  totalApplied: number;
}

/**
 * Apply all tracked changes and comments from parsed DOCX.
 *
 * This is a convenience function that combines suggestion and comment
 * application. Comments are optional and require API integration.
 *
 * @example
 * ```ts
 * import { parseDocxTracking } from './parseDocxTracking';
 * import { applyAllTracking } from './applyDocxTracking';
 *
 * const tracking = parseDocxTracking(html);
 *
 * // Apply just suggestions
 * const result = await applyAllTracking({
 *   editor,
 *   trackedChanges: tracking.trackedChanges.changes,
 *   searchRange: mySearchRangeFn,
 *   suggestionConfig: { ... },
 * });
 *
 * // Or apply both suggestions and comments
 * const result = await applyAllTracking({
 *   editor,
 *   trackedChanges: tracking.trackedChanges.changes,
 *   comments: tracking.comments.comments,
 *   searchRange: mySearchRangeFn,
 *   suggestionConfig: { ... },
 *   commentConfig: { ... },
 * });
 * ```
 */
export async function applyAllTracking(options: {
  editor: TrackingEditor;
  trackedChanges: DocxTrackedChange[];
  comments?: DocxImportComment[];
  searchRange: SearchRangeFn;
  suggestionConfig: Omit<ApplySuggestionsOptions, 'editor' | 'changes' | 'searchRange'>;
  commentConfig?: Omit<ApplyCommentsOptions, 'editor' | 'comments' | 'searchRange'>;
}): Promise<ImportWithTrackingResult> {
  const {
    editor,
    trackedChanges,
    comments,
    searchRange,
    suggestionConfig,
    commentConfig,
  } = options;

  // Apply tracked change suggestions
  const suggestionsResult = applyTrackedChangeSuggestions({
    editor,
    changes: trackedChanges,
    searchRange,
    ...suggestionConfig,
  });

  // Apply comments if configuration provided
  let commentsResult: ApplyCommentsResult | null = null;
  if (comments && comments.length > 0 && commentConfig) {
    commentsResult = await applyTrackedComments({
      editor,
      comments,
      searchRange,
      ...commentConfig,
    });
  }

  return {
    suggestions: suggestionsResult,
    comments: commentsResult,
    totalApplied:
      suggestionsResult.total + (commentsResult?.created ?? 0),
  };
}
