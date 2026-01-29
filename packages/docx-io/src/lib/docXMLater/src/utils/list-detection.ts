/**
 * List Detection Utilities for docxmlater
 *
 * Provides functions to detect typed list prefixes and analyze
 * paragraph list properties.
 */

import type { Paragraph } from '../elements/Paragraph';
import type {
  ListCategory,
  ListDetectionResult,
  NumberFormat,
  BulletFormat,
} from '../types/list-types';

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Regex patterns for typed list prefixes.
 * Order matters: more specific patterns first.
 */
export const TYPED_LIST_PATTERNS: Record<string, RegExp> = {
  // Numbered patterns (capture the marker for validation)
  decimal: /^(\d+)[.)]\s+/,
  lowerLetter: /^([a-z])[.)]\s+/,
  upperLetter: /^([A-Z])[.)]\s+/,
  lowerRoman: /^((?:i{1,3}|iv|vi{0,3}|ix|x{1,3}))[.)]\s+/i,

  // Bullet patterns
  bullet: /^[•●○◦▪■□]\s+/,
  dash: /^[-–—]\s+/,
  arrow: /^[►▸▶→]\s+/,
};

/** Map pattern names to categories */
export const PATTERN_TO_CATEGORY: Record<string, ListCategory> = {
  decimal: 'numbered',
  lowerLetter: 'numbered',
  upperLetter: 'numbered',
  lowerRoman: 'numbered',
  bullet: 'bullet',
  dash: 'bullet',
  arrow: 'bullet',
};

/**
 * Map typed prefix format to Word numbering level.
 * Word's default multilevel list uses:
 *   Level 0: 1., 2., 3. (decimal)
 *   Level 1: a., b., c. (lowerLetter)
 *   Level 2: i., ii., iii. (lowerRoman)
 */
export const FORMAT_TO_LEVEL: Record<string, number> = {
  decimal: 0, // 1., 2., 3.
  lowerLetter: 1, // a., b., c.
  upperLetter: 1, // A., B., C.
  lowerRoman: 2, // i., ii., iii.
  upperRoman: 2, // I., II., III.
  bullet: 0, // Top-level bullet (filled circle)
  dash: 0, // Top-level dash marker
  arrow: 0, // Top-level arrow marker
};

/**
 * Get the Word numbering level for a given format.
 * Returns 0 (top level) for decimal or unknown formats.
 */
export function getLevelFromFormat(format: string | null): number {
  if (!format) return 0;
  return FORMAT_TO_LEVEL[format] ?? 0;
}

/**
 * Word standard indentation values in twips.
 * Level 0: 720 twips (0.5 inch) left indent
 * Level 1: 1080 twips (0.75 inch) left indent
 * Level 2: 1440 twips (1 inch) left indent
 * Each subsequent level adds 360 twips.
 */
const WORD_BASE_INDENT = 720;
const INDENT_PER_LEVEL = 360;

// =============================================================================
// CORE DETECTION FUNCTIONS
// =============================================================================

/**
 * Infer list level from indentation.
 * Uses standard Word indentation: 720 twips for level 0, +360 per level.
 */
export function inferLevelFromIndentation(indentTwips: number): number {
  if (indentTwips < WORD_BASE_INDENT) return 0;
  return Math.floor((indentTwips - WORD_BASE_INDENT) / INDENT_PER_LEVEL);
}

/**
 * Detect typed list prefix in text.
 * Returns the matched prefix and format type.
 *
 * Special handling for abbreviations:
 * - Single letter prefixes (A., B., P.) are NOT treated as list markers
 *   if the remaining text also starts with a letter+period pattern,
 *   indicating an abbreviation like "P.O. Box", "U.S. Army", etc.
 */
export function detectTypedPrefix(text: string): {
  prefix: string | null;
  format: NumberFormat | BulletFormat | null;
  category: ListCategory;
} {
  for (const [format, regex] of Object.entries(TYPED_LIST_PATTERNS)) {
    const match = text.match(regex);
    if (match) {
      // Special check for single-letter patterns (lowerLetter, upperLetter)
      // to avoid false positives on abbreviations like "P.O. Box", "U.S.", "A.M."
      if (format === 'lowerLetter' || format === 'upperLetter') {
        const remaining = text.substring(match[0].length);
        // If remaining text starts with another letter followed by period,
        // this is likely an abbreviation, not a list marker
        if (/^[A-Za-z]\./.test(remaining)) {
          continue; // Skip this pattern, try others
        }
      }

      return {
        prefix: match[0],
        format: format as NumberFormat | BulletFormat,
        category: PATTERN_TO_CATEGORY[format] ?? 'none',
      };
    }
  }

  return { prefix: null, format: null, category: 'none' };
}

/**
 * Get the left indentation from a paragraph in twips.
 */
export function getParagraphIndentation(paragraph: Paragraph): number {
  const formatting = paragraph.getFormatting();
  return formatting?.indentation?.left ?? 0;
}

/**
 * Main detection function: analyze a single paragraph for list properties.
 */
export function detectListType(paragraph: Paragraph): ListDetectionResult {
  const text = paragraph.getText();
  const indentation = getParagraphIndentation(paragraph);
  const numbering = paragraph.getNumbering();

  // Priority 1: Real Word list with <w:numPr>
  if (numbering && numbering.numId !== undefined && numbering.numId !== 0) {
    return {
      category: 'numbered', // Default, caller can refine with NumberingManager lookup
      isWordList: true,
      typedPrefix: null,
      inferredLevel: numbering.level ?? 0,
      format: null, // Would need numbering.xml lookup
      numId: numbering.numId,
      ilvl: numbering.level ?? 0,
      indentationTwips: indentation,
    };
  }

  // Priority 2: Typed prefix detection
  const typed = detectTypedPrefix(text);
  if (typed.prefix) {
    return {
      category: typed.category,
      isWordList: false,
      typedPrefix: typed.prefix,
      // Use FORMAT to determine level, not indentation!
      // decimal=0, lowerLetter=1, lowerRoman=2
      inferredLevel: getLevelFromFormat(typed.format),
      format: typed.format,
      numId: null,
      ilvl: null,
      indentationTwips: indentation,
    };
  }

  // Priority 3: Not a list
  return {
    category: 'none',
    isWordList: false,
    typedPrefix: null,
    inferredLevel: 0,
    format: null,
    numId: null,
    ilvl: null,
    indentationTwips: indentation,
  };
}

/**
 * Validate that a typed prefix sequence is reasonable.
 * E.g., "1. 2. 3." is valid, "1. 5. 2." is suspicious.
 */
export function validateListSequence(
  paragraphs: Array<{ detection: ListDetectionResult; text: string }>
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  let lastDecimal = 0;
  let lastLetter = '';

  for (const { detection } of paragraphs) {
    if (!detection.typedPrefix || detection.category !== 'numbered') continue;

    const match = detection.typedPrefix.match(/^(\d+|[a-zA-Z]+)/);
    if (!match || !match[1]) continue;

    const marker = match[1];

    // Check decimal sequence
    if (/^\d+$/.test(marker)) {
      const num = Number.parseInt(marker, 10);
      if (lastDecimal > 0 && num !== lastDecimal + 1 && num !== 1) {
        warnings.push(`Unexpected number sequence: ${lastDecimal} → ${num}`);
      }
      lastDecimal = num;
    }

    // Check letter sequence
    if (/^[a-z]$/i.test(marker)) {
      const letter = marker.toLowerCase();
      if (
        lastLetter &&
        letter.charCodeAt(0) !== lastLetter.charCodeAt(0) + 1 &&
        letter !== 'a'
      ) {
        warnings.push(`Unexpected letter sequence: ${lastLetter} → ${letter}`);
      }
      lastLetter = letter;
    }
  }

  return { valid: warnings.length === 0, warnings };
}

/**
 * Determine the list category for a given numId by checking the abstractNum.
 * This requires access to the NumberingManager.
 */
export function getListCategoryFromFormat(
  format: string | undefined
): ListCategory {
  if (!format) return 'none';

  if (['bullet', 'dash', 'arrow'].includes(format)) {
    return 'bullet';
  }

  if (
    [
      'decimal',
      'lowerLetter',
      'upperLetter',
      'lowerRoman',
      'upperRoman',
    ].includes(format)
  ) {
    return 'numbered';
  }

  return 'none';
}
