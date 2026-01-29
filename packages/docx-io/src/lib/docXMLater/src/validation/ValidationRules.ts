/**
 * ValidationRules - Defines validation rules for ECMA-376 revision compliance
 *
 * These rules ensure tracked changes in documents are compliant with the
 * OOXML specification and will not cause corruption when opened in Word.
 *
 * **Auto-Fix Execution Order:**
 *
 * When auto-fixing multiple issues, the order matters. Fixing some issues
 * may affect the presence or nature of other issues. The recommended
 * execution order is:
 *
 * 1. **REV001 (Duplicate IDs)** - Fix first, as other fixes may reference IDs
 * 2. **REV002 (Missing Author)** - Can be fixed independently
 * 3. **REV003/REV004 (Orphaned Moves)** - Fix after ID issues are resolved
 *    - Removing orphaned moves changes revision count
 *    - Must be fixed as a pair (check both moveFrom and moveTo)
 * 4. **REV103 (Empty Revisions)** - Fix after move fixes (moves might create empties)
 * 5. **REV104 (Non-Sequential IDs)** - Fix LAST, after all additions/removals
 * 6. **REV101/REV102 (Date Issues)** - Can be fixed at any time
 *
 * **Dependency Graph:**
 * ```
 * REV001 ──┐
 *          ├──► REV003/REV004 ──► REV103 ──► REV104
 * REV002 ──┘
 *
 * REV101, REV102 (independent - fix anytime)
 * REV201, REV202 (info only - not auto-fixable)
 * ```
 *
 * **Example Auto-Fix Sequence:**
 * ```typescript
 * // Correct order
 * autoFixer.fix(issues.filter(i => i.code === 'REV001'));  // First: duplicate IDs
 * autoFixer.fix(issues.filter(i => i.code === 'REV002'));  // Second: missing authors
 * autoFixer.fix(issues.filter(i => ['REV003', 'REV004'].includes(i.code)));  // Third: orphaned moves
 * autoFixer.fix(issues.filter(i => i.code === 'REV103'));  // Fourth: empty revisions
 * autoFixer.fix(issues.filter(i => i.code === 'REV104'));  // Last: sequential IDs
 * ```
 *
 * @module ValidationRules
 */

/**
 * Severity level for validation issues.
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * Represents a single validation issue found in a document.
 */
export interface ValidationIssue {
  /** Rule code (e.g., 'REV001') */
  code: string;
  /** Severity level */
  severity: ValidationSeverity;
  /** Human-readable message describing the issue */
  message: string;
  /** Location of the issue within the document */
  location?: {
    paragraphIndex?: number;
    runIndex?: number;
    revisionId?: number;
    element?: string;
  };
  /** Whether this issue can be automatically fixed */
  autoFixable: boolean;
  /** Suggested fix description */
  suggestedFix?: string;
}

/**
 * Rule definition for validation.
 */
export interface ValidationRule {
  /** Unique rule code */
  code: string;
  /** Severity level */
  severity: ValidationSeverity;
  /** Default message template */
  message: string;
  /** Whether this rule can be auto-fixed */
  autoFixable: boolean;
  /** Default suggested fix */
  suggestedFix?: string;
}

/**
 * Revision validation rules per ECMA-376.
 *
 * Error-level rules (will cause Word to reject document):
 * - REV001: Duplicate revision ID
 * - REV002: Missing required author attribute
 * - REV003: Orphaned moveFrom (no matching moveTo)
 * - REV004: Orphaned moveTo (no matching moveFrom)
 *
 * Warning-level rules (document opens but may have issues):
 * - REV101: Missing date attribute
 * - REV102: Invalid date format (not ISO 8601)
 * - REV103: Empty revision content
 * - REV104: Non-sequential revision IDs
 *
 * Info-level rules (best practices):
 * - REV201: Large number of revisions (>1000)
 * - REV202: Very old revision date
 */
export const REVISION_RULES = {
  // ============================================================
  // Error-level rules (cause Word to reject document)
  // ============================================================

  DUPLICATE_ID: {
    code: 'REV001',
    severity: 'error' as ValidationSeverity,
    message: 'Duplicate revision ID found',
    autoFixable: true,
    suggestedFix: 'Reassign unique IDs to duplicate revisions',
  },

  MISSING_AUTHOR: {
    code: 'REV002',
    severity: 'error' as ValidationSeverity,
    message: 'Revision missing required author attribute',
    autoFixable: true,
    suggestedFix: 'Set default author for revisions with missing author',
  },

  ORPHANED_MOVE_FROM: {
    code: 'REV003',
    severity: 'error' as ValidationSeverity,
    message: 'moveFrom element without matching moveTo',
    autoFixable: true,
    suggestedFix: 'Remove orphaned moveFrom element',
  },

  ORPHANED_MOVE_TO: {
    code: 'REV004',
    severity: 'error' as ValidationSeverity,
    message: 'moveTo element without matching moveFrom',
    autoFixable: true,
    suggestedFix: 'Remove orphaned moveTo element',
  },

  // ============================================================
  // Warning-level rules (document opens but may have issues)
  // ============================================================

  MISSING_DATE: {
    code: 'REV101',
    severity: 'warning' as ValidationSeverity,
    message: 'Revision missing date attribute',
    autoFixable: true,
    suggestedFix: 'Set current date for revisions with missing date',
  },

  INVALID_DATE_FORMAT: {
    code: 'REV102',
    severity: 'warning' as ValidationSeverity,
    message: 'Date not in ISO 8601 format',
    autoFixable: true,
    suggestedFix: 'Convert date to ISO 8601 format',
  },

  EMPTY_REVISION: {
    code: 'REV103',
    severity: 'warning' as ValidationSeverity,
    message: 'Revision has no content',
    autoFixable: true,
    suggestedFix: 'Remove empty revision',
  },

  NON_SEQUENTIAL_IDS: {
    code: 'REV104',
    severity: 'warning' as ValidationSeverity,
    message: 'Revision IDs are not sequential (Word may renumber)',
    autoFixable: true,
    suggestedFix: 'Reassign sequential IDs starting from 0',
  },

  // ============================================================
  // Info-level rules (best practices)
  // ============================================================

  LARGE_REVISION_COUNT: {
    code: 'REV201',
    severity: 'info' as ValidationSeverity,
    message: 'Document has a large number of revisions (>1000)',
    autoFixable: false,
    suggestedFix: 'Consider accepting or rejecting some revisions',
  },

  OLD_REVISION_DATE: {
    code: 'REV202',
    severity: 'info' as ValidationSeverity,
    message: 'Revision date is very old (>1 year)',
    autoFixable: false,
    suggestedFix: 'Consider reviewing and accepting old revisions',
  },
};

/**
 * Options for validation behavior.
 */
export interface ValidationOptions {
  /** Validation strictness level */
  level?: 'strict' | 'normal' | 'lenient';
  /** Skip specific rules by code */
  skipRules?: string[];
  /** Treat warnings as errors */
  warningsAsErrors?: boolean;
  /** Maximum number of issues to report (default: unlimited) */
  maxIssues?: number;
}

/**
 * Options for auto-fix behavior.
 */
export interface AutoFixOptions {
  /** Only fix specific rules */
  onlyRules?: string[];
  /** Skip specific rules */
  skipRules?: string[];
  /** Default author for missing authors */
  defaultAuthor?: string;
  /** Dry run mode - report only, don't modify */
  dryRun?: boolean;
  /** Log each fix action */
  verbose?: boolean;
}

/**
 * Result of validation.
 */
export interface ValidationResult {
  /** Whether the document passed validation */
  valid: boolean;
  /** Error-level issues */
  errors: ValidationIssue[];
  /** Warning-level issues */
  warnings: ValidationIssue[];
  /** Info-level issues */
  infos: ValidationIssue[];
  /** Issues that can be automatically fixed */
  autoFixable: ValidationIssue[];
  /** Summary of validation */
  summary: {
    totalIssues: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    autoFixableCount: number;
  };
}

/**
 * Represents a single fix action performed during auto-fix.
 */
export interface FixAction {
  /** The issue that was fixed */
  issue: ValidationIssue;
  /** Description of the action taken */
  action: string;
  /** Value before the fix */
  before: any;
  /** Value after the fix */
  after: any;
  /** Whether the fix was successful */
  success: boolean;
}

/**
 * Result of auto-fix operation.
 */
export interface AutoFixResult {
  /** Whether all issues were fixed */
  allFixed: boolean;
  /** Number of issues that were fixed */
  issuesFixed: number;
  /** Number of issues that remain unfixed */
  issuesRemaining: number;
  /** Individual fix actions taken */
  actions: FixAction[];
  /** Any errors that occurred during fixing */
  errors: string[];
}

/**
 * Helper function to create a validation issue from a rule.
 *
 * @param rule - Rule definition
 * @param location - Optional location information
 * @param customMessage - Optional custom message to override default
 * @returns ValidationIssue
 */
export function createIssueFromRule(
  rule: ValidationRule,
  location?: ValidationIssue['location'],
  customMessage?: string
): ValidationIssue {
  return {
    code: rule.code,
    severity: rule.severity,
    message: customMessage || rule.message,
    location,
    autoFixable: rule.autoFixable,
    suggestedFix: rule.suggestedFix,
  };
}

/**
 * Get a rule by its code.
 *
 * @param code - Rule code (e.g., 'REV001')
 * @returns ValidationRule or undefined
 */
export function getRuleByCode(code: string): ValidationRule | undefined {
  return Object.values(REVISION_RULES).find((rule) => rule.code === code);
}

/**
 * Get all rules of a specific severity.
 *
 * @param severity - Severity level to filter by
 * @returns Array of rules
 */
export function getRulesBySeverity(
  severity: ValidationSeverity
): ValidationRule[] {
  return Object.values(REVISION_RULES).filter(
    (rule) => rule.severity === severity
  );
}

/**
 * Get all auto-fixable rules.
 *
 * @returns Array of rules that can be auto-fixed
 */
export function getAutoFixableRules(): ValidationRule[] {
  return Object.values(REVISION_RULES).filter((rule) => rule.autoFixable);
}
