/**
 * Header - Represents a document header
 *
 * Headers appear at the top of pages and can contain text, tables, images, and fields.
 * Different headers can be defined for first page, odd pages, and even pages.
 */

import type { XMLElement } from '../xml/XMLBuilder';
import { Paragraph } from './Paragraph';
import { Table } from './Table';

/**
 * Header type
 */
export type HeaderType = 'default' | 'first' | 'even';

/**
 * Header content element
 */
type HeaderElement = Paragraph | Table;

/**
 * Header properties
 */
export interface HeaderProperties {
  /** Header type (default, first page, or even page) */
  type?: HeaderType;
}

/**
 * Represents a document header
 */
export class Header {
  private elements: HeaderElement[] = [];
  private type: HeaderType;
  private headerId?: string;
  private rawXML?: string; // Store original XML for preservation

  /**
   * Creates a new header
   * @param properties Header properties
   */
  constructor(properties: HeaderProperties = {}) {
    this.type = properties.type || 'default';
  }

  /**
   * Sets the raw XML content (used when loading existing headers)
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
   * Gets the header type
   */
  getType(): HeaderType {
    return this.type;
  }

  /**
   * Sets the header ID (used for relationships)
   * @param id Header ID
   */
  setHeaderId(id: string): this {
    this.headerId = id;
    return this;
  }

  /**
   * Gets the header ID
   */
  getHeaderId(): string | undefined {
    return this.headerId;
  }

  /**
   * Adds a paragraph to the header
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
   * Adds a table to the header
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
   * Gets all elements in the header
   */
  getElements(): HeaderElement[] {
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
   * Generates the complete header XML file content
   * This creates a complete header document (header1.xml, etc.)
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
      '<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ';
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

    xml += '</w:hdr>';

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
   * Gets the filename for this header
   * @param number Header number (1, 2, 3, etc.)
   */
  getFilename(number: number): string {
    return `header${number}.xml`;
  }

  /**
   * Creates a default header
   */
  static createDefault(): Header {
    return new Header({ type: 'default' });
  }

  /**
   * Creates a first page header
   */
  static createFirst(): Header {
    return new Header({ type: 'first' });
  }

  /**
   * Creates an even page header
   */
  static createEven(): Header {
    return new Header({ type: 'even' });
  }

  /**
   * Creates a header with properties
   * @param properties Header properties
   */
  static create(properties?: HeaderProperties): Header {
    return new Header(properties);
  }
}
