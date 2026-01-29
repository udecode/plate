/**
 * MoveOperationHelper - Creates complete move operations with range markers
 *
 * Per ECMA-376, move operations in tracked changes require:
 * 1. w:moveFromRangeStart (marks start of source region)
 * 2. w:moveFrom (contains the moved content)
 * 3. w:moveFromRangeEnd (marks end of source region)
 * 4. w:moveToRangeStart (marks start of destination region)
 * 5. w:moveTo (contains the moved content copy)
 * 6. w:moveToRangeEnd (marks end of destination region)
 *
 * The range markers and move elements share a common 'name' (for range markers)
 * and 'moveId' (for move elements) that links them together.
 *
 * @example
 * ```typescript
 * // Create a complete move operation
 * const moveOp = MoveOperationHelper.createMoveOperation({
 *   author: 'John Doe',
 *   content: [new Run('moved text')],
 *   idProvider: () => document.getIdManager().getNextId(),
 * });
 *
 * // Add to source paragraph
 * sourceParagraph.addRangeMarker(moveOp.source.rangeStart);
 * sourceParagraph.addRevision(moveOp.source.moveFrom);
 * sourceParagraph.addRangeMarker(moveOp.source.rangeEnd);
 *
 * // Add to destination paragraph
 * destParagraph.addRangeMarker(moveOp.destination.rangeStart);
 * destParagraph.addRevision(moveOp.destination.moveTo);
 * destParagraph.addRangeMarker(moveOp.destination.rangeEnd);
 * ```
 */

import { Revision } from '../elements/Revision';
import { RangeMarker } from '../elements/RangeMarker';
import { Run } from '../elements/Run';

/**
 * Options for creating a move operation
 */
export interface MoveOperationOptions {
  /** Author who made the move */
  author: string;
  /** Content being moved (Run or array of Runs) */
  content: Run | Run[];
  /** Date of the move (defaults to now) */
  date?: Date;
  /** ID provider function - returns the next available annotation ID */
  idProvider?: () => number;
  /** Optional move ID (auto-generated if not provided) */
  moveId?: string;
}

/**
 * Result of creating a move operation
 */
export interface MoveOperationResult {
  /** Elements to add to the source paragraph (where content was moved FROM) */
  source: {
    /** Range start marker (w:moveFromRangeStart) */
    rangeStart: RangeMarker;
    /** Move revision (w:moveFrom) */
    moveFrom: Revision;
    /** Range end marker (w:moveFromRangeEnd) */
    rangeEnd: RangeMarker;
  };
  /** Elements to add to the destination paragraph (where content was moved TO) */
  destination: {
    /** Range start marker (w:moveToRangeStart) */
    rangeStart: RangeMarker;
    /** Move revision (w:moveTo) */
    moveTo: Revision;
    /** Range end marker (w:moveToRangeEnd) */
    rangeEnd: RangeMarker;
  };
  /** The move ID linking all elements together */
  moveId: string;
}

/**
 * Simple ID counter for when no provider is specified
 */
let globalMoveIdCounter = 0;
let globalAnnotationIdCounter = 1000; // Start high to avoid conflicts

/**
 * Helper class for creating complete move operations
 */
export class MoveOperationHelper {
  /**
   * Creates a complete move operation with all required elements.
   *
   * This generates:
   * - Source: w:moveFromRangeStart, w:moveFrom, w:moveFromRangeEnd
   * - Destination: w:moveToRangeStart, w:moveTo, w:moveToRangeEnd
   *
   * All elements are linked by the moveId (for revisions) and name (for range markers).
   *
   * @param options - Move operation options
   * @returns Complete move operation with all elements
   *
   * @example
   * ```typescript
   * const moveOp = MoveOperationHelper.createMoveOperation({
   *   author: 'John Doe',
   *   content: new Run('text to move'),
   * });
   *
   * // Add to source paragraph (where text was)
   * sourcePara.addRangeMarker(moveOp.source.rangeStart);
   * sourcePara.addRevision(moveOp.source.moveFrom);
   * sourcePara.addRangeMarker(moveOp.source.rangeEnd);
   *
   * // Add to destination paragraph (where text moved to)
   * destPara.addRangeMarker(moveOp.destination.rangeStart);
   * destPara.addRevision(moveOp.destination.moveTo);
   * destPara.addRangeMarker(moveOp.destination.rangeEnd);
   * ```
   */
  static createMoveOperation(
    options: MoveOperationOptions
  ): MoveOperationResult {
    const { author, content, date = new Date() } = options;

    // Generate move ID if not provided
    const moveId = options.moveId || `move-${++globalMoveIdCounter}`;

    // Get IDs from provider or use simple counter
    const getNextId = options.idProvider || (() => ++globalAnnotationIdCounter);

    // Allocate IDs for all elements
    // Range markers use same ID for start/end pairs
    const moveFromRangeId = getNextId();
    const moveFromId = getNextId();
    const moveToRangeId = getNextId();
    const moveToId = getNextId();

    // Create source elements
    const moveFromRangeStart = RangeMarker.createMoveFromStart(
      moveFromRangeId,
      moveId,
      author,
      date
    );

    const moveFrom = Revision.createMoveFrom(author, content, moveId, date);
    moveFrom.setId(moveFromId);

    const moveFromRangeEnd = RangeMarker.createMoveFromEnd(moveFromRangeId);

    // Create destination elements (clone content for moveTo)
    const contentArray = Array.isArray(content) ? content : [content];
    const clonedContent = contentArray.map((run) => {
      // Clone the run to have independent content at destination
      const cloned = new Run(run.getText(), { ...run.getFormatting() });
      return cloned;
    });

    const moveToRangeStart = RangeMarker.createMoveToStart(
      moveToRangeId,
      moveId,
      author,
      date
    );

    const moveTo = Revision.createMoveTo(author, clonedContent, moveId, date);
    moveTo.setId(moveToId);

    const moveToRangeEnd = RangeMarker.createMoveToEnd(moveToRangeId);

    return {
      source: {
        rangeStart: moveFromRangeStart,
        moveFrom,
        rangeEnd: moveFromRangeEnd,
      },
      destination: {
        rangeStart: moveToRangeStart,
        moveTo,
        rangeEnd: moveToRangeEnd,
      },
      moveId,
    };
  }

  /**
   * Adds a complete move operation to source and destination paragraphs.
   *
   * This is a convenience method that creates the move operation and adds
   * all elements to the appropriate paragraphs in the correct order.
   *
   * @param sourceParagraph - Paragraph where content was moved FROM
   * @param destParagraph - Paragraph where content was moved TO
   * @param options - Move operation options
   * @returns The move operation result for reference
   *
   * @example
   * ```typescript
   * import { Paragraph } from 'docxmlater';
   *
   * const sourcePara = document.getParagraphs()[0];
   * const destPara = document.getParagraphs()[5];
   *
   * MoveOperationHelper.addMoveOperation(sourcePara, destPara, {
   *   author: 'John Doe',
   *   content: new Run('moved text'),
   * });
   * ```
   */
  static addMoveOperation(
    sourceParagraph: import('../elements/Paragraph').Paragraph,
    destParagraph: import('../elements/Paragraph').Paragraph,
    options: MoveOperationOptions
  ): MoveOperationResult {
    const moveOp = MoveOperationHelper.createMoveOperation(options);

    // Add to source paragraph in order
    sourceParagraph.addRangeMarker(moveOp.source.rangeStart);
    sourceParagraph.addRevision(moveOp.source.moveFrom);
    sourceParagraph.addRangeMarker(moveOp.source.rangeEnd);

    // Add to destination paragraph in order
    destParagraph.addRangeMarker(moveOp.destination.rangeStart);
    destParagraph.addRevision(moveOp.destination.moveTo);
    destParagraph.addRangeMarker(moveOp.destination.rangeEnd);

    return moveOp;
  }

  /**
   * Resets the global ID counters (for testing purposes).
   * @internal
   */
  static resetIdCounters(): void {
    globalMoveIdCounter = 0;
    globalAnnotationIdCounter = 1000;
  }
}
