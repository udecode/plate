/**
 * ListNormalizer - Core list normalization for docxmlater
 *
 * Detects typed list prefixes and converts them to proper Word list formatting.
 * Integrates with NumberingManager for numId resolution.
 */

import type { Paragraph } from '../elements/Paragraph';
import type { Run } from '../elements/Run';
import type { Table } from '../elements/Table';
import type { TableCell } from '../elements/TableCell';
import type { NumberingManager } from '../formatting/NumberingManager';
import type {
  ListCategory,
  ListAnalysis,
  ListNormalizationOptions,
  ListNormalizationReport,
} from '../types/list-types';
import {
  detectListType,
  getListCategoryFromFormat,
} from '../utils/list-detection';
import { defaultLogger } from '../utils/logger';
import { isRun } from '../elements/Paragraph';

// =============================================================================
// ANALYSIS FUNCTIONS
// =============================================================================

/** Internal type for analyzed paragraph data */
interface AnalyzedParagraph {
  paragraph: Paragraph;
  text: string;
  detection: ReturnType<typeof detectListType>;
}

/**
 * Determine majority category using OVERALL counts.
 * Counts ALL list items equally (Word lists + typed prefixes).
 * NUMBERED wins ties (business document standard).
 */
function determineMajorityCategory(
  analyzed: AnalyzedParagraph[]
): ListCategory {
  let bulletCount = 0;
  let numberedCount = 0;

  for (const item of analyzed) {
    // Count BOTH Word lists AND typed prefixes equally
    if (item.detection.category === 'bullet') {
      bulletCount++;
    } else if (item.detection.category === 'numbered') {
      numberedCount++;
    }
  }

  // No list items at all
  if (bulletCount === 0 && numberedCount === 0) return 'none';

  // NUMBERED wins ties (business document standard)
  // Bullets only win if strictly more bullets than numbers
  return numberedCount >= bulletCount ? 'numbered' : 'bullet';
}

/**
 * Analyze all paragraphs in a cell for list properties.
 */
export function analyzeCellLists(
  cell: TableCell,
  numberingManager?: NumberingManager
): ListAnalysis {
  const paragraphs = cell.getParagraphs();

  const analyzed: AnalyzedParagraph[] = paragraphs.map((p) => ({
    paragraph: p,
    text: p.getText(),
    detection: detectListType(p),
  }));

  // CRITICAL FIX (Round 4): Refine Word list categories using NumberingManager
  // detectListType() defaults ALL Word lists to "numbered", but we need to
  // look up the actual format to correctly identify bullets vs numbers
  if (numberingManager) {
    for (const item of analyzed) {
      if (item.detection.isWordList && item.detection.numId !== null) {
        // Look up the actual format from numbering.xml
        const instance = numberingManager.getInstance(item.detection.numId);
        if (instance) {
          const abstractNum = numberingManager.getAbstractNumbering(
            instance.getAbstractNumId()
          );
          if (abstractNum) {
            const level = abstractNum.getLevel(item.detection.ilvl ?? 0);
            if (level) {
              const format = level.getFormat();
              // Refine the category based on actual format
              item.detection.category = getListCategoryFromFormat(format);
            }
          }
        }
      }
    }
  }

  // Level is now determined by FORMAT in detectListType()
  // decimal=0, lowerLetter=1, lowerRoman=2

  // Count by category
  const counts = { numbered: 0, bullet: 0, none: 0 };
  let hasTypedLists = false;
  let hasWordLists = false;

  for (const item of analyzed) {
    const cat = item.detection.category;
    counts[cat]++;

    if (!item.detection.isWordList && item.detection.typedPrefix) {
      hasTypedLists = true;
    }
    if (item.detection.isWordList) {
      hasWordLists = true;
    }
  }

  // Determine majority using OVERALL counts (Word + typed equally)
  const majorityCategory = determineMajorityCategory(analyzed);

  // Determine if normalization is needed:
  // - Has typed prefixes that need converting, OR
  // - Has mixed categories (bullets AND numbers) that need unifying
  const hasMixedCategories = counts.numbered > 0 && counts.bullet > 0;
  const needsNormalization = hasTypedLists || hasMixedCategories;

  return {
    paragraphs: analyzed,
    hasTypedLists,
    hasWordLists,
    hasMixedCategories,
    majorityCategory,
    counts,
    recommendedAction: needsNormalization ? 'normalize' : 'none',
  };
}

/**
 * Analyze lists in an entire table.
 * Returns analysis per cell.
 */
export function analyzeTableLists(table: Table): Map<TableCell, ListAnalysis> {
  const results = new Map<TableCell, ListAnalysis>();

  for (const row of table.getRows()) {
    for (const cell of row.getCells()) {
      results.set(cell, analyzeCellLists(cell));
    }
  }

  return results;
}

// =============================================================================
// NORMALIZATION FUNCTIONS
// =============================================================================

/**
 * Strip typed prefix from paragraph text.
 * Handles prefixes that may be split across multiple runs.
 * Also trims leading whitespace from the remaining content.
 */
export function stripTypedPrefix(paragraph: Paragraph, prefix: string): void {
  const content = paragraph.getContent();
  let remainingPrefix = prefix;
  let prefixFullyStripped = false;

  for (const item of content) {
    if (isRun(item)) {
      const run = item as Run;
      const text = run.getText();

      if (!prefixFullyStripped && remainingPrefix.length > 0) {
        if (text.length <= remainingPrefix.length) {
          // Entire run is part of prefix
          if (remainingPrefix.startsWith(text)) {
            remainingPrefix = remainingPrefix.substring(text.length);
            run.setText(''); // Clear this run
            if (remainingPrefix.length === 0) {
              prefixFullyStripped = true;
            }
          }
        } else {
          // Partial match - strip prefix portion
          if (text.startsWith(remainingPrefix)) {
            run.setText(text.substring(remainingPrefix.length).trimStart());
            prefixFullyStripped = true;
          }
        }
      } else if (prefixFullyStripped) {
        // After stripping prefix, trim leading whitespace from first non-empty run
        const currentText = run.getText();
        if (currentText.length > 0) {
          const trimmed = currentText.trimStart();
          if (trimmed !== currentText) {
            run.setText(trimmed);
          }
          break; // Only trim the first run after the prefix
        }
      }
    }
  }
}

/**
 * Normalize all lists in a cell to consistent formatting.
 * KEY BEHAVIORS:
 * - ONE list type per cell - no mixing bullets and numbers
 * - Format determines level: decimal=0, letter=1, roman=2
 * - Word lists that don't match majority are converted
 * - Non-list items are NEVER touched
 */
export function normalizeListsInCell(
  cell: TableCell,
  options: Required<ListNormalizationOptions>,
  numberingManager: NumberingManager
): ListNormalizationReport {
  const analysis = analyzeCellLists(cell, numberingManager);
  const majorityCategory = analysis.majorityCategory;
  const report: ListNormalizationReport = {
    normalized: 0,
    skipped: 0,
    errors: [],
    appliedCategory: majorityCategory,
    details: [],
  };

  // Nothing to do if no normalization needed
  if (analysis.recommendedAction === 'none') {
    report.skipped = analysis.paragraphs.length;
    return report;
  }

  // Calculate level shifts PER LIST GROUP, not globally
  // A "list group" is a contiguous sequence of list items separated by non-list items
  // Each group gets its own minimum level calculation
  // If no list items exist before the current one in the group, default to level 0
  // This fixes cases where a cell has "a., b." at the top and "1., 2., 3." at the bottom
  const levelShiftByIndex = new Map<number, number>();
  let currentGroupStart = -1;
  let currentGroupMinLevel = Number.POSITIVE_INFINITY;

  for (let i = 0; i < analysis.paragraphs.length; i++) {
    const item = analysis.paragraphs[i]!;

    if (item.detection.category !== 'none') {
      // This is a list item
      if (currentGroupStart === -1) {
        currentGroupStart = i; // Start new group
        currentGroupMinLevel = Number.POSITIVE_INFINITY;
      }
      // Track minimum level in current group
      currentGroupMinLevel = Math.min(
        currentGroupMinLevel,
        item.detection.inferredLevel
      );
    } else {
      // Non-list item - end current group if any
      if (currentGroupStart !== -1) {
        // Apply the group's level shift to all items in the group
        const shift =
          currentGroupMinLevel === Number.POSITIVE_INFINITY
            ? 0
            : currentGroupMinLevel;
        for (let j = currentGroupStart; j < i; j++) {
          levelShiftByIndex.set(j, shift);
        }
        currentGroupStart = -1;
        currentGroupMinLevel = Number.POSITIVE_INFINITY;
      }
    }
  }

  // Handle last group if cell ends with list items
  if (currentGroupStart !== -1) {
    const shift =
      currentGroupMinLevel === Number.POSITIVE_INFINITY
        ? 0
        : currentGroupMinLevel;
    for (let j = currentGroupStart; j < analysis.paragraphs.length; j++) {
      levelShiftByIndex.set(j, shift);
    }
  }

  // === Context-aware bullet level detection ===
  // When bullets follow numbered items in a numbered-majority cell,
  // treat them as sub-items at Level 1 (lowerLetter format: a, b, c)
  // This preserves hierarchy instead of flattening bullets to Level 0
  const bulletAsSubItemIndices = new Set<number>();

  if (majorityCategory === 'numbered') {
    let lastNumberedItemIndex = -1;

    for (let i = 0; i < analysis.paragraphs.length; i++) {
      const item = analysis.paragraphs[i]!;
      const detection = item.detection;

      if (detection.category === 'numbered') {
        // This is a parent numbered item (decimal format or Word numbered list)
        lastNumberedItemIndex = i;
      } else if (
        detection.category === 'bullet' &&
        lastNumberedItemIndex >= 0
      ) {
        // This bullet follows a numbered item - mark it as a sub-item
        bulletAsSubItemIndices.add(i);
      } else if (detection.category === 'none') {
        // Non-list item breaks the context
        lastNumberedItemIndex = -1;
      }
    }
  }
  // === End context-aware bullet detection ===

  // Track numId per level - will be reset when parent level appears
  const numIdByLevel = new Map<number, number>();
  let lastProcessedLevel = -1;

  // Helper to get/create numId for a level
  // Standard Word behavior: when a higher-level item appears (lower number),
  // all lower-level items (higher numbers) should restart numbering.
  // E.g., after level 0 ("1."), level 1 ("a.") restarts from "a" not continues.
  const getNumId = (level: number): number => {
    if (level < lastProcessedLevel) {
      // Parent level appeared - clear all child level numIds to force restart
      for (const existingLevel of numIdByLevel.keys()) {
        if (existingLevel > level) {
          numIdByLevel.delete(existingLevel);
        }
      }
    }
    lastProcessedLevel = level;

    if (!numIdByLevel.has(level)) {
      const numId =
        majorityCategory === 'numbered'
          ? numberingManager.createNumberedList()
          : numberingManager.createBulletList();
      numIdByLevel.set(level, numId);
    }
    return numIdByLevel.get(level)!;
  };

  // Process each paragraph
  for (let index = 0; index < analysis.paragraphs.length; index++) {
    const item = analysis.paragraphs[index]!;
    const { paragraph, text, detection } = item;
    const para = paragraph as Paragraph;

    // Skip non-list items entirely - preserve "Note:", plain text, etc.
    if (detection.category === 'none') {
      report.skipped++;
      report.details.push({
        originalText: text.substring(0, 50),
        action: 'skipped',
        reason: 'Not a list item - preserving original formatting',
      });
      continue;
    }

    try {
      // Check if this item needs conversion (different category than majority)
      const needsConversion = detection.category !== majorityCategory;
      const hasTypedPrefix = !!detection.typedPrefix;
      const isWordList = detection.isWordList;

      // Get the level shift for this paragraph's list group
      const levelShift = levelShiftByIndex.get(index) ?? 0;

      // Calculate target level
      // - Use format-based level from detection (decimal=0, letter=1, roman=2, bullet=0)
      // - Apply level shift to normalize lists without parent levels
      // - Converted Word lists use the same level calculation as typed prefixes
      // - Bullets following numbered items become Level 1 sub-items (lowerLetter)
      let targetLevel = Math.max(0, detection.inferredLevel - levelShift);

      // Override level for bullets that should be sub-items under numbered lists
      if (bulletAsSubItemIndices.has(index) && targetLevel === 0) {
        targetLevel = 1; // Promote to Level 1 (uses lowerLetter format: a, b, c)
      }

      // Process based on what type of item this is
      if (hasTypedPrefix && detection.typedPrefix) {
        // Typed prefix: strip prefix and apply new formatting
        stripTypedPrefix(para, detection.typedPrefix);
        para.setNumbering(getNumId(targetLevel), targetLevel);
        report.normalized++;
        report.details.push({
          originalText: text.substring(0, 50),
          action: 'normalized',
          reason: `Typed prefix → level ${targetLevel}`,
        });
      } else if (isWordList && needsConversion) {
        // Word list that doesn't match majority: convert it
        para.setNumbering(getNumId(targetLevel), targetLevel);
        report.normalized++;
        report.details.push({
          originalText: text.substring(0, 50),
          action: 'normalized',
          reason: `Word ${detection.category} → ${majorityCategory} level ${targetLevel}`,
        });
      } else if (isWordList) {
        // CRITICAL FIX (Round 5): Word lists matching majority ALSO need numId update!
        // Without this, items keep their old numId while converted items get new numId,
        // causing Word to restart numbering when it sees different numIds.
        // ALL list items in a cell must share the SAME numId per level.
        para.setNumbering(getNumId(targetLevel), targetLevel);
        report.normalized++;
        report.details.push({
          originalText: text.substring(0, 50),
          action: 'normalized',
          reason: `Updated numId for consistent numbering at level ${targetLevel}`,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      report.errors.push(`Failed on "${text.substring(0, 30)}...": ${message}`);
      report.details.push({
        originalText: text.substring(0, 50),
        action: 'error',
        reason: message,
      });
    }
  }

  // Ensure list items don't start at orphan levels (level 1+ without level 0 parent)
  // This handles edge cases where the level shift calculation still results in non-zero levels
  normalizeOrphanListLevelsInCell(cell);

  return report;
}

/**
 * Normalize lists across all cells in a table.
 */
export function normalizeListsInTable(
  table: Table,
  options: Required<ListNormalizationOptions>,
  numberingManager: NumberingManager
): ListNormalizationReport {
  const aggregateReport: ListNormalizationReport = {
    normalized: 0,
    skipped: 0,
    errors: [],
    appliedCategory: 'none',
    details: [],
  };

  for (const row of table.getRows()) {
    for (const cell of row.getCells()) {
      const cellReport = normalizeListsInCell(cell, options, numberingManager);

      aggregateReport.normalized += cellReport.normalized;
      aggregateReport.skipped += cellReport.skipped;
      aggregateReport.errors.push(...cellReport.errors);
      aggregateReport.details.push(...cellReport.details);

      if (cellReport.appliedCategory !== 'none') {
        aggregateReport.appliedCategory = cellReport.appliedCategory;
      }
    }
  }

  return aggregateReport;
}

/**
 * Normalize orphan Level 1+ list items in a table cell.
 *
 * Detects when a cell's first list item starts at Level 1 or higher (e.g., open circles)
 * without a preceding Level 0 item (e.g., filled circles). This is common when content
 * is extracted from a larger document where the Level 0 parent existed elsewhere.
 *
 * The function shifts all list items down by the minimum level found, so they start at Level 0.
 *
 * @param cell - The table cell to normalize
 * @returns Number of paragraphs that were adjusted
 *
 * @example
 * // Before: Cell has Level 1 bullets (○ Name, ○ Address, ○ Phone)
 * const count = normalizeOrphanListLevelsInCell(cell);
 * // After: Cell has Level 0 bullets (● Name, ● Address, ● Phone)
 */
export function normalizeOrphanListLevelsInCell(cell: TableCell): number {
  const paragraphs = cell.getParagraphs();

  // Find minimum level among all list items in the cell
  let minLevel = Number.POSITIVE_INFINITY;
  let hasListItems = false;

  for (const para of paragraphs) {
    const numbering = para.getNumbering();
    if (numbering) {
      hasListItems = true;
      minLevel = Math.min(minLevel, numbering.level);
    }
  }

  // If no list items or already at Level 0, nothing to fix
  if (
    !hasListItems ||
    minLevel === 0 ||
    minLevel === Number.POSITIVE_INFINITY
  ) {
    return 0;
  }

  // Shift all list items down by minLevel
  let normalizedCount = 0;
  for (const para of paragraphs) {
    const numbering = para.getNumbering();
    if (numbering) {
      const newLevel = numbering.level - minLevel;
      para.setNumbering(numbering.numId, newLevel);
      normalizedCount++;
    }
  }

  return normalizedCount;
}

/**
 * Normalize orphan Level 1+ list items across all cells in a table.
 *
 * @param table - The table to normalize
 * @returns Total number of paragraphs adjusted across all cells
 */
export function normalizeOrphanListLevelsInTable(table: Table): number {
  let totalNormalized = 0;

  for (const row of table.getRows()) {
    for (const cell of row.getCells()) {
      totalNormalized += normalizeOrphanListLevelsInCell(cell);
    }
  }

  return totalNormalized;
}

// =============================================================================
// NUMBERING MANAGER HELPERS
// =============================================================================

/**
 * Get existing or create new numbered list numId.
 */
function getOrCreateNumberedListNumId(
  numberingManager: NumberingManager
): number {
  // First, try to find an existing numbered list
  const instances = numberingManager.getAllInstances();
  for (const instance of instances) {
    const abstractNum = numberingManager.getAbstractNumbering(
      instance.getAbstractNumId()
    );
    if (abstractNum) {
      const level0 = abstractNum.getLevel(0);
      if (level0) {
        const format = level0.getFormat();
        if (getListCategoryFromFormat(format) === 'numbered') {
          return instance.getNumId();
        }
      }
    }
  }

  // Create a new numbered list
  return numberingManager.createNumberedList();
}

/**
 * Get existing or create new bullet list numId.
 */
function getOrCreateBulletListNumId(
  numberingManager: NumberingManager
): number {
  // First, try to find an existing bullet list
  const instances = numberingManager.getAllInstances();
  for (const instance of instances) {
    const abstractNum = numberingManager.getAbstractNumbering(
      instance.getAbstractNumId()
    );
    if (abstractNum) {
      const level0 = abstractNum.getLevel(0);
      if (level0) {
        const format = level0.getFormat();
        if (format === 'bullet') {
          return instance.getNumId();
        }
      }
    }
  }

  // Create a new bullet list
  return numberingManager.createBulletList();
}

// =============================================================================
// PUBLIC API CLASS
// =============================================================================

/**
 * Main entry point for list normalization.
 *
 * @example
 * ```typescript
 * const normalizer = new ListNormalizer(numberingManager);
 *
 * // Analyze a cell
 * const analysis = normalizer.analyzeCell(cellElement);
 * console.log(`Has typed lists: ${analysis.hasTypedLists}`);
 * console.log(`Majority type: ${analysis.majorityCategory}`);
 *
 * // Normalize a cell
 * const report = normalizer.normalizeCell(cellElement, {
 *   numberedStyleNumId: 5,
 *   bulletStyleNumId: 8,
 *   scope: 'cell',
 * });
 * console.log(`Normalized ${report.normalized} items`);
 * ```
 */
export class ListNormalizer {
  private numberingManager: NumberingManager;

  constructor(numberingManager: NumberingManager) {
    this.numberingManager = numberingManager;
  }

  /**
   * Analyze lists in a cell.
   */
  analyzeCell(cell: TableCell): ListAnalysis {
    return analyzeCellLists(cell);
  }

  /**
   * Analyze lists in a table.
   */
  analyzeTable(table: Table): Map<TableCell, ListAnalysis> {
    return analyzeTableLists(table);
  }

  /**
   * Normalize lists in a cell.
   */
  normalizeCell(
    cell: TableCell,
    options: Partial<ListNormalizationOptions> = {}
  ): ListNormalizationReport {
    const fullOptions = this.resolveOptions(options);
    return normalizeListsInCell(cell, fullOptions, this.numberingManager);
  }

  /**
   * Normalize lists in a table.
   */
  normalizeTable(
    table: Table,
    options: Partial<ListNormalizationOptions> = {}
  ): ListNormalizationReport {
    const fullOptions = this.resolveOptions(options);
    return normalizeListsInTable(table, fullOptions, this.numberingManager);
  }

  /**
   * Normalize lists in all tables.
   */
  normalizeAllTables(
    tables: Table[],
    options: Partial<ListNormalizationOptions> = {}
  ): ListNormalizationReport {
    const aggregateReport: ListNormalizationReport = {
      normalized: 0,
      skipped: 0,
      errors: [],
      appliedCategory: 'none',
      details: [],
    };

    for (const table of tables) {
      const tableReport = this.normalizeTable(table, options);
      aggregateReport.normalized += tableReport.normalized;
      aggregateReport.skipped += tableReport.skipped;
      aggregateReport.errors.push(...tableReport.errors);
      aggregateReport.details.push(...tableReport.details);

      if (tableReport.appliedCategory !== 'none') {
        aggregateReport.appliedCategory = tableReport.appliedCategory;
      }
    }

    if (aggregateReport.normalized > 0) {
      defaultLogger.info(
        `List normalization complete: ${aggregateReport.normalized} items normalized`
      );
    }

    return aggregateReport;
  }

  /**
   * Resolve partial options with defaults.
   */
  private resolveOptions(
    partial: Partial<ListNormalizationOptions>
  ): Required<ListNormalizationOptions> {
    return {
      numberedStyleNumId:
        partial.numberedStyleNumId ??
        getOrCreateNumberedListNumId(this.numberingManager),
      bulletStyleNumId:
        partial.bulletStyleNumId ??
        getOrCreateBulletListNumId(this.numberingManager),
      scope: partial.scope ?? 'cell',
      forceMajority: partial.forceMajority ?? false,
      preserveIndentation: partial.preserveIndentation ?? false,
    };
  }
}
