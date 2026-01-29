/**
 * AbstractNumbering - Defines a multi-level numbering scheme
 *
 * An abstract numbering definition is a template that defines up to 9 levels of
 * list formatting. It's referenced by numbering instances which link it to actual
 * paragraphs in the document.
 */

import { XMLBuilder, type XMLElement } from '../xml/XMLBuilder';
import { NumberingLevel } from './NumberingLevel';
import { defaultLogger } from '../utils/logger';

/**
 * Properties for creating an abstract numbering definition
 */
export interface AbstractNumberingProperties {
  /** Unique identifier for this abstract numbering */
  abstractNumId: number;

  /** Optional name for the numbering scheme */
  name?: string;

  /** The numbering levels (up to 9 levels, 0-8) */
  levels?: NumberingLevel[];

  /** Optional multiLevel type (0 = single level, 1 = multilevel) */
  multiLevelType?: number;
}

/**
 * Represents an abstract numbering definition
 *
 * Abstract numbering defines the template for a multi-level list. Each instance
 * of a list in the document references an abstract numbering definition.
 */
export class AbstractNumbering {
  private abstractNumId: number;
  private name?: string;
  private levels: Map<number, NumberingLevel>;
  private multiLevelType: number;

  // Callback for notifying parent when properties change
  private _onModified?: () => void;

  /**
   * Creates a new abstract numbering definition
   * @param idOrProps The abstract numbering ID (number) or properties object
   * @param name Optional name (if first param is a number)
   */
  constructor(idOrProps: number | AbstractNumberingProperties, name?: string) {
    // Support both simple (numId) and object constructor patterns
    if (typeof idOrProps === 'number') {
      // Simple constructor: new AbstractNumbering(id)
      this.abstractNumId = idOrProps;
      this.name = name;
      this.levels = new Map();
      this.multiLevelType = 1; // default multilevel
    } else {
      // Object constructor: new AbstractNumbering({ abstractNumId, ... })
      const properties = idOrProps as AbstractNumberingProperties;
      this.abstractNumId = properties.abstractNumId;
      this.name = properties.name;
      this.levels = new Map();
      this.multiLevelType =
        properties.multiLevelType !== undefined ? properties.multiLevelType : 1;

      if (properties.levels) {
        properties.levels.forEach((level) => {
          this.addLevel(level);
        });
      }
    }

    this.validate();
  }

  /**
   * Validates the abstract numbering
   */
  private validate(): void {
    if (this.abstractNumId < 0) {
      throw new Error('Abstract numbering ID must be non-negative');
    }

    if (this.levels.size > 9) {
      throw new Error('Cannot have more than 9 levels (0-8)');
    }
  }

  /**
   * Sets the modification callback for tracking changes
   * Called by NumberingManager when adding this abstract numbering
   * @param callback Function to call when properties are modified
   * @internal
   */
  _setModificationCallback(callback: () => void): void {
    this._onModified = callback;
    // Wire up all existing levels to the callback
    this.levels.forEach((level) => {
      level._setModificationCallback(callback);
    });
  }

  /**
   * Notifies the parent that this abstract numbering was modified
   * @internal
   */
  private _notifyModified(): void {
    if (this._onModified) {
      this._onModified();
    }
  }

  /**
   * Gets the abstract numbering ID
   */
  getAbstractNumId(): number {
    return this.abstractNumId;
  }

  /**
   * Alias for getAbstractNumId for backward compatibility
   */
  getId(): number {
    return this.abstractNumId;
  }

  /**
   * Gets the name
   */
  getName(): string | undefined {
    return this.name;
  }

  /**
   * Sets the name
   * @param name The numbering scheme name
   */
  setName(name: string): this {
    this.name = name;
    return this;
  }

  /**
   * Gets the multi-level type
   */
  getMultiLevelType(): string {
    if (this.multiLevelType === 1) {
      return 'multilevel';
    }
    if (this.multiLevelType === 2) {
      return 'hybridMultilevel';
    }
    return 'singleLevel';
  }

  /**
   * Sets the multi-level type
   * @param type The multi-level type ('multilevel' or 'singleLevel')
   */
  setMultiLevelType(
    type: 'multilevel' | 'singleLevel' | 'hybridMultilevel'
  ): this {
    if (type === 'multilevel') {
      this.multiLevelType = 1;
    } else if (type === 'hybridMultilevel') {
      this.multiLevelType = 2;
    } else {
      this.multiLevelType = 0;
    }
    return this;
  }

  /**
   * Adds a numbering level
   * @param level The numbering level to add
   */
  addLevel(level: NumberingLevel): this {
    const levelIndex = level.getLevel();

    if (levelIndex < 0 || levelIndex > 8) {
      throw new Error(`Level must be between 0 and 8, got ${levelIndex}`);
    }

    this.levels.set(levelIndex, level);

    // Wire up modification callback if we have one
    if (this._onModified) {
      level._setModificationCallback(this._onModified);
    }

    return this;
  }

  /**
   * Adds multiple numbering levels at once
   * @param levels The numbering levels to add
   */
  addLevels(levels: NumberingLevel[]): this {
    levels.forEach((level) => this.addLevel(level));
    return this;
  }

  /**
   * Gets a numbering level by index
   * @param levelIndex The level index (0-8)
   */
  getLevel(levelIndex: number): NumberingLevel | undefined {
    return this.levels.get(levelIndex);
  }

  /**
   * Gets all levels
   */
  getAllLevels(): NumberingLevel[] {
    return Array.from(this.levels.values()).sort(
      (a, b) => a.getLevel() - b.getLevel()
    );
  }

  /**
   * Alias for getAllLevels for backward compatibility
   */
  getLevels(): NumberingLevel[] {
    return this.getAllLevels();
  }

  /**
   * Gets the number of levels defined
   */
  getLevelCount(): number {
    return this.levels.size;
  }

  /**
   * Checks if a level exists
   * @param levelIndex The level index (0-8)
   */
  hasLevel(levelIndex: number): boolean {
    return this.levels.has(levelIndex);
  }

  /**
   * Removes a level
   * @param levelIndex The level index (0-8)
   */
  removeLevel(levelIndex: number): boolean {
    return this.levels.delete(levelIndex);
  }

  /**
   * Generates the WordprocessingML XML for this abstract numbering
   */
  toXML(): XMLElement {
    const children: XMLElement[] = [];

    // Add name if present
    if (this.name) {
      children.push(XMLBuilder.wSelf('name', { 'w:val': this.name }));
    }

    // Add multiLevelType
    let multiLevelTypeValue: string;
    if (this.multiLevelType === 1) {
      multiLevelTypeValue = 'multilevel';
    } else if (this.multiLevelType === 2) {
      multiLevelTypeValue = 'hybridMultilevel';
    } else {
      multiLevelTypeValue = 'singleLevel';
    }

    children.push(
      XMLBuilder.wSelf('multiLevelType', {
        'w:val': multiLevelTypeValue,
      })
    );

    // Add all levels in order
    const sortedLevels = this.getAllLevels();
    sortedLevels.forEach((level) => {
      children.push(level.toXML());
    });

    // If no levels defined, add a default level 0
    if (sortedLevels.length === 0) {
      children.push(NumberingLevel.createDecimalLevel(0).toXML());
    }

    return XMLBuilder.w(
      'abstractNum',
      { 'w:abstractNumId': this.abstractNumId.toString() },
      children
    );
  }

  /**
   * Creates a bullet list abstract numbering with specified levels
   *
   * Uses Calibri font for better UI compatibility. For advanced bullet symbol selection,
   * use NumberingLevel.getBulletSymbolWithFont() to get recommended symbol/font pairs.
   *
   * @param abstractNumId The abstract numbering ID
   * @param levels Number of levels (default: 9)
   * @param bullets Array of bullet characters (default: ['•', '○', '▪'])
   *
   * @example
   * // Standard bullet list
   * const bulletList = AbstractNumbering.createBulletList(1);
   *
   * @example
   * // Custom bullets using helper method
   * const bullets = [];
   * for (let i = 0; i < 9; i++) {
   *   const { symbol } = NumberingLevel.getBulletSymbolWithFont(i, 'square');
   *   bullets.push(symbol);
   * }
   * const squareList = AbstractNumbering.createBulletList(2, 9, bullets);
   */
  static createBulletList(
    abstractNumId: number,
    levels = 9,
    bullets?: string[] // Optional: custom bullets. If not provided, uses Word-native encoding
  ): AbstractNumbering {
    const abstractNum = new AbstractNumbering({
      abstractNumId,
      name: 'Bullet List',
      multiLevelType: 1,
    });

    for (let i = 0; i < levels && i < 9; i++) {
      if (bullets && bullets.length > 0) {
        // Custom bullets provided - use them with default font
        const bullet = bullets[i % bullets.length] || '•';
        abstractNum.addLevel(NumberingLevel.createBulletLevel(i, bullet));
      } else {
        // No custom bullets - use Word-native encoding (correct font per level)
        abstractNum.addLevel(NumberingLevel.createBulletLevel(i));
      }
    }

    return abstractNum;
  }

  /**
   * Creates a numbered list abstract numbering with specified levels
   * @param abstractNumId The abstract numbering ID
   * @param levels Number of levels (default: 9)
   * @param formats Array of formats for each level
   */
  static createNumberedList(
    abstractNumId: number,
    levels = 9,
    formats: Array<
      'decimal' | 'lowerLetter' | 'lowerRoman' | 'upperLetter' | 'upperRoman'
    > = ['decimal', 'lowerLetter', 'lowerRoman', 'upperLetter', 'upperRoman']
  ): AbstractNumbering {
    const abstractNum = new AbstractNumbering({
      abstractNumId,
      name: 'Numbered List',
      multiLevelType: 1,
    });

    for (let i = 0; i < levels && i < 9; i++) {
      const format = formats[i % formats.length] || 'decimal';
      const template = `%${i + 1}.`;

      let level: NumberingLevel;
      switch (format) {
        case 'lowerLetter':
          level = NumberingLevel.createLowerLetterLevel(i, template);
          break;
        case 'lowerRoman':
          level = NumberingLevel.createLowerRomanLevel(i, template);
          break;
        case 'upperLetter':
          level = NumberingLevel.createUpperLetterLevel(i, template);
          break;
        case 'upperRoman':
          level = NumberingLevel.createUpperRomanLevel(i, template);
          break;
        case 'decimal':
        default:
          level = NumberingLevel.createDecimalLevel(i, template);
          break;
      }

      abstractNum.addLevel(level);
    }

    return abstractNum;
  }

  /**
   * Creates a multi-level list with mixed formats
   * @param abstractNumId The abstract numbering ID
   */
  static createMultiLevelList(abstractNumId: number): AbstractNumbering {
    const abstractNum = new AbstractNumbering({
      abstractNumId,
      name: 'Multi-Level List',
      multiLevelType: 1,
    });

    // Level 0: 1, 2, 3, ...
    abstractNum.addLevel(NumberingLevel.createDecimalLevel(0, '%1.'));

    // Level 1: a, b, c, ...
    abstractNum.addLevel(NumberingLevel.createLowerLetterLevel(1, '%2.'));

    // Level 2: i, ii, iii, ...
    abstractNum.addLevel(NumberingLevel.createLowerRomanLevel(2, '%3.'));

    // Level 3: 1, 2, 3, ... (with more indent)
    abstractNum.addLevel(NumberingLevel.createDecimalLevel(3, '%4.'));

    return abstractNum;
  }

  /**
   * Creates an outline list abstract numbering
   * @param abstractNumId The abstract numbering ID
   */
  static createOutlineList(abstractNumId: number): AbstractNumbering {
    const abstractNum = new AbstractNumbering({
      abstractNumId,
      name: 'Outline List',
      multiLevelType: 1,
    });

    // Level 0: I, II, III, ...
    abstractNum.addLevel(NumberingLevel.createUpperRomanLevel(0, '%1.'));

    // Level 1: A, B, C, ...
    abstractNum.addLevel(NumberingLevel.createUpperLetterLevel(1, '%2.'));

    // Level 2: 1, 2, 3, ...
    abstractNum.addLevel(NumberingLevel.createDecimalLevel(2, '%3.'));

    // Level 3: a, b, c, ...
    abstractNum.addLevel(NumberingLevel.createLowerLetterLevel(3, '%4.'));

    // Level 4: i, ii, iii, ...
    abstractNum.addLevel(NumberingLevel.createLowerRomanLevel(4, '%5.'));

    // Level 5: A, B, C, ... (repeating)
    abstractNum.addLevel(NumberingLevel.createUpperLetterLevel(5, '%6.'));

    // Level 6: 1, 2, 3, ... (repeating)
    abstractNum.addLevel(NumberingLevel.createDecimalLevel(6, '%7.'));

    // Level 7: a, b, c, ... (repeating)
    abstractNum.addLevel(NumberingLevel.createLowerLetterLevel(7, '%8.'));

    // Level 8: i, ii, iii, ... (repeating)
    abstractNum.addLevel(NumberingLevel.createLowerRomanLevel(8, '%9.'));

    return abstractNum;
  }

  /**
   * Factory method for creating an abstract numbering definition
   * @param properties The abstract numbering properties
   */
  static create(properties: AbstractNumberingProperties): AbstractNumbering {
    return new AbstractNumbering(properties);
  }

  /**
   * Creates an AbstractNumbering from XML element
   * @param xml The XML string of the <w:abstractNum> element
   * @returns AbstractNumbering instance
   */
  static fromXML(xml: string): AbstractNumbering {
    // Extract abstractNumId (required)
    const abstractNumIdMatch = xml.match(
      /<w:abstractNum[^>]*w:abstractNumId="([^"]+)"/
    );
    if (!abstractNumIdMatch || !abstractNumIdMatch[1]) {
      throw new Error('Missing required w:abstractNumId attribute');
    }
    const abstractNumId = Number.parseInt(abstractNumIdMatch[1], 10);

    // Extract name (optional)
    const nameMatch = xml.match(/<w:name[^>]*w:val="([^"]+)"/);
    const name = nameMatch && nameMatch[1] ? nameMatch[1] : undefined;

    // Extract multiLevelType (optional)
    // Values: "singleLevel" = 0, "multilevel" = 1, "hybridMultilevel" = 2
    const multiLevelTypeMatch = xml.match(
      /<w:multiLevelType[^>]*w:val="([^"]+)"/
    );
    let multiLevelType = 1; // default to multilevel
    if (multiLevelTypeMatch && multiLevelTypeMatch[1]) {
      const value = multiLevelTypeMatch[1];
      if (value === 'singleLevel') multiLevelType = 0;
      else if (value === 'multilevel') multiLevelType = 1;
      else if (value === 'hybridMultilevel') multiLevelType = 2;
    }

    // Create abstract numbering
    const abstractNum = new AbstractNumbering({
      abstractNumId,
      name,
      multiLevelType,
    });

    // Extract and parse all levels
    const lvlRegex = /<w:lvl[^>]*>[\s\S]*?<\/w:lvl>/g;
    const lvlMatches = xml.match(lvlRegex);

    if (lvlMatches) {
      for (const lvlXml of lvlMatches) {
        try {
          const level = NumberingLevel.fromXML(lvlXml);
          abstractNum.addLevel(level);
        } catch (error) {
          // Skip malformed levels but continue parsing
          defaultLogger.warn(`Failed to parse level: ${error}`);
        }
      }
    }

    return abstractNum;
  }
}
