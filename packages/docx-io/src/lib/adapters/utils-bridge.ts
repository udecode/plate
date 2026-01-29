/**
 * Utils Bridge - Common utility functions for DOCX export
 *
 * This module provides unit conversion, color conversion, and string
 * sanitization utilities needed for converting HTML/CSS to DOCX format.
 *
 * @module utils-bridge
 */

// ============================================================================
// Constants
// ============================================================================

/**
 * DOCX Measurement Constants
 *
 * Word documents use multiple measurement units:
 * - Twips: 1/20th of a point (used for most measurements like margins, indents)
 * - EMUs: English Metric Units (used for DrawingML, images)
 * - Half-points: Used for font sizes (1 point = 2 half-points)
 * - Points: Typography unit (72 points = 1 inch)
 */

/** Twips per inch (1440 twips = 1 inch) */
export const TWIPS_PER_INCH = 1440;

/** EMUs per inch (914400 EMUs = 1 inch) */
export const EMU_PER_INCH = 914_400;

/** Points per inch */
export const POINTS_PER_INCH = 72;

/** Twips per point (20 twips = 1 point) */
export const TWIPS_PER_POINT = 20;

/** EMUs per point */
export const EMU_PER_POINT = 12_700;

/** EMUs per twip */
export const EMU_PER_TWIP = 635;

/** EMUs per centimeter */
export const EMU_PER_CM = 360_000;

/** Standard screen DPI */
export const STANDARD_DPI = 96;

/** Half-points per point (for font sizes) */
export const HALF_POINTS_PER_POINT = 2;

// ============================================================================
// Unit Conversion: Pixels
// ============================================================================

/**
 * Converts pixels to twips
 *
 * @param px - Value in pixels
 * @param dpi - Screen DPI (default: 96)
 * @returns Value in twips
 *
 * @example
 * ```typescript
 * pxToTwips(96) // => 1440 (1 inch at 96 DPI)
 * pxToTwips(48) // => 720 (0.5 inch at 96 DPI)
 * ```
 */
export function pxToTwips(px: number, dpi: number = STANDARD_DPI): number {
  const inches = px / dpi;
  return Math.round(inches * TWIPS_PER_INCH);
}

/**
 * Converts pixels to EMUs
 *
 * @param px - Value in pixels
 * @param dpi - Screen DPI (default: 96)
 * @returns Value in EMUs
 *
 * @example
 * ```typescript
 * pxToEMU(96) // => 914400 (1 inch at 96 DPI)
 * ```
 */
export function pxToEMU(px: number, dpi: number = STANDARD_DPI): number {
  const inches = px / dpi;
  return Math.round(inches * EMU_PER_INCH);
}

/**
 * Converts pixels to half-points (for font sizes)
 *
 * At 96 DPI: 16px = 12pt = 24 half-points (default browser font size)
 *
 * @param px - Value in pixels
 * @param dpi - Screen DPI (default: 96)
 * @returns Value in half-points
 *
 * @example
 * ```typescript
 * pxToHalfPoints(16) // => 24 (12pt at 96 DPI)
 * pxToHalfPoints(24) // => 36 (18pt at 96 DPI)
 * ```
 */
export function pxToHalfPoints(px: number, dpi: number = STANDARD_DPI): number {
  const inches = px / dpi;
  const points = inches * POINTS_PER_INCH;
  return Math.round(points * HALF_POINTS_PER_POINT);
}

// ============================================================================
// Unit Conversion: Points
// ============================================================================

/**
 * Converts points to twips
 *
 * @param pt - Value in points
 * @returns Value in twips
 *
 * @example
 * ```typescript
 * ptToTwips(12) // => 240
 * ptToTwips(72) // => 1440 (1 inch)
 * ```
 */
export function ptToTwips(pt: number): number {
  return Math.round(pt * TWIPS_PER_POINT);
}

/**
 * Converts points to half-points
 *
 * @param pt - Value in points
 * @returns Value in half-points
 *
 * @example
 * ```typescript
 * ptToHalfPoints(12) // => 24
 * ptToHalfPoints(10.5) // => 21
 * ```
 */
export function ptToHalfPoints(pt: number): number {
  return Math.round(pt * HALF_POINTS_PER_POINT);
}

/**
 * Converts points to EMUs
 *
 * @param pt - Value in points
 * @returns Value in EMUs
 */
export function ptToEMU(pt: number): number {
  return Math.round(pt * EMU_PER_POINT);
}

// ============================================================================
// Unit Conversion: Inches
// ============================================================================

/**
 * Converts inches to twips
 *
 * @param inches - Value in inches
 * @returns Value in twips
 */
export function inchesToTwips(inches: number): number {
  return Math.round(inches * TWIPS_PER_INCH);
}

/**
 * Converts inches to EMUs
 *
 * @param inches - Value in inches
 * @returns Value in EMUs
 */
export function inchesToEMU(inches: number): number {
  return Math.round(inches * EMU_PER_INCH);
}

// ============================================================================
// Unit Conversion: Centimeters
// ============================================================================

/**
 * Converts centimeters to twips
 *
 * @param cm - Value in centimeters
 * @returns Value in twips
 */
export function cmToTwips(cm: number): number {
  const inches = cm / 2.54;
  return Math.round(inches * TWIPS_PER_INCH);
}

/**
 * Converts centimeters to EMUs
 *
 * @param cm - Value in centimeters
 * @returns Value in EMUs
 */
export function cmToEMU(cm: number): number {
  return Math.round(cm * EMU_PER_CM);
}

// ============================================================================
// Unit Conversion: Reverse
// ============================================================================

/**
 * Converts twips to pixels
 *
 * @param twips - Value in twips
 * @param dpi - Screen DPI (default: 96)
 * @returns Value in pixels
 */
export function twipsToPx(twips: number, dpi: number = STANDARD_DPI): number {
  const inches = twips / TWIPS_PER_INCH;
  return Math.round(inches * dpi);
}

/**
 * Converts EMUs to pixels
 *
 * @param emu - Value in EMUs
 * @param dpi - Screen DPI (default: 96)
 * @returns Value in pixels
 */
export function emuToPx(emu: number, dpi: number = STANDARD_DPI): number {
  const inches = emu / EMU_PER_INCH;
  return Math.round(inches * dpi);
}

/**
 * Converts half-points to points
 *
 * @param halfPoints - Value in half-points
 * @returns Value in points
 */
export function halfPointsToPt(halfPoints: number): number {
  return halfPoints / HALF_POINTS_PER_POINT;
}

// ============================================================================
// Color Conversion
// ============================================================================

/**
 * Named colors mapping to hex values
 * Standard CSS named colors supported by DOCX
 */
const NAMED_COLORS: Record<string, string> = {
  // Basic colors
  black: '000000',
  white: 'FFFFFF',
  red: 'FF0000',
  green: '008000',
  blue: '0000FF',
  yellow: 'FFFF00',
  cyan: '00FFFF',
  magenta: 'FF00FF',

  // Extended colors
  gray: '808080',
  grey: '808080',
  silver: 'C0C0C0',
  maroon: '800000',
  olive: '808000',
  lime: '00FF00',
  aqua: '00FFFF',
  teal: '008080',
  navy: '000080',
  fuchsia: 'FF00FF',
  purple: '800080',

  // Additional common colors
  orange: 'FFA500',
  pink: 'FFC0CB',
  brown: 'A52A2A',
  coral: 'FF7F50',
  crimson: 'DC143C',
  darkblue: '00008B',
  darkgreen: '006400',
  darkred: '8B0000',
  gold: 'FFD700',
  indigo: '4B0082',
  lightblue: 'ADD8E6',
  lightgreen: '90EE90',
  lightgray: 'D3D3D3',
  lightgrey: 'D3D3D3',
  darkgray: 'A9A9A9',
  darkgrey: 'A9A9A9',
  violet: 'EE82EE',
  wheat: 'F5DEB3',
};

/**
 * DOCX highlight colors (limited palette)
 * These are the only colors that can be used for text highlighting
 */
export const DOCX_HIGHLIGHT_COLORS = [
  'yellow',
  'green',
  'cyan',
  'magenta',
  'blue',
  'red',
  'darkBlue',
  'darkCyan',
  'darkGreen',
  'darkMagenta',
  'darkRed',
  'darkYellow',
  'darkGray',
  'lightGray',
  'black',
  'white',
] as const;

export type DocxHighlightColor = (typeof DOCX_HIGHLIGHT_COLORS)[number];

/** Regex patterns for color parsing */
const HEX_COLOR_REGEX = /^#?([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
const RGB_COLOR_REGEX = /^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i;
const HSL_COLOR_REGEX = /^hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%/i;

/**
 * Converts any CSS color to DOCX hex format (without #)
 *
 * Supports:
 * - Hex colors: #RGB, #RRGGBB, #RRGGBBAA
 * - RGB: rgb(r, g, b), rgba(r, g, b, a)
 * - HSL: hsl(h, s%, l%), hsla(h, s%, l%, a)
 * - Named colors: red, blue, etc.
 *
 * @param cssColor - CSS color value
 * @returns DOCX hex color (6 characters, uppercase, no #) or undefined
 *
 * @example
 * ```typescript
 * colorToDocxHex('#ff0000') // => 'FF0000'
 * colorToDocxHex('rgb(255, 0, 0)') // => 'FF0000'
 * colorToDocxHex('red') // => 'FF0000'
 * colorToDocxHex('hsl(0, 100%, 50%)') // => 'FF0000'
 * ```
 */
export function colorToDocxHex(cssColor: string): string | undefined {
  if (
    !cssColor ||
    cssColor === 'transparent' ||
    cssColor === 'inherit' ||
    cssColor === 'initial'
  ) {
    return;
  }

  const trimmed = cssColor.trim().toLowerCase();

  // Check named colors first
  if (NAMED_COLORS[trimmed]) {
    return NAMED_COLORS[trimmed];
  }

  // Try hex format
  const hexMatch = cssColor.match(HEX_COLOR_REGEX);
  if (hexMatch) {
    let hex = hexMatch[1].toUpperCase();
    // Convert shorthand #RGB to #RRGGBB
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    // Remove alpha channel if present
    if (hex.length === 8) {
      hex = hex.slice(0, 6);
    }
    return hex;
  }

  // Try RGB format
  const rgbMatch = cssColor.match(RGB_COLOR_REGEX);
  if (rgbMatch) {
    const r = Math.min(255, Math.max(0, Number.parseInt(rgbMatch[1], 10)));
    const g = Math.min(255, Math.max(0, Number.parseInt(rgbMatch[2], 10)));
    const b = Math.min(255, Math.max(0, Number.parseInt(rgbMatch[3], 10)));
    return componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

  // Try HSL format
  const hslMatch = cssColor.match(HSL_COLOR_REGEX);
  if (hslMatch) {
    const h = Number.parseInt(hslMatch[1], 10);
    const s = Number.parseInt(hslMatch[2], 10) / 100;
    const l = Number.parseInt(hslMatch[3], 10) / 100;
    const { r, g, b } = hslToRgb(h, s, l);
    return componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

  return;
}

/**
 * Converts a single color component (0-255) to hex
 */
function componentToHex(c: number): string {
  return c.toString(16).padStart(2, '0').toUpperCase();
}

/**
 * Converts HSL to RGB
 */
function hslToRgb(
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } {
  h = h / 360;

  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Maps a hex color to the nearest DOCX highlight color
 *
 * @param hexColor - 6-character hex color (without #)
 * @returns Nearest DOCX highlight color name
 */
export function hexToNearestHighlight(hexColor: string): DocxHighlightColor {
  // Simple mapping based on color ranges
  const r = Number.parseInt(hexColor.slice(0, 2), 16);
  const g = Number.parseInt(hexColor.slice(2, 4), 16);
  const b = Number.parseInt(hexColor.slice(4, 6), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Very dark colors
  if (luminance < 0.2) return 'black';
  if (luminance > 0.9) return 'white';

  // Check for primary colors with dominance
  const max = Math.max(r, g, b);
  const threshold = max * 0.7;

  if (r > threshold && g < threshold && b < threshold) {
    return luminance < 0.5 ? 'darkRed' : 'red';
  }
  if (g > threshold && r < threshold && b < threshold) {
    return luminance < 0.5 ? 'darkGreen' : 'green';
  }
  if (b > threshold && r < threshold && g < threshold) {
    return luminance < 0.5 ? 'darkBlue' : 'blue';
  }
  if (r > threshold && g > threshold && b < threshold) {
    return luminance < 0.5 ? 'darkYellow' : 'yellow';
  }
  if (r > threshold && b > threshold && g < threshold) {
    return luminance < 0.5 ? 'darkMagenta' : 'magenta';
  }
  if (g > threshold && b > threshold && r < threshold) {
    return luminance < 0.5 ? 'darkCyan' : 'cyan';
  }

  // Grayscale
  return luminance < 0.5 ? 'darkGray' : 'lightGray';
}

// ============================================================================
// XML String Sanitization
// ============================================================================

/**
 * Characters that are invalid in XML 1.0
 * Control characters except tab, newline, carriage return
 */
const XML_INVALID_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g;

/**
 * Characters that need escaping in XML content
 */
const XML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

/**
 * Sanitizes a string for use in XML content
 *
 * Removes invalid XML characters and escapes special characters.
 *
 * @param text - Text to sanitize
 * @returns XML-safe string
 *
 * @example
 * ```typescript
 * sanitizeForXml('Hello & <World>') // => 'Hello &amp; &lt;World&gt;'
 * sanitizeForXml('Text\x00WithNull') // => 'TextWithNull'
 * ```
 */
export function sanitizeForXml(text: string): string {
  if (!text) return '';

  // Remove invalid XML characters
  let sanitized = text.replace(XML_INVALID_CHARS_REGEX, '');

  // Escape special XML characters
  sanitized = sanitized.replace(
    /[&<>"']/g,
    (char) => XML_ESCAPE_MAP[char] || char
  );

  return sanitized;
}

/**
 * Checks if a string contains invalid XML characters
 *
 * @param text - Text to check
 * @returns True if the text contains invalid characters
 */
export function hasInvalidXmlChars(text: string): boolean {
  return XML_INVALID_CHARS_REGEX.test(text);
}

/**
 * Removes only invalid XML characters without escaping
 *
 * @param text - Text to clean
 * @returns Text with invalid characters removed
 */
export function removeInvalidXmlChars(text: string): string {
  return text.replace(XML_INVALID_CHARS_REGEX, '');
}

/**
 * Escapes XML special characters without removing invalid chars
 *
 * @param text - Text to escape
 * @returns Escaped text
 */
export function escapeXml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => XML_ESCAPE_MAP[char] || char);
}

/**
 * Unescapes XML entities
 *
 * @param text - Escaped XML text
 * @returns Unescaped text
 */
export function unescapeXml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

// ============================================================================
// CSS Value Parsing
// ============================================================================

/** Regex for parsing CSS dimension values */
const CSS_DIMENSION_REGEX = /^(-?[\d.]+)(px|pt|em|rem|%|in|cm|mm)?$/i;

/**
 * Parses a CSS dimension value and converts to target unit
 *
 * @param value - CSS value like '12px', '1em', '10pt'
 * @param targetUnit - Target unit to convert to
 * @param baseFontSize - Base font size for em/rem calculations (default: 16px)
 * @returns Converted value or undefined if parsing fails
 */
export function parseCssDimension(
  value: string,
  targetUnit: 'px' | 'pt' | 'twips' | 'emu' | 'halfPoints',
  baseFontSize = 16
): number | undefined {
  const match = value.trim().match(CSS_DIMENSION_REGEX);
  if (!match) return;

  const num = Number.parseFloat(match[1]);
  const unit = (match[2] || 'px').toLowerCase();

  // First convert to pixels
  let px: number;
  switch (unit) {
    case 'px':
      px = num;
      break;
    case 'pt':
      px = (num / POINTS_PER_INCH) * STANDARD_DPI;
      break;
    case 'em':
    case 'rem':
      px = num * baseFontSize;
      break;
    case '%':
      px = (num / 100) * baseFontSize;
      break;
    case 'in':
      px = num * STANDARD_DPI;
      break;
    case 'cm':
      px = (num / 2.54) * STANDARD_DPI;
      break;
    case 'mm':
      px = (num / 25.4) * STANDARD_DPI;
      break;
    default:
      return;
  }

  // Convert pixels to target unit
  switch (targetUnit) {
    case 'px':
      return Math.round(px);
    case 'pt':
      return (px / STANDARD_DPI) * POINTS_PER_INCH;
    case 'twips':
      return pxToTwips(px);
    case 'emu':
      return pxToEMU(px);
    case 'halfPoints':
      return pxToHalfPoints(px);
    default:
      return;
  }
}
