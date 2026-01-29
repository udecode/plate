/**
 * FootnoteManager - Manages footnotes in a document
 *
 * Handles creation, registration, and XML generation for footnotes.
 * Maintains unique IDs and proper ordering.
 */

import { Footnote } from './Footnote';
import { XMLBuilder, type XMLElement } from '../xml/XMLBuilder';
import { XMLParser } from '../xml/XMLParser';

/**
 * Manages footnotes in a document
 */
export class FootnoteManager {
  private footnotes: Map<number, Footnote> = new Map();
  private nextId = 1;

  /**
   * Creates a new FootnoteManager
   * @private Use static factory method
   */
  private constructor() {
    // Add special footnotes (separators) with negative IDs
    this.addSpecialFootnotes();
  }

  /**
   * Adds special footnotes (separator, continuation)
   * These use negative IDs as per OOXML specification
   */
  private addSpecialFootnotes(): void {
    // Separator footnote (ID -1)
    const separator = Footnote.createSeparator(-1);
    this.footnotes.set(-1, separator);

    // Continuation separator (ID 0)
    const continuationSep = Footnote.createContinuationSeparator(0);
    this.footnotes.set(0, continuationSep);
  }

  /**
   * Creates a new FootnoteManager instance
   */
  static create(): FootnoteManager {
    return new FootnoteManager();
  }

  /**
   * Registers a footnote
   * @param footnote Footnote to register
   * @returns The registered footnote
   */
  register(footnote: Footnote): Footnote {
    const id = footnote.getId();

    // Ensure ID is not already used (except for special footnotes)
    if (id > 0 && this.footnotes.has(id)) {
      throw new Error(`Footnote with ID ${id} already exists`);
    }

    this.footnotes.set(id, footnote);

    // Update next ID if needed
    if (id >= this.nextId) {
      this.nextId = id + 1;
    }

    return footnote;
  }

  /**
   * Creates and registers a new footnote
   * @param text Footnote text
   * @returns The created footnote
   */
  createFootnote(text: string): Footnote {
    const footnote = Footnote.fromText(this.nextId++, text);
    this.footnotes.set(footnote.getId(), footnote);
    return footnote;
  }

  /**
   * Gets a footnote by ID
   * @param id Footnote ID
   * @returns The footnote, or undefined if not found
   */
  getFootnote(id: number): Footnote | undefined {
    return this.footnotes.get(id);
  }

  /**
   * Gets all footnotes (excluding special ones)
   */
  getAllFootnotes(): Footnote[] {
    return Array.from(this.footnotes.values())
      .filter((f) => f.getId() > 0)
      .sort((a, b) => a.getId() - b.getId());
  }

  /**
   * Gets all footnotes including special ones
   */
  getAllFootnotesWithSpecial(): Footnote[] {
    return Array.from(this.footnotes.values()).sort(
      (a, b) => a.getId() - b.getId()
    );
  }

  /**
   * Checks if a footnote exists
   * @param id Footnote ID
   */
  hasFootnote(id: number): boolean {
    return this.footnotes.has(id);
  }

  /**
   * Removes a footnote
   * @param id Footnote ID
   * @returns True if removed, false if not found
   */
  removeFootnote(id: number): boolean {
    // Don't allow removing special footnotes
    if (id <= 0) {
      return false;
    }
    return this.footnotes.delete(id);
  }

  /**
   * Gets the next available ID
   */
  getNextId(): number {
    return this.nextId;
  }

  /**
   * Gets the count of footnotes (excluding special ones)
   */
  getCount(): number {
    return this.getAllFootnotes().length;
  }

  /**
   * Checks if there are any footnotes (excluding special ones)
   */
  isEmpty(): boolean {
    return this.getCount() === 0;
  }

  /**
   * Clears all footnotes (except special ones)
   */
  clear(): void {
    const specialFootnotes = new Map<number, Footnote>();

    // Preserve special footnotes
    for (const [id, footnote] of this.footnotes) {
      if (id <= 0) {
        specialFootnotes.set(id, footnote);
      }
    }

    this.footnotes = specialFootnotes;
    this.nextId = 1;
  }

  /**
   * Gets statistics about footnotes
   */
  getStats(): {
    total: number;
    nextId: number;
  } {
    return {
      total: this.getCount(),
      nextId: this.nextId,
    };
  }

  /**
   * Generates the footnotes.xml content
   */
  generateFootnotesXml(): string {
    const footnotes = this.getAllFootnotesWithSpecial();

    // Build footnotes element
    const footnotesElement: XMLElement = {
      name: 'w:footnotes',
      attributes: {
        'xmlns:w':
          'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
        'xmlns:r':
          'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
      },
      children: footnotes.map((f) => f.toXML()),
    };

    // Build XML using XMLBuilder
    const builder = new XMLBuilder();
    builder.element(
      footnotesElement.name,
      footnotesElement.attributes,
      footnotesElement.children
    );
    return builder.build(true);
  }

  /**
   * Validates footnotes XML
   * @param xml XML string to validate
   * @returns True if valid
   */
  static validate(xml: string): boolean {
    // Use XMLParser to extract root element
    if (!xml) {
      return false;
    }

    const footnotesContent = XMLParser.extractBetweenTags(
      xml,
      '<w:footnotes',
      '</w:footnotes>'
    );
    if (!footnotesContent) {
      return false;
    }

    // Check for proper structure - namespace declaration
    if (!xml.includes('xmlns:w=')) {
      return false;
    }

    return true;
  }
}
