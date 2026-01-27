/**
 * Unit Conversion Utilities
 *
 * Word documents use multiple measurement units:
 * - Twips: 1/20th of a point (used for most measurements like margins, indents)
 * - EMUs: English Metric Units (used for DrawingML, images)
 * - Points: Typography unit (72 points = 1 inch)
 * - Pixels: Screen measurement (depends on DPI)
 * - Inches/Centimeters: Human-readable units
 *
 * Conversion factors:
 * - 1 inch = 72 points = 1440 twips = 914,400 EMUs
 * - 1 cm = 0.393701 inches = 360,000 EMUs
 * - 1 point = 20 twips = 12,700 EMUs
 */

/**
 * Standard DPI (dots per inch) for screen displays
 */
export const STANDARD_DPI = 96;

/**
 * Conversion constants
 */
export const UNITS = {
  /** EMUs per inch */
  EMUS_PER_INCH: 914400,
  /** Twips per inch */
  TWIPS_PER_INCH: 1440,
  /** Points per inch */
  POINTS_PER_INCH: 72,
  /** Twips per point */
  TWIPS_PER_POINT: 20,
  /** EMUs per twip */
  EMUS_PER_TWIP: 635,
  /** EMUs per point */
  EMUS_PER_POINT: 12700,
  /** EMUs per centimeter */
  EMUS_PER_CM: 360000,
  /** Inches per centimeter */
  INCHES_PER_CM: 0.393701,
  /** Centimeters per inch */
  CM_PER_INCH: 2.54,
} as const;

// ============================================================================
// Twips Conversions
// ============================================================================

/**
 * Converts twips to points
 * @param twips Value in twips
 * @returns Value in points
 */
export function twipsToPoints(twips: number): number {
  return twips / UNITS.TWIPS_PER_POINT;
}

/**
 * Converts twips to inches
 * @param twips Value in twips
 * @returns Value in inches
 */
export function twipsToInches(twips: number): number {
  return twips / UNITS.TWIPS_PER_INCH;
}

/**
 * Converts twips to centimeters
 * @param twips Value in twips
 * @returns Value in centimeters
 */
export function twipsToCm(twips: number): number {
  return twipsToInches(twips) * UNITS.CM_PER_INCH;
}

/**
 * Converts twips to EMUs
 * @param twips Value in twips
 * @returns Value in EMUs
 */
export function twipsToEmus(twips: number): number {
  return Math.round(twips * UNITS.EMUS_PER_TWIP);
}

// ============================================================================
// EMUs Conversions
// ============================================================================

/**
 * Converts EMUs to twips
 * @param emus Value in EMUs
 * @returns Value in twips
 */
export function emusToTwips(emus: number): number {
  return Math.round(emus / UNITS.EMUS_PER_TWIP);
}

/**
 * Converts EMUs to inches
 * @param emus Value in EMUs
 * @returns Value in inches
 */
export function emusToInches(emus: number): number {
  return emus / UNITS.EMUS_PER_INCH;
}

/**
 * Converts EMUs to centimeters
 * @param emus Value in EMUs
 * @returns Value in centimeters
 */
export function emusToCm(emus: number): number {
  return emus / UNITS.EMUS_PER_CM;
}

/**
 * Converts EMUs to points
 * @param emus Value in EMUs
 * @returns Value in points
 */
export function emusToPoints(emus: number): number {
  return emus / UNITS.EMUS_PER_POINT;
}

/**
 * Converts EMUs to pixels
 * @param emus Value in EMUs
 * @param dpi Dots per inch (default: 96)
 * @returns Value in pixels
 */
export function emusToPixels(emus: number, dpi: number = STANDARD_DPI): number {
  return Math.round((emus / UNITS.EMUS_PER_INCH) * dpi);
}

// ============================================================================
// Points Conversions
// ============================================================================

/**
 * Converts points to twips
 * @param points Value in points
 * @returns Value in twips
 */
export function pointsToTwips(points: number): number {
  return points * UNITS.TWIPS_PER_POINT;
}

/**
 * Converts points to EMUs
 * @param points Value in points
 * @returns Value in EMUs
 */
export function pointsToEmus(points: number): number {
  return Math.round(points * UNITS.EMUS_PER_POINT);
}

/**
 * Converts points to inches
 * @param points Value in points
 * @returns Value in inches
 */
export function pointsToInches(points: number): number {
  return points / UNITS.POINTS_PER_INCH;
}

/**
 * Converts points to centimeters
 * @param points Value in points
 * @returns Value in centimeters
 */
export function pointsToCm(points: number): number {
  return pointsToInches(points) * UNITS.CM_PER_INCH;
}

// ============================================================================
// Inches Conversions
// ============================================================================

/**
 * Converts inches to twips
 * @param inches Value in inches
 * @returns Value in twips
 */
export function inchesToTwips(inches: number): number {
  return Math.round(inches * UNITS.TWIPS_PER_INCH);
}

/**
 * Converts inches to EMUs
 * @param inches Value in inches
 * @returns Value in EMUs
 */
export function inchesToEmus(inches: number): number {
  return Math.round(inches * UNITS.EMUS_PER_INCH);
}

/**
 * Converts inches to points
 * @param inches Value in inches
 * @returns Value in points
 */
export function inchesToPoints(inches: number): number {
  return inches * UNITS.POINTS_PER_INCH;
}

/**
 * Converts inches to centimeters
 * @param inches Value in inches
 * @returns Value in centimeters
 */
export function inchesToCm(inches: number): number {
  return inches * UNITS.CM_PER_INCH;
}

/**
 * Converts inches to pixels
 * @param inches Value in inches
 * @param dpi Dots per inch (default: 96)
 * @returns Value in pixels
 */
export function inchesToPixels(inches: number, dpi: number = STANDARD_DPI): number {
  return Math.round(inches * dpi);
}

// ============================================================================
// Centimeters Conversions
// ============================================================================

/**
 * Converts centimeters to twips
 * @param cm Value in centimeters
 * @returns Value in twips
 */
export function cmToTwips(cm: number): number {
  return inchesToTwips(cm * UNITS.INCHES_PER_CM);
}

/**
 * Converts centimeters to EMUs
 * @param cm Value in centimeters
 * @returns Value in EMUs
 */
export function cmToEmus(cm: number): number {
  return Math.round(cm * UNITS.EMUS_PER_CM);
}

/**
 * Converts centimeters to inches
 * @param cm Value in centimeters
 * @returns Value in inches
 */
export function cmToInches(cm: number): number {
  return cm * UNITS.INCHES_PER_CM;
}

/**
 * Converts centimeters to points
 * @param cm Value in centimeters
 * @returns Value in points
 */
export function cmToPoints(cm: number): number {
  return inchesToPoints(cmToInches(cm));
}

/**
 * Converts centimeters to pixels
 * @param cm Value in centimeters
 * @param dpi Dots per inch (default: 96)
 * @returns Value in pixels
 */
export function cmToPixels(cm: number, dpi: number = STANDARD_DPI): number {
  return inchesToPixels(cmToInches(cm), dpi);
}

// ============================================================================
// Pixels Conversions
// ============================================================================

/**
 * Converts pixels to EMUs
 * @param pixels Value in pixels
 * @param dpi Dots per inch (default: 96)
 * @returns Value in EMUs
 */
export function pixelsToEmus(pixels: number, dpi: number = STANDARD_DPI): number {
  return Math.round((pixels / dpi) * UNITS.EMUS_PER_INCH);
}

/**
 * Converts pixels to inches
 * @param pixels Value in pixels
 * @param dpi Dots per inch (default: 96)
 * @returns Value in inches
 */
export function pixelsToInches(pixels: number, dpi: number = STANDARD_DPI): number {
  return pixels / dpi;
}

/**
 * Converts pixels to twips
 * @param pixels Value in pixels
 * @param dpi Dots per inch (default: 96)
 * @returns Value in twips
 */
export function pixelsToTwips(pixels: number, dpi: number = STANDARD_DPI): number {
  return inchesToTwips(pixelsToInches(pixels, dpi));
}

/**
 * Converts pixels to centimeters
 * @param pixels Value in pixels
 * @param dpi Dots per inch (default: 96)
 * @returns Value in centimeters
 */
export function pixelsToCm(pixels: number, dpi: number = STANDARD_DPI): number {
  return pixelsToInches(pixels, dpi) * UNITS.CM_PER_INCH;
}

/**
 * Converts pixels to points
 * @param pixels Value in pixels
 * @param dpi Dots per inch (default: 96)
 * @returns Value in points
 */
export function pixelsToPoints(pixels: number, dpi: number = STANDARD_DPI): number {
  return inchesToPoints(pixelsToInches(pixels, dpi));
}

// ============================================================================
// Common Document Sizes (in twips)
// ============================================================================

/**
 * Common page sizes in twips
 */
export const PAGE_SIZES = {
  /** Letter (8.5" x 11") */
  LETTER: {
    width: 12240,  // 8.5 inches
    height: 15840, // 11 inches
  },
  /** A4 (21cm x 29.7cm) */
  A4: {
    width: 11906,  // 21cm
    height: 16838, // 29.7cm
  },
  /** Legal (8.5" x 14") */
  LEGAL: {
    width: 12240,  // 8.5 inches
    height: 20160, // 14 inches
  },
  /** Tabloid (11" x 17") */
  TABLOID: {
    width: 15840,  // 11 inches
    height: 24480, // 17 inches
  },
  /** A3 (29.7cm x 42cm) */
  A3: {
    width: 16838,  // 29.7cm
    height: 23811, // 42cm
  },
} as const;

/**
 * Common margin sizes in twips
 */
export const COMMON_MARGINS = {
  /** Normal margins (1 inch all around) */
  NORMAL: {
    top: 1440,
    bottom: 1440,
    left: 1440,
    right: 1440,
  },
  /** Narrow margins (0.5 inch all around) */
  NARROW: {
    top: 720,
    bottom: 720,
    left: 720,
    right: 720,
  },
  /** Wide margins (2 inches left/right, 1 inch top/bottom) */
  WIDE: {
    top: 1440,
    bottom: 1440,
    left: 2880,
    right: 2880,
  },
  /** Moderate margins (1 inch top/bottom, 0.75 inch left/right) */
  MODERATE: {
    top: 1440,
    bottom: 1440,
    left: 1080,
    right: 1080,
  },
} as const;
