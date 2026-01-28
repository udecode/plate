/**
 * InMemoryRevisionAcceptor - Accept revisions by transforming the in-memory object model
 *
 * This approach follows the industry standard (OpenXML PowerTools, Aspose.Words):
 * - Transforms Revision objects in paragraph.content[] to their "accepted" state
 * - For insertions: Unwrap - extract child Runs/Hyperlinks into parent paragraph
 * - For deletions: Remove - delete the revision and its content from the model
 * - For property changes: Remove the change metadata, keep the current formatting
 *
 * Unlike the raw XML approach (acceptRevisions.ts), this allows subsequent modifications
 * to the in-memory model to be correctly serialized on save().
 *
 * @see https://github.com/OfficeDev/Open-Xml-PowerTools - RevisionAccepter.cs
 * @see https://learn.microsoft.com/en-us/previous-versions/office/developer/office-2007/ee836138(v=office.12)
 */

import type { Document } from '../core/Document';
import { Paragraph } from '../elements/Paragraph';
import type { ParagraphContent } from '../elements/Paragraph';
import { Revision, RevisionType } from '../elements/Revision';
import type { Run } from '../elements/Run';
import type { Hyperlink } from '../elements/Hyperlink';
import { isRunContent, isHyperlinkContent, isImageRunContent } from '../elements/RevisionContent';
import type { ImageRun } from '../elements/ImageRun';
import { Table } from '../elements/Table';
import { getGlobalLogger, createScopedLogger, ILogger } from './logger';

/**
 * Get scoped logger for this module
 */
function getLogger(): ILogger {
  return createScopedLogger(getGlobalLogger(), 'InMemoryRevisionAcceptor');
}

/**
 * Options for accepting revisions
 */
export interface AcceptRevisionsOptions {
  /** Accept insertion revisions (w:ins) - default: true */
  acceptInsertions?: boolean;
  /** Accept deletion revisions (w:del) - default: true */
  acceptDeletions?: boolean;
  /** Accept move operations (w:moveFrom, w:moveTo) - default: true */
  acceptMoves?: boolean;
  /** Accept property change revisions (rPrChange, pPrChange, etc.) - default: true */
  acceptPropertyChanges?: boolean;
  /** Remove empty tables after revision acceptance - default: true */
  cleanupEmptyTables?: boolean;
}

/**
 * Result of accepting revisions
 */
export interface AcceptRevisionsResult {
  /** Number of insertions accepted */
  insertionsAccepted: number;
  /** Number of deletions accepted */
  deletionsAccepted: number;
  /** Number of move operations accepted */
  movesAccepted: number;
  /** Number of property changes accepted */
  propertyChangesAccepted: number;
  /** Total revisions processed */
  totalAccepted: number;
  /** Number of empty tables removed during cleanup */
  emptyTablesRemoved: number;
}

/**
 * Revision types that represent content changes (contain actual text/runs)
 */
const CONTENT_REVISION_TYPES: RevisionType[] = [
  'insert',
  'delete',
  'moveFrom',
  'moveTo',
];

/**
 * Revision types that represent property/formatting changes
 */
const PROPERTY_REVISION_TYPES: RevisionType[] = [
  'runPropertiesChange',
  'paragraphPropertiesChange',
  'tablePropertiesChange',
  'tableExceptionPropertiesChange',
  'tableRowPropertiesChange',
  'tableCellPropertiesChange',
  'sectionPropertiesChange',
  'numberingChange',
];

/**
 * Strip revision markup from raw XML string.
 * Used for nested tables stored as raw XML that cannot be processed via the in-memory model.
 *
 * Follows the same rules as the main revision acceptor:
 * - Insertions: Keep content, remove wrapper tags
 * - Deletions: Remove entirely (content and tags)
 * - MoveFrom: Remove entirely (source of move)
 * - MoveTo: Keep content, remove wrapper
 * - Property changes: Remove change tracking elements
 * - Range markers: Remove boundary markers
 *
 * @param xml - Raw XML string containing revision markup
 * @returns Cleaned XML with revisions accepted
 */
export function stripRevisionsFromXml(xml: string): string {
  let result = xml;

  // Step 1: Remove range markers (must be done first)
  const rangePatterns = [
    /<w:moveFromRangeStart[^>]*(?:\/>|>.*?<\/w:moveFromRangeStart>)/gs,
    /<w:moveFromRangeEnd[^>]*(?:\/>|>.*?<\/w:moveFromRangeEnd>)/gs,
    /<w:moveToRangeStart[^>]*(?:\/>|>.*?<\/w:moveToRangeStart>)/gs,
    /<w:moveToRangeEnd[^>]*(?:\/>|>.*?<\/w:moveToRangeEnd>)/gs,
    /<w:customXmlInsRangeStart[^>]*(?:\/>|>.*?<\/w:customXmlInsRangeStart>)/gs,
    /<w:customXmlInsRangeEnd[^>]*(?:\/>|>.*?<\/w:customXmlInsRangeEnd>)/gs,
    /<w:customXmlDelRangeStart[^>]*(?:\/>|>.*?<\/w:customXmlDelRangeStart>)/gs,
    /<w:customXmlDelRangeEnd[^>]*(?:\/>|>.*?<\/w:customXmlDelRangeEnd>)/gs,
  ];
  for (const pattern of rangePatterns) {
    result = result.replace(pattern, '');
  }

  // Step 2: Remove property change elements
  const propChangePatterns = [
    /<w:rPrChange[^>]*>[\s\S]*?<\/w:rPrChange>/g,
    /<w:pPrChange[^>]*>[\s\S]*?<\/w:pPrChange>/g,
    /<w:tblPrChange[^>]*>[\s\S]*?<\/w:tblPrChange>/g,
    /<w:tblPrExChange[^>]*>[\s\S]*?<\/w:tblPrExChange>/g,
    /<w:tcPrChange[^>]*>[\s\S]*?<\/w:tcPrChange>/g,
    /<w:trPrChange[^>]*>[\s\S]*?<\/w:trPrChange>/g,
    /<w:sectPrChange[^>]*>[\s\S]*?<\/w:sectPrChange>/g,
    /<w:tblGridChange[^>]*>[\s\S]*?<\/w:tblGridChange>/g,
    /<w:numberingChange[^>]*>[\s\S]*?<\/w:numberingChange>/g,
  ];
  for (const pattern of propChangePatterns) {
    result = result.replace(pattern, '');
  }

  // Step 3: Remove deletions entirely (including content)
  // Iterate until no more deletions (handles nested cases)
  let prevLen = 0;
  while (result.length !== prevLen) {
    prevLen = result.length;
    result = result.replace(/<w:del\b[^>]*>[\s\S]*?<\/w:del>/g, '');
  }
  result = result.replace(/<w:del\b[^>]*\/>/g, '');

  // Step 4: Remove moveFrom entirely (source of moved content)
  prevLen = 0;
  while (result.length !== prevLen) {
    prevLen = result.length;
    result = result.replace(/<w:moveFrom\b[^>]*>[\s\S]*?<\/w:moveFrom>/g, '');
  }
  result = result.replace(/<w:moveFrom\b[^>]*\/>/g, '');

  // Step 5: Unwrap moveTo (keep content, remove wrapper)
  result = result.replace(/<\/w:moveTo>/g, '');
  result = result.replace(/<w:moveTo\b[^>]*>/g, '');

  // Step 6: Unwrap insertions (keep content, remove wrapper)
  result = result.replace(/<\/w:ins>/g, '');
  result = result.replace(/<w:ins\b[^>]*>/g, '');

  // Step 7: Clean up orphaned tags
  result = result.replace(/<w:ins\b[^>]*\/>/g, '');
  result = result.replace(/<w:del\b[^>]*\/>/g, '');
  result = result.replace(/<w:moveFrom\b[^>]*\/>/g, '');
  result = result.replace(/<w:moveTo\b[^>]*\/>/g, '');

  return result;
}

/**
 * Accept all revisions in the document by transforming the in-memory model.
 *
 * This is the industry-standard approach used by OpenXML PowerTools, Aspose.Words,
 * and other production DOCX libraries. It allows subsequent modifications to the
 * document to work correctly.
 *
 * @param doc - Document to process
 * @param options - Options for which revision types to accept
 * @returns Result with counts of accepted revisions
 */
export function acceptRevisionsInMemory(
  doc: Document,
  options: AcceptRevisionsOptions = {}
): AcceptRevisionsResult {
  const logger = getLogger();
  const opts: Required<AcceptRevisionsOptions> = {
    acceptInsertions: options.acceptInsertions ?? true,
    acceptDeletions: options.acceptDeletions ?? true,
    acceptMoves: options.acceptMoves ?? true,
    acceptPropertyChanges: options.acceptPropertyChanges ?? true,
    cleanupEmptyTables: options.cleanupEmptyTables ?? true,
  };

  const result: AcceptRevisionsResult = {
    insertionsAccepted: 0,
    deletionsAccepted: 0,
    movesAccepted: 0,
    propertyChangesAccepted: 0,
    totalAccepted: 0,
    emptyTablesRemoved: 0,
  };

  logger.info('Accepting revisions in-memory', { options: opts });

  // Validate move pairs before accepting if moves are being accepted
  // Orphaned moves could result in content loss (moveFrom without moveTo = content deleted)
  if (opts.acceptMoves) {
    const revisionManager = doc.getRevisionManager();
    if (revisionManager) {
      const movePairValidation = revisionManager.validateMovePairs();
      if (!movePairValidation.valid) {
        if (movePairValidation.orphanedMoveFrom.length > 0) {
          logger.warn(
            'Orphaned moveFrom revisions detected - accepting these will DELETE content permanently ' +
            '(content was moved from here but no moveTo destination exists)',
            { orphanedMoveIds: movePairValidation.orphanedMoveFrom }
          );
        }
        if (movePairValidation.orphanedMoveTo.length > 0) {
          logger.warn(
            'Orphaned moveTo revisions detected - content may be duplicated ' +
            '(content moved to here but no moveFrom source exists)',
            { orphanedMoveIds: movePairValidation.orphanedMoveTo }
          );
        }
      }
    }
  }

  // Process all paragraphs in the document body
  const paragraphs = doc.getAllParagraphs();
  for (const paragraph of paragraphs) {
    const paragraphResult = acceptRevisionsInParagraph(paragraph, opts);
    result.insertionsAccepted += paragraphResult.insertionsAccepted;
    result.deletionsAccepted += paragraphResult.deletionsAccepted;
    result.movesAccepted += paragraphResult.movesAccepted;
    result.propertyChangesAccepted += paragraphResult.propertyChangesAccepted;
  }

  // Process paragraphs in tables
  const tables = doc.getTables();
  for (const table of tables) {
    for (const row of table.getRows()) {
      for (const cell of row.getCells()) {
        // Process paragraphs in the cell
        for (const paragraph of cell.getParagraphs()) {
          const paragraphResult = acceptRevisionsInParagraph(paragraph, opts);
          result.insertionsAccepted += paragraphResult.insertionsAccepted;
          result.deletionsAccepted += paragraphResult.deletionsAccepted;
          result.movesAccepted += paragraphResult.movesAccepted;
          result.propertyChangesAccepted += paragraphResult.propertyChangesAccepted;
        }

        // Process raw nested content (nested tables stored as XML)
        // These cannot be processed via the in-memory model, so we use XML-based stripping
        if (cell.hasRawNestedContent()) {
          const rawContent = cell.getRawNestedContent();
          for (let i = 0; i < rawContent.length; i++) {
            const item = rawContent[i];
            if (item) {
              const cleanedXml = stripRevisionsFromXml(item.xml);
              if (cleanedXml !== item.xml) {
                cell.updateRawNestedContent(i, cleanedXml);
                // Count revisions stripped from nested content
                // We can't distinguish types in raw XML, so count as property changes
                result.propertyChangesAccepted++;
                logger.debug('Stripped revisions from nested content', {
                  type: item.type,
                  position: item.position,
                  originalLength: item.xml.length,
                  cleanedLength: cleanedXml.length,
                });
              }
            }
          }
        }
      }
    }
  }

  // Process paragraphs in headers
  const headerFooterManager = doc.getHeaderFooterManager();
  if (headerFooterManager) {
    const headers = headerFooterManager.getAllHeaders();
    for (const headerEntry of headers) {
      const elements = headerEntry.header.getElements();
      for (const element of elements) {
        // Element can be Paragraph or Table - use instanceof for type safety
        if (element instanceof Paragraph) {
          const paragraphResult = acceptRevisionsInParagraph(element, opts);
          result.insertionsAccepted += paragraphResult.insertionsAccepted;
          result.deletionsAccepted += paragraphResult.deletionsAccepted;
          result.movesAccepted += paragraphResult.movesAccepted;
          result.propertyChangesAccepted += paragraphResult.propertyChangesAccepted;
        } else if (element instanceof Table) {
          // It's a Table - process its cells
          for (const row of element.getRows()) {
            for (const cell of row.getCells()) {
              for (const paragraph of cell.getParagraphs()) {
                const paragraphResult = acceptRevisionsInParagraph(paragraph, opts);
                result.insertionsAccepted += paragraphResult.insertionsAccepted;
                result.deletionsAccepted += paragraphResult.deletionsAccepted;
                result.movesAccepted += paragraphResult.movesAccepted;
                result.propertyChangesAccepted += paragraphResult.propertyChangesAccepted;
              }
              // Process raw nested content in header tables
              if (cell.hasRawNestedContent()) {
                const rawContent = cell.getRawNestedContent();
                for (let i = 0; i < rawContent.length; i++) {
                  const item = rawContent[i];
                  if (item) {
                    const cleanedXml = stripRevisionsFromXml(item.xml);
                    if (cleanedXml !== item.xml) {
                      cell.updateRawNestedContent(i, cleanedXml);
                      result.propertyChangesAccepted++;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // Process paragraphs in footers
    const footers = headerFooterManager.getAllFooters();
    for (const footerEntry of footers) {
      const elements = footerEntry.footer.getElements();
      for (const element of elements) {
        // Element can be Paragraph or Table - use instanceof for type safety
        if (element instanceof Paragraph) {
          const paragraphResult = acceptRevisionsInParagraph(element, opts);
          result.insertionsAccepted += paragraphResult.insertionsAccepted;
          result.deletionsAccepted += paragraphResult.deletionsAccepted;
          result.movesAccepted += paragraphResult.movesAccepted;
          result.propertyChangesAccepted += paragraphResult.propertyChangesAccepted;
        } else if (element instanceof Table) {
          // It's a Table - process its cells
          for (const row of element.getRows()) {
            for (const cell of row.getCells()) {
              for (const paragraph of cell.getParagraphs()) {
                const paragraphResult = acceptRevisionsInParagraph(paragraph, opts);
                result.insertionsAccepted += paragraphResult.insertionsAccepted;
                result.deletionsAccepted += paragraphResult.deletionsAccepted;
                result.movesAccepted += paragraphResult.movesAccepted;
                result.propertyChangesAccepted += paragraphResult.propertyChangesAccepted;
              }
              // Process raw nested content in footer tables
              if (cell.hasRawNestedContent()) {
                const rawContent = cell.getRawNestedContent();
                for (let i = 0; i < rawContent.length; i++) {
                  const item = rawContent[i];
                  if (item) {
                    const cleanedXml = stripRevisionsFromXml(item.xml);
                    if (cleanedXml !== item.xml) {
                      cell.updateRawNestedContent(i, cleanedXml);
                      result.propertyChangesAccepted++;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Clear revision manager
  const revisionManager = doc.getRevisionManager();
  if (revisionManager) {
    revisionManager.clear();
  }

  // Disable track changes setting
  doc.disableTrackChanges();

  // Cleanup empty tables if enabled
  // This removes tables that have no visible content after revision acceptance
  // (e.g., tables where all content was deleted via tracked changes)
  if (opts.cleanupEmptyTables) {
    result.emptyTablesRemoved = cleanupEmptyTables(doc, logger);
  }

  result.totalAccepted =
    result.insertionsAccepted +
    result.deletionsAccepted +
    result.movesAccepted +
    result.propertyChangesAccepted;

  logger.info('Revisions accepted in-memory', {
    insertions: result.insertionsAccepted,
    deletions: result.deletionsAccepted,
    moves: result.movesAccepted,
    propertyChanges: result.propertyChangesAccepted,
    total: result.totalAccepted,
    emptyTablesRemoved: result.emptyTablesRemoved,
  });

  return result;
}

/**
 * Accept revisions in a single paragraph by transforming its content array.
 *
 * The transformation follows these rules:
 * - Insertions (w:ins): Unwrap - extract child content into parent position
 * - Deletions (w:del): Remove - delete revision and its content
 * - MoveFrom (w:moveFrom): Remove - content exists at moveTo destination
 * - MoveTo (w:moveTo): Unwrap - keep content, remove wrapper
 * - Property changes: Remove from model (current formatting is kept)
 *
 * @param paragraph - Paragraph to process
 * @param options - Options for which revision types to accept
 * @returns Result with counts of accepted revisions
 */
function acceptRevisionsInParagraph(
  paragraph: Paragraph,
  options: Required<AcceptRevisionsOptions>
): AcceptRevisionsResult {
  const result: AcceptRevisionsResult = {
    insertionsAccepted: 0,
    deletionsAccepted: 0,
    movesAccepted: 0,
    propertyChangesAccepted: 0,
    totalAccepted: 0,
    emptyTablesRemoved: 0,
  };

  const content = paragraph.getContent();
  const newContent: ParagraphContent[] = [];

  for (const item of content) {
    if (item instanceof Revision) {
      const revisionType = item.getType();

      // Handle insertion revisions (w:ins)
      if (revisionType === 'insert' && options.acceptInsertions) {
        // Unwrap: Extract child content into parent position
        const childContent = item.getContent();
        for (const child of childContent) {
          // Check ImageRun FIRST since ImageRun extends Run
          if (isImageRunContent(child)) {
            newContent.push(child as ImageRun);
          } else if (isRunContent(child)) {
            newContent.push(child as Run);
          } else if (isHyperlinkContent(child)) {
            newContent.push(child as Hyperlink);
          }
        }
        result.insertionsAccepted++;
        continue;
      }

      // Handle deletion revisions (w:del)
      if (revisionType === 'delete' && options.acceptDeletions) {
        // Remove: Don't add to newContent - content is deleted
        result.deletionsAccepted++;
        continue;
      }

      // Handle moveFrom revisions (source of moved content)
      if (revisionType === 'moveFrom' && options.acceptMoves) {
        // Remove: Content exists at moveTo destination
        result.movesAccepted++;
        continue;
      }

      // Handle moveTo revisions (destination of moved content)
      if (revisionType === 'moveTo' && options.acceptMoves) {
        // Unwrap: Keep content, remove wrapper
        const childContent = item.getContent();
        for (const child of childContent) {
          // Check ImageRun FIRST since ImageRun extends Run
          if (isImageRunContent(child)) {
            newContent.push(child as ImageRun);
          } else if (isRunContent(child)) {
            newContent.push(child as Run);
          } else if (isHyperlinkContent(child)) {
            newContent.push(child as Hyperlink);
          }
        }
        result.movesAccepted++;
        continue;
      }

      // Handle property change revisions
      if (PROPERTY_REVISION_TYPES.includes(revisionType) && options.acceptPropertyChanges) {
        // For property changes, the revision is metadata attached to runs
        // The current formatting (newProperties) is already applied to the run
        // We just need to remove the change tracking metadata
        // The content inside should be preserved
        const childContent = item.getContent();
        for (const child of childContent) {
          // Check ImageRun FIRST since ImageRun extends Run
          if (isImageRunContent(child)) {
            newContent.push(child as ImageRun);
          } else if (isRunContent(child)) {
            newContent.push(child as Run);
          } else if (isHyperlinkContent(child)) {
            newContent.push(child as Hyperlink);
          }
        }
        result.propertyChangesAccepted++;
        continue;
      }

      // If we reach here, this revision type is not being accepted
      // Keep it in the content
      newContent.push(item);
    } else {
      // Non-revision content - keep as-is
      newContent.push(item);
    }
  }

  // Replace paragraph content with the transformed content
  paragraph.setContent(newContent);

  // Clear paragraph property change tracking (pPrChange) if accepting property changes
  // This removes the w:pPrChange element from the paragraph's formatting
  if (options.acceptPropertyChanges) {
    const formatting = paragraph.getFormatting();
    if (formatting.pPrChange) {
      paragraph.clearParagraphPropertiesChange();
      result.propertyChangesAccepted++;
    }
  }

  return result;
}

/**
 * Check if a paragraph has any revisions
 */
export function paragraphHasRevisions(paragraph: Paragraph): boolean {
  const content = paragraph.getContent();
  return content.some((item) => item instanceof Revision);
}

/**
 * Get all revisions from a paragraph
 */
export function getRevisionsFromParagraph(paragraph: Paragraph): Revision[] {
  const content = paragraph.getContent();
  return content.filter((item): item is Revision => item instanceof Revision);
}

/**
 * Count revisions by type in a document
 */
export function countRevisionsByType(doc: Document): Map<RevisionType, number> {
  const counts = new Map<RevisionType, number>();

  const paragraphs = doc.getAllParagraphs();
  for (const paragraph of paragraphs) {
    const revisions = getRevisionsFromParagraph(paragraph);
    for (const revision of revisions) {
      const type = revision.getType();
      counts.set(type, (counts.get(type) || 0) + 1);
    }
  }

  return counts;
}

/**
 * Remove tables that have no visible content after revision acceptance.
 *
 * A table is considered empty if ALL cells in ALL rows have no text content.
 * This handles cases where all table content was deleted via tracked changes -
 * the deletion markers are stripped but the empty table structure remains.
 *
 * @param doc - Document to clean up
 * @param logger - Logger instance for debug output
 * @returns Number of empty tables removed
 */
function cleanupEmptyTables(doc: Document, logger: ILogger): number {
  const tables = doc.getTables();
  let removedCount = 0;
  const tablesToRemove: number[] = [];

  for (let tableIndex = 0; tableIndex < tables.length; tableIndex++) {
    const table = tables[tableIndex];
    if (!table) continue;

    let hasContent = false;
    const rows = table.getRows();

    for (const row of rows) {
      const cells = row.getCells();
      for (const cell of cells) {
        const paragraphs = cell.getParagraphs();
        for (const para of paragraphs) {
          const text = para.getText().trim();
          if (text.length > 0) {
            hasContent = true;
            break;
          }
        }
        if (hasContent) break;
      }
      if (hasContent) break;
    }

    if (!hasContent) {
      // Mark this table for removal (store index)
      tablesToRemove.push(tableIndex);
      logger.debug('Found empty table for removal', { tableIndex });
    }
  }

  // Remove tables in reverse order to preserve indices
  for (let i = tablesToRemove.length - 1; i >= 0; i--) {
    const tableIndex = tablesToRemove[i];
    if (tableIndex !== undefined && doc.removeTable(tableIndex)) {
      removedCount++;
      logger.debug('Removed empty table', { tableIndex });
    }
  }

  if (removedCount > 0) {
    logger.info('Empty table cleanup complete', { tablesRemoved: removedCount });
  }

  return removedCount;
}
