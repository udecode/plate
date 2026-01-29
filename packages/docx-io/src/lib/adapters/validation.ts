/**
 * Validation Module
 *
 * Provides document validation before save (T122) and an export warning
 * collection system (T123) for the DOCX export pipeline.
 *
 * T122 - Document Validation Before Save:
 *   Validates a docXMLater Document object for structural correctness,
 *   including section presence, page dimensions, margin bounds, and
 *   numbering reference integrity.
 *
 * T123 - Export Warning Collection System:
 *   A WarningCollector class that accumulates warnings, errors, and
 *   informational messages during the export process, with filtering,
 *   level-based access, and human-readable summary output.
 *
 * @module validation
 */

import type { Document } from '../docXMLater/src';

// ============================================================================
// T122: Document Validation Before Save
// ============================================================================

/** Severity level for a document validation issue. */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/** A single validation issue found during document inspection. */
export type DocumentValidationIssue = {
  /** Machine-readable code identifying the issue category. */
  code: string;
  /** Severity of the issue. */
  severity: ValidationSeverity;
  /** Human-readable description of the issue. */
  message: string;
  /** Optional dot-path indicating where the issue was found (e.g. "section.pageSize"). */
  path?: string;
  /** Optional structured details about the issue. */
  details?: Record<string, unknown>;
};

/** Aggregated result of a document validation pass. */
export type DocumentValidationResult = {
  /** True when no errors were found (warnings and infos are tolerated). */
  valid: boolean;
  /** All issues regardless of severity. */
  issues: DocumentValidationIssue[];
  /** Only error-level issues. */
  errors: DocumentValidationIssue[];
  /** Only warning-level issues. */
  warnings: DocumentValidationIssue[];
  /** Only info-level issues. */
  infos: DocumentValidationIssue[];
};

/**
 * Build a {@link DocumentValidationResult} from a flat list of issues.
 *
 * A document is considered valid when no error-severity issues exist.
 */
function buildResult(
  issues: DocumentValidationIssue[]
): DocumentValidationResult {
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const infos = issues.filter((i) => i.severity === 'info');

  return {
    valid: errors.length === 0,
    issues,
    errors,
    warnings,
    infos,
  };
}

/**
 * Validate a docXMLater {@link Document} for structural correctness.
 *
 * Checks performed:
 * - The document contains at least one section.
 * - The section has a valid page size (width > 0, height > 0).
 * - Margins do not exceed page dimensions.
 * - Numbering definitions referenced by paragraphs exist in the numbering manager.
 *
 * @param doc - The Document instance to validate.
 * @returns A {@link DocumentValidationResult} summarising all detected issues.
 */
export function validateDocument(doc: Document): DocumentValidationResult {
  const issues: DocumentValidationIssue[] = [];

  // --- Section presence ---
  const section = (doc as any).section ?? (doc as any).getSection?.();

  if (section) {
    // --- Page size ---
    const pageSize = section.getPageSize?.() ?? (section as any).pageSize;

    if (pageSize) {
      const width: number | undefined = pageSize.width ?? pageSize.w;
      const height: number | undefined = pageSize.height ?? pageSize.h;

      if (width == null || width <= 0) {
        issues.push({
          code: 'INVALID_PAGE_WIDTH',
          severity: 'error',
          message: `Page width must be greater than 0. Got: ${width ?? 'undefined'}.`,
          path: 'section.pageSize.width',
          details: { width },
        });
      }
      if (height == null || height <= 0) {
        issues.push({
          code: 'INVALID_PAGE_HEIGHT',
          severity: 'error',
          message: `Page height must be greater than 0. Got: ${height ?? 'undefined'}.`,
          path: 'section.pageSize.height',
          details: { height },
        });
      }

      // --- Margins vs page dimensions ---
      const margins = section.getMargins?.() ?? (section as any).margins;

      if (
        margins &&
        width != null &&
        width > 0 &&
        height != null &&
        height > 0
      ) {
        const left: number = margins.left ?? margins.l ?? 0;
        const right: number = margins.right ?? margins.r ?? 0;
        const top: number = margins.top ?? margins.t ?? 0;
        const bottom: number = margins.bottom ?? margins.b ?? 0;

        if (left + right >= width) {
          issues.push({
            code: 'MARGINS_EXCEED_WIDTH',
            severity: 'error',
            message: `Left (${left}) + right (${right}) margins exceed page width (${width}).`,
            path: 'section.margins',
            details: { left, right, width },
          });
        }
        if (top + bottom >= height) {
          issues.push({
            code: 'MARGINS_EXCEED_HEIGHT',
            severity: 'error',
            message: `Top (${top}) + bottom (${bottom}) margins exceed page height (${height}).`,
            path: 'section.margins',
            details: { top, bottom, height },
          });
        }
      }
    } else {
      issues.push({
        code: 'NO_PAGE_SIZE',
        severity: 'warning',
        message: 'Section does not define a page size; defaults will be used.',
        path: 'section.pageSize',
      });
    }
  } else {
    issues.push({
      code: 'NO_SECTION',
      severity: 'error',
      message: 'Document must contain at least one section.',
      path: 'section',
    });
  }

  // --- Numbering reference integrity ---
  const numberingManager =
    (doc as any).numberingManager ?? (doc as any).getNumberingManager?.();
  const paragraphs: any[] =
    typeof (doc as any).getParagraphs === 'function'
      ? (doc as any).getParagraphs()
      : ((doc as any).paragraphs ?? []);

  if (numberingManager && paragraphs.length > 0) {
    const referencedIds = new Set<number>();

    for (const para of paragraphs) {
      const formatting =
        typeof para.getFormatting === 'function'
          ? para.getFormatting()
          : para.formatting;

      if (formatting?.numbering?.numId != null) {
        referencedIds.add(formatting.numbering.numId);
      }
    }

    for (const numId of referencedIds) {
      const instance =
        typeof numberingManager.getInstance === 'function'
          ? numberingManager.getInstance(numId)
          : undefined;

      if (!instance) {
        issues.push({
          code: 'NUMBERING_NOT_FOUND',
          severity: 'warning',
          message: `Paragraph references numbering ID ${numId} which is not defined.`,
          path: `numbering.instance[${numId}]`,
          details: { numId },
        });
      }
    }
  }

  return buildResult(issues);
}

/**
 * Perform additional export-specific validation on a {@link Document}.
 *
 * This extends the base {@link validateDocument} checks with export-oriented
 * diagnostics:
 * - Warn if there are no content paragraphs.
 * - Warn if track-changes is enabled but no revisions are found.
 * - Info about total paragraph and image counts.
 *
 * @param doc - The Document instance to validate for export.
 * @returns A {@link DocumentValidationResult} containing all issues.
 */
export function validateDocumentForExport(
  doc: Document
): DocumentValidationResult {
  // Start with the base validation issues.
  const base = validateDocument(doc);
  const issues: DocumentValidationIssue[] = [...base.issues];

  // --- Content paragraphs ---
  const paragraphs: any[] =
    typeof (doc as any).getParagraphs === 'function'
      ? (doc as any).getParagraphs()
      : ((doc as any).paragraphs ?? []);

  if (paragraphs.length === 0) {
    issues.push({
      code: 'NO_CONTENT_PARAGRAPHS',
      severity: 'warning',
      message:
        'Document contains no paragraphs; the exported file will be empty.',
    });
  }

  // --- Track changes ---
  const revisionManager =
    (doc as any).revisionManager ?? (doc as any).getRevisionManager?.();

  if (revisionManager) {
    const allRevisions: any[] =
      typeof revisionManager.getAllRevisions === 'function'
        ? revisionManager.getAllRevisions()
        : [];

    const trackChangesEnabled =
      typeof (doc as any).isTrackChangesEnabled === 'function'
        ? (doc as any).isTrackChangesEnabled()
        : allRevisions.length > 0;

    if (trackChangesEnabled && allRevisions.length === 0) {
      issues.push({
        code: 'TRACK_CHANGES_NO_REVISIONS',
        severity: 'warning',
        message:
          'Track changes is enabled but no revisions were found in the document.',
      });
    }
  }

  // --- Stats (info level) ---
  issues.push({
    code: 'PARAGRAPH_COUNT',
    severity: 'info',
    message: `Document contains ${paragraphs.length} paragraph(s).`,
    details: { count: paragraphs.length },
  });

  const imageManager =
    (doc as any).imageManager ?? (doc as any).getImageManager?.();
  let imageCount = 0;

  if (imageManager) {
    const images: any[] =
      typeof imageManager.getImages === 'function'
        ? imageManager.getImages()
        : typeof imageManager.getAllImages === 'function'
          ? imageManager.getAllImages()
          : ((imageManager as any).images ?? []);
    imageCount = Array.isArray(images) ? images.length : 0;
  }

  issues.push({
    code: 'IMAGE_COUNT',
    severity: 'info',
    message: `Document contains ${imageCount} image(s).`,
    details: { count: imageCount },
  });

  return buildResult(issues);
}

// ============================================================================
// T123: ExportWarning Collection System
// ============================================================================

/** Severity level for an export warning. */
export type ExportWarningLevel = 'error' | 'warning' | 'info';

/** A single warning produced during the export pipeline. */
export type ExportWarning = {
  /** Severity level. */
  level: ExportWarningLevel;
  /** Machine-readable warning code (see {@link WARNING_CODES}). */
  code: string;
  /** Human-readable description. */
  message: string;
  /** Optional HTML/XML tag that triggered the warning. */
  elementTag?: string;
  /** Optional free-form context string. */
  context?: string;
};

/** Configuration options for the {@link WarningCollector}. */
export type WarningCollectorOptions = {
  /** Maximum number of warnings to retain. Oldest are dropped when exceeded. */
  maxWarnings?: number;
  /** Warning codes to silently suppress. */
  suppressCodes?: string[];
  /** Minimum severity to collect. Warnings below this level are discarded. */
  minLevel?: ExportWarningLevel;
};

/** Numeric priority for severity comparison. Lower = more severe. */
const LEVEL_PRIORITY: Record<ExportWarningLevel, number> = {
  error: 0,
  warning: 1,
  info: 2,
};

/**
 * Collects and manages warnings emitted during DOCX export.
 *
 * Supports optional maximum capacity, code suppression, and minimum
 * severity filtering. Provides convenience accessors for errors and
 * warnings, as well as a human-readable summary string.
 *
 * @example
 * ```ts
 * const collector = new WarningCollector({ maxWarnings: 100 });
 * collector.addWarning('MISSING_FONT', 'Font "Fira Code" not available');
 * collector.addInfo('MATH_FALLBACK', 'Math rendered as image fallback');
 * console.log(collector.toSummary()); // "0 errors, 1 warning, 1 info"
 * ```
 */
export class WarningCollector {
  private warnings: ExportWarning[] = [];
  private readonly options: WarningCollectorOptions;

  constructor(options?: WarningCollectorOptions) {
    this.options = options ?? {};
  }

  /**
   * Add a fully formed {@link ExportWarning}.
   *
   * The warning is silently discarded if:
   * - Its code is in the suppress list.
   * - Its level is below the configured minimum.
   * - The collector has reached its maximum capacity.
   */
  add(warning: ExportWarning): void {
    // Suppress by code
    if (this.options.suppressCodes?.includes(warning.code)) {
      return;
    }

    // Enforce minimum level
    if (
      this.options.minLevel != null &&
      LEVEL_PRIORITY[warning.level] > LEVEL_PRIORITY[this.options.minLevel]
    ) {
      return;
    }

    // Enforce capacity
    if (
      this.options.maxWarnings != null &&
      this.warnings.length >= this.options.maxWarnings
    ) {
      return;
    }

    this.warnings.push(warning);
  }

  /** Convenience method to add an error-level warning. */
  addError(code: string, message: string, context?: string): void {
    this.add({ level: 'error', code, message, context });
  }

  /** Convenience method to add a warning-level warning. */
  addWarning(code: string, message: string, context?: string): void {
    this.add({ level: 'warning', code, message, context });
  }

  /** Convenience method to add an info-level warning. */
  addInfo(code: string, message: string, context?: string): void {
    this.add({ level: 'info', code, message, context });
  }

  /** Return all collected warnings. */
  getAll(): ExportWarning[] {
    return [...this.warnings];
  }

  /** Return only error-level warnings. */
  getErrors(): ExportWarning[] {
    return this.warnings.filter((w) => w.level === 'error');
  }

  /** Return only warning-level warnings. */
  getWarnings(): ExportWarning[] {
    return this.warnings.filter((w) => w.level === 'warning');
  }

  /** True if at least one error has been collected. */
  hasErrors(): boolean {
    return this.warnings.some((w) => w.level === 'error');
  }

  /** Total number of collected warnings (all levels). */
  count(): number {
    return this.warnings.length;
  }

  /** Remove all collected warnings. */
  clear(): void {
    this.warnings = [];
  }

  /**
   * Return a human-readable summary string.
   *
   * @returns A string like `"2 errors, 5 warnings, 1 info"`.
   */
  toSummary(): string {
    const errors = this.warnings.filter((w) => w.level === 'error').length;
    const warns = this.warnings.filter((w) => w.level === 'warning').length;
    const infos = this.warnings.filter((w) => w.level === 'info').length;

    return `${errors} error${errors !== 1 ? 's' : ''}, ${warns} warning${warns !== 1 ? 's' : ''}, ${infos} info${infos !== 1 ? 's' : ''}`;
  }
}

// ============================================================================
// Warning Code Constants
// ============================================================================

/**
 * Standard warning codes used throughout the DOCX export pipeline.
 *
 * Using these constants ensures consistency across handlers and makes
 * it easy to suppress specific categories via {@link WarningCollectorOptions.suppressCodes}.
 */
export const WARNING_CODES = {
  /** An HTML element has no corresponding DOCX handler. */
  UNSUPPORTED_ELEMENT: 'UNSUPPORTED_ELEMENT',
  /** An image could not be loaded or decoded. */
  IMAGE_LOAD_FAILED: 'IMAGE_LOAD_FAILED',
  /** A CSS style could not be mapped to a DOCX formatting property. */
  STYLE_CONVERSION_FAILED: 'STYLE_CONVERSION_FAILED',
  /** A hyperlink URL is malformed or empty. */
  INVALID_LINK: 'INVALID_LINK',
  /** A table is nested inside another table (limited Word support). */
  NESTED_TABLE: 'NESTED_TABLE',
  /** An image exceeds the recommended maximum dimensions. */
  LARGE_IMAGE: 'LARGE_IMAGE',
  /** A referenced font is not available in the document's font table. */
  MISSING_FONT: 'MISSING_FONT',
  /** Track changes data is incomplete or inconsistent. */
  TRACK_CHANGES_INCOMPLETE: 'TRACK_CHANGES_INCOMPLETE',
  /** A comment reference has no matching comment range in the document. */
  COMMENT_ORPHANED: 'COMMENT_ORPHANED',
  /** A math expression was rendered using a fallback method. */
  MATH_FALLBACK: 'MATH_FALLBACK',
  /** An Excalidraw drawing was rendered using a fallback method. */
  EXCALIDRAW_FALLBACK: 'EXCALIDRAW_FALLBACK',
} as const;
