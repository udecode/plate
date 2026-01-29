/**
 * Endnote - Represents an endnote in a Word document
 *
 * Endnotes appear at the end of the document or section and are referenced
 * within the document text via endnote references.
 */

import { Paragraph } from './Paragraph';
import { XMLBuilder, type XMLElement } from '../xml/XMLBuilder';

/**
 * Endnote type
 */
export enum EndnoteType {
  /** Normal endnote */
  Normal = 'normal',
  /** Separator between document text and endnotes */
  Separator = 'separator',
  /** Continuation separator for endnotes that continue to next page */
  ContinuationSeparator = 'continuationSeparator',
  /** Continuation notice at bottom of page when endnotes continue */
  ContinuationNotice = 'continuationNotice',
}

/**
 * Endnote properties
 */
export interface EndnoteProperties {
  /** Endnote ID (required, must be unique) */
  id: number;
  /** Type of endnote */
  type?: EndnoteType;
  /** Custom mark/symbol (optional, otherwise uses numbering) */
  customMark?: string;
}

/**
 * Represents an endnote in a document
 */
export class Endnote {
  private id: number;
  private type: EndnoteType;
  private customMark?: string;
  private paragraphs: Paragraph[] = [];

  /**
   * Creates a new endnote
   * @param properties Endnote properties
   */
  constructor(properties: EndnoteProperties) {
    this.id = properties.id;
    this.type = properties.type || EndnoteType.Normal;
    this.customMark = properties.customMark;
  }

  /**
   * Gets the endnote ID
   */
  getId(): number {
    return this.id;
  }

  /**
   * Gets the endnote type
   */
  getType(): EndnoteType {
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
   * Adds a paragraph to the endnote
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
   * Gets all paragraphs in the endnote
   */
  getParagraphs(): Paragraph[] {
    return [...this.paragraphs];
  }

  /**
   * Gets the text content of the endnote
   */
  getText(): string {
    return this.paragraphs.map((p) => p.getText()).join('\n');
  }

  /**
   * Generates the XML for this endnote
   */
  toXML(): XMLElement {
    const attrs: Record<string, any> = {
      'w:id': this.id.toString(),
    };

    if (this.type !== EndnoteType.Normal) {
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

    return XMLBuilder.w('endnote', attrs, children);
  }

  /**
   * Creates an endnote from text
   * @param id Endnote ID
   * @param text Text content
   * @returns New endnote instance
   */
  static fromText(id: number, text: string): Endnote {
    const endnote = new Endnote({ id });
    endnote.createParagraph(text);
    return endnote;
  }

  /**
   * Creates a separator endnote
   * @param id Endnote ID
   * @returns New separator endnote
   */
  static createSeparator(id: number): Endnote {
    const endnote = new Endnote({
      id,
      type: EndnoteType.Separator,
    });
    // Separator typically has a horizontal line
    endnote.createParagraph();
    // Add separator formatting if needed
    return endnote;
  }

  /**
   * Creates a continuation separator endnote
   * @param id Endnote ID
   * @returns New continuation separator endnote
   */
  static createContinuationSeparator(id: number): Endnote {
    return new Endnote({
      id,
      type: EndnoteType.ContinuationSeparator,
    });
  }

  /**
   * Creates a continuation notice endnote
   * @param id Endnote ID
   * @param text Notice text (e.g., "Continued on next page...")
   * @returns New continuation notice endnote
   */
  static createContinuationNotice(id: number, text = 'Continued...'): Endnote {
    const endnote = new Endnote({
      id,
      type: EndnoteType.ContinuationNotice,
    });
    endnote.createParagraph(text);
    return endnote;
  }
}
