/**
 * DOCX Export Types
 *
 * Type definitions for the DOCX export system.
 * These types provide the contracts between different parts of the export pipeline.
 *
 * @module adapters/types
 */

import type {
  Document,
  DocumentProperties,
  Margins,
  PageSize,
  PageOrientation,
  RunFormatting,
  ParagraphFormatting,
} from '../docXMLater/src';

// ============================================================================
// Export Options
// ============================================================================

/**
 * Complete options for DOCX export
 */
export interface DocxExportOptions {
  /**
   * Document properties (title, author, etc.)
   */
  properties?: DocumentProperties;

  /**
   * Page size preset or custom dimensions
   * Presets: 'letter', 'a4', 'legal', 'a3', 'tabloid'
   */
  pageSize?: 'letter' | 'a4' | 'legal' | 'a3' | 'tabloid' | PageSize;

  /**
   * Page orientation
   */
  orientation?: PageOrientation;

  /**
   * Page margins
   * Values in twips by default, or use unit property to specify
   */
  margins?: Partial<Margins>;

  /**
   * Default font family for the document
   * @example 'Arial', 'Times New Roman', 'Calibri'
   */
  defaultFontFamily?: string;

  /**
   * Default font size in half-points
   * 24 = 12pt, 22 = 11pt, 20 = 10pt
   */
  defaultFontSize?: number;

  /**
   * Base URL for resolving relative image URLs
   */
  baseUrl?: string;

  /**
   * Whether to preserve whitespace from HTML
   * @default false
   */
  preserveWhitespace?: boolean;

  /**
   * Enable track changes in the exported document
   * @default false
   */
  enableTrackChanges?: boolean;

  /**
   * Enable comments in the exported document
   * @default false
   */
  enableComments?: boolean;

  /**
   * Custom style mappings
   */
  styles?: StyleMappingOptions;

  /**
   * Header content (HTML string or null to omit)
   */
  header?: string | null;

  /**
   * Footer content (HTML string or null to omit)
   */
  footer?: string | null;

  /**
   * Enable debug mode for additional logging
   * @default false
   */
  debug?: boolean;
}

/**
 * Style mapping options
 */
export interface StyleMappingOptions {
  /**
   * Map HTML element names to paragraph styles
   */
  paragraphStyles?: Record<string, string>;

  /**
   * Map CSS class names to character styles
   */
  characterStyles?: Record<string, string>;

  /**
   * Custom element formatters
   */
  elementFormatting?: Record<string, Partial<ParagraphFormatting>>;

  /**
   * Custom inline formatters
   */
  inlineFormatting?: Record<string, Partial<RunFormatting>>;
}

// ============================================================================
// Export Results
// ============================================================================

/**
 * Result of a DOCX export operation
 */
export interface ExportResult {
  /**
   * Whether the export was successful
   */
  success: boolean;

  /**
   * The exported document buffer (only if success is true)
   */
  buffer?: Buffer;

  /**
   * The exported document blob (only if success is true, browser environment)
   */
  blob?: Blob;

  /**
   * The docXMLater Document object (for further manipulation)
   */
  document?: Document;

  /**
   * Warnings generated during export
   */
  warnings: ExportWarning[];

  /**
   * Errors that occurred during export (only if success is false)
   */
  errors: ExportError[];

  /**
   * Export statistics
   */
  stats: ExportStats;
}

/**
 * Warning generated during export
 */
export interface ExportWarning {
  /**
   * Warning code for programmatic handling
   */
  code: string;

  /**
   * Human-readable warning message
   */
  message: string;

  /**
   * Element or location that caused the warning
   */
  source?: string;

  /**
   * Additional context
   */
  details?: Record<string, unknown>;
}

/**
 * Error that occurred during export
 */
export interface ExportError {
  /**
   * Error code for programmatic handling
   */
  code: string;

  /**
   * Human-readable error message
   */
  message: string;

  /**
   * Original error if available
   */
  cause?: Error;

  /**
   * Element or location that caused the error
   */
  source?: string;
}

/**
 * Statistics about the export operation
 */
export interface ExportStats {
  /**
   * Number of paragraphs exported
   */
  paragraphCount: number;

  /**
   * Number of images exported
   */
  imageCount: number;

  /**
   * Number of tables exported
   */
  tableCount: number;

  /**
   * Number of lists exported
   */
  listCount: number;

  /**
   * Number of hyperlinks exported
   */
  hyperlinkCount: number;

  /**
   * Total export time in milliseconds
   */
  exportTimeMs: number;

  /**
   * Document size in bytes (if buffer is generated)
   */
  documentSizeBytes?: number;
}

// ============================================================================
// Legacy Compatibility Types
// ============================================================================

/**
 * Legacy DocumentOptions type for backwards compatibility
 * @deprecated Use DocxExportOptions instead
 */
export interface DocumentOptions {
  orientation?: 'portrait' | 'landscape';
  margins?: Partial<Margins>;
  title?: string;
  subject?: string;
  creator?: string;
  keywords?: string;
  description?: string;
  lastModifiedBy?: string;
}

/**
 * Legacy Margins type (re-exported for convenience)
 */
export type { Margins } from '../docXMLater/src';

// ============================================================================
// Conversion Contracts
// ============================================================================

/**
 * Input for HTML to DOCX conversion
 */
export interface HtmlConversionInput {
  /**
   * HTML content to convert
   */
  html: string;

  /**
   * Export options
   */
  options?: DocxExportOptions;
}

/**
 * Output format specification
 */
export type OutputFormat = 'blob' | 'buffer' | 'document';

/**
 * Conversion function signature
 */
export type ConvertHtmlToDocx = (
  input: HtmlConversionInput
) => Promise<ExportResult>;

// ============================================================================
// Constants
// ============================================================================

/**
 * Error codes for export operations
 */
export const ExportErrorCodes = {
  PARSE_ERROR: 'PARSE_ERROR',
  CONVERSION_ERROR: 'CONVERSION_ERROR',
  IMAGE_FETCH_FAILED: 'IMAGE_FETCH_FAILED',
  INVALID_OPTIONS: 'INVALID_OPTIONS',
  DOCUMENT_TOO_LARGE: 'DOCUMENT_TOO_LARGE',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * Warning codes for export operations
 */
export const ExportWarningCodes = {
  UNSUPPORTED_ELEMENT: 'UNSUPPORTED_ELEMENT',
  INVALID_STYLE: 'INVALID_STYLE',
  IMAGE_FALLBACK: 'IMAGE_FALLBACK',
  COMPLEX_TABLE: 'COMPLEX_TABLE',
  NESTED_LIST_DEPTH: 'NESTED_LIST_DEPTH',
  UNKNOWN: 'UNKNOWN',
} as const;

/**
 * Default export options
 */
export const DEFAULT_EXPORT_OPTIONS: Required<
  Pick<
    DocxExportOptions,
    | 'pageSize'
    | 'orientation'
    | 'preserveWhitespace'
    | 'enableTrackChanges'
    | 'enableComments'
    | 'debug'
  >
> = {
  pageSize: 'letter',
  orientation: 'portrait',
  preserveWhitespace: false,
  enableTrackChanges: false,
  enableComments: false,
  debug: false,
};
