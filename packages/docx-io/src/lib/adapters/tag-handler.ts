/**
 * Tag Handler - HTML tag elements to DOCX styled badge text conversion
 *
 * This module provides handlers for converting HTML tag elements to
 * docXMLater Run objects with badge styling (purple color, background shading).
 *
 * Detects:
 * - Elements with data-slate-tag attribute
 * - Elements with class containing 'tag'
 * - Elements with data-tag attribute
 *
 * @module tag-handler
 */

import { Run, type RunFormatting } from '../docXMLater/src';
import type { ConversionContext, ConversionResult } from './element-handlers';

// ============================================================================
// Constants
// ============================================================================

/** Default tag text color (purple) */
export const TAG_COLOR = '7C3AED';

/** Default tag background color (light purple/lavender) */
export const TAG_BACKGROUND = 'EDE9FE';

/** Tag prefix character */
export const TAG_PREFIX = '#';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Options for tag conversion
 */
export interface TagConversionOptions {
  /** Custom tag color (hex without #) */
  color?: string;
  /** Custom background color (hex without #) */
  backgroundColor?: string;
  /** Whether to apply background shading (default: true) */
  applyBackground?: boolean;
  /** Custom prefix (default: #) */
  prefix?: string;
  /** Whether to include prefix in output (default: true) */
  includePrefix?: boolean;
  /** Whether to apply bold formatting (default: false) */
  bold?: boolean;
}

/**
 * Parsed tag data
 */
export interface ParsedTag {
  /** The tag value */
  value: string;
  /** Tag category (if any) */
  category?: string;
  /** Original element text */
  displayText: string;
  /** Additional data attributes */
  data?: Record<string, string>;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Detects if an element is a tag element
 *
 * @param element - Element to check
 * @returns True if element is a tag
 */
export function isTagElement(element: Element): boolean {
  // Check for data-slate-tag attribute
  if (element.hasAttribute('data-slate-tag')) {
    return true;
  }

  // Check for data-tag attribute
  if (element.hasAttribute('data-tag')) {
    return true;
  }

  // Check for tag class
  const className = element.className || '';
  if (
    typeof className === 'string' &&
    className.toLowerCase().includes('tag')
  ) {
    // Exclude common false positives
    if (className.includes('textarea') || className.includes('image')) {
      return false;
    }
    return true;
  }

  // Check for data-slate-type="tag"
  const slateType = element.getAttribute('data-slate-type');
  if (slateType === 'tag') {
    return true;
  }

  return false;
}

/**
 * Extracts tag data from an element
 *
 * @param element - The tag element
 * @returns Parsed tag data
 */
export function extractTagData(element: Element): ParsedTag {
  const displayText = element.textContent?.trim() || '';

  // Extract value from attributes
  const value =
    element.getAttribute('data-tag-value') ||
    element.getAttribute('data-slate-value') ||
    element.getAttribute('data-tag') ||
    element.getAttribute('data-value') ||
    displayText.replace(/^#/, '');

  // Extract tag category
  const category =
    element.getAttribute('data-tag-category') ||
    element.getAttribute('data-category') ||
    undefined;

  // Collect additional data attributes
  const data: Record<string, string> = {};
  for (const attr of Array.from(element.attributes)) {
    if (attr.name.startsWith('data-')) {
      data[attr.name] = attr.value;
    }
  }

  return {
    value,
    category,
    displayText,
    data,
  };
}

// ============================================================================
// Tag Handlers
// ============================================================================

/**
 * Handles tag elements
 *
 * Creates a styled Run with # prefix and purple color with background shading.
 *
 * @param element - The tag element
 * @param context - Conversion context
 * @param options - Conversion options
 * @returns Conversion result with styled Run
 *
 * @example
 * ```typescript
 * // HTML: <span data-slate-tag="priority" data-tag-value="urgent">#urgent</span>
 * const result = handleTagElement(element, context);
 * // Creates a purple Run with lavender background containing "#urgent"
 * ```
 */
export function handleTagElement(
  element: Element,
  context: ConversionContext,
  options: TagConversionOptions = {}
): ConversionResult {
  const {
    color = TAG_COLOR,
    backgroundColor = TAG_BACKGROUND,
    applyBackground = true,
    prefix = TAG_PREFIX,
    includePrefix = true,
    bold = false,
  } = options;

  // Extract tag data
  const tagData = extractTagData(element);

  // Determine display text
  let text = tagData.displayText;

  // Add prefix if not already present and includePrefix is true
  if (includePrefix && !text.startsWith(prefix)) {
    text = prefix + text;
  }

  // Build formatting
  const formatting: RunFormatting = {
    color,
    bold,
    ...(context.inheritedFormatting || {}),
  };

  // Add background shading if enabled
  if (applyBackground) {
    formatting.shading = {
      fill: backgroundColor,
    };
  }

  // Create styled run
  const run = new Run(text, formatting);

  return {
    element: run as unknown as ConversionResult['element'],
    processChildren: false,
  };
}

/**
 * Creates a tag Run directly
 *
 * @param value - Tag value
 * @param options - Conversion options
 * @returns Styled Run
 *
 * @example
 * ```typescript
 * const tagRun = createTag('urgent');
 * paragraph.addRun(tagRun);
 * ```
 */
export function createTag(
  value: string,
  options: TagConversionOptions = {}
): Run {
  const {
    color = TAG_COLOR,
    backgroundColor = TAG_BACKGROUND,
    applyBackground = true,
    prefix = TAG_PREFIX,
    includePrefix = true,
    bold = false,
  } = options;

  // Build display text
  const text = includePrefix ? `${prefix}${value}` : value;

  // Build formatting
  const formatting: RunFormatting = {
    color,
    bold,
  };

  // Add background shading if enabled
  if (applyBackground) {
    formatting.shading = {
      fill: backgroundColor,
    };
  }

  return new Run(text, formatting);
}

/**
 * Creates a priority tag
 *
 * @param priority - Priority level (high, medium, low)
 * @param options - Additional options
 * @returns Styled Run with priority-specific colors
 */
export function createPriorityTag(
  priority: 'high' | 'medium' | 'low',
  options?: Omit<TagConversionOptions, 'color' | 'backgroundColor'>
): Run {
  const priorityColors: Record<string, { color: string; background: string }> =
    {
      high: { color: 'DC2626', background: 'FEE2E2' }, // Red
      medium: { color: 'D97706', background: 'FEF3C7' }, // Yellow/Orange
      low: { color: '059669', background: 'D1FAE5' }, // Green
    };

  const colors = priorityColors[priority] || priorityColors.medium;

  return createTag(priority, {
    ...options,
    color: colors.color,
    backgroundColor: colors.background,
  });
}

/**
 * Creates a status tag
 *
 * @param status - Status value
 * @param options - Additional options
 * @returns Styled Run
 */
export function createStatusTag(
  status: string,
  options?: TagConversionOptions
): Run {
  return createTag(status, {
    prefix: '',
    includePrefix: false,
    ...options,
  });
}
