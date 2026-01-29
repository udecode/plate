/**
 * DOCX Tracked Changes and Comments Export Support
 *
 * This module provides token-based tracking for exporting Plate editor
 * suggestions and comments to Word's tracked changes and comments format.
 *
 * Token Format:
 * - Insertions: [[DOCX_INS_START:{payload}]] ... [[DOCX_INS_END:id]]
 * - Deletions: [[DOCX_DEL_START:{payload}]] ... [[DOCX_DEL_END:id]]
 * - Comments: [[DOCX_CMT_START:{payload}]] ... [[DOCX_CMT_END:id]]
 */
/** biome-ignore-all lint/style/useConsistentTypeDefinitions: legacy code */

import { fragment } from 'xmlbuilder2';
import type { XMLBuilder } from 'xmlbuilder2/lib/interfaces';

import namespaces from './namespaces';

// ============================================================================
// Types
// ============================================================================

/** Payload for insertion/deletion tokens */
export interface SuggestionPayload {
  id: string;
  author?: string;
  date?: string;
}

/** Payload for comment tokens */
export interface CommentPayload {
  id: string;
  authorName?: string;
  authorInitials?: string;
  date?: string;
  text?: string;
}

/** Parsed token from text */
export type ParsedToken =
  | { type: 'text'; value: string }
  | { type: 'insStart'; data: SuggestionPayload }
  | { type: 'insEnd'; id: string }
  | { type: 'delStart'; data: SuggestionPayload }
  | { type: 'delEnd'; id: string }
  | { type: 'commentStart'; data: CommentPayload }
  | { type: 'commentEnd'; id: string };

/** Active suggestion state for nesting */
export interface ActiveSuggestion {
  id: string;
  type: 'insert' | 'remove';
  author?: string;
  date?: string;
  revisionId: number;
}

/** Comment stored in the document */
export interface StoredComment {
  id: number;
  authorName: string;
  authorInitials: string;
  date?: string;
  text: string;
}

/** Tracking state maintained during document generation */
export interface TrackingState {
  suggestionStack: ActiveSuggestion[];
}

/** Interface for document instance with tracking support */
export interface TrackingDocumentInstance {
  _trackingState?: TrackingState;
  comments: StoredComment[];
  commentIdMap: Map<string, number>;
  lastCommentId: number;
  revisionIdMap: Map<string, number>;
  lastRevisionId: number;
  ensureComment: (data: Partial<CommentPayload>) => number;
  getCommentId: (id: string) => number;
  getRevisionId: (id?: string) => number;
}

// ============================================================================
// Token Constants
// ============================================================================

export const DOCX_INSERTION_START_TOKEN_PREFIX = '[[DOCX_INS_START:';
export const DOCX_INSERTION_END_TOKEN_PREFIX = '[[DOCX_INS_END:';
export const DOCX_INSERTION_TOKEN_SUFFIX = ']]';

export const DOCX_DELETION_START_TOKEN_PREFIX = '[[DOCX_DEL_START:';
export const DOCX_DELETION_END_TOKEN_PREFIX = '[[DOCX_DEL_END:';
export const DOCX_DELETION_TOKEN_SUFFIX = ']]';

export const DOCX_COMMENT_START_TOKEN_PREFIX = '[[DOCX_CMT_START:';
export const DOCX_COMMENT_END_TOKEN_PREFIX = '[[DOCX_CMT_END:';
export const DOCX_COMMENT_TOKEN_SUFFIX = ']]';

/** Regex to match all DOCX tracking tokens */
const DOCX_TOKEN_REGEX = /\[\[DOCX_(INS|DEL|CMT)_(START|END):(.+?)\]\]/g;

// ============================================================================
// Token Parsing
// ============================================================================

/**
 * Parse a single DOCX token into a structured object.
 */
function parseDocxToken(
  kind: string,
  position: string,
  rawPayload: string
): ParsedToken | null {
  try {
    const decoded = decodeURIComponent(rawPayload);

    if (position === 'END') {
      if (!decoded) return null;

      if (kind === 'CMT') {
        return { type: 'commentEnd', id: decoded };
      }
      if (kind === 'DEL') {
        return { type: 'delEnd', id: decoded };
      }
      return { type: 'insEnd', id: decoded };
    }

    const data = JSON.parse(decoded);

    if (kind === 'CMT') {
      return { type: 'commentStart', data: data as CommentPayload };
    }
    if (kind === 'DEL') {
      return { type: 'delStart', data: data as SuggestionPayload };
    }
    return { type: 'insStart', data: data as SuggestionPayload };
  } catch {
    return null;
  }
}

/**
 * Split text into an array of text segments and parsed tokens.
 */
export function splitDocxTrackingTokens(text: string): ParsedToken[] {
  const parts: ParsedToken[] = [];
  let lastIndex = 0;
  const tokenRegex = new RegExp(DOCX_TOKEN_REGEX);
  // biome-ignore lint/suspicious/noEvolvingTypes: regex exec result type
  // biome-ignore lint/suspicious/noImplicitAnyLet: regex exec result type
  let match;

  // biome-ignore lint/suspicious/noAssignInExpressions: idiomatic regex loop
  while ((match = tokenRegex.exec(text)) !== null) {
    // Add text before this token
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }

    // Parse the token
    const token = parseDocxToken(match[1], match[2], match[3]);
    if (token) {
      parts.push(token);
    } else {
      // If parsing fails, treat as text
      parts.push({ type: 'text', value: match[0] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return parts;
}

/**
 * Check if text contains any DOCX tracking tokens.
 */
export function hasTrackingTokens(text: string): boolean {
  // Create a new regex each time to avoid state issues with global flag
  // biome-ignore lint/performance/useTopLevelRegex: avoid global flag state issues
  const tokenRegex = /\[\[DOCX_(INS|DEL|CMT)_(START|END):(.+?)\]\]/;
  return tokenRegex.test(text);
}

// ============================================================================
// Tracking State Management
// ============================================================================

/**
 * Ensure tracking state is initialized on the document instance.
 */
export function ensureTrackingState(
  docxDocumentInstance: TrackingDocumentInstance
): TrackingState {
  if (!docxDocumentInstance._trackingState) {
    docxDocumentInstance._trackingState = {
      suggestionStack: [],
    };
  }
  return docxDocumentInstance._trackingState;
}

// ============================================================================
// XML Fragment Builders
// ============================================================================

/**
 * Build a text element for normal text.
 */
export function buildTextElement(text: string): XMLBuilder {
  return fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 't')
    .att('@xml', 'space', 'preserve')
    .txt(text)
    .up();
}

/**
 * Build a deleted text element (w:delText) for deletions.
 */
export function buildDeletedTextElement(text: string): XMLBuilder {
  return fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'delText')
    .att('@xml', 'space', 'preserve')
    .txt(text)
    .up();
}

/**
 * Build a comment range start marker.
 */
export function buildCommentRangeStart(id: number): XMLBuilder {
  return fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'commentRangeStart')
    .att('@w', 'id', String(id))
    .up();
}

/**
 * Build a comment range end marker.
 */
export function buildCommentRangeEnd(id: number): XMLBuilder {
  return fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'commentRangeEnd')
    .att('@w', 'id', String(id))
    .up();
}

/**
 * Build a comment reference run (appears after commentRangeEnd).
 */
export function buildCommentReferenceRun(id: number): XMLBuilder {
  return fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'r')
    .ele('@w', 'commentReference')
    .att('@w', 'id', String(id))
    .up()
    .up();
}

/**
 * Wrap a run fragment with a suggestion (w:ins or w:del).
 */
export function wrapRunWithSuggestion(
  runFragment: XMLBuilder,
  suggestion: ActiveSuggestion
): XMLBuilder {
  const tagName = suggestion.type === 'remove' ? 'del' : 'ins';
  const wrapper = fragment({ namespaceAlias: { w: namespaces.w } }).ele(
    '@w',
    tagName
  );

  wrapper.att('@w', 'id', String(suggestion.revisionId));
  if (suggestion.author) {
    wrapper.att('@w', 'author', suggestion.author);
  }
  if (suggestion.date) {
    wrapper.att('@w', 'date', suggestion.date);
  }

  wrapper.import(runFragment);
  wrapper.up();

  return wrapper;
}

// ============================================================================
// Token Building (for export from Plate)
// ============================================================================

/**
 * Build a suggestion start token string.
 */
export function buildSuggestionStartToken(
  payload: SuggestionPayload,
  type: 'insert' | 'remove'
): string {
  const encoded = encodeURIComponent(JSON.stringify(payload));
  const prefix =
    type === 'remove'
      ? DOCX_DELETION_START_TOKEN_PREFIX
      : DOCX_INSERTION_START_TOKEN_PREFIX;
  const suffix =
    type === 'remove'
      ? DOCX_DELETION_TOKEN_SUFFIX
      : DOCX_INSERTION_TOKEN_SUFFIX;
  return `${prefix}${encoded}${suffix}`;
}

/**
 * Build a suggestion end token string.
 */
export function buildSuggestionEndToken(
  id: string,
  type: 'insert' | 'remove'
): string {
  const encodedId = encodeURIComponent(id);
  const prefix =
    type === 'remove'
      ? DOCX_DELETION_END_TOKEN_PREFIX
      : DOCX_INSERTION_END_TOKEN_PREFIX;
  const suffix =
    type === 'remove'
      ? DOCX_DELETION_TOKEN_SUFFIX
      : DOCX_INSERTION_TOKEN_SUFFIX;
  return `${prefix}${encodedId}${suffix}`;
}

/**
 * Build a comment start token string.
 */
export function buildCommentStartToken(payload: CommentPayload): string {
  const encoded = encodeURIComponent(JSON.stringify(payload));
  return `${DOCX_COMMENT_START_TOKEN_PREFIX}${encoded}${DOCX_COMMENT_TOKEN_SUFFIX}`;
}

/**
 * Build a comment end token string.
 */
export function buildCommentEndToken(id: string): string {
  const encodedId = encodeURIComponent(id);
  return `${DOCX_COMMENT_END_TOKEN_PREFIX}${encodedId}${DOCX_COMMENT_TOKEN_SUFFIX}`;
}
