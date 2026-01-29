/**
 * TableGridChange - Represents tracked changes to table grid (column structure)
 *
 * Tracks changes to table column widths, additions, and deletions.
 * Per ECMA-376 Part 4 §17.13.5.35
 */

import { type XMLElement, XMLBuilder } from '../xml/XMLBuilder';

/**
 * Table grid column definition
 */
export interface GridColumn {
  /** Column width in twips */
  width: number;
}

/**
 * Table grid change properties
 */
export interface TableGridChangeProperties {
  /** Unique revision ID */
  id: number;
  /** Author who made the change */
  author?: string;
  /** Date when the change was made */
  date?: Date;
  /** Previous grid columns (before the change) */
  previousGrid: GridColumn[];
}

/**
 * Represents a tracked change to a table grid
 */
export class TableGridChange {
  private id: number;
  private author?: string;
  private date?: Date;
  private previousGrid: GridColumn[];

  /**
   * Creates a new TableGridChange
   * @param properties - Table grid change properties
   */
  constructor(properties: TableGridChangeProperties) {
    this.id = properties.id;
    this.author = properties.author;
    this.date = properties.date;
    this.previousGrid = properties.previousGrid;
  }

  /**
   * Gets the revision ID
   */
  getId(): number {
    return this.id;
  }

  /**
   * Sets the revision ID (used by RevisionManager)
   * @internal
   */
  setId(id: number): void {
    this.id = id;
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
   * Gets the previous grid columns
   */
  getPreviousGrid(): GridColumn[] {
    return [...this.previousGrid];
  }

  /**
   * Formats a date to ISO 8601 format for XML
   */
  private formatDate(date: Date): string {
    return date.toISOString();
  }

  /**
   * Generates XML for this table grid change
   * @returns XMLElement representing the table grid change
   */
  toXML(): XMLElement {
    const attributes: Record<string, string> = {
      'w:id': this.id.toString(),
    };

    if (this.author) {
      attributes['w:author'] = this.author;
    }
    if (this.date) {
      attributes['w:date'] = this.formatDate(this.date);
    }

    // Build previous grid
    const gridChildren: XMLElement[] = [];
    for (const col of this.previousGrid) {
      gridChildren.push(
        XMLBuilder.wSelf('gridCol', { 'w:w': col.width.toString() })
      );
    }

    const tblGridElement = XMLBuilder.w('tblGrid', undefined, gridChildren);

    return {
      name: 'w:tblGridChange',
      attributes,
      children: [tblGridElement],
    };
  }

  /**
   * Creates a table grid change
   * @param id - Unique revision ID
   * @param previousGrid - Previous grid columns
   * @param author - Optional author
   * @param date - Optional date (defaults to now)
   * @returns New TableGridChange instance
   */
  static create(
    id: number,
    previousGrid: GridColumn[],
    author?: string,
    date?: Date
  ): TableGridChange {
    return new TableGridChange({
      id,
      author,
      date: date || new Date(),
      previousGrid,
    });
  }
}
