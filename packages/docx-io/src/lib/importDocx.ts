import { cleanDocx } from '@platejs/docx';
import mammoth from 'mammoth';
import type { SlateEditor, TNode } from 'platejs';

import { convertToHtmlWithTracking } from './mammothWithTracking';
import { parseDocxTracking } from './parseDocxTracking';
import {
  extractComments,
  preprocessMammothHtml,
} from './preprocessMammothHtml';
import type {
  ImportDocxOptions,
  ImportDocxResult,
  ImportDocxWithTrackingOptions,
  ImportDocxWithTrackingResult,
} from './types';

/**
 * Parse HTML string to DOM element for deserialization.
 */
function parseHtmlElement(html: string): HTMLElement | undefined {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  return doc.body ?? undefined;
}

/**
 * Import a DOCX file and convert it to Plate editor nodes.
 *
 * @param editor - The Plate editor instance
 * @param arrayBuffer - The DOCX file as ArrayBuffer
 * @param options - Import options
 * @returns Import result with nodes, comments, and warnings
 *
 * @example
 * ```ts
 * const file = await picker.getFile();
 * const arrayBuffer = await file.arrayBuffer();
 * const result = await importDocx(editor, arrayBuffer);
 *
 * // Insert nodes into editor
 * editor.tf.insertNodes(result.nodes);
 *
 * // Handle comments separately
 * for (const comment of result.comments) {
 *   // Create discussions via your backend
 * }
 * ```
 */
export async function importDocx(
  editor: SlateEditor,
  arrayBuffer: ArrayBuffer,
  options: ImportDocxOptions = {}
): Promise<ImportDocxResult> {
  const { rtf = '' } = options;

  // Convert DOCX to HTML using mammoth
  const mammothResult = await mammoth.convertToHtml(
    { arrayBuffer },
    { styleMap: ['comment-reference => sup'] }
  );

  const mammothHtml = mammothResult.value;
  const warnings = mammothResult.messages.map((msg) => msg.message);

  // Preprocess to extract comments
  const {
    commentById,
    commentIds,
    html: preprocessedHtml,
  } = preprocessMammothHtml(mammothHtml);

  // Clean DOCX-specific HTML
  const cleanedHtml = cleanDocx(preprocessedHtml, rtf);

  // Parse HTML to DOM element
  const element = parseHtmlElement(cleanedHtml);

  if (!element) {
    return {
      comments: [],
      nodes: [],
      warnings: [...warnings, 'Failed to parse HTML'],
    };
  }

  // Deserialize HTML to Plate nodes
  const nodes = editor.api.html.deserialize({ element }) as TNode[];

  // Extract comments
  const comments = extractComments(commentById, commentIds);

  return {
    comments,
    nodes,
    warnings,
  };
}

/**
 * Import a DOCX file with tracked changes and comments support.
 *
 * This function uses a pre-processing approach to extract tracked changes
 * (insertions/deletions) and comments from the DOCX file, injecting tokens
 * that can be parsed and applied to the editor.
 *
 * @param editor - The Plate editor instance
 * @param arrayBuffer - The DOCX file as ArrayBuffer
 * @param options - Import options
 * @returns Import result with nodes, tracked changes, and comments
 *
 * @example
 * ```ts
 * const file = await picker.getFile();
 * const arrayBuffer = await file.arrayBuffer();
 * const result = await importDocxWithTracking(editor, arrayBuffer);
 *
 * // Insert nodes into editor
 * editor.tf.insertNodes(result.nodes);
 *
 * // Apply tracked changes
 * for (const change of result.trackedChanges) {
 *   // Apply suggestion marks using searchRange...
 * }
 *
 * // Handle comments
 * for (const comment of result.trackedComments) {
 *   // Create discussions via your backend...
 * }
 * ```
 */
export async function importDocxWithTracking(
  editor: SlateEditor,
  arrayBuffer: ArrayBuffer,
  options: ImportDocxWithTrackingOptions = {}
): Promise<ImportDocxWithTrackingResult> {
  const { rtf = '' } = options;

  // Convert DOCX to HTML with tracking tokens injected
  const mammothResult = await convertToHtmlWithTracking(arrayBuffer, {
    styleMap: ['comment-reference => sup'],
  });

  const mammothHtml = mammothResult.value;
  const warnings = mammothResult.messages.map((msg) => msg.message);

  // Parse tracking tokens from the HTML
  const trackingResult = parseDocxTracking(mammothHtml);

  // Also preprocess for legacy comment extraction
  const {
    commentById,
    commentIds,
    html: preprocessedHtml,
  } = preprocessMammothHtml(mammothHtml);

  // Clean DOCX-specific HTML
  const cleanedHtml = cleanDocx(preprocessedHtml, rtf);

  // Parse HTML to DOM element
  const element = parseHtmlElement(cleanedHtml);

  if (!element) {
    return {
      comments: [],
      deletionCount: 0,
      hasTracking: false,
      insertionCount: 0,
      nodes: [],
      trackedChanges: [],
      trackedComments: [],
      warnings: [...warnings, 'Failed to parse HTML'],
    };
  }

  // Deserialize HTML to Plate nodes
  const nodes = editor.api.html.deserialize({ element }) as TNode[];

  // Extract legacy comments
  const comments = extractComments(commentById, commentIds);

  return {
    comments,
    deletionCount: trackingResult.trackedChanges.deletionCount,
    hasTracking: trackingResult.hasTracking,
    insertionCount: trackingResult.trackedChanges.insertionCount,
    nodes,
    trackedChanges: trackingResult.trackedChanges.changes,
    trackedComments: trackingResult.comments.comments,
    warnings,
  };
}
