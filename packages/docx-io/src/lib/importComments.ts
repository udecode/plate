/**
 * DOCX Comments Import
 *
 * This module provides utilities for parsing and applying comments from
 * DOCX files to a Plate editor.
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
} from './importTrackChanges';
import type { TRange } from './searchRange';

import {
  DOCX_COMMENT_END_TOKEN_PREFIX,
  DOCX_COMMENT_START_TOKEN_PREFIX,
  DOCX_COMMENT_TOKEN_SUFFIX,
} from './html-to-docx/tracking';

// Re-export token constants for test usage
export {
  DOCX_COMMENT_END_TOKEN_PREFIX,
  DOCX_COMMENT_START_TOKEN_PREFIX,
  DOCX_COMMENT_TOKEN_SUFFIX,
} from './html-to-docx/tracking';

// Re-export shared types
export type {
  SearchRangeFn,
  TPoint,
  TrackingEditor,
} from './importTrackChanges';
export type { TRange } from './searchRange';

// ============================================================================
// Types
// ============================================================================

/** Comment data structure matching the JSON payload */
export type DocxCommentData = {
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
  /** Comment rich text body */
  body?: unknown;
  /** Threading ID */
  paraId?: string;
  /** Parent Threading ID */
  parentParaId?: string;
  /** Is this a point comment? */
  isPoint?: boolean;
  /** Nested replies */
  replies?: DocxCommentData[];
};

/** Comment parsed from HTML with token metadata */
export type DocxImportCommentReply = Omit<DocxCommentData, 'replies'> & {
  /** The full start token string (for searching in editor) */
  startToken: string;
  /** The full end token string (for searching in editor) */
  endToken: string;
  /** The full point token string (comment reference start+end) */
  pointToken?: string;
  /** Whether the start token was found in HTML */
  hasStartToken: boolean;
  /** Whether the end token was found in HTML */
  hasEndToken: boolean;
  /** Whether a point token was found in HTML */
  hasPointToken?: boolean;
  /** Nested replies */
  replies?: DocxImportCommentReply[];
};

/** Comment parsed from HTML with token metadata */
export type DocxImportComment = Omit<DocxCommentData, 'replies'> & {
  /** The full start token string (for searching in editor) */
  startToken: string;
  /** The full end token string (for searching in editor) */
  endToken: string;
  /** The full point token string (comment reference start+end) */
  pointToken?: string;
  /** Whether the start token was found in HTML */
  hasStartToken: boolean;
  /** Whether the end token was found in HTML */
  hasEndToken: boolean;
  /** Whether a point token was found in HTML */
  hasPointToken?: boolean;
  /** Nested replies */
  replies?: DocxImportCommentReply[];
};

/** Result of parsing comments from HTML */
export type ParseCommentsResult = {
  /** All comments found */
  comments: DocxImportComment[];
  /** Number of comments found */
  count: number;
};

/** Discussion data created from DOCX comment (for local storage/import) */
export type DocxImportDiscussion = {
  /** Unique discussion ID */
  id: string;
  /** Comments in this discussion */
  comments?: Array<{
    /** Unique ID for the comment */
    id?: string;
    /** Rich content of the comment */
    contentRich?: unknown;
    /** When the comment was created */
    createdAt?: Date;
    /** OOXML paraId for round-trip threading fidelity */
    paraId?: string;
    /** OOXML parentParaId for round-trip reply threading */
    parentParaId?: string;
    /** User ID of the commenter */
    userId?: string;
    /** Optional user object for direct author info */
    user?: { id: string; name: string };
  }>;
  /** When the discussion was created */
  createdAt?: Date;
  /** The document text that was commented on */
  documentContent?: string;
  /** OOXML paraId of the root comment for round-trip threading fidelity */
  paraId?: string;
  /** User ID who created the discussion */
  userId?: string;
  /** Optional user object for direct author info */
  user?: { id: string; name: string };
};

// ============================================================================
// Comment Content Normalization
// ============================================================================

const isPlateText = (node: any): node is { text: string } =>
  !!node && typeof node === 'object' && typeof node.text === 'string';

const isPlateElement = (node: any): node is { children: unknown[] } =>
  !!node && typeof node === 'object' && Array.isArray(node.children);

const isPlateNode = (node: any): boolean =>
  isPlateText(node) ||
  (isPlateElement(node) && node.children.every((child) => isPlateNode(child)));

const isPlateValue = (value: unknown): value is unknown[] =>
  Array.isArray(value) && value.every((node) => isPlateNode(node));

const extractCommentBodyText = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map(extractCommentBodyText).join('');
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;

    if (typeof record.text === 'string') return record.text;
    if (typeof record.value === 'string') return record.value;
    if (Array.isArray(record.children)) {
      return record.children.map(extractCommentBodyText).join('');
    }
  }
  return '';
};

const normalizeCommentContent = (
  body: unknown,
  text?: string
): unknown[] | undefined => {
  if (isPlateValue(body)) return body as unknown[];

  const bodyText = extractCommentBodyText(body);
  const contentText = (bodyText || text || '').replace(/\s+$/g, '');

  if (!contentText) return;

  return [{ type: 'p', children: [{ text: contentText }] }];
};

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
// Parsing Functions
// ============================================================================

/** Escape special regex characters in a string */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Parse comment tokens from HTML.
 */
export function parseDocxComments(html: string): ParseCommentsResult {
  const commentsById = new Map<string, DocxImportComment>();

  const upsertComment = (
    id: string,
    patch: Partial<DocxImportComment> & {
      hasStartToken?: boolean;
      hasEndToken?: boolean;
      hasPointToken?: boolean;
    }
  ) => {
    const existing = commentsById.get(id);
    if (!existing) {
      commentsById.set(id, {
        id,
        authorName: patch.authorName,
        authorInitials: patch.authorInitials,
        date: patch.date,
        text: patch.text,
        body: patch.body,
        paraId: patch.paraId,
        parentParaId: patch.parentParaId,
        isPoint: patch.isPoint,
        replies: patch.replies as DocxImportCommentReply[],
        startToken: patch.startToken ?? patch.endToken ?? '',
        endToken: patch.endToken ?? '',
        pointToken: patch.pointToken,
        hasStartToken: Boolean(patch.hasStartToken),
        hasEndToken: Boolean(patch.hasEndToken),
        hasPointToken: Boolean(patch.hasPointToken),
      });
      return;
    }

    commentsById.set(id, {
      ...existing,
      authorName: patch.authorName ?? existing.authorName,
      authorInitials: patch.authorInitials ?? existing.authorInitials,
      date: patch.date ?? existing.date,
      text: patch.text ?? existing.text,
      body: patch.body ?? existing.body,
      paraId: patch.paraId ?? existing.paraId,
      parentParaId: patch.parentParaId ?? existing.parentParaId,
      isPoint: patch.isPoint ?? existing.isPoint,
      replies: (patch.replies as DocxImportCommentReply[]) ?? existing.replies,
      startToken: existing.hasStartToken
        ? existing.startToken
        : (patch.startToken ?? existing.startToken),
      endToken: patch.endToken ?? existing.endToken,
      pointToken: patch.pointToken ?? existing.pointToken,
      hasStartToken: existing.hasStartToken || Boolean(patch.hasStartToken),
      hasEndToken: existing.hasEndToken || Boolean(patch.hasEndToken),
      hasPointToken: existing.hasPointToken || Boolean(patch.hasPointToken),
    });
  };

  // Parse comment start tokens
  const startPattern = new RegExp(
    `${escapeRegExp(DOCX_COMMENT_START_TOKEN_PREFIX)}(.*?)${escapeRegExp(DOCX_COMMENT_TOKEN_SUFFIX)}`,
    'g'
  );

  for (const match of html.matchAll(startPattern)) {
    const rawPayload = match[1];
    if (!rawPayload) continue;

    try {
      const payload = JSON.parse(
        decodeURIComponent(rawPayload)
      ) as DocxCommentData;
      if (!payload.id) continue;

      const startToken = `${DOCX_COMMENT_START_TOKEN_PREFIX}${rawPayload}${DOCX_COMMENT_TOKEN_SUFFIX}`;
      const endToken = `${DOCX_COMMENT_END_TOKEN_PREFIX}${encodeURIComponent(payload.id)}${DOCX_COMMENT_TOKEN_SUFFIX}`;
      const pointToken = payload.isPoint ? startToken + endToken : undefined;

      upsertComment(payload.id, {
        ...(payload as Omit<DocxCommentData, 'replies'>),
        replies: payload.replies as DocxImportCommentReply[] | undefined,
        ...(payload.isPoint
          ? {
              pointToken,
              hasPointToken: true,
            }
          : {
              startToken,
              endToken,
              hasStartToken: true,
            }),
      });
    } catch {
      // Skip malformed tokens
    }
  }

  // Parse comment end tokens
  const endPattern = new RegExp(
    `${escapeRegExp(DOCX_COMMENT_END_TOKEN_PREFIX)}(.*?)${escapeRegExp(DOCX_COMMENT_TOKEN_SUFFIX)}`,
    'g'
  );

  for (const match of html.matchAll(endPattern)) {
    const rawPayload = match[1];
    if (!rawPayload) continue;

    try {
      const id = decodeURIComponent(rawPayload);
      if (!id) continue;

      const endToken = `${DOCX_COMMENT_END_TOKEN_PREFIX}${rawPayload}${DOCX_COMMENT_TOKEN_SUFFIX}`;
      upsertComment(id, {
        endToken,
        startToken: endToken,
        hasEndToken: true,
      });
    } catch {
      // Skip malformed tokens
    }
  }

  const comments = Array.from(commentsById.values());
  return { comments, count: comments.length };
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
 * it to cover at least one character so it can be marked.
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
    const textEntries = Array.from(
      editor.api.nodes<{ text?: string }>({
        at: [],
        match: isText,
      })
    );

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

/**
 * Resolve target ranges for a comment (mark range and content range).
 */
export function resolveCommentTargetRanges(
  editor: TrackingEditor,
  ranges: {
    startRange: TRange;
    endRange: TRange;
    pointRange: TRange | null;
  },
  options: {
    hasStartMarker: boolean;
    hasEndMarker: boolean;
    isText: (node: unknown) => boolean;
  }
): { markRange: TRange | null; contentRange: TRange } {
  const { startRange, endRange, pointRange } = ranges;
  const { hasStartMarker, hasEndMarker, isText } = options;

  const startTokenPoint = startRange.focus;
  const endTokenPoint = endRange.anchor;
  const shouldUsePointMarker =
    !!pointRange &&
    (!hasStartMarker ||
      !hasEndMarker ||
      isPointEqual(startTokenPoint, endTokenPoint));

  // Detect point comments
  const isPointComment =
    shouldUsePointMarker ||
    !hasStartMarker ||
    !hasEndMarker ||
    isPointEqual(startTokenPoint, endTokenPoint);

  // Check if both tokens exist but are collapsed (at same position)
  const pointHasNoSpan =
    hasStartMarker &&
    hasEndMarker &&
    isPointEqual(startTokenPoint, endTokenPoint);

  if (!isPointComment) {
    // Normal range comment - just normalize direction
    let anchor = startTokenPoint;
    let focus = endTokenPoint;

    if (isPointAfter(anchor, focus)) {
      [anchor, focus] = [focus, anchor];
    }

    const range = { anchor, focus };
    return { markRange: range, contentRange: range };
  }

  // Point comment - determine expansion direction based on which marker exists
  // - Only end token → prefer expanding before (true)
  // - Only start token → prefer expanding after (false)
  // - Both collapsed → prefer before (true)
  const preferBefore = !(hasStartMarker && !hasEndMarker);

  // Use the appropriate point for marking
  const pointForMark = shouldUsePointMarker
    ? pointRange!.focus
    : hasStartMarker && !hasEndMarker
      ? startTokenPoint
      : endTokenPoint;

  // Expand point to a single-character range
  const markRange = getPointCommentMarkRange(editor, pointForMark, {
    preferBefore,
    skipCurrentNode: pointHasNoSpan,
    isText,
  });

  return {
    markRange,
    contentRange: markRange ?? {
      anchor: pointForMark,
      focus: pointForMark,
    },
  };
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
  editor: TrackingEditor;
  comments: DocxImportComment[];
  searchRange: SearchRangeFn;
  documentId: string;
  createDiscussionWithComment: CreateDiscussionFn;
  commentKey: string;
  getCommentKey: (discussionId: string) => string;
  getTransientCommentKey?: () => string;
  isText: (node: unknown) => boolean;
  commentPlugin?: unknown;
  onCommentsCreated?: () => void;
};

/** Result of applying tracked comments via API */
export type ApplyCommentsResult = {
  created: number;
  skipped: number;
  errors: string[];
};

/** Options for applying tracked comments locally (without API) */
export type ApplyCommentsLocalOptions = {
  editor: TrackingEditor;
  comments: DocxImportComment[];
  searchRange: SearchRangeFn;
  commentKey: string;
  getCommentKey: (discussionId: string) => string;
  isText: (node: unknown) => boolean;
  generateId: () => string;
  documentDate?: Date;
};

/** Result of applying tracked comments locally */
export type ApplyCommentsLocalResult = {
  applied: number;
  errors: string[];
  discussions: DocxImportDiscussion[];
};

// ============================================================================
// Apply Tracked Comments (API Mode)
// ============================================================================

/**
 * Apply tracked comments to the editor using an external API.
 *
 * This function handles point comments (where start and end are at the same
 * location) by expanding them to cover at least one character using the
 * getPointCommentMarkRange helper.
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
    let startTokenRef: ReturnType<TrackingEditor['api']['rangeRef']> | null =
      null;
    let endTokenRef: ReturnType<TrackingEditor['api']['rangeRef']> | null =
      null;
    let pointTokenRef: ReturnType<TrackingEditor['api']['rangeRef']> | null =
      null;

    try {
      const startTokenRange = comment.hasStartToken
        ? searchRange(editor, comment.startToken)
        : null;
      const endTokenRange = comment.hasEndToken
        ? searchRange(editor, comment.endToken)
        : null;
      const pointTokenRange =
        comment.hasPointToken && comment.pointToken
          ? searchRange(editor, comment.pointToken)
          : null;

      const hasStartMarker = Boolean(startTokenRange);
      const hasEndMarker = Boolean(endTokenRange);
      const hasPointMarker = Boolean(pointTokenRange);

      // Golden rule: if we have ANY location marker, preserve the comment
      // - Has start, no end → end = start (point comment)
      // - Has end, no start → start = end (point comment)
      // - Has neither → skip (no location available)
      if (!startTokenRange && !endTokenRange && !pointTokenRange) {
        skipped++;
        continue;
      }

      // Use whichever marker we have, fallback to the other for point comments
      const effectiveStartRange =
        startTokenRange ?? endTokenRange ?? pointTokenRange;
      const effectiveEndRange =
        endTokenRange ?? startTokenRange ?? pointTokenRange;

      if (!effectiveStartRange || !effectiveEndRange) {
        skipped++;
        continue;
      }

      startTokenRef = editor.api.rangeRef(effectiveStartRange);
      endTokenRef = editor.api.rangeRef(effectiveEndRange);
      pointTokenRef =
        hasPointMarker && pointTokenRange
          ? editor.api.rangeRef(pointTokenRange)
          : null;

      if (!startTokenRef || !endTokenRef) {
        skipped++;
        continue;
      }

      const currentStartRange = startTokenRef.current;
      const currentEndRange = endTokenRef.current;
      const currentPointRange = pointTokenRef?.current ?? null;

      if (!currentStartRange || !currentEndRange) {
        skipped++;
        continue;
      }

      // Get content range for document text extraction
      const { contentRange } = resolveCommentTargetRanges(
        editor,
        {
          startRange: currentStartRange,
          endRange: currentEndRange,
          pointRange: currentPointRange,
        },
        {
          hasStartMarker,
          hasEndMarker,
          isText,
        }
      );

      let documentContent = stripDocxTrackingTokens(
        editor.api.string(contentRange)
      );
      if (!documentContent || documentContent.trim().length === 0) {
        documentContent = 'Imported comment';
      }

      const commentText = stripDocxTrackingTokens(comment.text ?? '');
      const contentRich = commentText
        ? [{ children: [{ text: commentText }], type: 'p' }]
        : undefined;

      const discussion = await createDiscussionWithComment.mutateAsync({
        contentRich,
        documentContent,
        documentId,
      });

      created++;

      editor.tf.withMerging(() => {
        const currentStart = startTokenRef?.current;
        const currentEnd = endTokenRef?.current;
        const currentPoint = pointTokenRef?.current ?? null;

        if (currentStart && currentEnd) {
          // Re-resolve ranges after potential mutations
          const { markRange } = resolveCommentTargetRanges(
            editor,
            {
              startRange: currentStart,
              endRange: currentEnd,
              pointRange: currentPoint,
            },
            {
              hasStartMarker,
              hasEndMarker,
              isText,
            }
          );

          if (!markRange) {
            // Could not resolve a valid mark range
            return;
          }

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

      const pointRange = pointTokenRef?.current ?? null;
      const startRange = startTokenRef.current;
      const endRange = endTokenRef.current;
      const skipEndDelete = Boolean(pointRange) && !hasStartMarker;
      const skipStartDelete = Boolean(pointRange) && !hasEndMarker;
      const sameStartEnd =
        startRange && endRange ? isRangeEqual(startRange, endRange) : false;

      // Delete tokens (only delete tokens that actually existed)
      // For point comments, both refs may point to the same range
      if (
        hasPointMarker &&
        pointRange &&
        (!startRange || !isRangeEqual(pointRange, startRange)) &&
        (!endRange || !isRangeEqual(pointRange, endRange))
      ) {
        editor.tf.delete({ at: pointTokenRef!.current! });
      }
      if (!skipEndDelete && hasEndMarker && endRange) {
        editor.tf.delete({ at: endTokenRef.current! });
      }
      if (!skipStartDelete && hasStartMarker && startRange && !sameStartEnd) {
        editor.tf.delete({ at: startTokenRef.current! });
      }
    } catch (error) {
      errors.push(
        `Failed to apply comment ${comment.id}: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      pointTokenRef?.unref();
      if (endTokenRef && (!startTokenRef || endTokenRef !== startTokenRef)) {
        endTokenRef.unref();
      }
      startTokenRef?.unref();
    }
  }

  if (created > 0 && onCommentsCreated) {
    onCommentsCreated();
  }

  return { created, skipped, errors };
}

// ============================================================================
// Apply Tracked Comments (Local Mode)
// ============================================================================

/**
 * Apply tracked comments to the editor locally (without API calls).
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
  const processedCommentIds = new Set<string>();

  // Process all comments; replies skip discussion creation but still remove tokens.
  for (const comment of comments) {
    const isReplyComment = Boolean(comment.parentParaId);
    try {
      const startTokenRange = comment.hasStartToken
        ? searchRange(editor, comment.startToken)
        : null;
      const endTokenRange = comment.hasEndToken
        ? searchRange(editor, comment.endToken)
        : null;
      const pointTokenRange =
        comment.hasPointToken && comment.pointToken
          ? searchRange(editor, comment.pointToken)
          : null;

      const hasStartMarker = Boolean(startTokenRange);
      const hasEndMarker = Boolean(endTokenRange);
      const hasPointMarker = Boolean(pointTokenRange);

      if (!startTokenRange && !endTokenRange && !pointTokenRange) {
        errors.push(`Comment ${comment.id}: no location markers found`);
        continue;
      }

      const isSameTokenString = comment.startToken === comment.endToken;
      const isSameRange = isRangeEqual(startTokenRange, endTokenRange);

      const effectiveStartRange =
        startTokenRange ?? endTokenRange ?? pointTokenRange;
      const effectiveEndRange =
        endTokenRange ?? startTokenRange ?? pointTokenRange;

      if (!effectiveStartRange || !effectiveEndRange) {
        errors.push(`Comment ${comment.id}: invalid ranges`);
        continue;
      }

      const startTokenRef = editor.api.rangeRef(effectiveStartRange);
      const endTokenRef =
        isSameRange || isSameTokenString
          ? startTokenRef
          : editor.api.rangeRef(effectiveEndRange);
      const pointTokenRef =
        hasPointMarker && pointTokenRange
          ? editor.api.rangeRef(pointTokenRange)
          : null;

      const currentStartRange = startTokenRef.current;
      const currentEndRange = endTokenRef.current;

      if (!currentStartRange || !currentEndRange) {
        startTokenRef.unref();
        if (!isSameRange && !isSameTokenString) {
          endTokenRef.unref();
        }
        if (pointTokenRef) {
          pointTokenRef.unref();
        }
        errors.push(`Comment ${comment.id}: ranges became invalid`);
        continue;
      }

      let discussion: DocxImportDiscussion | null = null;

      if (!isReplyComment && !processedCommentIds.has(comment.id)) {
        const discussionId = generateId();

        const discussionComments: NonNullable<
          DocxImportDiscussion['comments']
        > = [];

        const addCommentRecursive = (
          c: Pick<
            DocxCommentData,
            | 'authorName'
            | 'body'
            | 'date'
            | 'text'
            | 'id'
            | 'paraId'
            | 'parentParaId'
          > & {
            replies?: Pick<
              DocxCommentData,
              | 'authorName'
              | 'body'
              | 'date'
              | 'text'
              | 'id'
              | 'paraId'
              | 'parentParaId'
            >[];
          }
        ) => {
          processedCommentIds.add(c.id);

          const userId = formatAuthorAsUserId(c.authorName);
          const createdAt = parseDateToDate(c.date, documentDate);

          const contentRich = normalizeCommentContent(c.body, c.text);

          discussionComments.push({
            contentRich,
            createdAt,
            id: c.id,
            paraId: c.paraId,
            parentParaId: c.parentParaId ?? undefined,
            userId,
            user: c.authorName ? { id: userId, name: c.authorName } : undefined,
          });

          if (c.replies) {
            c.replies.forEach(addCommentRecursive);
          }
        };

        addCommentRecursive(comment);

        // Resolve range early to get document content
        const { contentRange } = resolveCommentTargetRanges(
          editor,
          {
            startRange: currentStartRange,
            endRange: currentEndRange,
            pointRange: pointTokenRef?.current ?? null,
          },
          {
            hasStartMarker,
            hasEndMarker,
            isText,
          }
        );

        let documentContent = stripDocxTrackingTokens(
          editor.api.string(contentRange)
        );
        if (!documentContent || documentContent.trim().length === 0) {
          documentContent = stripDocxTrackingTokens(comment.text ?? '');
        }

        discussion = {
          id: discussionId,
          comments: discussionComments,
          createdAt: discussionComments[0]?.createdAt,
          documentContent,
          paraId: comment.paraId,
          userId: discussionComments[0]?.userId,
          user: discussionComments[0]?.user,
        };

        editor.tf.withMerging(() => {
          const currentStart = startTokenRef.current;
          const currentEnd = endTokenRef.current;
          const currentPoint = pointTokenRef?.current ?? null;

          if (currentStart && currentEnd) {
            // Re-resolve range inside transaction
            const { markRange } = resolveCommentTargetRanges(
              editor,
              {
                startRange: currentStart,
                endRange: currentEnd,
                pointRange: currentPoint,
              },
              {
                hasStartMarker,
                hasEndMarker: hasEndMarker && !isSameTokenString,
                isText,
              }
            );

            if (markRange) {
              editor.tf.setNodes(
                {
                  [getCommentKey(discussionId)]: true,
                  [commentKey]: true,
                },
                { at: markRange, match: isText, split: true }
              );
            } else {
              errors.push(`Comment ${comment.id}: could not key range`);
            }
          }
        });
      }

      const pointRange = pointTokenRef?.current ?? null;
      const startRange = startTokenRef.current;
      const endRange = endTokenRef.current;
      const skipEndDelete = Boolean(pointRange) && !hasStartMarker;
      const skipStartDelete = Boolean(pointRange) && !hasEndMarker;
      const sameStartEnd = isRangeEqual(startRange, endRange);

      if (
        hasPointMarker &&
        pointRange &&
        !isRangeEqual(pointRange, startRange) &&
        !isRangeEqual(pointRange, endRange)
      ) {
        editor.tf.delete({ at: pointTokenRef!.current! });
      }
      if (!skipEndDelete && hasEndMarker && endRange) {
        editor.tf.delete({ at: endTokenRef.current! });
      }
      if (
        !skipStartDelete &&
        hasStartMarker &&
        startRange &&
        !isSameTokenString &&
        !sameStartEnd
      ) {
        editor.tf.delete({ at: startTokenRef.current! });
      }

      pointTokenRef?.unref();
      if (endTokenRef !== startTokenRef) {
        endTokenRef.unref();
      }
      startTokenRef.unref();

      if (discussion) {
        discussions.push(discussion);
        applied++;
      }
    } catch (error) {
      errors.push(
        `Comment ${comment.id}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return { applied, errors, discussions };
}

// ============================================================================
// Combined Parsing & Utility Functions
// ============================================================================

import {
  applyTrackedChangeSuggestions,
  hasDocxTrackingTokens as hasTrackChangeTokens,
  parseDocxTrackedChanges,
  type ApplySuggestionsOptions,
  type ApplySuggestionsResult,
  type ParseTrackedChangesResult,
} from './importTrackChanges';
import type { DocxTrackedChange } from './types';

/** Result of parsing all tracking information from HTML */
export type ParseDocxTrackingResult = {
  /** Tracked changes (insertions and deletions) */
  trackedChanges: ParseTrackedChangesResult;
  /** Comments */
  comments: ParseCommentsResult;
  /** Whether any tracking tokens were found */
  hasTracking: boolean;
};

/**
 * Parse all DOCX tracking tokens from HTML.
 *
 * This is a convenience function that combines tracked changes and
 * comment parsing in a single call.
 *
 * @param html - The HTML string containing tracking tokens
 * @returns All parsed tracking information
 */
export function parseDocxTracking(html: string): ParseDocxTrackingResult {
  const trackedChanges = parseDocxTrackedChanges(html);
  const comments = parseDocxComments(html);

  const hasTracking =
    trackedChanges.changes.length > 0 || comments.comments.length > 0;

  return { trackedChanges, comments, hasTracking };
}

/**
 * Check if HTML contains any DOCX tracking tokens (changes or comments).
 */
export function hasDocxTrackingTokens(html: string): boolean {
  return (
    hasTrackChangeTokens(html) || html.includes(DOCX_COMMENT_START_TOKEN_PREFIX)
  );
}

/**
 * Remove all DOCX tracking tokens from HTML (changes and comments).
 */
export function stripDocxTrackingTokens(html: string): string {
  const tokenPattern = /\[\[DOCX_(INS|DEL|CMT)_(START|END):[^\]]+\]\]/g;
  return html.replace(tokenPattern, '');
}

// ============================================================================
// Combined Application
// ============================================================================

/** Result of importing DOCX with full tracking support */
export type ImportWithTrackingResult = {
  /** Suggestions result */
  suggestions: ApplySuggestionsResult;
  /** Comments result (may be null if not applied) */
  comments: ApplyCommentsResult | null;
  /** Total tracked items applied */
  totalApplied: number;
};

/** Options for applying all tracking */
export type ApplyAllTrackingOptions = {
  /** The editor instance */
  editor: TrackingEditor;
  /** Tracked changes to apply */
  trackedChanges: DocxTrackedChange[];
  /** Comments to apply (optional) */
  comments?: DocxImportComment[];
  /** Function to search for ranges in editor */
  searchRange: SearchRangeFn;
  /** Config for applying suggestions */
  suggestionConfig: Omit<
    ApplySuggestionsOptions,
    'editor' | 'changes' | 'searchRange'
  >;
  /** Config for applying comments (optional - if not provided, comments won't be applied) */
  commentConfig?: Omit<
    ApplyCommentsOptions,
    'editor' | 'comments' | 'searchRange'
  >;
};

/**
 * Apply all tracked changes and comments from parsed DOCX.
 *
 * This is a convenience function that combines suggestion and comment
 * application. Comments are optional and require API integration.
 */
export async function applyAllTracking(
  options: ApplyAllTrackingOptions
): Promise<ImportWithTrackingResult> {
  const {
    editor,
    trackedChanges,
    comments,
    searchRange,
    suggestionConfig,
    commentConfig,
  } = options;

  // Apply suggestions
  const suggestionsResult = applyTrackedChangeSuggestions({
    editor,
    changes: trackedChanges,
    searchRange,
    ...suggestionConfig,
  });

  // Apply comments if config provided and there are comments
  let commentsResult: ApplyCommentsResult | null = null;
  if (commentConfig && comments && comments.length > 0) {
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
    totalApplied: suggestionsResult.total + (commentsResult?.created ?? 0),
  };
}
