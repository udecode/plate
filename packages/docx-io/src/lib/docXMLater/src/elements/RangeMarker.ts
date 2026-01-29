/**
 * RangeMarker - Represents range markers for tracked changes
 *
 * Range markers are used to mark the boundaries of moved or deleted content spans.
 * They enable Word to properly display and manage complex revision regions.
 */

import type { XMLElement } from '../xml/XMLBuilder';

/**
 * Range marker type
 */
export type RangeMarkerType =
  | 'moveFromRangeStart'
  | 'moveFromRangeEnd'
  | 'moveToRangeStart'
  | 'moveToRangeEnd'
  | 'customXmlMoveFromRangeStart'
  | 'customXmlMoveFromRangeEnd'
  | 'customXmlMoveToRangeStart'
  | 'customXmlMoveToRangeEnd'
  | 'customXmlInsRangeStart'
  | 'customXmlInsRangeEnd'
  | 'customXmlDelRangeStart'
  | 'customXmlDelRangeEnd';

/**
 * Range marker properties
 */
export interface RangeMarkerProperties {
  /** Unique ID for this range marker */
  id: number;
  /** Type of range marker */
  type: RangeMarkerType;
  /** Name linking start and end markers (for move operations) */
  name?: string;
  /** Author who made the change (for start markers only) */
  author?: string;
  /** Date when the change was made (for start markers only) */
  date?: Date;
}

/**
 * Represents a range marker for tracked changes
 * Range markers mark the boundaries of moved, inserted, or deleted content
 */
export class RangeMarker {
  private id: number;
  private type: RangeMarkerType;
  private name?: string;
  private author?: string;
  private date?: Date;

  /**
   * Creates a new RangeMarker
   * @param properties - Range marker properties
   */
  constructor(properties: RangeMarkerProperties) {
    this.id = properties.id;
    this.type = properties.type;
    this.name = properties.name;
    this.author = properties.author;
    this.date = properties.date;
  }

  /**
   * Gets the range marker ID
   */
  getId(): number {
    return this.id;
  }

  /**
   * Sets the range marker ID (used by RevisionManager)
   * @internal
   */
  setId(id: number): void {
    this.id = id;
  }

  /**
   * Gets the range marker type
   */
  getType(): RangeMarkerType {
    return this.type;
  }

  /**
   * Gets the range marker name
   */
  getName(): string | undefined {
    return this.name;
  }

  /**
   * Gets the author
   */
  getAuthor(): string | undefined {
    return this.author;
  }

  /**
   * Gets the date
   */
  getDate(): Date | undefined {
    return this.date;
  }

  /**
   * Checks if this is a start marker
   */
  isStartMarker(): boolean {
    return this.type.endsWith('RangeStart');
  }

  /**
   * Checks if this is an end marker
   */
  isEndMarker(): boolean {
    return this.type.endsWith('RangeEnd');
  }

  /**
   * Gets the XML element name for this range marker type
   */
  private getElementName(): string {
    switch (this.type) {
      case 'moveFromRangeStart':
        return 'w:moveFromRangeStart';
      case 'moveFromRangeEnd':
        return 'w:moveFromRangeEnd';
      case 'moveToRangeStart':
        return 'w:moveToRangeStart';
      case 'moveToRangeEnd':
        return 'w:moveToRangeEnd';
      case 'customXmlMoveFromRangeStart':
        return 'w:customXmlMoveFromRangeStart';
      case 'customXmlMoveFromRangeEnd':
        return 'w:customXmlMoveFromRangeEnd';
      case 'customXmlMoveToRangeStart':
        return 'w:customXmlMoveToRangeStart';
      case 'customXmlMoveToRangeEnd':
        return 'w:customXmlMoveToRangeEnd';
      case 'customXmlInsRangeStart':
        return 'w:customXmlInsRangeStart';
      case 'customXmlInsRangeEnd':
        return 'w:customXmlInsRangeEnd';
      case 'customXmlDelRangeStart':
        return 'w:customXmlDelRangeStart';
      case 'customXmlDelRangeEnd':
        return 'w:customXmlDelRangeEnd';
      default:
        return 'w:moveFromRangeStart';
    }
  }

  /**
   * Formats a date to ISO 8601 format for XML
   */
  private formatDate(date: Date): string {
    return date.toISOString();
  }

  /**
   * Generates XML for this range marker
   * @returns XMLElement representing the range marker
   */
  toXML(): XMLElement {
    const attributes: Record<string, string> = {
      'w:id': this.id.toString(),
    };

    // Add name attribute for move operations
    if (this.name) {
      attributes['w:name'] = this.name;
    }

    // Add author and date for start markers
    if (this.isStartMarker() && this.author) {
      attributes['w:author'] = this.author;
      if (this.date) {
        attributes['w:date'] = this.formatDate(this.date);
      }
    }

    const elementName = this.getElementName();

    return {
      name: elementName,
      attributes,
      children: [], // Range markers are self-closing
    };
  }

  /**
   * Creates a moveFromRangeStart marker
   * @param id - Unique ID
   * @param name - Move operation name (links start/end markers)
   * @param author - Author who made the move
   * @param date - Optional date (defaults to now)
   * @returns New RangeMarker instance
   */
  static createMoveFromStart(
    id: number,
    name: string,
    author: string,
    date?: Date
  ): RangeMarker {
    return new RangeMarker({
      id,
      type: 'moveFromRangeStart',
      name,
      author,
      date: date || new Date(),
    });
  }

  /**
   * Creates a moveFromRangeEnd marker
   * @param id - Unique ID (must match the start marker)
   * @returns New RangeMarker instance
   */
  static createMoveFromEnd(id: number): RangeMarker {
    return new RangeMarker({
      id,
      type: 'moveFromRangeEnd',
    });
  }

  /**
   * Creates a moveToRangeStart marker
   * @param id - Unique ID
   * @param name - Move operation name (links to moveFrom markers)
   * @param author - Author who made the move
   * @param date - Optional date (defaults to now)
   * @returns New RangeMarker instance
   */
  static createMoveToStart(
    id: number,
    name: string,
    author: string,
    date?: Date
  ): RangeMarker {
    return new RangeMarker({
      id,
      type: 'moveToRangeStart',
      name,
      author,
      date: date || new Date(),
    });
  }

  /**
   * Creates a moveToRangeEnd marker
   * @param id - Unique ID (must match the start marker)
   * @returns New RangeMarker instance
   */
  static createMoveToEnd(id: number): RangeMarker {
    return new RangeMarker({
      id,
      type: 'moveToRangeEnd',
    });
  }

  /**
   * Creates a customXmlInsRangeStart marker
   * @param id - Unique ID
   * @param author - Author who made the insertion
   * @param date - Optional date (defaults to now)
   * @returns New RangeMarker instance
   */
  static createCustomXmlInsStart(
    id: number,
    author: string,
    date?: Date
  ): RangeMarker {
    return new RangeMarker({
      id,
      type: 'customXmlInsRangeStart',
      author,
      date: date || new Date(),
    });
  }

  /**
   * Creates a customXmlInsRangeEnd marker
   * @param id - Unique ID (must match the start marker)
   * @returns New RangeMarker instance
   */
  static createCustomXmlInsEnd(id: number): RangeMarker {
    return new RangeMarker({
      id,
      type: 'customXmlInsRangeEnd',
    });
  }

  /**
   * Creates a customXmlDelRangeStart marker
   * @param id - Unique ID
   * @param author - Author who made the deletion
   * @param date - Optional date (defaults to now)
   * @returns New RangeMarker instance
   */
  static createCustomXmlDelStart(
    id: number,
    author: string,
    date?: Date
  ): RangeMarker {
    return new RangeMarker({
      id,
      type: 'customXmlDelRangeStart',
      author,
      date: date || new Date(),
    });
  }

  /**
   * Creates a customXmlDelRangeEnd marker
   * @param id - Unique ID (must match the start marker)
   * @returns New RangeMarker instance
   */
  static createCustomXmlDelEnd(id: number): RangeMarker {
    return new RangeMarker({
      id,
      type: 'customXmlDelRangeEnd',
    });
  }

  /**
   * Creates a customXmlMoveFromRangeStart marker
   * @param id - Unique ID
   * @param name - Move operation name
   * @param author - Author who made the move
   * @param date - Optional date (defaults to now)
   * @returns New RangeMarker instance
   */
  static createCustomXmlMoveFromStart(
    id: number,
    name: string,
    author: string,
    date?: Date
  ): RangeMarker {
    return new RangeMarker({
      id,
      type: 'customXmlMoveFromRangeStart',
      name,
      author,
      date: date || new Date(),
    });
  }

  /**
   * Creates a customXmlMoveFromRangeEnd marker
   * @param id - Unique ID (must match the start marker)
   * @returns New RangeMarker instance
   */
  static createCustomXmlMoveFromEnd(id: number): RangeMarker {
    return new RangeMarker({
      id,
      type: 'customXmlMoveFromRangeEnd',
    });
  }

  /**
   * Creates a customXmlMoveToRangeStart marker
   * @param id - Unique ID
   * @param name - Move operation name
   * @param author - Author who made the move
   * @param date - Optional date (defaults to now)
   * @returns New RangeMarker instance
   */
  static createCustomXmlMoveToStart(
    id: number,
    name: string,
    author: string,
    date?: Date
  ): RangeMarker {
    return new RangeMarker({
      id,
      type: 'customXmlMoveToRangeStart',
      name,
      author,
      date: date || new Date(),
    });
  }

  /**
   * Creates a customXmlMoveToRangeEnd marker
   * @param id - Unique ID (must match the start marker)
   * @returns New RangeMarker instance
   */
  static createCustomXmlMoveToEnd(id: number): RangeMarker {
    return new RangeMarker({
      id,
      type: 'customXmlMoveToRangeEnd',
    });
  }
}
