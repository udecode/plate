/**
 * DOCX Tracked Changes and Comments Application
 *
 * This module re-exports utilities for applying tracked changes and comments
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
 * 5. Apply comments using applyTrackedComments or applyTrackedCommentsLocal
 */

// Re-export everything from the split modules
export {
  // Types
  type ApplySuggestionsOptions,
  type ApplySuggestionsResult,
  type SearchRangeFn,
  type TPoint,
  type TrackingEditor,
  type TRange,
  // Functions
  applyTrackedChangeSuggestions,
  formatAuthorAsUserId,
  isPointAfter,
  parseDate,
  parseDateToDate,
} from './applyDocxTrackingChanges';

export {
  // Types
  type ApplyCommentsLocalOptions,
  type ApplyCommentsLocalResult,
  type ApplyCommentsOptions,
  type ApplyCommentsResult,
  type CreateDiscussionFn,
  type DocxImportDiscussion,
  // Functions
  applyTrackedComments,
  applyTrackedCommentsLocal,
  getPointCommentMarkRange,
  isPathEqual,
  isPointEqual,
  isRangeEqual,
} from './applyDocxComments';

import type { DocxImportComment, DocxTrackedChange } from './parseDocxTracking';
import type { ApplySuggestionsOptions } from './applyDocxTrackingChanges';
import type { ApplyCommentsOptions } from './applyDocxComments';
import {
  applyTrackedChangeSuggestions,
  type ApplySuggestionsResult,
  type SearchRangeFn,
  type TrackingEditor,
} from './applyDocxTrackingChanges';
import {
  applyTrackedComments,
  type ApplyCommentsResult,
} from './applyDocxComments';

// ============================================================================
// Combined Import with Tracking
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
  suggestionConfig: Omit<
    ApplySuggestionsOptions,
    'editor' | 'changes' | 'searchRange'
  >;
  commentConfig?: Omit<
    ApplyCommentsOptions,
    'editor' | 'comments' | 'searchRange'
  >;
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
    totalApplied: suggestionsResult.total + (commentsResult?.created ?? 0),
  };
}
