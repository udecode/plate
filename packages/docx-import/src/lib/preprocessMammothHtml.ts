import type { DocxComment } from './types';

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

/**
 * Preprocess mammoth HTML output to extract and tokenize comments.
 *
 * Mammoth converts DOCX comments to:
 * - `<dl>` elements containing comment definitions
 * - `<a id="comment-ref-{id}">` anchors marking comment locations
 *
 * This function:
 * 1. Extracts comment text from `<dl>` elements
 * 2. Replaces comment anchors with tokens `[[DOCX_COMMENT_REF:id]]`
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

  // Replace comment anchors with tokens
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

    const token = `${DOCX_COMMENT_REF_TOKEN_PREFIX}${commentId}${DOCX_COMMENT_REF_TOKEN_SUFFIX}`;
    const textNode = doc.createTextNode(token);
    const parent = a.parentElement;

    if (parent?.tagName === 'SUP' && parent.childNodes.length === 1) {
      parent.replaceWith(textNode);
    } else {
      a.replaceWith(textNode);
    }
  }

  return { commentById, commentIds, html: doc.body.innerHTML };
}

/**
 * Extract comments from preprocessed result.
 */
export function extractComments(
  commentById: Map<string, string>,
  commentIds: string[]
): DocxComment[] {
  return commentIds.map((id) => ({
    id,
    text: commentById.get(id) ?? '',
  }));
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
