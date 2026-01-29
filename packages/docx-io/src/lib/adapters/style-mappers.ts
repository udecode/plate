/**
 * CSS to DOCX Style Mappers
 *
 * This module provides utilities for converting CSS styles to DOCX formatting.
 * It bridges the gap between HTML/CSS-based content and docXMLater's Run formatting API.
 *
 * @see packages/docx-io/src/lib/docXMLater/src/elements/Run.ts for RunFormatting interface
 */

import type { Run, RunFormatting } from '../docXMLater/src/elements/Run';
import type {
  Paragraph,
  ParagraphAlignment,
} from '../docXMLater/src/elements/Paragraph';

// ============================================================================
// Regex Patterns (top-level for performance)
// ============================================================================

/** Regex to match RGB/RGBA color values */
const RGB_COLOR_REGEX = /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i;

/** Regex to match font-size values with units */
const FONT_SIZE_REGEX = /^([\d.]+)(px|pt|em|rem|%)$/i;

/** Regex to match letter-spacing values with units */
const LETTER_SPACING_REGEX = /^(-?[\d.]+)(px|pt|em)$/i;

// ============================================================================
// Types
// ============================================================================

/** Mapping definition for a single CSS property to DOCX conversion */
export type StyleMapping<T = unknown> = {
  /** CSS property name (e.g., 'font-weight', 'color') */
  property: string;
  /** Function to convert CSS value to DOCX format */
  convert: (value: string) => T;
};

/** CSS style object (subset of CSSStyleDeclaration) */
export type CSSStyles = {
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textDecorationLine?: string;
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  fontFamily?: string;
  verticalAlign?: string;
  letterSpacing?: string;
  textTransform?: string;
  [key: string]: string | undefined;
};

/** Collected run formatting from CSS styles */
export interface CollectedFormatting extends Partial<RunFormatting> {
  // Extends RunFormatting with any additional fields needed
}

// ============================================================================
// Color Conversion Utilities
// ============================================================================

/**
 * Converts CSS color value to DOCX hex color (without #)
 *
 * Supports:
 * - Hex colors: #RGB, #RRGGBB
 * - RGB/RGBA: rgb(r, g, b), rgba(r, g, b, a)
 * - Named colors: red, blue, etc.
 *
 * @param cssColor - CSS color value
 * @returns DOCX color in hex format (without #), or undefined if invalid
 *
 * @example
 * cssColorToDocxHex('#ff0000') // => 'FF0000'
 * cssColorToDocxHex('rgb(255, 0, 0)') // => 'FF0000'
 * cssColorToDocxHex('red') // => 'FF0000'
 */
export function cssColorToDocxHex(cssColor: string): string | undefined {
  if (!cssColor || cssColor === 'transparent' || cssColor === 'inherit') {
    return;
  }

  // Handle hex colors
  if (cssColor.startsWith('#')) {
    let hex = cssColor.slice(1).toUpperCase();
    // Convert shorthand #RGB to #RRGGBB
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    // Remove alpha channel if present (#RRGGBBAA)
    if (hex.length === 8) {
      hex = hex.slice(0, 6);
    }
    return hex;
  }

  // Handle rgb/rgba
  const rgbMatch = cssColor.match(RGB_COLOR_REGEX);
  if (rgbMatch) {
    const r = Math.min(255, Math.max(0, Number.parseInt(rgbMatch[1], 10)));
    const g = Math.min(255, Math.max(0, Number.parseInt(rgbMatch[2], 10)));
    const b = Math.min(255, Math.max(0, Number.parseInt(rgbMatch[3], 10)));
    return (
      r.toString(16).padStart(2, '0') +
      g.toString(16).padStart(2, '0') +
      b.toString(16).padStart(2, '0')
    ).toUpperCase();
  }

  // Handle named colors (common subset)
  const namedColors: Record<string, string> = {
    black: '000000',
    white: 'FFFFFF',
    red: 'FF0000',
    green: '008000',
    blue: '0000FF',
    yellow: 'FFFF00',
    cyan: '00FFFF',
    magenta: 'FF00FF',
    gray: '808080',
    grey: '808080',
    orange: 'FFA500',
    purple: '800080',
    pink: 'FFC0CB',
    brown: 'A52A2A',
    navy: '000080',
    teal: '008080',
    maroon: '800000',
    olive: '808000',
    lime: '00FF00',
    aqua: '00FFFF',
    silver: 'C0C0C0',
    fuchsia: 'FF00FF',
  };

  const lowerColor = cssColor.toLowerCase().trim();
  return namedColors[lowerColor];
}

// ============================================================================
// Unit Conversion Utilities
// ============================================================================

/**
 * Converts CSS font size to DOCX half-points
 *
 * DOCX uses half-points for font size (1pt = 2 half-points)
 *
 * @param fontSize - CSS font size (e.g., '12px', '1em', '16pt')
 * @returns Size in half-points, or undefined if cannot parse
 *
 * @example
 * cssFontSizeToHalfPoints('12px') // => 18 (12px ~ 9pt = 18 half-points)
 * cssFontSizeToHalfPoints('12pt') // => 24 (12pt = 24 half-points)
 */
export function cssFontSizeToHalfPoints(fontSize: string): number | undefined {
  if (!fontSize) return;

  const match = fontSize.match(FONT_SIZE_REGEX);
  if (!match) return;

  const value = Number.parseFloat(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case 'pt':
      // 1pt = 2 half-points
      return Math.round(value * 2);
    case 'px':
      // 1px ~ 0.75pt (at 96dpi)
      return Math.round(value * 0.75 * 2);
    case 'em':
    case 'rem':
      // Assume 1em = 16px = 12pt = 24 half-points (default browser size)
      return Math.round(value * 24);
    case '%':
      // Assume 100% = 12pt = 24 half-points
      return Math.round((value / 100) * 24);
    default:
      return;
  }
}

/**
 * Converts CSS letter-spacing to DOCX twips
 *
 * DOCX uses twips for character spacing (1/20th of a point)
 *
 * @param spacing - CSS letter-spacing value (e.g., '2px', '0.1em')
 * @returns Spacing in twips, or undefined if cannot parse
 */
export function cssLetterSpacingToTwips(spacing: string): number | undefined {
  if (!spacing || spacing === 'normal') return;

  const match = spacing.match(LETTER_SPACING_REGEX);
  if (!match) return;

  const value = Number.parseFloat(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case 'pt':
      // 1pt = 20 twips
      return Math.round(value * 20);
    case 'px':
      // 1px ~ 0.75pt = 15 twips
      return Math.round(value * 15);
    case 'em':
      // 1em ~ 12pt = 240 twips (relative to current font size)
      return Math.round(value * 240);
    default:
      return;
  }
}

// ============================================================================
// Individual Style Handlers
// ============================================================================

/**
 * Sets bold formatting on a run
 *
 * @param run - The docXMLater Run instance
 * @param isBold - Whether to apply bold
 */
export function handleBold(run: Run, isBold: boolean): void {
  run.setBold(isBold);
}

/**
 * Sets italic formatting on a run
 *
 * @param run - The docXMLater Run instance
 * @param isItalic - Whether to apply italic
 */
export function handleItalic(run: Run, isItalic: boolean): void {
  run.setItalic(isItalic);
}

/**
 * Sets underline formatting on a run
 *
 * @param run - The docXMLater Run instance
 * @param underlineStyle - Underline style ('single', 'double', etc.)
 */
export function handleUnderline(
  run: Run,
  underlineStyle: boolean | 'single' | 'double' | 'thick' | 'dotted' | 'dash'
): void {
  run.setUnderline(underlineStyle);
}

/**
 * Sets strikethrough formatting on a run
 *
 * @param run - The docXMLater Run instance
 * @param isStrikethrough - Whether to apply strikethrough
 */
export function handleStrikethrough(run: Run, isStrikethrough: boolean): void {
  run.setStrike(isStrikethrough);
}

/**
 * Sets font color on a run
 *
 * @param run - The docXMLater Run instance
 * @param color - CSS color value
 */
export function handleFontColor(run: Run, color: string): void {
  const docxColor = cssColorToDocxHex(color);
  if (docxColor) {
    run.setColor(docxColor);
  }
}

/**
 * Maps a hex color to the nearest DOCX highlight color
 *
 * DOCX highlight colors and their hex values:
 * - yellow: FFFF00
 * - green: 00FF00
 * - cyan: 00FFFF
 * - magenta: FF00FF
 * - blue: 0000FF
 * - red: FF0000
 * - darkBlue: 000080
 * - darkCyan: 008080
 * - darkGreen: 008000
 * - darkMagenta: 800080
 * - darkRed: 800000
 * - darkYellow: 808000
 * - darkGray: 808080
 * - lightGray: C0C0C0
 * - black: 000000
 * - white: FFFFFF
 */
const HIGHLIGHT_COLOR_MAP: Record<
  string,
  | 'yellow'
  | 'green'
  | 'cyan'
  | 'magenta'
  | 'blue'
  | 'red'
  | 'darkBlue'
  | 'darkCyan'
  | 'darkGreen'
  | 'darkMagenta'
  | 'darkRed'
  | 'darkYellow'
  | 'darkGray'
  | 'lightGray'
  | 'black'
  | 'white'
> = {
  FFFF00: 'yellow',
  '00FF00': 'green',
  '00FFFF': 'cyan',
  FF00FF: 'magenta',
  '0000FF': 'blue',
  FF0000: 'red',
  '000080': 'darkBlue',
  '008080': 'darkCyan',
  '008000': 'darkGreen',
  '800080': 'darkMagenta',
  '800000': 'darkRed',
  '808000': 'darkYellow',
  '808080': 'darkGray',
  C0C0C0: 'lightGray',
  '000000': 'black',
  FFFFFF: 'white',
};

/**
 * Finds the nearest DOCX highlight color for a given hex color
 *
 * @param hexColor - Hex color string (without #)
 * @returns Nearest highlight color name or undefined if no good match
 */
function findNearestHighlightColor(
  hexColor: string
):
  | 'yellow'
  | 'green'
  | 'cyan'
  | 'magenta'
  | 'blue'
  | 'red'
  | 'darkBlue'
  | 'darkCyan'
  | 'darkGreen'
  | 'darkMagenta'
  | 'darkRed'
  | 'darkYellow'
  | 'darkGray'
  | 'lightGray'
  | 'black'
  | 'white'
  | undefined {
  // Check for exact match first
  const upperHex = hexColor.toUpperCase();
  if (HIGHLIGHT_COLOR_MAP[upperHex]) {
    return HIGHLIGHT_COLOR_MAP[upperHex];
  }

  // Parse RGB values
  const r = Number.parseInt(upperHex.slice(0, 2), 16);
  const g = Number.parseInt(upperHex.slice(2, 4), 16);
  const b = Number.parseInt(upperHex.slice(4, 6), 16);

  // Define highlight colors with their RGB values
  const highlightColors: Array<{
    name:
      | 'yellow'
      | 'green'
      | 'cyan'
      | 'magenta'
      | 'blue'
      | 'red'
      | 'darkBlue'
      | 'darkCyan'
      | 'darkGreen'
      | 'darkMagenta'
      | 'darkRed'
      | 'darkYellow'
      | 'darkGray'
      | 'lightGray'
      | 'black'
      | 'white';
    r: number;
    g: number;
    b: number;
  }> = [
    { name: 'yellow', r: 255, g: 255, b: 0 },
    { name: 'green', r: 0, g: 255, b: 0 },
    { name: 'cyan', r: 0, g: 255, b: 255 },
    { name: 'magenta', r: 255, g: 0, b: 255 },
    { name: 'blue', r: 0, g: 0, b: 255 },
    { name: 'red', r: 255, g: 0, b: 0 },
    { name: 'darkBlue', r: 0, g: 0, b: 128 },
    { name: 'darkCyan', r: 0, g: 128, b: 128 },
    { name: 'darkGreen', r: 0, g: 128, b: 0 },
    { name: 'darkMagenta', r: 128, g: 0, b: 128 },
    { name: 'darkRed', r: 128, g: 0, b: 0 },
    { name: 'darkYellow', r: 128, g: 128, b: 0 },
    { name: 'darkGray', r: 128, g: 128, b: 128 },
    { name: 'lightGray', r: 192, g: 192, b: 192 },
    { name: 'black', r: 0, g: 0, b: 0 },
    { name: 'white', r: 255, g: 255, b: 255 },
  ];

  // Find nearest color by Euclidean distance
  let minDistance = Number.POSITIVE_INFINITY;
  let nearestColor: (typeof highlightColors)[number]['name'] | undefined;

  for (const color of highlightColors) {
    const distance = Math.sqrt(
      (r - color.r) ** 2 + (g - color.g) ** 2 + (b - color.b) ** 2
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestColor = color.name;
    }
  }

  // Only return if distance is reasonable (threshold of ~100)
  // This prevents mapping very different colors
  if (minDistance < 100) {
    return nearestColor;
  }

  return;
}

/**
 * Sets background/highlight color on a run
 *
 * Note: DOCX has limited highlight colors. If no matching highlight color is found,
 * uses character shading instead.
 *
 * @param run - The docXMLater Run instance
 * @param color - CSS color value
 */
export function handleBackgroundColor(run: Run, color: string): void {
  const docxColor = cssColorToDocxHex(color);
  if (docxColor) {
    // Try to find a matching highlight color
    const highlightColor = findNearestHighlightColor(docxColor);
    if (highlightColor) {
      run.setHighlight(highlightColor);
    } else {
      // Use shading for colors that don't map to highlight colors
      run.setShading({ fill: docxColor });
    }
  }
}

/**
 * Sets highlight on a run (for <mark> element)
 *
 * Uses yellow highlight by default (matching browser behavior for <mark>),
 * or the specified highlight color.
 *
 * @param run - The docXMLater Run instance
 * @param highlightColor - Optional specific highlight color (defaults to 'yellow')
 */
export function handleHighlight(
  run: Run,
  highlightColor:
    | 'yellow'
    | 'green'
    | 'cyan'
    | 'magenta'
    | 'blue'
    | 'red'
    | 'darkBlue'
    | 'darkCyan'
    | 'darkGreen'
    | 'darkMagenta'
    | 'darkRed'
    | 'darkYellow'
    | 'darkGray'
    | 'lightGray'
    | 'black'
    | 'white' = 'yellow'
): void {
  run.setHighlight(highlightColor);
}

/**
 * Sets monospace font for inline code
 *
 * Uses 'Courier New' as the monospace font.
 *
 * @param run - The docXMLater Run instance
 */
export function handleInlineCodeStyle(run: Run): void {
  run.setFont('Courier New');
}

/**
 * Sets font size on a run
 *
 * @param run - The docXMLater Run instance
 * @param size - CSS font size value
 */
export function handleFontSize(run: Run, size: string): void {
  const halfPoints = cssFontSizeToHalfPoints(size);
  if (halfPoints !== undefined) {
    // The Run.setSize() expects size in points (it stores as half-points internally)
    run.setSize(halfPoints / 2);
  }
}

/**
 * Sets font family on a run
 *
 * @param run - The docXMLater Run instance
 * @param fontFamily - CSS font-family value
 */
export function handleFontFamily(run: Run, fontFamily: string): void {
  // Extract first font from CSS font-family stack
  // e.g., '"Times New Roman", Georgia, serif' => 'Times New Roman'
  const firstFont = fontFamily
    .split(',')[0]
    .trim()
    .replace(/^["']|["']$/g, '');

  if (firstFont) {
    run.setFont(firstFont);
  }
}

/**
 * Sets subscript or superscript on a run
 *
 * @param run - The docXMLater Run instance
 * @param verticalAlign - CSS vertical-align value ('sub' | 'super')
 */
export function handleVerticalAlign(
  run: Run,
  verticalAlign: 'sub' | 'super'
): void {
  if (verticalAlign === 'sub') {
    run.setSubscript(true);
  } else if (verticalAlign === 'super') {
    run.setSuperscript(true);
  }
}

/**
 * Sets text transform (all caps, small caps) on a run
 *
 * @param run - The docXMLater Run instance
 * @param transform - CSS text-transform value
 */
export function handleTextTransform(
  run: Run,
  transform: 'uppercase' | 'capitalize'
): void {
  if (transform === 'uppercase') {
    run.setAllCaps(true);
  }
  // Note: CSS 'capitalize' doesn't have a direct DOCX equivalent
}

// ============================================================================
// Bulk Style Application
// ============================================================================

/**
 * Parses text-decoration CSS property for underline and strikethrough
 *
 * @param textDecoration - CSS text-decoration value
 * @returns Object with underline and strikethrough flags
 */
export function parseTextDecoration(textDecoration: string): {
  underline: boolean;
  strikethrough: boolean;
} {
  const lower = textDecoration.toLowerCase();
  return {
    underline: lower.includes('underline'),
    strikethrough:
      lower.includes('line-through') || lower.includes('strikethrough'),
  };
}

/**
 * Parses font-weight CSS property for bold
 *
 * @param fontWeight - CSS font-weight value
 * @returns Whether the text should be bold
 */
export function parseFontWeight(fontWeight: string): boolean {
  if (!fontWeight) return false;

  const lower = fontWeight.toLowerCase();
  if (lower === 'bold' || lower === 'bolder') return true;

  const numericWeight = Number.parseInt(fontWeight, 10);
  return !Number.isNaN(numericWeight) && numericWeight >= 700;
}

/**
 * Parses font-style CSS property for italic
 *
 * @param fontStyle - CSS font-style value
 * @returns Whether the text should be italic
 */
export function parseFontStyle(fontStyle: string): boolean {
  if (!fontStyle) return false;
  const lower = fontStyle.toLowerCase();
  return lower === 'italic' || lower === 'oblique';
}

/**
 * Collects all applicable formatting from CSS styles
 *
 * This is the main entry point for converting a full CSS style object
 * to docXMLater RunFormatting.
 *
 * @param styles - CSS styles object
 * @returns Collected RunFormatting options
 *
 * @example
 * const formatting = collectFormatting({
 *   fontWeight: 'bold',
 *   fontStyle: 'italic',
 *   color: '#ff0000',
 *   fontSize: '14pt'
 * });
 * // => { bold: true, italic: true, color: 'FF0000', size: 14 }
 */
export function collectFormatting(styles: CSSStyles): CollectedFormatting {
  const formatting: CollectedFormatting = {};

  // Font weight -> bold
  if (styles.fontWeight) {
    formatting.bold = parseFontWeight(styles.fontWeight);
  }

  // Font style -> italic
  if (styles.fontStyle) {
    formatting.italic = parseFontStyle(styles.fontStyle);
  }

  // Text decoration -> underline, strikethrough
  const textDeco = styles.textDecoration || styles.textDecorationLine;
  if (textDeco) {
    const { underline, strikethrough } = parseTextDecoration(textDeco);
    if (underline) formatting.underline = 'single';
    if (strikethrough) formatting.strike = true;
  }

  // Color -> font color
  if (styles.color) {
    const docxColor = cssColorToDocxHex(styles.color);
    if (docxColor) {
      formatting.color = docxColor;
    }
  }

  // Background color -> highlight/shading
  // Note: This needs more sophisticated mapping for DOCX highlight colors
  if (styles.backgroundColor) {
    const docxColor = cssColorToDocxHex(styles.backgroundColor);
    if (docxColor) {
      // TODO: Map to nearest DOCX highlight color or use shading
      formatting.shading = { fill: docxColor };
    }
  }

  // Font size
  if (styles.fontSize) {
    const halfPoints = cssFontSizeToHalfPoints(styles.fontSize);
    if (halfPoints !== undefined) {
      // RunFormatting expects size in points
      formatting.size = halfPoints / 2;
    }
  }

  // Font family
  if (styles.fontFamily) {
    const firstFont = styles.fontFamily
      .split(',')[0]
      .trim()
      .replace(/^["']|["']$/g, '');
    if (firstFont) {
      formatting.font = firstFont;
    }
  }

  // Vertical align -> subscript/superscript
  if (styles.verticalAlign) {
    const align = styles.verticalAlign.toLowerCase();
    if (align === 'sub') {
      formatting.subscript = true;
    } else if (align === 'super') {
      formatting.superscript = true;
    }
  }

  // Letter spacing -> character spacing
  if (styles.letterSpacing) {
    const twips = cssLetterSpacingToTwips(styles.letterSpacing);
    if (twips !== undefined) {
      formatting.characterSpacing = twips;
    }
  }

  // Text transform -> allCaps/smallCaps
  if (styles.textTransform) {
    const transform = styles.textTransform.toLowerCase();
    if (transform === 'uppercase') {
      formatting.allCaps = true;
    } else if (transform === 'capitalize') {
      // No direct DOCX equivalent, skip
    }
  }

  return formatting;
}

/**
 * Applies all collected formatting to a run
 *
 * @param run - The docXMLater Run instance
 * @param styles - CSS styles to apply
 *
 * @example
 * const run = new Run('Hello World');
 * applyStyles(run, {
 *   fontWeight: 'bold',
 *   color: 'red'
 * });
 */
export function applyStyles(run: Run, styles: CSSStyles): void {
  const formatting = collectFormatting(styles);

  // Apply each formatting property
  if (formatting.bold !== undefined) {
    run.setBold(formatting.bold);
  }
  if (formatting.italic !== undefined) {
    run.setItalic(formatting.italic);
  }
  if (formatting.underline !== undefined) {
    run.setUnderline(formatting.underline);
  }
  if (formatting.strike !== undefined) {
    run.setStrike(formatting.strike);
  }
  if (formatting.color !== undefined) {
    run.setColor(formatting.color);
  }
  if (formatting.size !== undefined) {
    run.setSize(formatting.size);
  }
  if (formatting.font !== undefined) {
    run.setFont(formatting.font);
  }
  if (formatting.subscript !== undefined && formatting.subscript) {
    run.setSubscript(true);
  }
  if (formatting.superscript !== undefined && formatting.superscript) {
    run.setSuperscript(true);
  }
  if (formatting.shading !== undefined) {
    run.setShading(formatting.shading);
  }
  if (formatting.allCaps !== undefined) {
    run.setAllCaps(formatting.allCaps);
  }
  if (formatting.characterSpacing !== undefined) {
    run.setCharacterSpacing(formatting.characterSpacing);
  }
}

// ============================================================================
// Style Mapping Registry
// ============================================================================

/**
 * Registry of CSS property to DOCX formatting converters
 *
 * This can be extended to add custom style mappings.
 */
export const styleMapperRegistry: StyleMapping[] = [
  {
    property: 'font-weight',
    convert: (value: string) => ({ bold: parseFontWeight(value) }),
  },
  {
    property: 'font-style',
    convert: (value: string) => ({ italic: parseFontStyle(value) }),
  },
  {
    property: 'text-decoration',
    convert: (value: string) => {
      const { underline, strikethrough } = parseTextDecoration(value);
      return {
        ...(underline ? { underline: 'single' as const } : {}),
        ...(strikethrough ? { strike: true } : {}),
      };
    },
  },
  {
    property: 'color',
    convert: (value: string) => {
      const color = cssColorToDocxHex(value);
      return color ? { color } : {};
    },
  },
  {
    property: 'font-size',
    convert: (value: string) => {
      const halfPoints = cssFontSizeToHalfPoints(value);
      return halfPoints !== undefined ? { size: halfPoints / 2 } : {};
    },
  },
  {
    property: 'font-family',
    convert: (value: string) => {
      const font = value
        .split(',')[0]
        .trim()
        .replace(/^["']|["']$/g, '');
      return font ? { font } : {};
    },
  },
];

// ============================================================================
// Paragraph Style Handlers
// ============================================================================

/**
 * CSS text-align to DOCX paragraph alignment mapping
 */
const TEXT_ALIGN_MAP: Record<string, ParagraphAlignment> = {
  left: 'left',
  center: 'center',
  right: 'right',
  justify: 'both',
  start: 'left', // CSS logical property
  end: 'right', // CSS logical property
};

/**
 * Sets text alignment on a paragraph
 *
 * Converts CSS text-align values to DOCX paragraph alignment.
 *
 * @param paragraph - The docXMLater Paragraph instance
 * @param textAlign - CSS text-align value ('left', 'center', 'right', 'justify', 'start', 'end')
 *
 * @example
 * handleTextAlign(paragraph, 'center');  // Centers paragraph text
 * handleTextAlign(paragraph, 'justify'); // Justified text
 */
export function handleTextAlign(paragraph: Paragraph, textAlign: string): void {
  const alignment = TEXT_ALIGN_MAP[textAlign.toLowerCase()];
  if (alignment) {
    paragraph.setAlignment(alignment);
  }
}

/**
 * Applies paragraph-level styles from CSS
 *
 * @param paragraph - The docXMLater Paragraph instance
 * @param styles - CSS styles object
 *
 * @example
 * applyParagraphStyles(paragraph, {
 *   textAlign: 'center'
 * });
 */
export function applyParagraphStyles(
  paragraph: Paragraph,
  styles: CSSStyles & { textAlign?: string }
): void {
  if (styles.textAlign) {
    handleTextAlign(paragraph, styles.textAlign);
  }
}
