import { cleanDocx, isDocxContent } from '@platejs/docx';
import type { SlateEditor, TNode } from 'platejs';

import type { ImportHtmlResult } from './types';

/**
 * Parse HTML string to DOM element for deserialization.
 */
function parseHtmlElement(html: string): HTMLElement | undefined {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  return doc.body ?? undefined;
}

export type ImportHtmlOptions = {
  /** RTF data for DOCX image extraction (optional, for paste from Word) */
  rtf?: string;
};

/**
 * Import HTML and convert it to Plate editor nodes.
 *
 * Automatically detects and handles DOCX-style HTML (from Word paste).
 *
 * @param editor - The Plate editor instance
 * @param html - The HTML string to import
 * @param options - Import options
 * @returns Import result with nodes
 *
 * @example
 * ```ts
 * const file = await picker.getFile();
 * const html = await file.text();
 * const result = importHtml(editor, html);
 *
 * // Insert nodes into editor
 * editor.tf.insertNodes(result.nodes);
 * ```
 */
export function importHtml(
  editor: SlateEditor,
  html: string,
  options: ImportHtmlOptions = {}
): ImportHtmlResult {
  const { rtf = '' } = options;

  // Check if this is DOCX-style HTML and clean if needed
  const tempElement = parseHtmlElement(html);
  const shouldClean = tempElement && isDocxContent(tempElement);
  const processedHtml = shouldClean ? cleanDocx(html, rtf) : html;

  // Parse HTML to DOM element
  const element = parseHtmlElement(processedHtml);

  if (!element) {
    return { nodes: [] };
  }

  // Deserialize HTML to Plate nodes
  const nodes = editor.api.html.deserialize({ element }) as TNode[];

  return { nodes };
}
