/**
 * RevisionContent - Defines valid content types for tracked changes (revisions)
 *
 * Per ECMA-376, w:ins and w:del elements can contain:
 * - w:r (runs) - Text with formatting
 * - w:r with w:drawing (image runs) - Images embedded in runs
 * - w:hyperlink - Hyperlinks with nested runs
 *
 * This module provides the type definitions and type guards for revision content.
 */

import type { Run } from './Run';
import type { Hyperlink } from './Hyperlink';
import type { ImageRun } from './ImageRun';

/**
 * Content types valid within a revision (tracked change)
 *
 * Per ECMA-376 Part 1 section 17.13.5, revision elements can contain:
 * - Run elements (w:r) - the most common case
 * - ImageRun elements (w:r with w:drawing) - for tracked image changes
 * - Hyperlink elements (w:hyperlink) - for tracked hyperlink changes
 */
export type RevisionContent = Run | ImageRun | Hyperlink;

/**
 * Type guard to check if content is a Run
 * @param content - The content to check
 * @returns true if content is a Run instance
 *
 * Note: Uses duck typing instead of constructor.name to handle minified builds.
 * Run objects have getText() but NOT getUrl() or getAnchor() methods.
 */
export function isRunContent(content: RevisionContent): content is Run {
  if (!content || typeof content !== 'object') return false;

  // Duck typing: Runs have getText but no getUrl
  const hasGetText = typeof (content as any).getText === 'function';
  const hasGetUrl = typeof (content as any).getUrl === 'function';

  return hasGetText && !hasGetUrl;
}

/**
 * Type guard to check if content is a Hyperlink
 * @param content - The content to check
 * @returns true if content is a Hyperlink instance
 *
 * Note: Uses duck typing instead of constructor.name to handle minified builds.
 * Hyperlink objects have getUrl() method which Runs don't have.
 */
export function isHyperlinkContent(content: RevisionContent): content is Hyperlink {
  if (!content || typeof content !== 'object') return false;

  // Duck typing: Hyperlinks have getUrl method
  return typeof (content as any).getUrl === 'function';
}

/**
 * Type guard to check if content is an ImageRun
 * @param content - The content to check
 * @returns true if content is an ImageRun instance
 *
 * Note: Uses duck typing instead of constructor.name to handle minified builds.
 * ImageRun objects have getImageElement() method which regular Runs don't have.
 * This check should be performed BEFORE isRunContent() since ImageRun extends Run.
 */
export function isImageRunContent(content: RevisionContent): content is ImageRun {
  if (!content || typeof content !== 'object') return false;

  // Duck typing: ImageRun has getImageElement method which regular Run doesn't have
  return typeof (content as any).getImageElement === 'function';
}
