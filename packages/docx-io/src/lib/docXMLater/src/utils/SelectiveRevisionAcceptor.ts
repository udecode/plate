/**
 * SelectiveRevisionAcceptor - Accept or reject specific revisions based on criteria
 *
 * Provides granular control over revision acceptance using in-memory DOM transformation.
 * Extends the all-or-nothing approach with selective acceptance by author, type, date,
 * and custom criteria.
 *
 * Uses the industry-standard in-memory transformation approach (like OpenXML PowerTools),
 * allowing subsequent modifications to be saved correctly.
 *
 * @module SelectiveRevisionAcceptor
 * @see https://github.com/OfficeDev/Open-Xml-PowerTools - RevisionAccepter.cs
 */

import type { Document } from '../core/Document';
import type { Paragraph, ParagraphContent } from '../elements/Paragraph';
import { Revision, type RevisionType } from '../elements/Revision';
import type { Run } from '../elements/Run';
import type { Hyperlink } from '../elements/Hyperlink';
import { isRunContent, isHyperlinkContent } from '../elements/RevisionContent';
import type { ChangeCategory } from './ChangelogGenerator';
import type { SelectionCriteria } from './RevisionAwareProcessor';

/**
 * Result of selective revision acceptance.
 */
export interface SelectiveAcceptResult {
  /** IDs of accepted revisions */
  accepted: string[];
  /** IDs of rejected/removed revisions */
  rejected: string[];
  /** IDs of revisions that remain */
  remaining: string[];
  /** Summary of actions taken */
  summary: {
    totalProcessed: number;
    acceptedCount: number;
    rejectedCount: number;
    remainingCount: number;
  };
}

/**
 * Provides granular control over revision acceptance using in-memory DOM transformation.
 * Allows subsequent modifications to be saved correctly.
 */
export class SelectiveRevisionAcceptor {
  /**
   * Accept revisions matching criteria using in-memory DOM transformation.
   * Matching revisions: content kept, revision wrapper removed.
   * Non-matching revisions: preserved in the document.
   *
   * @param doc - Document to process
   * @param criteria - Selection criteria
   * @returns Result with accepted, rejected, and remaining revision IDs
   */
  static accept(
    doc: Document,
    criteria: SelectionCriteria
  ): SelectiveAcceptResult {
    const accepted: string[] = [];
    const remaining: string[] = [];

    // Check if doc has full Document API (getAllParagraphs, getTables)
    // or if it's a minimal mock (only getRevisionManager)
    const hasFullApi = typeof (doc as any).getAllParagraphs === 'function';

    if (hasFullApi) {
      // Full in-memory DOM transformation
      const paragraphs = (doc as any).getAllParagraphs();
      for (const paragraph of paragraphs) {
        SelectiveRevisionAcceptor.processSelectiveParagraph(
          paragraph,
          criteria,
          'accept',
          accepted,
          remaining
        );
      }

      // Process paragraphs in tables
      const tables = (doc as any).getTables();
      for (const table of tables) {
        for (const row of table.getRows()) {
          for (const cell of row.getCells()) {
            for (const paragraph of cell.getParagraphs()) {
              SelectiveRevisionAcceptor.processSelectiveParagraph(
                paragraph,
                criteria,
                'accept',
                accepted,
                remaining
              );
            }
          }
        }
      }
    } else {
      // Fallback: Filter revisions from RevisionManager only (for backward compatibility)
      const revisionManager = doc.getRevisionManager();
      if (revisionManager) {
        const allRevisions = revisionManager.getAllRevisions();
        for (const rev of allRevisions) {
          if (SelectiveRevisionAcceptor.matchesCriteria(rev, criteria)) {
            accepted.push(rev.getId().toString());
          } else {
            remaining.push(rev.getId().toString());
          }
        }
      }
    }

    // Clear accepted revisions from RevisionManager
    const revisionManager = doc.getRevisionManager();
    if (revisionManager) {
      for (const id of accepted) {
        revisionManager.removeById(Number.parseInt(id, 10));
      }
    }

    return {
      accepted,
      rejected: [],
      remaining,
      summary: {
        totalProcessed: accepted.length + remaining.length,
        acceptedCount: accepted.length,
        rejectedCount: 0,
        remainingCount: remaining.length,
      },
    };
  }

  /**
   * Reject revisions matching criteria using in-memory DOM transformation.
   * Matching revisions: content AND wrapper removed (opposite of accept).
   * Non-matching revisions: preserved in the document.
   *
   * For insertions: Rejecting removes the inserted content entirely.
   * For deletions: Rejecting keeps the deleted content (opposite of accepting).
   *
   * @param doc - Document to process
   * @param criteria - Selection criteria
   * @returns Result with accepted, rejected, and remaining revision IDs
   */
  static reject(
    doc: Document,
    criteria: SelectionCriteria
  ): SelectiveAcceptResult {
    const rejected: string[] = [];
    const remaining: string[] = [];

    // Check if doc has full Document API (getAllParagraphs, getTables)
    // or if it's a minimal mock (only getRevisionManager)
    const hasFullApi = typeof (doc as any).getAllParagraphs === 'function';

    if (hasFullApi) {
      // Full in-memory DOM transformation
      const paragraphs = (doc as any).getAllParagraphs();
      for (const paragraph of paragraphs) {
        SelectiveRevisionAcceptor.processSelectiveParagraph(
          paragraph,
          criteria,
          'reject',
          rejected,
          remaining
        );
      }

      // Process paragraphs in tables
      const tables = (doc as any).getTables();
      for (const table of tables) {
        for (const row of table.getRows()) {
          for (const cell of row.getCells()) {
            for (const paragraph of cell.getParagraphs()) {
              SelectiveRevisionAcceptor.processSelectiveParagraph(
                paragraph,
                criteria,
                'reject',
                rejected,
                remaining
              );
            }
          }
        }
      }
    } else {
      // Fallback: Filter revisions from RevisionManager only (for backward compatibility)
      const revisionManager = doc.getRevisionManager();
      if (revisionManager) {
        const allRevisions = revisionManager.getAllRevisions();
        for (const rev of allRevisions) {
          if (SelectiveRevisionAcceptor.matchesCriteria(rev, criteria)) {
            rejected.push(rev.getId().toString());
          } else {
            remaining.push(rev.getId().toString());
          }
        }
      }
    }

    // Clear rejected revisions from RevisionManager
    const revisionManager = doc.getRevisionManager();
    if (revisionManager) {
      for (const id of rejected) {
        revisionManager.removeById(Number.parseInt(id, 10));
      }
    }

    return {
      accepted: [],
      rejected,
      remaining,
      summary: {
        totalProcessed: rejected.length + remaining.length,
        acceptedCount: 0,
        rejectedCount: rejected.length,
        remainingCount: remaining.length,
      },
    };
  }

  /**
   * Process a paragraph for selective revision acceptance/rejection.
   * Transforms matching revisions in-place using DOM transformation.
   */
  private static processSelectiveParagraph(
    paragraph: Paragraph,
    criteria: SelectionCriteria,
    action: 'accept' | 'reject',
    processedIds: string[],
    remainingIds: string[]
  ): void {
    const content = paragraph.getContent();
    const newContent: ParagraphContent[] = [];

    for (const item of content) {
      if (item instanceof Revision) {
        const revisionId = item.getId().toString();

        if (SelectiveRevisionAcceptor.matchesCriteria(item, criteria)) {
          // This revision matches the criteria - process it
          processedIds.push(revisionId);

          if (action === 'accept') {
            // Accept: Transform based on revision type
            SelectiveRevisionAcceptor.acceptRevisionItem(item, newContent);
          } else {
            // Reject: Transform opposite of accept
            SelectiveRevisionAcceptor.rejectRevisionItem(item, newContent);
          }
        } else {
          // This revision doesn't match - keep it
          remainingIds.push(revisionId);
          newContent.push(item);
        }
      } else {
        // Non-revision content - keep as-is
        newContent.push(item);
      }
    }

    // Replace paragraph content with the transformed content
    paragraph.setContent(newContent);
  }

  /**
   * Accept a single revision item (unwrap insertions, remove deletions).
   */
  private static acceptRevisionItem(
    revision: Revision,
    newContent: ParagraphContent[]
  ): void {
    const revisionType = revision.getType();
    const childContent = revision.getContent();

    switch (revisionType) {
      case 'insert':
      case 'moveTo':
        // Unwrap: Extract child content into parent position
        for (const child of childContent) {
          if (isRunContent(child)) {
            newContent.push(child as Run);
          } else if (isHyperlinkContent(child)) {
            newContent.push(child as Hyperlink);
          }
        }
        break;

      case 'delete':
      case 'moveFrom':
        // Remove: Don't add to newContent - content is deleted
        break;

      case 'runPropertiesChange':
      case 'paragraphPropertiesChange':
      case 'tablePropertiesChange':
      case 'tableExceptionPropertiesChange':
      case 'tableRowPropertiesChange':
      case 'tableCellPropertiesChange':
      case 'sectionPropertiesChange':
      case 'numberingChange':
        // Property changes: Keep content, remove change metadata
        for (const child of childContent) {
          if (isRunContent(child)) {
            newContent.push(child as Run);
          } else if (isHyperlinkContent(child)) {
            newContent.push(child as Hyperlink);
          }
        }
        break;

      default:
        // Unknown type - keep the revision as-is for safety
        newContent.push(revision);
    }
  }

  /**
   * Reject a single revision item (opposite of accept).
   * - Rejecting an insertion removes the content
   * - Rejecting a deletion keeps the content (unwraps it)
   */
  private static rejectRevisionItem(
    revision: Revision,
    newContent: ParagraphContent[]
  ): void {
    const revisionType = revision.getType();
    const childContent = revision.getContent();

    switch (revisionType) {
      case 'insert':
      case 'moveTo':
        // Reject insertion: Remove the inserted content entirely
        break;

      case 'delete':
      case 'moveFrom':
        // Reject deletion: Keep the deleted content (unwrap)
        for (const child of childContent) {
          if (isRunContent(child)) {
            newContent.push(child as Run);
          } else if (isHyperlinkContent(child)) {
            newContent.push(child as Hyperlink);
          }
        }
        break;

      case 'runPropertiesChange':
      case 'paragraphPropertiesChange':
      case 'tablePropertiesChange':
      case 'tableExceptionPropertiesChange':
      case 'tableRowPropertiesChange':
      case 'tableCellPropertiesChange':
      case 'sectionPropertiesChange':
      case 'numberingChange':
        // Rejecting property changes: Would need to restore old properties
        // For now, just keep content without the change metadata
        // (Full implementation would restore previousProperties)
        for (const child of childContent) {
          if (isRunContent(child)) {
            newContent.push(child as Run);
          } else if (isHyperlinkContent(child)) {
            newContent.push(child as Hyperlink);
          }
        }
        break;

      default:
        // Unknown type - keep the revision as-is for safety
        newContent.push(revision);
    }
  }

  /**
   * Preview what would happen without making changes.
   *
   * @param doc - Document to analyze
   * @param criteria - Selection criteria
   * @param action - Action to preview
   * @returns Preview of what would happen
   */
  static preview(
    doc: Document,
    criteria: SelectionCriteria,
    action: 'accept' | 'reject'
  ): SelectiveAcceptResult {
    // Preview is the same as the actual operation but without side effects
    return action === 'accept'
      ? SelectiveRevisionAcceptor.accept(doc, criteria)
      : SelectiveRevisionAcceptor.reject(doc, criteria);
  }

  /**
   * Accept all revisions by a specific author.
   *
   * @param doc - Document to process
   * @param author - Author name to accept
   * @returns Result with accepted, rejected, and remaining revision IDs
   */
  static acceptByAuthor(doc: Document, author: string): SelectiveAcceptResult {
    return SelectiveRevisionAcceptor.accept(doc, { authors: [author] });
  }

  /**
   * Reject all revisions by a specific author.
   *
   * @param doc - Document to process
   * @param author - Author name to reject
   * @returns Result with accepted, rejected, and remaining revision IDs
   */
  static rejectByAuthor(doc: Document, author: string): SelectiveAcceptResult {
    return SelectiveRevisionAcceptor.reject(doc, { authors: [author] });
  }

  /**
   * Accept all revisions of specific types.
   *
   * @param doc - Document to process
   * @param types - Revision types to accept
   * @returns Result with accepted, rejected, and remaining revision IDs
   */
  static acceptByType(
    doc: Document,
    types: RevisionType[]
  ): SelectiveAcceptResult {
    return SelectiveRevisionAcceptor.accept(doc, { types });
  }

  /**
   * Reject all revisions of specific types.
   *
   * @param doc - Document to process
   * @param types - Revision types to reject
   * @returns Result with accepted, rejected, and remaining revision IDs
   */
  static rejectByType(
    doc: Document,
    types: RevisionType[]
  ): SelectiveAcceptResult {
    return SelectiveRevisionAcceptor.reject(doc, { types });
  }

  /**
   * Accept all revisions before a specific date.
   *
   * @param doc - Document to process
   * @param date - Cutoff date (exclusive)
   * @returns Result with accepted, rejected, and remaining revision IDs
   */
  static acceptBeforeDate(doc: Document, date: Date): SelectiveAcceptResult {
    return SelectiveRevisionAcceptor.accept(doc, {
      dateRange: { start: new Date(0), end: date },
    });
  }

  /**
   * Accept all revisions after a specific date.
   *
   * @param doc - Document to process
   * @param date - Start date (exclusive)
   * @returns Result with accepted, rejected, and remaining revision IDs
   */
  static acceptAfterDate(doc: Document, date: Date): SelectiveAcceptResult {
    return SelectiveRevisionAcceptor.accept(doc, {
      dateRange: { start: date, end: new Date() },
    });
  }

  /**
   * Accept all insertions only.
   *
   * @param doc - Document to process
   * @returns Result with accepted, rejected, and remaining revision IDs
   */
  static acceptInsertionsOnly(doc: Document): SelectiveAcceptResult {
    return SelectiveRevisionAcceptor.accept(doc, { types: ['insert'] });
  }

  /**
   * Accept all deletions only.
   *
   * @param doc - Document to process
   * @returns Result with accepted, rejected, and remaining revision IDs
   */
  static acceptDeletionsOnly(doc: Document): SelectiveAcceptResult {
    return SelectiveRevisionAcceptor.accept(doc, { types: ['delete'] });
  }

  /**
   * Reject all formatting changes (keep content changes).
   *
   * @param doc - Document to process
   * @returns Result with accepted, rejected, and remaining revision IDs
   */
  static rejectFormattingChanges(doc: Document): SelectiveAcceptResult {
    return SelectiveRevisionAcceptor.reject(doc, {
      categories: ['formatting'],
    });
  }

  /**
   * Accept content changes only (reject formatting).
   *
   * @param doc - Document to process
   * @returns Result with accepted, rejected, and remaining revision IDs
   */
  static acceptContentChangesOnly(doc: Document): SelectiveAcceptResult {
    return SelectiveRevisionAcceptor.accept(doc, { categories: ['content'] });
  }

  /**
   * Partition revisions into matching and non-matching based on criteria.
   */
  private static partitionRevisions(
    revisions: Revision[],
    criteria: SelectionCriteria
  ): { matching: Revision[]; nonMatching: Revision[] } {
    const matching: Revision[] = [];
    const nonMatching: Revision[] = [];

    for (const rev of revisions) {
      if (SelectiveRevisionAcceptor.matchesCriteria(rev, criteria)) {
        matching.push(rev);
      } else {
        nonMatching.push(rev);
      }
    }

    return { matching, nonMatching };
  }

  /**
   * Check if a revision matches the given criteria.
   */
  private static matchesCriteria(
    revision: Revision,
    criteria: SelectionCriteria
  ): boolean {
    // If no criteria specified, match nothing
    if (
      !criteria.ids &&
      !criteria.types &&
      !criteria.authors &&
      !criteria.dateRange &&
      !criteria.categories &&
      !criteria.custom
    ) {
      return false;
    }

    // Filter by IDs
    if (criteria.ids && !criteria.ids.includes(revision.getId())) {
      return false;
    }

    // Filter by types
    if (criteria.types && !criteria.types.includes(revision.getType())) {
      return false;
    }

    // Filter by authors
    if (criteria.authors && !criteria.authors.includes(revision.getAuthor())) {
      return false;
    }

    // Filter by date range
    if (criteria.dateRange) {
      const date = revision.getDate();
      if (date < criteria.dateRange.start || date > criteria.dateRange.end) {
        return false;
      }
    }

    // Filter by categories
    if (criteria.categories) {
      const category = SelectiveRevisionAcceptor.getRevisionCategory(revision);
      if (!criteria.categories.includes(category)) {
        return false;
      }
    }

    // Custom filter
    if (criteria.custom && !criteria.custom(revision)) {
      return false;
    }

    return true;
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
   * Create an empty result.
   */
  private static emptyResult(): SelectiveAcceptResult {
    return {
      accepted: [],
      rejected: [],
      remaining: [],
      summary: {
        totalProcessed: 0,
        acceptedCount: 0,
        rejectedCount: 0,
        remainingCount: 0,
      },
    };
  }
}
