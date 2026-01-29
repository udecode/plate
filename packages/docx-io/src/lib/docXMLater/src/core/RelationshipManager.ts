/**
 * RelationshipManager - Manages collections of relationships
 *
 * Handles relationship creation, tracking, and XML generation for various
 * document parts (document.xml, header.xml, footer.xml, etc.)
 */

import { Relationship, RelationshipType } from './Relationship';
import { XMLParser } from '../xml/XMLParser';

/**
 * Manages relationships for a document or document part
 */
export class RelationshipManager {
  private relationships: Map<string, Relationship>;
  private nextId: number;

  /**
   * Creates a new relationship manager
   */
  constructor() {
    this.relationships = new Map();
    this.nextId = 1;
  }

  /**
   * Adds a relationship
   * @param relationship The relationship to add
   * @returns The relationship that was added
   */
  addRelationship(relationship: Relationship): Relationship {
    this.relationships.set(relationship.getId(), relationship);

    // Update next ID if necessary
    const idMatch = relationship.getId().match(/^rId(\d+)$/);
    if (idMatch && idMatch[1]) {
      const idNum = Number.parseInt(idMatch[1], 10);
      if (idNum >= this.nextId) {
        this.nextId = idNum + 1;
      }
    }

    return relationship;
  }

  /**
   * Gets a relationship by ID
   * @param id The relationship ID
   */
  getRelationship(id: string): Relationship | undefined {
    return this.relationships.get(id);
  }

  /**
   * Gets all relationships
   */
  getAllRelationships(): Relationship[] {
    return Array.from(this.relationships.values());
  }

  /**
   * Gets relationships of a specific type
   * @param type The relationship type
   */
  getRelationshipsByType(type: string | RelationshipType): Relationship[] {
    return this.getAllRelationships().filter((rel) => rel.getType() === type);
  }

  /**
   * Checks if a relationship exists
   * @param id The relationship ID
   */
  hasRelationship(id: string): boolean {
    return this.relationships.has(id);
  }

  /**
   * Removes a relationship
   * @param id The relationship ID
   * @returns True if removed, false if not found
   */
  removeRelationship(id: string): boolean {
    return this.relationships.delete(id);
  }

  /**
   * Gets the number of relationships
   */
  getCount(): number {
    return this.relationships.size;
  }

  /**
   * Clears all relationships
   */
  clear(): this {
    this.relationships.clear();
    this.nextId = 1;
    return this;
  }

  /**
   * Generates a new unique relationship ID
   * @returns New relationship ID (e.g., 'rId1', 'rId2')
   */
  generateId(): string {
    return `rId${this.nextId++}`;
  }

  /**
   * Adds a styles relationship
   * @returns The created relationship
   */
  addStyles(): Relationship {
    const id = this.generateId();
    return this.addRelationship(Relationship.createStyles(id));
  }

  /**
   * Adds a numbering relationship
   * @returns The created relationship
   */
  addNumbering(): Relationship {
    const id = this.generateId();
    return this.addRelationship(Relationship.createNumbering(id));
  }

  /**
   * Adds a fontTable relationship
   * @returns The created relationship
   */
  addFontTable(): Relationship {
    const id = this.generateId();
    return this.addRelationship(Relationship.createFontTable(id));
  }

  /**
   * Adds a settings relationship
   * @returns The created relationship
   */
  addSettings(): Relationship {
    const id = this.generateId();
    return this.addRelationship(Relationship.createSettings(id));
  }

  /**
   * Adds a theme relationship
   * @returns The created relationship
   */
  addTheme(): Relationship {
    const id = this.generateId();
    return this.addRelationship(Relationship.createTheme(id));
  }

  /**
   * Adds an image relationship
   * @param target Image path relative to the part (e.g., 'media/image1.png')
   * @returns The created relationship
   */
  addImage(target: string): Relationship {
    const id = this.generateId();
    return this.addRelationship(Relationship.createImage(id, target));
  }

  /**
   * Adds a header relationship
   * @param target Header file path (e.g., 'header1.xml')
   * @returns The created relationship
   */
  addHeader(target: string): Relationship {
    const id = this.generateId();
    return this.addRelationship(Relationship.createHeader(id, target));
  }

  /**
   * Adds a footer relationship
   * @param target Footer file path (e.g., 'footer1.xml')
   * @returns The created relationship
   */
  addFooter(target: string): Relationship {
    const id = this.generateId();
    return this.addRelationship(Relationship.createFooter(id, target));
  }

  /**
   * Adds a hyperlink relationship
   * @param url The hyperlink URL
   * @returns The created relationship
   */
  addHyperlink(url: string): Relationship {
    const id = this.generateId();
    return this.addRelationship(Relationship.createHyperlink(id, url));
  }

  /**
   * Updates the target URL of an existing hyperlink relationship
   *
   * This method modifies an existing relationship's target in-place, maintaining
   * the same relationship ID. This is crucial for proper OpenXML compliance
   * per ECMA-376 §17.16.22, as it prevents orphaned relationships.
   *
   * @param relationshipId The ID of the relationship to update
   * @param newUrl The new URL to set
   * @returns True if updated, false if relationship not found
   */
  updateHyperlinkTarget(relationshipId: string, newUrl: string): boolean {
    const relationship = this.getRelationship(relationshipId);
    if (!relationship) {
      return false;
    }

    // Verify this is a hyperlink relationship
    if (relationship.getType() !== RelationshipType.HYPERLINK) {
      throw new Error(
        `Relationship ${relationshipId} is not a hyperlink relationship. ` +
          `Type is ${relationship.getType()}, expected ${RelationshipType.HYPERLINK}`
      );
    }

    // Update the target URL
    relationship.setTarget(newUrl);
    return true;
  }

  /**
   * Finds a hyperlink relationship by its target URL
   *
   * @param targetUrl The URL to search for
   * @returns The matching relationship, or undefined if not found
   */
  findHyperlinkByTarget(targetUrl: string): Relationship | undefined {
    return this.getAllRelationships().find(
      (rel) =>
        rel.getType() === RelationshipType.HYPERLINK &&
        rel.getTarget() === targetUrl
    );
  }

  /**
   * Gets or creates a hyperlink relationship for the given URL
   *
   * This method ensures we don't create duplicate relationships for the same URL.
   * If a relationship already exists for the URL, it returns the existing one.
   * Otherwise, it creates a new relationship.
   *
   * @param url The hyperlink URL
   * @returns The existing or newly created relationship
   */
  getOrCreateHyperlink(url: string): Relationship {
    // Check if relationship already exists for this URL
    const existing = this.findHyperlinkByTarget(url);
    if (existing) {
      return existing;
    }

    // Create new relationship
    return this.addHyperlink(url);
  }

  /**
   * Removes orphaned hyperlink relationships
   *
   * This method removes hyperlink relationships that are no longer referenced
   * by any hyperlink in the document. Call this after updating URLs to clean
   * up any orphaned relationships.
   *
   * @param referencedIds Set of relationship IDs that are still in use
   * @returns Number of relationships removed
   */
  removeOrphanedHyperlinks(referencedIds: Set<string>): number {
    let removed = 0;
    const toRemove: string[] = [];

    // Find orphaned relationships
    for (const rel of this.getAllRelationships()) {
      if (
        rel.getType() === RelationshipType.HYPERLINK &&
        !referencedIds.has(rel.getId())
      ) {
        toRemove.push(rel.getId());
      }
    }

    // Remove orphaned relationships
    for (const id of toRemove) {
      if (this.removeRelationship(id)) {
        removed++;
      }
    }

    return removed;
  }

  /**
   * Adds a comments relationship
   * @returns The created relationship
   */
  addComments(): Relationship {
    const id = this.generateId();
    return this.addRelationship(Relationship.createComments(id));
  }

  /**
   * Adds a footnotes relationship
   * @returns The created relationship
   */
  addFootnotes(): Relationship {
    const id = this.generateId();
    return this.addRelationship(Relationship.createFootnotes(id));
  }

  /**
   * Adds an endnotes relationship
   * @returns The created relationship
   */
  addEndnotes(): Relationship {
    const id = this.generateId();
    return this.addRelationship(Relationship.createEndnotes(id));
  }

  /**
   * Generates the relationships XML file content
   * @returns Complete XML string for .rels file
   */
  generateXml(): string {
    const relationships = this.getAllRelationships();

    let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
    xml +=
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n';

    for (const rel of relationships) {
      xml += rel.toXML() + '\n';
    }

    xml += '</Relationships>';

    return xml;
  }

  /**
   * Creates a new relationship manager with common document relationships
   * @returns RelationshipManager with styles, numbering, fontTable, settings, and theme relationships
   */
  static createForDocument(): RelationshipManager {
    const manager = new RelationshipManager();
    manager.addStyles();
    manager.addNumbering();
    manager.addFontTable();
    manager.addSettings();
    manager.addTheme();
    return manager;
  }

  /**
   * Creates an empty relationship manager
   * @returns Empty RelationshipManager
   */
  static create(): RelationshipManager {
    return new RelationshipManager();
  }

  /**
   * Parses relationships from XML string and creates a populated manager
   * @param xml The relationships XML content (.rels file)
   * @returns RelationshipManager with parsed relationships
   */
  static fromXml(xml: string): RelationshipManager {
    const manager = new RelationshipManager();

    // Prevent ReDoS: validate input size (typical .rels files are < 10KB)
    if (xml.length > 100_000) {
      throw new Error(
        'Relationships XML file too large (>100KB). Possible malicious input or corrupted file.'
      );
    }

    // Use XMLParser to extract all Relationship elements
    const relationshipElements = XMLParser.extractElements(xml, 'Relationship');

    // Prevent infinite loops: check relationship count
    if (relationshipElements.length > 1000) {
      throw new Error(
        'Too many relationships in XML file (>1000). Possible malicious input.'
      );
    }

    // Process each relationship element
    for (const relationshipElement of relationshipElements) {
      // Extract attributes using XMLParser
      const id = XMLParser.extractAttribute(relationshipElement, 'Id');
      const type = XMLParser.extractAttribute(relationshipElement, 'Type');
      const target = XMLParser.extractAttribute(relationshipElement, 'Target');
      const targetMode = XMLParser.extractAttribute(
        relationshipElement,
        'TargetMode'
      );

      // Only create relationship if all required attributes present
      if (id && type && target) {
        // Validate targetMode before type assertion
        const validatedTargetMode =
          targetMode === 'Internal' ||
          targetMode === 'External' ||
          targetMode === undefined
            ? (targetMode as 'Internal' | 'External' | undefined)
            : undefined;

        // Create and add relationship
        const relationship = Relationship.create({
          id,
          type,
          target,
          targetMode: validatedTargetMode || 'Internal',
        });

        manager.addRelationship(relationship);
      }
    }

    return manager;
  }
}
