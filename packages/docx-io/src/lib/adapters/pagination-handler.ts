/**
 * Pagination Handler - Page break and page settings handling for DOCX export
 *
 * This module provides handlers for converting page break elements and CSS
 * page break properties from HTML to DOCX pagination controls.
 *
 * DOCX page breaks are implemented in two ways:
 * 1. Paragraph-level: pageBreakBefore property in w:pPr
 * 2. Run-level: w:br with w:type="page" inside a run
 *
 * This handler supports:
 * - CSS page-break-before/page-break-after properties
 * - data-page-break attributes
 * - Explicit page break elements
 * - Page margins and size from DocumentSettings
 *
 * @module pagination-handler
 */

import {
  Section,
  Paragraph,
  Run,
  PAGE_SIZES,
  inchesToTwips,
  type Margins,
  type PageSize,
  type PageOrientation,
  type SectionType,
} from '../docXMLater/src';
import type { ConversionContext, ConversionResult } from './element-handlers';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Page break type
 */
export type PageBreakType = 'page' | 'column' | 'avoid';

/**
 * Options for pagination handling
 */
export interface PaginationOptions {
  /** Default page size */
  pageSize?: 'letter' | 'a4' | 'legal' | PageSize;
  /** Default page orientation */
  orientation?: PageOrientation;
  /** Default page margins in twips */
  margins?: Partial<Margins>;
  /** Whether to honor CSS page-break properties */
  honorCssPageBreaks?: boolean;
}

/**
 * Extracted pagination properties from an element
 */
export interface ExtractedPaginationProperties {
  /** Page break before the element */
  pageBreakBefore?: boolean;
  /** Page break after the element */
  pageBreakAfter?: boolean;
  /** Avoid page break inside the element */
  pageBreakInside?: 'avoid' | 'auto';
  /** Column break before */
  columnBreakBefore?: boolean;
  /** Column break after */
  columnBreakAfter?: boolean;
}

/**
 * Document settings for page layout
 */
export interface DocumentSettings {
  /** Page size preset or custom dimensions */
  pageSize?: 'letter' | 'a4' | 'legal' | PageSize;
  /** Page orientation */
  orientation?: PageOrientation;
  /** Page margins in twips */
  margins?: Partial<Margins>;
  /** Header distance from top in twips */
  headerDistance?: number;
  /** Footer distance from bottom in twips */
  footerDistance?: number;
  /** Gutter margin in twips (for binding) */
  gutter?: number;
}

// ============================================================================
// Constants
// ============================================================================

/** Default margins (1 inch all around) */
const DEFAULT_MARGINS: Margins = {
  top: inchesToTwips(1),
  right: inchesToTwips(1),
  bottom: inchesToTwips(1),
  left: inchesToTwips(1),
  header: inchesToTwips(0.5),
  footer: inchesToTwips(0.5),
};

/** CSS page-break values that trigger a break */
const PAGE_BREAK_VALUES = ['always', 'page', 'left', 'right', 'recto', 'verso'];

/** CSS page-break-inside values that prevent breaks */
const AVOID_BREAK_VALUES = ['avoid', 'avoid-page', 'avoid-column'];

// ============================================================================
// CSS Parsing Utilities
// ============================================================================

/**
 * Parses CSS page-break-before/after property value
 *
 * @param value - CSS page-break value
 * @returns Whether a page break should occur
 */
export function parsePageBreakValue(value: string | null): boolean {
  if (!value) return false;
  const normalized = value.toLowerCase().trim();
  return PAGE_BREAK_VALUES.includes(normalized);
}

/**
 * Parses CSS page-break-inside property value
 *
 * @param value - CSS page-break-inside value
 * @returns 'avoid' if breaks should be avoided, 'auto' otherwise
 */
export function parsePageBreakInsideValue(
  value: string | null
): 'avoid' | 'auto' {
  if (!value) return 'auto';
  const normalized = value.toLowerCase().trim();
  return AVOID_BREAK_VALUES.includes(normalized) ? 'avoid' : 'auto';
}

/**
 * Parses CSS break-before/break-after property values (modern syntax)
 *
 * @param value - CSS break-* value
 * @returns Object with page and column break indicators
 */
export function parseBreakValue(value: string | null): {
  page: boolean;
  column: boolean;
} {
  if (!value) return { page: false, column: false };
  const normalized = value.toLowerCase().trim();

  return {
    page: ['page', 'always', 'left', 'right', 'recto', 'verso'].includes(
      normalized
    ),
    column: normalized === 'column',
  };
}

// ============================================================================
// Property Extraction
// ============================================================================

/**
 * Extracts pagination properties from an HTML element
 *
 * Checks for:
 * - CSS page-break-before/after/inside properties
 * - CSS break-before/after/inside properties (modern syntax)
 * - data-page-break attribute
 * - Class names like 'page-break', 'page-break-before'
 *
 * @param element - HTML element to analyze
 * @returns Extracted pagination properties
 */
export function extractPaginationProperties(
  element: Element
): ExtractedPaginationProperties {
  const props: ExtractedPaginationProperties = {};

  // Get computed style if available
  const style = (element as HTMLElement).style;

  if (style) {
    // Check legacy page-break-* properties
    const pageBreakBefore =
      style.getPropertyValue?.('page-break-before') ||
      (style as unknown as Record<string, string>)['pageBreakBefore'];
    const pageBreakAfter =
      style.getPropertyValue?.('page-break-after') ||
      (style as unknown as Record<string, string>)['pageBreakAfter'];
    const pageBreakInside =
      style.getPropertyValue?.('page-break-inside') ||
      (style as unknown as Record<string, string>)['pageBreakInside'];

    // Check modern break-* properties
    const breakBefore =
      style.getPropertyValue?.('break-before') ||
      (style as unknown as Record<string, string>)['breakBefore'];
    const breakAfter =
      style.getPropertyValue?.('break-after') ||
      (style as unknown as Record<string, string>)['breakAfter'];
    const breakInside =
      style.getPropertyValue?.('break-inside') ||
      (style as unknown as Record<string, string>)['breakInside'];

    // Parse legacy properties
    if (pageBreakBefore && parsePageBreakValue(pageBreakBefore)) {
      props.pageBreakBefore = true;
    }
    if (pageBreakAfter && parsePageBreakValue(pageBreakAfter)) {
      props.pageBreakAfter = true;
    }
    if (pageBreakInside) {
      props.pageBreakInside = parsePageBreakInsideValue(pageBreakInside);
    }

    // Parse modern break-* properties (take precedence)
    if (breakBefore) {
      const parsed = parseBreakValue(breakBefore);
      if (parsed.page) props.pageBreakBefore = true;
      if (parsed.column) props.columnBreakBefore = true;
    }
    if (breakAfter) {
      const parsed = parseBreakValue(breakAfter);
      if (parsed.page) props.pageBreakAfter = true;
      if (parsed.column) props.columnBreakAfter = true;
    }
    if (breakInside) {
      const insideValue = parsePageBreakInsideValue(breakInside);
      if (insideValue === 'avoid') {
        props.pageBreakInside = 'avoid';
      }
    }
  }

  // Check data attributes
  const dataPageBreak = element.getAttribute('data-page-break');
  if (dataPageBreak) {
    const normalized = dataPageBreak.toLowerCase();
    if (normalized === 'before' || normalized === 'true') {
      props.pageBreakBefore = true;
    } else if (normalized === 'after') {
      props.pageBreakAfter = true;
    } else if (normalized === 'both') {
      props.pageBreakBefore = true;
      props.pageBreakAfter = true;
    }
  }

  const dataColumnBreak = element.getAttribute('data-column-break');
  if (dataColumnBreak) {
    const normalized = dataColumnBreak.toLowerCase();
    if (normalized === 'before' || normalized === 'true') {
      props.columnBreakBefore = true;
    } else if (normalized === 'after') {
      props.columnBreakAfter = true;
    }
  }

  // Check class names
  const classList = element.classList;
  if (classList) {
    if (
      classList.contains('page-break') ||
      classList.contains('page-break-before')
    ) {
      props.pageBreakBefore = true;
    }
    if (classList.contains('page-break-after')) {
      props.pageBreakAfter = true;
    }
    if (
      classList.contains('keep-together') ||
      classList.contains('no-page-break')
    ) {
      props.pageBreakInside = 'avoid';
    }
    if (
      classList.contains('column-break') ||
      classList.contains('column-break-before')
    ) {
      props.columnBreakBefore = true;
    }
    if (classList.contains('column-break-after')) {
      props.columnBreakAfter = true;
    }
  }

  return props;
}

/**
 * Checks if an element represents an explicit page break
 *
 * @param element - HTML element to check
 * @returns True if the element is a page break marker
 */
export function isPageBreakElement(element: Element): boolean {
  const tagName = element.tagName?.toLowerCase();

  // Check for HR with page-break class or data attribute
  if (
    tagName === 'hr' &&
    (element.classList?.contains('page-break') ||
      element.getAttribute('data-page-break') === 'true')
  ) {
    return true;
  }

  // Check for DIV/SPAN with page-break marker
  if (
    (tagName === 'div' || tagName === 'span') &&
    (element.getAttribute('data-slate-type') === 'page-break' ||
      element.getAttribute('data-type') === 'page-break' ||
      element.classList?.contains('page-break-element') ||
      element.classList?.contains('page-break-marker'))
  ) {
    return true;
  }

  // Check for explicit page break element
  if (tagName === 'pagebreak' || tagName === 'page-break') {
    return true;
  }

  return false;
}

/**
 * Checks if an element represents an explicit column break
 *
 * @param element - HTML element to check
 * @returns True if the element is a column break marker
 */
export function isColumnBreakElement(element: Element): boolean {
  const tagName = element.tagName?.toLowerCase();

  // Check for BR with column break class or type
  if (
    tagName === 'br' &&
    (element.classList?.contains('column-break') ||
      element.getAttribute('data-break-type') === 'column')
  ) {
    return true;
  }

  // Check for DIV/SPAN with column-break marker
  if (
    (tagName === 'div' || tagName === 'span') &&
    (element.getAttribute('data-type') === 'column-break' ||
      element.classList?.contains('column-break-element'))
  ) {
    return true;
  }

  return false;
}

// ============================================================================
// Page Settings Resolution
// ============================================================================

/**
 * Resolves page size from preset or custom dimensions
 *
 * @param pageSize - Page size preset or custom dimensions
 * @param orientation - Page orientation
 * @returns Resolved PageSize object
 */
export function resolvePageSize(
  pageSize: 'letter' | 'a4' | 'legal' | PageSize | undefined,
  orientation?: PageOrientation
): PageSize {
  let size: PageSize;

  if (!pageSize) {
    // Default to Letter size
    size = { ...PAGE_SIZES.LETTER };
  } else if (typeof pageSize === 'string') {
    // Preset page size
    switch (pageSize.toLowerCase()) {
      case 'letter':
        size = { ...PAGE_SIZES.LETTER };
        break;
      case 'a4':
        size = { ...PAGE_SIZES.A4 };
        break;
      case 'legal':
        size = { ...PAGE_SIZES.LEGAL };
        break;
      default:
        size = { ...PAGE_SIZES.LETTER };
    }
  } else {
    // Custom dimensions
    size = { ...pageSize };
  }

  // Apply orientation
  if (orientation === 'landscape' && size.width < size.height) {
    const temp = size.width;
    size.width = size.height;
    size.height = temp;
    size.orientation = 'landscape';
  } else if (orientation === 'portrait' && size.width > size.height) {
    const temp = size.width;
    size.width = size.height;
    size.height = temp;
    size.orientation = 'portrait';
  }

  return size;
}

/**
 * Resolves margins from partial configuration
 *
 * @param margins - Partial margin configuration
 * @returns Complete Margins object
 */
export function resolveMargins(margins?: Partial<Margins>): Margins {
  return {
    ...DEFAULT_MARGINS,
    ...margins,
  };
}

// ============================================================================
// Paragraph Configuration
// ============================================================================

/**
 * Applies pagination properties to a paragraph
 *
 * @param paragraph - Paragraph to configure
 * @param props - Pagination properties to apply
 * @returns The configured paragraph
 */
export function applyPaginationToParagraph(
  paragraph: Paragraph,
  props: ExtractedPaginationProperties
): Paragraph {
  // Apply page break before
  if (props.pageBreakBefore) {
    paragraph.setPageBreakBefore(true);
  }

  // Apply keep-together for avoid page break inside
  if (props.pageBreakInside === 'avoid') {
    paragraph.setKeepLines(true);
    paragraph.setKeepNext(true);
  }

  return paragraph;
}

/**
 * Creates a page break run
 *
 * In DOCX, page breaks can be represented as:
 * <w:r><w:br w:type="page"/></w:r>
 *
 * @returns Run containing a page break
 */
export function createPageBreakRun(): Run {
  const run = Run.create('');
  run.addBreak('page');
  return run;
}

/**
 * Creates a column break run
 *
 * @returns Run containing a column break
 */
export function createColumnBreakRun(): Run {
  const run = Run.create('');
  run.addBreak('column');
  return run;
}

/**
 * Creates a paragraph with a page break
 *
 * @returns Paragraph containing only a page break run
 */
export function createPageBreakParagraph(): Paragraph {
  const paragraph = new Paragraph();
  paragraph.addRun(createPageBreakRun());
  return paragraph;
}

// ============================================================================
// Section Configuration
// ============================================================================

/**
 * Configures a section with document settings
 *
 * @param section - Section to configure
 * @param settings - Document settings to apply
 * @returns The configured section
 */
export function configureSectionFromSettings(
  section: Section,
  settings: DocumentSettings
): Section {
  // Apply page size
  const pageSize = resolvePageSize(settings.pageSize, settings.orientation);
  section.setPageSize(pageSize.width, pageSize.height, pageSize.orientation);

  // Apply margins
  const margins = resolveMargins(settings.margins);
  if (settings.headerDistance !== undefined) {
    margins.header = settings.headerDistance;
  }
  if (settings.footerDistance !== undefined) {
    margins.footer = settings.footerDistance;
  }
  if (settings.gutter !== undefined) {
    margins.gutter = settings.gutter;
  }
  section.setMargins(margins);

  return section;
}

/**
 * Creates a new section with document settings
 *
 * @param settings - Document settings to apply
 * @param sectionType - Type of section break
 * @returns New configured Section
 */
export function createSectionFromSettings(
  settings: DocumentSettings,
  sectionType: SectionType = 'nextPage'
): Section {
  const section = Section.create();
  configureSectionFromSettings(section, settings);
  section.setSectionType(sectionType);
  return section;
}

// ============================================================================
// Element Handlers
// ============================================================================

/**
 * Handles elements with page break properties
 *
 * When an element with CSS page-break-before is encountered:
 * 1. Sets pageBreakBefore on the resulting paragraph
 * 2. Optionally creates a section break for different page settings
 *
 * @param element - Element with page break properties
 * @param context - Conversion context
 * @param options - Pagination options
 * @returns Conversion result
 */
export function handlePaginationElement(
  element: Element,
  context: ConversionContext,
  options?: PaginationOptions
): ConversionResult {
  // Check if this is an explicit page break element
  if (isPageBreakElement(element)) {
    return handleExplicitPageBreak(element, context);
  }

  // Check if this is an explicit column break element
  if (isColumnBreakElement(element)) {
    return handleExplicitColumnBreak(element, context);
  }

  // Extract pagination properties from element styles
  const paginationProps = extractPaginationProperties(element);

  // If no pagination properties, process normally
  if (
    !paginationProps.pageBreakBefore &&
    !paginationProps.pageBreakAfter &&
    !paginationProps.pageBreakInside &&
    !paginationProps.columnBreakBefore &&
    !paginationProps.columnBreakAfter
  ) {
    return {
      element: null,
      processChildren: true,
    };
  }

  // Process children with pagination awareness
  // The pagination properties are applied to any paragraphs created within this element
  return {
    element: null,
    processChildren: true,
  };
}

/**
 * Handles explicit page break elements
 *
 * @param element - Page break element
 * @param context - Conversion context
 * @returns Conversion result
 */
export function handleExplicitPageBreak(
  element: Element,
  context: ConversionContext
): ConversionResult {
  // Create a paragraph with just a page break
  const paragraph = createPageBreakParagraph();

  // Add to document if available
  if (context.document) {
    // The document will handle adding the paragraph
    // We just return the element for the caller to handle
  }

  return {
    element: paragraph,
    processChildren: false,
  };
}

/**
 * Handles explicit column break elements
 *
 * @param element - Column break element
 * @param context - Conversion context
 * @returns Conversion result
 */
export function handleExplicitColumnBreak(
  element: Element,
  context: ConversionContext
): ConversionResult {
  // Create a paragraph with just a column break
  const paragraph = new Paragraph();
  paragraph.addRun(createColumnBreakRun());

  return {
    element: paragraph,
    processChildren: false,
  };
}

/**
 * Detects if an element has pagination-related styles
 *
 * @param element - Element to check
 * @returns True if element has page break styles
 */
export function hasPaginationStyles(element: Element): boolean {
  const props = extractPaginationProperties(element);
  return !!(
    props.pageBreakBefore ||
    props.pageBreakAfter ||
    props.pageBreakInside === 'avoid' ||
    props.columnBreakBefore ||
    props.columnBreakAfter
  );
}

// ============================================================================
// Page Layout Presets
// ============================================================================

/**
 * Creates settings for a standard letter-sized document
 *
 * @param orientation - Page orientation (default: portrait)
 * @returns Document settings
 */
export function createLetterSettings(
  orientation: PageOrientation = 'portrait'
): DocumentSettings {
  return {
    pageSize: 'letter',
    orientation,
    margins: {
      top: inchesToTwips(1),
      right: inchesToTwips(1),
      bottom: inchesToTwips(1),
      left: inchesToTwips(1),
    },
  };
}

/**
 * Creates settings for an A4-sized document
 *
 * @param orientation - Page orientation (default: portrait)
 * @returns Document settings
 */
export function createA4Settings(
  orientation: PageOrientation = 'portrait'
): DocumentSettings {
  return {
    pageSize: 'a4',
    orientation,
    margins: {
      top: inchesToTwips(1),
      right: inchesToTwips(1),
      bottom: inchesToTwips(1),
      left: inchesToTwips(1),
    },
  };
}

/**
 * Creates settings for a legal-sized document
 *
 * @param orientation - Page orientation (default: portrait)
 * @returns Document settings
 */
export function createLegalSettings(
  orientation: PageOrientation = 'portrait'
): DocumentSettings {
  return {
    pageSize: 'legal',
    orientation,
    margins: {
      top: inchesToTwips(1),
      right: inchesToTwips(1),
      bottom: inchesToTwips(1),
      left: inchesToTwips(1),
    },
  };
}

/**
 * Creates settings for a narrow-margin document
 *
 * @param pageSize - Page size preset
 * @param orientation - Page orientation
 * @returns Document settings with narrow margins
 */
export function createNarrowSettings(
  pageSize: 'letter' | 'a4' | 'legal' = 'letter',
  orientation: PageOrientation = 'portrait'
): DocumentSettings {
  return {
    pageSize,
    orientation,
    margins: {
      top: inchesToTwips(0.5),
      right: inchesToTwips(0.5),
      bottom: inchesToTwips(0.5),
      left: inchesToTwips(0.5),
    },
  };
}

/**
 * Creates settings for a wide-margin document
 *
 * @param pageSize - Page size preset
 * @param orientation - Page orientation
 * @returns Document settings with wide margins
 */
export function createWideSettings(
  pageSize: 'letter' | 'a4' | 'legal' = 'letter',
  orientation: PageOrientation = 'portrait'
): DocumentSettings {
  return {
    pageSize,
    orientation,
    margins: {
      top: inchesToTwips(1.5),
      right: inchesToTwips(1.5),
      bottom: inchesToTwips(1.5),
      left: inchesToTwips(1.5),
    },
  };
}
