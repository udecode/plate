/**
 * Document validation and processing limits
 * These constants define thresholds for memory usage, file sizes, and content limits
 * Based on Microsoft Word compatibility constraints and practical performance testing
 */

/**
 * Document property limits
 * Prevents injection attacks and excessive memory usage
 */
export const PROPERTY_LIMITS = {
  /**
   * Maximum length for document property strings (title, subject, creator, etc.)
   * Microsoft Word supports up to 32KB for some properties,
   * but 10,000 characters is reasonable for metadata fields
   */
  MAX_STRING_LENGTH: 10_000,

  /**
   * Maximum revision number
   * Arbitrary upper bound to prevent integer overflow and unrealistic values
   * In practice, most documents have < 100 revisions
   */
  MAX_REVISION: 999_999,
} as const;

/**
 * File size limits for DOCX documents
 * Based on typical system memory constraints and Word performance characteristics
 */
export const FILE_SIZE_LIMITS = {
  /**
   * Warning threshold in MB
   * Documents over 50MB start showing noticeable performance degradation
   * - Loading time increases significantly
   * - Memory usage becomes substantial
   * - User should consider optimization
   */
  WARNING_SIZE_MB: 50,

  /**
   * Error threshold in MB
   * Documents over 150MB are likely to cause out-of-memory errors
   * on typical development machines (4-8GB RAM)
   * This limit prevents crashes and provides clear error messages
   */
  ERROR_SIZE_MB: 150,
} as const;

/**
 * XML parsing limits
 * Prevents ReDoS attacks and excessive memory consumption during parsing
 */
export const XML_LIMITS = {
  /**
   * Maximum XML content size for parsing in MB
   * Limit prevents:
   * - ReDoS (Regular Expression Denial of Service) attacks
   * - Excessive memory allocation
   * - Unbounded parsing time
   *
   * 10MB is sufficient for even very large Word document.xml files
   * (typically 1-2MB for 100-page documents)
   */
  MAX_PARSE_SIZE_MB: 10,

  /**
   * Maximum XML content size for parsing in bytes
   * Convenience constant for byte-level operations
   */
  MAX_PARSE_SIZE_BYTES: 10 * 1024 * 1024,
} as const;

/**
 * Memory usage limits
 * Controls when to warn or error based on process memory consumption
 */
export const MEMORY_LIMITS = {
  /**
   * Default maximum heap usage percentage before error
   * 80% leaves 20% headroom for garbage collection and other operations
   */
  DEFAULT_MAX_HEAP_PERCENT: 80,

  /**
   * Default maximum RSS (Resident Set Size) in MB
   * 2GB (2048MB) is a conservative limit for Node.js processes
   * Prevents excessive memory usage even if heap is fragmented
   */
  DEFAULT_MAX_RSS_MB: 2048,

  /**
   * Use absolute RSS limit by default
   * Dual-threshold approach (heap % AND absolute RSS) prevents false positives
   */
  DEFAULT_USE_ABSOLUTE_LIMIT: true,
} as const;

/**
 * Image and media limits
 * Controls document size and prevents excessive memory usage from embedded media
 */
export const IMAGE_LIMITS = {
  /**
   * Default maximum number of images in a document
   * 20 images is typical for presentations and reports
   * Larger counts may indicate inefficient document design
   */
  DEFAULT_MAX_IMAGE_COUNT: 20,

  /**
   * Default maximum total size of all images in MB
   * 100MB total allows for high-quality images while preventing bloat
   */
  DEFAULT_MAX_TOTAL_SIZE_MB: 100,

  /**
   * Default maximum size for a single image in MB
   * 20MB per image allows for high-resolution photos
   * Larger sizes usually indicate images should be compressed
   */
  DEFAULT_MAX_SINGLE_SIZE_MB: 20,
} as const;

/**
 * Document size estimation constants
 * Used to estimate memory usage and document size
 */
export const SIZE_ESTIMATES = {
  /**
   * Average XML bytes per paragraph
   * Based on typical paragraph structure with formatting
   */
  BYTES_PER_PARAGRAPH: 200,

  /**
   * Average XML bytes per table
   * Tables have more complex structure (rows, cells, borders)
   */
  BYTES_PER_TABLE: 1000,

  /**
   * Base document structure overhead in bytes
   * Includes: [Content_Types].xml, _rels, styles.xml, settings.xml, etc.
   */
  BASE_STRUCTURE_BYTES: 50_000, // ~50KB
} as const;

/**
 * All limits combined for easy import
 */
export const LIMITS = {
  ...PROPERTY_LIMITS,
  ...FILE_SIZE_LIMITS,
  ...XML_LIMITS,
  ...MEMORY_LIMITS,
  ...IMAGE_LIMITS,
  ...SIZE_ESTIMATES,
} as const;
