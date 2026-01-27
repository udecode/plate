/**
 * StylesManager - Manages the collection of styles in a document
 * Handles style registration, retrieval, and styles.xml generation
 */

import { Paragraph } from "../elements/Paragraph";
import { XMLBuilder } from "../xml/XMLBuilder";
import { XMLParser } from "../xml/XMLParser";
import { Style, StyleType } from "./Style";

/**
 * Result of XML validation
 */
export interface ValidationResult {
  /** Whether the XML is valid */
  isValid: boolean;
  /** Validation errors if any */
  errors: string[];
  /** Validation warnings if any */
  warnings: string[];
  /** Number of styles found */
  styleCount: number;
  /** List of style IDs found */
  styleIds: string[];
}

/**
 * Manages document styles
 */
export class StylesManager {
  private styles: Map<string, Style> = new Map();
  private includeBuiltInStyles: boolean;

  // Track if styles have been modified (for XML preservation)
  private _modified: boolean = false;

  // Track which specific styles have been modified (for selective merging)
  private _modifiedStyleIds: Set<string> = new Set();

  /**
   * Registry of built-in style factory functions
   * Maps style ID to factory function for lazy loading
   */
  private static readonly BUILT_IN_STYLE_FACTORIES = new Map<
    string,
    () => Style
  >([
    ["Normal", () => Style.createNormalStyle()],
    ["Heading1", () => Style.createHeadingStyle(1)],
    ["Heading2", () => Style.createHeadingStyle(2)],
    ["Heading3", () => Style.createHeadingStyle(3)],
    ["Heading4", () => Style.createHeadingStyle(4)],
    ["Heading5", () => Style.createHeadingStyle(5)],
    ["Heading6", () => Style.createHeadingStyle(6)],
    ["Heading7", () => Style.createHeadingStyle(7)],
    ["Heading8", () => Style.createHeadingStyle(8)],
    ["Heading9", () => Style.createHeadingStyle(9)],
    ["Heading1Char", () => Style.createHeadingCharStyle(1)],
    ["Heading2Char", () => Style.createHeadingCharStyle(2)],
    ["Heading3Char", () => Style.createHeadingCharStyle(3)],
    ["Heading4Char", () => Style.createHeadingCharStyle(4)],
    ["Heading5Char", () => Style.createHeadingCharStyle(5)],
    ["Heading6Char", () => Style.createHeadingCharStyle(6)],
    ["Heading7Char", () => Style.createHeadingCharStyle(7)],
    ["Heading8Char", () => Style.createHeadingCharStyle(8)],
    ["Heading9Char", () => Style.createHeadingCharStyle(9)],
    ["Title", () => Style.createTitleStyle()],
    ["Subtitle", () => Style.createSubtitleStyle()],
    ["ListParagraph", () => Style.createListParagraphStyle()],
    ["TOCHeading", () => Style.createTOCHeadingStyle()],
    ["TableNormal", () => Style.createTableNormalStyle()],
    ["TableGrid", () => Style.createTableGridStyle()],
  ]);

  /**
   * Creates a new StylesManager
   * @param includeBuiltInStyles - Whether to include built-in styles (default: true)
   */
  constructor(includeBuiltInStyles: boolean = true) {
    this.includeBuiltInStyles = includeBuiltInStyles;

    // Always load Normal style if built-in styles are enabled
    // Normal is required and referenced by most other styles
    if (includeBuiltInStyles) {
      this.ensureStyleLoaded("Normal");
    }
  }

  /**
   * Ensures a built-in style is loaded (lazy loading)
   * @param styleId - Style ID to load
   */
  private ensureStyleLoaded(styleId: string): void {
    // Already loaded?
    if (this.styles.has(styleId)) {
      return;
    }

    // Built-in styles disabled?
    if (!this.includeBuiltInStyles) {
      return;
    }

    // Is this a built-in style?
    const factory = StylesManager.BUILT_IN_STYLE_FACTORIES.get(styleId);
    if (factory) {
      this.styles.set(styleId, factory());
    }
  }

  /**
   * Adds a style to the collection
   * @param style - Style to add
   * @returns This manager for chaining
   */
  addStyle(style: Style): this {
    this.styles.set(style.getStyleId(), style);
    this._modifiedStyleIds.add(style.getStyleId());
    this._modified = true;
    return this;
  }

  /**
   * Gets a style by ID
   * Lazy-loads built-in styles on first access
   * @param styleId - Style ID to retrieve
   * @returns The style, or undefined if not found
   */
  getStyle(styleId: string): Style | undefined {
    // Ensure built-in style is loaded if applicable
    this.ensureStyleLoaded(styleId);
    return this.styles.get(styleId);
  }

  /**
   * Checks if a style exists or can be loaded
   * @param styleId - Style ID to check
   * @returns True if the style exists or is a built-in style
   */
  hasStyle(styleId: string): boolean {
    // Check if already loaded
    if (this.styles.has(styleId)) {
      return true;
    }

    // Check if it's a built-in style that can be loaded
    return (
      this.includeBuiltInStyles &&
      StylesManager.BUILT_IN_STYLE_FACTORIES.has(styleId)
    );
  }

  /**
   * Removes a style from the collection
   * @param styleId - Style ID to remove
   * @returns True if the style was removed
   */
  removeStyle(styleId: string): boolean {
    return this.styles.delete(styleId);
  }

  /**
   * Gets all styles
   * @returns Array of all styles
   */
  getAllStyles(): Style[] {
    return Array.from(this.styles.values());
  }

  /**
   * Checks if styles have been modified since loading
   * Used for XML preservation optimization
   * @returns True if styles were added or modified
   */
  isModified(): boolean {
    return this._modified;
  }

  /**
   * Resets the modified flag
   * Called after parsing to indicate that loaded styles don't count as modifications
   */
  resetModified(): void {
    this._modified = false;
    this._modifiedStyleIds.clear();
  }

  /**
   * Gets the IDs of styles that have been modified since loading
   * Used for selective merging with original styles.xml
   * @returns Set of modified style IDs
   */
  getModifiedStyleIds(): Set<string> {
    return this._modifiedStyleIds;
  }

  /**
   * Gets styles by type
   * @param type - Style type to filter by
   * @returns Array of styles matching the type
   */
  getStylesByType(type: StyleType): Style[] {
    return this.getAllStyles().filter((style) => style.getType() === type);
  }

  /**
   * Gets quick styles (styles that appear in the style gallery)
   * A style appears in the gallery when qFormat=true AND semiHidden=false
   * @returns Array of quick styles
   */
  getQuickStyles(): Style[] {
    return this.getAllStyles().filter((style) => {
      const props = style.getProperties();
      const isQuick =
        props.qFormat === true ||
        (!props.customStyle && props.qFormat !== false);
      const isVisible = !props.semiHidden;
      return isQuick && isVisible;
    });
  }

  /**
   * Gets visible styles (not semi-hidden)
   * @returns Array of visible styles
   */
  getVisibleStyles(): Style[] {
    return this.getAllStyles().filter((style) => {
      const props = style.getProperties();
      return !props.semiHidden;
    });
  }

  /**
   * Gets styles sorted by UI priority
   * Lower priority values appear first (higher importance)
   * Styles without priority appear last
   * @returns Array of styles sorted by priority
   */
  getStylesByPriority(): Style[] {
    return this.getAllStyles().sort((a, b) => {
      const propsA = a.getProperties();
      const propsB = b.getProperties();

      const priorityA = propsA.uiPriority ?? 999;
      const priorityB = propsB.uiPriority ?? 999;

      return priorityA - priorityB;
    });
  }

  /**
   * Gets the linked style for a given style
   * @param styleId - Style ID to find the linked style for
   * @returns The linked style, or undefined if not found
   */
  getLinkedStyle(styleId: string): Style | undefined {
    const style = this.getStyle(styleId);
    if (!style) {
      return undefined;
    }

    const props = style.getProperties();
    if (!props.link) {
      return undefined;
    }

    return this.getStyle(props.link);
  }

  /**
   * Gets all table styles (Phase 5.1)
   * @returns Array of table styles
   */
  getTableStyles(): Style[] {
    return this.getAllStyles().filter((style) => style.getType() === "table");
  }

  /**
   * Creates and adds a table style (Phase 5.1)
   * @param styleId - Style ID
   * @param name - Style name
   * @param basedOn - Base style ID (optional)
   * @returns The created table style
   */
  createTableStyle(styleId: string, name: string, basedOn?: string): Style {
    const style = Style.create({
      styleId,
      name,
      type: "table",
      basedOn,
      customStyle: true,
    });
    this.addStyle(style);
    return style;
  }

  /**
   * Gets the number of styles
   * @returns Number of styles
   */
  getStyleCount(): number {
    return this.styles.size;
  }

  /**
   * Clears all styles
   * @returns This manager for chaining
   */
  clear(): this {
    this.styles.clear();
    return this;
  }

  /**
   * Gets all available built-in style IDs
   * @returns Array of built-in style IDs
   */
  static getBuiltInStyleIds(): string[] {
    return Array.from(StylesManager.BUILT_IN_STYLE_FACTORIES.keys());
  }

  /**
   * Checks if a style ID is a built-in style
   * @param styleId - Style ID to check
   * @returns True if the style is a built-in style
   */
  static isBuiltInStyle(styleId: string): boolean {
    return StylesManager.BUILT_IN_STYLE_FACTORIES.has(styleId);
  }

  /**
   * Gets statistics about loaded vs available styles
   * @returns Object with style statistics
   */
  getStats(): {
    loadedStyles: number;
    availableBuiltInStyles: number;
    customStyles: number;
  } {
    const loadedStyles = this.styles.size;
    const customStyles = this.getAllStyles().filter(
      (s) => s.getProperties().customStyle
    ).length;

    return {
      loadedStyles,
      availableBuiltInStyles: this.includeBuiltInStyles
        ? StylesManager.BUILT_IN_STYLE_FACTORIES.size
        : 0,
      customStyles,
    };
  }

  /**
   * Creates a new paragraph style
   * @param styleId - Unique style ID
   * @param name - Display name
   * @param basedOn - Parent style ID (optional)
   * @returns The created style
   */
  createParagraphStyle(styleId: string, name: string, basedOn?: string): Style {
    const style = Style.create({
      styleId,
      name,
      type: "paragraph",
      basedOn,
      customStyle: true,
    });
    this.addStyle(style);
    return style;
  }

  /**
   * Creates a new character style
   * @param styleId - Unique style ID
   * @param name - Display name
   * @param basedOn - Parent style ID (optional)
   * @returns The created style
   */
  createCharacterStyle(styleId: string, name: string, basedOn?: string): Style {
    const style = Style.create({
      styleId,
      name,
      type: "character",
      basedOn,
      customStyle: true,
    });
    this.addStyle(style);
    return style;
  }

  /**
   * Generates the complete styles.xml file
   * @returns XML string for word/styles.xml
   */
  generateStylesXml(): string {
    const builder = new XMLBuilder();

    // Create styles element with namespace
    const stylesChildren = [];

    // Add document defaults
    stylesChildren.push(this.generateDocDefaults());

    // Add all styles
    for (const style of this.getAllStyles()) {
      stylesChildren.push(style.toXML());
    }

    builder.element(
      "w:styles",
      {
        "xmlns:w":
          "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
        "xmlns:r":
          "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
      },
      stylesChildren
    );

    return builder.build(true);
  }

  /**
   * Generates document defaults
   */
  private generateDocDefaults() {
    const rPrDefaultChildren = [
      XMLBuilder.wSelf("rFonts", {
        "w:ascii": "Calibri",
        "w:hAnsi": "Calibri",
        "w:eastAsia": "Calibri",
        "w:cs": "Calibri",
      }),
      XMLBuilder.wSelf("sz", { "w:val": "22" }), // 11pt
      XMLBuilder.wSelf("szCs", { "w:val": "22" }),
      XMLBuilder.wSelf("lang", {
        "w:val": "en-US",
        "w:eastAsia": "en-US",
        "w:bidi": "ar-SA",
      }),
    ];

    const pPrDefaultChildren = [
      XMLBuilder.wSelf("spacing", {
        "w:after": "200",
        "w:line": "276",
        "w:lineRule": "auto",
      }),
    ];

    return XMLBuilder.w("docDefaults", undefined, [
      XMLBuilder.w("rPrDefault", undefined, [
        XMLBuilder.w("rPr", undefined, rPrDefaultChildren),
      ]),
      XMLBuilder.w("pPrDefault", undefined, [
        XMLBuilder.w("pPr", undefined, pPrDefaultChildren),
      ]),
    ]);
  }

  /**
   * Creates a new StylesManager with built-in styles
   * @returns New StylesManager instance
   */
  static create(): StylesManager {
    return new StylesManager(true);
  }

  /**
   * Creates an empty StylesManager (no built-in styles)
   * @returns New empty StylesManager instance
   */
  static createEmpty(): StylesManager {
    return new StylesManager(false);
  }

  /**
   * Validates styles.xml content for structure and correctness
   *
   * This performs string-based validation to avoid XML parsing corruption.
   * It checks for:
   * - Well-formed XML structure
   * - Required w:styles root element
   * - Valid style definitions
   * - No duplicate style IDs
   * - Required attributes
   *
   * @param xml - The raw styles.xml content to validate
   * @returns ValidationResult with details about validity
   */
  static validate(xml: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      styleCount: 0,
      styleIds: [],
    };

    // Check for empty or null
    if (!xml || xml.trim().length === 0) {
      result.isValid = false;
      result.errors.push("Styles XML is empty or null");
      return result;
    }

    // Check for common corruption patterns FIRST (before parsing)
    // This catches double-encoding issues that would break the parser
    if (xml.includes("&lt;w:") || xml.includes("&gt;")) {
      result.isValid = false;
      result.errors.push(
        "XML contains escaped tags - possible double-encoding corruption"
      );
      return result;
    }

    // Skip complex XML structure validation - focus on w:styles specific validation
    // Checking balanced tags with regex is unreliable and can give false positives

    // Use XMLParser to extract root element
    const stylesContent = XMLParser.extractBetweenTags(
      xml,
      "<w:styles",
      "</w:styles>"
    );
    if (!stylesContent) {
      result.isValid = false;
      result.errors.push("Missing required <w:styles> root element");
      return result;
    }

    // Check for namespace declaration
    if (!xml.includes("xmlns:w=")) {
      result.warnings.push("Missing WordprocessingML namespace declaration");
    }

    // Use XMLParser to extract all style elements
    const styleElements = XMLParser.extractElements(stylesContent, "w:style");
    result.styleCount = styleElements.length;

    // Check if any styles found
    if (styleElements.length === 0) {
      result.warnings.push("No styles found in document");
      return result;
    }

    // Check for styles without attributes (invalid)
    const styleWithoutAttrs = styleElements.filter((el) => {
      // Check if element has any attributes
      const openTagEnd = el.indexOf(">");
      const openTag = el.substring(0, openTagEnd);
      return !openTag.includes("w:type") || !openTag.includes("w:styleId");
    });

    if (styleWithoutAttrs.length > 0) {
      result.isValid = false;
      result.errors.push(
        "Style found without any attributes - w:type and w:styleId are required"
      );
    }

    // Process each style element
    const foundStyleIds = new Set<string>();

    for (const styleElement of styleElements) {
      // Extract styleId using XMLParser
      const styleId = XMLParser.extractAttribute(styleElement, "w:styleId");
      if (styleId) {
        // Check for duplicates
        if (foundStyleIds.has(styleId)) {
          result.isValid = false;
          result.errors.push(`Duplicate style ID found: "${styleId}"`);
        } else {
          foundStyleIds.add(styleId);
          result.styleIds.push(styleId);
        }
      } else {
        result.isValid = false;
        result.errors.push("Style found without required w:styleId attribute");
      }

      // Extract and validate type using XMLParser
      const type = XMLParser.extractAttribute(styleElement, "w:type");
      if (type) {
        if (!["paragraph", "character", "table", "numbering"].includes(type)) {
          result.warnings.push(`Invalid style type: "${type}"`);
        }
      } else {
        result.isValid = false;
        result.errors.push("Style found without required w:type attribute");
      }

      // Check for circular references - extract basedOn value
      const basedOnElement = XMLParser.extractElements(
        styleElement,
        "w:basedOn"
      )[0];
      if (basedOnElement && styleId) {
        const basedOn = XMLParser.extractAttribute(basedOnElement, "w:val");
        if (basedOn && styleId === basedOn) {
          result.isValid = false;
          result.errors.push(
            `Circular reference detected: style "${styleId}" based on itself`
          );
        }
      }
    }

    // Check for required Normal style
    if (!foundStyleIds.has("Normal")) {
      result.warnings.push(
        'Missing "Normal" style - document may not render correctly'
      );
    }

    // Check for BOM or invalid characters
    if (xml.charCodeAt(0) === 0xfeff) {
      result.warnings.push(
        "XML contains BOM (Byte Order Mark) - may cause parsing issues"
      );
    }

    // Summary
    if (result.styleCount === 0) {
      result.warnings.push("No styles found in document");
    }

    return result;
  }

  /**
   * Searches styles by name (case-insensitive)
   * @param searchTerm - Text to search for in style names
   * @returns Array of styles whose names contain the search term
   * @example
   * ```typescript
   * const headings = stylesManager.searchByName('heading');
   * console.log(`Found ${headings.length} heading styles`);
   * ```
   */
  searchByName(searchTerm: string): Style[] {
    const term = searchTerm.toLowerCase();
    return this.getAllStyles().filter((style) =>
      style.getName().toLowerCase().includes(term)
    );
  }

  /**
   * Finds styles using a specific font
   * @param fontName - Font family name to search for
   * @returns Array of styles that use the specified font
   * @example
   * ```typescript
   * const arialStyles = stylesManager.findByFont('Arial');
   * console.log(`Found ${arialStyles.length} styles using Arial font`);
   * ```
   */
  findByFont(fontName: string): Style[] {
    return this.getAllStyles().filter((style) => {
      const runFormatting = style.getRunFormatting();
      return runFormatting?.font === fontName;
    });
  }

  /**
   * Finds styles with specific properties using a predicate function
   * @param predicate - Filter function that returns true for styles to include
   * @returns Array of styles matching the predicate
   * @example
   * ```typescript
   * // Find all paragraph styles
   * const paraStyles = stylesManager.findStyles(s => s.getType() === 'paragraph');
   *
   * // Find styles with custom formatting
   * const customStyles = stylesManager.findStyles(s => s.getProperties().customStyle);
   *
   * // Find styles with specific formatting
   * const boldStyles = stylesManager.findStyles(s => s.getRunFormatting()?.bold);
   * ```
   */
  findStyles(predicate: (style: Style) => boolean): Style[] {
    return this.getAllStyles().filter(predicate);
  }

  /**
   * Finds unused styles (not referenced by any paragraphs)
   * @param paragraphs - All paragraphs in the document to check against
   * @returns Array of unused style IDs
   * @example
   * ```typescript
   * const doc = Document.create();
   * const unused = stylesManager.findUnusedStyles(doc.getAllParagraphs());
   * console.log(`Found ${unused.length} unused styles: ${unused.join(', ')}`);
   * ```
   */
  findUnusedStyles(paragraphs: Paragraph[]): string[] {
    const usedStyles = new Set<string>();

    // Collect all style IDs used by paragraphs
    for (const para of paragraphs) {
      const styleId = para.getStyle();
      if (styleId) {
        usedStyles.add(styleId);
      }
    }

    // Get all style IDs and filter out used ones
    const allStyleIds = this.getAllStyles().map((style) => style.getStyleId());
    return allStyleIds.filter((styleId) => !usedStyles.has(styleId));
  }

  /**
   * Removes all unused styles from the document
   * @param paragraphs - All paragraphs in the document to check against
   * @returns Number of styles removed
   * @example
   * ```typescript
   * const doc = Document.create();
   * const removedCount = stylesManager.cleanupUnusedStyles(doc.getAllParagraphs());
   * console.log(`Cleaned up ${removedCount} unused styles`);
   * ```
   */
  cleanupUnusedStyles(paragraphs: Paragraph[]): number {
    const unused = this.findUnusedStyles(paragraphs);
    let count = 0;

    for (const styleId of unused) {
      // Don't remove built-in styles
      if (!StylesManager.isBuiltInStyle(styleId)) {
        if (this.removeStyle(styleId)) {
          count++;
        }
      }
    }

    return count;
  }

  /**
   * Validates all style references for broken or circular dependencies
   * @returns Validation result with broken references and circular dependencies
   * @example
   * ```typescript
   * const validation = stylesManager.validateStyleReferences();
   * if (!validation.valid) {
   *   console.log('Broken references:', validation.brokenReferences);
   *   console.log('Circular references:', validation.circularReferences);
   * }
   * ```
   */
  validateStyleReferences(): {
    valid: boolean;
    brokenReferences: Array<{ styleId: string; basedOn: string }>;
    circularReferences: Array<string[]>;
  } {
    const broken: Array<{ styleId: string; basedOn: string }> = [];
    const circular: Array<string[]> = [];

    for (const style of this.getAllStyles()) {
      const props = style.getProperties();

      // Check basedOn references exist
      if (props.basedOn && !this.hasStyle(props.basedOn)) {
        broken.push({ styleId: props.styleId, basedOn: props.basedOn });
      }

      // Check for circular references
      const chain = this.getInheritanceChain(props.styleId);
      const ids = chain.map((s) => s.getStyleId());
      if (new Set(ids).size !== ids.length) {
        circular.push(ids);
      }
    }

    return {
      valid: broken.length === 0 && circular.length === 0,
      brokenReferences: broken,
      circularReferences: circular,
    };
  }

  /**
   * Gets the complete inheritance chain for a style
   * @param styleId - Style ID to analyze
   * @returns Array of styles from base to derived (base style first)
   * @throws Error if style doesn't exist
   * @example
   * ```typescript
   * const chain = stylesManager.getInheritanceChain('Heading1');
   * console.log('Inheritance chain:', chain.map(s => s.getName()));
   * // Output: ['Normal', 'Heading1'] (Normal is base, Heading1 inherits from it)
   * ```
   */
  getInheritanceChain(styleId: string): Style[] {
    const chain: Style[] = [];
    let current = this.getStyle(styleId);

    if (!current) {
      throw new Error(`Style '${styleId}' not found`);
    }

    while (current) {
      chain.unshift(current); // Add to beginning to maintain base-to-derived order
      const props = current.getProperties();
      current = props.basedOn ? this.getStyle(props.basedOn) : undefined;
    }

    return chain;
  }

  /**
   * Gets all styles that inherit from a base style
   * @param baseStyleId - Base style ID to find children for
   * @returns Array of styles that inherit from the base style
   * @example
   * ```typescript
   * const children = stylesManager.getDerivedStyles('Normal');
   * console.log(`Styles based on Normal: ${children.map(s => s.getName()).join(', ')}`);
   * ```
   */
  getDerivedStyles(baseStyleId: string): Style[] {
    return this.getAllStyles().filter(
      (style) => style.getProperties().basedOn === baseStyleId
    );
  }

  /**
   * Exports a single style as JSON string
   * @param styleId - Style ID to export
   * @returns JSON representation of the style
   * @throws Error if style doesn't exist
   * @example
   * ```typescript
   * const json = stylesManager.exportStyle('Heading1');
   * console.log('Style JSON:', json);
   *
   * // Save to file
   * await fs.writeFile('heading1-style.json', json);
   * ```
   */
  exportStyle(styleId: string): string {
    const style = this.getStyle(styleId);
    if (!style) {
      throw new Error(`Style '${styleId}' not found`);
    }
    return JSON.stringify(style.getProperties(), null, 2);
  }

  /**
   * Imports a style from JSON string
   * @param json - JSON string containing style properties
   * @returns The imported style
   * @throws Error if JSON is invalid or style creation fails
   * @example
   * ```typescript
   * const json = await fs.readFile('custom-style.json', 'utf8');
   * const style = stylesManager.importStyle(json);
   * console.log(`Imported style: ${style.getName()}`);
   * ```
   */
  importStyle(json: string): Style {
    try {
      const props = JSON.parse(json);
      const style = Style.create(props);
      this.addStyle(style);
      return style;
    } catch (error) {
      throw new Error(
        `Failed to import style: ${
          error instanceof Error ? error.message : "Invalid JSON"
        }`
      );
    }
  }

  /**
   * Exports all styles as JSON string
   * @returns JSON array of all style properties
   * @example
   * ```typescript
   * const allStylesJson = stylesManager.exportAllStyles();
   * console.log('All styles exported');
   *
   * // Save to file
   * await fs.writeFile('all-styles.json', allStylesJson);
   * ```
   */
  exportAllStyles(): string {
    const styles = this.getAllStyles().map((style) => style.getProperties());
    return JSON.stringify(styles, null, 2);
  }

  /**
   * Imports multiple styles from JSON array string
   * @param json - JSON string containing array of style properties
   * @returns Array of imported styles
   * @throws Error if JSON is invalid or style creation fails
   * @example
   * ```typescript
   * const json = await fs.readFile('styles-collection.json', 'utf8');
   * const styles = stylesManager.importStyles(json);
   * console.log(`Imported ${styles.length} styles`);
   * ```
   */
  importStyles(json: string): Style[] {
    try {
      const propsArray = JSON.parse(json);
      if (!Array.isArray(propsArray)) {
        throw new Error("JSON must contain an array of style properties");
      }

      const styles: Style[] = [];
      for (const props of propsArray) {
        const style = Style.create(props);
        this.addStyle(style);
        styles.push(style);
      }

      return styles;
    } catch (error) {
      throw new Error(
        `Failed to import styles: ${
          error instanceof Error ? error.message : "Invalid JSON"
        }`
      );
    }
  }
}
