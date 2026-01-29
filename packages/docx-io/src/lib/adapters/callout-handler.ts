/**
 * Callout Handler - HTML callout/alert elements to DOCX styled paragraphs
 *
 * This module provides handlers for converting HTML callout/alert elements to
 * docXMLater Paragraphs with appropriate styling and coloring based on variant.
 *
 * Supports:
 * - Info, warning, error, success callout variants
 * - Color-coded left borders
 * - Optional emoji/icon prefixes
 * - Background shading
 *
 * @module callout-handler
 */

import { Paragraph, Run } from '../docXMLater/src';
import type { ConversionContext, ConversionResult } from './element-handlers';

// ============================================================================
// Constants
// ============================================================================

/** Callout variant types */
export type CalloutVariant =
  | 'info'
  | 'warning'
  | 'error'
  | 'success'
  | 'note'
  | 'tip'
  | 'caution'
  | 'important';

/** Default color mappings for callout variants */
export const CALLOUT_COLORS: Record<
  CalloutVariant,
  { border: string; background: string; text: string }
> = {
  info: {
    border: '2196F3', // Blue
    background: 'E3F2FD',
    text: '1565C0',
  },
  warning: {
    border: 'FF9800', // Orange
    background: 'FFF3E0',
    text: 'E65100',
  },
  error: {
    border: 'F44336', // Red
    background: 'FFEBEE',
    text: 'C62828',
  },
  success: {
    border: '4CAF50', // Green
    background: 'E8F5E9',
    text: '2E7D32',
  },
  note: {
    border: '9E9E9E', // Gray
    background: 'F5F5F5',
    text: '424242',
  },
  tip: {
    border: '4CAF50', // Green (same as success)
    background: 'E8F5E9',
    text: '2E7D32',
  },
  caution: {
    border: 'FF9800', // Orange (same as warning)
    background: 'FFF3E0',
    text: 'E65100',
  },
  important: {
    border: '9C27B0', // Purple
    background: 'F3E5F5',
    text: '6A1B9A',
  },
};

/** Default emoji/icon prefixes for callout variants */
export const CALLOUT_ICONS: Record<CalloutVariant, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  error: '❌',
  success: '✅',
  note: '📝',
  tip: '💡',
  caution: '⚠️',
  important: '❗',
};

/** Default left indentation for callouts in twips (720 = 0.5 inch) */
export const CALLOUT_INDENT = 720;

/** Default left border width in eighths of a point (24 = 3pt) */
export const CALLOUT_BORDER_WIDTH = 24;

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Options for callout conversion
 */
export interface CalloutConversionOptions {
  /** Whether to include emoji/icon prefix (default: true) */
  includeIcon?: boolean;
  /** Custom icon overrides per variant */
  customIcons?: Partial<Record<CalloutVariant, string>>;
  /** Custom color overrides per variant */
  customColors?: Partial<
    Record<CalloutVariant, { border: string; background: string; text: string }>
  >;
  /** Left indentation in twips (default: 720) */
  leftIndent?: number;
  /** Border width in eighths of a point (default: 24) */
  borderWidth?: number;
  /** Whether to apply background shading (default: true) */
  applyShading?: boolean;
  /** Default variant when not specified (default: 'note') */
  defaultVariant?: CalloutVariant;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extracts callout variant from element attributes or classes
 *
 * @param element - The callout element
 * @returns Detected variant or null
 */
export function extractCalloutVariant(element: Element): CalloutVariant | null {
  // Check data attribute
  const dataVariant = element.getAttribute('data-variant');
  if (dataVariant && isValidVariant(dataVariant)) {
    return dataVariant as CalloutVariant;
  }

  // Check data-type attribute
  const dataType = element.getAttribute('data-type');
  if (dataType && isValidVariant(dataType)) {
    return dataType as CalloutVariant;
  }

  // Check class names
  const className = element.className || '';
  const classes = className.toLowerCase().split(/\s+/);

  for (const cls of classes) {
    // Check direct variant name
    if (isValidVariant(cls)) {
      return cls as CalloutVariant;
    }
    // Check prefixed variants (e.g., 'callout-info', 'alert-warning')
    for (const variant of Object.keys(CALLOUT_COLORS)) {
      if (cls.includes(variant)) {
        return variant as CalloutVariant;
      }
    }
  }

  return null;
}

/**
 * Checks if a string is a valid callout variant
 */
function isValidVariant(value: string): boolean {
  return Object.keys(CALLOUT_COLORS).includes(value.toLowerCase());
}

/**
 * Gets colors for a callout variant
 *
 * @param variant - The callout variant
 * @param customColors - Optional custom color overrides
 * @returns Color configuration
 */
export function getCalloutColors(
  variant: CalloutVariant,
  customColors?: CalloutConversionOptions['customColors']
): { border: string; background: string; text: string } {
  const customVariantColors = customColors?.[variant];
  if (customVariantColors) {
    return customVariantColors;
  }
  return CALLOUT_COLORS[variant] || CALLOUT_COLORS.note;
}

/**
 * Gets icon for a callout variant
 *
 * @param variant - The callout variant
 * @param customIcons - Optional custom icon overrides
 * @returns Icon string
 */
export function getCalloutIcon(
  variant: CalloutVariant,
  customIcons?: CalloutConversionOptions['customIcons']
): string {
  const customIcon = customIcons?.[variant];
  if (customIcon) {
    return customIcon;
  }
  return CALLOUT_ICONS[variant] || CALLOUT_ICONS.note;
}

// ============================================================================
// Callout Handlers
// ============================================================================

/**
 * Handles callout/alert elements
 *
 * Creates a paragraph with left border, background shading, and optional icon
 * based on the callout variant.
 *
 * Looks for callout elements with:
 * - data-variant attribute
 * - data-type attribute
 * - Class names containing variant (e.g., 'callout-info', 'alert-warning')
 *
 * @param element - The callout element
 * @param context - Conversion context
 * @param options - Callout conversion options
 * @returns Conversion result with styled Paragraph
 *
 * @example
 * ```typescript
 * // <div class="callout-warning" data-variant="warning">
 * //   <p>This is a warning message</p>
 * // </div>
 * const result = handleCalloutElement(calloutElement, context);
 * ```
 */
export function handleCalloutElement(
  element: Element,
  context: ConversionContext,
  options: CalloutConversionOptions = {}
): ConversionResult {
  const {
    includeIcon = true,
    customIcons,
    customColors,
    leftIndent = CALLOUT_INDENT,
    borderWidth = CALLOUT_BORDER_WIDTH,
    applyShading = true,
    defaultVariant = 'note',
  } = options;

  // Detect variant
  const variant = extractCalloutVariant(element) || defaultVariant;
  const colors = getCalloutColors(variant, customColors);

  // Create paragraph
  const paragraph = new Paragraph();

  // Set indentation
  paragraph.setLeftIndent(leftIndent);

  // Set left border for callout styling
  paragraph.setBorder({
    left: {
      style: 'single',
      size: borderWidth,
      color: colors.border,
      space: 8, // 8 points spacing from border
    },
  });

  // Apply background shading
  if (applyShading) {
    paragraph.setShading({
      fill: colors.background,
      val: 'clear',
    });
  }

  // Add icon prefix if enabled
  if (includeIcon) {
    const icon = getCalloutIcon(variant, customIcons);
    const iconRun = new Run(icon + ' ');
    paragraph.addRun(iconRun);
  }

  // Get text content
  const textContent = element.textContent?.trim() || '';
  if (textContent) {
    const textRun = new Run(textContent);
    textRun.setColor(colors.text);
    paragraph.addRun(textRun);
  }

  return {
    element: paragraph as unknown as ConversionResult['element'],
    processChildren: true,
    childContext: {
      currentParagraph:
        paragraph as unknown as ConversionContext['currentParagraph'],
      inheritedFormatting: {
        ...(context.inheritedFormatting || {}),
        color: colors.text,
      },
    },
  };
}

/**
 * Creates a callout paragraph programmatically
 *
 * @param content - Text content for the callout
 * @param variant - Callout variant (default: 'info')
 * @param options - Callout conversion options
 * @returns Configured Paragraph
 *
 * @example
 * ```typescript
 * const callout = createCallout('This is an important note', 'warning');
 * document.addParagraph(callout);
 * ```
 */
export function createCallout(
  content: string,
  variant: CalloutVariant = 'info',
  options: CalloutConversionOptions = {}
): Paragraph {
  const {
    includeIcon = true,
    customIcons,
    customColors,
    leftIndent = CALLOUT_INDENT,
    borderWidth = CALLOUT_BORDER_WIDTH,
    applyShading = true,
  } = options;

  const colors = getCalloutColors(variant, customColors);

  const paragraph = new Paragraph();

  // Set indentation
  paragraph.setLeftIndent(leftIndent);

  // Set left border
  paragraph.setBorder({
    left: {
      style: 'single',
      size: borderWidth,
      color: colors.border,
      space: 8,
    },
  });

  // Apply shading
  if (applyShading) {
    paragraph.setShading({
      fill: colors.background,
      val: 'clear',
    });
  }

  // Add icon if enabled
  if (includeIcon) {
    const icon = getCalloutIcon(variant, customIcons);
    const iconRun = new Run(icon + ' ');
    paragraph.addRun(iconRun);
  }

  // Add content
  const textRun = new Run(content);
  textRun.setColor(colors.text);
  paragraph.addRun(textRun);

  return paragraph;
}

/**
 * Creates a multi-paragraph callout (for longer content)
 *
 * @param lines - Array of text lines
 * @param variant - Callout variant
 * @param options - Callout conversion options
 * @returns Array of configured Paragraphs
 *
 * @example
 * ```typescript
 * const calloutParagraphs = createMultiLineCallout([
 *   'First paragraph of the callout',
 *   'Second paragraph with more details',
 * ], 'info');
 * calloutParagraphs.forEach(p => document.addParagraph(p));
 * ```
 */
export function createMultiLineCallout(
  lines: string[],
  variant: CalloutVariant = 'info',
  options: CalloutConversionOptions = {}
): Paragraph[] {
  const {
    includeIcon = true,
    customIcons,
    customColors,
    leftIndent = CALLOUT_INDENT,
    borderWidth = CALLOUT_BORDER_WIDTH,
    applyShading = true,
  } = options;

  const colors = getCalloutColors(variant, customColors);

  return lines.map((line, index) => {
    const paragraph = new Paragraph();

    // Set indentation
    paragraph.setLeftIndent(leftIndent);

    // Set left border
    paragraph.setBorder({
      left: {
        style: 'single',
        size: borderWidth,
        color: colors.border,
        space: 8,
      },
    });

    // Apply shading
    if (applyShading) {
      paragraph.setShading({
        fill: colors.background,
        val: 'clear',
      });
    }

    // Add icon only on first line
    if (includeIcon && index === 0) {
      const icon = getCalloutIcon(variant, customIcons);
      const iconRun = new Run(icon + ' ');
      paragraph.addRun(iconRun);
    }

    // Add content
    const textRun = new Run(line);
    textRun.setColor(colors.text);
    paragraph.addRun(textRun);

    return paragraph;
  });
}
