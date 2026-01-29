/**
 * Sanitization Module
 *
 * Provides UTF-8 text normalization and XML character sanitization utilities
 * for the DOCX export pipeline. All text content destined for DOCX XML output
 * should pass through these sanitization functions to ensure valid, well-formed
 * XML documents.
 *
 * Two main areas of concern:
 * 1. UTF-8 Normalization (T120) - Ensures consistent Unicode representation,
 *    strips BOMs, normalizes whitespace and line endings.
 * 2. XML Character Sanitization (T121) - Removes characters invalid in XML 1.0,
 *    escapes special XML characters for text content and attribute values.
 *
 * @module sanitization
 */

// ============================================================================
// T120: UTF-8 Normalization
// ============================================================================

/**
 * Options for configuring the text sanitization pipeline.
 * Each flag controls whether a specific normalization step is applied.
 * All flags default to `true` when not specified.
 */
export type TextSanitizationOptions = {
  /** Apply Unicode NFC normalization. Default: true */
  normalizeForms?: boolean;
  /** Strip byte order marks (U+FEFF). Default: true */
  stripBom?: boolean;
  /** Replace non-breaking spaces (U+00A0) with regular spaces. Default: true */
  replaceNbsp?: boolean;
  /** Normalize line endings (\r\n, \r) to \n. Default: true */
  normalizeLineEndings?: boolean;
  /** Collapse multiple whitespace characters to a single space (preserves newlines). Default: false */
  collapseWhitespace?: boolean;
};

/**
 * Normalize Unicode text to NFC (Canonical Decomposition followed by Canonical Composition).
 * NFC is the recommended form for XML and most text interchange formats.
 *
 * @param text - The input text to normalize
 * @returns The NFC-normalized text
 */
export function normalizeUtf8(text: string): string {
  return text.normalize('NFC');
}

/**
 * Remove byte order marks (U+FEFF) from the text.
 * BOMs can appear at the start of files or within text content when
 * concatenating strings from different sources.
 *
 * @param text - The input text
 * @returns Text with all BOM characters removed
 */
export function stripBOM(text: string): string {
  return text.replace(/\uFEFF/g, '');
}

/**
 * Replace non-breaking spaces (U+00A0, commonly from &amp;nbsp; in HTML)
 * with regular ASCII spaces (U+0020).
 *
 * @param text - The input text
 * @returns Text with non-breaking spaces replaced by regular spaces
 */
export function replaceNonBreakingSpaces(text: string): string {
  return text.replace(/\u00A0/g, ' ');
}

/**
 * Normalize line endings to Unix-style \n.
 * Converts Windows (\r\n) and old Mac (\r) line endings.
 *
 * @param text - The input text
 * @returns Text with normalized line endings
 */
export function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Collapse multiple consecutive whitespace characters into a single space.
 * Preserves newline characters. Tabs and other whitespace are collapsed.
 *
 * @param text - The input text
 * @returns Text with collapsed whitespace
 */
export function normalizeWhitespace(text: string): string {
  // Replace runs of horizontal whitespace (space, tab, etc.) with a single space
  return text.replace(/[^\S\n]+/g, ' ');
}

/**
 * Combined sanitization pipeline for text going into DOCX export.
 * Applies: BOM strip -> UTF-8 NFC normalize -> line ending normalize -> non-breaking space replace.
 *
 * @param text - The input text
 * @returns Fully sanitized text ready for DOCX content
 */
export function sanitizeTextForDocx(text: string): string {
  let result = stripBOM(text);
  result = normalizeUtf8(result);
  result = normalizeLineEndings(result);
  result = replaceNonBreakingSpaces(result);
  return result;
}

/**
 * Configurable sanitization pipeline. Each step can be individually
 * enabled or disabled via options. All steps default to `true` except
 * `collapseWhitespace` which defaults to `false`.
 *
 * @param text - The input text
 * @param options - Configuration flags for each sanitization step
 * @returns Sanitized text based on the provided options
 */
export function sanitizeTextWithOptions(
  text: string,
  options?: TextSanitizationOptions
): string {
  const opts: Required<TextSanitizationOptions> = {
    normalizeForms: true,
    stripBom: true,
    replaceNbsp: true,
    normalizeLineEndings: true,
    collapseWhitespace: false,
    ...options,
  };

  let result = text;

  if (opts.stripBom) {
    result = stripBOM(result);
  }
  if (opts.normalizeForms) {
    result = normalizeUtf8(result);
  }
  if (opts.normalizeLineEndings) {
    result = normalizeLineEndings(result);
  }
  if (opts.replaceNbsp) {
    result = replaceNonBreakingSpaces(result);
  }
  if (opts.collapseWhitespace) {
    result = normalizeWhitespace(result);
  }

  return result;
}

// ============================================================================
// T121: XML Character Sanitization
// ============================================================================

/**
 * Result of XML sanitization with diagnostic information.
 */
export type XmlSanitizationResult = {
  /** The sanitized string */
  sanitized: string;
  /** Whether any invalid XML characters were found and removed */
  hadInvalidChars: boolean;
  /** The number of invalid characters that were removed */
  invalidCharCount: number;
};

/**
 * Check if a character code is valid in XML 1.0.
 *
 * Valid XML 1.0 characters are:
 * - U+0009 (tab), U+000A (newline), U+000D (carriage return)
 * - U+0020 to U+D7FF
 * - U+E000 to U+FFFD
 * - U+10000 to U+10FFFF
 *
 * @param charCode - The Unicode code point to check
 * @returns `true` if the character is valid in XML 1.0
 */
export function isValidXmlChar(charCode: number): boolean {
  return (
    charCode === 0x09 ||
    charCode === 0x0a ||
    charCode === 0x0d ||
    (charCode >= 0x20 && charCode <= 0xd7_ff) ||
    (charCode >= 0xe0_00 && charCode <= 0xff_fd) ||
    (charCode >= 0x1_00_00 && charCode <= 0x10_ff_ff)
  );
}

/**
 * Quick check whether a string contains any characters invalid in XML 1.0.
 * Does not modify the string.
 *
 * @param text - The text to check
 * @returns `true` if the text contains at least one invalid XML character
 */
export function containsInvalidXmlChars(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    const code = text.codePointAt(i)!;
    if (!isValidXmlChar(code)) {
      return true;
    }
    // Skip the second code unit of surrogate pairs
    if (code > 0xff_ff) {
      i++;
    }
  }
  return false;
}

/**
 * Remove characters that are invalid in XML 1.0.
 * This includes control characters (U+0000-U+001F) except tab (U+0009),
 * newline (U+000A), and carriage return (U+000D), as well as other
 * invalid Unicode ranges.
 *
 * @param text - The input text
 * @returns Text with all invalid XML characters removed
 */
export function removeInvalidXmlChars(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.codePointAt(i)!;
    if (isValidXmlChar(code)) {
      if (code > 0xff_ff) {
        // Surrogate pair: include both code units
        result += text[i] + text[i + 1];
        i++;
      } else {
        result += text[i];
      }
    } else if (code > 0xff_ff) {
      // Invalid surrogate pair: skip both code units
      i++;
    }
  }
  return result;
}

/**
 * Escape special XML characters for use in text content.
 * Escapes: &amp; &lt; &gt; &quot; &apos;
 *
 * @param text - The input text
 * @returns XML-escaped text safe for use in element content
 */
export function escapeXmlText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Escape special XML characters for use in attribute values.
 * Escapes the same characters as {@link escapeXmlText} plus ensures
 * quotes are escaped for safe use within quoted attribute values.
 *
 * @param text - The input text
 * @returns XML-escaped text safe for use in attribute values
 */
export function escapeXmlAttribute(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/\t/g, '&#x9;')
    .replace(/\n/g, '&#xA;')
    .replace(/\r/g, '&#xD;');
}

/**
 * Combined sanitization for XML text content.
 * Removes invalid XML characters, then escapes special characters.
 *
 * @param text - The input text
 * @returns Text safe for use as XML element content
 */
export function sanitizeForXmlContent(text: string): string {
  return escapeXmlText(removeInvalidXmlChars(text));
}

/**
 * Combined sanitization for XML attribute values.
 * Removes invalid XML characters, then escapes for attribute context.
 *
 * @param text - The input text
 * @returns Text safe for use as an XML attribute value
 */
export function sanitizeForXmlAttribute(text: string): string {
  return escapeXmlAttribute(removeInvalidXmlChars(text));
}

/**
 * Sanitize text and return a detailed report of what was changed.
 * Useful for logging and diagnostics during export.
 *
 * @param text - The input text
 * @returns An object containing the sanitized string and diagnostic info
 */
export function sanitizeWithReport(text: string): XmlSanitizationResult {
  let invalidCharCount = 0;

  for (let i = 0; i < text.length; i++) {
    const code = text.codePointAt(i)!;
    if (!isValidXmlChar(code)) {
      invalidCharCount++;
    }
    if (code > 0xff_ff) {
      i++;
    }
  }

  return {
    sanitized: removeInvalidXmlChars(text),
    hadInvalidChars: invalidCharCount > 0,
    invalidCharCount,
  };
}

// ============================================================================
// Combined Pipeline
// ============================================================================

/**
 * Full sanitization pipeline for text destined for DOCX XML export.
 * Applies in order:
 * 1. UTF-8 normalization (BOM strip, NFC normalize, line endings, NBSP)
 * 2. XML invalid character removal
 * 3. XML special character escaping
 *
 * This is the recommended single function to call for any text that will
 * be embedded in DOCX XML output.
 *
 * @param text - The raw input text
 * @returns Fully sanitized and escaped text ready for DOCX XML
 */
export function sanitizeForDocxExport(text: string): string {
  const normalized = sanitizeTextForDocx(text);
  return sanitizeForXmlContent(normalized);
}
