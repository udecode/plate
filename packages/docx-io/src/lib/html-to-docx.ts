/**
 * HTML to DOCX converter using html-to-docx
 *
 * This module wraps the html-to-docx library to provide
 * a simple API for converting HTML content to DOCX format.
 *
 * IMPORTANT: This uses native DOCX element generation (not altChunk).
 * altChunk embeds raw HTML and only works in Microsoft Word - it breaks
 * in LibreOffice and Google Docs. This library converts HTML to native
 * DOCX elements (<w:p>, <w:r>, <w:t>, tables, images, etc.) which works
 * in all word processors.
 *
 * @packageDocumentation
 */

import HTMLtoDOCX from './html-to-docx/index.js';
import type { DocumentOptions, Margins } from './html-to-docx/index.js';

// Re-export types from the library
export type {
  DocumentOptions,
  HeadingOptions,
  HeadingSpacing,
  HeadingStyleOptions,
  LineNumberOptions,
  Margins,
  NumberingOptions,
  PageSize,
  TableBorderOptions,
  TableOptions,
} from './html-to-docx/index.js';

// Backwards compatibility aliases
export type DocumentMargins = Margins;
export type HtmlToDocxOptions = DocumentOptions;

/**
 * Convert HTML content to a DOCX blob.
 *
 * This function uses html-to-docx to create a valid DOCX file
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

  // Convert the result to a Blob if it isn't already
  if (result instanceof Blob) {
    return result;
  }

  // Handle Buffer (Node.js/Bun environment) - convert to Uint8Array first
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(result)) {
    return new Blob([new Uint8Array(result)], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
  }

  // Handle ArrayBuffer
  if (result instanceof ArrayBuffer) {
    return new Blob([result], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
  }

  // Fallback for other types
  return new Blob([result as unknown as BlobPart], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}
