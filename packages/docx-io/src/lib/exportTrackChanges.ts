/**
 * DOCX Export Token Injection
 *
 * This module injects tracking tokens into Plate editor values for export.
 * Tokens are embedded in text nodes and later processed by html-to-docx
 * to generate Word tracked changes and comments XML.
 *
 * Token Format:
 * - Insertions: [[DOCX_INS_START:{payload}]] ... [[DOCX_INS_END:id]]
 * - Deletions: [[DOCX_DEL_START:{payload}]] ... [[DOCX_DEL_END:id]]
 * - Comments: [[DOCX_CMT_START:{payload}]] ... [[DOCX_CMT_END:id]]
 */

import type { TNode, TText } from 'platejs';

import {
  buildCommentEndToken,
  buildCommentStartToken,
  buildSuggestionEndToken,
  buildSuggestionStartToken,
  type CommentPayload,
  type SuggestionPayload,
} from './html-to-docx/tracking';

// ============================================================================
// Top-level Regex Patterns (for performance)
// ============================================================================

const WHITESPACE_REGEX = /\s+/;
const ZERO_WIDTH_SPACE = '\u200B';
const ZERO_WIDTH_SPACE_REGEX = /\u200B/g;

// ============================================================================
// Types
// ============================================================================

/** User information for resolving author names */
export type DocxExportUser = {
  id?: string | null;
  name?: string | null;
};

/** Comment data from discussion thread */
export type DocxExportComment = {
  authorInitials?: string | null;
  authorName?: string | null;
  contentRich?: unknown | null;
  createdAt?: Date | number | string | null;
  id?: string | null;
  parentCommentId?: string | null;
  user?: DocxExportUser | null;
  userId?: string | null;
};

/** Discussion thread containing comments */
export type DocxExportDiscussion = {
  comments?: DocxExportComment[] | null;
  createdAt?: Date | number | string | null;
  documentContent?: string | null;
  id: string;
  isResolved?: boolean | null;
  user?: DocxExportUser | null;
  userId?: string | null;
};

/** Normalized comment entry for DOCX thread export */
export type DocxThreadComment = {
  authorInitials: string;
  authorName: string;
  date?: string;
  durableId?: string;
  done?: boolean;
  id: string;
  parentId?: string;
  paraId?: string;
  text: string;
};

/** Normalized discussion thread for DOCX export */
export type DocxCommentThread = {
  comments: DocxThreadComment[];
  id: string;
  isResolved?: boolean;
};

/** Suggestion metadata stored on nodes */
export type DocxExportSuggestionMeta = {
  createdAt?: Date | number | string | null;
  id: string;
  type?: 'insert' | 'remove' | string | null;
  userId?: string | null;
};

/** Options for token injection */
export type InjectDocxTrackingTokensOptions = {
  /** Discussion threads for comment metadata */
  discussions?: DocxExportDiscussion[] | null;
  /** Precomputed comment threads for DOCX export */
  commentThreads?: DocxCommentThread[] | null;
  /** Function to get comment IDs from a text node */
  getCommentIds?: (node: TText) => string[];
  /** Function to get suggestion metadata from a text node */
  getSuggestions?: (node: TText) => DocxExportSuggestionMeta[];
  /** Function to convert rich content to plain text */
  nodeToString?: (node: unknown) => string;
  /** Pre-built user name map (userId -> name) */
  userNameMap?: Map<string, string>;
};

/** Internal leaf entry for tracking */
type LeafEntry = {
  commentIds: string[];
  node: TText;
  suggestions: Map<string, DocxExportSuggestionMeta>;
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Deep clone a value using structuredClone or JSON fallback.
 */
function cloneValue<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

function hasLeafText(text: string): boolean {
  return text.replace(ZERO_WIDTH_SPACE_REGEX, '').length > 0;
}

function ensureNonEmptyCommentRanges(leaves: LeafEntry[]): void {
  const commentInfo = new Map<
    string,
    { firstIndex: number; hasText: boolean; lastIndex: number }
  >();

  leaves.forEach((leaf, index) => {
    if (leaf.commentIds.length === 0) return;

    const hasText = hasLeafText(leaf.node.text);

    leaf.commentIds.forEach((id) => {
      const entry = commentInfo.get(id);
      if (entry) {
        entry.lastIndex = index;
        if (hasText) entry.hasText = true;
        return;
      }

      commentInfo.set(id, {
        firstIndex: index,
        hasText,
        lastIndex: index,
      });
    });
  });

  const addCommentId = (index: number, id: string) => {
    const leaf = leaves[index];
    if (!leaf) return;
    if (!leaf.commentIds.includes(id)) {
      leaf.commentIds.push(id);
    }
  };

  const extendRange = (from: number, to: number, id: string) => {
    if (from <= to) {
      for (let i = from; i <= to; i += 1) {
        addCommentId(i, id);
      }
      return;
    }

    for (let i = from; i >= to; i -= 1) {
      addCommentId(i, id);
    }
  };

  const findNextTextLeaf = (startIndex: number): number | null => {
    for (let i = startIndex; i < leaves.length; i += 1) {
      if (hasLeafText(leaves[i].node.text)) return i;
    }
    return null;
  };

  const findPrevTextLeaf = (startIndex: number): number | null => {
    for (let i = startIndex; i >= 0; i -= 1) {
      if (hasLeafText(leaves[i].node.text)) return i;
    }
    return null;
  };

  commentInfo.forEach((info, id) => {
    if (info.hasText) return;

    const nextTextIndex = findNextTextLeaf(info.lastIndex + 1);
    if (nextTextIndex !== null) {
      extendRange(info.lastIndex + 1, nextTextIndex, id);
      return;
    }

    const prevTextIndex = findPrevTextLeaf(info.firstIndex - 1);
    if (prevTextIndex !== null) {
      extendRange(info.firstIndex - 1, prevTextIndex, id);
      return;
    }

    const leaf = leaves[info.firstIndex];
    if (!leaf || leaf.commentIds.length === 0) return;
    if (!hasLeafText(leaf.node.text) && leaf.node.text.length === 0) {
      leaf.node.text = ZERO_WIDTH_SPACE;
    }
  });
}

/**
 * Build a user name map from discussion threads.
 */
export function buildUserNameMap(
  discussions?: DocxExportDiscussion[] | null
): Map<string, string> {
  const map = new Map<string, string>();

  discussions?.forEach((discussion) => {
    if (discussion?.user?.id && discussion.user?.name) {
      map.set(discussion.user.id, discussion.user.name);
    }
    if (discussion?.userId && discussion?.user?.name) {
      map.set(discussion.userId, discussion.user.name);
    }

    discussion?.comments?.forEach((comment) => {
      if (comment?.user?.id && comment.user?.name) {
        map.set(comment.user.id, comment.user.name);
      }
      if (comment?.userId && comment?.user?.name) {
        map.set(comment.userId, comment.user.name);
      }
    });
  });

  return map;
}

/**
 * Normalize discussions into DOCX comment threads.
 */
export function buildCommentThreads(
  discussions?: DocxExportDiscussion[] | null,
  userNameMap?: Map<string, string>,
  nodeToString?: (node: unknown) => string
): DocxCommentThread[] {
  const threads: DocxCommentThread[] = [];

  discussions?.forEach((discussion) => {
    if (!discussion?.id) return;

    const discussionAuthorName =
      discussion?.user?.name ??
      userNameMap?.get(discussion?.userId ?? '') ??
      discussion?.userId ??
      'unknown';

    const resolveAuthorName = (comment?: DocxExportComment | null) =>
      comment?.authorName ??
      comment?.user?.name ??
      userNameMap?.get(comment?.userId ?? '') ??
      comment?.userId ??
      discussionAuthorName ??
      'unknown';

    const resolveCommentText = (comment?: DocxExportComment | null) => {
      const commentContent = comment?.contentRich;
      if (Array.isArray(commentContent) && nodeToString) {
        try {
          return nodeToString({
            children: commentContent,
            type: 'root',
          });
        } catch {
          return '';
        }
      }
      if (typeof commentContent === 'string') return commentContent;
      return '';
    };

    const sourceComments = discussion?.comments ?? [];
    const makeCommentKey = (commentId: string | undefined, index: number) =>
      `${discussion.id}:${commentId ?? `comment-${index + 1}`}`;
    const parentCommentKey = makeCommentKey(sourceComments[0]?.id, 0);

    const comments: DocxThreadComment[] = [];

    if (sourceComments.length === 0) {
      const text =
        discussion?.documentContent?.toString?.() ?? 'Imported comment';
      comments.push({
        authorInitials: toInitials(discussionAuthorName),
        authorName: discussionAuthorName,
        date: normalizeDate(discussion?.createdAt),
        done: discussion?.isResolved ?? false,
          id: discussion.id,
          text,
        });
    } else {
      const commentKeyById = new Map<string, string>();

      sourceComments.forEach((comment, index) => {
        if (comment?.id) {
          commentKeyById.set(comment.id, makeCommentKey(comment.id, index));
        }
      });

      sourceComments.forEach((comment, index) => {
        const authorName = resolveAuthorName(comment);
        const authorInitials =
          comment?.authorInitials ?? toInitials(authorName);
        const text =
          resolveCommentText(comment) ||
          (index === 0
            ? discussion?.documentContent?.toString?.()
            : '') ||
          'Imported comment';
        const explicitParentKey = comment?.parentCommentId
          ? commentKeyById.get(comment.parentCommentId) ?? parentCommentKey
          : undefined;
        comments.push({
          authorInitials,
          authorName,
          date: normalizeDate(comment?.createdAt ?? discussion?.createdAt),
          done: discussion?.isResolved ?? false,
          id: makeCommentKey(comment?.id, index),
          parentId:
            index === 0 ? undefined : explicitParentKey ?? parentCommentKey,
          text,
        });
      });
    }

    if (comments.length > 0) {
      threads.push({
        comments,
        id: discussion.id,
        isResolved: discussion?.isResolved ?? false,
      });
    }
  });

  return threads;
}

/**
 * Convert a name to initials (max 2 characters).
 */
export function toInitials(name?: null | string): string {
  if (!name) return '';
  const parts = name.trim().split(WHITESPACE_REGEX).filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Normalize a date to ISO string format.
 */
export function normalizeDate(
  date?: Date | null | number | string
): string | undefined {
  if (!date) return;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return;

  return parsed.toISOString();
}

/**
 * Resolve suggestion type to 'insert' or 'remove'.
 */
function resolveSuggestionType(type?: null | string): 'insert' | 'remove' {
  if (type === 'remove') return 'remove';

  return 'insert';
}

/**
 * Resolve suggestion author name from userId.
 */
function resolveSuggestionAuthor(
  userId?: null | string,
  userNameMap?: Map<string, string>
): string {
  if (!userId) return 'unknown';

  return userNameMap?.get(userId) ?? userId;
}

/**
 * Resolve comment metadata from discussions.
 */
function resolveCommentMeta(
  id: string,
  options: InjectDocxTrackingTokensOptions,
  commentThreadMap?: Map<string, DocxCommentThread>
): CommentPayload {
  const thread =
    commentThreadMap?.get(id) ??
    buildCommentThreads(
      options.discussions,
      options.userNameMap,
      options.nodeToString
    ).find((item) => item.id === id);

  const threadComment =
    thread?.comments?.find((comment) => comment.id === id) ??
    thread?.comments?.[0];

  const discussionId = thread?.id ?? id;
  const discussion = options.discussions?.find(
    (item) => item?.id === discussionId
  );
  const discussionAuthorName =
    discussion?.user?.name ??
    options.userNameMap?.get(discussion?.userId ?? '') ??
    discussion?.userId ??
    'unknown';

  const authorName =
    threadComment?.authorName ?? discussionAuthorName ?? 'unknown';
  const text =
    threadComment?.text ??
    discussion?.documentContent?.toString?.() ??
    'Imported comment';
  const date =
    threadComment?.date ?? normalizeDate(discussion?.createdAt);

  return {
    authorInitials: threadComment?.authorInitials ?? toInitials(authorName),
    authorName,
    date,
    id,
    text,
  };
}

// ============================================================================
// Default Mark Extractors
// ============================================================================

/** Suggestion key prefix used by @platejs/suggestion */
const SUGGESTION_KEY_PREFIX = 'suggestion_';

/** Comment key prefix used by @platejs/comment */
const COMMENT_KEY_PREFIX = 'comment_';

/**
 * Default function to extract suggestion metadata from a text node.
 * Looks for keys starting with 'suggestion_' prefix.
 */
function defaultGetSuggestions(node: TText): DocxExportSuggestionMeta[] {
  const suggestions: DocxExportSuggestionMeta[] = [];

  for (const key of Object.keys(node)) {
    if (key.startsWith(SUGGESTION_KEY_PREFIX)) {
      const suggestionId = key.slice(SUGGESTION_KEY_PREFIX.length);

      if (suggestionId) {
        const value = node[key] as
          | DocxExportSuggestionMeta
          | boolean
          | undefined;
        const meta: DocxExportSuggestionMeta =
          typeof value === 'object' && value !== null
            ? { ...value, id: suggestionId }
            : { id: suggestionId };
        suggestions.push(meta);
      }
    }
  }

  // Also check for block-level suggestion inherited via 'suggestion' property
  const blockSuggestion = (node as Record<string, unknown>)
    .suggestion as DocxExportSuggestionMeta;

  if (blockSuggestion?.id) {
    suggestions.push(blockSuggestion);
  }

  return suggestions;
}

/**
 * Default function to extract comment IDs from a text node.
 * Looks for keys starting with 'comment_' prefix.
 */
function defaultGetCommentIds(node: TText): string[] {
  const commentIds: string[] = [];

  for (const key of Object.keys(node)) {
    if (key.startsWith(COMMENT_KEY_PREFIX)) {
      const commentId = key.slice(COMMENT_KEY_PREFIX.length);

      if (commentId) {
        commentIds.push(commentId);
      }
    }
  }

  return commentIds;
}

// ============================================================================
// Leaf Collection
// ============================================================================

/**
 * Recursively collect all text leaves with their suggestion and comment marks.
 */
function collectLeaves(
  node: Record<string, unknown>,
  leaves: LeafEntry[],
  options: InjectDocxTrackingTokensOptions,
  inheritedSuggestions: DocxExportSuggestionMeta[] = []
): void {
  const {
    getCommentIds = defaultGetCommentIds,
    getSuggestions = defaultGetSuggestions,
  } = options;

  // Check if this is a text node
  if (typeof node.text === 'string') {
    const textNode = node as unknown as TText;
    const suggestionMap = new Map<string, DocxExportSuggestionMeta>();

    // Add inherited suggestions
    inheritedSuggestions.forEach((suggestion) => {
      suggestionMap.set(suggestion.id, suggestion);
    });

    // Add suggestions from this node
    const nodeSuggestions = getSuggestions(textNode);
    nodeSuggestions.forEach((suggestion) => {
      suggestionMap.set(suggestion.id, suggestion);
    });

    // Get comment IDs
    const commentIds = getCommentIds(textNode);

    leaves.push({
      commentIds,
      node: textNode,
      suggestions: suggestionMap,
    });

    return;
  }

  // Check if this is an element with children
  if (!Array.isArray(node.children)) return;

  // Check for block-level suggestion
  let nextInherited = inheritedSuggestions;
  const blockSuggestion = node.suggestion as
    | DocxExportSuggestionMeta
    | undefined;

  if (blockSuggestion?.id) {
    nextInherited = [
      ...inheritedSuggestions,
      {
        createdAt: blockSuggestion.createdAt,
        id: blockSuggestion.id,
        type: blockSuggestion.type,
        userId: blockSuggestion.userId,
      },
    ];
  }

  // Recurse into children
  (node.children as Record<string, unknown>[]).forEach((child) => {
    collectLeaves(child, leaves, options, nextInherited);
  });
}

// ============================================================================
// Token Building Helpers
// ============================================================================

/**
 * Build a suggestion start token with resolved metadata.
 */
function buildResolvedSuggestionStartToken(
  suggestion: DocxExportSuggestionMeta,
  userNameMap?: Map<string, string>
): string {
  const type = resolveSuggestionType(suggestion.type);
  const payload: SuggestionPayload = {
    author: resolveSuggestionAuthor(suggestion.userId, userNameMap),
    date: normalizeDate(suggestion.createdAt),
    id: suggestion.id,
  };

  return buildSuggestionStartToken(payload, type);
}

/**
 * Build a suggestion end token.
 */
function buildResolvedSuggestionEndToken(
  suggestion: DocxExportSuggestionMeta
): string {
  const type = resolveSuggestionType(suggestion.type);

  return buildSuggestionEndToken(suggestion.id, type);
}

/**
 * Build a comment start token with resolved metadata.
 */
function buildResolvedCommentStartToken(
  id: string,
  options: InjectDocxTrackingTokensOptions,
  commentThreadMap?: Map<string, DocxCommentThread>
): string {
  const payload = resolveCommentMeta(id, options, commentThreadMap);

  return buildCommentStartToken(payload);
}

// ============================================================================
// Main Export Function
// ============================================================================

/**
 * Inject DOCX tracking tokens into editor value for export.
 *
 * This function:
 * 1. Clones the editor value to avoid mutation
 * 2. Collects all text leaves with their suggestion/comment marks
 * 3. Determines where each suggestion/comment starts and ends
 * 4. Injects start/end tokens into text nodes
 *
 * The resulting value can be serialized to HTML and then converted to DOCX
 * with tracked changes and comments preserved.
 *
 * @param value - The editor value (array of nodes)
 * @param options - Options for token injection
 * @returns Cloned value with tracking tokens injected into text nodes
 */
export function injectDocxTrackingTokens(
  value: TNode[],
  options: InjectDocxTrackingTokensOptions = {}
): TNode[] {
  const cloned = cloneValue(value);
  const leaves: LeafEntry[] = [];
  const commentThreads =
    options.commentThreads ??
    buildCommentThreads(
      options.discussions,
      options.userNameMap,
      options.nodeToString
    );
  const commentThreadMap = new Map<string, DocxCommentThread>();
  commentThreads.forEach((thread) => {
    commentThreadMap.set(thread.id, thread);
    thread.comments.forEach((comment) => {
      commentThreadMap.set(comment.id, thread);
    });
  });

  // Collect all leaves from all top-level nodes
  cloned.forEach((node) => {
    collectLeaves(node as Record<string, unknown>, leaves, options);
  });

  ensureNonEmptyCommentRanges(leaves);

  const expandCommentIds = (ids: string[]): string[] => {
    const expanded: string[] = [];
    const seen = new Set<string>();

    const push = (value: string) => {
      if (seen.has(value)) return;
      seen.add(value);
      expanded.push(value);
    };

    ids.forEach((commentId) => {
      const thread = commentThreadMap.get(commentId);
      if (thread) {
        push(thread.id);
      } else {
        push(commentId);
      }
    });

    return expanded;
  };

  leaves.forEach((leaf) => {
    leaf.commentIds = expandCommentIds(leaf.commentIds);
  });

  // Track when each suggestion/comment first appears
  const suggestionStartOrder = new Map<string, number>();
  const commentStartOrder = new Map<string, number>();
  const startSequence = new Map<string, number>();
  let startSequenceCounter = 0;
  const makeTokenKey = (kind: 'comment' | 'suggestion', id: string) =>
    `${kind}:${id}`;

  // Process each leaf to inject tokens
  leaves.forEach((leaf, index) => {
    const prev = leaves[index - 1];
    const next = leaves[index + 1];

    // Get current suggestion/comment IDs
    const currentSuggestionIds = [...leaf.suggestions.keys()];
    const prevSuggestionIds = new Set(prev ? [...prev.suggestions.keys()] : []);
    const nextSuggestionIds = new Set(next ? [...next.suggestions.keys()] : []);

    const currentCommentIds = leaf.commentIds;
    const prevCommentIds = new Set(prev?.commentIds ?? []);
    const nextCommentIds = new Set(next?.commentIds ?? []);

    // Find which suggestions/comments start and end at this leaf
    const startSuggestions = currentSuggestionIds.filter(
      (id) => !prevSuggestionIds.has(id)
    );
    const endSuggestions = currentSuggestionIds.filter(
      (id) => !nextSuggestionIds.has(id)
    );

    const startComments = currentCommentIds.filter(
      (id) => !prevCommentIds.has(id)
    );
    const endComments = currentCommentIds.filter(
      (id) => !nextCommentIds.has(id)
    );

    // Record start order for proper nesting
    startComments.forEach((id) => {
      if (!commentStartOrder.has(id)) {
        commentStartOrder.set(id, index);
      }
      const key = makeTokenKey('comment', id);
      if (!startSequence.has(key)) {
        startSequence.set(key, startSequenceCounter++);
      }
    });

    startSuggestions.forEach((id) => {
      if (!suggestionStartOrder.has(id)) {
        suggestionStartOrder.set(id, index);
      }
      const key = makeTokenKey('suggestion', id);
      if (!startSequence.has(key)) {
        startSequence.set(key, startSequenceCounter++);
      }
    });

    // Build sorted start tokens (comment ranges should wrap suggestions)
    const startTokens = [
      ...startSuggestions.map((id) => ({
        id,
        kind: 'suggestion' as const,
        order: suggestionStartOrder.get(id) ?? index,
        sequence: startSequence.get(makeTokenKey('suggestion', id)) ?? 0,
      })),
      ...startComments.map((id) => ({
        id,
        kind: 'comment' as const,
        order: commentStartOrder.get(id) ?? index,
        sequence: startSequence.get(makeTokenKey('comment', id)) ?? 0,
      })),
    ].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      if (a.sequence !== b.sequence) return a.sequence - b.sequence;
      return a.kind === 'comment' ? -1 : 1;
    });

    // Build sorted end tokens (later starts close first)
    const endTokens = [
      ...endSuggestions.map((id) => ({
        id,
        kind: 'suggestion' as const,
        order: suggestionStartOrder.get(id) ?? index,
        sequence: startSequence.get(makeTokenKey('suggestion', id)) ?? 0,
      })),
      ...endComments.map((id) => ({
        id,
        kind: 'comment' as const,
        order: commentStartOrder.get(id) ?? index,
        sequence: startSequence.get(makeTokenKey('comment', id)) ?? 0,
      })),
    ].sort((a, b) => {
      if (a.order !== b.order) return b.order - a.order;
      if (a.sequence !== b.sequence) return b.sequence - a.sequence;
      return a.kind === 'suggestion' ? -1 : 1;
    });

    // Generate token strings
    const prefixTokens = startTokens
      .map((token) =>
        token.kind === 'suggestion'
          ? buildResolvedSuggestionStartToken(
              leaf.suggestions.get(token.id) ?? { id: token.id },
              options.userNameMap
            )
          : buildResolvedCommentStartToken(
              token.id,
              options,
              commentThreadMap
            )
      )
      .join('');

    const suffixTokens = endTokens
      .map((token) =>
        token.kind === 'comment'
          ? buildCommentEndToken(token.id)
          : buildResolvedSuggestionEndToken(
              leaf.suggestions.get(token.id) ?? { id: token.id }
            )
      )
      .join('');

    // Inject tokens into text
    leaf.node.text = `${prefixTokens}${leaf.node.text}${suffixTokens}`;
  });

  return cloned;
}
