/**
 * XML Sanitization Utilities
 *
 * Provides functions for validating and sanitizing text content per XML 1.0 specification.
 * Per XML 1.0, certain control characters are invalid and must be removed before
 * including text in XML documents.
 *
 * Valid characters in XML 1.0:
 * - 0x09 (tab), 0x0A (newline), 0x0D (carriage return)
 * - 0x20-0xD7FF, 0xE000-0xFFFD, 0x10000-0x10FFFF
 *
 * Invalid characters (control characters that must be removed):
 * - 0x00-0x08 (NULL through BACKSPACE)
 * - 0x0B-0x0C (VERTICAL TAB and FORM FEED)
 * - 0x0E-0x1F (SHIFT OUT through UNIT SEPARATOR)
 * - 0x7F (DELETE)
 *
 * @module xmlSanitization
 */

import { getGlobalLogger } from "./logger";

/**
 * Regular expression matching invalid XML 1.0 control characters.
 * Matches: 0x00-0x08, 0x0B-0x0C, 0x0E-0x1F, 0x7F
 * Does NOT match valid chars: 0x09 (tab), 0x0A (newline), 0x0D (CR)
 */
const INVALID_XML_CHAR_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

/**
 * Removes invalid XML 1.0 control characters from text.
 *
 * Per XML 1.0 spec, characters 0x00-0x08, 0x0B-0x0C, 0x0E-0x1F, 0x7F are invalid
 * and cannot appear in XML documents. This function removes them.
 *
 * Valid control characters are preserved:
 * - Tab (0x09)
 * - Line Feed / Newline (0x0A)
 * - Carriage Return (0x0D)
 *
 * @param text - Input text to sanitize
 * @param logWarning - If true, logs a warning when invalid chars are found (default: true)
 * @returns Sanitized text with invalid control characters removed
 *
 * @example
 * ```typescript
 * // Remove NULL byte from text
 * const clean = removeInvalidXmlChars("Hello\x00World");
 * // Returns: "HelloWorld"
 *
 * // Tab and newline are preserved
 * const preserved = removeInvalidXmlChars("Hello\tWorld\n");
 * // Returns: "Hello\tWorld\n"
 * ```
 */
export function removeInvalidXmlChars(
  text: string,
  logWarning = true
): string {
  // Reset regex lastIndex for global regex
  INVALID_XML_CHAR_REGEX.lastIndex = 0;

  if (logWarning && INVALID_XML_CHAR_REGEX.test(text)) {
    // Reset regex lastIndex after test
    INVALID_XML_CHAR_REGEX.lastIndex = 0;

    const invalidChars = findInvalidXmlChars(text);
    const hexCodes = invalidChars
      .map((c) => `0x${c.toString(16).toUpperCase().padStart(2, "0")}`)
      .join(", ");
    getGlobalLogger().warn(
      `[XMLSanitization] Removing invalid XML control characters: ${hexCodes}`
    );
  }

  // Reset regex lastIndex before replace
  INVALID_XML_CHAR_REGEX.lastIndex = 0;
  return text.replace(INVALID_XML_CHAR_REGEX, "");
}

/**
 * Finds all invalid XML 1.0 control characters in text.
 *
 * Returns an array of unique character codes that are invalid per XML 1.0 spec.
 * This is useful for diagnostics and error reporting.
 *
 * @param text - Text to scan for invalid characters
 * @returns Array of unique invalid character codes found, or empty array if text is valid
 *
 * @example
 * ```typescript
 * const invalid = findInvalidXmlChars("Hello\x00\x08World");
 * // Returns: [0, 8] - NULL and BACKSPACE codes
 *
 * const valid = findInvalidXmlChars("Hello\tWorld");
 * // Returns: [] - tab is valid
 * ```
 */
export function findInvalidXmlChars(text: string): number[] {
  const invalid: number[] = [];

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);

    // Check if character is in invalid ranges
    if (
      (code >= 0x00 && code <= 0x08) || // NULL through BACKSPACE
      (code >= 0x0b && code <= 0x0c) || // VERTICAL TAB and FORM FEED
      (code >= 0x0e && code <= 0x1f) || // SHIFT OUT through UNIT SEPARATOR
      code === 0x7f // DELETE
    ) {
      // Only add unique codes
      if (!invalid.includes(code)) {
        invalid.push(code);
      }
    }
  }

  return invalid;
}

/**
 * Checks if text contains any invalid XML 1.0 control characters.
 *
 * This is a fast check that returns true/false without identifying specific characters.
 * Use `findInvalidXmlChars()` if you need to know which characters are invalid.
 *
 * @param text - Text to check
 * @returns true if text contains invalid characters, false otherwise
 *
 * @example
 * ```typescript
 * hasInvalidXmlChars("Hello\x00World");  // true - NULL byte
 * hasInvalidXmlChars("Hello\tWorld");    // false - tab is valid
 * hasInvalidXmlChars("Normal text");     // false
 * ```
 */
export function hasInvalidXmlChars(text: string): boolean {
  // Reset regex lastIndex for global regex
  INVALID_XML_CHAR_REGEX.lastIndex = 0;
  return INVALID_XML_CHAR_REGEX.test(text);
}

/**
 * Character code constants for documentation and testing.
 */
export const XML_CONTROL_CHARS = {
  /** NULL (0x00) - Invalid */
  NULL: 0x00,
  /** Start of Heading (0x01) - Invalid */
  SOH: 0x01,
  /** Start of Text (0x02) - Invalid */
  STX: 0x02,
  /** End of Text (0x03) - Invalid */
  ETX: 0x03,
  /** End of Transmission (0x04) - Invalid */
  EOT: 0x04,
  /** Enquiry (0x05) - Invalid */
  ENQ: 0x05,
  /** Acknowledge (0x06) - Invalid */
  ACK: 0x06,
  /** Bell (0x07) - Invalid */
  BEL: 0x07,
  /** Backspace (0x08) - Invalid */
  BS: 0x08,
  /** Horizontal Tab (0x09) - VALID */
  TAB: 0x09,
  /** Line Feed / Newline (0x0A) - VALID */
  LF: 0x0a,
  /** Vertical Tab (0x0B) - Invalid */
  VT: 0x0b,
  /** Form Feed (0x0C) - Invalid */
  FF: 0x0c,
  /** Carriage Return (0x0D) - VALID */
  CR: 0x0d,
  /** Shift Out (0x0E) - Invalid */
  SO: 0x0e,
  /** Unit Separator (0x1F) - Invalid */
  US: 0x1f,
  /** Delete (0x7F) - Invalid */
  DEL: 0x7f,
} as const;
