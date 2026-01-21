/**
 * DOCX Tracked Changes and Comments Import Parsing
 *
 * This module provides utilities for parsing tracked changes and comments
 * from DOCX HTML output (from mammoth.js with tracked changes support).
 *
 * Token Format (matching export format in tracking.ts):
 * - Insertions: [[DOCX_INS_START:{payload}]] ... [[DOCX_INS_END:id]]
 * - Deletions: [[DOCX_DEL_START:{payload}]] ... [[DOCX_DEL_END:id]]
 * - Comments: [[DOCX_CMT_START:{payload}]] ... [[DOCX_CMT_END:id]]
 *
 * This is used when importing DOCX files that contain tracked changes
 * (requires a mammoth.js fork that emits these tokens).
 */

// Re-export token constants from tracking module
export {
  DOCX_COMMENT_END_TOKEN_PREFIX,
  DOCX_COMMENT_START_TOKEN_PREFIX,
  DOCX_COMMENT_TOKEN_SUFFIX,
  DOCX_DELETION_END_TOKEN_PREFIX,
  DOCX_DELETION_START_TOKEN_PREFIX,
  DOCX_DELETION_TOKEN_SUFFIX,
  DOCX_INSERTION_END_TOKEN_PREFIX,
  DOCX_INSERTION_START_TOKEN_PREFIX,
  DOCX_INSERTION_TOKEN_SUFFIX,
} from './html-to-docx/tracking';

import type { DocxTrackedChange } from './types';

export type { DocxTrackedChange };

/** Comment parsed from HTML with full metadata */
export type DocxImportComment = {
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

/** Result of parsing tracked changes from HTML */
export type ParseTrackedChangesResult = {
  /** All tracked changes found (insertions and deletions) */
  changes: DocxTrackedChange[];
  /** Number of insertions found */
  insertionCount: number;
  /** Number of deletions found */
  deletionCount: number;
};

/** Result of parsing comments from HTML */
export type ParseCommentsResult = {
  /** All comments found */
  comments: DocxImportComment[];
  /** Number of comments found */
  count: number;
};

// ============================================================================
// Token Constants (import from tracking for consistency)
// ============================================================================

import {
  DOCX_COMMENT_END_TOKEN_PREFIX,
  DOCX_COMMENT_START_TOKEN_PREFIX,
  DOCX_COMMENT_TOKEN_SUFFIX,
  DOCX_DELETION_END_TOKEN_PREFIX,
  DOCX_DELETION_START_TOKEN_PREFIX,
  DOCX_DELETION_TOKEN_SUFFIX,
  DOCX_INSERTION_END_TOKEN_PREFIX,
  DOCX_INSERTION_START_TOKEN_PREFIX,
  DOCX_INSERTION_TOKEN_SUFFIX,
} from './html-to-docx/tracking';

// ============================================================================
// Utility Functions
// ============================================================================

/** Escape special regex characters in a string */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// Tracked Changes Parsing
// ============================================================================

/**
 * Parse tracked change tokens (insertions and deletions) from HTML.
 *
 * This function extracts all tracked changes from HTML that contains
 * DOCX tracking tokens. It returns both the changes and token strings
 * needed to locate and apply them in an editor.
 *
 * @param html - The HTML string containing tracking tokens
 * @returns Parsed tracked changes with token strings
 *
 * @example
 * ```ts
 * const html = mammothResult.value;
 * const { changes, insertionCount, deletionCount } = parseDocxTrackedChanges(html);
 *
 * for (const change of changes) {
 *   // Find and apply each change in the editor
 *   const startRange = searchRange(editor, change.startToken);
 *   const endRange = searchRange(editor, change.endToken);
 *   // Apply suggestion marks...
 * }
 * ```
 */
export function parseDocxTrackedChanges(
  html: string
): ParseTrackedChangesResult {
  const changes: DocxTrackedChange[] = [];
  let insertionCount = 0;
  let deletionCount = 0;

  // Parse insertions
  const insertionPattern = new RegExp(
    `${escapeRegExp(DOCX_INSERTION_START_TOKEN_PREFIX)}(.*?)${escapeRegExp(DOCX_INSERTION_TOKEN_SUFFIX)}`,
    'g'
  );

  for (const match of html.matchAll(insertionPattern)) {
    const rawPayload = match[1];
    if (!rawPayload) continue;

    try {
      const payload = JSON.parse(decodeURIComponent(rawPayload)) as {
        id?: string;
        author?: string;
        date?: string;
      };
      if (!payload.id) continue;

      changes.push({
        id: payload.id,
        type: 'insert',
        author: payload.author,
        date: payload.date,
        startToken: `${DOCX_INSERTION_START_TOKEN_PREFIX}${rawPayload}${DOCX_INSERTION_TOKEN_SUFFIX}`,
        endToken: `${DOCX_INSERTION_END_TOKEN_PREFIX}${payload.id}${DOCX_INSERTION_TOKEN_SUFFIX}`,
      });
      insertionCount++;
    } catch {}
  }

  // Parse deletions
  const deletionPattern = new RegExp(
    `${escapeRegExp(DOCX_DELETION_START_TOKEN_PREFIX)}(.*?)${escapeRegExp(DOCX_DELETION_TOKEN_SUFFIX)}`,
    'g'
  );

  for (const match of html.matchAll(deletionPattern)) {
    const rawPayload = match[1];
    if (!rawPayload) continue;

    try {
      const payload = JSON.parse(decodeURIComponent(rawPayload)) as {
        id?: string;
        author?: string;
        date?: string;
      };
      if (!payload.id) continue;

      changes.push({
        id: payload.id,
        type: 'remove',
        author: payload.author,
        date: payload.date,
        startToken: `${DOCX_DELETION_START_TOKEN_PREFIX}${rawPayload}${DOCX_DELETION_TOKEN_SUFFIX}`,
        endToken: `${DOCX_DELETION_END_TOKEN_PREFIX}${payload.id}${DOCX_DELETION_TOKEN_SUFFIX}`,
      });
      deletionCount++;
    } catch {}
  }

  return { changes, insertionCount, deletionCount };
}

// ============================================================================
// Comments Parsing
// ============================================================================

/**
 * Parse comment tokens from HTML.
 *
 * This function extracts all comments from HTML that contains DOCX
 * comment tokens. It handles cases where only start or end tokens
 * are present (e.g., point comments).
 *
 * @param html - The HTML string containing comment tokens
 * @returns Parsed comments with metadata and token strings
 *
 * @example
 * ```ts
 * const html = mammothResult.value;
 * const { comments, count } = parseDocxComments(html);
 *
 * for (const comment of comments) {
 *   // Create comment in your backend
 *   const discussion = await createComment({
 *     text: comment.text,
 *     author: comment.authorName,
 *   });
 *
 *   // Apply comment marks to editor
 *   const startRange = searchRange(editor, comment.startToken);
 *   // ...
 * }
 * ```
 */
export function parseDocxComments(html: string): ParseCommentsResult {
  const commentsById = new Map<string, DocxImportComment>();

  const upsertComment = (
    id: string,
    patch: Partial<DocxImportComment> & {
      hasStartToken?: boolean;
      hasEndToken?: boolean;
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
        startToken: patch.startToken ?? patch.endToken ?? '',
        endToken: patch.endToken ?? '',
        hasStartToken: Boolean(patch.hasStartToken),
        hasEndToken: Boolean(patch.hasEndToken),
      });
      return;
    }

    commentsById.set(id, {
      ...existing,
      authorName: patch.authorName ?? existing.authorName,
      authorInitials: patch.authorInitials ?? existing.authorInitials,
      date: patch.date ?? existing.date,
      text: patch.text ?? existing.text,
      startToken: existing.hasStartToken
        ? existing.startToken
        : (patch.startToken ?? existing.startToken),
      endToken: patch.endToken ?? existing.endToken,
      hasStartToken: existing.hasStartToken || Boolean(patch.hasStartToken),
      hasEndToken: existing.hasEndToken || Boolean(patch.hasEndToken),
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
      const payload = JSON.parse(decodeURIComponent(rawPayload)) as {
        id?: string;
        authorName?: string;
        authorInitials?: string;
        date?: string;
        text?: string;
      };
      if (!payload.id) continue;

      upsertComment(payload.id, {
        authorName: payload.authorName,
        authorInitials: payload.authorInitials,
        date: payload.date,
        text: payload.text,
        startToken: `${DOCX_COMMENT_START_TOKEN_PREFIX}${rawPayload}${DOCX_COMMENT_TOKEN_SUFFIX}`,
        endToken: `${DOCX_COMMENT_END_TOKEN_PREFIX}${encodeURIComponent(payload.id)}${DOCX_COMMENT_TOKEN_SUFFIX}`,
        hasStartToken: true,
      });
    } catch {}
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
    } catch {}
  }

  const comments = Array.from(commentsById.values());
  return { comments, count: comments.length };
}

// ============================================================================
// Combined Parsing
// ============================================================================

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
 *
 * @example
 * ```ts
 * const html = mammothResult.value;
 * const result = parseDocxTracking(html);
 *
 * if (result.hasTracking) {
 *   console.log(`Found ${result.trackedChanges.insertionCount} insertions`);
 *   console.log(`Found ${result.trackedChanges.deletionCount} deletions`);
 *   console.log(`Found ${result.comments.count} comments`);
 * }
 * ```
 */
export function parseDocxTracking(html: string): ParseDocxTrackingResult {
  const trackedChanges = parseDocxTrackedChanges(html);
  const comments = parseDocxComments(html);

  const hasTracking =
    trackedChanges.changes.length > 0 || comments.comments.length > 0;

  return { trackedChanges, comments, hasTracking };
}

/**
 * Check if HTML contains any DOCX tracking tokens.
 *
 * This is a fast check that doesn't parse the tokens, just checks
 * for their presence.
 *
 * @param html - The HTML string to check
 * @returns Whether any tracking tokens are present
 */
export function hasDocxTrackingTokens(html: string): boolean {
  // Check for any of the token prefixes
  return (
    html.includes(DOCX_INSERTION_START_TOKEN_PREFIX) ||
    html.includes(DOCX_DELETION_START_TOKEN_PREFIX) ||
    html.includes(DOCX_COMMENT_START_TOKEN_PREFIX)
  );
}

/**
 * Remove all DOCX tracking tokens from HTML.
 *
 * This preserves the content but removes the token markers. Useful
 * when you want to display content without tracking metadata.
 *
 * @param html - The HTML string containing tracking tokens
 * @returns HTML with tokens removed (content preserved)
 */
export function stripDocxTrackingTokens(html: string): string {
  // Remove all tokens (start and end for all types)
  const tokenPattern = /\[\[DOCX_(INS|DEL|CMT)_(START|END):[^\]]+\]\]/g;
  return html.replace(tokenPattern, '');
}
