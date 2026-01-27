/**
 * Footnote - Represents a footnote in a Word document
 *
 * Footnotes appear at the bottom of the page and are referenced
 * within the document text via footnote references.
 */

import { Paragraph } from './Paragraph';
import { XMLBuilder, XMLElement } from '../xml/XMLBuilder';

/**
 * Footnote type
 */
export enum FootnoteType {
  /** Normal footnote */
  Normal = 'normal',
  /** Separator between document text and footnotes */
  Separator = 'separator',
  /** Continuation separator for footnotes that continue to next page */
  ContinuationSeparator = 'continuationSeparator',
  /** Continuation notice at bottom of page when footnotes continue */
  ContinuationNotice = 'continuationNotice',
}

/**
 * Footnote properties
 */
export interface FootnoteProperties {
  /** Footnote ID (required, must be unique) */
  id: number;
  /** Type of footnote */
  type?: FootnoteType;
  /** Custom mark/symbol (optional, otherwise uses numbering) */
  customMark?: string;
}

/**
 * Represents a footnote in a document
 */
export class Footnote {
  private id: number;
  private type: FootnoteType;
  private customMark?: string;
  private paragraphs: Paragraph[] = [];

  /**
   * Creates a new footnote
   * @param properties Footnote properties
   */
  constructor(properties: FootnoteProperties) {
    this.id = properties.id;
    this.type = properties.type || FootnoteType.Normal;
    this.customMark = properties.customMark;
  }

  /**
   * Gets the footnote ID
   */
  getId(): number {
    return this.id;
  }

  /**
   * Gets the footnote type
   */
  getType(): FootnoteType {
    return this.type;
  }

  /**
   * Gets the custom mark
   */
  getCustomMark(): string | undefined {
    return this.customMark;
  }

  /**
   * Sets the custom mark
   * @param mark Custom mark/symbol
   */
  setCustomMark(mark: string): this {
    this.customMark = mark;
    return this;
  }

  /**
   * Adds a paragraph to the footnote
   * @param paragraph Paragraph to add
   */
  addParagraph(paragraph: Paragraph): this {
    this.paragraphs.push(paragraph);
    return this;
  }

  /**
   * Creates and adds a new paragraph
   * @param text Optional text content
   * @returns The created paragraph
   */
  createParagraph(text?: string): Paragraph {
    const para = new Paragraph();
    if (text) {
      para.addText(text);
    }
    this.paragraphs.push(para);
    return para;
  }

  /**
   * Gets all paragraphs in the footnote
   */
  getParagraphs(): Paragraph[] {
    return [...this.paragraphs];
  }

  /**
   * Gets the text content of the footnote
   */
  getText(): string {
    return this.paragraphs.map(p => p.getText()).join('\n');
  }

  /**
   * Generates the XML for this footnote
   */
  toXML(): XMLElement {
    const attrs: Record<string, any> = {
      'w:id': this.id.toString(),
    };

    if (this.type !== FootnoteType.Normal) {
      attrs['w:type'] = this.type;
    }

    const children: XMLElement[] = [];

    // Add paragraphs
    for (const para of this.paragraphs) {
      children.push(para.toXML());
    }

    // If no paragraphs, add an empty one (required)
    if (children.length === 0) {
      children.push(XMLBuilder.w('p'));
    }

    return XMLBuilder.w('footnote', attrs, children);
  }

  /**
   * Creates a footnote from text
   * @param id Footnote ID
   * @param text Text content
   * @returns New footnote instance
   */
  static fromText(id: number, text: string): Footnote {
    const footnote = new Footnote({ id });
    footnote.createParagraph(text);
    return footnote;
  }

  /**
   * Creates a separator footnote
   * @param id Footnote ID
   * @returns New separator footnote
   */
  static createSeparator(id: number): Footnote {
    const footnote = new Footnote({
      id,
      type: FootnoteType.Separator
    });
    // Separator typically has a horizontal line
    footnote.createParagraph();
    // Add separator formatting if needed
    return footnote;
  }

  /**
   * Creates a continuation separator footnote
   * @param id Footnote ID
   * @returns New continuation separator footnote
   */
  static createContinuationSeparator(id: number): Footnote {
    return new Footnote({
      id,
      type: FootnoteType.ContinuationSeparator
    });
  }

  /**
   * Creates a continuation notice footnote
   * @param id Footnote ID
   * @param text Notice text (e.g., "Continued on next page...")
   * @returns New continuation notice footnote
   */
  static createContinuationNotice(id: number, text: string = 'Continued...'): Footnote {
    const footnote = new Footnote({
      id,
      type: FootnoteType.ContinuationNotice
    });
    footnote.createParagraph(text);
    return footnote;
  }
}