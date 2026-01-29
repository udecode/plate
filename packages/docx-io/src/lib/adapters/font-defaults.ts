/**
 * Font Defaults - Document-level font and spacing configuration
 *
 * Provides utility functions to configure the document's default font settings
 * through the StylesManager and Normal style. Since Normal is the base style
 * for all paragraph styles, modifying it effectively changes document defaults.
 *
 * @module adapters/font-defaults
 */

import type { Document } from '../docXMLater/src';
import type { StylesManager } from '../docXMLater/src';

/** Font configuration for document defaults */
export interface FontDefaultsOptions {
  /** Default font family (e.g., 'Arial', 'Times New Roman', 'Calibri') */
  fontFamily?: string;
  /** Default font size in points (e.g., 11, 12, 14) */
  fontSize?: number;
  /** Default line spacing multiplier (1.0=single, 1.5=1.5 lines, 2.0=double) */
  lineSpacing?: number;
  /** Default spacing after paragraphs in points */
  spacingAfter?: number;
  /** Default spacing before paragraphs in points */
  spacingBefore?: number;
}

/** OOXML line spacing unit: single spacing = 240 */
const LINE_SPACING_UNIT = 240;

/** Twips per point for spacing conversion */
const TWIPS_PER_PT = 20;

/**
 * Applies font defaults to a Document by modifying the Normal style.
 *
 * The Normal style is the base for all paragraph styles, so changes here
 * effectively set the document-wide defaults for font, size, and spacing.
 *
 * @param doc - The Document instance
 * @param options - Font default options to apply
 */
export function applyFontDefaults(
  doc: Document,
  options: FontDefaultsOptions
): void {
  const stylesManager = doc.getStylesManager();
  applyFontDefaultsToStylesManager(stylesManager, options);
}

/**
 * Applies font defaults directly to a StylesManager by modifying the Normal style.
 *
 * Use this variant when you have a StylesManager reference but not the full Document.
 *
 * @param stylesManager - The StylesManager instance
 * @param options - Font default options to apply
 */
export function applyFontDefaultsToStylesManager(
  stylesManager: StylesManager,
  options: FontDefaultsOptions
): void {
  const normalStyle = stylesManager.getStyle('Normal');

  if (!normalStyle) {
    return;
  }

  // Apply run formatting (font family and size)
  if (options.fontFamily !== undefined || options.fontSize !== undefined) {
    const currentRunFormatting = normalStyle.getRunFormatting() ?? {};
    const updatedRunFormatting = { ...currentRunFormatting };

    if (options.fontFamily !== undefined) {
      updatedRunFormatting.font = options.fontFamily;
    }

    if (options.fontSize !== undefined) {
      // RunFormatting.size is in half-points internally, but the Style class
      // generateRunProperties multiplies by 2 for the XML output.
      // The size field in RunFormatting is in points (the Style handles conversion).
      updatedRunFormatting.size = options.fontSize;
    }

    normalStyle.setRunFormatting(updatedRunFormatting);
  }

  // Apply paragraph formatting (spacing)
  if (
    options.lineSpacing !== undefined ||
    options.spacingAfter !== undefined ||
    options.spacingBefore !== undefined
  ) {
    const currentParaFormatting = normalStyle.getParagraphFormatting() ?? {};
    const currentSpacing = currentParaFormatting.spacing ?? {};
    const updatedSpacing = { ...currentSpacing };

    if (options.lineSpacing !== undefined) {
      // OOXML line spacing: single=240, 1.5=360, double=480
      updatedSpacing.line = Math.round(options.lineSpacing * LINE_SPACING_UNIT);
      updatedSpacing.lineRule = 'auto';
    }

    if (options.spacingAfter !== undefined) {
      // Convert points to twips (1pt = 20 twips)
      updatedSpacing.after = Math.round(options.spacingAfter * TWIPS_PER_PT);
    }

    if (options.spacingBefore !== undefined) {
      // Convert points to twips (1pt = 20 twips)
      updatedSpacing.before = Math.round(options.spacingBefore * TWIPS_PER_PT);
    }

    normalStyle.setParagraphFormatting({
      ...currentParaFormatting,
      spacing: updatedSpacing,
    });
  }
}

/**
 * Reads the current font defaults from the Normal style.
 *
 * @param doc - The Document instance
 * @returns The current font default options, with undefined for unset values
 */
export function getFontDefaults(doc: Document): FontDefaultsOptions {
  const stylesManager = doc.getStylesManager();
  const normalStyle = stylesManager.getStyle('Normal');

  if (!normalStyle) {
    return {};
  }

  const result: FontDefaultsOptions = {};

  const runFormatting = normalStyle.getRunFormatting();

  if (runFormatting) {
    if (runFormatting.font !== undefined) {
      result.fontFamily = runFormatting.font;
    }

    if (runFormatting.size !== undefined) {
      result.fontSize = runFormatting.size;
    }
  }

  const paraFormatting = normalStyle.getParagraphFormatting();

  if (paraFormatting?.spacing) {
    const spacing = paraFormatting.spacing;

    if (spacing.line !== undefined) {
      // Convert from OOXML units back to multiplier
      result.lineSpacing = spacing.line / LINE_SPACING_UNIT;
    }

    if (spacing.after !== undefined) {
      // Convert from twips back to points
      result.spacingAfter = spacing.after / TWIPS_PER_PT;
    }

    if (spacing.before !== undefined) {
      // Convert from twips back to points
      result.spacingBefore = spacing.before / TWIPS_PER_PT;
    }
  }

  return result;
}

/**
 * Resets the Normal style to Calibri 11pt with default spacing.
 *
 * This restores the standard Word defaults:
 * - Font: Calibri
 * - Size: 11pt
 * - Line spacing: single (240)
 * - Spacing after: 8pt (160 twips)
 * - Spacing before: 0pt
 *
 * @param doc - The Document instance
 */
export function resetFontDefaults(doc: Document): void {
  applyFontDefaults(doc, {
    fontFamily: 'Calibri',
    fontSize: 11,
    lineSpacing: 1.0,
    spacingAfter: 8,
    spacingBefore: 0,
  });
}

/**
 * Creates a preset for Times New Roman 12pt, double spacing.
 * Common for academic papers and formal documents.
 *
 * @returns FontDefaultsOptions configured for Times New Roman
 */
export function createTimesNewRomanDefaults(): FontDefaultsOptions {
  return {
    fontFamily: 'Times New Roman',
    fontSize: 12,
    lineSpacing: 2.0,
    spacingAfter: 0,
    spacingBefore: 0,
  };
}

/**
 * Creates a preset for Arial 11pt, 1.15 line spacing.
 * Common for business documents and presentations.
 *
 * @returns FontDefaultsOptions configured for Arial
 */
export function createArialDefaults(): FontDefaultsOptions {
  return {
    fontFamily: 'Arial',
    fontSize: 11,
    lineSpacing: 1.15,
    spacingAfter: 8,
    spacingBefore: 0,
  };
}

/**
 * Creates a preset for Calibri 11pt, 1.15 line spacing.
 * This matches the default Word 2007+ template.
 *
 * @returns FontDefaultsOptions configured for Calibri (Word default)
 */
export function createCalibreDefaults(): FontDefaultsOptions {
  return {
    fontFamily: 'Calibri',
    fontSize: 11,
    lineSpacing: 1.15,
    spacingAfter: 8,
    spacingBefore: 0,
  };
}
