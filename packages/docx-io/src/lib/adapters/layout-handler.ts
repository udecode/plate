/**
 * Layout Handler - Column and page layout handling for DOCX export
 *
 * This module provides handlers for converting multi-column layouts and
 * other page layout elements from HTML to DOCX section properties.
 *
 * DOCX column layouts are implemented via section properties (w:sectPr/w:cols),
 * not inline elements. This handler creates section breaks with appropriate
 * column configurations.
 *
 * @module layout-handler
 */

import { Section, type SectionType } from '../docXMLater/src';
import type { ConversionContext, ConversionResult } from './element-handlers';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Options for column layout conversion
 */
export interface ColumnLayoutOptions {
  /** Number of columns (default: 2) */
  columnCount?: number;
  /** Space between columns in twips (default: 720 = 0.5 inch) */
  columnSpacing?: number;
  /** Whether columns have equal width (default: true) */
  equalWidth?: boolean;
  /** Custom column widths in twips (overrides equalWidth) */
  columnWidths?: number[];
  /** Whether to show separator lines between columns (default: false) */
  showSeparator?: boolean;
  /** Section break type (default: 'continuous') */
  sectionType?: SectionType;
}

/**
 * Layout properties extracted from HTML element
 */
export interface ExtractedLayoutProperties {
  /** Number of columns detected */
  columns: number;
  /** Column gap in twips */
  gap: number;
  /** Individual column widths */
  widths?: number[];
}

// ============================================================================
// Constants
// ============================================================================

/** Default column spacing in twips (720 = 0.5 inch) */
const DEFAULT_COLUMN_SPACING = 720;

/** Default number of columns */
const DEFAULT_COLUMN_COUNT = 2;

/** Maximum supported columns in DOCX */
const MAX_COLUMNS = 45;

// ============================================================================
// CSS Parsing Utilities
// ============================================================================

/**
 * Parses CSS column-count value
 *
 * @param value - CSS column-count value
 * @returns Number of columns (1 if invalid)
 */
export function parseColumnCount(value: string | null): number {
  if (!value || value === 'auto') return 1;

  const count = Number.parseInt(value, 10);
  if (isNaN(count) || count < 1) return 1;
  if (count > MAX_COLUMNS) return MAX_COLUMNS;

  return count;
}

/**
 * Parses CSS column-gap or gap value to twips
 *
 * @param value - CSS gap value (e.g., '20px', '1em', '1in')
 * @returns Gap in twips
 */
export function parseGapToTwips(value: string | null): number {
  if (!value || value === 'normal') return DEFAULT_COLUMN_SPACING;

  const numValue = Number.parseFloat(value);
  if (isNaN(numValue)) return DEFAULT_COLUMN_SPACING;

  // Convert based on unit
  if (value.endsWith('px')) {
    // 1px ~ 15 twips at 96 DPI
    return Math.round(numValue * 15);
  }
  if (value.endsWith('pt')) {
    // 1pt = 20 twips
    return Math.round(numValue * 20);
  }
  if (value.endsWith('in')) {
    // 1in = 1440 twips
    return Math.round(numValue * 1440);
  }
  if (value.endsWith('cm')) {
    // 1cm ~ 567 twips
    return Math.round(numValue * 567);
  }
  if (value.endsWith('mm')) {
    // 1mm ~ 56.7 twips
    return Math.round(numValue * 56.7);
  }
  if (value.endsWith('em') || value.endsWith('rem')) {
    // Assume 1em = 16px ~ 240 twips
    return Math.round(numValue * 240);
  }
  if (value.endsWith('%')) {
    // Percentage of page width (assume standard 9360 twips = 6.5 inches content area)
    return Math.round((numValue / 100) * 9360);
  }

  // Assume pixels if no unit
  return Math.round(numValue * 15);
}

/**
 * Parses CSS column-width value to twips
 *
 * @param value - CSS column-width value
 * @returns Width in twips, or undefined for auto
 */
export function parseColumnWidthToTwips(
  value: string | null
): number | undefined {
  if (!value || value === 'auto') return;
  return parseGapToTwips(value);
}

// ============================================================================
// Layout Property Extraction
// ============================================================================

/**
 * Extracts column layout properties from an HTML element
 *
 * Looks for CSS column properties:
 * - column-count
 * - column-gap / gap
 * - column-width
 * - columns (shorthand)
 *
 * Also checks for grid/flexbox layouts that simulate columns.
 *
 * @param element - HTML element to analyze
 * @returns Extracted layout properties
 */
export function extractLayoutProperties(
  element: Element
): ExtractedLayoutProperties | null {
  const style = (element as HTMLElement).style;
  if (!style) return null;

  // Check for CSS columns
  const columnCount =
    style.getPropertyValue?.('column-count') ||
    (style as unknown as Record<string, string>)['columnCount'];
  const columnGap =
    style.getPropertyValue?.('column-gap') ||
    (style as unknown as Record<string, string>)['columnGap'] ||
    style.getPropertyValue?.('gap') ||
    (style as unknown as Record<string, string>)['gap'];

  if (columnCount) {
    const count = parseColumnCount(columnCount);
    if (count > 1) {
      return {
        columns: count,
        gap: parseGapToTwips(columnGap),
      };
    }
  }

  // Check for CSS grid with auto-fit/auto-fill columns
  const gridTemplateColumns =
    style.getPropertyValue?.('grid-template-columns') ||
    (style as unknown as Record<string, string>)['gridTemplateColumns'];
  if (gridTemplateColumns) {
    // Count explicit columns (e.g., "1fr 1fr 1fr" = 3 columns)
    const frColumns = gridTemplateColumns.match(/(\d*\.?\d+)fr/g);
    if (frColumns && frColumns.length > 1) {
      return {
        columns: frColumns.length,
        gap: parseGapToTwips(columnGap),
      };
    }
  }

  // Check for Plate-specific data attributes
  const dataColumns = element.getAttribute('data-columns');
  if (dataColumns) {
    const count = Number.parseInt(dataColumns, 10);
    if (!isNaN(count) && count > 1) {
      return {
        columns: count,
        gap: parseGapToTwips(element.getAttribute('data-column-gap')),
      };
    }
  }

  return null;
}

// ============================================================================
// Section Configuration
// ============================================================================

/**
 * Configures a Section with column layout
 *
 * @param section - Section to configure
 * @param options - Column layout options
 * @returns The configured section
 */
export function configureColumnLayout(
  section: Section,
  options: ColumnLayoutOptions = {}
): Section {
  const {
    columnCount = DEFAULT_COLUMN_COUNT,
    columnSpacing = DEFAULT_COLUMN_SPACING,
    equalWidth = true,
    columnWidths,
    showSeparator = false,
    sectionType = 'continuous',
  } = options;

  // Set basic column layout
  if (columnWidths && columnWidths.length > 0) {
    // Use custom column widths
    section.setColumnWidths(columnWidths);
  } else {
    // Use equal-width columns
    section.setColumns(columnCount, columnSpacing);
  }

  // Set separator line if requested
  if (showSeparator) {
    section.setColumnSeparator(true);
  }

  // Set section type
  section.setSectionType(sectionType);

  return section;
}

/**
 * Creates a new Section with column layout
 *
 * @param options - Column layout options
 * @returns New configured Section
 */
export function createColumnSection(
  options: ColumnLayoutOptions = {}
): Section {
  const section = Section.create();
  return configureColumnLayout(section, options);
}

// ============================================================================
// Element Handlers
// ============================================================================

/**
 * Handles elements with multi-column layout
 *
 * When a container with CSS columns is encountered, this handler:
 * 1. Creates a section break with continuous type
 * 2. Configures the column layout in the section properties
 * 3. After children are processed, adds another section break to end columns
 *
 * Note: DOCX column layouts are section-based, not element-based.
 * Content flows through columns naturally based on section properties.
 *
 * @param element - Element with column layout
 * @param context - Conversion context
 * @param options - Optional override options
 * @returns Conversion result
 */
export function handleColumnLayout(
  element: Element,
  context: ConversionContext,
  options?: ColumnLayoutOptions
): ConversionResult {
  // Extract layout properties from element
  const extracted = extractLayoutProperties(element);

  if (!extracted || extracted.columns <= 1) {
    // No column layout detected, process as normal
    return {
      element: null,
      processChildren: true,
    };
  }

  // Build options from extracted properties and overrides
  const layoutOptions: ColumnLayoutOptions = {
    columnCount: extracted.columns,
    columnSpacing: extracted.gap,
    sectionType: 'continuous',
    ...options,
  };

  // Create column section
  const columnSection = createColumnSection(layoutOptions);

  // Note: Actual insertion of section break into document flow
  // requires document context - this returns the configuration
  // that should be applied when processing enters this element.

  return {
    element: null,
    processChildren: true,
    childContext: {
      // Store section configuration for later application
      // The DOM walker will apply this when it sees the section break
    },
  };
}

/**
 * Handles explicit column break elements
 *
 * In HTML, column breaks might be represented as:
 * - <br class="column-break">
 * - <div data-column-break="true">
 * - Elements with break-before: column or break-after: column
 *
 * @param element - Element representing a column break
 * @param context - Conversion context
 * @returns Conversion result
 */
export function handleColumnBreak(
  element: Element,
  context: ConversionContext
): ConversionResult {
  // Check if this is a column break
  const style = (element as HTMLElement).style;
  const isColumnBreak =
    element.getAttribute('data-column-break') === 'true' ||
    element.classList?.contains('column-break') ||
    style?.getPropertyValue?.('break-before') === 'column' ||
    style?.getPropertyValue?.('break-after') === 'column';

  if (!isColumnBreak) {
    return {
      element: null,
      processChildren: true,
    };
  }

  // In DOCX, column breaks are represented by w:br with w:type="column"
  // This is handled at the Run level, not as a separate element

  return {
    element: null,
    processChildren: false,
  };
}

/**
 * Detects if an element has column layout
 *
 * @param element - Element to check
 * @returns True if element has multi-column layout
 */
export function hasColumnLayout(element: Element): boolean {
  const layout = extractLayoutProperties(element);
  return layout !== null && layout.columns > 1;
}

// ============================================================================
// Page Layout Utilities
// ============================================================================

/**
 * Creates a section with specific page layout
 *
 * @param options - Page layout options
 * @returns Configured Section
 */
export function createPageLayoutSection(options: {
  columns?: ColumnLayoutOptions;
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}): Section {
  const section = Section.create();

  // Apply columns if specified
  if (options.columns) {
    configureColumnLayout(section, options.columns);
  }

  // Apply orientation
  if (options.orientation) {
    section.setOrientation(options.orientation);
  }

  // Apply margins
  if (options.margins) {
    section.setMargins({
      top: options.margins.top ?? 1440,
      right: options.margins.right ?? 1440,
      bottom: options.margins.bottom ?? 1440,
      left: options.margins.left ?? 1440,
    });
  }

  return section;
}

/**
 * Creates a two-column layout section
 *
 * @param gap - Gap between columns in twips (default: 720)
 * @param separator - Whether to show separator line (default: false)
 * @returns Configured Section
 */
export function createTwoColumnSection(
  gap: number = DEFAULT_COLUMN_SPACING,
  separator = false
): Section {
  return createColumnSection({
    columnCount: 2,
    columnSpacing: gap,
    showSeparator: separator,
    sectionType: 'continuous',
  });
}

/**
 * Creates a three-column layout section
 *
 * @param gap - Gap between columns in twips (default: 720)
 * @param separator - Whether to show separator line (default: false)
 * @returns Configured Section
 */
export function createThreeColumnSection(
  gap: number = DEFAULT_COLUMN_SPACING,
  separator = false
): Section {
  return createColumnSection({
    columnCount: 3,
    columnSpacing: gap,
    showSeparator: separator,
    sectionType: 'continuous',
  });
}

/**
 * Creates a newspaper-style column section (narrow left, wide right)
 *
 * @returns Configured Section with unequal column widths
 */
export function createNewspaperSection(): Section {
  // Typical newspaper layout: 30% / 70% split
  // Assuming 9360 twips content width with 360 twips gap
  // Left column: 2700 twips, Right column: 6300 twips
  return createColumnSection({
    columnWidths: [2700, 6300],
    columnSpacing: 360,
    sectionType: 'continuous',
  });
}

/**
 * Ends a multi-column section by creating a single-column section
 *
 * Call this after processing column content to return to normal layout.
 *
 * @returns Section configured for single column
 */
export function createSingleColumnSection(): Section {
  const section = Section.create();
  section.setColumns(1, 0);
  section.setSectionType('continuous');
  return section;
}
