/**
 * DOCX Import/Export Library
 *
 * This package provides DOCX import and export functionality for Plate editors,
 * including support for tracked changes (suggestions) and comments.
 */

// ============================================================================
// Easy Import/Export Plugin Kit
// ============================================================================

export { DocxIOKit, DocxIOPlugin } from './DocxIOPlugin';

// ============================================================================
// Import
// ============================================================================

export * from './importDocx';

// Export from importTrackChanges, excluding duplicates that are re-exported from importComments
export {
  applyTrackedChangeSuggestions,
  formatAuthorAsUserId,
  isPointAfter,
  parseDate,
  parseDateToDate,
  parseDocxTrackedChanges,
  DOCX_DELETION_END_TOKEN_PREFIX,
  DOCX_DELETION_START_TOKEN_PREFIX,
  DOCX_DELETION_TOKEN_SUFFIX,
  DOCX_INSERTION_END_TOKEN_PREFIX,
  DOCX_INSERTION_START_TOKEN_PREFIX,
  DOCX_INSERTION_TOKEN_SUFFIX,
  type ApplySuggestionsOptions,
  type ApplySuggestionsResult,
  type ParseTrackedChangesResult,
  type SearchRangeFn,
  type TPoint,
  type TrackingEditor,
} from './importTrackChanges';

// Export everything from importComments (includes combined hasDocxTrackingTokens & stripDocxTrackingTokens)
export * from './importComments';

// ============================================================================
// Export
// ============================================================================

// Export from docx-export-plugin, excluding htmlToDocxBlob which comes from exportDocx
export {
  DEFAULT_DOCX_MARGINS,
  DOCX_EXPORT_STYLES,
  DocxExportPlugin,
  downloadDocx,
  exportEditorToDocx,
  exportToDocx,
  type DocxExportApiMethods,
  type DocxExportMargins,
  type DocxExportOperationOptions,
  type DocxExportOptions,
  type DocxExportOrientation,
  type DocxExportPluginOptions,
  type DocxTrackingExportOptions,
  type DocxExportTransformMethods,
} from './docx-export-plugin';

// Export everything from exportDocx (including htmlToDocxBlob)
export * from './exportDocx';

// Export from exportTrackChanges, excluding types that conflict
export {
  buildUserNameMap,
  injectDocxTrackingTokens,
  normalizeDate,
  toInitials,
  type DocxExportComment,
  type DocxExportDiscussion,
  type DocxExportSuggestionMeta,
  type DocxExportUser,
  type InjectDocxTrackingTokensOptions,
} from './exportTrackChanges';

export * from './exportComments';

// ============================================================================
// Shared
// ============================================================================

export * from './searchRange';
export * from './types';

// Note: Document types (DocumentOptions, Margins, etc.) are already exported
// via './exportDocx' which re-exports them from html-to-docx

// Export tracking token constants from html-to-docx
export {
  DOCX_COMMENT_END_TOKEN_PREFIX,
  DOCX_COMMENT_START_TOKEN_PREFIX,
  DOCX_COMMENT_TOKEN_SUFFIX,
  buildCommentEndToken,
  buildCommentStartToken,
  buildSuggestionEndToken,
  buildSuggestionStartToken,
  hasTrackingTokens,
  splitDocxTrackingTokens,
  type CommentPayload,
  type StoredComment,
  type SuggestionPayload,
  type TrackingState,
} from './html-to-docx/tracking';
