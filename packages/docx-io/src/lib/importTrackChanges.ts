/**
 * DOCX Tracked Changes Import
 *
 * This module provides utilities for parsing and applying tracked changes
 * (insertions and deletions) from DOCX files to a Plate editor.
 *
 * Usage flow:
 * 1. Convert DOCX to HTML with mammoth (with tracking token support)
 * 2. Parse tokens from HTML using parseDocxTrackedChanges
 * 3. Deserialize HTML to editor nodes
 * 4. Apply tracked changes using applyTrackedChangeSuggestions
 */

import type { Point, TRange } from './searchRange';

import {
  DOCX_DELETION_END_TOKEN_PREFIX,
  DOCX_DELETION_START_TOKEN_PREFIX,
  DOCX_DELETION_TOKEN_SUFFIX,
  DOCX_INSERTION_END_TOKEN_PREFIX,
  DOCX_INSERTION_START_TOKEN_PREFIX,
  DOCX_INSERTION_TOKEN_SUFFIX,
} from './html-to-docx/tracking';
import type { DocxTrackedChange } from './types';

// Re-export token constants for test usage
export {
  DOCX_DELETION_END_TOKEN_PREFIX,
  DOCX_DELETION_START_TOKEN_PREFIX,
  DOCX_DELETION_TOKEN_SUFFIX,
  DOCX_INSERTION_END_TOKEN_PREFIX,
  DOCX_INSERTION_START_TOKEN_PREFIX,
  DOCX_INSERTION_TOKEN_SUFFIX,
} from './html-to-docx/tracking';

export type { TRange } from './searchRange';
export type { DocxTrackedChange } from './types';

// ============================================================================
// Types
// ============================================================================

/** Alias for Point type */
export type TPoint = Point;

/** Editor interface for applying tracking changes */
export type TrackingEditor = {
  /** Get string content from a range */
  api: {
    string: (range: TRange) => string;
    rangeRef: (range: TRange) => {
      current: TRange | null;
      unref: () => TRange | null;
    };
    /** Get nodes matching criteria (for scanning text entries) */
    nodes?: <T>(options: {
      at: number[];
      match?: (node: unknown) => boolean;
    }) => Iterable<[T, number[]]>;
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
  /** Get plugin option */
  getOption?: (plugin: unknown, key: string) => unknown;
};

/** Function to search for a string in the editor and return its range */
export type SearchRangeFn = (
  editor: TrackingEditor,
  search: string
) => TRange | null;

/** Result of parsing tracked changes from HTML */
export type ParseTrackedChangesResult = {
  /** All tracked changes found (insertions and deletions) */
  changes: DocxTrackedChange[];
  /** Number of insertions found */
  insertionCount: number;
  /** Number of deletions found */
  deletionCount: number;
};

/** Options for applying tracked change suggestions */
export type ApplySuggestionsOptions = {
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
};

/** Result of applying tracked change suggestions */
export type ApplySuggestionsResult = {
  /** Number of insertions applied */
  insertions: number;
  /** Number of deletions applied */
  deletions: number;
  /** Total changes applied */
  total: number;
  /** Errors encountered */
  errors: string[];
};

// ============================================================================
// Utility Functions
// ============================================================================

/** Escape special regex characters in a string */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Compare two points to determine order.
 * Returns true if a is after b.
 */
export function isPointAfter(a: TPoint, b: TPoint): boolean {
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
export function formatAuthorAsUserId(authorName: string | undefined): string {
  if (!authorName) return 'imported-unknown';
  return authorName;
}

/**
 * Parse date string to timestamp.
 * Returns Date.now() if parsing fails.
 */
export function parseDate(dateString: string | undefined): number {
  if (!dateString) return Date.now();
  const parsed = Date.parse(dateString);
  return Number.isNaN(parsed) ? Date.now() : parsed;
}

/**
 * Parse date string to Date object.
 * Returns provided fallback or new Date() if parsing fails.
 */
export function parseDateToDate(
  dateString: string | undefined,
  fallback?: Date
): Date {
  if (!dateString) return fallback ?? new Date();
  const parsed = Date.parse(dateString);
  return Number.isNaN(parsed) ? (fallback ?? new Date()) : new Date(parsed);
}

// ============================================================================
// Parsing Functions
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
    } catch {
      // Skip malformed tokens
    }
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
    } catch {
      // Skip malformed tokens
    }
  }

  return { changes, insertionCount, deletionCount };
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
 * import { parseDocxTrackedChanges } from './importTrackChanges';
 * import { applyTrackedChangeSuggestions } from './importTrackChanges';
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
// Utility Functions for Tracking Detection
// ============================================================================

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
  return (
    html.includes(DOCX_INSERTION_START_TOKEN_PREFIX) ||
    html.includes(DOCX_DELETION_START_TOKEN_PREFIX)
  );
}

/**
 * Remove all DOCX tracked change tokens from HTML.
 *
 * This preserves the content but removes the token markers.
 *
 * @param html - The HTML string containing tracking tokens
 * @returns HTML with tokens removed (content preserved)
 */
export function stripDocxTrackingTokens(html: string): string {
  const tokenPattern = /\[\[DOCX_(INS|DEL)_(START|END):[^\]]+\]\]/g;
  return html.replace(tokenPattern, '');
}
