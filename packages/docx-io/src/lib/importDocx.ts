/**
 * DOCX Import Main Module
 *
 * This module provides the main entry point for importing DOCX files
 * with tracked changes and comments support.
 *
 * Features:
 * - Converts DOCX to HTML using a mammoth.js fork with tracking support
 * - Emits tracking tokens for insertions, deletions, and comments
 * - Preprocesses HTML to extract comment metadata
 *
 * Usage flow:
 * 1. Call convertToHtmlWithTracking(arrayBuffer)
 * 2. Parse tokens using parseDocxTrackedChanges/parseDocxComments
 * 3. Deserialize HTML to editor nodes
 * 4. Apply tracked changes and comments to editor
 */

// Local mammoth.js fork browser build
import mammothModule from './mammoth.js/mammoth.browser.js';

// ============================================================================
// Mammoth Types and Export
// ============================================================================

/** Mammoth message type */
export type MammothMessage = {
  type: 'warning' | 'error';
  message: string;
};

/** Mammoth module type */
type MammothModule = {
  convertToHtml: (
    input: { arrayBuffer: ArrayBuffer },
    options?: { styleMap?: string[] }
  ) => Promise<{
    value: string;
    messages: MammothMessage[];
  }>;
  MammothMessage: unknown;
};

/** Export mammoth for direct access if needed */
export const mammoth = mammothModule as unknown as MammothModule;

// ============================================================================
// Preprocess Types
// ============================================================================

const DOCX_COMMENT_REF_TOKEN_PREFIX = '[[DOCX_COMMENT_REF:';
const DOCX_COMMENT_REF_TOKEN_SUFFIX = ']]';

// Top-level regex patterns for performance
const COMMENT_ID_REGEX = /^comment-/;
const COMMENT_REF_ID_REGEX = /^comment-ref-/;
const ARROW_SUFFIX_REGEX = /↑\s*$/;

export type PreprocessMammothHtmlResult = {
  /** Processed HTML with comment tokens */
  html: string;
  /** Map of comment ID to comment text */
  commentById: Map<string, string>;
  /** Ordered list of comment IDs as they appear in document */
  commentIds: string[];
};

// ============================================================================
// Preprocess Functions
// ============================================================================

/**
 * Preprocess mammoth HTML output to extract and tokenize comments.
 *
 * Mammoth converts DOCX comments to:
 * - `<dl>` elements containing comment definitions
 * - `<a id="comment-ref-{id}">` anchors marking comment locations
 *
 * This function:
 * 1. Extracts comment text from `<dl>` elements
 * 2. Removes comment anchors while tracking their IDs
 * 3. Returns the processed HTML and comment data
 */
export function preprocessMammothHtml(
  html: string
): PreprocessMammothHtmlResult {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const commentById = new Map<string, string>();

  // Extract comments from <dl> elements
  for (const dl of Array.from(doc.querySelectorAll('dl'))) {
    if (!dl.querySelector('dt[id^="comment-"]')) continue;

    const dtNodes = Array.from(dl.querySelectorAll('dt[id^="comment-"]'));

    for (const dt of dtNodes) {
      const dtId = dt.getAttribute('id') ?? '';
      const commentId = dtId.replace(COMMENT_ID_REGEX, '');

      if (!commentId) continue;

      const dd = dt.nextElementSibling;

      if (!dd || dd.tagName !== 'DD') continue;

      const ddClone = dd.cloneNode(true) as HTMLElement;

      // Remove back-reference links
      for (const a of Array.from(
        ddClone.querySelectorAll('a[href^="#comment-ref-"]')
      )) {
        a.remove();
      }

      let text = (ddClone.textContent ?? '').replaceAll(/\s+/g, ' ').trim();
      text = text.replace(ARROW_SUFFIX_REGEX, '').trim();

      commentById.set(commentId, text);
    }

    dl.remove();
  }

  // Remove comment anchors but keep their IDs
  const seen = new Set<string>();
  const commentIds: string[] = [];

  for (const a of Array.from(doc.querySelectorAll('a[id^="comment-ref-"]'))) {
    const aId = a.getAttribute('id') ?? '';
    const commentId = aId.replace(COMMENT_REF_ID_REGEX, '');

    if (!commentId) continue;

    if (!seen.has(commentId)) {
      seen.add(commentId);
      commentIds.push(commentId);
    }

    const parent = a.parentElement;

    if (parent?.tagName === 'SUP' && parent.childNodes.length === 1) {
      parent.remove();
    } else {
      a.remove();
    }
  }

  return { commentById, commentIds, html: doc.body.innerHTML };
}

/** Get the comment token prefix for searching in editor */
export function getCommentTokenPrefix(): string {
  return DOCX_COMMENT_REF_TOKEN_PREFIX;
}

/** Get the comment token suffix for searching in editor */
export function getCommentTokenSuffix(): string {
  return DOCX_COMMENT_REF_TOKEN_SUFFIX;
}

/** Build a comment token from ID */
export function buildCommentToken(commentId: string): string {
  return `${DOCX_COMMENT_REF_TOKEN_PREFIX}${commentId}${DOCX_COMMENT_REF_TOKEN_SUFFIX}`;
}

// ============================================================================
// Convert Types
// ============================================================================

/** Options for convertToHtmlWithTracking */
export type ConvertToHtmlWithTrackingOptions = {
  /** Mammoth style map for custom styling */
  styleMap?: string[];
};

/** Result from convertToHtmlWithTracking */
export type ConvertToHtmlWithTrackingResult = {
  /** The converted HTML with tracking tokens embedded */
  value: string;
  /** Messages from mammoth (warnings, etc.) */
  messages: MammothMessage[];
};

// ============================================================================
// Main Export Functions
// ============================================================================

/**
 * Convert DOCX to HTML with tracked changes support.
 *
 * This is the main entry point for importing DOCX files with tracked changes
 * (insertions, deletions) and comments. The mammoth fork handles token
 * emission natively during conversion.
 *
 * @param arrayBuffer - The DOCX file as ArrayBuffer
 * @param options - Conversion options
 * @returns HTML with embedded tracking tokens
 *
 * @example
 * ```ts
 * const result = await convertToHtmlWithTracking(arrayBuffer);
 *
 * // Parse tokens from HTML
 * const { changes } = parseDocxTrackedChanges(result.value);
 * const { comments } = parseDocxComments(result.value);
 *
 * // Apply to editor
 * applyTrackedChangeSuggestions({ editor, changes, ... });
 * applyTrackedCommentsLocal({ editor, comments, ... });
 * ```
 */
export async function convertToHtmlWithTracking(
  arrayBuffer: ArrayBuffer,
  options: ConvertToHtmlWithTrackingOptions = {}
): Promise<ConvertToHtmlWithTrackingResult> {
  // The mammoth fork natively emits tracking tokens during conversion
  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    { styleMap: options.styleMap ?? ['comment-reference => sup'] }
  );

  return {
    value: result.value,
    messages: result.messages,
  };
}

// ============================================================================
// Simple Import Function
// ============================================================================

/** Editor interface for importDocx */
type ImportDocxEditor = {
  api: {
    html: {
      deserialize: (options: { element: Element }) => unknown[];
    };
  };
};

/**
 * Import a DOCX file and convert it to editor nodes.
 *
 * This is a convenience function that handles the entire import flow:
 * 1. Converts DOCX to HTML using mammoth
 * 2. Strips tracking tokens (use advanced APIs for tracked changes support)
 * 3. Deserializes HTML to editor nodes
 *
 * For tracked changes and comments support, use `importDocxWithTracking` instead
 * or use the advanced APIs:
 * - convertToHtmlWithTracking
 * - parseDocxTrackedChanges / parseDocxComments
 * - applyTrackedChangeSuggestions / applyTrackedComments
 *
 * @param editor - The Plate editor instance
 * @param arrayBuffer - The DOCX file as ArrayBuffer
 * @param options - Import options
 * @returns The deserialized nodes and metadata
 *
 * @example
 * ```ts
 * const { nodes } = await importDocx(editor, arrayBuffer);
 * editor.tf.insertNodes(nodes);
 * ```
 */
export async function importDocx(
  editor: ImportDocxEditor,
  arrayBuffer: ArrayBuffer,
  options: ConvertToHtmlWithTrackingOptions = {}
): Promise<{
  /** The deserialized nodes ready to insert into editor */
  nodes: unknown[];
  /** The raw HTML from conversion */
  html: string;
  /** Messages from mammoth (warnings, etc.) */
  messages: MammothMessage[];
}> {
  // Convert DOCX to HTML
  const result = await convertToHtmlWithTracking(arrayBuffer, options);

  // Strip tracking tokens for simple import (advanced users can use the APIs directly)
  const cleanHtml = result.value.replaceAll(
    /\[\[DOCX_(INS|DEL|CMT)_(START|END):[^\]]+\]\]/g,
    ''
  );

  // Parse HTML and deserialize to nodes
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanHtml, 'text/html');
  const nodes = editor.api.html.deserialize({ element: doc.body });

  return {
    nodes,
    html: cleanHtml,
    messages: result.messages,
  };
}

// ============================================================================
// Import With Tracking Support
// ============================================================================

import {
  applyTrackedChangeSuggestions,
  parseDocxTrackedChanges,
} from './importTrackChanges';
import {
  applyTrackedCommentsLocal,
  parseDocxComments,
  type DocxImportDiscussion,
} from './importComments';
import { createSearchRangeFn } from './searchRange';

/** Extended editor interface for tracking imports */
type ImportDocxWithTrackingEditor = ImportDocxEditor & {
  api: ImportDocxEditor['api'] & {
    string: (range: {
      anchor: { path: number[]; offset: number };
      focus: { path: number[]; offset: number };
    }) => string;
    rangeRef: (range: {
      anchor: { path: number[]; offset: number };
      focus: { path: number[]; offset: number };
    }) => {
      current: {
        anchor: { path: number[]; offset: number };
        focus: { path: number[]; offset: number };
      } | null;
      unref: () => {
        anchor: { path: number[]; offset: number };
        focus: { path: number[]; offset: number };
      } | null;
    };
    nodes?: <T>(options: {
      at: number[];
      match?: (node: unknown) => boolean;
    }) => Iterable<[T, number[]]>;
  };
  tf: {
    setNodes: (
      props: Record<string, unknown>,
      options: {
        at: {
          anchor: { path: number[]; offset: number };
          focus: { path: number[]; offset: number };
        };
        match: (node: unknown) => boolean;
        split: boolean;
      }
    ) => void;
    delete: (options: {
      at: {
        anchor: { path: number[]; offset: number };
        focus: { path: number[]; offset: number };
      };
    }) => void;
    withMerging: (fn: () => void) => void;
  };
  children: unknown[];
};

/** Options for importing DOCX with tracking support */
export type ImportDocxWithTrackingOptions = ConvertToHtmlWithTrackingOptions & {
  /** Key for suggestion marks (default: 'suggestion') */
  suggestionKey?: string;
  /** Function to generate suggestion property key from ID */
  getSuggestionKey?: (id: string) => string;
  /** Key for comment marks (default: 'comment') */
  commentKey?: string;
  /** Function to generate comment property key from discussion ID */
  getCommentKey?: (discussionId: string) => string;
  /** Function to check if a node is a text node */
  isText?: (node: unknown) => boolean;
  /** Function to generate unique IDs for discussions */
  generateId?: () => string;
};

/** Result from importing DOCX with tracking */
export type ImportDocxWithTrackingResult = {
  /** Number of insertions applied */
  insertions: number;
  /** Number of deletions applied */
  deletions: number;
  /** Number of comments applied */
  comments: number;
  /** Discussion data for UI (to be stored in discussion plugin) */
  discussions: DocxImportDiscussion[];
  /** Any errors encountered during import */
  errors: string[];
  /** Messages from mammoth (warnings, etc.) */
  messages: MammothMessage[];
  /** Whether any tracking was found and applied */
  hasTracking: boolean;
};

/** Default function to check if a node is text */
function defaultIsText(node: unknown): boolean {
  return typeof (node as { text?: unknown }).text === 'string';
}

/** Default ID generator using crypto.randomUUID or fallback */
function defaultGenerateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Import a DOCX file with full tracked changes and comments support.
 *
 * This function handles the complete import flow including:
 * 1. Converts DOCX to HTML with tracking tokens
 * 2. Parses tracked changes (insertions/deletions) and comments
 * 3. Deserializes HTML to editor nodes
 * 4. Applies suggestion marks for tracked changes
 * 5. Applies comment marks and creates discussion data
 *
 * After calling this function, the editor will display suggestions and comments
 * with proper marks. The returned discussions should be added to your discussion
 * plugin's state.
 *
 * @param editor - The Plate editor instance (must have required APIs)
 * @param arrayBuffer - The DOCX file as ArrayBuffer
 * @param options - Import options including key configurations
 * @returns Result with counts, discussions, and any errors
 *
 * @example
 * ```ts
 * import { importDocxWithTracking } from '@platejs/docx-io';
 * import { getSuggestionKey } from '@platejs/suggestion';
 * import { getCommentKey } from '@platejs/comment';
 *
 * const result = await importDocxWithTracking(editor, arrayBuffer, {
 *   suggestionKey: 'suggestion',
 *   getSuggestionKey,
 *   commentKey: 'comment',
 *   getCommentKey,
 * });
 *
 * // Add imported discussions to your discussion plugin
 * if (result.discussions.length > 0) {
 *   editor.setOption(discussionPlugin, 'discussions', [
 *     ...existingDiscussions,
 *     ...result.discussions,
 *   ]);
 * }
 *
 * console.log(`Imported ${result.insertions} insertions, ${result.deletions} deletions, ${result.comments} comments`);
 * ```
 */
export async function importDocxWithTracking(
  editor: ImportDocxWithTrackingEditor,
  arrayBuffer: ArrayBuffer,
  options: ImportDocxWithTrackingOptions = {}
): Promise<ImportDocxWithTrackingResult> {
  const {
    suggestionKey = 'suggestion',
    getSuggestionKey = (id: string) => `suggestion_${id}`,
    commentKey = 'comment',
    getCommentKey = (id: string) => `comment_${id}`,
    isText = defaultIsText,
    generateId = defaultGenerateId,
    ...convertOptions
  } = options;

  const errors: string[] = [];
  let insertions = 0;
  let deletions = 0;
  let commentsApplied = 0;
  const discussions: DocxImportDiscussion[] = [];

  // Step 1: Convert DOCX to HTML with tracking tokens
  const result = await convertToHtmlWithTracking(arrayBuffer, convertOptions);

  // Step 2: Parse tracked changes and comments from HTML
  const trackedChanges = parseDocxTrackedChanges(result.value);
  const parsedComments = parseDocxComments(result.value);

  const hasTracking =
    trackedChanges.changes.length > 0 || parsedComments.comments.length > 0;

  // Step 3: Deserialize HTML to nodes (keep tokens for now)
  const parser = new DOMParser();
  const doc = parser.parseFromString(result.value, 'text/html');
  const nodes = editor.api.html.deserialize({ element: doc.body });

  // Replace editor content with deserialized nodes
  // Note: The caller should handle this, but we need nodes in editor for searchRange
  const originalChildren = [...editor.children];
  (editor.children as unknown[]).length = 0;
  (editor.children as unknown[]).push(...nodes);

  try {
    // Create search function adapter
    // createSearchRangeFn returns (search) => TRange, but SearchRangeFn expects (editor, search) => TRange
    const boundSearchFn = createSearchRangeFn(editor as any);
    const searchRangeFn = (_editor: unknown, search: string) =>
      boundSearchFn(search);

    // Step 4: Apply tracked changes as suggestions
    if (trackedChanges.changes.length > 0) {
      const suggestionsResult = applyTrackedChangeSuggestions({
        editor: editor as any,
        changes: trackedChanges.changes,
        searchRange: searchRangeFn as any,
        suggestionKey,
        getSuggestionKey,
        isText,
      });

      insertions = suggestionsResult.insertions;
      deletions = suggestionsResult.deletions;
      errors.push(...suggestionsResult.errors);
    }

    // Step 5: Apply comments
    if (parsedComments.comments.length > 0) {
      const commentsResult = applyTrackedCommentsLocal({
        editor: editor as any,
        comments: parsedComments.comments,
        searchRange: searchRangeFn as any,
        commentKey,
        getCommentKey,
        isText,
        generateId,
      });

      commentsApplied = commentsResult.applied;
      discussions.push(...commentsResult.discussions);
      errors.push(...commentsResult.errors);
    }
  } catch (error) {
    // Restore original content on failure
    (editor.children as unknown[]).length = 0;
    (editor.children as unknown[]).push(...originalChildren);
    throw error;
  }

  return {
    insertions,
    deletions,
    comments: commentsApplied,
    discussions,
    errors,
    messages: result.messages,
    hasTracking,
  };
}
