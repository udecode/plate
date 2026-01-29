/**
 * RevisionAutoFixer - Automatically fixes revision validation issues
 *
 * Provides auto-fix capabilities for common revision compliance issues,
 * helping to prevent document corruption while preserving user intent.
 *
 * @module RevisionAutoFixer
 */

import type { Document } from '../core/Document';
import type { Revision } from '../elements/Revision';
import {
  REVISION_RULES,
  AutoFixOptions,
  AutoFixResult,
  FixAction,
  ValidationIssue,
} from './ValidationRules';
import { RevisionValidator } from './RevisionValidator';

/**
 * Automatically fixes revision validation issues.
 *
 * @example
 * ```typescript
 * // Auto-fix all issues
 * const result = RevisionAutoFixer.fix(doc);
 * console.log(`Fixed ${result.issuesFixed} issues`);
 *
 * // Dry run (preview fixes without applying)
 * const preview = RevisionAutoFixer.fix(doc, { dryRun: true });
 * for (const action of preview.actions) {
 *   console.log(`Would fix: ${action.action}`);
 * }
 * ```
 */
export class RevisionAutoFixer {
  /**
   * Auto-fix all fixable issues in a document.
   *
   * @param doc - Document to fix
   * @param options - Fix options
   * @returns Result with details of all fixes applied
   */
  static fix(doc: Document, options?: AutoFixOptions): AutoFixResult {
    const actions: FixAction[] = [];
    const errors: string[] = [];
    const revisionManager = doc.getRevisionManager();

    if (!revisionManager) {
      return {
        allFixed: true,
        issuesFixed: 0,
        issuesRemaining: 0,
        actions: [],
        errors: [],
      };
    }

    const revisions = revisionManager.getAllRevisions();
    const skipRules = new Set(options?.skipRules || []);
    const onlyRules = options?.onlyRules ? new Set(options.onlyRules) : null;

    // Helper to check if a rule should be processed
    const shouldProcess = (ruleCode: string) => {
      if (skipRules.has(ruleCode)) return false;
      if (onlyRules && !onlyRules.has(ruleCode)) return false;
      return true;
    };

    try {
      // Fix duplicate IDs (REV001)
      if (shouldProcess('REV001')) {
        actions.push(...this.fixDuplicateIds(revisions, options?.dryRun));
      }

      // Fix missing authors (REV002)
      if (shouldProcess('REV002')) {
        const defaultAuthor = options?.defaultAuthor || 'Unknown Author';
        actions.push(...this.fixMissingAuthors(revisions, defaultAuthor, options?.dryRun));
      }

      // Fix orphaned move markers (REV003, REV004)
      if (shouldProcess('REV003') || shouldProcess('REV004')) {
        actions.push(...this.fixOrphanedMoveMarkers(revisionManager, revisions, options?.dryRun));
      }

      // Fix missing dates (REV101)
      if (shouldProcess('REV101')) {
        actions.push(...this.fixMissingDates(revisions, options?.dryRun));
      }

      // Fix invalid dates (REV102)
      if (shouldProcess('REV102')) {
        actions.push(...this.fixInvalidDates(revisions, options?.dryRun));
      }

      // Fix empty revisions (REV103)
      if (shouldProcess('REV103')) {
        actions.push(...this.fixEmptyRevisions(revisionManager, revisions, options?.dryRun));
      }

      // Fix non-sequential IDs (REV104)
      if (shouldProcess('REV104')) {
        actions.push(...this.fixNonSequentialIds(revisions, options?.dryRun));
      }

    } catch (error) {
      errors.push(`Fix error: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Validate after fixes
    const postValidation = RevisionValidator.validate(doc);

    // Log actions if verbose
    if (options?.verbose) {
      for (const action of actions) {
        console.log(`[AutoFix] ${action.action}: ${action.issue.code}`);
      }
    }

    return {
      allFixed: postValidation.valid,
      issuesFixed: actions.filter(a => a.success).length,
      issuesRemaining: postValidation.summary.errorCount + postValidation.summary.warningCount,
      actions,
      errors,
    };
  }

  /**
   * Fix duplicate revision IDs by reassigning.
   *
   * Assigns new unique IDs to revisions with duplicate IDs.
   *
   * @param revisions - Array of revisions
   * @param dryRun - If true, only report changes without applying
   * @returns Array of fix actions
   */
  static fixDuplicateIds(revisions: Revision[], dryRun?: boolean): FixAction[] {
    const actions: FixAction[] = [];
    const usedIds = new Set<number>();
    let nextId = Math.max(...revisions.map(r => r.getId()), 0) + 1;

    for (const rev of revisions) {
      const id = rev.getId();

      if (usedIds.has(id)) {
        const newId = nextId++;
        const issue: ValidationIssue = {
          code: REVISION_RULES.DUPLICATE_ID.code,
          severity: 'error',
          message: `Duplicate ID ${id}`,
          location: { revisionId: id },
          autoFixable: true,
        };

        actions.push({
          issue,
          action: `Reassigned duplicate ID ${id} to ${newId}`,
          before: id,
          after: newId,
          success: true,
        });

        if (!dryRun) {
          rev.setId(newId);
        }
      }
      usedIds.add(rev.getId());
    }

    return actions;
  }

  /**
   * Fix missing authors by setting a default value.
   *
   * @param revisions - Array of revisions
   * @param defaultAuthor - Default author name to use
   * @param dryRun - If true, only report changes without applying
   * @returns Array of fix actions
   */
  static fixMissingAuthors(
    revisions: Revision[],
    defaultAuthor: string,
    dryRun?: boolean
  ): FixAction[] {
    const actions: FixAction[] = [];

    for (const rev of revisions) {
      const author = rev.getAuthor();

      if (!author || author.trim() === '') {
        const issue: ValidationIssue = {
          code: REVISION_RULES.MISSING_AUTHOR.code,
          severity: 'error',
          message: `Missing author for revision ${rev.getId()}`,
          location: { revisionId: rev.getId() },
          autoFixable: true,
        };

        actions.push({
          issue,
          action: `Set author to "${defaultAuthor}" for revision ${rev.getId()}`,
          before: author,
          after: defaultAuthor,
          success: true,
        });

        if (!dryRun) {
          rev.setAuthor(defaultAuthor);
        }
      }
    }

    return actions;
  }

  /**
   * Fix missing dates by setting current date.
   *
   * @param revisions - Array of revisions
   * @param dryRun - If true, only report changes without applying
   * @returns Array of fix actions
   */
  static fixMissingDates(revisions: Revision[], dryRun?: boolean): FixAction[] {
    const actions: FixAction[] = [];
    const now = new Date();

    for (const rev of revisions) {
      const date = rev.getDate();

      if (!date) {
        const issue: ValidationIssue = {
          code: REVISION_RULES.MISSING_DATE.code,
          severity: 'warning',
          message: `Missing date for revision ${rev.getId()}`,
          location: { revisionId: rev.getId() },
          autoFixable: true,
        };

        actions.push({
          issue,
          action: `Set date to ${now.toISOString()} for revision ${rev.getId()}`,
          before: null,
          after: now,
          success: true,
        });

        if (!dryRun) {
          rev.setDate(now);
        }
      }
    }

    return actions;
  }

  /**
   * Fix invalid dates by replacing with current date.
   *
   * @param revisions - Array of revisions
   * @param dryRun - If true, only report changes without applying
   * @returns Array of fix actions
   */
  static fixInvalidDates(revisions: Revision[], dryRun?: boolean): FixAction[] {
    const actions: FixAction[] = [];
    const now = new Date();

    for (const rev of revisions) {
      const date = rev.getDate();

      if (date && isNaN(date.getTime())) {
        const issue: ValidationIssue = {
          code: REVISION_RULES.INVALID_DATE_FORMAT.code,
          severity: 'warning',
          message: `Invalid date for revision ${rev.getId()}`,
          location: { revisionId: rev.getId() },
          autoFixable: true,
        };

        actions.push({
          issue,
          action: `Replaced invalid date with ${now.toISOString()} for revision ${rev.getId()}`,
          before: date,
          after: now,
          success: true,
        });

        if (!dryRun) {
          rev.setDate(now);
        }
      }
    }

    return actions;
  }

  /**
   * Fix orphaned move markers by removing them.
   *
   * @param revisionManager - RevisionManager instance
   * @param revisions - Array of revisions
   * @param dryRun - If true, only report changes without applying
   * @returns Array of fix actions
   */
  static fixOrphanedMoveMarkers(
    revisionManager: any, // Type as any to avoid circular import
    revisions: Revision[],
    dryRun?: boolean
  ): FixAction[] {
    const actions: FixAction[] = [];

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

    // Remove orphaned moveFrom
    for (const [moveId, rev] of moveFromIds) {
      if (!moveToIds.has(moveId)) {
        const issue: ValidationIssue = {
          code: REVISION_RULES.ORPHANED_MOVE_FROM.code,
          severity: 'error',
          message: `Orphaned moveFrom with moveId="${moveId}"`,
          location: { revisionId: rev.getId() },
          autoFixable: true,
        };

        actions.push({
          issue,
          action: `Removed orphaned moveFrom (ID: ${rev.getId()}, moveId: ${moveId})`,
          before: { type: 'moveFrom', moveId },
          after: null,
          success: true,
        });

        if (!dryRun) {
          revisionManager.removeById(rev.getId());
        }
      }
    }

    // Remove orphaned moveTo
    for (const [moveId, rev] of moveToIds) {
      if (!moveFromIds.has(moveId)) {
        const issue: ValidationIssue = {
          code: REVISION_RULES.ORPHANED_MOVE_TO.code,
          severity: 'error',
          message: `Orphaned moveTo with moveId="${moveId}"`,
          location: { revisionId: rev.getId() },
          autoFixable: true,
        };

        actions.push({
          issue,
          action: `Removed orphaned moveTo (ID: ${rev.getId()}, moveId: ${moveId})`,
          before: { type: 'moveTo', moveId },
          after: null,
          success: true,
        });

        if (!dryRun) {
          revisionManager.removeById(rev.getId());
        }
      }
    }

    return actions;
  }

  /**
   * Fix empty revisions by removing them.
   *
   * @param revisionManager - RevisionManager instance
   * @param revisions - Array of revisions
   * @param dryRun - If true, only report changes without applying
   * @returns Array of fix actions
   */
  static fixEmptyRevisions(
    revisionManager: any,
    revisions: Revision[],
    dryRun?: boolean
  ): FixAction[] {
    const actions: FixAction[] = [];

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

      // Skip property changes
      if (propertyChangeTypes.includes(type)) {
        continue;
      }

      const runs = rev.getRuns();
      const hasContent = runs.length > 0 && runs.some(r => r.getText().length > 0);

      if (!hasContent) {
        const issue: ValidationIssue = {
          code: REVISION_RULES.EMPTY_REVISION.code,
          severity: 'warning',
          message: `Empty revision ${rev.getId()} (type: ${type})`,
          location: { revisionId: rev.getId() },
          autoFixable: true,
        };

        actions.push({
          issue,
          action: `Removed empty revision (ID: ${rev.getId()}, type: ${type})`,
          before: { id: rev.getId(), type },
          after: null,
          success: true,
        });

        if (!dryRun) {
          revisionManager.removeById(rev.getId());
        }
      }
    }

    return actions;
  }

  /**
   * Fix non-sequential IDs by reassigning.
   *
   * @param revisions - Array of revisions
   * @param dryRun - If true, only report changes without applying
   * @returns Array of fix actions
   */
  static fixNonSequentialIds(revisions: Revision[], dryRun?: boolean): FixAction[] {
    const actions: FixAction[] = [];

    if (revisions.length === 0) return actions;

    // Check if IDs are already sequential
    const ids = revisions.map(r => r.getId()).sort((a, b) => a - b);
    let isSequential = true;

    for (let i = 1; i < ids.length; i++) {
      const currentId = ids[i]!;
      const prevId = ids[i - 1]!;
      if (currentId !== prevId + 1) {
        isSequential = false;
        break;
      }
    }

    if (!isSequential) {
      const issue: ValidationIssue = {
        code: REVISION_RULES.NON_SEQUENTIAL_IDS.code,
        severity: 'warning',
        message: 'Revision IDs are not sequential',
        autoFixable: true,
      };

      const oldIds = revisions.map(r => r.getId());
      const newIds: number[] = [];

      revisions.forEach((rev, index) => {
        newIds.push(index);
        if (!dryRun) {
          rev.setId(index);
        }
      });

      actions.push({
        issue,
        action: `Reassigned ${revisions.length} revision IDs to be sequential (0 to ${revisions.length - 1})`,
        before: oldIds,
        after: newIds,
        success: true,
      });
    }

    return actions;
  }

  /**
   * Preview fixes without applying them.
   *
   * Convenience method that calls fix() with dryRun: true.
   *
   * @param doc - Document to preview fixes for
   * @param options - Fix options (dryRun is forced to true)
   * @returns Result showing what would be fixed
   */
  static preview(doc: Document, options?: Omit<AutoFixOptions, 'dryRun'>): AutoFixResult {
    return this.fix(doc, { ...options, dryRun: true });
  }

  /**
   * Format fix result as a human-readable string.
   *
   * @param result - AutoFixResult to format
   * @returns Formatted string
   */
  static formatResult(result: AutoFixResult): string {
    const lines: string[] = [];

    lines.push(`Auto-Fix ${result.allFixed ? 'COMPLETE' : 'PARTIAL'}`);
    lines.push(`Fixed: ${result.issuesFixed}, Remaining: ${result.issuesRemaining}`);

    if (result.actions.length > 0) {
      lines.push('\nActions taken:');
      for (const action of result.actions) {
        const status = action.success ? 'OK' : 'FAILED';
        lines.push(`  [${status}] ${action.action}`);
      }
    }

    if (result.errors.length > 0) {
      lines.push('\nErrors:');
      for (const error of result.errors) {
        lines.push(`  - ${error}`);
      }
    }

    return lines.join('\n');
  }
}
