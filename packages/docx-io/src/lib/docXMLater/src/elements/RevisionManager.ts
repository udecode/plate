/**
 * RevisionManager - Manages tracked changes (revisions) in a document
 *
 * Tracks all revisions, assigns unique IDs, and provides statistics.
 */

import type { Revision, RevisionType } from './Revision';
import type { RevisionLocation } from './PropertyChangeTypes';
import {
  getGlobalLogger,
  createScopedLogger,
  type ILogger,
} from '../utils/logger';

// Scoped logger for RevisionManager
function getLogger(): ILogger {
  return createScopedLogger(getGlobalLogger(), 'RevisionManager');
}

/**
 * Type for the centralized ID provider callback.
 * Returns the next available annotation ID from a shared counter.
 */
export type IdProviderCallback = () => number;

/**
 * Type for callback to notify of existing IDs (for synchronization).
 * Called when registering existing revisions to keep the central counter in sync.
 */
export type IdExistsCallback = (existingId: number) => void;

/**
 * Semantic category for grouping revisions.
 */
export type RevisionCategory =
  | 'content' // Text insertions, deletions
  | 'formatting' // Run/paragraph property changes
  | 'structural' // Moves, section changes
  | 'table'; // Table structure changes

/**
 * Summary statistics for revisions.
 */
export interface RevisionSummary {
  total: number;
  byType: {
    insertions: number;
    deletions: number;
    moves: number;
    propertyChanges: number;
    tableChanges: number;
  };
  byCategory: Record<RevisionCategory, number>;
  authors: string[];
  dateRange: { earliest: Date; latest: Date } | null;
}

/**
 * Manages document revisions (track changes)
 *
 * Per ECMA-376, revision IDs must be unique across ALL annotation types
 * in a document. Use setIdProvider() to connect to a centralized ID allocator.
 */
export class RevisionManager {
  private revisions: Revision[] = [];
  private nextId = 0;
  private idProvider: IdProviderCallback | null = null;
  private idExistsNotifier: IdExistsCallback | null = null;

  // Performance caching for frequently accessed filtered results
  private revisionsByTypeCache = new Map<RevisionType, Revision[]>();
  private revisionsByAuthorCache = new Map<string, Revision[]>();
  private revisionsByCategoryCache = new Map<RevisionCategory, Revision[]>();
  private cacheValid = true;

  /**
   * Invalidates all caches. Called when revisions are added/removed.
   * @private
   */
  private invalidateCache(): void {
    this.revisionsByTypeCache.clear();
    this.revisionsByAuthorCache.clear();
    this.revisionsByCategoryCache.clear();
    this.cacheValid = false;
  }

  /**
   * Sets the centralized ID provider callback.
   * When set, IDs will be allocated from the centralized DocumentIdManager
   * instead of the local nextId counter.
   *
   * @param provider - Callback that returns the next available ID
   * @param existsNotifier - Optional callback to notify when existing IDs are found
   */
  setIdProvider(
    provider: IdProviderCallback,
    existsNotifier?: IdExistsCallback
  ): void {
    this.idProvider = provider;
    this.idExistsNotifier = existsNotifier || null;
  }

  /**
   * Registers a revision with the manager
   * Assigns a unique ID
   * @param revision - Revision to register
   * @returns The registered revision (same instance)
   */
  register(revision: Revision): Revision {
    const logger = getLogger();
    // Assign unique ID - use centralized provider if available
    const id = this.idProvider ? this.idProvider() : this.nextId++;
    revision.setId(id);

    // Store revision
    this.revisions.push(revision);
    this.invalidateCache();

    logger.debug('Revision registered', {
      id: revision.getId(),
      type: revision.getType(),
      author: revision.getAuthor(),
    });

    return revision;
  }

  /**
   * Gets all revisions
   * @returns Array of all revisions
   */
  getAllRevisions(): Revision[] {
    return [...this.revisions];
  }

  /**
   * Gets revisions by type
   * Uses caching for improved performance on repeated calls
   * @param type - Revision type to filter by
   * @returns Array of revisions of the specified type
   */
  getRevisionsByType(type: RevisionType): Revision[] {
    // Check cache first
    if (this.revisionsByTypeCache.has(type)) {
      return [...this.revisionsByTypeCache.get(type)!];
    }

    // Compute and cache
    const result = this.revisions.filter((rev) => rev.getType() === type);
    this.revisionsByTypeCache.set(type, result);
    return [...result];
  }

  /**
   * Gets revisions by author
   * Uses caching for improved performance on repeated calls
   * @param author - Author name to filter by
   * @returns Array of revisions by the specified author
   */
  getRevisionsByAuthor(author: string): Revision[] {
    // Check cache first
    if (this.revisionsByAuthorCache.has(author)) {
      return [...this.revisionsByAuthorCache.get(author)!];
    }

    // Compute and cache
    const result = this.revisions.filter((rev) => rev.getAuthor() === author);
    this.revisionsByAuthorCache.set(author, result);
    return [...result];
  }

  /**
   * Gets the number of revisions
   * @returns Number of revisions
   */
  getCount(): number {
    return this.revisions.length;
  }

  /**
   * Gets the number of insertions
   * @returns Number of insertion revisions
   */
  getInsertionCount(): number {
    return this.getRevisionsByType('insert').length;
  }

  /**
   * Gets the number of deletions
   * @returns Number of deletion revisions
   */
  getDeletionCount(): number {
    return this.getRevisionsByType('delete').length;
  }

  /**
   * Gets all unique authors who have made changes
   * @returns Array of unique author names
   */
  getAuthors(): string[] {
    const authorsSet = new Set<string>();
    for (const revision of this.revisions) {
      authorsSet.add(revision.getAuthor());
    }
    return Array.from(authorsSet);
  }

  /**
   * Clears all revisions
   */
  clear(): void {
    const count = this.revisions.length;
    this.revisions = [];
    this.nextId = 0;
    this.invalidateCache();
    if (count > 0) {
      getLogger().info('Revisions cleared', { previousCount: count });
    }
  }

  /**
   * Checks if there are no revisions
   * @returns True if there are no tracked changes
   */
  isEmpty(): boolean {
    return this.revisions.length === 0;
  }

  /**
   * Gets the most recent N revisions
   * @param count - Number of recent revisions to return
   * @returns Array of most recent revisions
   */
  getRecentRevisions(count: number): Revision[] {
    return [...this.revisions]
      .sort((a, b) => b.getDate().getTime() - a.getDate().getTime())
      .slice(0, count);
  }

  /**
   * Searches revisions by text content
   * @param searchText - Text to search for (case-insensitive)
   * @returns Array of revisions containing the search text
   */
  findRevisionsByText(searchText: string): Revision[] {
    const lowerSearch = searchText.toLowerCase();
    return this.revisions.filter((revision) => {
      const text = revision
        .getRuns()
        .map((run) => run.getText())
        .join('')
        .toLowerCase();
      return text.includes(lowerSearch);
    });
  }

  /**
   * Gets all insertions (added text)
   * @returns Array of insertion revisions
   */
  getAllInsertions(): Revision[] {
    return this.getRevisionsByType('insert');
  }

  /**
   * Gets all deletions (removed text)
   * @returns Array of deletion revisions
   */
  getAllDeletions(): Revision[] {
    return this.getRevisionsByType('delete');
  }

  /**
   * Gets all run properties changes (formatting changes)
   * @returns Array of run property change revisions
   */
  getAllRunPropertiesChanges(): Revision[] {
    return this.getRevisionsByType('runPropertiesChange');
  }

  /**
   * Gets all paragraph properties changes
   * @returns Array of paragraph property change revisions
   */
  getAllParagraphPropertiesChanges(): Revision[] {
    return this.getRevisionsByType('paragraphPropertiesChange');
  }

  /**
   * Gets all table properties changes
   * @returns Array of table property change revisions
   */
  getAllTablePropertiesChanges(): Revision[] {
    return this.getRevisionsByType('tablePropertiesChange');
  }

  /**
   * Gets all move operations (both moveFrom and moveTo)
   * @returns Array of move-related revisions
   */
  getAllMoves(): Revision[] {
    return this.revisions.filter(
      (rev) => rev.getType() === 'moveFrom' || rev.getType() === 'moveTo'
    );
  }

  /**
   * Gets all moveFrom revisions (source of moves)
   * @returns Array of moveFrom revisions
   */
  getAllMoveFrom(): Revision[] {
    return this.getRevisionsByType('moveFrom');
  }

  /**
   * Gets all moveTo revisions (destination of moves)
   * @returns Array of moveTo revisions
   */
  getAllMoveTo(): Revision[] {
    return this.getRevisionsByType('moveTo');
  }

  /**
   * Gets all table cell changes (insert, delete, merge)
   * @returns Array of table cell change revisions
   */
  getAllTableCellChanges(): Revision[] {
    return this.revisions.filter(
      (rev) =>
        rev.getType() === 'tableCellInsert' ||
        rev.getType() === 'tableCellDelete' ||
        rev.getType() === 'tableCellMerge'
    );
  }

  /**
   * Gets all numbering changes
   * @returns Array of numbering change revisions
   */
  getAllNumberingChanges(): Revision[] {
    return this.getRevisionsByType('numberingChange');
  }

  /**
   * Gets all property change revisions (run, paragraph, table, etc.)
   * @returns Array of all property change revisions
   */
  getAllPropertyChanges(): Revision[] {
    return this.revisions.filter(
      (rev) =>
        rev.getType() === 'runPropertiesChange' ||
        rev.getType() === 'paragraphPropertiesChange' ||
        rev.getType() === 'tablePropertiesChange' ||
        rev.getType() === 'tableRowPropertiesChange' ||
        rev.getType() === 'tableCellPropertiesChange' ||
        rev.getType() === 'sectionPropertiesChange' ||
        rev.getType() === 'numberingChange'
    );
  }

  /**
   * Gets move pair by move ID
   * @param moveId - Move operation ID
   * @returns Object with moveFrom and moveTo revisions (if found)
   */
  getMovePair(moveId: string): { moveFrom?: Revision; moveTo?: Revision } {
    const moveFrom = this.revisions.find(
      (rev) => rev.getType() === 'moveFrom' && rev.getMoveId() === moveId
    );
    const moveTo = this.revisions.find(
      (rev) => rev.getType() === 'moveTo' && rev.getMoveId() === moveId
    );
    return { moveFrom, moveTo };
  }

  /**
   * Gets statistics about revisions
   * @returns Object with revision statistics
   */
  getStats(): {
    total: number;
    insertions: number;
    deletions: number;
    propertyChanges: number;
    moves: number;
    tableCellChanges: number;
    authors: string[];
    nextId: number;
  } {
    return {
      total: this.revisions.length,
      insertions: this.getInsertionCount(),
      deletions: this.getDeletionCount(),
      propertyChanges: this.getAllPropertyChanges().length,
      moves: this.getAllMoves().length,
      tableCellChanges: this.getAllTableCellChanges().length,
      authors: this.getAuthors(),
      nextId: this.nextId,
    };
  }

  /**
   * Checks if track changes is enabled (has any revisions)
   * @returns True if there are revisions
   */
  isTrackingChanges(): boolean {
    return this.revisions.length > 0;
  }

  /**
   * Gets the most recent revision
   * @returns The most recent revision, or undefined if no revisions
   */
  getLatestRevision(): Revision | undefined {
    if (this.revisions.length === 0) {
      return;
    }
    return this.revisions[this.revisions.length - 1];
  }

  /**
   * Gets revisions within a date range
   * @param startDate - Start of date range
   * @param endDate - End of date range
   * @returns Array of revisions within the date range
   */
  getRevisionsByDateRange(startDate: Date, endDate: Date): Revision[] {
    return this.revisions.filter((rev) => {
      const revDate = rev.getDate();
      return revDate >= startDate && revDate <= endDate;
    });
  }

  /**
   * Gets the next available revision ID without consuming it.
   *
   * This is an alias for peekNextId() for backward compatibility.
   * Use consumeNextId() if you need to reserve an ID for manual use.
   *
   * @returns Next available revision ID (without consuming it)
   * @see consumeNextId for reserving IDs
   * @see register for automatic ID assignment
   */
  getNextId(): number {
    return this.nextId;
  }

  /**
   * Peeks at the next revision ID without incrementing
   * @returns Next available revision ID (without consuming it)
   */
  peekNextId(): number {
    return this.nextId;
  }

  /**
   * Consumes and returns the next revision ID.
   *
   * Use this when you need to manually assign an ID to a revision
   * that won't be registered through register(). The ID is reserved
   * and won't be reused by subsequent register() calls.
   *
   * When a centralized ID provider is set, IDs come from the shared counter.
   *
   * @returns The consumed revision ID
   *
   * @example
   * ```typescript
   * // Reserve an ID for manual assignment
   * const id = revisionManager.consumeNextId();
   * revision.setId(id);
   * // Don't call register() - the ID is already consumed
   * ```
   */
  consumeNextId(): number {
    // Use centralized provider if available
    return this.idProvider ? this.idProvider() : this.nextId++;
  }

  /**
   * Sets the next ID to be assigned.
   * Used when loading documents to avoid ID collisions with existing revisions.
   * @param id - The next ID value to use
   */
  setNextId(id: number): void {
    this.nextId = id;
  }

  /**
   * Creates a new RevisionManager
   * @returns New RevisionManager instance
   */
  static create(): RevisionManager {
    return new RevisionManager();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW METHODS - Added for ChangelogGenerator and RevisionAwareProcessor
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Check if any revisions exist in the manager.
   * @returns True if there are any revisions
   */
  hasRevisions(): boolean {
    return this.revisions.length > 0;
  }

  /**
   * Get revisions by semantic category.
   *
   * Categories:
   * - content: insert, delete, imageChange, fieldChange, commentChange, contentControlChange, hyperlinkChange
   * - formatting: runPropertiesChange, paragraphPropertiesChange, numberingChange
   * - structural: moveFrom, moveTo, sectionPropertiesChange, bookmarkChange
   * - table: tablePropertiesChange, tableCellInsert, tableCellDelete, tableCellMerge, etc.
   *
   * @param category - Semantic category to filter by
   * @returns Array of revisions in the specified category
   */
  getByCategory(category: RevisionCategory): Revision[] {
    // Check cache first
    if (this.revisionsByCategoryCache.has(category)) {
      return [...this.revisionsByCategoryCache.get(category)!];
    }

    // Compute and cache
    const result = this.revisions.filter((rev) => {
      const type = rev.getType();
      switch (category) {
        case 'content':
          return (
            type === 'insert' ||
            type === 'delete' ||
            // Internal tracking types for rich content changes
            type === 'imageChange' ||
            type === 'fieldChange' ||
            type === 'commentChange' ||
            type === 'contentControlChange' ||
            type === 'hyperlinkChange'
          );

        case 'formatting':
          return (
            type === 'runPropertiesChange' ||
            type === 'paragraphPropertiesChange' ||
            type === 'numberingChange'
          );

        case 'structural':
          return (
            type === 'moveFrom' ||
            type === 'moveTo' ||
            type === 'sectionPropertiesChange' ||
            // Bookmarks are structural markers
            type === 'bookmarkChange'
          );

        case 'table':
          return (
            type === 'tablePropertiesChange' ||
            type === 'tableExceptionPropertiesChange' ||
            type === 'tableRowPropertiesChange' ||
            type === 'tableCellPropertiesChange' ||
            type === 'tableCellInsert' ||
            type === 'tableCellDelete' ||
            type === 'tableCellMerge'
          );

        default:
          return false;
      }
    });
    this.revisionsByCategoryCache.set(category, result);
    return [...result];
  }

  /**
   * Get revisions affecting a specific paragraph.
   *
   * Uses the revision's location data if available. Returns revisions
   * where location.paragraphIndex matches the specified index.
   *
   * Note: Revisions must have location data set (via setLocation()) for
   * accurate filtering. Revisions without location data are excluded.
   *
   * @param paragraphIndex - Index of the paragraph (0-based)
   * @returns Array of revisions affecting the specified paragraph
   *
   * @example
   * ```typescript
   * const revisions = revisionManager.getRevisionsForParagraph(3);
   * console.log(`${revisions.length} revisions affect paragraph 3`);
   * ```
   */
  getRevisionsForParagraph(paragraphIndex: number): Revision[] {
    if (paragraphIndex < 0) {
      return [];
    }
    return this.revisions.filter((rev) => {
      const loc = rev.getLocation();
      if (!loc) return false;
      return loc.paragraphIndex === paragraphIndex;
    });
  }

  /**
   * Get summary statistics for all revisions.
   * Provides comprehensive breakdown by type, category, and author.
   *
   * @returns Summary statistics object
   */
  getSummary(): RevisionSummary {
    const byCategory: Record<RevisionCategory, number> = {
      content: 0,
      formatting: 0,
      structural: 0,
      table: 0,
    };

    let earliest: Date | null = null;
    let latest: Date | null = null;

    // Count by category and track date range
    for (const rev of this.revisions) {
      const type = rev.getType();
      const date = rev.getDate();

      // Update date range
      if (!earliest || date < earliest) earliest = date;
      if (!latest || date > latest) latest = date;

      // Categorize
      if (type === 'insert' || type === 'delete') {
        byCategory.content++;
      } else if (
        type === 'runPropertiesChange' ||
        type === 'paragraphPropertiesChange' ||
        type === 'numberingChange'
      ) {
        byCategory.formatting++;
      } else if (
        type === 'moveFrom' ||
        type === 'moveTo' ||
        type === 'sectionPropertiesChange'
      ) {
        byCategory.structural++;
      } else if (
        type === 'tablePropertiesChange' ||
        type === 'tableExceptionPropertiesChange' ||
        type === 'tableRowPropertiesChange' ||
        type === 'tableCellPropertiesChange' ||
        type === 'tableCellInsert' ||
        type === 'tableCellDelete' ||
        type === 'tableCellMerge'
      ) {
        byCategory.table++;
      }
    }

    const summary = {
      total: this.revisions.length,
      byType: {
        insertions: this.getInsertionCount(),
        deletions: this.getDeletionCount(),
        moves: this.getAllMoves().length,
        propertyChanges: this.getAllPropertyChanges().length,
        tableChanges: this.getAllTableCellChanges().length,
      },
      byCategory,
      authors: this.getAuthors(),
      dateRange: earliest && latest ? { earliest, latest } : null,
    };

    if (summary.total > 0) {
      getLogger().info('Revision summary', {
        total: summary.total,
        ins: summary.byType.insertions,
        del: summary.byType.deletions,
        fmt: summary.byType.propertyChanges,
        authors: summary.authors.length,
      });
    }

    return summary;
  }

  /**
   * Get a revision by its ID.
   *
   * @param id - Revision ID to find
   * @returns Revision with the specified ID, or undefined
   */
  getById(id: number): Revision | undefined {
    return this.revisions.find((rev) => rev.getId() === id);
  }

  /**
   * Remove a revision by its ID.
   *
   * @param id - ID of the revision to remove
   * @returns True if revision was found and removed
   */
  removeById(id: number): boolean {
    const index = this.revisions.findIndex((rev) => rev.getId() === id);
    if (index === -1) return false;

    this.revisions.splice(index, 1);
    this.invalidateCache();
    return true;
  }

  /**
   * Get revisions matching multiple criteria.
   *
   * @param criteria - Filter criteria
   * @returns Array of matching revisions
   */
  getMatching(criteria: {
    types?: RevisionType[];
    authors?: string[];
    categories?: RevisionCategory[];
    dateRange?: { start: Date; end: Date };
  }): Revision[] {
    return this.revisions.filter((rev) => {
      // Filter by types
      if (criteria.types && !criteria.types.includes(rev.getType())) {
        return false;
      }

      // Filter by authors
      if (criteria.authors && !criteria.authors.includes(rev.getAuthor())) {
        return false;
      }

      // Filter by categories
      if (criteria.categories) {
        const revCategory = this.getRevisionCategory(rev);
        if (!criteria.categories.includes(revCategory)) {
          return false;
        }
      }

      // Filter by date range
      if (criteria.dateRange) {
        const date = rev.getDate();
        if (date < criteria.dateRange.start || date > criteria.dateRange.end) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get the semantic category of a revision.
   * @internal
   */
  private getRevisionCategory(revision: Revision): RevisionCategory {
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

    // Default
    return 'content';
  }

  // ============================================================
  // Location-Aware Methods
  // ============================================================

  /**
   * Gets revisions affecting a specific run within a paragraph.
   *
   * Uses the revision's location data if available.
   *
   * @param paragraphIndex - Index of the paragraph (0-based)
   * @param runIndex - Index of the run within the paragraph (0-based)
   * @returns Array of revisions affecting the specified run
   *
   * @example
   * ```typescript
   * const revisions = revisionManager.getRevisionsForRun(0, 2);
   * console.log(`${revisions.length} revisions affect run 2 in paragraph 0`);
   * ```
   */
  getRevisionsForRun(paragraphIndex: number, runIndex: number): Revision[] {
    return this.revisions.filter((rev) => {
      const loc = rev.getLocation();
      if (!loc) return false;
      return loc.paragraphIndex === paragraphIndex && loc.runIndex === runIndex;
    });
  }

  /**
   * Gets revisions by location criteria.
   *
   * Filters revisions based on their location within the document structure.
   * All specified criteria must match (AND logic).
   *
   * @param criteria - Location filter criteria
   * @returns Array of revisions matching the criteria
   *
   * @example
   * ```typescript
   * // Get all revisions in paragraph 5
   * const paraRevisions = revisionManager.getRevisionsByLocation({
   *   paragraphIndex: 5
   * });
   *
   * // Get all revisions in table row 2, cell 1
   * const cellRevisions = revisionManager.getRevisionsByLocation({
   *   tableRow: 2,
   *   tableCell: 1
   * });
   * ```
   */
  getRevisionsByLocation(criteria: Partial<RevisionLocation>): Revision[] {
    return this.revisions.filter((rev) => {
      const loc = rev.getLocation();
      if (!loc) return false;

      // Check each criteria if specified
      if (
        criteria.paragraphIndex !== undefined &&
        loc.paragraphIndex !== criteria.paragraphIndex
      ) {
        return false;
      }
      if (
        criteria.runIndex !== undefined &&
        loc.runIndex !== criteria.runIndex
      ) {
        return false;
      }
      if (
        criteria.tableRow !== undefined &&
        loc.tableRow !== criteria.tableRow
      ) {
        return false;
      }
      if (
        criteria.tableCell !== undefined &&
        loc.tableCell !== criteria.tableCell
      ) {
        return false;
      }
      if (
        criteria.sectionIndex !== undefined &&
        loc.sectionIndex !== criteria.sectionIndex
      ) {
        return false;
      }
      if (
        criteria.headerFooterType !== undefined &&
        loc.headerFooterType !== criteria.headerFooterType
      ) {
        return false;
      }

      return true;
    });
  }

  /**
   * Gets revisions that have location data.
   *
   * @returns Array of revisions with location information
   */
  getRevisionsWithLocation(): Revision[] {
    return this.revisions.filter((rev) => rev.getLocation() !== undefined);
  }

  /**
   * Gets revisions that do NOT have location data.
   *
   * @returns Array of revisions without location information
   */
  getRevisionsWithoutLocation(): Revision[] {
    return this.revisions.filter((rev) => rev.getLocation() === undefined);
  }

  // ============================================================
  // Validation Methods
  // ============================================================

  /**
   * Validates that all revision IDs are unique.
   *
   * Per ECMA-376, revision IDs must be unique within a document.
   * Duplicate IDs can cause Word to reject the document or
   * produce unexpected behavior.
   *
   * @returns Validation result with any duplicate IDs found
   *
   * @example
   * ```typescript
   * const result = revisionManager.validateRevisionIds();
   * if (!result.valid) {
   *   console.error('Duplicate IDs found:', result.duplicates);
   * }
   * ```
   */
  validateRevisionIds(): { valid: boolean; duplicates: number[] } {
    const seen = new Set<number>();
    const duplicates: number[] = [];

    for (const rev of this.revisions) {
      const id = rev.getId();
      if (seen.has(id) && !duplicates.includes(id)) {
        duplicates.push(id);
      }
      seen.add(id);
    }

    return {
      valid: duplicates.length === 0,
      duplicates,
    };
  }

  /**
   * Reassigns all revision IDs to ensure uniqueness.
   *
   * This is useful after merging documents or when duplicate
   * IDs are detected. IDs are reassigned sequentially starting
   * from the specified value.
   *
   * @param startId - Starting ID value (default: 0)
   * @returns Number of IDs reassigned
   *
   * @example
   * ```typescript
   * const count = revisionManager.reassignRevisionIds();
   * console.log(`Reassigned ${count} revision IDs`);
   * ```
   */
  reassignRevisionIds(startId = 0): number {
    let currentId = startId;

    for (const rev of this.revisions) {
      rev.setId(currentId++);
    }

    // Update nextId to continue from where we left off
    this.nextId = currentId;

    return this.revisions.length;
  }

  /**
   * Validates move operation pairs (moveFrom/moveTo).
   *
   * Each moveFrom must have a matching moveTo with the same moveId,
   * and vice versa. Orphaned move markers can cause document corruption.
   *
   * @returns Validation result with orphaned move IDs
   *
   * @example
   * ```typescript
   * const result = revisionManager.validateMovePairs();
   * if (!result.valid) {
   *   console.error('Orphaned moveFrom IDs:', result.orphanedMoveFrom);
   *   console.error('Orphaned moveTo IDs:', result.orphanedMoveTo);
   * }
   * ```
   */
  validateMovePairs(): {
    valid: boolean;
    orphanedMoveFrom: string[];
    orphanedMoveTo: string[];
  } {
    const moveFromIds = new Map<string, Revision>();
    const moveToIds = new Map<string, Revision>();

    for (const rev of this.revisions) {
      const moveId = rev.getMoveId();
      if (!moveId) continue;

      if (rev.getType() === 'moveFrom') {
        moveFromIds.set(moveId, rev);
      } else if (rev.getType() === 'moveTo') {
        moveToIds.set(moveId, rev);
      }
    }

    const orphanedMoveFrom: string[] = [];
    const orphanedMoveTo: string[] = [];

    // Find moveFrom without matching moveTo
    for (const moveId of moveFromIds.keys()) {
      if (!moveToIds.has(moveId)) {
        orphanedMoveFrom.push(moveId);
      }
    }

    // Find moveTo without matching moveFrom
    for (const moveId of moveToIds.keys()) {
      if (!moveFromIds.has(moveId)) {
        orphanedMoveTo.push(moveId);
      }
    }

    return {
      valid: orphanedMoveFrom.length === 0 && orphanedMoveTo.length === 0,
      orphanedMoveFrom,
      orphanedMoveTo,
    };
  }

  /**
   * Gets the highest revision ID currently in use.
   *
   * @returns Highest ID, or -1 if no revisions exist
   */
  getHighestId(): number {
    if (this.revisions.length === 0) return -1;
    return Math.max(...this.revisions.map((r) => r.getId()));
  }

  /**
   * Ensures the next ID is higher than all existing IDs.
   *
   * Useful after loading a document with existing revisions
   * to prevent ID conflicts with new revisions.
   */
  syncNextId(): void {
    const highestId = this.getHighestId();
    if (highestId >= this.nextId) {
      this.nextId = highestId + 1;
    }
  }
}
