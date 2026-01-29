/**
 * NumberingManager - Manages numbering definitions and generates numbering.xml
 *
 * The NumberingManager is responsible for managing all abstract numbering definitions
 * and numbering instances in a document, and generating the numbering.xml file.
 */

import { XMLBuilder, type XMLElement } from '../xml/XMLBuilder';
import { AbstractNumbering } from './AbstractNumbering';
import { NumberingInstance } from './NumberingInstance';
import type { NumberingLevel } from './NumberingLevel';
import { defaultLogger } from '../utils/logger';

/**
 * Manages numbering definitions and instances for a document
 */
export class NumberingManager {
  private abstractNumberings: Map<number, AbstractNumbering>;
  private instances: Map<number, NumberingInstance>;
  private nextAbstractNumId: number;
  private nextNumId: number;

  // Track if numbering has been modified (for XML preservation)
  private _modified = false;

  // Granular modification tracking for selective XML regeneration
  private _modifiedAbstractNumIds: Set<number> = new Set();
  private _newAbstractNumIds: Set<number> = new Set();
  private _deletedAbstractNumIds: Set<number> = new Set();
  private _loadComplete = false;

  /**
   * Creates a new numbering manager
   * @param initializeDefaults Whether to initialize with default numbering definitions
   */
  constructor(initializeDefaults = false) {
    this.abstractNumberings = new Map();
    this.instances = new Map();
    this.nextAbstractNumId = 0;
    this.nextNumId = 1;

    if (initializeDefaults) {
      this.initializeDefaultNumberings();
    }
  }

  /**
   * Initializes default numbering definitions (bullet and numbered lists)
   */
  private initializeDefaultNumberings(): void {
    // Create default bullet list
    const bulletAbstract = AbstractNumbering.createBulletList(
      this.nextAbstractNumId++
    );
    this.addAbstractNumbering(bulletAbstract);

    // Create default numbered list
    const numberedAbstract = AbstractNumbering.createNumberedList(
      this.nextAbstractNumId++
    );
    this.addAbstractNumbering(numberedAbstract);
  }

  /**
   * Adds an abstract numbering definition
   * @param abstractNumbering The abstract numbering to add
   */
  addAbstractNumbering(abstractNumbering: AbstractNumbering): this {
    const id = abstractNumbering.getAbstractNumId();
    this.abstractNumberings.set(id, abstractNumbering);

    // Update next ID if necessary
    if (id >= this.nextAbstractNumId) {
      this.nextAbstractNumId = id + 1;
    }

    // Track as new if loading is complete (not during initial parse)
    if (this._loadComplete) {
      this._newAbstractNumIds.add(id);
      this._modified = true;
    }

    // Set up modification callback to track level changes
    abstractNumbering._setModificationCallback(() => {
      this.markAbstractNumberingModified(id);
    });

    return this;
  }

  /**
   * Gets an abstract numbering by ID
   * @param abstractNumId The abstract numbering ID
   */
  getAbstractNumbering(abstractNumId: number): AbstractNumbering | undefined {
    return this.abstractNumberings.get(abstractNumId);
  }

  /**
   * Gets all abstract numberings
   */
  getAllAbstractNumberings(): AbstractNumbering[] {
    return Array.from(this.abstractNumberings.values()).sort(
      (a, b) => a.getAbstractNumId() - b.getAbstractNumId()
    );
  }

  /**
   * Checks if an abstract numbering exists
   * @param abstractNumId The abstract numbering ID
   */
  hasAbstractNumbering(abstractNumId: number): boolean {
    return this.abstractNumberings.has(abstractNumId);
  }

  /**
   * Removes an abstract numbering
   * @param abstractNumId The abstract numbering ID
   */
  removeAbstractNumbering(abstractNumId: number): boolean {
    // Also remove all instances referencing this abstract numbering
    const instancesToRemove: number[] = [];
    this.instances.forEach((instance, numId) => {
      if (instance.getAbstractNumId() === abstractNumId) {
        instancesToRemove.push(numId);
      }
    });

    instancesToRemove.forEach((numId) => this.instances.delete(numId));

    const deleted = this.abstractNumberings.delete(abstractNumId);

    // Track deletion if loading is complete
    if (deleted && this._loadComplete) {
      // If it was a new item, just remove from new set
      if (this._newAbstractNumIds.has(abstractNumId)) {
        this._newAbstractNumIds.delete(abstractNumId);
      } else {
        // It was an original item, track as deleted
        this._deletedAbstractNumIds.add(abstractNumId);
      }
      // Remove from modified set if present
      this._modifiedAbstractNumIds.delete(abstractNumId);
      this._modified = true;
    }

    return deleted;
  }

  /**
   * Adds a numbering instance
   * @param instance The numbering instance to add
   */
  addInstance(instance: NumberingInstance): this {
    const numId = instance.getNumId();
    const abstractNumId = instance.getAbstractNumId();

    // Verify that the abstract numbering exists
    if (!this.hasAbstractNumbering(abstractNumId)) {
      throw new Error(`Abstract numbering ${abstractNumId} does not exist`);
    }

    this.instances.set(numId, instance);
    this._modified = true;

    // Update next ID if necessary
    if (numId >= this.nextNumId) {
      this.nextNumId = numId + 1;
    }

    return this;
  }

  /**
   * Alias for addInstance for backward compatibility
   * @param instance The numbering instance to add
   */
  addNumberingInstance(instance: NumberingInstance): this {
    return this.addInstance(instance);
  }

  /**
   * Gets a numbering instance by ID
   * @param numId The numbering instance ID
   */
  getInstance(numId: number): NumberingInstance | undefined {
    return this.instances.get(numId);
  }

  /**
   * Alias for getInstance for backward compatibility
   * @param numId The numbering instance ID
   */
  getNumberingInstance(numId: number): NumberingInstance | undefined {
    return this.getInstance(numId);
  }

  /**
   * Gets all numbering instances
   */
  getAllInstances(): NumberingInstance[] {
    return Array.from(this.instances.values()).sort(
      (a, b) => a.getNumId() - b.getNumId()
    );
  }

  /**
   * Checks if numbering has been modified since loading
   * Used for XML preservation optimization
   * @returns True if numbering was added or modified
   */
  isModified(): boolean {
    return this._modified;
  }

  /**
   * Resets the modified flag and marks loading as complete
   * Called after parsing to indicate that loaded numbering doesn't count as modifications
   */
  resetModified(): void {
    this._modified = false;
    this._modifiedAbstractNumIds.clear();
    this._newAbstractNumIds.clear();
    this._deletedAbstractNumIds.clear();
    this._loadComplete = true;
  }

  /**
   * Marks an abstract numbering as modified
   * Called when level properties are changed via setters
   * @param abstractNumId The ID of the modified abstract numbering
   */
  markAbstractNumberingModified(abstractNumId: number): void {
    // Only track modifications after loading is complete
    if (this._loadComplete) {
      // Don't mark new items as modified (they're already in _newAbstractNumIds)
      if (!this._newAbstractNumIds.has(abstractNumId)) {
        this._modifiedAbstractNumIds.add(abstractNumId);
      }
      this._modified = true;
    }
  }

  /**
   * Gets the set of abstract numbering IDs that have been modified
   * @returns Set of modified abstract numbering IDs
   */
  getModifiedAbstractNumIds(): Set<number> {
    return new Set(this._modifiedAbstractNumIds);
  }

  /**
   * Gets the set of abstract numbering IDs that are new (added after loading)
   * @returns Set of new abstract numbering IDs
   */
  getNewAbstractNumIds(): Set<number> {
    return new Set(this._newAbstractNumIds);
  }

  /**
   * Gets the set of abstract numbering IDs that have been deleted
   * @returns Set of deleted abstract numbering IDs
   */
  getDeletedAbstractNumIds(): Set<number> {
    return new Set(this._deletedAbstractNumIds);
  }

  /**
   * Checks if selective XML merge should be used
   * Returns true if there are granular changes that can be selectively merged
   * rather than regenerating the entire numbering.xml
   * @returns True if selective merge is appropriate
   */
  hasSelectiveChanges(): boolean {
    // If no modifications at all, no need for selective merge
    if (!this._modified) {
      return false;
    }

    // If we have granular tracking data, use selective merge
    return (
      this._modifiedAbstractNumIds.size > 0 ||
      this._newAbstractNumIds.size > 0 ||
      this._deletedAbstractNumIds.size > 0
    );
  }

  /**
   * Checks if loading has been completed
   * @returns True if the initial document loading is complete
   */
  isLoadComplete(): boolean {
    return this._loadComplete;
  }

  /**
   * Alias for getAllInstances for backward compatibility
   */
  getAllNumberingInstances(): NumberingInstance[] {
    return this.getAllInstances();
  }

  /**
   * Checks if a numbering instance exists
   * @param numId The numbering instance ID
   */
  hasInstance(numId: number): boolean {
    return this.instances.has(numId);
  }

  /**
   * Removes a numbering instance
   * @param numId The numbering instance ID
   */
  removeInstance(numId: number): boolean {
    return this.instances.delete(numId);
  }

  /**
   * Creates a new bullet list and returns its numId
   * @param levels Number of levels (default: 9)
   * @param bullets Array of bullet characters
   */
  createBulletList(levels = 9, bullets?: string[]): number {
    // Create abstract numbering
    const abstractNumId = this.nextAbstractNumId++;
    // Only pass bullets if it's defined, so defaults are used otherwise
    const abstractNumbering = bullets
      ? AbstractNumbering.createBulletList(abstractNumId, levels, bullets)
      : AbstractNumbering.createBulletList(abstractNumId, levels);
    this.addAbstractNumbering(abstractNumbering);

    // Create instance
    const numId = this.nextNumId++;
    const instance = NumberingInstance.create({ numId, abstractNumId });
    this.addInstance(instance);

    return numId;
  }

  /**
   * Creates a new numbered list and returns its numId
   * @param levels Number of levels (default: 9)
   * @param formats Array of formats for each level
   */
  createNumberedList(
    levels = 9,
    formats?: Array<'decimal' | 'lowerLetter' | 'lowerRoman'>
  ): number {
    // Create abstract numbering
    const abstractNumId = this.nextAbstractNumId++;
    // Only pass formats if it's defined, so defaults are used otherwise
    const abstractNumbering = formats
      ? AbstractNumbering.createNumberedList(abstractNumId, levels, formats)
      : AbstractNumbering.createNumberedList(abstractNumId, levels);
    this.addAbstractNumbering(abstractNumbering);

    // Create instance
    const numId = this.nextNumId++;
    const instance = NumberingInstance.create({ numId, abstractNumId });
    this.addInstance(instance);

    return numId;
  }

  /**
   * Creates a new multi-level list and returns its numId
   */
  createMultiLevelList(): number {
    // Create abstract numbering
    const abstractNumId = this.nextAbstractNumId++;
    const abstractNumbering =
      AbstractNumbering.createMultiLevelList(abstractNumId);
    this.addAbstractNumbering(abstractNumbering);

    // Create instance
    const numId = this.nextNumId++;
    const instance = NumberingInstance.create({ numId, abstractNumId });
    this.addInstance(instance);

    return numId;
  }

  /**
   * Creates a new outline list and returns its numId
   */
  createOutlineList(): number {
    // Create abstract numbering
    const abstractNumId = this.nextAbstractNumId++;
    const abstractNumbering =
      AbstractNumbering.createOutlineList(abstractNumId);
    this.addAbstractNumbering(abstractNumbering);

    // Create instance
    const numId = this.nextNumId++;
    const instance = NumberingInstance.create({ numId, abstractNumId });
    this.addInstance(instance);

    return numId;
  }

  /**
   * Creates a custom list with specified levels and returns its numId
   * @param levels Array of numbering levels
   * @param name Optional name for the list
   */
  createCustomList(levels: NumberingLevel[], name?: string): number {
    // Create abstract numbering
    const abstractNumId = this.nextAbstractNumId++;
    const abstractNumbering = AbstractNumbering.create({
      abstractNumId,
      name,
      levels,
    });
    this.addAbstractNumbering(abstractNumbering);

    // Create instance
    const numId = this.nextNumId++;
    const instance = NumberingInstance.create({ numId, abstractNumId });
    this.addInstance(instance);

    return numId;
  }

  /**
   * Creates a new instance of an existing abstract numbering
   * @param abstractNumId The abstract numbering ID to create an instance of
   */
  createInstance(abstractNumId: number): number {
    if (!this.hasAbstractNumbering(abstractNumId)) {
      throw new Error(`Abstract numbering ${abstractNumId} does not exist`);
    }

    const numId = this.nextNumId++;
    const instance = NumberingInstance.create({ numId, abstractNumId });
    this.addInstance(instance);

    return numId;
  }

  /**
   * Gets the framework's standard indentation for a list level
   *
   * The framework uses a consistent indentation scheme:
   * - leftIndent: 720 + (level * 360) twips
   * - hangingIndent: 360 twips
   *
   * Examples:
   * - Level 0: 720 twips (0.5 inch) left, 360 twips hanging
   * - Level 1: 1080 twips (0.75 inch) left, 360 twips hanging
   * - Level 2: 1440 twips (1.0 inch) left, 360 twips hanging
   *
   * @param level The level (0-8)
   * @returns Object with leftIndent and hangingIndent in twips
   * @example
   * ```typescript
   * const indent = manager.getStandardIndentation(0);
   * // Returns: { leftIndent: 720, hangingIndent: 360 }
   * ```
   */
  getStandardIndentation(level: number): {
    leftIndent: number;
    hangingIndent: number;
  } {
    if (level < 0 || level > 8) {
      throw new Error(`Invalid level ${level}. Level must be between 0 and 8.`);
    }

    return {
      leftIndent: 720 + level * 360,
      hangingIndent: 360,
    };
  }

  /**
   * Sets custom indentation for a specific level in a numbering definition
   *
   * This updates the indentation for a specific level across ALL paragraphs
   * that use this numId and level combination.
   *
   * @param numId The numbering instance ID
   * @param level The level to modify (0-8)
   * @param leftIndent Left indentation in twips
   * @param hangingIndent Hanging indentation in twips (optional, defaults to 360)
   * @returns true if successful, false if numId doesn't exist
   * @example
   * ```typescript
   * // Set level 0 to 0.5 inch left, 0.25 inch hanging
   * manager.setListIndentation(1, 0, 720, 360);
   * ```
   */
  setListIndentation(
    numId: number,
    level: number,
    leftIndent: number,
    hangingIndent = 360
  ): boolean {
    // Validate level
    if (level < 0 || level > 8) {
      throw new Error(`Invalid level ${level}. Level must be between 0 and 8.`);
    }

    // Validate indents (clamp negatives to 0)
    leftIndent = Math.max(0, leftIndent);
    hangingIndent = Math.max(0, hangingIndent);

    // Get the numbering instance
    const instance = this.getInstance(numId);
    if (!instance) {
      defaultLogger.warn(`Numbering instance ${numId} does not exist`);
      return false;
    }

    // Get the abstract numbering
    const abstractNum = this.getAbstractNumbering(instance.getAbstractNumId());
    if (!abstractNum) {
      defaultLogger.warn(
        `Abstract numbering for instance ${numId} does not exist`
      );
      return false;
    }

    // Get the level from the abstract numbering
    const numLevel = abstractNum.getLevel(level);
    if (!numLevel) {
      defaultLogger.warn(`Level ${level} does not exist in abstract numbering`);
      return false;
    }

    // Update the level's indentation
    numLevel.setLeftIndent(leftIndent);
    numLevel.setHangingIndent(hangingIndent);

    return true;
  }

  /**
   * Resets all levels in a numbering definition to standard indentation
   *
   * This applies the framework's standard indentation formula to all levels:
   * - leftIndent: 720 + (level * 360) twips
   * - hangingIndent: 360 twips
   *
   * @param numId The numbering instance ID
   * @returns true if successful, false if numId doesn't exist
   * @example
   * ```typescript
   * // Reset list 1 to standard indentation
   * manager.normalizeListIndentation(1);
   * ```
   */
  normalizeListIndentation(numId: number): boolean {
    // Get the numbering instance
    const instance = this.getInstance(numId);
    if (!instance) {
      defaultLogger.warn(`Numbering instance ${numId} does not exist`);
      return false;
    }

    // Get the abstract numbering
    const abstractNum = this.getAbstractNumbering(instance.getAbstractNumId());
    if (!abstractNum) {
      defaultLogger.warn(
        `Abstract numbering for instance ${numId} does not exist`
      );
      return false;
    }

    // Get all levels
    const levels = abstractNum.getAllLevels();

    // Apply standard indentation to each level
    for (const level of levels) {
      const standardIndent = this.getStandardIndentation(level.getLevel());
      level.setLeftIndent(standardIndent.leftIndent);
      level.setHangingIndent(standardIndent.hangingIndent);
    }

    return true;
  }

  /**
   * Normalizes indentation for all lists in the document
   *
   * Applies standard indentation to every numbering instance:
   * - leftIndent: 720 + (level * 360) twips
   * - hangingIndent: 360 twips
   *
   * This ensures consistent spacing across all lists in the document.
   *
   * @returns Number of numbering instances updated
   * @example
   * ```typescript
   * const count = manager.normalizeAllListIndentation();
   * console.log(`Normalized ${count} lists`);
   * ```
   */
  normalizeAllListIndentation(): number {
    let count = 0;

    // Iterate over all instances
    for (const instance of this.getAllInstances()) {
      const success = this.normalizeListIndentation(instance.getNumId());
      if (success) {
        count++;
      }
    }

    return count;
  }

  /**
   * Gets the total number of abstract numberings
   */
  getAbstractNumberingCount(): number {
    return this.abstractNumberings.size;
  }

  /**
   * Gets the total number of numbering instances
   */
  getInstanceCount(): number {
    return this.instances.size;
  }

  /**
   * Clears all numbering definitions and instances
   */
  clear(): this {
    this.abstractNumberings.clear();
    this.instances.clear();
    this.nextAbstractNumId = 0;
    this.nextNumId = 1;
    return this;
  }

  /**
   * Removes unused numbering instances and abstract numberings
   *
   * This method cleans up numbering definitions that are no longer referenced
   * by any paragraphs in the document. It removes:
   * 1. Instances not in the usedNumIds set
   * 2. Abstract numberings not referenced by any remaining instance
   *
   * @param usedNumIds Set of numIds currently used by paragraphs
   * @returns Object with counts of removed instances and abstract numberings
   */
  cleanupUnusedNumbering(usedNumIds: Set<number>): {
    instancesRemoved: number;
    abstractsRemoved: number;
  } {
    let instancesRemoved = 0;
    let abstractsRemoved = 0;

    // Step 1: Remove unused instances
    const instancesToRemove: number[] = [];
    this.instances.forEach((_instance, numId) => {
      if (!usedNumIds.has(numId)) {
        instancesToRemove.push(numId);
      }
    });

    for (const numId of instancesToRemove) {
      this.instances.delete(numId);
      instancesRemoved++;
    }

    // Step 2: Find abstract numberings still referenced by remaining instances
    const referencedAbstractNumIds = new Set<number>();
    this.instances.forEach((instance) => {
      referencedAbstractNumIds.add(instance.getAbstractNumId());
    });

    // Step 3: Remove unreferenced abstract numberings
    const abstractsToRemove: number[] = [];
    this.abstractNumberings.forEach((_abstractNum, abstractNumId) => {
      if (!referencedAbstractNumIds.has(abstractNumId)) {
        abstractsToRemove.push(abstractNumId);
      }
    });

    for (const abstractNumId of abstractsToRemove) {
      this.abstractNumberings.delete(abstractNumId);
      abstractsRemoved++;
    }

    return { instancesRemoved, abstractsRemoved };
  }

  /**
   * Generates the complete numbering.xml content
   */
  generateNumberingXml(): string {
    const builder = new XMLBuilder();

    const children: XMLElement[] = [];

    // Add all abstract numberings
    const abstractNumberings = this.getAllAbstractNumberings();
    abstractNumberings.forEach((abstractNum) => {
      children.push(abstractNum.toXML());
    });

    // Add all numbering instances
    const instances = this.getAllInstances();
    instances.forEach((instance) => {
      children.push(instance.toXML());
    });

    const numbering = XMLBuilder.w(
      'numbering',
      {
        'xmlns:w':
          'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
        'xmlns:r':
          'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
      },
      children
    );

    builder.element(numbering.name, numbering.attributes, numbering.children);

    // Generate XML with declaration
    return builder.build(true);
  }

  /**
   * Generates numbering.xml using selective merge with original XML
   *
   * This preserves original XML for unmodified abstractNums while:
   * - Removing deleted abstractNums
   * - Replacing modified abstractNums with regenerated XML
   * - Adding new abstractNums
   *
   * @param originalXml The original numbering.xml content
   * @returns Merged XML with selective updates
   */
  generateNumberingXmlSelective(originalXml: string): string {
    // If no selective changes, just return the original
    if (!this.hasSelectiveChanges()) {
      return originalXml;
    }

    let result = originalXml;

    // Step 1: Remove deleted abstractNums
    for (const deletedId of this._deletedAbstractNumIds) {
      const pattern = new RegExp(
        `<w:abstractNum[^>]*w:abstractNumId="${deletedId}"[^>]*>[\\s\\S]*?<\\/w:abstractNum>\\s*`,
        'g'
      );
      result = result.replace(pattern, '');
    }

    // Step 2: Replace modified abstractNums with regenerated XML
    for (const modifiedId of this._modifiedAbstractNumIds) {
      const abstractNum = this.abstractNumberings.get(modifiedId);
      if (abstractNum) {
        const pattern = new RegExp(
          `<w:abstractNum[^>]*w:abstractNumId="${modifiedId}"[^>]*>[\\s\\S]*?<\\/w:abstractNum>`,
          'g'
        );
        const builder = new XMLBuilder();
        builder.element(
          abstractNum.toXML().name,
          abstractNum.toXML().attributes,
          abstractNum.toXML().children
        );
        const newXml = builder.build(false); // No declaration for inner elements
        result = result.replace(pattern, newXml);
      }
    }

    // Step 3: Add new abstractNums before the first <w:num> or before </w:numbering>
    if (this._newAbstractNumIds.size > 0) {
      const newAbstractNumsXml: string[] = [];
      for (const newId of this._newAbstractNumIds) {
        const abstractNum = this.abstractNumberings.get(newId);
        if (abstractNum) {
          const builder = new XMLBuilder();
          builder.element(
            abstractNum.toXML().name,
            abstractNum.toXML().attributes,
            abstractNum.toXML().children
          );
          newAbstractNumsXml.push(builder.build(false));
        }
      }

      if (newAbstractNumsXml.length > 0) {
        const insertionXml = newAbstractNumsXml.join('\n');
        // Try to insert before first <w:num>, otherwise before </w:numbering>
        if (result.includes('<w:num')) {
          result = result.replace('<w:num', insertionXml + '\n<w:num');
        } else {
          result = result.replace(
            '</w:numbering>',
            insertionXml + '\n</w:numbering>'
          );
        }
      }
    }

    // Step 4: Handle instances - for now, instances are less commonly modified
    // If we need more granular instance tracking, we can add it later

    return result;
  }

  /**
   * Generates the numbering.xml as XMLElement (for API compatibility)
   */
  toXML(): XMLElement {
    const children: XMLElement[] = [];

    // Add all abstract numberings
    const abstractNumberings = this.getAllAbstractNumberings();
    abstractNumberings.forEach((abstractNum) => {
      children.push(abstractNum.toXML());
    });

    // Add all numbering instances
    const instances = this.getAllInstances();
    instances.forEach((instance) => {
      children.push(instance.toXML());
    });

    return XMLBuilder.w(
      'numbering',
      {
        'xmlns:w':
          'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
        'xmlns:r':
          'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
      },
      children
    );
  }

  /**
   * Creates a numbering manager with default numbering definitions
   */
  static create(): NumberingManager {
    return new NumberingManager(false);
  }

  /**
   * Creates an empty numbering manager
   */
  static createEmpty(): NumberingManager {
    return new NumberingManager(false);
  }
}
