/**
 * DocumentTracking - Manages document revisions and comments
 *
 * Provides a unified interface for track changes and comment management.
 * Delegates to RevisionManager and CommentManager for implementation.
 * Extracted from Document.ts for better separation of concerns.
 */

import { Revision, RevisionType } from "../elements/Revision";
import { RevisionManager } from "../elements/RevisionManager";
import { Comment } from "../elements/Comment";
import { CommentManager } from "../elements/CommentManager";
import { DocumentTrackingContext } from "../tracking/DocumentTrackingContext";
import type { TrackingContext } from "../tracking/TrackingContext";

/**
 * Manages document tracking features (revisions and comments)
 */
export class DocumentTracking {
  private revisionManager: RevisionManager;
  private commentManager: CommentManager;
  private trackingContext: DocumentTrackingContext;
  private trackChangesEnabled: boolean = false;
  private defaultAuthor: string = "Unknown";

  constructor(revisionManager?: RevisionManager) {
    this.revisionManager = revisionManager || RevisionManager.create();
    this.commentManager = CommentManager.create();
    this.trackingContext = new DocumentTrackingContext(this.revisionManager);
  }

  // ==================== Revision Manager Access ====================

  /**
   * Gets the RevisionManager instance
   *
   * @returns The RevisionManager for advanced revision operations
   */
  getRevisionManager(): RevisionManager {
    return this.revisionManager;
  }

  /**
   * Sets the RevisionManager instance
   *
   * @param manager - The RevisionManager to use
   * @returns This instance for chaining
   */
  setRevisionManager(manager: RevisionManager): this {
    this.revisionManager = manager;
    this.trackingContext = new DocumentTrackingContext(manager);
    return this;
  }

  // ==================== Comment Manager Access ====================

  /**
   * Gets the CommentManager instance
   *
   * @returns The CommentManager for advanced comment operations
   */
  getCommentManager(): CommentManager {
    return this.commentManager;
  }

  /**
   * Sets the CommentManager instance
   *
   * @param manager - The CommentManager to use
   * @returns This instance for chaining
   */
  setCommentManager(manager: CommentManager): this {
    this.commentManager = manager;
    return this;
  }

  // ==================== Tracking Context ====================

  /**
   * Gets the tracking context for automatic change tracking
   *
   * @returns The TrackingContext instance
   */
  getTrackingContext(): TrackingContext {
    return this.trackingContext;
  }

  // ==================== Track Changes ====================

  /**
   * Enables track changes mode
   *
   * @param author - Default author for changes
   * @returns This instance for chaining
   */
  enableTrackChanges(author?: string): this {
    this.trackChangesEnabled = true;
    if (author) {
      this.defaultAuthor = author;
    }
    return this;
  }

  /**
   * Disables track changes mode
   *
   * @returns This instance for chaining
   */
  disableTrackChanges(): this {
    this.trackChangesEnabled = false;
    return this;
  }

  /**
   * Checks if track changes is enabled
   *
   * @returns true if track changes is enabled
   */
  isTrackChangesEnabled(): boolean {
    return this.trackChangesEnabled;
  }

  /**
   * Gets the default author for track changes
   *
   * @returns The default author name
   */
  getDefaultAuthor(): string {
    return this.defaultAuthor;
  }

  /**
   * Sets the default author for track changes
   *
   * @param author - The author name
   * @returns This instance for chaining
   */
  setDefaultAuthor(author: string): this {
    this.defaultAuthor = author;
    return this;
  }

  // ==================== Revision Operations ====================

  /**
   * Adds a revision to the document
   *
   * @param revision - The Revision to add
   * @returns This instance for chaining
   */
  addRevision(revision: Revision): this {
    this.revisionManager.register(revision);
    return this;
  }

  /**
   * Gets all revisions
   *
   * @returns Array of all revisions
   */
  getRevisions(): Revision[] {
    return this.revisionManager.getAllRevisions();
  }

  /**
   * Gets revisions by type
   *
   * @param type - The revision type to filter by
   * @returns Array of matching revisions
   */
  getRevisionsByType(type: RevisionType): Revision[] {
    return this.revisionManager
      .getAllRevisions()
      .filter((r: Revision) => r.getType() === type);
  }

  /**
   * Gets revisions by author
   *
   * @param author - The author to filter by
   * @returns Array of matching revisions
   */
  getRevisionsByAuthor(author: string): Revision[] {
    return this.revisionManager
      .getAllRevisions()
      .filter((r: Revision) => r.getAuthor() === author);
  }

  /**
   * Gets the number of revisions
   *
   * @returns Revision count
   */
  getRevisionCount(): number {
    return this.revisionManager.getCount();
  }

  /**
   * Checks if there are any revisions
   *
   * @returns true if there are revisions
   */
  hasRevisions(): boolean {
    return this.revisionManager.getCount() > 0;
  }

  /**
   * Clears all revisions
   *
   * @returns This instance for chaining
   */
  clearRevisions(): this {
    this.revisionManager.clear();
    return this;
  }

  // ==================== Comment Operations ====================

  /**
   * Adds a comment to the document
   *
   * @param comment - The Comment to add
   * @returns This instance for chaining
   */
  addComment(comment: Comment): this {
    this.commentManager.register(comment);
    return this;
  }

  /**
   * Creates and adds a new comment
   *
   * @param author - Comment author
   * @param content - Comment content (paragraph text)
   * @param initials - Author initials (optional)
   * @returns The created Comment
   */
  createComment(author: string, content: string, initials?: string): Comment {
    return this.commentManager.createComment(author, content, initials);
  }

  /**
   * Gets all comments
   *
   * @returns Array of all comments
   */
  getComments(): Comment[] {
    return this.commentManager.getAllComments();
  }

  /**
   * Gets a comment by ID
   *
   * @param id - The comment ID
   * @returns The Comment or undefined
   */
  getComment(id: number): Comment | undefined {
    const comments = this.commentManager.getAllComments();
    return comments.find((c) => c.getId() === id);
  }

  /**
   * Gets comments by author
   *
   * @param author - The author to filter by
   * @returns Array of matching comments
   */
  getCommentsByAuthor(author: string): Comment[] {
    return this.commentManager
      .getAllComments()
      .filter((c: Comment) => c.getAuthor() === author);
  }

  /**
   * Gets the number of comments
   *
   * @returns Comment count
   */
  getCommentCount(): number {
    return this.commentManager.getCount();
  }

  /**
   * Checks if there are any comments
   *
   * @returns true if there are comments
   */
  hasComments(): boolean {
    return this.commentManager.getCount() > 0;
  }

  /**
   * Removes a comment by ID
   *
   * @param id - The comment ID to remove
   * @returns true if the comment was removed
   */
  removeComment(id: number): boolean {
    const comment = this.getComment(id);
    if (comment) {
      // Note: CommentManager doesn't have a remove method
      // This would need to be implemented in CommentManager
      return false;
    }
    return false;
  }

  /**
   * Clears all comments
   *
   * @returns This instance for chaining
   */
  clearComments(): this {
    this.commentManager.clear();
    return this;
  }

  // ==================== Statistics ====================

  /**
   * Gets tracking statistics
   *
   * @returns Object with revision and comment counts
   */
  getStats(): {
    revisions: number;
    comments: number;
    insertions: number;
    deletions: number;
    formatChanges: number;
  } {
    const revisions = this.revisionManager.getAllRevisions();
    const insertions = revisions.filter(
      (r: Revision) => r.getType() === "insert"
    ).length;
    const deletions = revisions.filter(
      (r: Revision) => r.getType() === "delete"
    ).length;
    const formatChanges = revisions.filter(
      (r: Revision) =>
        r.getType() === "runPropertiesChange" ||
        r.getType() === "paragraphPropertiesChange"
    ).length;

    return {
      revisions: revisions.length,
      comments: this.commentManager.getCount(),
      insertions,
      deletions,
      formatChanges,
    };
  }

  // ==================== Utility ====================

  /**
   * Clears all tracking data (revisions and comments)
   *
   * @returns This instance for chaining
   */
  clear(): this {
    this.revisionManager.clear();
    this.commentManager.clear();
    return this;
  }

  /**
   * Creates a clone of this tracking instance
   *
   * @returns New DocumentTracking instance
   */
  clone(): DocumentTracking {
    const cloned = new DocumentTracking();
    cloned.trackChangesEnabled = this.trackChangesEnabled;
    cloned.defaultAuthor = this.defaultAuthor;
    // Note: Revisions and comments would need deep cloning
    return cloned;
  }

  /**
   * Disposes of resources
   */
  dispose(): void {
    this.revisionManager.clear();
    this.commentManager.clear();
  }
}
