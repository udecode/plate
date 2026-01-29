/**
 * Validation utilities for DOCX files
 */

import { REQUIRED_DOCX_FILES } from '../zip/types';
import { MissingRequiredFileError } from '../zip/errors';
import { defaultLogger } from './logger';

/**
 * Validates that all required DOCX files are present
 * @param filePaths - Array of file paths in the archive
 * @throws {MissingRequiredFileError} If a required file is missing
 */
export function validateDocxStructure(filePaths: string[]): void {
  const fileSet = new Set(filePaths);

  for (const requiredFile of REQUIRED_DOCX_FILES) {
    if (!fileSet.has(requiredFile)) {
      throw new MissingRequiredFileError(requiredFile);
    }
  }
}

/**
 * Checks if a file path represents a binary file based on extension
 * @param filePath - The file path to check
 * @returns True if the file is likely binary
 */
export function isBinaryFile(filePath: string): boolean {
  const binaryExtensions = [
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.ico',
    '.emf', '.wmf', '.bin', '.dat', '.ttf', '.otf', '.woff',
  ];

  const extension = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
  return binaryExtensions.includes(extension);
}

/**
 * Normalizes a file path for consistent comparisons
 * Converts backslashes to forward slashes and removes leading slashes
 * Also validates against path traversal attacks
 *
 * **Security:** This function validates paths to prevent:
 * - Path traversal attacks (../, ..\, URL-encoded variants)
 * - Absolute paths (C:\, /etc/, etc.)
 * - Malicious DOCX files attempting directory escape
 *
 * @param path - The path to normalize
 * @returns Normalized path
 * @throws {Error} If path contains path traversal sequences, absolute paths, or URL-encoded attacks
 */
export function normalizePath(path: string): string {
  // First convert all backslashes to forward slashes for consistent checking
  const normalized = path.replace(/\\/g, '/').replace(/^\/+/, '');

  // Security: Reject URL-encoded path traversal attempts
  // Attackers might try: %2e%2e%2f (%2e = . and %2f = /)
  if (/%2[eE]|%2[fF]|%5[cC]/.test(path)) {
    throw new Error(
      `Invalid file path: "${path}" contains URL-encoded characters (%2E, %2F, %5C). ` +
      `This could be an attempt to bypass path validation. ` +
      `Only plain characters are allowed in DOCX file paths.`
    );
  }

  // Security: Prevent path traversal attacks
  // Check AFTER normalization when all paths use forward slashes
  // This catches: ../, /.., or standalone ".."
  if (normalized.includes('../') || normalized.includes('/..') || normalized === '..') {
    throw new Error(
      `Invalid file path: "${path}" contains path traversal sequence (..). ` +
      `This could be a malicious DOCX file attempting directory traversal. ` +
      `DOCX archives must only contain relative paths within the archive.`
    );
  }

  // Security: Prevent absolute paths (Windows drive letters)
  // Examples: C:/, C:\, D:, etc.
  if (/^[a-zA-Z]:/.test(normalized)) {
    throw new Error(
      `Invalid file path: "${path}" appears to be an absolute Windows path. ` +
      `Absolute paths are not allowed in DOCX archives. ` +
      `Only relative paths within the archive are permitted.`
    );
  }

  // Security: Prevent Unix absolute paths
  // After removing leading slashes, if it starts with / it's suspicious
  if (path.startsWith('/') && normalized.startsWith('/')) {
    throw new Error(
      `Invalid file path: "${path}" appears to be an absolute Unix path. ` +
      `Only relative paths are allowed in DOCX archives.`
    );
  }

  return normalized;
}

/**
 * Validates that a buffer contains a valid ZIP file signature
 * ZIP files start with the signature 'PK' (0x50 0x4B)
 * @param buffer - The buffer to validate
 * @returns True if the buffer appears to be a ZIP file
 */
export function isValidZipBuffer(buffer: Buffer): boolean {
  if (buffer.length < 4) {
    return false;
  }

  // Check for ZIP signature: PK\x03\x04 or PK\x05\x06 (for empty archives)
  return (
    (buffer[0] === 0x50 && buffer[1] === 0x4B) &&
    ((buffer[2] === 0x03 && buffer[3] === 0x04) ||
     (buffer[2] === 0x05 && buffer[3] === 0x06))
  );
}

/**
 * Checks if a string is valid UTF-8 text
 * @param content - The content to check
 * @returns True if the content is valid text
 */
export function isTextContent(content: Buffer | string): boolean {
  if (typeof content === 'string') {
    return true;
  }

  // Try to decode as UTF-8 and check for null bytes
  try {
    const text = content.toString('utf8');
    // Binary files often contain null bytes
    return !text.includes('\0');
  } catch {
    return false;
  }
}

/**
 * Validates a twips value (used for spacing, indentation, margins)
 * Twips: 1/20th of a point, 1440 twips = 1 inch
 * Reasonable range: -31680 to 31680 (±22 inches)
 * @param value - The twips value to validate
 * @param fieldName - Name of the field (for error messages)
 * @throws {Error} If the value is invalid
 */
export function validateTwips(value: number, fieldName: string = 'value'): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${fieldName} must be a finite number, got ${value}`);
  }

  // Reasonable range: ±22 inches (31680 twips)
  const MIN_TWIPS = -31680;
  const MAX_TWIPS = 31680;

  if (value < MIN_TWIPS || value > MAX_TWIPS) {
    throw new Error(
      `${fieldName} out of range: ${value} twips (allowed: ${MIN_TWIPS} to ${MAX_TWIPS}, ±22 inches)`
    );
  }
}

/**
 * Normalizes a color to uppercase 6-character hex format
 * Accepts 3-character or 6-character hex colors with or without '#' prefix
 * Follows Microsoft Word convention of uppercase hex colors
 *
 * @param color - Color to normalize (e.g., '#F00', 'FF0000', '#FF0000', 'f00')
 * @returns Normalized color (e.g., 'FF0000')
 * @throws Error if color format is invalid
 *
 * @example
 * ```typescript
 * normalizeColor('#F00')      // Returns: 'FF0000'
 * normalizeColor('FF0000')    // Returns: 'FF0000'
 * normalizeColor('#ff0000')   // Returns: 'FF0000'
 * normalizeColor('f00')       // Returns: 'FF0000'
 * ```
 */
export function normalizeColor(color: string): string {
  const hex = color.replace(/^#/, '');

  // Validate hex format
  if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(hex)) {
    throw new Error(
      `Invalid color format: "${color}". Expected 3 or 6-character hex ` +
      `(e.g., "FF0000", "#FF0000", "F00", or "#F00")`
    );
  }

  // Expand 3-character to 6-character
  if (hex.length === 3) {
    return (hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2)).toUpperCase();
  }

  return hex.toUpperCase();
}

/**
 * Validates a hexadecimal color value
 * Must be 6 characters (RRGGBB format)
 * @param color - The color hex string to validate (without #)
 * @param fieldName - Name of the field (for error messages)
 * @throws {Error} If the color is invalid
 */
export function validateColor(color: string, fieldName: string = 'color'): void {
  if (typeof color !== 'string') {
    throw new Error(`${fieldName} must be a string, got ${typeof color}`);
  }

  // Allow both with and without # prefix
  const cleanColor = color.startsWith('#') ? color.substring(1) : color;

  if (!/^[0-9A-Fa-f]{6}$/.test(cleanColor)) {
    throw new Error(
      `${fieldName} must be a 6-digit hex color (e.g., 'FF0000' or '#FF0000'), got '${color}'`
    );
  }
}

/**
 * Alias for validateColor for backwards compatibility
 */
export const validateHexColor = validateColor;

/**
 * Validates a numbering ID (must be non-negative integer)
 * @param numId - The numbering ID to validate
 * @param fieldName - Name of the field (for error messages)
 * @throws {Error} If the ID is invalid
 */
export function validateNumberingId(numId: number, fieldName: string = 'numbering ID'): void {
  if (!Number.isInteger(numId)) {
    throw new Error(`${fieldName} must be an integer, got ${numId}`);
  }

  if (numId < 0) {
    throw new Error(`${fieldName} must be non-negative, got ${numId}`);
  }

  // Word supports numbering IDs up to 2147483647
  const MAX_NUM_ID = 2147483647;
  if (numId > MAX_NUM_ID) {
    throw new Error(`${fieldName} exceeds maximum value ${MAX_NUM_ID}, got ${numId}`);
  }
}

/**
 * Validates a numbering level (0-8 for Word)
 * @param level - The level to validate
 * @param fieldName - Name of the field (for error messages)
 * @param maxLevel - Maximum allowed level (default 8)
 * @throws {Error} If the level is invalid
 */
export function validateLevel(
  level: number,
  fieldName: string = 'level',
  maxLevel: number = 8
): void {
  if (!Number.isInteger(level)) {
    throw new Error(`${fieldName} must be an integer, got ${level}`);
  }

  if (level < 0 || level > maxLevel) {
    throw new Error(`${fieldName} must be between 0 and ${maxLevel}, got ${level}`);
  }
}

/**
 * Validates an alignment value against allowed values
 * @param alignment - The alignment value to validate
 * @param allowed - Array of allowed alignment values
 * @param fieldName - Name of the field (for error messages)
 * @throws {Error} If the alignment is invalid
 */
export function validateAlignment(
  alignment: string,
  allowed: readonly string[],
  fieldName: string = 'alignment'
): void {
  if (typeof alignment !== 'string') {
    throw new Error(`${fieldName} must be a string, got ${typeof alignment}`);
  }

  if (!allowed.includes(alignment)) {
    throw new Error(
      `Invalid ${fieldName}: '${alignment}' (allowed: ${allowed.join(', ')})`
    );
  }
}

/**
 * Validates a font size (in half-points for Word)
 * Reasonable range: 2-1638 (1-819 points)
 * @param size - The font size in half-points to validate
 * @param fieldName - Name of the field (for error messages)
 * @throws {Error} If the size is invalid
 */
export function validateFontSize(size: number, fieldName: string = 'font size'): void {
  if (!Number.isFinite(size)) {
    throw new Error(`${fieldName} must be a finite number, got ${size}`);
  }

  if (!Number.isInteger(size)) {
    throw new Error(`${fieldName} must be an integer (in half-points), got ${size}`);
  }

  // Reasonable range: 2-1638 half-points (1-819 points)
  const MIN_SIZE = 2;
  const MAX_SIZE = 1638;

  if (size < MIN_SIZE || size > MAX_SIZE) {
    throw new Error(
      `${fieldName} out of range: ${size} half-points (allowed: ${MIN_SIZE}-${MAX_SIZE}, or ${MIN_SIZE / 2}-${MAX_SIZE / 2} points)`
    );
  }
}

/**
 * Validates that a string is not empty
 * @param value - The string to validate
 * @param fieldName - Name of the field (for error messages)
 * @throws {Error} If the string is empty or not a string
 */
export function validateNonEmptyString(value: string, fieldName: string = 'value'): void {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string, got ${typeof value}`);
  }

  if (value.trim().length === 0) {
    throw new Error(`${fieldName} cannot be empty`);
  }
}

/**
 * Validates a percentage value (0-100)
 * @param value - The percentage to validate
 * @param fieldName - Name of the field (for error messages)
 * @throws {Error} If the percentage is invalid
 */
export function validatePercentage(value: number, fieldName: string = 'percentage'): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${fieldName} must be a finite number, got ${value}`);
  }

  if (value < 0 || value > 100) {
    throw new Error(`${fieldName} must be between 0 and 100, got ${value}`);
  }
}

/**
 * Validates EMUs (English Metric Units) value
 * Used for image dimensions: 914400 EMUs = 1 inch
 * Reasonable range: 0 to 50 million (about 55 inches)
 * @param value - The EMUs value to validate
 * @param fieldName - Name of the field (for error messages)
 * @throws {Error} If the value is invalid
 */
export function validateEmus(value: number, fieldName: string = 'EMUs'): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${fieldName} must be a finite number, got ${value}`);
  }

  if (!Number.isInteger(value)) {
    throw new Error(`${fieldName} must be an integer, got ${value}`);
  }

  if (value < 0) {
    throw new Error(`${fieldName} must be non-negative, got ${value}`);
  }

  // Reasonable maximum: 50 million EMUs (about 55 inches)
  const MAX_EMUS = 50000000;
  if (value > MAX_EMUS) {
    throw new Error(
      `${fieldName} exceeds maximum ${MAX_EMUS} (about 55 inches), got ${value}`
    );
  }
}

/**
 * Result of text validation for XML-like content
 */
export interface TextValidationResult {
  isValid: boolean;
  hasXmlPatterns: boolean;
  warnings: string[];
  cleanedText?: string;
}

/**
 * Detects XML-like patterns in text that might cause display issues
 *
 * This function checks for patterns that look like XML markup which,
 * when properly escaped in XML output, will display as literal text
 * in Word documents rather than being interpreted as markup.
 *
 * @param text - The text to validate
 * @param context - Optional context for better warning messages (e.g., "hyperlink text")
 * @returns Validation result with warnings and optional cleaned text
 */
export function detectXmlInText(text: string, context?: string): TextValidationResult {
  const warnings: string[] = [];
  let hasXmlPatterns = false;

  // Check for common XML element patterns
  const xmlElementPattern = /<\/?w:[^>]+>|<w:[^>]+\/>/g;
  const escapedXmlPattern = /&lt;.*?&gt;|&quot;|&apos;/g;

  // Check for specific problematic patterns we've seen
  const problematicPatterns = [
    /<w:t\s+xml:space="preserve">/,
    /<w:t\s+xml:space=["']preserve["']>/,
    /<\/w:t>/,
    /&lt;w:t\s+xml:space=&quot;preserve&quot;&gt;/,
  ];

  // Check for any XML-like tags
  if (xmlElementPattern.test(text)) {
    hasXmlPatterns = true;
    const contextStr = context ? ` in ${context}` : '';
    warnings.push(
      `Text${contextStr} contains XML-like markup: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}". ` +
      `This will be displayed as literal text in the document. ` +
      `If you intended to add formatting, use the appropriate API methods instead.`
    );
  }

  // Check for already-escaped XML entities
  if (escapedXmlPattern.test(text)) {
    hasXmlPatterns = true;
    const contextStr = context ? ` in ${context}` : '';
    warnings.push(
      `Text${contextStr} contains escaped XML entities (e.g., &lt;, &gt;, &quot;). ` +
      `These will appear as literal characters in the document.`
    );
  }

  // Check for specific known problematic patterns
  for (const pattern of problematicPatterns) {
    if (pattern.test(text)) {
      hasXmlPatterns = true;
      const contextStr = context ? ` in ${context}` : '';
      warnings.push(
        `Text${contextStr} contains a known problematic XML pattern that suggests ` +
        `the text may have been corrupted by previous processing.`
      );
      break;
    }
  }

  return {
    isValid: true, // Text is always "valid" - we just warn about potential issues
    hasXmlPatterns,
    warnings,
  };
}

/**
 * Cleans XML-like patterns from text
 *
 * This function removes or cleans various XML patterns that might
 * appear in text content, typically from corrupted or improperly
 * processed documents.
 *
 * @param text - The text to clean
 * @param aggressive - If true, removes all angle brackets; if false, only removes clear XML tags
 * @returns Cleaned text with XML patterns removed
 */
export function cleanXmlFromText(text: string, aggressive: boolean = false): string {
  let cleaned = text;

  // First, unescape any HTML/XML entities
  cleaned = cleaned
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');

  // Remove specific Word XML patterns
  // This targets patterns like <w:t xml:space="preserve">
  cleaned = cleaned.replace(/<w:[^>]+>/g, '');
  cleaned = cleaned.replace(/<\/w:[^>]+>/g, '');

  // Remove any remaining XML-like tags if aggressive mode
  if (aggressive) {
    cleaned = cleaned.replace(/<[^>]+>/g, '');
  }

  // Clean up any double spaces left behind
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Validates text for use in Run or Hyperlink elements
 *
 * This is the main validation function that should be called when
 * setting text content in Run or Hyperlink elements. It provides
 * warnings about problematic content and optionally cleans the text.
 *
 * @param text - The text to validate
 * @param options - Validation options
 * @returns Validation result with warnings and optionally cleaned text
 */
export function validateRunText(
  text: string,
  options: {
    context?: string;
    autoClean?: boolean;
    aggressive?: boolean;
    warnToConsole?: boolean;
  } = {}
): TextValidationResult {
  const { context, autoClean = false, aggressive = false, warnToConsole = true } = options;

  // Detect XML patterns
  const result = detectXmlInText(text, context);

  // If auto-cleaning is enabled and XML patterns were found
  if (autoClean && result.hasXmlPatterns) {
    result.cleanedText = cleanXmlFromText(text, aggressive);

    // Add a note about cleaning
    result.warnings.push(
      `Text has been automatically cleaned. ` +
      `Original: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" ` +
      `Cleaned: "${result.cleanedText.substring(0, 50)}${result.cleanedText.length > 50 ? '...' : ''}"`
    );
  }

  // Log warnings to console in development if requested
  if (warnToConsole && result.warnings.length > 0 && typeof console !== 'undefined') {
    const contextStr = context ? ` [${context}]` : '';
    defaultLogger.warn(`DocXML Text Validation Warning${contextStr}:`);
    result.warnings.forEach(warning => defaultLogger.warn(`  - ${warning}`));
  }

  return result;
}
