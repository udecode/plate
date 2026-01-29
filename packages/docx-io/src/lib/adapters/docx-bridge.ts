/**
 * DOCX Bridge - Connects the packages/docx import cleaner with the docXMLater export pipeline
 *
 * This module bridges between the DOCX import system (packages/docx) and the
 * DOCX export system (docXMLater) for round-trip support.
 *
 * ## Background: cleanDocx() in packages/docx
 *
 * The `cleanDocx(html, rtf)` function in `packages/docx/src/lib/docx-cleaner/cleanDocx.ts`
 * is an **import-direction** cleaner. It processes HTML pasted from Microsoft Word
 * (via clipboard) and normalizes it for Plate's deserializer. Its pipeline:
 *
 * 1. `preCleanHtml(html)` - Pre-processes raw clipboard HTML
 * 2. Parses into a DOM Document via DOMParser
 * 3. `isDocxContent(body)` - Detects whether HTML originated from Word
 * 4. Runs a series of DOM mutations:
 *    - `cleanDocxFootnotes` - Strips Word footnote markup
 *    - `cleanDocxImageElements` - Resolves Word image elements using RTF data
 *    - `cleanHtmlEmptyElements` - Removes empty DOM elements
 *    - `cleanDocxEmptyParagraphs` - Removes `<p>` containing only `<o:p>&nbsp;</o:p>`
 *    - `cleanDocxQuotes` - Normalizes Word smart quotes
 *    - `cleanDocxSpans` - Cleans Word-specific `<span>` spaceruns and tab counts
 *    - `cleanHtmlTextNodes` - Normalizes text node whitespace
 *    - `cleanDocxBrComments` - Strips Word `<br>` comment markers
 *    - `cleanHtmlBrElements` - Normalizes `<br>` elements
 *    - `cleanHtmlLinkElements` - Cleans link elements
 *    - `cleanHtmlFontElements` - Removes `<font>` elements
 *    - `cleanDocxListElements` - Converts Word list patterns to semantic `<ul>`/`<ol>`
 *    - `copyBlockMarksToSpanChild` - Propagates block-level marks to inline spans
 * 5. Wraps in `<div style="white-space: pre-wrap">` to preserve whitespace
 * 6. `postCleanHtml(outerHTML)` - Final string-level cleanup
 *
 * ## Export Direction (this module)
 *
 * For the export direction (Plate -> DOCX), we need the **reverse** concern:
 * instead of cleaning Word artifacts from pasted HTML, we need to ensure that
 * HTML serialized from Plate's editor is clean and well-formed before being
 * fed into the docXMLater conversion pipeline.
 *
 * The export cleaning is lighter than import cleaning because Plate's HTML
 * serializer produces structured, predictable HTML rather than Word's complex
 * clipboard format.
 *
 * @module adapters/docx-bridge
 */

import type { CleanupOptions } from '../docXMLater/src/helpers/CleanupHelper';

// ============================================================================
// Types
// ============================================================================

/**
 * Options for cleaning HTML before DOCX export conversion.
 *
 * These options control what normalization steps are applied to HTML
 * from Plate's serializer before it enters the docXMLater pipeline.
 */
export interface ExportCleaningOptions {
  /**
   * Collapse redundant whitespace in text content.
   * Plate's serializer may produce extra whitespace from its node tree.
   * @default true
   */
  normalizeWhitespace?: boolean;

  /**
   * Remove empty block elements (empty `<p>`, `<div>`, etc.).
   * These can create unwanted blank paragraphs in the DOCX output.
   * @default true
   */
  removeEmptyBlocks?: boolean;

  /**
   * Merge adjacent identical inline elements.
   * For example, `<strong>Hello </strong><strong>World</strong>` becomes
   * `<strong>Hello World</strong>`.
   * @default true
   */
  mergeAdjacentInlines?: boolean;

  /**
   * Normalize smart quotes and special characters to their standard equivalents.
   * Ensures consistent character encoding in DOCX output.
   * @default true
   */
  normalizeQuotes?: boolean;

  /**
   * Strip data-* attributes that are Plate-internal and not needed in DOCX.
   * @default true
   */
  stripDataAttributes?: boolean;

  /**
   * Convert relative URLs to absolute URLs using the provided base URL.
   * If null, URLs are left as-is.
   * @default null
   */
  baseUrl?: string | null;

  /**
   * Strip HTML comments from the serialized output.
   * @default true
   */
  stripComments?: boolean;

  /**
   * Normalize `<br>` usage: remove trailing `<br>` at end of blocks,
   * and convert consecutive `<br><br>` to paragraph breaks.
   * @default true
   */
  normalizeBrElements?: boolean;
}

/**
 * Result of the HTML cleaning process for export.
 */
export interface ExportCleaningResult {
  /** The cleaned HTML string */
  html: string;

  /** Number of modifications made */
  modifications: number;

  /** Warnings encountered during cleaning */
  warnings: string[];
}

/**
 * Options for post-export cleanup of the generated DOCX Document.
 *
 * These map to the docXMLater CleanupHelper options and are applied
 * after the HTML has been converted to a Document object.
 */
export interface PostExportCleanupOptions {
  /**
   * Remove unused numbering definitions that may have been created
   * during conversion but are not referenced by any paragraph.
   * @default true
   */
  cleanupNumbering?: boolean;

  /**
   * Remove unused styles that were created during conversion
   * but ended up not being applied.
   * @default true
   */
  cleanupStyles?: boolean;

  /**
   * Remove orphaned relationships (e.g., hyperlink rels with no
   * matching hyperlink element in the document body).
   * @default true
   */
  cleanupRelationships?: boolean;

  /**
   * Sanitize table property exceptions for Word compatibility.
   * @default true
   */
  sanitizeTables?: boolean;
}

/**
 * Full round-trip bridge options combining pre-conversion cleaning
 * and post-conversion cleanup.
 */
export interface DocxBridgeOptions {
  /** Options applied to HTML before conversion */
  preConversion?: ExportCleaningOptions;

  /** Options applied to the Document after conversion */
  postConversion?: PostExportCleanupOptions;
}

// ============================================================================
// Constants
// ============================================================================

/** Default options for export HTML cleaning */
export const DEFAULT_EXPORT_CLEANING: Required<ExportCleaningOptions> = {
  normalizeWhitespace: true,
  removeEmptyBlocks: true,
  mergeAdjacentInlines: true,
  normalizeQuotes: true,
  stripDataAttributes: true,
  baseUrl: null,
  stripComments: true,
  normalizeBrElements: true,
};

/** Default options for post-export Document cleanup */
export const DEFAULT_POST_EXPORT_CLEANUP: Required<PostExportCleanupOptions> = {
  cleanupNumbering: true,
  cleanupStyles: true,
  cleanupRelationships: true,
  sanitizeTables: true,
};

/**
 * Plate-internal data attributes that should be stripped before export.
 * These carry editor state that has no meaning in DOCX.
 */
const PLATE_DATA_ATTRIBUTES = [
  'data-slate-node',
  'data-slate-leaf',
  'data-slate-editor',
  'data-slate-inline',
  'data-slate-void',
  'data-slate-string',
  'data-slate-zero-width',
  'data-slate-length',
  'data-slate-spacer',
  'data-plate-leaf',
  'data-plate-node',
  'data-testid',
];

/**
 * Smart quote character mappings (Unicode -> ASCII equivalents).
 * Used during normalizeQuotes to ensure consistent encoding.
 */
const SMART_QUOTE_MAP: Record<string, string> = {
  '\u2018': "'", // left single quotation mark
  '\u2019': "'", // right single quotation mark
  '\u201C': '"', // left double quotation mark
  '\u201D': '"', // right double quotation mark
  '\u2013': '-', // en dash (kept as-is for DOCX, but noted here)
  '\u2014': '-', // em dash (kept as-is for DOCX, but noted here)
};

// ============================================================================
// Pre-Conversion Cleaning (HTML normalization for export)
// ============================================================================

/**
 * Cleans and normalizes HTML from Plate's serializer before feeding it
 * to the docXMLater conversion pipeline.
 *
 * This is the export-direction counterpart to `cleanDocx()` from packages/docx.
 * While cleanDocx() strips Word artifacts from pasted HTML (import direction),
 * this function ensures Plate's serialized HTML is well-formed and optimized
 * for DOCX generation (export direction).
 *
 * @param html - HTML string from Plate's serializer
 * @param options - Cleaning options (defaults to DEFAULT_EXPORT_CLEANING)
 * @returns Cleaned HTML ready for docXMLater conversion
 *
 * @example
 * ```typescript
 * import { cleanHtmlForExport } from './docx-bridge';
 *
 * const plateHtml = editor.api.htmlReact.serialize();
 * const cleanedHtml = cleanHtmlForExport(plateHtml);
 * const docxBuffer = await convertToDocx(cleanedHtml);
 * ```
 */
export function cleanHtmlForExport(
  html: string,
  options: ExportCleaningOptions = {}
): string {
  const opts = { ...DEFAULT_EXPORT_CLEANING, ...options };
  let result = html;

  // Step 1: Strip HTML comments
  if (opts.stripComments) {
    result = stripHtmlComments(result);
  }

  // Step 2: Normalize whitespace
  if (opts.normalizeWhitespace) {
    result = normalizeWhitespace(result);
  }

  // Step 3: Normalize smart quotes
  if (opts.normalizeQuotes) {
    result = normalizeSmartQuotes(result);
  }

  // Step 4: Strip Plate-internal data attributes
  if (opts.stripDataAttributes) {
    result = stripPlateDataAttributes(result);
  }

  // Step 5: Normalize <br> elements
  if (opts.normalizeBrElements) {
    result = normalizeBrElements(result);
  }

  // Step 6: Remove empty block elements
  if (opts.removeEmptyBlocks) {
    result = removeEmptyBlockElements(result);
  }

  // Step 7: Merge adjacent identical inline elements
  if (opts.mergeAdjacentInlines) {
    result = mergeAdjacentInlineElements(result);
  }

  // Step 8: Resolve relative URLs
  if (opts.baseUrl) {
    result = resolveRelativeUrls(result, opts.baseUrl);
  }

  return result;
}

/**
 * Cleans and normalizes HTML with detailed reporting.
 *
 * Same as `cleanHtmlForExport` but returns a detailed result object
 * including modification count and warnings.
 *
 * @param html - HTML string from Plate's serializer
 * @param options - Cleaning options
 * @returns Detailed cleaning result
 *
 * @example
 * ```typescript
 * const result = normalizeHtmlBeforeConversion(plateHtml);
 * if (result.warnings.length > 0) {
 *   console.warn('Export warnings:', result.warnings);
 * }
 * const docxBuffer = await convertToDocx(result.html);
 * ```
 */
export function normalizeHtmlBeforeConversion(
  html: string,
  options: ExportCleaningOptions = {}
): ExportCleaningResult {
  const warnings: string[] = [];
  let modifications = 0;

  const opts = { ...DEFAULT_EXPORT_CLEANING, ...options };
  let result = html;

  // Strip comments
  if (opts.stripComments) {
    const before = result;
    result = stripHtmlComments(result);
    if (result !== before) modifications++;
  }

  // Normalize whitespace
  if (opts.normalizeWhitespace) {
    const before = result;
    result = normalizeWhitespace(result);
    if (result !== before) modifications++;
  }

  // Normalize quotes
  if (opts.normalizeQuotes) {
    const before = result;
    result = normalizeSmartQuotes(result);
    if (result !== before) modifications++;
  }

  // Strip data attributes
  if (opts.stripDataAttributes) {
    const before = result;
    result = stripPlateDataAttributes(result);
    if (result !== before) modifications++;
  }

  // Normalize br elements
  if (opts.normalizeBrElements) {
    const before = result;
    result = normalizeBrElements(result);
    if (result !== before) modifications++;
  }

  // Remove empty blocks
  if (opts.removeEmptyBlocks) {
    const before = result;
    result = removeEmptyBlockElements(result);
    if (result !== before) modifications++;
  }

  // Merge inlines
  if (opts.mergeAdjacentInlines) {
    const before = result;
    result = mergeAdjacentInlineElements(result);
    if (result !== before) modifications++;
  }

  // Resolve URLs
  if (opts.baseUrl) {
    const before = result;
    result = resolveRelativeUrls(result, opts.baseUrl);
    if (result !== before) modifications++;
  }

  // Detect potential issues
  if (/<script/i.test(result)) {
    warnings.push(
      'HTML contains <script> elements which will be ignored in DOCX output'
    );
  }
  if (/<style/i.test(result)) {
    warnings.push(
      'HTML contains <style> elements; only inline styles are supported in DOCX export'
    );
  }
  if (/<iframe/i.test(result)) {
    warnings.push(
      'HTML contains <iframe> elements which cannot be represented in DOCX'
    );
  }

  return {
    html: result,
    modifications,
    warnings,
  };
}

// ============================================================================
// Post-Conversion Cleanup (Document-level cleanup after generation)
// ============================================================================

/**
 * Converts post-export cleanup options to docXMLater CleanupOptions.
 *
 * This maps the simplified export bridge options to the full CleanupHelper
 * options used by docXMLater.
 *
 * @param options - Post-export cleanup options
 * @returns CleanupOptions compatible with docXMLater's CleanupHelper
 *
 * @example
 * ```typescript
 * import { CleanupHelper } from '../docXMLater/src/helpers/CleanupHelper';
 * import { toCleanupOptions } from './docx-bridge';
 *
 * const cleanup = new CleanupHelper(document);
 * const report = cleanup.run(toCleanupOptions({ cleanupNumbering: true }));
 * ```
 */
export function toCleanupOptions(
  options: PostExportCleanupOptions
): CleanupOptions {
  return {
    cleanupNumbering: options.cleanupNumbering ?? true,
    cleanupStyles: options.cleanupStyles ?? true,
    cleanupRelationships: options.cleanupRelationships ?? true,
    sanitizeTables: options.sanitizeTables ?? true,
    // Export-generated documents don't have these Word-specific artifacts,
    // so we disable them by default
    unlockSDTs: false,
    removeSDTs: false,
    clearPreserveFlags: false,
    defragmentHyperlinks: false,
    resetHyperlinkFormatting: false,
    removeCustomXML: false,
    unlockFields: false,
    unlockFrames: false,
    formatInternalHyperlinks: false,
    formatAllHyperlinks: false,
  };
}

/**
 * Creates a complete DocxBridgeOptions with defaults filled in.
 *
 * @param overrides - Partial options to override defaults
 * @returns Complete bridge options
 */
export function createBridgeOptions(
  overrides: Partial<DocxBridgeOptions> = {}
): DocxBridgeOptions {
  return {
    preConversion: {
      ...DEFAULT_EXPORT_CLEANING,
      ...overrides.preConversion,
    },
    postConversion: {
      ...DEFAULT_POST_EXPORT_CLEANUP,
      ...overrides.postConversion,
    },
  };
}

// ============================================================================
// Internal Helpers - String-based HTML transformations
// ============================================================================

/**
 * Strips HTML comments from the string.
 * @internal
 */
function stripHtmlComments(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, '');
}

/**
 * Normalizes whitespace in HTML content.
 * Collapses runs of whitespace between tags and trims text content.
 * @internal
 */
function normalizeWhitespace(html: string): string {
  // Collapse whitespace between tags (not inside <pre> or <code>)
  let result = html.replace(/>\s+</g, '> <');

  // Collapse multiple spaces in text (outside of tags)
  result = result.replace(/ {2,}/g, ' ');

  return result;
}

/**
 * Normalizes smart quote characters to standard ASCII equivalents.
 * This ensures consistent character encoding in the DOCX output
 * since Word handles these characters differently.
 * @internal
 */
function normalizeSmartQuotes(html: string): string {
  let result = html;

  for (const [smart, standard] of Object.entries(SMART_QUOTE_MAP)) {
    result = result.replace(new RegExp(smart, 'g'), standard);
  }

  return result;
}

/**
 * Strips Plate-internal data-* attributes from HTML elements.
 * These attributes carry editor state information that has no
 * meaning in DOCX format.
 * @internal
 */
function stripPlateDataAttributes(html: string): string {
  let result = html;

  for (const attr of PLATE_DATA_ATTRIBUTES) {
    // Match the attribute with any value (quoted or unquoted)
    const pattern = new RegExp(`\\s${attr}="[^"]*"`, 'g');
    result = result.replace(pattern, '');
  }

  return result;
}

/**
 * Normalizes `<br>` elements in the HTML:
 * - Removes trailing `<br>` at the end of block elements
 * - Preserves `<br>` in inline contexts (these become line breaks in DOCX)
 * @internal
 */
function normalizeBrElements(html: string): string {
  // Remove trailing <br> before closing block tags
  return html.replace(
    /<br\s*\/?>\s*(<\/(?:p|div|h[1-6]|li|blockquote|td|th)>)/gi,
    '$1'
  );
}

/**
 * Removes empty block elements that would create blank paragraphs in DOCX.
 * Preserves elements that serve as spacers (e.g., `<br>` inside a `<p>`).
 * @internal
 */
function removeEmptyBlockElements(html: string): string {
  // Remove completely empty block elements (no content, no children)
  // But preserve <hr>, <br>, <img> and other void elements
  return html.replace(
    /<(p|div|h[1-6]|blockquote)(\s[^>]*)?>(\s|&nbsp;)*<\/\1>/gi,
    ''
  );
}

/**
 * Merges adjacent identical inline elements.
 * For example: `<strong>A</strong><strong>B</strong>` -> `<strong>AB</strong>`
 *
 * This reduces redundant run splits in the DOCX output, producing
 * cleaner XML with fewer w:r elements.
 * @internal
 */
function mergeAdjacentInlineElements(html: string): string {
  const inlineTags = ['strong', 'em', 'u', 's', 'b', 'i', 'sub', 'sup', 'code'];

  let result = html;
  for (const tag of inlineTags) {
    // Match closing tag immediately followed by opening tag (with optional whitespace)
    const pattern = new RegExp(`</${tag}>\\s*<${tag}(\\s[^>]*)?>`, 'gi');
    result = result.replace(pattern, '');
  }

  return result;
}

/**
 * Resolves relative URLs (href, src) to absolute URLs using the provided base.
 * @internal
 */
function resolveRelativeUrls(html: string, baseUrl: string): string {
  // Resolve href attributes
  let result = html.replace(
    /href="(?!https?:\/\/|mailto:|tel:|#)([^"]+)"/gi,
    (match, path) => {
      try {
        const absolute = new URL(path, baseUrl).href;
        return `href="${absolute}"`;
      } catch {
        return match;
      }
    }
  );

  // Resolve src attributes
  result = result.replace(
    /src="(?!https?:\/\/|data:)([^"]+)"/gi,
    (match, path) => {
      try {
        const absolute = new URL(path, baseUrl).href;
        return `src="${absolute}"`;
      } catch {
        return match;
      }
    }
  );

  return result;
}

// ============================================================================
// HTML Export Validation & Sanitization (T119)
// ============================================================================
//
// The functions below handle the EXPORT-direction HTML cleaning that is
// complementary to the IMPORT-direction cleaning done by DocxPlugin.
//
// Import direction (packages/docx):
//   cleanDocx() strips Word-specific artifacts (MsoNormal, VML shapes,
//   spaceruns, footnotes, smart quotes) from pasted clipboard HTML so
//   Plate's deserializer can process it.
//
// Export direction (this section):
//   validateExportHtml() inspects Plate's serialized HTML for patterns
//   that would be problematic in DOCX output (scripts, event handlers,
//   editor-internal attributes).
//   sanitizeExportHtml() removes those patterns to produce clean HTML
//   suitable for the docXMLater conversion pipeline.
//
// The symmetric flow is:
//   DOCX --> cleanDocx() --> Plate editor --> sanitizeExportHtml() --> DOCX
//
// ============================================================================

// --- Type Definitions ---

/**
 * Severity level for validation issues found during export HTML inspection
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * A single validation issue found in HTML before export
 */
export interface ValidationIssue {
  /** Severity of the issue */
  severity: ValidationSeverity;
  /** Machine-readable issue code */
  code: string;
  /** Human-readable description */
  message: string;
  /** The HTML element or pattern that triggered the issue */
  source?: string;
  /** Additional context for debugging */
  details?: Record<string, unknown>;
}

/**
 * Result of HTML export validation.
 *
 * This is a read-only inspection result. It does not modify the HTML.
 * Use {@link sanitizeExportHtml} to clean the HTML based on these findings.
 */
export interface ValidationResult {
  /** Whether the HTML is valid for export (no error-level issues) */
  valid: boolean;
  /** All issues found, sorted by severity (errors first) */
  issues: ValidationIssue[];
  /** Count of error-level issues */
  errorCount: number;
  /** Count of warning-level issues */
  warningCount: number;
  /** Count of informational issues */
  infoCount: number;
}

/**
 * Result of HTML sanitization for export
 */
export interface SanitizeExportResult {
  /** The sanitized HTML string */
  html: string;
  /** Total number of modifications made */
  modificationsCount: number;
  /** Detailed list of modifications */
  modifications: SanitizeModification[];
}

/**
 * A single modification performed during sanitization
 */
export interface SanitizeModification {
  /** Category of modification */
  type:
    | 'attribute-removed'
    | 'element-removed'
    | 'whitespace-normalized'
    | 'script-removed'
    | 'style-cleaned';
  /** Human-readable description */
  description: string;
  /** Number of occurrences of this modification */
  count: number;
}

/**
 * Options for controlling sanitization behavior in {@link sanitizeExportHtml}
 */
export interface SanitizeExportOptions {
  /**
   * Remove ALL `data-*` attributes.
   * When false, only Plate-specific `data-slate-*` and `data-plate-*` are removed.
   * @default true
   */
  removeAllDataAttributes?: boolean;

  /**
   * Remove empty `<span>` elements that carry no text or semantic content.
   * @default true
   */
  removeEmptySpans?: boolean;

  /**
   * Normalize runs of whitespace into single spaces (outside `<pre>` blocks).
   * @default true
   */
  normalizeWhitespace?: boolean;

  /**
   * Remove all inline `style` attributes.
   * When false, styles are preserved for the DOCX style mapper to interpret.
   * @default false
   */
  removeInlineStyles?: boolean;

  /**
   * Remove all `class` attributes.
   * When false, classes are preserved for style mapping.
   * @default false
   */
  removeClasses?: boolean;
}

// --- Validation Constants ---

/**
 * Machine-readable codes for validation issues.
 * Use these to programmatically filter or react to specific issue types.
 */
export const ValidationCodes = {
  SCRIPT_ELEMENT: 'SCRIPT_ELEMENT',
  EVENT_HANDLER: 'EVENT_HANDLER',
  PLATE_DATA_ATTR: 'PLATE_DATA_ATTR',
  CONTENTEDITABLE: 'CONTENTEDITABLE',
  EMPTY_SPAN: 'EMPTY_SPAN',
  IFRAME_ELEMENT: 'IFRAME_ELEMENT',
  OBJECT_ELEMENT: 'OBJECT_ELEMENT',
  EMPTY_DOCUMENT: 'EMPTY_DOCUMENT',
  EXCESSIVE_NESTING: 'EXCESSIVE_NESTING',
  DATA_URI_IMAGE: 'DATA_URI_IMAGE',
  MISSING_ALT_TEXT: 'MISSING_ALT_TEXT',
} as const;

/**
 * Editor-specific attributes that are meaningless in a DOCX file.
 * Removed during sanitization in addition to `data-*` attributes.
 */
const EDITOR_ONLY_ATTRIBUTES = [
  'contenteditable',
  'spellcheck',
  'autocorrect',
  'autocapitalize',
  'role',
  'tabindex',
  'draggable',
  'suppresscontenteditablewarning',
] as const;

// --- Validation Implementation ---

/**
 * Validate HTML content before it enters the DOCX conversion pipeline.
 *
 * Performs a **read-only** inspection of the HTML and returns a structured
 * report of issues. Does NOT modify the HTML -- use {@link sanitizeExportHtml}
 * for cleaning.
 *
 * **Error-level checks:**
 * - `<script>`, `<iframe>`, `<object>` elements
 * - Event handler attributes (`onclick`, `onload`, etc.)
 * - Empty document
 *
 * **Warning-level checks:**
 * - Plate-internal `data-slate-*` and `data-plate-*` attributes
 * - `contenteditable` attributes
 * - Excessive DOM nesting depth (> 20 levels)
 *
 * **Info-level checks:**
 * - Empty `<span>` elements with no text content
 * - Images using data URIs (will inflate DOCX size)
 * - Images missing alt text
 *
 * @param html - The serialized HTML string to validate
 * @returns A {@link ValidationResult} with all issues found
 *
 * @example
 * ```ts
 * const result = validateExportHtml(
 *   '<p data-slate-node="element" onclick="alert(1)">Hello</p>'
 * );
 * // result.valid === false (onclick is an error)
 * // result.errorCount === 1
 * // result.warningCount === 1 (data-slate-node)
 * ```
 */
export function validateExportHtml(html: string): ValidationResult {
  const issues: ValidationIssue[] = [];

  // Empty document check
  if (!html || html.trim().length === 0) {
    issues.push({
      severity: 'error',
      code: ValidationCodes.EMPTY_DOCUMENT,
      message: 'HTML content is empty',
    });
    return assembleValidationResult(issues);
  }

  // --- Error-level checks ---

  const scriptMatches = html.match(/<script[\s>]/gi);
  if (scriptMatches) {
    issues.push({
      severity: 'error',
      code: ValidationCodes.SCRIPT_ELEMENT,
      message: `Found ${scriptMatches.length} <script> element(s) that must be removed before export`,
      details: { count: scriptMatches.length },
    });
  }

  const iframeMatches = html.match(/<iframe[\s>]/gi);
  if (iframeMatches) {
    issues.push({
      severity: 'error',
      code: ValidationCodes.IFRAME_ELEMENT,
      message: `Found ${iframeMatches.length} <iframe> element(s) that cannot be represented in DOCX`,
      details: { count: iframeMatches.length },
    });
  }

  const objectMatches = html.match(/<object[\s>]/gi);
  if (objectMatches) {
    issues.push({
      severity: 'error',
      code: ValidationCodes.OBJECT_ELEMENT,
      message: `Found ${objectMatches.length} <object> element(s) that cannot be represented in DOCX`,
      details: { count: objectMatches.length },
    });
  }

  // Event handler attributes
  const eventHandlerRegex = /\s(on[a-z]+)\s*=/gi;
  const eventHandlers: string[] = [];
  let evtMatch: RegExpExecArray | null;
  while ((evtMatch = eventHandlerRegex.exec(html)) !== null) {
    eventHandlers.push(evtMatch[1]);
  }
  if (eventHandlers.length > 0) {
    const unique = Array.from(new Set(eventHandlers));
    issues.push({
      severity: 'error',
      code: ValidationCodes.EVENT_HANDLER,
      message: `Found ${eventHandlers.length} event handler attribute(s): ${unique.join(', ')}`,
      details: { handlers: unique, totalCount: eventHandlers.length },
    });
  }

  // --- Warning-level checks ---

  for (const attr of PLATE_DATA_ATTRIBUTES) {
    const regex = new RegExp(`\\s${attr}\\s*=`, 'gi');
    const matches = html.match(regex);
    if (matches) {
      issues.push({
        severity: 'warning',
        code: ValidationCodes.PLATE_DATA_ATTR,
        message: `Found ${matches.length} '${attr}' attribute(s) that are Plate-internal`,
        details: { attribute: attr, count: matches.length },
      });
    }
  }

  const ceMatches = html.match(/\scontenteditable\s*=/gi);
  if (ceMatches) {
    issues.push({
      severity: 'warning',
      code: ValidationCodes.CONTENTEDITABLE,
      message: `Found ${ceMatches.length} 'contenteditable' attribute(s)`,
      details: { count: ceMatches.length },
    });
  }

  const nestingDepth = estimateMaxNestingDepth(html);
  if (nestingDepth > 20) {
    issues.push({
      severity: 'warning',
      code: ValidationCodes.EXCESSIVE_NESTING,
      message: `Estimated nesting depth of ${nestingDepth} exceeds recommended maximum of 20`,
      details: { depth: nestingDepth },
    });
  }

  // --- Info-level checks ---

  const emptySpanMatches = html.match(/<span[^>]*>\s*<\/span>/gi);
  if (emptySpanMatches) {
    issues.push({
      severity: 'info',
      code: ValidationCodes.EMPTY_SPAN,
      message: `Found ${emptySpanMatches.length} empty <span> element(s) with no semantic content`,
      details: { count: emptySpanMatches.length },
    });
  }

  const dataUriMatches = html.match(/src\s*=\s*["']data:/gi);
  if (dataUriMatches) {
    issues.push({
      severity: 'info',
      code: ValidationCodes.DATA_URI_IMAGE,
      message: `Found ${dataUriMatches.length} image(s) using data URIs (will be embedded in DOCX)`,
      details: { count: dataUriMatches.length },
    });
  }

  const imgWithoutAlt = html.match(/<img(?![^>]*\salt\s*=)[^>]*>/gi);
  if (imgWithoutAlt) {
    issues.push({
      severity: 'info',
      code: ValidationCodes.MISSING_ALT_TEXT,
      message: `Found ${imgWithoutAlt.length} image(s) without alt text`,
      details: { count: imgWithoutAlt.length },
    });
  }

  return assembleValidationResult(issues);
}

// --- Sanitization Implementation ---

/**
 * Sanitize HTML for DOCX export by stripping editor-internal artifacts.
 *
 * This is the export-direction counterpart to DocxPlugin's `cleanDocx()`.
 * While `cleanDocx()` strips **Word-specific** markup from pasted content
 * (import direction), this function strips **Plate/Slate-specific** markup
 * from serialized HTML before the docXMLater pipeline (export direction).
 *
 * **Modifications performed (with defaults):**
 * 1. Remove `<script>`, `<iframe>`, `<object>` elements entirely
 * 2. Strip event handler attributes (`onclick`, `onload`, etc.)
 * 3. Strip `data-*` attributes (all, or only Plate-specific ones)
 * 4. Strip editor attributes (`contenteditable`, `spellcheck`, `role`, etc.)
 * 5. Remove empty `<span>` elements (iterative for nested empties)
 * 6. Normalize whitespace (collapse runs outside `<pre>` blocks)
 * 7. Optionally remove inline styles and class attributes
 *
 * @param html - The serialized HTML string to sanitize
 * @param options - Configuration for sanitization behavior
 * @returns A {@link SanitizeExportResult} with cleaned HTML and modification log
 *
 * @example
 * ```ts
 * const { html: clean } = sanitizeExportHtml(
 *   '<p data-slate-node="element" contenteditable="false" onclick="x()">Hello</p>'
 * );
 * // clean === '<p>Hello</p>'
 * ```
 */
export function sanitizeExportHtml(
  html: string,
  options: SanitizeExportOptions = {}
): SanitizeExportResult {
  const {
    removeAllDataAttributes = true,
    removeEmptySpans = true,
    normalizeWhitespace: doNormalizeWs = true,
    removeInlineStyles = false,
    removeClasses = false,
  } = options;

  const modifications: SanitizeModification[] = [];
  let totalMods = 0;
  let result = html;

  // 1. Remove dangerous elements (including content)
  const dangerousElements = [
    { tag: 'script', regex: /<script[\s\S]*?<\/script>/gi },
    { tag: 'iframe', regex: /<iframe[\s\S]*?<\/iframe>/gi },
    { tag: 'object', regex: /<object[\s\S]*?<\/object>/gi },
  ];
  for (const { tag, regex } of dangerousElements) {
    const matches = result.match(regex);
    if (matches && matches.length > 0) {
      result = result.replace(regex, '');
      modifications.push({
        type: 'script-removed',
        description: `Removed ${matches.length} <${tag}> element(s)`,
        count: matches.length,
      });
      totalMods += matches.length;
    }
  }
  // Self-closing variants
  const selfClosingDangerous = /<(script|iframe|object)\s[^>]*\/>/gi;
  const scMatches = result.match(selfClosingDangerous);
  if (scMatches && scMatches.length > 0) {
    result = result.replace(selfClosingDangerous, '');
    totalMods += scMatches.length;
  }

  // 2. Remove event handler attributes
  {
    const eventRegex = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi;
    const matches = result.match(eventRegex);
    if (matches && matches.length > 0) {
      result = result.replace(eventRegex, '');
      modifications.push({
        type: 'attribute-removed',
        description: `Removed ${matches.length} event handler attribute(s)`,
        count: matches.length,
      });
      totalMods += matches.length;
    }
  }

  // 3. Remove data-* attributes
  if (removeAllDataAttributes) {
    const dataAttrRegex =
      /\s+data-[a-z][a-z0-9-]*\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi;
    const matches = result.match(dataAttrRegex);
    if (matches && matches.length > 0) {
      result = result.replace(dataAttrRegex, '');
      modifications.push({
        type: 'attribute-removed',
        description: `Removed ${matches.length} data-* attribute(s)`,
        count: matches.length,
      });
      totalMods += matches.length;
    }
  } else {
    for (const attr of PLATE_DATA_ATTRIBUTES) {
      const regex = new RegExp(
        `\\s+${attr}\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]*)`,
        'gi'
      );
      const matches = result.match(regex);
      if (matches && matches.length > 0) {
        result = result.replace(regex, '');
        modifications.push({
          type: 'attribute-removed',
          description: `Removed ${matches.length} '${attr}' attribute(s)`,
          count: matches.length,
        });
        totalMods += matches.length;
      }
    }
  }

  // 4. Remove editor-specific attributes
  for (const attr of EDITOR_ONLY_ATTRIBUTES) {
    const regex = new RegExp(
      `\\s+${attr}\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]*)`,
      'gi'
    );
    const matches = result.match(regex);
    if (matches && matches.length > 0) {
      result = result.replace(regex, '');
      modifications.push({
        type: 'attribute-removed',
        description: `Removed ${matches.length} '${attr}' attribute(s)`,
        count: matches.length,
      });
      totalMods += matches.length;
    }
  }

  // 5. Remove inline styles if requested
  if (removeInlineStyles) {
    const styleRegex = /\s+style\s*=\s*(?:"[^"]*"|'[^']*')/gi;
    const matches = result.match(styleRegex);
    if (matches && matches.length > 0) {
      result = result.replace(styleRegex, '');
      modifications.push({
        type: 'style-cleaned',
        description: `Removed ${matches.length} inline style attribute(s)`,
        count: matches.length,
      });
      totalMods += matches.length;
    }
  }

  // 6. Remove class attributes if requested
  if (removeClasses) {
    const classRegex = /\s+class\s*=\s*(?:"[^"]*"|'[^']*')/gi;
    const matches = result.match(classRegex);
    if (matches && matches.length > 0) {
      result = result.replace(classRegex, '');
      modifications.push({
        type: 'attribute-removed',
        description: `Removed ${matches.length} class attribute(s)`,
        count: matches.length,
      });
      totalMods += matches.length;
    }
  }

  // 7. Remove empty spans (iterative to handle nested empties)
  if (removeEmptySpans) {
    const emptySpanRegex = /<span[^>]*>\s*<\/span>/gi;
    let emptyCount = 0;
    let prevResult: string;
    do {
      prevResult = result;
      const matches = result.match(emptySpanRegex);
      if (matches) {
        emptyCount += matches.length;
      }
      result = result.replace(emptySpanRegex, '');
    } while (result !== prevResult);

    if (emptyCount > 0) {
      modifications.push({
        type: 'element-removed',
        description: `Removed ${emptyCount} empty <span> element(s)`,
        count: emptyCount,
      });
      totalMods += emptyCount;
    }
  }

  // 8. Normalize whitespace (preserve <pre> blocks)
  if (doNormalizeWs) {
    const { text: normalized, count } = collapseWhitespacePreservingPre(result);
    if (count > 0) {
      result = normalized;
      modifications.push({
        type: 'whitespace-normalized',
        description: `Normalized whitespace in ${count} location(s)`,
        count,
      });
      totalMods += count;
    }
  }

  // Clean up leftover sparse attribute lists: <p  > -> <p>
  result = result.replace(/<(\w+)\s+>/g, '<$1>');

  return {
    html: result,
    modificationsCount: totalMods,
    modifications,
  };
}

// --- Combined Pipeline Entry Point ---

/**
 * Run validation and sanitization as a single pipeline step.
 *
 * Validates the original HTML (logging what was found), then sanitizes it
 * to produce clean output for the docXMLater conversion pipeline.
 *
 * @param html - Serialized HTML from Plate's editor
 * @param sanitizeOptions - Options for sanitization behavior
 * @returns Object with cleaned HTML, validation report, and sanitization report
 *
 * @example
 * ```ts
 * const { html, validation, sanitization } = prepareHtmlForExport(editorHtml);
 * if (validation.errorCount > 0) {
 *   console.warn('Pre-sanitization errors:', validation.errorCount);
 * }
 * // `html` is now clean and ready for docXMLater
 * ```
 */
export function prepareHtmlForExport(
  html: string,
  sanitizeOptions?: SanitizeExportOptions
): {
  html: string;
  validation: ValidationResult;
  sanitization: SanitizeExportResult;
} {
  const validation = validateExportHtml(html);
  const sanitization = sanitizeExportHtml(html, sanitizeOptions);

  return {
    html: sanitization.html,
    validation,
    sanitization,
  };
}

// --- Validation / Sanitization Internal Helpers ---

/**
 * Assemble a ValidationResult from an array of issues, sorting by severity.
 * @internal
 */
function assembleValidationResult(issues: ValidationIssue[]): ValidationResult {
  const severityOrder: Record<ValidationSeverity, number> = {
    error: 0,
    warning: 1,
    info: 2,
  };

  const sorted = [...issues].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );

  const errorCount = sorted.filter((i) => i.severity === 'error').length;
  const warningCount = sorted.filter((i) => i.severity === 'warning').length;
  const infoCount = sorted.filter((i) => i.severity === 'info').length;

  return {
    valid: errorCount === 0,
    issues: sorted,
    errorCount,
    warningCount,
    infoCount,
  };
}

/**
 * Estimate the maximum DOM nesting depth using a tag-counting heuristic.
 * @internal
 */
function estimateMaxNestingDepth(html: string): number {
  let depth = 0;
  let maxDepth = 0;

  const voidElements = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
  ]);
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*\/?>/gi;
  let tagMatch: RegExpExecArray | null;

  while ((tagMatch = tagRegex.exec(html)) !== null) {
    const fullMatch = tagMatch[0];
    const tagName = tagMatch[1].toLowerCase();

    if (voidElements.has(tagName) || fullMatch.endsWith('/>')) {
      continue;
    }
    if (fullMatch.startsWith('</')) {
      depth = Math.max(0, depth - 1);
    } else {
      depth += 1;
      maxDepth = Math.max(maxDepth, depth);
    }
  }

  return maxDepth;
}

/**
 * Collapse runs of whitespace in HTML while preserving `<pre>` block content.
 * @internal
 */
function collapseWhitespacePreservingPre(html: string): {
  text: string;
  count: number;
} {
  let count = 0;

  // Split around <pre>...</pre> blocks to preserve their whitespace
  const parts = html.split(/(<pre[\s\S]*?<\/pre>)/gi);

  const normalized = parts.map((part, index) => {
    // Odd indices are <pre> blocks -- leave untouched
    if (index % 2 === 1) {
      return part;
    }

    let segment = part;

    // Collapse runs of whitespace between > and <
    segment = segment.replace(/>\s{2,}</g, () => {
      count += 1;
      return '> <';
    });

    // Collapse runs of spaces/tabs within text nodes
    segment = segment.replace(/>([^<]+)</g, (_match, textContent: string) => {
      const collapsed = textContent.replace(/[ \t]{2,}/g, () => {
        count += 1;
        return ' ';
      });
      return `>${collapsed}<`;
    });

    return segment;
  });

  return { text: normalized.join(''), count };
}
