/**
 * Types and interfaces for ZIP archive handling
 */

/**
 * Represents a file within a ZIP archive
 */
export interface ZipFile {
  /** The path of the file within the archive */
  path: string;
  /** The content of the file (string for text, Buffer for binary) */
  content: string | Buffer;
  /** Whether the content is binary */
  isBinary: boolean;
  /** File size in bytes */
  size: number;
  /** Last modified date */
  date?: Date;
}

/**
 * Size limit configuration for document loading
 */
export interface SizeLimitOptions {
  /**
   * Size in MB at which to show a warning (default: 50 MB)
   * Set to 0 to disable warnings
   */
  warningSizeMB?: number;
  /**
   * Maximum size in MB to load (default: 150 MB)
   * Set to 0 to disable the limit (not recommended)
   */
  maxSizeMB?: number;
}

/**
 * Default size limits for document loading
 */
export const DEFAULT_SIZE_LIMITS: Required<SizeLimitOptions> = {
  warningSizeMB: 50,
  maxSizeMB: 150,
};

/**
 * Options for loading a DOCX file
 */
export interface LoadOptions {
  /** Whether to validate the DOCX structure on load */
  validate?: boolean;
  /** Whether to load files lazily */
  lazy?: boolean;
  /** Size limit configuration (warning and max size thresholds) */
  sizeLimits?: SizeLimitOptions;
}

/**
 * Options for saving a DOCX file
 */
export interface SaveOptions {
  /** Compression level (0-9, where 0 is no compression and 9 is maximum) */
  compression?: number;
  /** Whether to validate the DOCX structure before save */
  validate?: boolean;
}

/**
 * Options for adding files to the archive
 */
export interface AddFileOptions {
  /** Whether the content is binary */
  binary?: boolean;
  /** Compression level for this specific file */
  compression?: number;
  /** Last modified date */
  date?: Date;
}

/**
 * Map of file paths to their contents
 */
export type FileMap = Map<string, ZipFile>;

/**
 * Required files for a valid DOCX structure
 */
export const REQUIRED_DOCX_FILES = [
  '[Content_Types].xml',
  '_rels/.rels',
  'word/document.xml',
] as const;

/**
 * Common DOCX file paths
 */
export const DOCX_PATHS = {
  CONTENT_TYPES: '[Content_Types].xml',
  RELS: '_rels/.rels',
  DOCUMENT: 'word/document.xml',
  DOCUMENT_RELS: 'word/_rels/document.xml.rels',
  STYLES: 'word/styles.xml',
  NUMBERING: 'word/numbering.xml',
  SETTINGS: 'word/settings.xml',
  FONT_TABLE: 'word/fontTable.xml',
  THEME: 'word/theme/theme1.xml',
  CORE_PROPS: 'docProps/core.xml',
  APP_PROPS: 'docProps/app.xml',
  MEDIA_DIR: 'word/media/',
} as const;
