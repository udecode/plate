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
  // Always include comment-reference => sup default, merge with user styleMap
  const styleMap = ['comment-reference => sup', ...(options.styleMap ?? [])];
  const result = await mammoth.convertToHtml({ arrayBuffer }, { styleMap });

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
// Token Cleanup Utilities
// ============================================================================

/** Regex to match all DOCX tracking tokens */
const TRACKING_TOKEN_PATTERN = /\[\[DOCX_(INS|DEL|CMT)_(START|END):[^\]]+\]\]/g;

/**
 * Remove body-level text nodes that contain only tracking tokens.
 * This prevents the deserialization from wrapping orphan tokens in paragraphs.
 *
 * When w:commentRangeStart/End appear between paragraphs in DOCX XML,
 * mammoth emits them as text nodes at the body level. During deserialization,
 * these get wrapped in paragraphs due to mixed inline/block normalization,
 * creating unwanted empty paragraphs after the tokens are cleaned up.
 */
function cleanBodyLevelTokenNodes(body: HTMLElement): void {
  const nodesToRemove: Node[] = [];

  for (const node of Array.from(body.childNodes)) {
    // Only process text nodes at body level
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? '';
      // Check if the text is entirely tracking tokens (possibly with whitespace)
      const withoutTokens = text.replace(TRACKING_TOKEN_PATTERN, '').trim();

      if (withoutTokens === '') {
        // Text node contains only tokens and whitespace - mark for removal
        nodesToRemove.push(node);
      }
    }
  }

  // Remove the marked nodes
  for (const node of nodesToRemove) {
    node.parentNode?.removeChild(node);
  }
}

/**
 * Recursively clean up any remaining tracking tokens from nodes.
 * This is a safety net for cases where the rangeRef-based deletion fails.
 */
function cleanupTrackingTokens(nodes: unknown[]): void {
  for (const node of nodes) {
    if (typeof node !== 'object' || node === null) continue;

    const nodeObj = node as Record<string, unknown>;

    // If it's a text node with tokens, clean them
    if (typeof nodeObj.text === 'string') {
      nodeObj.text = nodeObj.text.replace(TRACKING_TOKEN_PATTERN, '');
    }

    // Recursively process children
    if (Array.isArray(nodeObj.children)) {
      cleanupTrackingTokens(nodeObj.children);
    }
  }
}

/**
 * Check if a node is an empty paragraph (only contains empty text).
 * A paragraph is empty if all its children are text nodes with empty strings.
 */
function isEmptyParagraph(node: unknown): boolean {
  if (typeof node !== 'object' || node === null) return false;

  const nodeObj = node as Record<string, unknown>;

  // Must be a paragraph-type element
  if (nodeObj.type !== 'p') return false;

  // Must have children
  if (!Array.isArray(nodeObj.children)) return false;

  // All children must be empty text nodes
  return nodeObj.children.every((child) => {
    if (typeof child !== 'object' || child === null) return false;
    const childObj = child as Record<string, unknown>;
    // Must be a text node with empty or whitespace-only content
    return typeof childObj.text === 'string' && childObj.text.trim() === '';
  });
}

/**
 * Remove empty leading paragraphs from the editor children.
 * These can occur when tracking tokens are removed from paragraphs
 * that only contained tokens (e.g., spanning comments/changes).
 */
function removeEmptyLeadingParagraphs(nodes: unknown[]): void {
  while (nodes.length > 0 && isEmptyParagraph(nodes[0])) {
    nodes.shift();
  }
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

  // Clean up body-level text nodes that contain only tracking tokens.
  // This prevents unwanted empty paragraphs from being created during normalization.
  cleanBodyLevelTokenNodes(doc.body);

  const nodes = editor.api.html.deserialize({ element: doc.body });

  // Capture original content for recovery on failure
  const originalChildren = [...editor.children];

  try {
    // Replace editor content with deserialized nodes
    // Direct mutation is used here because transform-based approaches can cause
    // infinite loops due to Slate's normalization. The caller is responsible for
    // proper history/collaboration handling if needed.
    (editor.children as unknown[]).length = 0;
    (editor.children as unknown[]).push(...nodes);

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

    // Step 6: Clean up any remaining tokens that weren't deleted
    // This handles edge cases where rangeRef tracking fails due to direct mutation
    cleanupTrackingTokens(editor.children);

    // Step 7: Remove empty leading paragraphs that may result from token cleanup
    // When tokens span multiple paragraphs, the token-only paragraphs become empty
    removeEmptyLeadingParagraphs(editor.children as unknown[]);
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
