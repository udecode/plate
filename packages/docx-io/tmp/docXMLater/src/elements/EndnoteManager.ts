/**
 * EndnoteManager - Manages endnotes in a document
 *
 * Handles creation, registration, and XML generation for endnotes.
 * Maintains unique IDs and proper ordering.
 */

import { Endnote } from './Endnote';
import { XMLBuilder, XMLElement } from '../xml/XMLBuilder';
import { XMLParser } from '../xml/XMLParser';

/**
 * Manages endnotes in a document
 */
export class EndnoteManager {
  private endnotes: Map<number, Endnote> = new Map();
  private nextId: number = 1;

  /**
   * Creates a new EndnoteManager
   * @private Use static factory method
   */
  private constructor() {
    // Add special endnotes (separators) with negative IDs
    this.addSpecialEndnotes();
  }

  /**
   * Adds special endnotes (separator, continuation)
   * These use negative IDs as per OOXML specification
   */
  private addSpecialEndnotes(): void {
    // Separator endnote (ID -1)
    const separator = Endnote.createSeparator(-1);
    this.endnotes.set(-1, separator);

    // Continuation separator (ID 0)
    const continuationSep = Endnote.createContinuationSeparator(0);
    this.endnotes.set(0, continuationSep);
  }

  /**
   * Creates a new EndnoteManager instance
   */
  static create(): EndnoteManager {
    return new EndnoteManager();
  }

  /**
   * Registers an endnote
   * @param endnote Endnote to register
   * @returns The registered endnote
   */
  register(endnote: Endnote): Endnote {
    const id = endnote.getId();

    // Ensure ID is not already used (except for special endnotes)
    if (id > 0 && this.endnotes.has(id)) {
      throw new Error(`Endnote with ID ${id} already exists`);
    }

    this.endnotes.set(id, endnote);

    // Update next ID if needed
    if (id >= this.nextId) {
      this.nextId = id + 1;
    }

    return endnote;
  }

  /**
   * Creates and registers a new endnote
   * @param text Endnote text
   * @returns The created endnote
   */
  createEndnote(text: string): Endnote {
    const endnote = Endnote.fromText(this.nextId++, text);
    this.endnotes.set(endnote.getId(), endnote);
    return endnote;
  }

  /**
   * Gets an endnote by ID
   * @param id Endnote ID
   * @returns The endnote, or undefined if not found
   */
  getEndnote(id: number): Endnote | undefined {
    return this.endnotes.get(id);
  }

  /**
   * Gets all endnotes (excluding special ones)
   */
  getAllEndnotes(): Endnote[] {
    return Array.from(this.endnotes.values())
      .filter(e => e.getId() > 0)
      .sort((a, b) => a.getId() - b.getId());
  }

  /**
   * Gets all endnotes including special ones
   */
  getAllEndnotesWithSpecial(): Endnote[] {
    return Array.from(this.endnotes.values())
      .sort((a, b) => a.getId() - b.getId());
  }

  /**
   * Checks if an endnote exists
   * @param id Endnote ID
   */
  hasEndnote(id: number): boolean {
    return this.endnotes.has(id);
  }

  /**
   * Removes an endnote
   * @param id Endnote ID
   * @returns True if removed, false if not found
   */
  removeEndnote(id: number): boolean {
    // Don't allow removing special endnotes
    if (id <= 0) {
      return false;
    }
    return this.endnotes.delete(id);
  }

  /**
   * Gets the next available ID
   */
  getNextId(): number {
    return this.nextId;
  }

  /**
   * Gets the count of endnotes (excluding special ones)
   */
  getCount(): number {
    return this.getAllEndnotes().length;
  }

  /**
   * Checks if there are any endnotes (excluding special ones)
   */
  isEmpty(): boolean {
    return this.getCount() === 0;
  }

  /**
   * Clears all endnotes (except special ones)
   */
  clear(): void {
    const specialEndnotes = new Map<number, Endnote>();

    // Preserve special endnotes
    for (const [id, endnote] of this.endnotes) {
      if (id <= 0) {
        specialEndnotes.set(id, endnote);
      }
    }

    this.endnotes = specialEndnotes;
    this.nextId = 1;
  }

  /**
   * Gets statistics about endnotes
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
   * Generates the endnotes.xml content
   */
  generateEndnotesXml(): string {
    const endnotes = this.getAllEndnotesWithSpecial();

    // Build endnotes element
    const endnotesElement: XMLElement = {
      name: 'w:endnotes',
      attributes: {
        'xmlns:w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
        'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
      },
      children: endnotes.map(e => e.toXML())
    };

    // Build XML using XMLBuilder
    const builder = new XMLBuilder();
    builder.element(
      endnotesElement.name,
      endnotesElement.attributes,
      endnotesElement.children
    );
    return builder.build(true);
  }

  /**
   * Validates endnotes XML
   * @param xml XML string to validate
   * @returns True if valid
   */
  static validate(xml: string): boolean {
    // Use XMLParser to extract root element
    if (!xml) {
      return false;
    }

    const endnotesContent = XMLParser.extractBetweenTags(xml, '<w:endnotes', '</w:endnotes>');
    if (!endnotesContent) {
      return false;
    }

    // Check for proper structure - namespace declaration
    if (!xml.includes('xmlns:w=')) {
      return false;
    }

    return true;
  }
}