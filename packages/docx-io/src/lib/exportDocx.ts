/**
 * HTML to DOCX converter using docXMLater
 *
 * This module provides the primary API for converting HTML content to DOCX format
 * using the docXMLater library for native DOCX element generation.
 *
 * IMPORTANT: This uses native DOCX element generation (not altChunk).
 * altChunk embeds raw HTML and only works in Microsoft Word - it breaks
 * in LibreOffice and Google Docs. This library converts HTML to native
 * DOCX elements (<w:p>, <w:r>, <w:t>, tables, images, etc.) which works
 * in all word processors.
 *
 * @packageDocumentation
 */

// Import from adapters module (new architecture)
import {
  htmlToDocument,
  htmlToDocumentSync,
  validateHtmlForConversion,
  type HtmlToDocumentOptions,
  type HtmlToDocumentResult,
  type ConversionWarning,
  type ConversionStats,
} from './adapters';

// Import types from the types module
import {
  type DocxExportOptions,
  type ExportResult,
  type ExportWarning,
  type ExportError,
  type ExportStats,
  type DocumentOptions,
  type StyleMappingOptions,
  ExportErrorCodes,
  ExportWarningCodes,
} from './adapters/types';

// Import Document class for direct access
import type { Document, Margins } from './docXMLater/src';

// ============================================================================
// Re-exports for backwards compatibility
// ============================================================================

// Re-export types from adapters/types
export type {
  DocxExportOptions,
  ExportResult,
  ExportWarning,
  ExportError,
  ExportStats,
  DocumentOptions,
  StyleMappingOptions,
  Margins,
};

// Backwards compatibility aliases
export type DocumentMargins = Margins;
export type HtmlToDocxOptions = DocxExportOptions;

// Re-export from adapters
export {
  htmlToDocument,
  htmlToDocumentSync,
  validateHtmlForConversion,
  type HtmlToDocumentOptions,
  type HtmlToDocumentResult,
  type ConversionWarning,
  type ConversionStats,
};

// ============================================================================
// Main Export Function
// ============================================================================

/**
 * Convert HTML content to a DOCX blob.
 *
 * This function uses docXMLater to create a valid DOCX file
 * from HTML content with proper support for images, tables, and styling.
 *
 * @param html - The HTML content to convert
 * @param options - Optional document configuration (orientation, margins, etc.)
 * @returns A Promise that resolves to an ExportResult containing the blob and metadata
 *
 * @example
 * ```typescript
 * const html = '<h1>Hello World</h1><p>This is a paragraph.</p>';
 * const result = await htmlToDocxBlob(html, { orientation: 'landscape' });
 *
 * if (result.success && result.blob) {
 *   // Download the file
 *   const url = URL.createObjectURL(result.blob);
 *   const a = document.createElement('a');
 *   a.href = url;
 *   a.download = 'document.docx';
 *   a.click();
 * }
 * ```
 */
export async function htmlToDocxBlob(
  html: string,
  options: DocxExportOptions = {}
): Promise<ExportResult> {
  const startTime = Date.now();
  const warnings: ExportWarning[] = [];
  const errors: ExportError[] = [];

  try {
    // Handle empty HTML
    const safeHtml = html.trim() === '' ? '<p></p>' : html;

    // Validate HTML and collect warnings
    const validationWarnings = validateHtmlForConversion(safeHtml);
    for (const warning of validationWarnings) {
      warnings.push({
        code:
          warning.type === 'unsupported-element'
            ? ExportWarningCodes.UNSUPPORTED_ELEMENT
            : ExportWarningCodes.UNKNOWN,
        message: warning.message,
        source: warning.source,
      });
    }

    // Convert HTML to Document using the adapters module
    const conversionOptions: HtmlToDocumentOptions = {
      html: safeHtml,
      properties: options.properties,
      pageSize: options.pageSize as HtmlToDocumentOptions['pageSize'],
      orientation: options.orientation,
      margins: options.margins,
      defaultFontFamily: options.defaultFontFamily,
      defaultFontSize: options.defaultFontSize,
      preserveWhitespace: options.preserveWhitespace,
      baseUrl: options.baseUrl,
    };

    const conversionResult = await htmlToDocument(conversionOptions);

    // Add conversion warnings
    for (const warning of conversionResult.warnings) {
      warnings.push({
        code:
          warning.type === 'unsupported-element'
            ? ExportWarningCodes.UNSUPPORTED_ELEMENT
            : warning.type === 'invalid-style'
              ? ExportWarningCodes.INVALID_STYLE
              : warning.type === 'image-fetch-failed'
                ? ExportWarningCodes.IMAGE_FALLBACK
                : ExportWarningCodes.UNKNOWN,
        message: warning.message,
        source: warning.source,
      });
    }

    // Generate the DOCX using Document.toBuffer()
    const buffer = await conversionResult.document.toBuffer();

    // Convert Buffer to Blob for browser compatibility
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const endTime = Date.now();

    return {
      success: true,
      buffer,
      blob,
      document: conversionResult.document,
      warnings,
      errors,
      stats: {
        paragraphCount: conversionResult.stats.paragraphCount,
        imageCount: conversionResult.stats.imageCount,
        tableCount: conversionResult.stats.tableCount,
        listCount: conversionResult.stats.listCount,
        hyperlinkCount: conversionResult.stats.hyperlinkCount,
        exportTimeMs: endTime - startTime,
        documentSizeBytes: buffer.length,
      },
    };
  } catch (error) {
    const endTime = Date.now();

    errors.push({
      code: ExportErrorCodes.CONVERSION_ERROR,
      message:
        error instanceof Error
          ? error.message
          : 'Unknown error during conversion',
      cause: error instanceof Error ? error : undefined,
    });

    return {
      success: false,
      warnings,
      errors,
      stats: {
        paragraphCount: 0,
        imageCount: 0,
        tableCount: 0,
        listCount: 0,
        hyperlinkCount: 0,
        exportTimeMs: endTime - startTime,
      },
    };
  }
}

/**
 * Convert HTML content to a DOCX buffer.
 *
 * Similar to htmlToDocxBlob but returns a Buffer instead of a Blob.
 * Useful for Node.js environments where Blob may not be available.
 *
 * @param html - The HTML content to convert
 * @param options - Optional document configuration
 * @returns A Promise that resolves to an ExportResult containing the buffer
 */
export async function htmlToDocxBuffer(
  html: string,
  options: DocxExportOptions = {}
): Promise<ExportResult> {
  const result = await htmlToDocxBlob(html, options);

  // Remove blob from result for Node.js compatibility
  if (result.success) {
    return {
      ...result,
      blob: undefined, // Don't include blob in buffer-focused result
    };
  }

  return result;
}

/**
 * Convert HTML content to a docXMLater Document object.
 *
 * Use this when you need to further manipulate the document before exporting.
 *
 * @param html - The HTML content to convert
 * @param options - Optional document configuration
 * @returns A Promise that resolves to an ExportResult containing the Document
 */
export async function htmlToDocxDocument(
  html: string,
  options: DocxExportOptions = {}
): Promise<ExportResult> {
  const startTime = Date.now();
  const warnings: ExportWarning[] = [];
  const errors: ExportError[] = [];

  try {
    const safeHtml = html.trim() === '' ? '<p></p>' : html;

    const validationWarnings = validateHtmlForConversion(safeHtml);
    for (const warning of validationWarnings) {
      warnings.push({
        code:
          warning.type === 'unsupported-element'
            ? ExportWarningCodes.UNSUPPORTED_ELEMENT
            : ExportWarningCodes.UNKNOWN,
        message: warning.message,
        source: warning.source,
      });
    }

    const conversionOptions: HtmlToDocumentOptions = {
      html: safeHtml,
      properties: options.properties,
      pageSize: options.pageSize as HtmlToDocumentOptions['pageSize'],
      orientation: options.orientation,
      margins: options.margins,
      defaultFontFamily: options.defaultFontFamily,
      defaultFontSize: options.defaultFontSize,
      preserveWhitespace: options.preserveWhitespace,
      baseUrl: options.baseUrl,
    };

    const conversionResult = await htmlToDocument(conversionOptions);

    for (const warning of conversionResult.warnings) {
      warnings.push({
        code: ExportWarningCodes.UNKNOWN,
        message: warning.message,
        source: warning.source,
      });
    }

    const endTime = Date.now();

    return {
      success: true,
      document: conversionResult.document,
      warnings,
      errors,
      stats: {
        paragraphCount: conversionResult.stats.paragraphCount,
        imageCount: conversionResult.stats.imageCount,
        tableCount: conversionResult.stats.tableCount,
        listCount: conversionResult.stats.listCount,
        hyperlinkCount: conversionResult.stats.hyperlinkCount,
        exportTimeMs: endTime - startTime,
      },
    };
  } catch (error) {
    const endTime = Date.now();

    errors.push({
      code: ExportErrorCodes.CONVERSION_ERROR,
      message:
        error instanceof Error
          ? error.message
          : 'Unknown error during conversion',
      cause: error instanceof Error ? error : undefined,
    });

    return {
      success: false,
      warnings,
      errors,
      stats: {
        paragraphCount: 0,
        imageCount: 0,
        tableCount: 0,
        listCount: 0,
        hyperlinkCount: 0,
        exportTimeMs: endTime - startTime,
      },
    };
  }
}

/**
 * Legacy function for backwards compatibility.
 *
 * @deprecated Use htmlToDocxBlob which returns an ExportResult with more details
 */
export async function convertHtmlToDocx(
  html: string,
  options: DocxExportOptions = {}
): Promise<Blob> {
  const result = await htmlToDocxBlob(html, options);

  if (!result.success || !result.blob) {
    const errorMessage =
      result.errors.length > 0
        ? result.errors[0].message
        : 'Unknown conversion error';
    throw new Error(errorMessage);
  }

  return result.blob;
}

/**
 * Save a Document to a file (Node.js only).
 *
 * @param document - The docXMLater Document to save
 * @param filePath - Path to save the file
 */
export async function saveDocumentToFile(
  document: Document,
  filePath: string
): Promise<void> {
  await document.save(filePath);
}

/**
 * Get a Document as a Buffer.
 *
 * @param document - The docXMLater Document to convert
 * @returns Buffer containing the DOCX file
 */
export async function documentToBuffer(document: Document): Promise<Buffer> {
  return document.toBuffer();
}
