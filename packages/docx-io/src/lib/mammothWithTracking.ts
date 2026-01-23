/**
 * Mammoth.js Wrapper with Tracked Changes Support
 *
 * This module wraps the mammoth.js fork that has native support for
 * tracked changes (insertions/deletions) and comments with proper token
 * emission for the Plate editor.
 *
 * The fork handles:
 * - w:ins elements → [[DOCX_INS_START:...]]...[[DOCX_INS_END:id]]
 * - w:del elements → [[DOCX_DEL_START:...]]...[[DOCX_DEL_END:id]]
 * - w:commentRangeStart/End → [[DOCX_CMT_START:...]]...[[DOCX_CMT_END:id]]
 *
 * This wrapper provides a clean API with `withTracking` suffix functions
 * while keeping the mammoth fork as a separate, untouched package.
 */

import { mammoth } from './mammoth';

// ============================================================================
// Types
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
  messages: mammoth.MammothMessage[];
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
 * const tracking = parseDocxTracking(result.value);
 *
 * // Apply to editor
 * for (const change of tracking.trackedChanges.changes) {
 *   // Apply suggestion marks...
 * }
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
