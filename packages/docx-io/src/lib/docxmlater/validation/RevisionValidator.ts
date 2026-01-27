/**
 * RevisionValidator - Validates document revisions for ECMA-376 compliance
 *
 * Checks tracked changes against OOXML specifications to prevent
 * document corruption and ensure compatibility with Microsoft Word.
 *
 * @module RevisionValidator
 */

import type { Document } from '../core/Document';
import type { Revision } from '../elements/Revision';
import {
  REVISION_RULES,
  ValidationIssue,
  ValidationOptions,
  ValidationResult,
  createIssueFromRule,
} from './ValidationRules';

/**
 * Validates document revisions for ECMA-376 compliance.
 *
 * @example
 * ```typescript
 * const result = RevisionValidator.validate(doc);
 * if (!result.valid) {
 *   console.error(`Found ${result.errors.length} errors`);
 *   for (const error of result.errors) {
 *     console.error(`  ${error.code}: ${error.message}`);
 *   }
 * }
 * ```
 */
export class RevisionValidator {
  /**
   * Validates all revisions in a document.
   *
   * @param doc - Document to validate
   * @param options - Validation options
   * @returns Validation result with all issues found
   */
  static validate(doc: Document, options?: ValidationOptions): ValidationResult {
    const revisionManager = doc.getRevisionManager();
    if (!revisionManager) {
      return this.createEmptyResult();
    }

    const revisions = revisionManager.getAllRevisions();
    const allIssues: ValidationIssue[] = [];

    // Skip certain rules if lenient mode
    const skipRules = new Set(options?.skipRules || []);
    if (options?.level === 'lenient') {
      // In lenient mode, skip info rules
      skipRules.add('REV201');
      skipRules.add('REV202');
    }

    // Run all validations
    if (!skipRules.has('REV001')) {
      allIssues.push(...this.validateRevisionIds(revisions));
    }
    if (!skipRules.has('REV003') && !skipRules.has('REV004')) {
      allIssues.push(...this.validateMovePairs(revisions));
    }
    if (!skipRules.has('REV002')) {
      allIssues.push(...this.validateAuthors(revisions));
    }
    if (!skipRules.has('REV101') && !skipRules.has('REV102')) {
      allIssues.push(...this.validateDates(revisions));
    }
    if (!skipRules.has('REV103')) {
      allIssues.push(...this.validateContent(revisions));
    }
    if (!skipRules.has('REV104') && options?.level === 'strict') {
      allIssues.push(...this.validateSequentialIds(revisions));
    }
    if (!skipRules.has('REV201')) {
      allIssues.push(...this.validateRevisionCount(revisions));
    }
    if (!skipRules.has('REV202')) {
      allIssues.push(...this.validateRevisionDates(revisions));
    }

    // Apply max issues limit
    const limitedIssues = options?.maxIssues
      ? allIssues.slice(0, options.maxIssues)
      : allIssues;

    // Separate by severity
    let errors = limitedIssues.filter(i => i.severity === 'error');
    let warnings = limitedIssues.filter(i => i.severity === 'warning');
    const infos = limitedIssues.filter(i => i.severity === 'info');
    const autoFixable = limitedIssues.filter(i => i.autoFixable);

    // Handle warningsAsErrors option
    if (options?.warningsAsErrors) {
      errors = [...errors, ...warnings];
      warnings = [];
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      infos,
      autoFixable,
      summary: {
        totalIssues: limitedIssues.length,
        errorCount: errors.length,
        warningCount: warnings.length,
        infoCount: infos.length,
        autoFixableCount: autoFixable.length,
      },
    };
  }

  /**
   * Creates an empty validation result (for documents with no revisions).
   */
  private static createEmptyResult(): ValidationResult {
    return {
      valid: true,
      errors: [],
      warnings: [],
      infos: [],
      autoFixable: [],
      summary: {
        totalIssues: 0,
        errorCount: 0,
        warningCount: 0,
        infoCount: 0,
        autoFixableCount: 0,
      },
    };
  }

  /**
   * Validates revision ID uniqueness.
   *
   * Per ECMA-376, revision IDs must be unique within a document.
   * Duplicate IDs can cause Word to reject the document.
   *
   * @param revisions - Array of revisions to validate
   * @returns Array of validation issues for duplicate IDs
   */
  static validateRevisionIds(revisions: Revision[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const seenIds = new Map<number, number[]>(); // id -> indices

    revisions.forEach((rev, index) => {
      const id = rev.getId();
      if (!seenIds.has(id)) {
        seenIds.set(id, []);
      }
      seenIds.get(id)!.push(index);
    });

    for (const [id, indices] of seenIds) {
      if (indices.length > 1) {
        const rule = REVISION_RULES.DUPLICATE_ID;
        if (rule) {
          issues.push(createIssueFromRule(
            rule,
            { revisionId: id },
            `Duplicate revision ID ${id} found at ${indices.length} locations (indices: ${indices.join(', ')})`
          ));
        }
      }
    }

    return issues;
  }

  /**
   * Validates move operation pairs.
   *
   * Each moveFrom must have a matching moveTo with the same moveId,
   * and vice versa. Orphaned move markers can cause document corruption.
   *
   * @param revisions - Array of revisions to validate
   * @returns Array of validation issues for orphaned move operations
   */
  static validateMovePairs(revisions: Revision[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const moveFromIds = new Map<string, Revision>();
    const moveToIds = new Map<string, Revision>();

    for (const rev of revisions) {
      const moveId = rev.getMoveId();
      if (!moveId) continue;

      if (rev.getType() === 'moveFrom') {
        moveFromIds.set(moveId, rev);
      } else if (rev.getType() === 'moveTo') {
        moveToIds.set(moveId, rev);
      }
    }

    // Check for orphaned moveFrom
    for (const [moveId, rev] of moveFromIds) {
      if (!moveToIds.has(moveId)) {
        issues.push(createIssueFromRule(
          REVISION_RULES.ORPHANED_MOVE_FROM,
          { revisionId: rev.getId() },
          `moveFrom with moveId="${moveId}" has no matching moveTo`
        ));
      }
    }

    // Check for orphaned moveTo
    for (const [moveId, rev] of moveToIds) {
      if (!moveFromIds.has(moveId)) {
        issues.push(createIssueFromRule(
          REVISION_RULES.ORPHANED_MOVE_TO,
          { revisionId: rev.getId() },
          `moveTo with moveId="${moveId}" has no matching moveFrom`
        ));
      }
    }

    return issues;
  }

  /**
   * Validates author presence.
   *
   * Per ECMA-376, the author attribute is required for revisions.
   *
   * @param revisions - Array of revisions to validate
   * @returns Array of validation issues for missing authors
   */
  static validateAuthors(revisions: Revision[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (const rev of revisions) {
      const author = rev.getAuthor();
      if (!author || author.trim() === '') {
        issues.push(createIssueFromRule(
          REVISION_RULES.MISSING_AUTHOR,
          { revisionId: rev.getId() }
        ));
      }
    }

    return issues;
  }

  /**
   * Validates date presence and format.
   *
   * Per ECMA-376, revision dates should be in ISO 8601 format.
   *
   * @param revisions - Array of revisions to validate
   * @returns Array of validation issues for date problems
   */
  static validateDates(revisions: Revision[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (const rev of revisions) {
      const date = rev.getDate();

      if (!date) {
        issues.push(createIssueFromRule(
          REVISION_RULES.MISSING_DATE,
          { revisionId: rev.getId() }
        ));
      } else if (isNaN(date.getTime())) {
        issues.push(createIssueFromRule(
          REVISION_RULES.INVALID_DATE_FORMAT,
          { revisionId: rev.getId() },
          `Revision ${rev.getId()} has an invalid date`
        ));
      }
    }

    return issues;
  }

  /**
   * Validates revision content.
   *
   * Revisions (except property changes) should have content.
   *
   * @param revisions - Array of revisions to validate
   * @returns Array of validation issues for empty revisions
   */
  static validateContent(revisions: Revision[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const propertyChangeTypes = [
      'runPropertiesChange',
      'paragraphPropertiesChange',
      'tablePropertiesChange',
      'tableExceptionPropertiesChange',
      'tableRowPropertiesChange',
      'tableCellPropertiesChange',
      'sectionPropertiesChange',
      'numberingChange',
    ];

    for (const rev of revisions) {
      const type = rev.getType();

      // Property changes don't need text content
      if (propertyChangeTypes.includes(type)) {
        continue;
      }

      const runs = rev.getRuns();
      const hasContent = runs.length > 0 && runs.some(r => r.getText().length > 0);

      if (!hasContent) {
        issues.push(createIssueFromRule(
          REVISION_RULES.EMPTY_REVISION,
          { revisionId: rev.getId() },
          `Revision ${rev.getId()} (type: ${type}) has no content`
        ));
      }
    }

    return issues;
  }

  /**
   * Validates that revision IDs are sequential.
   *
   * While not strictly required, sequential IDs are best practice.
   *
   * @param revisions - Array of revisions to validate
   * @returns Array of validation issues for non-sequential IDs
   */
  static validateSequentialIds(revisions: Revision[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (revisions.length === 0) return issues;

    // Use Set for O(n) lookup instead of sorting
    const idSet = new Set(revisions.map(r => r.getId()));
    const ids = Array.from(idSet);

    if (ids.length === 0) return issues;

    const minId = Math.min(...ids);
    const maxId = Math.max(...ids);

    // Find actual missing IDs in the range
    const missingIds: number[] = [];
    for (let i = minId; i <= maxId; i++) {
      if (!idSet.has(i)) {
        missingIds.push(i);
      }
    }

    if (missingIds.length > 0) {
      issues.push(createIssueFromRule(
        REVISION_RULES.NON_SEQUENTIAL_IDS,
        undefined,
        `Revision IDs are not sequential. Missing IDs: ${missingIds.slice(0, 10).join(', ')}${missingIds.length > 10 ? ` (and ${missingIds.length - 10} more)` : ''}`
      ));
    }

    return issues;
  }

  /**
   * Validates revision count (info-level).
   *
   * Large numbers of revisions can slow down Word.
   *
   * @param revisions - Array of revisions to validate
   * @returns Array of validation issues for large revision counts
   */
  static validateRevisionCount(revisions: Revision[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (revisions.length > 1000) {
      issues.push(createIssueFromRule(
        REVISION_RULES.LARGE_REVISION_COUNT,
        undefined,
        `Document has ${revisions.length} revisions (>1000). Consider accepting or rejecting some.`
      ));
    }

    return issues;
  }

  /**
   * Validates revision dates for staleness (info-level).
   *
   * Very old revisions may indicate stale tracked changes.
   *
   * @param revisions - Array of revisions to validate
   * @returns Array of validation issues for old revisions
   */
  static validateRevisionDates(revisions: Revision[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    let oldCount = 0;
    for (const rev of revisions) {
      const date = rev.getDate();
      if (date && date < oneYearAgo) {
        oldCount++;
      }
    }

    if (oldCount > 0) {
      issues.push(createIssueFromRule(
        REVISION_RULES.OLD_REVISION_DATE,
        undefined,
        `${oldCount} revision(s) are older than 1 year. Consider reviewing and accepting.`
      ));
    }

    return issues;
  }

  /**
   * Quick check if a document has any validation errors.
   *
   * @param doc - Document to check
   * @returns True if the document has no errors
   */
  static isValid(doc: Document): boolean {
    const result = this.validate(doc, { level: 'normal' });
    return result.valid;
  }

  /**
   * Get a summary string of validation results.
   *
   * @param result - Validation result
   * @returns Human-readable summary string
   */
  static formatSummary(result: ValidationResult): string {
    const lines: string[] = [];

    lines.push(`Validation ${result.valid ? 'PASSED' : 'FAILED'}`);
    lines.push(`Total issues: ${result.summary.totalIssues}`);

    if (result.summary.errorCount > 0) {
      lines.push(`  Errors: ${result.summary.errorCount}`);
    }
    if (result.summary.warningCount > 0) {
      lines.push(`  Warnings: ${result.summary.warningCount}`);
    }
    if (result.summary.infoCount > 0) {
      lines.push(`  Info: ${result.summary.infoCount}`);
    }

    if (result.summary.autoFixableCount > 0) {
      lines.push(`  Auto-fixable: ${result.summary.autoFixableCount}`);
    }

    return lines.join('\n');
  }
}
