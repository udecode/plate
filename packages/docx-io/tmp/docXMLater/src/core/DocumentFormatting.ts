/**
 * DocumentFormatting - Manages document styles and numbering
 *
 * Provides a unified interface for style and list management.
 * Delegates to StylesManager and NumberingManager for implementation.
 * Extracted from Document.ts for better separation of concerns.
 */

import { Style, StyleProperties, StyleType } from "../formatting/Style";
import { StylesManager } from "../formatting/StylesManager";
import { NumberingManager } from "../formatting/NumberingManager";
import { NumberingLevel } from "../formatting/NumberingLevel";

/**
 * Manages document formatting (styles and numbering)
 */
export class DocumentFormatting {
  private stylesManager: StylesManager;
  private numberingManager: NumberingManager;

  constructor() {
    this.stylesManager = StylesManager.create();
    this.numberingManager = NumberingManager.create();
  }

  // ==================== Styles Manager Access ====================

  /**
   * Gets the StylesManager instance
   *
   * @returns The StylesManager for advanced style operations
   */
  getStylesManager(): StylesManager {
    return this.stylesManager;
  }

  /**
   * Sets the StylesManager instance
   *
   * @param manager - The StylesManager to use
   * @returns This instance for chaining
   */
  setStylesManager(manager: StylesManager): this {
    this.stylesManager = manager;
    return this;
  }

  // ==================== Numbering Manager Access ====================

  /**
   * Gets the NumberingManager instance
   *
   * @returns The NumberingManager for advanced list operations
   */
  getNumberingManager(): NumberingManager {
    return this.numberingManager;
  }

  /**
   * Sets the NumberingManager instance
   *
   * @param manager - The NumberingManager to use
   * @returns This instance for chaining
   */
  setNumberingManager(manager: NumberingManager): this {
    this.numberingManager = manager;
    return this;
  }

  // ==================== Style Operations ====================

  /**
   * Adds a style to the document
   *
   * @param style - The Style to add
   * @returns This instance for chaining
   */
  addStyle(style: Style): this {
    this.stylesManager.addStyle(style);
    return this;
  }

  /**
   * Gets a style by ID
   *
   * @param styleId - The style ID to find
   * @returns The Style or undefined if not found
   */
  getStyle(styleId: string): Style | undefined {
    return this.stylesManager.getStyle(styleId);
  }

  /**
   * Checks if a style exists
   *
   * @param styleId - The style ID to check
   * @returns true if the style exists
   */
  hasStyle(styleId: string): boolean {
    return this.stylesManager.hasStyle(styleId);
  }

  /**
   * Gets all styles
   *
   * @returns Array of all styles
   */
  getStyles(): Style[] {
    return this.stylesManager.getAllStyles();
  }

  /**
   * Gets styles by type
   *
   * @param type - The style type to filter by
   * @returns Array of matching styles
   */
  getStylesByType(type: StyleType): Style[] {
    return this.stylesManager.getAllStyles().filter((s) => s.getType() === type);
  }

  /**
   * Removes a style
   *
   * @param styleId - The style ID to remove
   * @returns true if the style was removed
   */
  removeStyle(styleId: string): boolean {
    return this.stylesManager.removeStyle(styleId);
  }

  /**
   * Updates an existing style
   *
   * @param styleId - The style ID to update
   * @param properties - Properties to update
   * @returns true if the style was updated
   */
  updateStyle(styleId: string, properties: Partial<StyleProperties>): boolean {
    const style = this.stylesManager.getStyle(styleId);
    if (!style) {
      return false;
    }

    if (properties.basedOn) {
      style.setBasedOn(properties.basedOn);
    }
    if (properties.next) {
      style.setNext(properties.next);
    }
    if (properties.runFormatting) {
      style.setRunFormatting(properties.runFormatting);
    }
    if (properties.paragraphFormatting) {
      style.setParagraphFormatting(properties.paragraphFormatting);
    }

    return true;
  }

  /**
   * Gets the number of styles
   *
   * @returns Style count
   */
  getStyleCount(): number {
    return this.stylesManager.getStyleCount();
  }

  // ==================== List Operations ====================

  /**
   * Creates a bullet list definition
   *
   * @param levels - Number of levels (default: 3)
   * @param bullets - Custom bullet characters (optional)
   * @returns The numId of the created list
   */
  createBulletList(levels: number = 3, bullets?: string[]): number {
    return this.numberingManager.createBulletList(levels, bullets);
  }

  /**
   * Creates a numbered list definition
   *
   * @param levels - Number of levels (default: 9)
   * @returns The numId of the created list
   */
  createNumberedList(levels: number = 9): number {
    return this.numberingManager.createNumberedList(levels);
  }

  /**
   * Creates a multi-level list definition
   *
   * @returns The numId of the created list
   */
  createMultiLevelList(): number {
    return this.numberingManager.createMultiLevelList();
  }

  /**
   * Gets standard indentation for a list level
   *
   * @param level - The level (0-8)
   * @returns Object with leftIndent and hangingIndent in twips
   */
  getStandardIndentation(level: number): {
    leftIndent: number;
    hangingIndent: number;
  } {
    return this.numberingManager.getStandardIndentation(level);
  }

  /**
   * Sets indentation for a list level
   *
   * @param numId - The numbering instance ID
   * @param level - The level to modify
   * @param leftIndent - Left indentation in twips
   * @param hangingIndent - Hanging indentation in twips (optional)
   * @returns true if successful
   */
  setListIndentation(
    numId: number,
    level: number,
    leftIndent: number,
    hangingIndent: number = 360
  ): boolean {
    return this.numberingManager.setListIndentation(
      numId,
      level,
      leftIndent,
      hangingIndent
    );
  }

  /**
   * Resets all list levels to standard indentation
   *
   * @param numId - The numbering instance ID
   * @returns true if successful
   */
  resetListIndentation(numId: number): boolean {
    // Reset each level to standard indentation
    for (let level = 0; level <= 8; level++) {
      const indent = this.numberingManager.getStandardIndentation(level);
      this.numberingManager.setListIndentation(
        numId,
        level,
        indent.leftIndent,
        indent.hangingIndent
      );
    }
    return true;
  }

  /**
   * Normalizes indentation for all lists in the document
   *
   * @returns Number of numbering instances updated
   */
  normalizeAllListIndentation(): number {
    return this.numberingManager.normalizeAllListIndentation();
  }

  /**
   * Checks if a numbering instance exists
   *
   * @param numId - The numbering instance ID
   * @returns true if it exists
   */
  hasNumbering(numId: number): boolean {
    return this.numberingManager.getInstance(numId) !== undefined;
  }

  /**
   * Gets the number of numbering instances
   *
   * @returns Number of list definitions
   */
  getNumberingCount(): number {
    return this.numberingManager.getInstanceCount();
  }

  // ==================== Utility ====================

  /**
   * Clears all custom styles (keeps built-in styles)
   *
   * @returns This instance for chaining
   */
  clearCustomStyles(): this {
    // Keep only built-in styles
    const builtInIds = [
      "Normal",
      "DefaultParagraphFont",
      "Heading1",
      "Heading2",
      "Heading3",
      "Heading4",
      "Heading5",
      "Heading6",
    ];

    const allStyles = this.stylesManager.getAllStyles();
    for (const style of allStyles) {
      if (!builtInIds.includes(style.getStyleId())) {
        this.stylesManager.removeStyle(style.getStyleId());
      }
    }

    return this;
  }

  /**
   * Clears all numbering definitions
   *
   * @returns This instance for chaining
   */
  clearNumbering(): this {
    // Note: NumberingManager may need a clear() method
    // For now, create a fresh manager
    this.numberingManager = NumberingManager.create();
    return this;
  }

  /**
   * Creates a clone of this formatting instance
   *
   * @returns New DocumentFormatting instance
   */
  clone(): DocumentFormatting {
    const cloned = new DocumentFormatting();
    // Copy styles
    for (const style of this.stylesManager.getAllStyles()) {
      cloned.stylesManager.addStyle(style.clone());
    }
    // Note: NumberingManager cloning would need implementation
    return cloned;
  }
}
