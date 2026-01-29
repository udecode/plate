/**
 * DocumentIdManager - Centralized annotation ID allocator
 *
 * Per ECMA-376, w:id attributes must be UNIQUE across ALL annotation types:
 * - w:bookmarkStart / w:bookmarkEnd
 * - w:ins / w:del (revisions)
 * - w:pPrChange / w:rPrChange / w:tblPrChange (property changes)
 * - w:moveFrom / w:moveTo
 * - w:commentRangeStart / w:commentRangeEnd
 * - w:comment
 *
 * This class provides a single source of truth for annotation IDs,
 * ensuring that BookmarkManager, RevisionManager, and CommentManager
 * all allocate from the same counter.
 */

export class DocumentIdManager {
  private nextId: number = 0;

  /**
   * Creates a new DocumentIdManager
   * @param initialNextId - Optional starting ID (default 0)
   */
  constructor(initialNextId: number = 0) {
    this.nextId = initialNextId;
  }

  /**
   * Initializes the ID counter from existing document content.
   * Scans ALL w:id attributes to find the global maximum.
   *
   * @param documentXml - Content of word/document.xml
   * @param commentsXml - Optional content of word/comments.xml
   */
  initializeFromDocument(documentXml?: string, commentsXml?: string): void {
    let globalMaxId = -1;

    // Scan document.xml for all w:id attributes
    if (documentXml) {
      const idRegex = /w:id="(\d+)"/g;
      let match: RegExpExecArray | null;

      while ((match = idRegex.exec(documentXml)) !== null) {
        const idStr = match[1];
        if (idStr) {
          const id = parseInt(idStr, 10);
          if (!isNaN(id) && id > globalMaxId) {
            globalMaxId = id;
          }
        }
      }
    }

    // Also scan comments.xml for w:id attributes
    if (commentsXml) {
      const idRegex = /w:id="(\d+)"/g;
      let match: RegExpExecArray | null;

      while ((match = idRegex.exec(commentsXml)) !== null) {
        const idStr = match[1];
        if (idStr) {
          const id = parseInt(idStr, 10);
          if (!isNaN(id) && id > globalMaxId) {
            globalMaxId = id;
          }
        }
      }
    }

    // Set nextId to one more than the highest existing ID
    if (globalMaxId >= 0) {
      this.nextId = globalMaxId + 1;
    }
  }

  /**
   * Gets the next available ID and increments the counter.
   * This is the primary method for allocating new annotation IDs.
   *
   * @returns The next available ID
   */
  getNextId(): number {
    return this.nextId++;
  }

  /**
   * Peeks at the next ID without consuming it.
   * Use this when you need to know what the next ID will be
   * without actually allocating it.
   *
   * @returns The next ID that would be allocated
   */
  peekNextId(): number {
    return this.nextId;
  }

  /**
   * Gets the current next ID value.
   * Alias for peekNextId() for backwards compatibility.
   *
   * @returns The current nextId value
   */
  getCurrentNextId(): number {
    return this.nextId;
  }

  /**
   * Sets the next ID to a specific value.
   * Use with caution - primarily for testing or special cases.
   *
   * @param id - The new next ID value
   */
  setNextId(id: number): void {
    this.nextId = id;
  }

  /**
   * Ensures the next ID is at least the given value.
   * If an existing ID is found that's >= current nextId, update to avoid collision.
   *
   * @param existingId - An ID that was found in existing content
   */
  ensureNextIdAbove(existingId: number): void {
    if (existingId >= this.nextId) {
      this.nextId = existingId + 1;
    }
  }

  /**
   * Resets the ID counter to 0.
   * Use when creating a new document from scratch.
   */
  reset(): void {
    this.nextId = 0;
  }

  /**
   * Gets statistics about the ID manager.
   *
   * @returns Object with nextId value
   */
  getStats(): { nextId: number } {
    return {
      nextId: this.nextId,
    };
  }

  /**
   * Creates a new DocumentIdManager instance.
   * Factory method for consistency with other managers.
   *
   * @param initialNextId - Optional starting ID (default 0)
   * @returns New DocumentIdManager instance
   */
  static create(initialNextId: number = 0): DocumentIdManager {
    return new DocumentIdManager(initialNextId);
  }
}
