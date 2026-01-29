/**
 * List Normalization Types for docxmlater
 *
 * These types support detection and normalization of typed list prefixes
 * to proper Word list formatting.
 */

/** High-level list category */
export type ListCategory = "numbered" | "bullet" | "none";

/** Specific number format patterns */
export type NumberFormat =
  | "decimal" // 1. 2. 3.
  | "lowerLetter" // a. b. c.
  | "upperLetter" // A. B. C.
  | "lowerRoman" // i. ii. iii.
  | "upperRoman"; // I. II. III.

/** Specific bullet format patterns */
export type BulletFormat =
  | "bullet" // • ● ○
  | "dash" // - – —
  | "arrow"; // ► ▸

/**
 * Result of detecting list type for a single paragraph
 */
export interface ListDetectionResult {
  /** High-level category */
  category: ListCategory;

  /** True if paragraph has <w:numPr> (real Word list) */
  isWordList: boolean;

  /** The typed prefix found, e.g., "1. ", "a) ", "• " */
  typedPrefix: string | null;

  /** Inferred nesting level based on indentation */
  inferredLevel: number;

  /** Specific format detected */
  format: NumberFormat | BulletFormat | null;

  /** If Word list, the numId from <w:numPr> */
  numId: number | null;

  /** If Word list, the ilvl from <w:numPr> */
  ilvl: number | null;

  /** Raw indentation in twips for debugging */
  indentationTwips: number;
}

/**
 * Analysis of all lists within a scope (cell, table, document)
 */
export interface ListAnalysis {
  /** All analyzed paragraphs with their detection results */
  paragraphs: Array<{
    paragraph: unknown; // Paragraph instance - using unknown to avoid circular dep
    text: string;
    detection: ListDetectionResult;
  }>;

  /** True if any typed (non-Word) lists found */
  hasTypedLists: boolean;

  /** True if any real Word lists found */
  hasWordLists: boolean;

  /** True if both numbered AND bullet lists present */
  hasMixedCategories: boolean;

  /** The dominant list type in this scope */
  majorityCategory: ListCategory;

  /** Count by category */
  counts: {
    numbered: number;
    bullet: number;
    none: number;
  };

  /** Recommended action */
  recommendedAction: "normalize" | "none";
}

/**
 * Options for list normalization
 */
export interface ListNormalizationOptions {
  /** numId to use for numbered lists (from numbering.xml) */
  numberedStyleNumId?: number;

  /** numId to use for bullet lists (from numbering.xml) */
  bulletStyleNumId?: number;

  /** Processing scope */
  scope?: "cell" | "table" | "document";

  /**
   * If true, convert ALL list items to majority type.
   * If false, only convert typed lists (preserve existing Word lists).
   */
  forceMajority?: boolean;

  /**
   * If true, preserve original indentation instead of using level defaults.
   */
  preserveIndentation?: boolean;
}

/**
 * Report returned after normalization
 */
export interface ListNormalizationReport {
  /** Number of paragraphs successfully normalized */
  normalized: number;

  /** Number of paragraphs skipped (already correct or non-list) */
  skipped: number;

  /** Any errors encountered */
  errors: string[];

  /** The majority category that was applied */
  appliedCategory: ListCategory;

  /** Detailed per-paragraph results */
  details: Array<{
    originalText: string;
    action: "normalized" | "skipped" | "error";
    reason?: string;
  }>;
}
