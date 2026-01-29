/**
 * DocumentContent - Manages document body elements
 *
 * Handles paragraphs, tables, sections, and other body elements.
 * Extracted from Document.ts for better separation of concerns.
 */

import { Paragraph } from '../elements/Paragraph';
import { Table } from '../elements/Table';
import { Section } from '../elements/Section';
import { StructuredDocumentTag } from '../elements/StructuredDocumentTag';
import { TableOfContentsElement } from '../elements/TableOfContentsElement';

/**
 * Body element type - can be a Paragraph, Table, TOC, or SDT
 */
export type BodyElement =
  | Paragraph
  | Table
  | TableOfContentsElement
  | StructuredDocumentTag;

/**
 * Manages document content (paragraphs, tables, sections)
 */
export class DocumentContent {
  private bodyElements: BodyElement[] = [];
  private section: Section;

  constructor() {
    this.section = new Section();
  }

  // ==================== Body Elements ====================

  /**
   * Adds an existing paragraph to the document body
   *
   * @param paragraph - The Paragraph instance to add
   * @returns This instance for chaining
   */
  addParagraph(paragraph: Paragraph): this {
    this.bodyElements.push(paragraph);
    return this;
  }

  /**
   * Creates a new paragraph and adds it to the document
   *
   * @param text - Optional text content for the paragraph
   * @returns The created Paragraph instance
   */
  createParagraph(text?: string): Paragraph {
    const para = new Paragraph();
    if (text) {
      para.addText(text);
    }
    this.bodyElements.push(para);
    return para;
  }

  /**
   * Adds an existing table to the document body
   *
   * @param table - The Table instance to add
   * @returns This instance for chaining
   */
  addTable(table: Table): this {
    this.bodyElements.push(table);
    return this;
  }

  /**
   * Creates a new table and adds it to the document
   *
   * @param rows - Number of rows to create
   * @param columns - Number of columns per row
   * @returns The created Table instance
   */
  createTable(rows: number, columns: number): Table {
    const table = new Table(rows, columns);
    this.bodyElements.push(table);
    return table;
  }

  /**
   * Adds a Structured Document Tag to the document body
   *
   * @param sdt - The StructuredDocumentTag instance to add
   * @returns This instance for chaining
   */
  addStructuredDocumentTag(sdt: StructuredDocumentTag): this {
    this.bodyElements.push(sdt);
    return this;
  }

  /**
   * Adds a Table of Contents element to the document body
   *
   * @param toc - The TableOfContentsElement to add
   * @returns This instance for chaining
   */
  addTableOfContents(toc: TableOfContentsElement): this {
    this.bodyElements.push(toc);
    return this;
  }

  /**
   * Adds any body element to the document
   *
   * @param element - The body element to add
   * @returns This instance for chaining
   */
  addBodyElement(element: BodyElement): this {
    this.bodyElements.push(element);
    return this;
  }

  /**
   * Inserts a body element at a specific index
   *
   * @param index - Position to insert at (0-based)
   * @param element - The body element to insert
   * @returns This instance for chaining
   */
  insertBodyElementAt(index: number, element: BodyElement): this {
    index = Math.max(0, Math.min(index, this.bodyElements.length));
    this.bodyElements.splice(index, 0, element);
    return this;
  }

  /**
   * Removes a body element at a specific index
   *
   * @param index - Position to remove from (0-based)
   * @returns The removed element or undefined
   */
  removeBodyElementAt(index: number): BodyElement | undefined {
    if (index < 0 || index >= this.bodyElements.length) {
      return;
    }
    return this.bodyElements.splice(index, 1)[0];
  }

  // ==================== Getters ====================

  /**
   * Gets all body elements
   *
   * @returns Array of all body elements
   */
  getBodyElements(): BodyElement[] {
    return [...this.bodyElements];
  }

  /**
   * Gets body elements with mutable access (internal use)
   *
   * @returns Reference to body elements array
   * @internal
   */
  getBodyElementsMutable(): BodyElement[] {
    return this.bodyElements;
  }

  /**
   * Gets top-level paragraphs only
   *
   * @returns Array of Paragraph instances in document body
   */
  getParagraphs(): Paragraph[] {
    return this.bodyElements.filter(
      (el): el is Paragraph => el instanceof Paragraph
    );
  }

  /**
   * Gets all paragraphs including nested ones (in tables, SDTs)
   *
   * @returns Array of all Paragraph instances
   */
  getAllParagraphs(): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    const collectParagraphs = (elements: BodyElement[]) => {
      for (const element of elements) {
        if (element instanceof Paragraph) {
          paragraphs.push(element);
        } else if (element instanceof Table) {
          // Collect paragraphs from table cells
          for (let row = 0; row < element.getRowCount(); row++) {
            for (let col = 0; col < element.getColumnCount(); col++) {
              const cell = element.getCell(row, col);
              if (cell) {
                paragraphs.push(...cell.getParagraphs());
              }
            }
          }
        } else if (element instanceof StructuredDocumentTag) {
          // Recursively collect from SDT content
          const content = element.getContent();
          collectParagraphs(content as BodyElement[]);
        }
      }
    };

    collectParagraphs(this.bodyElements);
    return paragraphs;
  }

  /**
   * Gets top-level tables only
   *
   * @returns Array of Table instances in document body
   */
  getTables(): Table[] {
    return this.bodyElements.filter((el): el is Table => el instanceof Table);
  }

  /**
   * Gets all tables including nested ones
   *
   * @returns Array of all Table instances
   */
  getAllTables(): Table[] {
    const tables: Table[] = [];

    const collectTables = (elements: BodyElement[]) => {
      for (const element of elements) {
        if (element instanceof Table) {
          tables.push(element);
          // Check for nested tables in cells
          for (let row = 0; row < element.getRowCount(); row++) {
            for (let col = 0; col < element.getColumnCount(); col++) {
              const cell = element.getCell(row, col);
              if (cell) {
                // Tables can be nested in cell content
                const cellContent = cell.getParagraphs();
                // Note: Cells typically contain paragraphs, not tables directly
              }
            }
          }
        } else if (element instanceof StructuredDocumentTag) {
          collectTables(element.getContent() as BodyElement[]);
        }
      }
    };

    collectTables(this.bodyElements);
    return tables;
  }

  /**
   * Gets Table of Contents elements
   *
   * @returns Array of TableOfContentsElement instances
   */
  getTableOfContentsElements(): TableOfContentsElement[] {
    return this.bodyElements.filter(
      (el): el is TableOfContentsElement => el instanceof TableOfContentsElement
    );
  }

  /**
   * Gets Structured Document Tags
   *
   * @returns Array of StructuredDocumentTag instances
   */
  getStructuredDocumentTags(): StructuredDocumentTag[] {
    return this.bodyElements.filter(
      (el): el is StructuredDocumentTag => el instanceof StructuredDocumentTag
    );
  }

  // ==================== Counts ====================

  /**
   * Gets the total number of body elements
   */
  getBodyElementCount(): number {
    return this.bodyElements.length;
  }

  /**
   * Gets the number of top-level paragraphs
   */
  getParagraphCount(): number {
    return this.getParagraphs().length;
  }

  /**
   * Gets the number of top-level tables
   */
  getTableCount(): number {
    return this.getTables().length;
  }

  // ==================== Section ====================

  /**
   * Gets the document section (page setup, margins, etc.)
   *
   * @returns The Section instance
   */
  getSection(): Section {
    return this.section;
  }

  /**
   * Sets the document section
   *
   * @param section - The Section instance to set
   * @returns This instance for chaining
   */
  setSection(section: Section): this {
    this.section = section;
    return this;
  }

  // ==================== Clearing ====================

  /**
   * Clears all body elements
   *
   * @returns This instance for chaining
   */
  clear(): this {
    this.bodyElements = [];
    return this;
  }

  /**
   * Clears all paragraphs from the document
   *
   * @returns This instance for chaining
   */
  clearParagraphs(): this {
    this.bodyElements = this.bodyElements.filter(
      (el) => !(el instanceof Paragraph)
    );
    return this;
  }

  /**
   * Clears all tables from the document
   *
   * @returns This instance for chaining
   */
  clearTables(): this {
    this.bodyElements = this.bodyElements.filter(
      (el) => !(el instanceof Table)
    );
    return this;
  }

  // ==================== Search ====================

  /**
   * Finds the index of a body element
   *
   * @param element - The element to find
   * @returns Index or -1 if not found
   */
  indexOf(element: BodyElement): number {
    return this.bodyElements.indexOf(element);
  }

  /**
   * Checks if a body element exists
   *
   * @param element - The element to check
   * @returns true if the element is in the document
   */
  contains(element: BodyElement): boolean {
    return this.bodyElements.includes(element);
  }

  /**
   * Finds paragraphs by style ID
   *
   * @param styleId - The style ID to search for
   * @returns Array of paragraphs with the style
   */
  findParagraphsByStyle(styleId: string): Paragraph[] {
    const results: Paragraph[] = [];
    const normalizedStyleId = styleId.toLowerCase();

    for (const paragraph of this.getAllParagraphs()) {
      const paraStyle = paragraph.getStyle()?.toLowerCase();
      if (paraStyle === normalizedStyleId) {
        results.push(paragraph);
      }
    }

    return results;
  }

  // ==================== Statistics ====================

  /**
   * Gets word count for all text content
   *
   * @returns Approximate word count
   */
  getWordCount(): number {
    let wordCount = 0;
    for (const paragraph of this.getAllParagraphs()) {
      const text = paragraph.getText();
      if (text) {
        // Simple word counting - split on whitespace
        wordCount += text.split(/\s+/).filter((word) => word.length > 0).length;
      }
    }
    return wordCount;
  }

  /**
   * Gets character count for all text content
   *
   * @param includeSpaces - Whether to include spaces (default: true)
   * @returns Character count
   */
  getCharacterCount(includeSpaces = true): number {
    let charCount = 0;
    for (const paragraph of this.getAllParagraphs()) {
      const text = paragraph.getText();
      if (text) {
        charCount += includeSpaces
          ? text.length
          : text.replace(/\s/g, '').length;
      }
    }
    return charCount;
  }

  // ==================== Utility ====================

  /**
   * Creates a clone of this content instance
   *
   * Note: This creates shallow copies of body elements.
   * For deep cloning, individual elements should be cloned.
   *
   * @returns New DocumentContent instance
   */
  clone(): DocumentContent {
    const cloned = new DocumentContent();
    cloned.bodyElements = [...this.bodyElements];
    cloned.section = this.section?.clone();
    return cloned;
  }

  /**
   * Checks if the document has any content
   *
   * @returns true if document has no body elements
   */
  isEmpty(): boolean {
    return this.bodyElements.length === 0;
  }
}
