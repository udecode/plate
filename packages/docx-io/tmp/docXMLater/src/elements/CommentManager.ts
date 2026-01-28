/**
 * CommentManager - Manages comments in a document
 *
 * Tracks all comments, assigns unique IDs, handles replies,
 * and generates the comments.xml file.
 *
 * Per ECMA-376, comment IDs must be unique across ALL annotation types
 * in a document. Use setIdProvider() to connect to a centralized ID allocator.
 */

import { Comment } from './Comment';
import { Run } from './Run';
import { XMLBuilder } from '../xml/XMLBuilder';

/**
 * Type for the centralized ID provider callback.
 * Returns the next available annotation ID from a shared counter.
 */
export type IdProviderCallback = () => number;

/**
 * Type for callback to notify of existing IDs (for synchronization).
 * Called when registering existing comments to keep the central counter in sync.
 */
export type IdExistsCallback = (existingId: number) => void;

/**
 * Comment entry stored by the manager
 */
interface CommentEntry {
  comment: Comment;
  /** Comments that are replies to this comment */
  replies: Comment[];
}

/**
 * Manages document comments
 */
export class CommentManager {
  private comments: Map<number, CommentEntry> = new Map();
  private nextId: number = 0;
  private idProvider: IdProviderCallback | null = null;
  private idExistsNotifier: IdExistsCallback | null = null;

  /**
   * Sets the centralized ID provider callback.
   * When set, IDs will be allocated from the centralized DocumentIdManager
   * instead of the local nextId counter.
   *
   * @param provider - Callback that returns the next available ID
   * @param existsNotifier - Optional callback to notify when existing IDs are found
   */
  setIdProvider(provider: IdProviderCallback, existsNotifier?: IdExistsCallback): void {
    this.idProvider = provider;
    this.idExistsNotifier = existsNotifier || null;
  }

  /**
   * Registers a comment with the manager
   * Assigns a unique ID
   * @param comment - Comment to register
   * @returns The registered comment (same instance)
   */
  register(comment: Comment): Comment {
    // Assign unique ID - use centralized provider if available
    const id = this.idProvider ? this.idProvider() : this.nextId++;
    comment.setId(id);

    // Store comment
    const entry: CommentEntry = {
      comment,
      replies: [],
    };
    this.comments.set(comment.getId(), entry);

    // If this is a reply, add it to the parent's replies array
    if (comment.isReply() && comment.getParentId() !== undefined) {
      const parentEntry = this.comments.get(comment.getParentId()!);
      if (parentEntry) {
        parentEntry.replies.push(comment);
      }
    }

    return comment;
  }

  /**
   * Registers an existing comment (from parsing) with its pre-assigned ID.
   * Unlike register(), this does NOT assign a new ID - the comment must already have one.
   * Used when loading comments from an existing document.
   * @param comment - Comment with ID already set
   */
  registerExisting(comment: Comment): void {
    const id = comment.getId();

    // Notify centralized ID manager if connected
    if (this.idExistsNotifier) {
      this.idExistsNotifier(id);
    }

    // Store comment
    const entry: CommentEntry = {
      comment,
      replies: [],
    };
    this.comments.set(id, entry);

    // Update local nextId if needed
    if (id >= this.nextId) {
      this.nextId = id + 1;
    }
  }

  /**
   * Links reply comments to their parents after all comments are parsed.
   * Must be called after all comments are registered via registerExisting().
   * This builds the reply arrays for each parent comment.
   */
  linkReplies(): void {
    for (const entry of this.comments.values()) {
      const comment = entry.comment;
      if (comment.isReply() && comment.getParentId() !== undefined) {
        const parentEntry = this.comments.get(comment.getParentId()!);
        if (parentEntry) {
          parentEntry.replies.push(comment);
        }
      }
    }
  }

  /**
   * Gets a comment by ID
   * @param id - Comment ID
   * @returns The comment, or undefined if not found
   */
  getComment(id: number): Comment | undefined {
    return this.comments.get(id)?.comment;
  }

  /**
   * Gets all comments (top-level only, not replies)
   * @returns Array of all top-level comments
   */
  getAllComments(): Comment[] {
    return Array.from(this.comments.values())
      .filter(entry => !entry.comment.isReply())
      .map(entry => entry.comment);
  }

  /**
   * Gets all comments including replies
   * @returns Array of all comments
   */
  getAllCommentsWithReplies(): Comment[] {
    return Array.from(this.comments.values()).map(entry => entry.comment);
  }

  /**
   * Gets replies to a comment
   * @param commentId - ID of the parent comment
   * @returns Array of reply comments
   */
  getReplies(commentId: number): Comment[] {
    const entry = this.comments.get(commentId);
    return entry ? [...entry.replies] : [];
  }

  /**
   * Checks if a comment has replies
   * @param commentId - ID of the comment
   * @returns True if the comment has replies
   */
  hasReplies(commentId: number): boolean {
    const entry = this.comments.get(commentId);
    return entry ? entry.replies.length > 0 : false;
  }

  /**
   * Gets the number of comments (including replies)
   * @returns Number of comments
   */
  getCount(): number {
    return this.comments.size;
  }

  /**
   * Gets the number of top-level comments (excluding replies)
   * @returns Number of top-level comments
   */
  getTopLevelCount(): number {
    return this.getAllComments().length;
  }

  /**
   * Gets all unique authors who have made comments
   * @returns Array of unique author names
   */
  getAuthors(): string[] {
    const authorsSet = new Set<string>();
    for (const entry of this.comments.values()) {
      authorsSet.add(entry.comment.getAuthor());
    }
    return Array.from(authorsSet);
  }

  /**
   * Gets comments by author
   * @param author - Author name to filter by
   * @returns Array of comments by the specified author
   */
  getCommentsByAuthor(author: string): Comment[] {
    return Array.from(this.comments.values())
      .map(entry => entry.comment)
      .filter(comment => comment.getAuthor() === author);
  }

  /**
   * Gets comments within a date range
   * @param startDate - Start of date range
   * @param endDate - End of date range
   * @returns Array of comments within the date range
   */
  getCommentsByDateRange(startDate: Date, endDate: Date): Comment[] {
    return Array.from(this.comments.values())
      .map(entry => entry.comment)
      .filter(comment => {
        const commentDate = comment.getDate();
        return commentDate >= startDate && commentDate <= endDate;
      });
  }

  /**
   * Removes a comment
   * Also removes all replies to that comment
   * @param id - Comment ID
   * @returns True if the comment was removed
   */
  removeComment(id: number): boolean {
    const entry = this.comments.get(id);
    if (!entry) {
      return false;
    }

    // Remove all replies first
    for (const reply of entry.replies) {
      this.comments.delete(reply.getId());
    }

    // Remove the comment itself
    return this.comments.delete(id);
  }

  /**
   * Clears all comments
   */
  clear(): void {
    this.comments.clear();
    this.nextId = 0;
  }

  /**
   * Sets the next ID to be assigned.
   * Used when loading documents to avoid ID collisions with existing comments.
   * @param id - The next ID value to use
   */
  setNextId(id: number): void {
    this.nextId = id;
  }

  /**
   * Creates and registers a new comment
   * @param author - Comment author
   * @param content - Comment content (text or runs)
   * @param initials - Optional author initials
   * @returns The created and registered comment
   */
  createComment(
    author: string,
    content: string | Run | Run[],
    initials?: string
  ): Comment {
    const comment = Comment.create(author, content, initials);
    return this.register(comment);
  }

  /**
   * Creates and registers a reply to an existing comment
   * @param parentCommentId - ID of the parent comment
   * @param author - Reply author
   * @param content - Reply content (text or runs)
   * @param initials - Optional author initials
   * @returns The created and registered reply
   * @throws Error if parent comment doesn't exist
   */
  createReply(
    parentCommentId: number,
    author: string,
    content: string | Run | Run[],
    initials?: string
  ): Comment {
    // Verify parent exists
    if (!this.comments.has(parentCommentId)) {
      throw new Error(
        `Cannot create reply: parent comment with ID ${parentCommentId} does not exist`
      );
    }

    const reply = Comment.createReply(parentCommentId, author, content, initials);
    return this.register(reply);
  }

  /**
   * Checks if there are any comments
   * @returns True if there are no comments
   */
  isEmpty(): boolean {
    return this.comments.size === 0;
  }

  /**
   * Gets a comment thread (comment and all its replies)
   * @param commentId - ID of the top-level comment
   * @returns Object with the comment and its replies
   */
  getCommentThread(commentId: number): { comment: Comment; replies: Comment[] } | undefined {
    const entry = this.comments.get(commentId);
    if (!entry || entry.comment.isReply()) {
      return undefined;
    }
    return {
      comment: entry.comment,
      replies: [...entry.replies],
    };
  }

  /**
   * Searches comments by text content
   * @param searchText - Text to search for (case-insensitive)
   * @returns Array of comments containing the search text
   */
  findCommentsByText(searchText: string): Comment[] {
    const lowerSearch = searchText.toLowerCase();
    return Array.from(this.comments.values())
      .map(entry => entry.comment)
      .filter(comment => comment.getText().toLowerCase().includes(lowerSearch));
  }

  /**
   * Gets all resolved/done comments
   * @returns Array of resolved comments
   */
  getResolvedComments(): Comment[] {
    return Array.from(this.comments.values())
      .map(entry => entry.comment)
      .filter(comment => comment.isResolved());
  }

  /**
   * Gets all unresolved comments
   * @returns Array of unresolved comments
   */
  getUnresolvedComments(): Comment[] {
    return Array.from(this.comments.values())
      .map(entry => entry.comment)
      .filter(comment => !comment.isResolved());
  }

  /**
   * Gets the most recent comments
   * @param count - Number of recent comments to return
   * @returns Array of most recent comments
   */
  getRecentComments(count: number): Comment[] {
    const allComments = this.getAllCommentsWithReplies();
    return allComments
      .sort((a, b) => b.getDate().getTime() - a.getDate().getTime())
      .slice(0, count);
  }

  /**
   * Gets statistics about comments
   * @returns Object with comment statistics
   */
  getStats(): {
    total: number;
    topLevel: number;
    replies: number;
    resolved: number;
    unresolved: number;
    authors: string[];
    nextId: number;
  } {
    const topLevel = this.getTopLevelCount();
    const resolved = this.getResolvedComments().length;
    return {
      total: this.comments.size,
      topLevel,
      replies: this.comments.size - topLevel,
      resolved,
      unresolved: this.comments.size - resolved,
      authors: this.getAuthors(),
      nextId: this.nextId,
    };
  }

  /**
   * Generates the word/comments.xml file content
   * @returns XML string for comments.xml
   */
  generateCommentsXml(): string {
    const comments = this.getAllCommentsWithReplies();

    if (comments.length === 0) {
      // Return minimal comments.xml
      return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
</w:comments>`;
    }

    // Build XML manually for comments
    let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
    xml += '<w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
    xml += ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\n';

    // Add each comment
    for (const comment of comments) {
      xml += this.commentToXmlString(comment);
    }

    xml += '</w:comments>';
    return xml;
  }

  /**
   * Converts a comment to XML string
   * @param comment - Comment to convert
   * @returns XML string for the comment
   */
  private commentToXmlString(comment: Comment): string {
    let xml = `  <w:comment w:id="${comment.getId()}"`;
    xml += ` w:author="${XMLBuilder.escapeXmlAttribute(comment.getAuthor())}"`;
    xml += ` w:date="${comment.getDate().toISOString()}"`;
    xml += ` w:initials="${XMLBuilder.escapeXmlAttribute(comment.getInitials())}"`;

    if (comment.isReply() && comment.getParentId() !== undefined) {
      xml += ` w:parentId="${comment.getParentId()}"`;
    }

    // Add done attribute for resolved comments (per ECMA-376)
    if (comment.isResolved()) {
      xml += ` w:done="1"`;
    }

    xml += '>\n';

    // Add paragraph with runs
    xml += '    <w:p>\n';
    for (const run of comment.getRuns()) {
      xml += this.runToXmlString(run, 6);
    }
    xml += '    </w:p>\n';

    xml += '  </w:comment>\n';
    return xml;
  }

  /**
   * Converts a run to XML string
   * @param run - Run to convert
   * @param indent - Number of spaces for indentation
   * @returns XML string for the run
   */
  private runToXmlString(run: Run, indent: number): string {
    const spaces = ' '.repeat(indent);
    const text = XMLBuilder.escapeXmlText(run.getText());

    let xml = `${spaces}<w:r>\n`;
    xml += `${spaces}  <w:t xml:space="preserve">${text}</w:t>\n`;
    xml += `${spaces}</w:r>\n`;

    return xml;
  }

  /**
   * Creates a new CommentManager
   * @returns New CommentManager instance
   */
  static create(): CommentManager {
    return new CommentManager();
  }
}
