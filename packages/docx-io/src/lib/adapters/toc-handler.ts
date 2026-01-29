/**
 * Table of Contents Handler - HTML TOC to DOCX TOC field conversion
 *
 * This module provides handlers for converting Table of Contents elements
 * from HTML to DOCX TOC fields using docXMLater's TableOfContents class.
 *
 * DOCX TOC is implemented using complex field codes:
 * - TOC \o "1-6" - Include outline levels 1-6
 * - \h - Create hyperlinks
 * - \z - Hide page numbers in web layout
 * - \n - Omit page numbers
 * - \t - Include specific styles
 *
 * @module toc-handler
 */

import { TableOfContents, type TOCProperties } from '../docXMLater/src';
import type { ConversionContext, ConversionResult } from './element-handlers';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Options for TOC conversion from HTML
 */
export interface TOCConversionOptions extends TOCProperties {
  /** Whether to detect heading levels from HTML structure (default: true) */
  autoDetectLevels?: boolean;
  /** Minimum heading level to include (1-6, default: 1) */
  minLevel?: number;
  /** Maximum heading level to include (1-6, default: 6) */
  maxLevel?: number;
  /** CSS selector for TOC container (default: '[data-toc], .table-of-contents, nav.toc') */
  tocSelector?: string;
}

/**
 * Detected TOC structure from HTML
 */
export interface DetectedTOCStructure {
  /** TOC title if found */
  title?: string;
  /** Detected heading levels */
  levels: number;
  /** Whether entries appear to be hyperlinks */
  hasHyperlinks: boolean;
  /** Whether entries have page numbers */
  hasPageNumbers: boolean;
  /** Custom styles detected (e.g., from class names) */
  customStyles?: string[];
}

// ============================================================================
// Constants
// ============================================================================

/** Default TOC selectors */
const DEFAULT_TOC_SELECTORS = [
  '[data-toc]',
  '[data-slate-toc]',
  '.table-of-contents',
  '.toc',
  'nav.toc',
  '#toc',
  '#table-of-contents',
];

/** Default heading selectors for level detection */
const HEADING_SELECTORS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

// ============================================================================
// TOC Detection Utilities
// ============================================================================

/**
 * Checks if an element is a TOC container
 *
 * @param element - Element to check
 * @param customSelector - Optional custom selector
 * @returns True if element is a TOC container
 */
export function isTOCElement(
  element: Element,
  customSelector?: string
): boolean {
  const tagName = element.tagName.toLowerCase();

  // Check for explicit TOC data attribute
  if (
    element.hasAttribute('data-toc') ||
    element.hasAttribute('data-slate-toc')
  ) {
    return true;
  }

  // Check for TOC-related class names
  const className = element.className?.toLowerCase() || '';
  if (
    className.includes('table-of-contents') ||
    className.includes('toc') ||
    className.includes('contents')
  ) {
    return true;
  }

  // Check for TOC-related ID
  const id = element.id?.toLowerCase() || '';
  if (id === 'toc' || id === 'table-of-contents' || id === 'contents') {
    return true;
  }

  // Check custom selector if provided
  if (customSelector) {
    try {
      const parent = element.ownerDocument || element;
      const matches = (parent as Document).querySelectorAll?.(customSelector);
      if (matches) {
        for (let i = 0; i < matches.length; i++) {
          if (matches[i] === element) return true;
        }
      }
    } catch {
      // Invalid selector, ignore
    }
  }

  return false;
}

/**
 * Detects TOC structure from an HTML element
 *
 * Analyzes the TOC element to determine:
 * - Number of heading levels
 * - Whether entries are hyperlinks
 * - Whether page numbers are present
 *
 * @param element - TOC container element
 * @returns Detected TOC structure
 */
export function detectTOCStructure(element: Element): DetectedTOCStructure {
  const result: DetectedTOCStructure = {
    levels: 3, // Default to 3 levels
    hasHyperlinks: false,
    hasPageNumbers: false,
  };

  // Try to find TOC title
  const titleElement = element.querySelector(
    'h1, h2, h3, .toc-title, [data-toc-title]'
  );
  if (titleElement) {
    result.title = titleElement.textContent?.trim();
  }

  // Check for hyperlinks in TOC entries
  const links = element.querySelectorAll('a');
  result.hasHyperlinks = links.length > 0;

  // Detect levels by analyzing TOC item classes or nesting
  const tocItems = element.querySelectorAll('li, .toc-item, [data-toc-item]');
  let maxLevel = 0;

  tocItems.forEach((item) => {
    // Check for level class (e.g., toc-level-1, level-2)
    const className = item.className || '';
    const levelMatch = className.match(/(?:toc-)?level-?(\d)/i);
    if (levelMatch) {
      const level = Number.parseInt(levelMatch[1], 10);
      maxLevel = Math.max(maxLevel, level);
    }

    // Check for data-level attribute
    const dataLevel = item.getAttribute('data-level');
    if (dataLevel) {
      const level = Number.parseInt(dataLevel, 10);
      if (!isNaN(level)) {
        maxLevel = Math.max(maxLevel, level);
      }
    }

    // Check for nesting depth
    let depth = 0;
    let parent = item.parentElement;
    while (parent && parent !== element) {
      if (
        parent.tagName.toLowerCase() === 'ol' ||
        parent.tagName.toLowerCase() === 'ul'
      ) {
        depth++;
      }
      parent = parent.parentElement;
    }
    maxLevel = Math.max(maxLevel, depth);
  });

  if (maxLevel > 0) {
    result.levels = Math.min(maxLevel, 9);
  }

  // Check for page numbers (common patterns)
  const textContent = element.textContent || '';
  // Look for patterns like ".... 12" or "...12" or tab + number at end of lines
  result.hasPageNumbers = /\.\.\.\s*\d+|\t\d+$/.test(textContent);

  return result;
}

// ============================================================================
// TOC Creation
// ============================================================================

/**
 * Creates a TableOfContents object from options
 *
 * @param options - TOC conversion options
 * @returns TableOfContents instance
 */
export function createTOC(options: TOCConversionOptions = {}): TableOfContents {
  const {
    minLevel = 1,
    maxLevel = 6,
    title = 'Table of Contents',
    showPageNumbers = true,
    useHyperlinks = false,
    tabLeader = 'dot',
    ...restOptions
  } = options;

  // Calculate levels from min/max
  const levels = maxLevel - minLevel + 1;

  return new TableOfContents({
    title,
    levels: Math.min(levels, 9),
    showPageNumbers,
    useHyperlinks,
    tabLeader,
    ...restOptions,
  });
}

/**
 * Creates a TableOfContents from detected HTML structure
 *
 * @param structure - Detected TOC structure
 * @param options - Additional options
 * @returns TableOfContents instance
 */
export function createTOCFromStructure(
  structure: DetectedTOCStructure,
  options: Partial<TOCConversionOptions> = {}
): TableOfContents {
  return new TableOfContents({
    title: options.title ?? structure.title ?? 'Table of Contents',
    levels: structure.levels,
    showPageNumbers: options.showPageNumbers ?? structure.hasPageNumbers,
    useHyperlinks: options.useHyperlinks ?? structure.hasHyperlinks,
    includeStyles: structure.customStyles?.map((style, index) => ({
      styleName: style,
      level: index + 1,
    })),
  });
}

// ============================================================================
// Element Handler
// ============================================================================

/**
 * Handles Table of Contents elements
 *
 * This handler converts HTML TOC elements to DOCX TOC fields.
 * The DOCX TOC uses field codes that are updated by Word when
 * the document is opened.
 *
 * Supported HTML patterns:
 * - <nav class="toc"> or <div class="table-of-contents">
 * - <div data-toc> or <div data-slate-toc>
 * - Elements with id="toc" or id="table-of-contents"
 *
 * @param element - TOC HTML element
 * @param context - Conversion context
 * @param options - TOC conversion options
 * @returns Conversion result
 */
export function handleTOCElement(
  element: Element,
  context: ConversionContext,
  options: TOCConversionOptions = {}
): ConversionResult {
  // Verify this is a TOC element
  if (!isTOCElement(element, options.tocSelector)) {
    return {
      element: null,
      processChildren: true,
    };
  }

  // Detect TOC structure from HTML
  const structure =
    options.autoDetectLevels !== false
      ? detectTOCStructure(element)
      : {
          levels: options.levels ?? 3,
          hasHyperlinks: false,
          hasPageNumbers: true,
        };

  // Create TOC
  const toc = createTOCFromStructure(structure, options);

  // Get XML elements from TOC
  // Note: TableOfContents.toXML() returns an array of XMLElements
  // These need to be added to the document body

  return {
    element: null, // TOC is added directly to document, not as child element
    processChildren: false, // Don't process TOC children (they're placeholder content)
    childContext: {
      // Store TOC for later insertion into document
    },
  };
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Creates a standard TOC with typical settings
 *
 * @param title - Optional TOC title
 * @returns TableOfContents instance
 */
export function createStandardTOC(title?: string): TableOfContents {
  return TableOfContents.createStandard(title);
}

/**
 * Creates a simple TOC with fewer levels
 *
 * @param title - Optional TOC title
 * @returns TableOfContents instance
 */
export function createSimpleTOC(title?: string): TableOfContents {
  return TableOfContents.createSimple(title);
}

/**
 * Creates a detailed TOC with more levels
 *
 * @param title - Optional TOC title
 * @returns TableOfContents instance
 */
export function createDetailedTOC(title?: string): TableOfContents {
  return TableOfContents.createDetailed(title);
}

/**
 * Creates a hyperlinked TOC (for web documents)
 *
 * @param title - Optional TOC title
 * @returns TableOfContents instance
 */
export function createHyperlinkedTOC(title?: string): TableOfContents {
  return TableOfContents.createHyperlinked(title);
}

/**
 * Creates a TOC with specific heading levels
 *
 * @param minLevel - Minimum heading level (1-6)
 * @param maxLevel - Maximum heading level (1-6)
 * @param title - Optional TOC title
 * @returns TableOfContents instance
 */
export function createTOCWithLevels(
  minLevel: number,
  maxLevel: number,
  title?: string
): TableOfContents {
  // The TOC \o switch uses format "1-N"
  // For a range starting above 1, use custom styles
  if (minLevel === 1) {
    return new TableOfContents({
      title: title ?? 'Table of Contents',
      levels: maxLevel,
      showPageNumbers: true,
    });
  }

  // For ranges not starting at 1, use specific styles
  const styles: Array<{ styleName: string; level: number }> = [];
  for (let i = minLevel; i <= maxLevel; i++) {
    styles.push({ styleName: `Heading${i}`, level: i - minLevel + 1 });
  }

  return new TableOfContents({
    title: title ?? 'Table of Contents',
    includeStyles: styles,
    showPageNumbers: true,
  });
}

/**
 * Creates a TOC with custom styles
 *
 * @param styles - Array of style names to include
 * @param title - Optional TOC title
 * @returns TableOfContents instance
 */
export function createTOCWithStyles(
  styles: string[],
  title?: string
): TableOfContents {
  return TableOfContents.createWithStyles(styles, { title });
}

/**
 * Creates a TOC without page numbers
 *
 * Useful for web documents or when TOC is hyperlinked.
 *
 * @param title - Optional TOC title
 * @returns TableOfContents instance
 */
export function createTOCWithoutPageNumbers(title?: string): TableOfContents {
  return TableOfContents.createNoPageNumbers({
    title: title ?? 'Contents',
  });
}

// ============================================================================
// TOC Field Code Utilities
// ============================================================================

/**
 * Generates a raw TOC field code string
 *
 * Use this when you need direct control over the field instruction.
 *
 * @param options - TOC options
 * @returns Field instruction string (e.g., 'TOC \o "1-6" \h')
 */
export function generateTOCFieldCode(options: {
  levels?: number;
  useHyperlinks?: boolean;
  showPageNumbers?: boolean;
  hideInWebLayout?: boolean;
  customStyles?: Array<{ styleName: string; level: number }>;
}): string {
  let instruction = 'TOC';

  // Add specific styles OR heading levels
  if (options.customStyles && options.customStyles.length > 0) {
    for (const style of options.customStyles) {
      instruction += ` \\t "${style.styleName},${style.level},"`;
    }
  } else {
    instruction += ` \\o "1-${options.levels ?? 6}"`;
  }

  // Add switches
  if (options.useHyperlinks) {
    instruction += ' \\h';
  }

  if (options.showPageNumbers === false) {
    instruction += ' \\n';
  }

  if (options.hideInWebLayout) {
    instruction += ' \\z';
  }

  return instruction;
}

/**
 * Parses a TOC field code string
 *
 * @param fieldCode - TOC field instruction
 * @returns Parsed options
 */
export function parseTOCFieldCode(
  fieldCode: string
): Partial<TOCConversionOptions> {
  const options: Partial<TOCConversionOptions> = {};

  // Parse \o switch for outline levels
  const outlineMatch = fieldCode.match(/\\o\s+"(\d)-(\d)"/);
  if (outlineMatch) {
    options.minLevel = Number.parseInt(outlineMatch[1], 10);
    options.maxLevel = Number.parseInt(outlineMatch[2], 10);
    options.levels = options.maxLevel;
  }

  // Parse \h switch for hyperlinks
  options.useHyperlinks = /\\h\b/.test(fieldCode);

  // Parse \n switch for no page numbers
  options.showPageNumbers = !/\\n\b/.test(fieldCode);

  // Parse \z switch for hide in web layout
  options.hideInWebLayout = /\\z\b/.test(fieldCode);

  // Parse \t switch for custom styles
  const styleRegex = /\\t\s+"([^"]+)"/g;
  const customStyles: Array<{ styleName: string; level: number }> = [];
  let styleMatch: RegExpExecArray | null;
  while ((styleMatch = styleRegex.exec(fieldCode)) !== null) {
    const parts = styleMatch[1].split(',').filter(Boolean);
    if (parts.length >= 2) {
      customStyles.push({
        styleName: parts[0],
        level: Number.parseInt(parts[1], 10),
      });
    }
  }
  if (customStyles.length > 0) {
    options.includeStyles = customStyles;
  }

  return options;
}
