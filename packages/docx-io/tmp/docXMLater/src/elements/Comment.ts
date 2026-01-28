/**
 * Comment - Represents a comment/annotation in a Word document
 *
 * Comments allow users to annotate specific text ranges in a document.
 * They include author, date, content, and can have replies.
 */

import { Run } from './Run';
import { XMLElement } from '../xml/XMLBuilder';

/**
 * Comment properties
 */
export interface CommentProperties {
  /** Unique comment ID (assigned by CommentManager) */
  id?: number;
  /** Author who created the comment */
  author: string;
  /** Author's initials (optional) */
  initials?: string;
  /** Date when the comment was created */
  date?: Date;
  /** Comment content (text or runs) */
  content: string | Run | Run[];
  /** Parent comment ID (for replies) */
  parentId?: number;
  /** Whether the comment is resolved/done (w:done attribute per ECMA-376) */
  done?: boolean;
}

/**
 * Represents a comment/annotation in a document
 */
export class Comment {
  private id: number;
  private author: string;
  private initials: string;
  private date: Date;
  private runs: Run[];
  private parentId?: number;
  private done: boolean;

  /**
   * Creates a new Comment
   * @param properties - Comment properties
   */
  constructor(properties: CommentProperties) {
    this.id = properties.id ?? 0; // Will be assigned by CommentManager
    this.author = properties.author;
    this.initials = properties.initials || this.generateInitials(properties.author);
    this.date = properties.date || new Date();
    this.parentId = properties.parentId;
    this.done = properties.done ?? false;

    // Convert content to runs
    if (typeof properties.content === 'string') {
      this.runs = [new Run(properties.content)];
    } else if (Array.isArray(properties.content)) {
      this.runs = properties.content;
    } else {
      this.runs = [properties.content];
    }
  }

  /**
   * Generates initials from author name
   * Examples: "John Doe" -> "JD", "Jane Smith" -> "JS"
   */
  private generateInitials(author: string): string {
    const words = author.trim().split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return 'U';
    if (words.length === 1) return (words[0] || 'U').substring(0, 2).toUpperCase();
    return words
      .map(word => word[0] || '')
      .join('')
      .toUpperCase()
      .substring(0, 3) || 'U';
  }

  /**
   * Gets the comment ID
   */
  getId(): number {
    return this.id;
  }

  /**
   * Sets the comment ID (used by CommentManager)
   * @internal
   */
  setId(id: number): void {
    this.id = id;
  }

  /**
   * Gets the author
   */
  getAuthor(): string {
    return this.author;
  }

  /**
   * Sets the author
   */
  setAuthor(author: string): this {
    this.author = author;
    return this;
  }

  /**
   * Gets the author's initials
   */
  getInitials(): string {
    return this.initials;
  }

  /**
   * Sets the author's initials
   */
  setInitials(initials: string): this {
    this.initials = initials;
    return this;
  }

  /**
   * Gets the comment date
   */
  getDate(): Date {
    return this.date;
  }

  /**
   * Sets the comment date
   */
  setDate(date: Date): this {
    this.date = date;
    return this;
  }

  /**
   * Gets the parent comment ID (for replies)
   */
  getParentId(): number | undefined {
    return this.parentId;
  }

  /**
   * Checks if this is a reply to another comment
   */
  isReply(): boolean {
    return this.parentId !== undefined;
  }

  /**
   * Checks if the comment is resolved/done
   * Per ECMA-376 Part 1, Section 17.13.4.2 (w:done attribute)
   */
  isResolved(): boolean {
    return this.done;
  }

  /**
   * Marks the comment as resolved/done
   * Sets w:done="1" in the XML output
   */
  resolve(): this {
    this.done = true;
    return this;
  }

  /**
   * Marks the comment as unresolved
   * Removes w:done attribute from XML output
   */
  unresolve(): this {
    this.done = false;
    return this;
  }

  /**
   * Gets the runs in this comment
   */
  getRuns(): Run[] {
    return [...this.runs];
  }

  /**
   * Adds a run to this comment
   */
  addRun(run: Run): this {
    this.runs.push(run);
    return this;
  }

  /**
   * Gets the comment text (combines all runs)
   */
  getText(): string {
    return this.runs.map(run => run.getText()).join('');
  }

  /**
   * Gets the comment content (alias for getText for compatibility)
   */
  getContent(): string {
    return this.getText();
  }

  /**
   * Formats a date to ISO 8601 format for XML
   */
  private formatDate(date: Date): string {
    return date.toISOString();
  }

  /**
   * Generates XML for the comment range start marker
   * This goes in word/document.xml at the start of the commented range
   */
  toRangeStartXML(): XMLElement {
    return {
      name: 'w:commentRangeStart',
      attributes: {
        'w:id': this.id.toString(),
      },
      selfClosing: true,
    };
  }

  /**
   * Generates XML for the comment range end marker
   * This goes in word/document.xml at the end of the commented range
   */
  toRangeEndXML(): XMLElement {
    return {
      name: 'w:commentRangeEnd',
      attributes: {
        'w:id': this.id.toString(),
      },
      selfClosing: true,
    };
  }

  /**
   * Generates XML for the comment reference
   * This goes in word/document.xml after the range end, inside a run
   */
  toReferenceXML(): XMLElement {
    return {
      name: 'w:r',
      children: [
        {
          name: 'w:commentReference',
          attributes: {
            'w:id': this.id.toString(),
          },
          selfClosing: true,
        },
      ],
    };
  }

  /**
   * Generates XML for the comment definition
   * This goes in word/comments.xml
   */
  toXML(): XMLElement {
    const attributes: Record<string, string> = {
      'w:id': this.id.toString(),
      'w:author': this.author,
      'w:date': this.formatDate(this.date),
      'w:initials': this.initials,
    };

    // Add parent ID for replies
    if (this.parentId !== undefined) {
      attributes['w:parentId'] = this.parentId.toString();
    }

    // Add done attribute for resolved comments (per ECMA-376)
    if (this.done) {
      attributes['w:done'] = '1';
    }

    // Create paragraph containing the comment content
    const commentParagraph: XMLElement = {
      name: 'w:p',
      children: this.runs.map(run => run.toXML()),
    };

    return {
      name: 'w:comment',
      attributes,
      children: [commentParagraph],
    };
  }

  /**
   * Creates a new comment
   * @param author - Comment author
   * @param content - Comment content (text or runs)
   * @param initials - Optional author initials
   * @returns New Comment instance
   */
  static create(
    author: string,
    content: string | Run | Run[],
    initials?: string
  ): Comment {
    return new Comment({
      author,
      content,
      initials,
    });
  }

  /**
   * Creates a reply to an existing comment
   * @param parentId - ID of the parent comment
   * @param author - Reply author
   * @param content - Reply content (text or runs)
   * @param initials - Optional author initials
   * @returns New Comment instance (reply)
   */
  static createReply(
    parentId: number,
    author: string,
    content: string | Run | Run[],
    initials?: string
  ): Comment {
    return new Comment({
      author,
      content,
      initials,
      parentId,
    });
  }

  /**
   * Creates a comment with formatted content
   * @param author - Comment author
   * @param runs - Array of formatted runs
   * @param initials - Optional author initials
   * @returns New Comment instance
   */
  static createFormatted(
    author: string,
    runs: Run[],
    initials?: string
  ): Comment {
    return new Comment({
      author,
      content: runs,
      initials,
    });
  }
}
