/**
 * HTML to DOCX converter adapted from html-to-docx (MIT License). The adapted
 * sources live in `./internal`; see `THIRD_PARTY_NOTICES.md` for the notice.
 *
 * @packageDocumentation
 */

import JSZip from 'jszip';

import addFilesToContainer from './internal/html-to-docx';
import type { DocumentOptions } from './internal/types';

/**
 * Convert HTML content to a DOCX blob.
 *
 * This function uses the adapted html-to-docx converter to create a valid DOCX file
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
  const zip = new JSZip();
  const resultZip = await addFilesToContainer(zip, safeHtml, options, null);
  const buffer = await resultZip.generateAsync({ type: 'uint8array' });
  const blobBuffer = new Uint8Array(buffer);

  return new Blob([blobBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}
