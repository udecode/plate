/**
 * TableOfContentsElement - Wrapper for TableOfContents to be used as body element
 *
 * This class wraps a TableOfContents instance to make it compatible with the
 * Document body elements array (Paragraph | Table | TableOfContentsElement).
 *
 * The TableOfContents generates multiple XML elements (title + field paragraphs),
 * so this wrapper handles the XML generation properly.
 */

import { TableOfContents } from './TableOfContents';
import type { XMLElement } from '../xml/XMLBuilder';

/**
 * Represents a Table of Contents element in a document body
 */
export class TableOfContentsElement {
  private toc: TableOfContents;

  /**
   * Creates a new TableOfContentsElement
   * @param toc The TableOfContents to wrap
   */
  constructor(toc: TableOfContents) {
    this.toc = toc;
  }

  /**
   * Gets the wrapped TableOfContents instance
   * @returns The TableOfContents
   */
  getTableOfContents(): TableOfContents {
    return this.toc;
  }

  /**
   * Generates XML elements for this TOC
   * Note: Returns an array since TOC generates multiple paragraphs
   * @returns Array of XML elements (title paragraph + field paragraph)
   */
  toXML(): XMLElement[] {
    return this.toc.toXML();
  }

  /**
   * Creates a TableOfContentsElement from a TableOfContents
   * @param toc The TableOfContents to wrap
   * @returns New TableOfContentsElement instance
   */
  static create(toc: TableOfContents): TableOfContentsElement {
    return new TableOfContentsElement(toc);
  }

  /**
   * Creates a standard TableOfContentsElement
   * @param title Optional custom title (default: "Table of Contents")
   * @returns New TableOfContentsElement with standard TOC
   */
  static createStandard(title?: string): TableOfContentsElement {
    return new TableOfContentsElement(TableOfContents.createStandard(title));
  }

  /**
   * Creates a simple TableOfContentsElement (2 levels, no hyperlinks)
   * @param title Optional custom title
   * @returns New TableOfContentsElement with simple TOC
   */
  static createSimple(title?: string): TableOfContentsElement {
    return new TableOfContentsElement(TableOfContents.createSimple(title));
  }

  /**
   * Creates a detailed TableOfContentsElement (4 levels)
   * @param title Optional custom title
   * @returns New TableOfContentsElement with detailed TOC
   */
  static createDetailed(title?: string): TableOfContentsElement {
    return new TableOfContentsElement(TableOfContents.createDetailed(title));
  }

  /**
   * Creates a hyperlinked TableOfContentsElement (no page numbers)
   * @param title Optional custom title
   * @returns New TableOfContentsElement with hyperlinked TOC
   */
  static createHyperlinked(title?: string): TableOfContentsElement {
    return new TableOfContentsElement(TableOfContents.createHyperlinked(title));
  }
}
