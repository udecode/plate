/**
 * RevisionAwareProcessor - Handles document revisions before and during processing
 *
 * Provides three modes for handling existing Word tracked changes:
 * - accept_all: Accept all revisions before processing (default)
 * - preserve: Preserve revisions, skip conflicting operations
 * - preserve_and_wrap: Preserve revisions, wrap conflicts in new revisions
 *
 * Implements ECMA-376 compliant revision handling.
 *
 * @module RevisionAwareProcessor
 */

import type { Document } from '../core/Document';
import { Revision, RevisionType } from '../elements/Revision';
import { RevisionManager } from '../elements/RevisionManager';
import { ChangeCategory, ChangeLocation } from './ChangelogGenerator';

/**
 * Revision handling modes for document processing.
 */
export type RevisionHandlingMode =
  | 'accept_all'        // Accept all revisions before processing
  | 'preserve'          // Preserve revisions, skip conflicting operations
  | 'preserve_and_wrap'; // Preserve revisions, wrap conflicts in new revisions

/**
 * Options for revision-aware processing.
 */
export interface RevisionProcessingOptions {
  /** How to handle existing revisions */
  mode: RevisionHandlingMode;
  /** Author name for new revisions (required for 'preserve_and_wrap' mode) */
  author?: string;
  /** Selective acceptance criteria (optional, for partial acceptance) */
  acceptCriteria?: SelectionCriteria;
}

/**
 * Criteria for selecting specific revisions.
 */
export interface SelectionCriteria {
  /** Specific revision IDs */
  ids?: number[];
  /** Filter by revision types */
  types?: RevisionType[];
  /** Filter by authors */
  authors?: string[];
  /** Filter by date range */
  dateRange?: { start: Date; end: Date };
  /** Filter by category */
  categories?: ChangeCategory[];
  /** Custom filter function */
  custom?: (revision: Revision) => boolean;
}

/**
 * Result of revision-aware processing.
 */
export interface RevisionProcessingResult {
  /** Whether processing completed successfully */
  success: boolean;
  /** IDs of revisions that were accepted */
  acceptedRevisions: string[];
  /** IDs of revisions that were preserved */
  preservedRevisions: string[];
  /** IDs of new revisions created (preserve_and_wrap mode) */
  newRevisions: string[];
  /** Conflicts encountered during processing */
  conflicts: ConflictInfo[];
  /** Processing log entries */
  log: ProcessingLogEntry[];
}

/**
 * Information about a conflict between an operation and a revision.
 */
export interface ConflictInfo {
  /** Description of the operation that conflicted */
  operation: string;
  /** ID of the conflicting revision */
  revisionId: string;
  /** How the conflict was resolved */
  resolution: 'accepted' | 'skipped' | 'wrapped';
  /** Location of the conflict */
  location: ChangeLocation;
}

/**
 * Log entry for processing actions.
 */
export interface ProcessingLogEntry {
  timestamp: Date;
  action: string;
  details: string;
  revisionId?: string;
}

/**
 * Handles document revisions before and during processing.
 * Implements ECMA-376 compliant revision handling.
 */
export class RevisionAwareProcessor {
  /**
   * Prepare document for processing by handling revisions.
   * Call this before applying any document modifications.
   *
   * @param doc - Document to prepare
   * @param options - Processing options
   * @returns Processing result with details of actions taken
   */
  static async prepare(
    doc: Document,
    options: RevisionProcessingOptions
  ): Promise<RevisionProcessingResult> {
    const log: ProcessingLogEntry[] = [];
    const acceptedRevisions: string[] = [];
    const preservedRevisions: string[] = [];
    const newRevisions: string[] = [];
    const conflicts: ConflictInfo[] = [];

    const addLog = (action: string, details: string, revisionId?: string) => {
      log.push({
        timestamp: new Date(),
        action,
        details,
        revisionId,
      });
    };

    addLog('start', `Starting revision processing with mode: ${options.mode}`);

    try {
      const revisionManager = doc.getRevisionManager();
      const hasInMemoryRevisions = revisionManager?.hasRevisions() ?? false;
      const hasRawXmlRevisions = doc.hasRawXmlRevisions();

      // Check both in-memory model AND raw XML for revisions
      // Raw XML may contain revisions that weren't fully parsed into memory
      if (!hasInMemoryRevisions && !hasRawXmlRevisions) {
        addLog('complete', 'No revisions found in document');
        return {
          success: true,
          acceptedRevisions,
          preservedRevisions,
          newRevisions,
          conflicts,
          log,
        };
      }

      const allRevisions = revisionManager?.getAllRevisions() ?? [];
      const inMemoryCount = allRevisions.length;
      const rawXmlNote = hasRawXmlRevisions ? ' (raw XML contains revision markup)' : '';
      addLog('info', `Found ${inMemoryCount} parsed revisions in document${rawXmlNote}`);

      switch (options.mode) {
        case 'accept_all':
          // Accept all revisions
          await this.acceptAllRevisions(doc, allRevisions, acceptedRevisions, addLog);
          break;

        case 'preserve':
          // Preserve all revisions by preventing document.xml regeneration
          // This keeps the original XML with w:ins/w:del elements intact
          for (const rev of allRevisions) {
            preservedRevisions.push(rev.getId().toString());
          }
          doc.preserveRawXml();
          addLog('complete', `Preserved ${preservedRevisions.length} revisions (raw XML preservation enabled)`);
          break;

        case 'preserve_and_wrap':
          // Preserve all revisions, track for later wrapping
          // Also enable raw XML preservation to keep existing revisions
          for (const rev of allRevisions) {
            preservedRevisions.push(rev.getId().toString());
          }
          doc.preserveRawXml();
          addLog('info', `Will preserve and wrap conflicts for ${preservedRevisions.length} revisions`);
          addLog('info', `New revisions will be authored by: ${options.author || 'Unknown'}`);
          break;

        default:
          addLog('error', `Unknown processing mode: ${options.mode}`);
          return {
            success: false,
            acceptedRevisions,
            preservedRevisions,
            newRevisions,
            conflicts,
            log,
          };
      }

      addLog('complete', 'Revision processing completed successfully');

      return {
        success: true,
        acceptedRevisions,
        preservedRevisions,
        newRevisions,
        conflicts,
        log,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', `Processing failed: ${errorMessage}`);

      return {
        success: false,
        acceptedRevisions,
        preservedRevisions,
        newRevisions,
        conflicts,
        log,
      };
    }
  }

  /**
   * Accept all revisions in the document using Document.acceptAllRevisions().
   *
   * This delegates to Document.acceptAllRevisions() which uses in-memory DOM transformation
   * (the industry-standard approach used by OpenXML PowerTools, Aspose.Words, etc.):
   *
   * 1. Transforms Revision objects in paragraph.content arrays
   * 2. Insertions (w:ins): Unwraps content - keeps Runs/Hyperlinks, removes Revision wrapper
   * 3. Deletions (w:del): Removes content entirely from the model
   * 4. Move operations: moveFrom removed, moveTo unwrapped
   * 5. Property changes: Removes change metadata, keeps current formatting
   *
   * This approach allows subsequent modifications to be saved correctly because the
   * in-memory model is transformed (not raw XML), so save() regenerates document.xml
   * with both the accepted changes AND any subsequent modifications.
   *
   * @see https://github.com/OfficeDev/Open-Xml-PowerTools - RevisionAccepter.cs
   * @see https://learn.microsoft.com/en-us/previous-versions/office/developer/office-2007/ee836138
   */
  private static async acceptAllRevisions(
    doc: Document,
    revisions: Revision[],
    acceptedIds: string[],
    addLog: (action: string, details: string, revisionId?: string) => void
  ): Promise<void> {
    addLog('info', 'Accepting all revisions using in-memory DOM transformation');

    // Track accepted revision IDs before acceptance (for logging)
    for (const rev of revisions) {
      acceptedIds.push(rev.getId().toString());
    }

    // Use Document.acceptAllRevisions() which uses in-memory transformation
    // This allows subsequent modifications to be saved correctly
    await doc.acceptAllRevisions();

    // Log each accepted revision
    for (const id of acceptedIds) {
      addLog('accept', `Accepted revision ${id}`, id);
    }

    addLog('complete', `Accepted ${acceptedIds.length} revisions (in-memory transformation)`);
  }

  /**
   * Accept revisions matching the given criteria.
   * Uses existing RevisionAcceptor under the hood.
   *
   * @param doc - Document to process
   * @param criteria - Selection criteria
   * @returns Array of accepted revision IDs
   */
  static acceptSelective(
    doc: Document,
    criteria: SelectionCriteria
  ): string[] {
    const revisionManager = doc.getRevisionManager();
    if (!revisionManager) {
      return [];
    }

    const allRevisions = revisionManager.getAllRevisions();
    const matchingRevisions = this.filterRevisions(allRevisions, criteria);

    const acceptedIds: string[] = [];
    for (const rev of matchingRevisions) {
      acceptedIds.push(rev.getId().toString());
      // Note: Actual acceptance would require XML manipulation
      // For now, this returns which revisions WOULD be accepted
    }

    return acceptedIds;
  }

  /**
   * Filter revisions based on criteria.
   */
  private static filterRevisions(
    revisions: Revision[],
    criteria: SelectionCriteria
  ): Revision[] {
    return revisions.filter(rev => {
      // Filter by IDs
      if (criteria.ids && !criteria.ids.includes(rev.getId())) {
        return false;
      }

      // Filter by types
      if (criteria.types && !criteria.types.includes(rev.getType())) {
        return false;
      }

      // Filter by authors
      if (criteria.authors && !criteria.authors.includes(rev.getAuthor())) {
        return false;
      }

      // Filter by date range
      if (criteria.dateRange) {
        const date = rev.getDate();
        if (date < criteria.dateRange.start || date > criteria.dateRange.end) {
          return false;
        }
      }

      // Filter by categories
      if (criteria.categories) {
        const category = this.getRevisionCategory(rev);
        if (!criteria.categories.includes(category)) {
          return false;
        }
      }

      // Custom filter
      if (criteria.custom && !criteria.custom(rev)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Get the semantic category of a revision.
   */
  private static getRevisionCategory(revision: Revision): ChangeCategory {
    const type = revision.getType();

    if (type === 'insert' || type === 'delete') {
      return 'content';
    }
    if (
      type === 'runPropertiesChange' ||
      type === 'paragraphPropertiesChange' ||
      type === 'numberingChange'
    ) {
      return 'formatting';
    }
    if (
      type === 'moveFrom' ||
      type === 'moveTo' ||
      type === 'sectionPropertiesChange'
    ) {
      return 'structural';
    }
    if (
      type === 'tablePropertiesChange' ||
      type === 'tableExceptionPropertiesChange' ||
      type === 'tableRowPropertiesChange' ||
      type === 'tableCellPropertiesChange' ||
      type === 'tableCellInsert' ||
      type === 'tableCellDelete' ||
      type === 'tableCellMerge'
    ) {
      return 'table';
    }

    return 'content';
  }

  /**
   * Check if an operation at the given location would conflict with any revision.
   *
   * @param doc - Document to check
   * @param paragraphIndex - Paragraph index
   * @param runIndex - Optional run index
   * @returns Conflicting revision or null
   */
  static checkConflict(
    doc: Document,
    paragraphIndex: number,
    runIndex?: number
  ): Revision | null {
    const revisionManager = doc.getRevisionManager();
    if (!revisionManager) {
      return null;
    }

    // Get revisions that might affect this paragraph
    const revisions = revisionManager.getRevisionsForParagraph(paragraphIndex);

    // For now, return the first revision at this location
    // In a more complete implementation, we would check run-level conflicts
    return revisions.length > 0 ? revisions[0]! : null;
  }

  /**
   * Get all revisions that would be affected by an operation.
   *
   * @param doc - Document to check
   * @param paragraphIndex - Paragraph index
   * @param runIndex - Optional run index
   * @returns Array of affected revisions
   */
  static getAffectedRevisions(
    doc: Document,
    paragraphIndex: number,
    runIndex?: number
  ): Revision[] {
    const revisionManager = doc.getRevisionManager();
    if (!revisionManager) {
      return [];
    }

    return revisionManager.getRevisionsForParagraph(paragraphIndex);
  }

  /**
   * Wrap content in a new revision (for preserve_and_wrap mode).
   * Creates a new revision tracking the change.
   *
   * @param doc - Document to modify
   * @param paragraphIndex - Paragraph index
   * @param runIndex - Run index
   * @param author - Author for the new revision
   * @param type - Type of revision to create
   * @returns ID of the new revision
   */
  static wrapInRevision(
    doc: Document,
    paragraphIndex: number,
    runIndex: number,
    author: string,
    type: 'insert' | 'delete'
  ): string {
    const revisionManager = doc.getRevisionManager();
    if (!revisionManager) {
      throw new Error('Document does not have a revision manager');
    }

    // Get the paragraphs from the document
    const paragraphs = doc.getParagraphs();
    if (paragraphIndex < 0 || paragraphIndex >= paragraphs.length) {
      throw new Error(`Invalid paragraph index: ${paragraphIndex}`);
    }

    const paragraph = paragraphs[paragraphIndex];
    if (!paragraph) {
      throw new Error(`Paragraph at index ${paragraphIndex} not found`);
    }

    const runs = paragraph.getRuns();
    if (runIndex < 0 || runIndex >= runs.length) {
      throw new Error(`Invalid run index: ${runIndex}`);
    }

    const run = runs[runIndex];
    if (!run) {
      throw new Error(`Run at index ${runIndex} not found`);
    }

    // Create new revision
    const revision = new Revision({
      author,
      type,
      content: run,
      date: new Date(),
    });

    // Register with manager
    revisionManager.register(revision);

    return revision.getId().toString();
  }

  /**
   * Check if document has any tracked changes.
   *
   * @param doc - Document to check
   * @returns True if document has tracked changes
   */
  static hasTrackedChanges(doc: Document): boolean {
    const revisionManager = doc.getRevisionManager();
    return revisionManager ? revisionManager.hasRevisions() : false;
  }

  /**
   * Get summary of tracked changes in document.
   *
   * @param doc - Document to summarize
   * @returns Summary object or null if no revision manager
   */
  static getTrackedChangesSummary(doc: Document): {
    total: number;
    insertions: number;
    deletions: number;
    formatting: number;
    moves: number;
    authors: string[];
  } | null {
    const revisionManager = doc.getRevisionManager();
    if (!revisionManager) {
      return null;
    }

    const summary = revisionManager.getSummary();
    return {
      total: summary.total,
      insertions: summary.byType.insertions,
      deletions: summary.byType.deletions,
      formatting: summary.byType.propertyChanges,
      moves: summary.byType.moves,
      authors: summary.authors,
    };
  }
}
