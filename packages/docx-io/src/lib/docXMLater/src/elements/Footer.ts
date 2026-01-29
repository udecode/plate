/**
 * Footer - Represents a document footer
 *
 * Footers appear at the bottom of pages and can contain text, tables, images, and fields.
 * Different footers can be defined for first page, odd pages, and even pages.
 */

import type { XMLElement } from '../xml/XMLBuilder';
import { Paragraph } from './Paragraph';
import { Table } from './Table';

/**
 * Footer type
 */
export type FooterType = 'default' | 'first' | 'even';

/**
 * Footer content element
 */
type FooterElement = Paragraph | Table;

/**
 * Footer properties
 */
export interface FooterProperties {
  /** Footer type (default, first page, or even page) */
  type?: FooterType;
}

/**
 * Represents a document footer
 */
export class Footer {
  private elements: FooterElement[] = [];
  private type: FooterType;
  private footerId?: string;
  private rawXML?: string; // Store original XML for preservation

  /**
   * Creates a new footer
   * @param properties Footer properties
   */
  constructor(properties: FooterProperties = {}) {
    this.type = properties.type || 'default';
  }

  /**
   * Sets the raw XML content (used when loading existing footers)
   * @param xml Raw XML content
   */
  setRawXML(xml: string): this {
    this.rawXML = xml;
    return this;
  }

  /**
   * Gets the raw XML content if available
   */
  getRawXML(): string | undefined {
    return this.rawXML;
  }

  /**
   * Gets the footer type
   */
  getType(): FooterType {
    return this.type;
  }

  /**
   * Sets the footer ID (used for relationships)
   * @param id Footer ID
   */
  setFooterId(id: string): this {
    this.footerId = id;
    return this;
  }

  /**
   * Gets the footer ID
   */
  getFooterId(): string | undefined {
    return this.footerId;
  }

  /**
   * Adds a paragraph to the footer
   * @param paragraph Paragraph to add
   */
  addParagraph(paragraph: Paragraph): this {
    this.elements.push(paragraph);
    return this;
  }

  /**
   * Creates and adds a new paragraph
   * @param text Optional text content
   */
  createParagraph(text?: string): Paragraph {
    const para = new Paragraph();
    if (text) {
      para.addText(text);
    }
    this.elements.push(para);
    return para;
  }

  /**
   * Adds a table to the footer
   * @param table Table to add
   */
  addTable(table: Table): this {
    this.elements.push(table);
    return this;
  }

  /**
   * Creates and adds a new table
   * @param rows Number of rows
   * @param columns Number of columns
   */
  createTable(rows: number, columns: number): Table {
    const table = new Table(rows, columns);
    this.elements.push(table);
    return table;
  }

  /**
   * Gets all elements in the footer
   */
  getElements(): FooterElement[] {
    return [...this.elements];
  }

  /**
   * Gets the number of elements
   */
  getElementCount(): number {
    return this.elements.length;
  }

  /**
   * Clears all elements
   */
  clear(): this {
    this.elements = [];
    return this;
  }

  /**
   * Generates the complete footer XML file content
   * This creates a complete footer document (footer1.xml, etc.)
   */
  toXML(): string {
    // If we have raw XML preserved from loading, use it
    if (this.rawXML) {
      return this.rawXML;
    }

    // Otherwise generate from elements
    const elementXmls = this.elements.map((el) => el.toXML());

    let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
    xml +=
      '<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ';
    xml +=
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\n';

    // Add elements
    for (const element of elementXmls) {
      xml += this.renderElement(element, 1);
    }

    // If no elements, add an empty paragraph
    if (this.elements.length === 0) {
      xml += '  <w:p/>\n';
    }

    xml += '</w:ftr>';

    return xml;
  }

  /**
   * Renders an XML element to string with indentation
   */
  private renderElement(element: XMLElement, indent: number): string {
    const spaces = '  '.repeat(indent);
    let xml = '';

    if (element.selfClosing) {
      xml += `${spaces}<${element.name}`;
      if (element.attributes) {
        for (const [key, value] of Object.entries(element.attributes)) {
          xml += ` ${key}="${value}"`;
        }
      }
      xml += '/>\n';
    } else {
      xml += `${spaces}<${element.name}`;
      if (element.attributes) {
        for (const [key, value] of Object.entries(element.attributes)) {
          xml += ` ${key}="${value}"`;
        }
      }
      xml += '>';

      if (element.children && element.children.length > 0) {
        const hasOnlyText = element.children.every(
          (c) => typeof c === 'string'
        );

        if (hasOnlyText) {
          // Inline text content
          xml += element.children.join('');
        } else {
          // Block-level children
          xml += '\n';
          for (const child of element.children) {
            if (typeof child === 'string') {
              xml += spaces + '  ' + child + '\n';
            } else {
              xml += this.renderElement(child, indent + 1);
            }
          }
          xml += spaces;
        }
      }

      xml += `</${element.name}>\n`;
    }

    return xml;
  }

  /**
   * Gets the filename for this footer
   * @param number Footer number (1, 2, 3, etc.)
   */
  getFilename(number: number): string {
    return `footer${number}.xml`;
  }

  /**
   * Creates a default footer
   */
  static createDefault(): Footer {
    return new Footer({ type: 'default' });
  }

  /**
   * Creates a first page footer
   */
  static createFirst(): Footer {
    return new Footer({ type: 'first' });
  }

  /**
   * Creates an even page footer
   */
  static createEven(): Footer {
    return new Footer({ type: 'even' });
  }

  /**
   * Creates a footer with properties
   * @param properties Footer properties
   */
  static create(properties?: FooterProperties): Footer {
    return new Footer(properties);
  }
}
