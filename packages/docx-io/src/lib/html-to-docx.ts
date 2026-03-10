/**
 * HTML to DOCX converter using @turbodocx/html-to-docx
 *
 * This module wraps the @turbodocx/html-to-docx library to provide
 * a simple API for converting HTML content to DOCX format.
 *
 * @packageDocumentation
 */

import HTMLtoDOCX from './html-to-docx/index';
import type { DocumentOptions, Margins } from './html-to-docx/index';

// Re-export types from the library
export type {
  DocumentOptions,
  LineNumberOptions,
  Margins,
  NumberingOptions,
  PageSize,
  TableOptions,
} from './html-to-docx/index';

// Backwards compatibility aliases
export type DocumentMargins = Margins;
export type HtmlToDocxOptions = DocumentOptions;

/**
 * Convert HTML content to a DOCX blob.
 *
 * This function uses @turbodocx/html-to-docx to create a valid DOCX file
 * from HTML content with proper support for images, tables, and styling.
 *
 * @param html - The HTML content to convert
 * @param options - Optional document configuration (orientation, margins, etc.)
 * @returns A Promise that resolves to a Blob containing the DOCX file
 *
 * @example
 * ```typescript
 * const html = '<h1>Hello World</h1><p>This is a paragraph.</p>';
 * const blob = await htmlToDocxBlob(html, { orientation: 'landscape' });
 *
 * // Download the file
 * const url = URL.createObjectURL(blob);
 * const a = document.createElement('a');
 * a.href = url;
 * a.download = 'document.docx';
 * a.click();
 * ```
 */
export async function htmlToDocxBlob(
  html: string,
  options: DocumentOptions = {}
): Promise<Blob> {
  // Handle empty HTML - the underlying library crashes on empty string
  const safeHtml = html.trim() === '' ? '<p></p>' : html;

  const result = await HTMLtoDOCX(safeHtml, null, options, null);

  // In browser environment, result is a Blob
  if (result instanceof Blob) {
    return result;
  }

  // In Node.js/Bun environment, result is a Buffer - convert to Blob
  // Buffer.isBuffer is the type-safe way to check for Buffer
  return new Blob([new Uint8Array(result)], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}
