/**
 * Relationship - Represents an OpenXML relationship
 *
 * Relationships link document parts together (images, headers, footers, styles, etc.)
 * They are stored in _rels/*.xml.rels files throughout the document structure.
 */

import { XMLBuilder } from '../xml/XMLBuilder';

/**
 * Relationship types used in Word documents
 */
export enum RelationshipType {
  /** Link to styles.xml */
  STYLES = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',

  /** Link to numbering.xml */
  NUMBERING = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering',

  /** Link to an image */
  IMAGE = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',

  /** Link to a header */
  HEADER = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/header',

  /** Link to a footer */
  FOOTER = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer',

  /** Link to fontTable.xml */
  FONT_TABLE = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable',

  /** Link to settings.xml */
  SETTINGS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings',

  /** Link to theme */
  THEME = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme',

  /** Link to hyperlink */
  HYPERLINK = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',

  /** Link to comments.xml */
  COMMENTS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments',

  /** Link to footnotes.xml */
  FOOTNOTES = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes',

  /** Link to endnotes.xml */
  ENDNOTES = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/endnotes',

  /** Link to web settings */
  WEB_SETTINGS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/webSettings',
}

/**
 * Properties for creating a relationship
 */
export interface RelationshipProperties {
  /** Relationship ID (e.g., 'rId1', 'rId2') */
  id: string;

  /** Relationship type (URL defining the relationship type) */
  type: string | RelationshipType;

  /** Target path (relative to the source part) */
  target: string;

  /** Target mode (Internal or External) */
  targetMode?: 'Internal' | 'External';
}

/**
 * Represents a single relationship in an OpenXML package
 */
export class Relationship {
  private id: string;
  private type: string;
  private target: string;
  private targetMode: 'Internal' | 'External';

  /**
   * Creates a new relationship
   * @param properties Relationship properties
   */
  constructor(properties: RelationshipProperties) {
    this.id = properties.id;
    this.type = properties.type;
    this.target = properties.target;
    this.targetMode = properties.targetMode || 'Internal';

    this.validate();
  }

  /**
   * Validates the relationship properties
   */
  private validate(): void {
    if (!this.id || !this.id.startsWith('rId')) {
      throw new Error(`Relationship ID must start with 'rId', got '${this.id}'`);
    }

    if (!this.type) {
      throw new Error('Relationship type is required');
    }

    if (!this.target) {
      throw new Error('Relationship target is required');
    }
  }

  /**
   * Gets the relationship ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * Gets the relationship type
   */
  getType(): string {
    return this.type;
  }

  /**
   * Gets the target path
   */
  getTarget(): string {
    return this.target;
  }

  /**
   * Sets the target path
   *
   * This method allows updating the target of an existing relationship,
   * which is crucial for properly updating hyperlink URLs without creating
   * orphaned relationships. Per ECMA-376 §9.2, relationships can be modified
   * as long as the ID remains the same.
   *
   * @param target The new target path or URL
   */
  setTarget(target: string): void {
    if (!target) {
      throw new Error('Relationship target cannot be empty');
    }
    this.target = target;
  }

  /**
   * Gets the target mode
   */
  getTargetMode(): 'Internal' | 'External' {
    return this.targetMode;
  }

  /**
   * Checks if this relationship is external
   */
  isExternal(): boolean {
    return this.targetMode === 'External';
  }

  /**
   * Generates XML for this relationship
   *
   * **Security:** All attributes are properly XML-escaped to prevent injection attacks.
   * Per ECMA-376 Part 2 §9, relationship attributes must be escaped.
   */
  toXML(): string {
    // Escape all attributes to prevent XML injection
    const escapedId = XMLBuilder.escapeXmlAttribute(this.id);
    const escapedType = XMLBuilder.escapeXmlAttribute(this.type);
    const escapedTarget = XMLBuilder.escapeXmlAttribute(this.target);

    let xml = `  <Relationship Id="${escapedId}" Type="${escapedType}" Target="${escapedTarget}"`;

    if (this.targetMode === 'External') {
      xml += ` TargetMode="External"`;
    }

    xml += '/>';
    return xml;
  }

  /**
   * Factory method to create a relationship
   * @param properties Relationship properties
   */
  static create(properties: RelationshipProperties): Relationship {
    return new Relationship(properties);
  }

  /**
   * Creates a styles relationship
   * @param id Relationship ID
   */
  static createStyles(id: string = 'rId1'): Relationship {
    return new Relationship({
      id,
      type: RelationshipType.STYLES,
      target: 'styles.xml',
    });
  }

  /**
   * Creates a numbering relationship
   * @param id Relationship ID
   */
  static createNumbering(id: string = 'rId2'): Relationship {
    return new Relationship({
      id,
      type: RelationshipType.NUMBERING,
      target: 'numbering.xml',
    });
  }

  /**
   * Creates a fontTable relationship
   * @param id Relationship ID (defaults to 'rId3')
   */
  static createFontTable(id: string = 'rId3'): Relationship {
    return new Relationship({
      id,
      type: RelationshipType.FONT_TABLE,
      target: 'fontTable.xml',
    });
  }

  /**
   * Creates a settings relationship
   * @param id Relationship ID (defaults to 'rId4')
   */
  static createSettings(id: string = 'rId4'): Relationship {
    return new Relationship({
      id,
      type: RelationshipType.SETTINGS,
      target: 'settings.xml',
    });
  }

  /**
   * Creates a theme relationship
   * @param id Relationship ID (defaults to 'rId5')
   */
  static createTheme(id: string = 'rId5'): Relationship {
    return new Relationship({
      id,
      type: RelationshipType.THEME,
      target: 'theme/theme1.xml',
    });
  }

  /**
   * Creates an image relationship
   * @param id Relationship ID
   * @param target Image path (e.g., 'media/image1.png')
   */
  static createImage(id: string, target: string): Relationship {
    return new Relationship({
      id,
      type: RelationshipType.IMAGE,
      target,
    });
  }

  /**
   * Creates a header relationship
   * @param id Relationship ID
   * @param target Header file path (e.g., 'header1.xml')
   */
  static createHeader(id: string, target: string): Relationship {
    return new Relationship({
      id,
      type: RelationshipType.HEADER,
      target,
    });
  }

  /**
   * Creates a footer relationship
   * @param id Relationship ID
   * @param target Footer file path (e.g., 'footer1.xml')
   */
  static createFooter(id: string, target: string): Relationship {
    return new Relationship({
      id,
      type: RelationshipType.FOOTER,
      target,
    });
  }

  /**
   * Creates a hyperlink relationship (external)
   * @param id Relationship ID
   * @param url Hyperlink URL
   */
  static createHyperlink(id: string, url: string): Relationship {
    return new Relationship({
      id,
      type: RelationshipType.HYPERLINK,
      target: url,
      targetMode: 'External',
    });
  }

  /**
   * Creates a comments relationship
   * @param id Relationship ID (required - use RelationshipManager.generateId())
   */
  static createComments(id: string): Relationship {
    return new Relationship({
      id,
      type: RelationshipType.COMMENTS,
      target: 'comments.xml',
    });
  }

  /**
   * Creates a footnotes relationship
   * @param id Relationship ID (required - use RelationshipManager.generateId())
   */
  static createFootnotes(id: string): Relationship {
    return new Relationship({
      id,
      type: RelationshipType.FOOTNOTES,
      target: 'footnotes.xml',
    });
  }

  /**
   * Creates an endnotes relationship
   * @param id Relationship ID (required - use RelationshipManager.generateId())
   */
  static createEndnotes(id: string): Relationship {
    return new Relationship({
      id,
      type: RelationshipType.ENDNOTES,
      target: 'endnotes.xml',
    });
  }
}
