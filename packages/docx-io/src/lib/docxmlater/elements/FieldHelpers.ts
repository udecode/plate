/**
 * Helper functions for creating complex and nested fields
 */

import { ComplexField } from './Field';

/**
 * Parsed components of a HYPERLINK field instruction
 */
export interface ParsedHyperlinkInstruction {
  /** Base URL (with encoded characters decoded) */
  url: string;
  /** Anchor/fragment from \l switch (decoded) */
  anchor?: string;
  /** Tooltip text from \o switch */
  tooltip?: string;
  /** Whether \h switch is present (creates hyperlink) */
  hasHSwitch: boolean;
  /** Combined full URL (url + "#" + anchor if both present) */
  fullUrl: string;
  /** Original raw instruction string */
  rawInstruction: string;
}

/**
 * Parses a HYPERLINK field instruction string into its components
 *
 * HYPERLINK field syntax per ECMA-376:
 * - HYPERLINK "url" - basic external hyperlink
 * - HYPERLINK \l "anchor" - anchor-only internal hyperlink (no URL)
 * - \l "anchor" - specifies a location (anchor/fragment) within the target
 * - \o "tooltip" - specifies the tooltip/screentip text
 * - \h - creates a hyperlink (always present for clickable links)
 * - \n - opens link in new window
 * - \t "target" - specifies target frame
 *
 * @param instruction The raw field instruction string (e.g., 'HYPERLINK "url" \l "anchor" \h')
 * @returns Parsed components or null if not a valid HYPERLINK instruction
 *
 * @example
 * ```typescript
 * // External hyperlink with anchor
 * const result = parseHyperlinkInstruction('HYPERLINK "https://example.com/" \\l "section1" \\h');
 * // result.url = "https://example.com/"
 * // result.anchor = "section1"
 * // result.fullUrl = "https://example.com/#section1"
 *
 * // Anchor-only internal hyperlink (e.g., "Top of the Document")
 * const result2 = parseHyperlinkInstruction('HYPERLINK \\l "_top" \\h');
 * // result2.url = ""
 * // result2.anchor = "_top"
 * // result2.fullUrl = "#_top"
 * ```
 */
export function parseHyperlinkInstruction(instruction: string): ParsedHyperlinkInstruction | null {
  if (!instruction) {
    return null;
  }

  // Normalize whitespace and trim
  const normalized = instruction.trim();

  // Check if this is a HYPERLINK instruction
  if (!normalized.toUpperCase().startsWith('HYPERLINK')) {
    return null;
  }

  // Extract the URL (first quoted string after HYPERLINK, before any switches)
  // URL is optional - anchor-only hyperlinks like 'HYPERLINK \l "_top"' are valid
  let url: string = '';
  const urlMatch = normalized.match(/HYPERLINK\s+"([^"]*)"/i);
  if (urlMatch && urlMatch[1] !== undefined) {
    url = urlMatch[1];
    // Decode URL-encoded characters
    try {
      url = decodeURIComponent(url);
    } catch {
      // If decoding fails, use the original URL
    }
  }

  // Extract \l switch (anchor/fragment)
  let anchor: string | undefined;
  const anchorMatch = normalized.match(/\\l\s+"([^"]*)"/i);
  if (anchorMatch && anchorMatch[1] !== undefined) {
    anchor = anchorMatch[1];
    // Decode anchor as well
    try {
      anchor = decodeURIComponent(anchor);
    } catch {
      // If decoding fails, use the original anchor
    }
  }

  // Must have either URL or anchor to be valid
  if (!url && !anchor) {
    return null;
  }

  // Extract \o switch (tooltip)
  let tooltip: string | undefined;
  const tooltipMatch = normalized.match(/\\o\s+"([^"]*)"/i);
  if (tooltipMatch && tooltipMatch[1] !== undefined) {
    tooltip = tooltipMatch[1];
  }

  // Check for \h switch
  const hasHSwitch = /\\h(?:\s|$)/i.test(normalized);

  // Build full URL by combining base URL and anchor
  let fullUrl: string = url;
  if (anchor) {
    // If URL already has a fragment, replace it; otherwise append
    const hashIndex = url.indexOf('#');
    if (hashIndex >= 0) {
      fullUrl = url.substring(0, hashIndex) + '#' + anchor;
    } else if (url) {
      fullUrl = url + '#' + anchor;
    } else {
      // Anchor-only: just use #anchor
      fullUrl = '#' + anchor;
    }
  }

  return {
    url,
    anchor,
    tooltip,
    hasHSwitch,
    fullUrl,
    rawInstruction: instruction,
  };
}

/**
 * Creates a HYPERLINK field instruction string from components
 *
 * @param url The target URL
 * @param anchor Optional anchor/fragment (will use \l switch)
 * @param tooltip Optional tooltip text (will use \o switch)
 * @returns Properly formatted HYPERLINK instruction string
 *
 * @example
 * ```typescript
 * const instr = buildHyperlinkInstruction('https://example.com/', 'section1', 'Click here');
 * // Returns: 'HYPERLINK "https://example.com/" \\l "section1" \\o "Click here" \\h'
 * ```
 */
export function buildHyperlinkInstruction(
  url: string,
  anchor?: string,
  tooltip?: string
): string {
  let instruction = `HYPERLINK "${url}"`;

  if (anchor) {
    instruction += ` \\l "${anchor}"`;
  }

  if (tooltip) {
    instruction += ` \\o "${tooltip}"`;
  }

  // Always add \h switch for clickable hyperlinks
  instruction += ' \\h';

  return instruction;
}

/**
 * Checks if a field instruction is a HYPERLINK field
 *
 * @param instruction The field instruction to check
 * @returns True if the instruction is a HYPERLINK field
 */
export function isHyperlinkInstruction(instruction: string): boolean {
  if (!instruction) {
    return false;
  }
  return instruction.trim().toUpperCase().startsWith('HYPERLINK');
}

/**
 * Creates a nested IF field containing a MERGEFIELD
 * This is a common pattern for conditional mail merge
 *
 * @param condition The IF condition (e.g., 'Status = "Active"')
 * @param mergeFieldName The merge field name to include
 * @param trueText Text to show when condition is true
 * @param falseText Text to show when condition is false
 * @returns ComplexField with nested MERGEFIELD
 *
 * @example
 * ```typescript
 * const field = createNestedIFMergeField('Status = "Active"', 'Name', 'Active: ', 'Inactive');
 * // Result: IF field that shows "Active: [Name]" if Status is Active, otherwise "Inactive"
 * ```
 */
export function createNestedIFMergeField(
  condition: string,
  mergeFieldName: string,
  trueText: string = '',
  falseText: string = ''
): ComplexField {
  // Create the nested MERGEFIELD
  const mergeField = new ComplexField({
    instruction: ` MERGEFIELD ${mergeFieldName} `,
    result: `[${mergeFieldName}]`,
  });

  // Create the IF field with nested MERGEFIELD
  const ifField = new ComplexField({
    instruction: ` IF ${condition} "${trueText}" "${falseText}" `,
    result: trueText || falseText,
  });

  ifField.addNestedField(mergeField);

  return ifField;
}

/**
 * Creates a MERGEFIELD with custom formatting
 *
 * @param fieldName The merge field name
 * @param format Optional format switches
 * @returns ComplexField for MERGEFIELD
 *
 * @example
 * ```typescript
 * const field = createMergeField('Date', '\\@ "MMMM d, yyyy"');
 * ```
 */
export function createMergeField(fieldName: string, format?: string): ComplexField {
  let instruction = ` MERGEFIELD ${fieldName}`;

  if (format) {
    instruction += ` ${format}`;
  }

  instruction += ' \\* MERGEFORMAT ';

  return new ComplexField({
    instruction,
    result: `[${fieldName}]`,
  });
}

/**
 * Creates a REF field with a nested field in the bookmark reference
 * Used for complex cross-references
 *
 * @param bookmarkName The bookmark to reference
 * @param format Optional format switches
 * @returns ComplexField for REF
 *
 * @example
 * ```typescript
 * const field = createRefField('Chapter1', '\\h');
 * ```
 */
export function createRefField(bookmarkName: string, format?: string): ComplexField {
  let instruction = ` REF ${bookmarkName}`;

  if (format) {
    instruction += ` ${format}`;
  } else {
    instruction += ' \\h'; // Hyperlink by default
  }

  instruction += ' \\* MERGEFORMAT ';

  return new ComplexField({
    instruction,
    result: `[${bookmarkName}]`,
  });
}

/**
 * Creates an IF field with custom true/false branches
 *
 * @param condition The condition to evaluate
 * @param trueContent Content to show when true
 * @param falseContent Content to show when false
 * @returns ComplexField for IF
 *
 * @example
 * ```typescript
 * const field = createIFField('Amount > 1000', 'High Value', 'Normal');
 * ```
 */
export function createIFField(
  condition: string,
  trueContent: string,
  falseContent: string = ''
): ComplexField {
  const instruction = ` IF ${condition} "${trueContent}" "${falseContent}" `;

  return new ComplexField({
    instruction,
    result: trueContent,
  });
}

/**
 * Creates a complex nested field structure with multiple levels
 * Useful for advanced scenarios like nested IF statements
 *
 * @param outerInstruction The outer field instruction
 * @param nestedFields Array of nested fields to include
 * @returns ComplexField with nested structure
 *
 * @example
 * ```typescript
 * const innerField = createMergeField('Amount');
 * const field = createNestedField('IF Amount > 0', [innerField]);
 * ```
 */
export function createNestedField(
  outerInstruction: string,
  nestedFields: ComplexField[]
): ComplexField {
  const field = new ComplexField({
    instruction: outerInstruction,
  });

  for (const nested of nestedFields) {
    field.addNestedField(nested);
  }

  return field;
}
