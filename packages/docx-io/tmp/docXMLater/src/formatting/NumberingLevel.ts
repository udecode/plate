/**
 * NumberingLevel - Defines formatting for a single level in a list
 *
 * A numbering level specifies how a particular list level (0-8) should be formatted,
 * including the numbering format (bullet, decimal, roman, etc.), text template,
 * alignment, and indentation.
 */

import { XMLBuilder, XMLElement } from "../xml/XMLBuilder";

/**
 * Word-native bullet character mappings
 *
 * Microsoft Word uses specific fonts with Private Use Area (PUA) characters
 * for bullet points. These mappings ensure 100% compatibility with Word's
 * native bullet rendering.
 *
 * Pattern: Levels 0,3,6 = filled bullet; 1,4,7 = open circle; 2,5,8 = filled square
 */
export const WORD_NATIVE_BULLETS = {
  /** Filled bullet (levels 0, 3, 6) - Symbol font U+F0B7 */
  FILLED_BULLET: { char: "\uF0B7", font: "Symbol" },
  /** Open circle (levels 1, 4, 7) - Courier New U+006F (lowercase 'o') */
  OPEN_CIRCLE: { char: "\u006F", font: "Courier New" },
  /** Filled square (levels 2, 5, 8) - Wingdings U+F0A7 */
  FILLED_SQUARE: { char: "\uF0A7", font: "Wingdings" },
} as const;

/**
 * Type for Word-native bullet definition
 */
export type WordNativeBullet =
  (typeof WORD_NATIVE_BULLETS)[keyof typeof WORD_NATIVE_BULLETS];

/**
 * Numbering format types supported by Word
 */
export type NumberFormat =
  | "bullet" // Bullet character
  | "decimal" // 1, 2, 3, ...
  | "lowerRoman" // i, ii, iii, ...
  | "upperRoman" // I, II, III, ...
  | "lowerLetter" // a, b, c, ...
  | "upperLetter" // A, B, C, ...
  | "ordinal" // 1st, 2nd, 3rd, ...
  | "cardinalText" // One, Two, Three, ...
  | "ordinalText" // First, Second, Third, ...
  | "hex" // 0x01, 0x02, ...
  | "chicago" // *, †, ‡, §, ...
  | "decimal zero"; // 01, 02, 03, ...

/**
 * Alignment for the numbering text
 */
export type NumberAlignment = "left" | "center" | "right" | "start" | "end";

/**
 * Properties for creating a numbering level
 */
export interface NumberingLevelProperties {
  /** The level index (0-8, where 0 is the outermost level) */
  level: number;

  /** The numbering format */
  format: NumberFormat;

  /** The text template (e.g., "%1." for decimal, "•" for bullet) */
  text: string;

  /** Alignment of the numbering text */
  alignment?: NumberAlignment;

  /** Starting value (for numeric formats, default: 1) */
  start?: number;

  /** Left indentation in twips (can be negative for outdents into margin) */
  leftIndent?: number;

  /** Hanging indentation in twips (for the text after the number) */
  hangingIndent?: number;

  /** Font family for the numbering character (useful for bullets) */
  font?: string;

  /** Font size in half-points (e.g., 22 = 11pt) */
  fontSize?: number;

  /** Whether to show text after the number (default: true) */
  isLegalNumberingStyle?: boolean;

  /** Suffix after the number (tab, space, or nothing) */
  suffix?: "tab" | "space" | "nothing";

  /** Text color in hex (without #) */
  color?: string;

  /** Whether the numbering text is bold */
  bold?: boolean;

  /** Whether the numbering text is italic */
  italic?: boolean;

  /** Underline style for numbering text ('single', 'double', 'wave', 'dotted', 'dash', etc.) */
  underline?: string;

  /**
   * Level at which numbering should restart (w:lvlRestart per ECMA-376 Part 1 §17.9.11)
   * Specifies when to restart this level's numbering based on a higher-level change:
   * - 0: Never restart (continues throughout document)
   * - 1-8: Restart when the specified level changes
   * - undefined (default): Restart when level-1 changes (standard behavior)
   */
  lvlRestart?: number;
}

/**
 * Represents a single level in a numbering definition
 */
export class NumberingLevel {
  private properties: Required<Omit<NumberingLevelProperties, 'lvlRestart' | 'underline'>> & Pick<NumberingLevelProperties, 'lvlRestart' | 'underline'>;

  // Callback for notifying parent when properties change
  private _onModified?: () => void;

  /**
   * Creates a new numbering level
   * @param properties The level properties
   */
  constructor(properties: NumberingLevelProperties) {
    // Set defaults
    this.properties = {
      level: properties.level,
      format: properties.format,
      text: properties.text,
      alignment: properties.alignment || "left",
      start: properties.start !== undefined ? properties.start : 1,
      leftIndent:
        properties.leftIndent !== undefined
          ? properties.leftIndent
          : 720 + properties.level * 360,
      hangingIndent:
        properties.hangingIndent !== undefined ? properties.hangingIndent : 360,
      font: properties.font || "Calibri",
      fontSize: properties.fontSize || 22, // 11pt default
      isLegalNumberingStyle:
        properties.isLegalNumberingStyle !== undefined
          ? properties.isLegalNumberingStyle
          : false,
      suffix: properties.suffix || "tab",
      color: properties.color || "000000",
      bold: properties.bold !== undefined ? properties.bold : false,
      italic: properties.italic !== undefined ? properties.italic : false,
      underline: properties.underline,
      lvlRestart: properties.lvlRestart, // undefined means default behavior (restart on level-1 change)
    };

    this.validate();
  }

  /**
   * Validates the level properties
   */
  private validate(): void {
    if (this.properties.level < 0 || this.properties.level > 8) {
      throw new Error(
        `Level must be between 0 and 8, got ${this.properties.level}`
      );
    }

    // Note: leftIndent CAN be negative (outdent into margin) per ECMA-376
    // This is valid and used for hanging indents where bullets appear in margin

    if (this.properties.hangingIndent < 0) {
      throw new Error("Hanging indent must be non-negative");
    }

    if (this.properties.start < 0) {
      throw new Error("Start value must be non-negative");
    }
  }

  /**
   * Sets the modification callback for tracking changes
   * Called by AbstractNumbering when adding this level
   * @param callback Function to call when properties are modified
   * @internal
   */
  _setModificationCallback(callback: () => void): void {
    this._onModified = callback;
  }

  /**
   * Notifies the parent that this level was modified
   * @internal
   */
  private _notifyModified(): void {
    if (this._onModified) {
      this._onModified();
    }
  }

  /**
   * Calculates safe indentation values for a given level based on page constraints.
   *
   * Use this instead of default indentation when working with narrow pages or
   * deep nesting levels to ensure content stays within page margins.
   *
   * @param level The level index (0-8)
   * @param pageWidthTwips Page width in twips (default: 12240 = 8.5 inches)
   * @param leftMarginTwips Left margin in twips (default: 1440 = 1 inch)
   * @param rightMarginTwips Right margin in twips (default: 1440 = 1 inch)
   * @param minContentWidth Minimum content width in twips (default: 2880 = 2 inches)
   * @returns Safe indentation values that won't exceed available space
   *
   * @example
   * ```typescript
   * // For a narrow page (6" wide with 0.5" margins)
   * const indent = NumberingLevel.calculateSafeIndentation(
   *   5,      // level 5
   *   8640,   // 6 inches page width
   *   720,    // 0.5 inch left margin
   *   720     // 0.5 inch right margin
   * );
   * ```
   */
  static calculateSafeIndentation(
    level: number,
    pageWidthTwips: number = 12240,
    leftMarginTwips: number = 1440,
    rightMarginTwips: number = 1440,
    minContentWidth: number = 2880
  ): { leftIndent: number; hangingIndent: number } {
    if (level < 0 || level > 8) {
      throw new Error(`Invalid level ${level}. Level must be between 0 and 8.`);
    }

    // Calculate available content width
    const availableWidth = pageWidthTwips - leftMarginTwips - rightMarginTwips;

    // Calculate max safe indent (leave space for content)
    const maxSafeIndent = Math.max(0, availableWidth - minContentWidth);

    // Standard indentation
    const standardLeftIndent = 720 + level * 360;
    const hangingIndent = 360;

    // Cap at safe maximum
    const safeLeftIndent = Math.min(standardLeftIndent, maxSafeIndent);

    return {
      leftIndent: safeLeftIndent,
      hangingIndent,
    };
  }

  /**
   * Gets the level index
   */
  getLevel(): number {
    return this.properties.level;
  }

  /**
   * Gets the numbering format
   */
  getFormat(): NumberFormat {
    return this.properties.format;
  }

  /**
   * Gets the level properties
   */
  getProperties(): Required<Omit<NumberingLevelProperties, 'lvlRestart' | 'underline'>> & Pick<NumberingLevelProperties, 'lvlRestart' | 'underline'> {
    return { ...this.properties };
  }

  /**
   * Gets the left indentation in twips
   */
  getLeftIndent(): number {
    return this.properties.leftIndent;
  }

  /**
   * Gets the hanging indentation in twips
   */
  getHangingIndent(): number {
    return this.properties.hangingIndent;
  }

  /**
   * Sets the left indentation
   * @param twips Indentation in twips
   */
  setLeftIndent(twips: number): this {
    // Note: Negative values are valid (outdent into margin) per ECMA-376
    this.properties.leftIndent = twips;
    this._notifyModified();
    return this;
  }

  /**
   * Sets the hanging indentation
   * @param twips Indentation in twips
   */
  setHangingIndent(twips: number): this {
    if (twips < 0) {
      throw new Error("Hanging indent must be non-negative");
    }
    this.properties.hangingIndent = twips;
    this._notifyModified();
    return this;
  }

  /**
   * Sets the font for the numbering character
   * @param font Font family name
   */
  setFont(font: string): this {
    this.properties.font = font;
    this._notifyModified();
    return this;
  }

  /**
   * Sets the alignment
   * @param alignment Alignment type
   */
  setAlignment(alignment: NumberAlignment): this {
    this.properties.alignment = alignment;
    this._notifyModified();
    return this;
  }

  /**
   * Sets the font size in half-points
   * @param halfPoints Font size in half-points (e.g., 24 = 12pt)
   */
  setFontSize(halfPoints: number): this {
    this.properties.fontSize = halfPoints;
    this._notifyModified();
    return this;
  }

  /**
   * Sets the level text (bullet character or number template)
   * @param text The text template (e.g., '•' for bullets, '%1.' for numbered)
   */
  setText(text: string): this {
    this.properties.text = text;
    this._notifyModified();
    return this;
  }

  /**
   * Sets the text color
   * @param color Hex color without # (e.g., '000000' for black)
   */
  setColor(color: string): this {
    this.properties.color = color;
    this._notifyModified();
    return this;
  }

  /**
   * Sets whether the numbering text is bold
   * @param bold Whether to make bold
   */
  setBold(bold: boolean): this {
    this.properties.bold = bold;
    this._notifyModified();
    return this;
  }

  /**
   * Sets whether the numbering text is italic
   * @param italic Whether to make italic
   */
  setItalic(italic: boolean): this {
    this.properties.italic = italic;
    this._notifyModified();
    return this;
  }

  /**
   * Gets whether the numbering text is italic
   */
  getItalic(): boolean {
    return this.properties.italic ?? false;
  }

  /**
   * Sets the underline style for numbering text
   * @param style Underline style ('single', 'double', 'wave', 'dotted', 'dash', etc.)
   */
  setUnderline(style: string | undefined): this {
    this.properties.underline = style;
    this._notifyModified();
    return this;
  }

  /**
   * Gets the underline style
   */
  getUnderline(): string | undefined {
    return this.properties.underline;
  }

  /**
   * Clears the underline style
   */
  clearUnderline(): this {
    this.properties.underline = undefined;
    this._notifyModified();
    return this;
  }

  /**
   * Sets the level restart behavior (w:lvlRestart per ECMA-376 Part 1 §17.9.11)
   *
   * Controls when this level's numbering restarts based on higher-level changes:
   * - 0: Never restart (continues throughout document)
   * - 1-8: Restart when the specified level changes
   * - undefined: Restart when level-1 changes (standard/default behavior)
   *
   * @param level The level that triggers restart (0-8), or undefined for default
   * @example
   * // Level 1 that never restarts (continuous across document)
   * level1.setLvlRestart(0);
   *
   * // Level 2 that restarts when level 0 changes (not level 1)
   * level2.setLvlRestart(0);
   */
  setLvlRestart(level: number | undefined): this {
    if (level !== undefined && (level < 0 || level > 8)) {
      throw new Error(`lvlRestart must be between 0 and 8, got ${level}`);
    }
    this.properties.lvlRestart = level;
    this._notifyModified();
    return this;
  }

  /**
   * Gets the level restart value
   * @returns The level that triggers restart, or undefined for default behavior
   */
  getLvlRestart(): number | undefined {
    return this.properties.lvlRestart;
  }

  /**
   * Sets the numbering format (decimal, lowerLetter, bullet, etc.)
   * @param format The numbering format
   */
  setFormat(format: NumberFormat): this {
    this.properties.format = format;
    this._notifyModified();
    return this;
  }

  /**
   * Generates the WordprocessingML XML for this level
   */
  toXML(): XMLElement {
    const children: XMLElement[] = [];

    // Start value
    children.push(
      XMLBuilder.wSelf("start", { "w:val": this.properties.start.toString() })
    );

    // Number format
    children.push(
      XMLBuilder.wSelf("numFmt", { "w:val": this.properties.format })
    );

    // Level restart (w:lvlRestart per ECMA-376 Part 1 §17.9.11)
    // Only output if explicitly set (undefined = default behavior)
    if (this.properties.lvlRestart !== undefined) {
      children.push(
        XMLBuilder.wSelf("lvlRestart", { "w:val": this.properties.lvlRestart.toString() })
      );
    }

    // Level text (e.g., "%1." or "•")
    children.push(
      XMLBuilder.wSelf("lvlText", { "w:val": this.properties.text })
    );

    // Alignment
    children.push(
      XMLBuilder.wSelf("lvlJc", { "w:val": this.properties.alignment })
    );

    // Paragraph properties (indentation)
    const ind = XMLBuilder.wSelf("ind", {
      "w:left": this.properties.leftIndent.toString(),
      "w:hanging": this.properties.hangingIndent.toString(),
    });
    const pPr = XMLBuilder.w("pPr", undefined, [ind]);
    children.push(pPr);

    // Run properties (font)
    const rPrChildren: XMLElement[] = [];

    // Font
    rPrChildren.push(
      XMLBuilder.wSelf("rFonts", {
        "w:ascii": this.properties.font,
        "w:hAnsi": this.properties.font,
        "w:cs": this.properties.font,
        "w:hint": "default",
      })
    );

    // Bold
    if (this.properties.bold) {
      rPrChildren.push(XMLBuilder.wSelf("b"));
      rPrChildren.push(XMLBuilder.wSelf("bCs"));
    }

    // Italic
    if (this.properties.italic) {
      rPrChildren.push(XMLBuilder.wSelf("i"));
      rPrChildren.push(XMLBuilder.wSelf("iCs"));
    }

    // Underline
    if (this.properties.underline) {
      rPrChildren.push(
        XMLBuilder.wSelf("u", { "w:val": this.properties.underline })
      );
    }

    // Color
    if (this.properties.color) {
      rPrChildren.push(
        XMLBuilder.wSelf("color", { "w:val": this.properties.color })
      );
    }

    // Font size
    rPrChildren.push(
      XMLBuilder.wSelf("sz", { "w:val": this.properties.fontSize.toString() })
    );
    rPrChildren.push(
      XMLBuilder.wSelf("szCs", { "w:val": this.properties.fontSize.toString() })
    );

    const rPr = XMLBuilder.w("rPr", undefined, rPrChildren);
    children.push(rPr);

    // Suffix (what comes after the number)
    if (this.properties.suffix) {
      children.push(
        XMLBuilder.wSelf("suff", { "w:val": this.properties.suffix })
      );
    }

    // Legal numbering style
    if (this.properties.isLegalNumberingStyle) {
      children.push(XMLBuilder.wSelf("isLgl"));
    }

    return XMLBuilder.w(
      "lvl",
      { "w:ilvl": this.properties.level.toString() },
      children
    );
  }

  /**
   * Gets the recommended bullet symbol and font for a given level
   * @param level The level index (0-8)
   * @param style Optional bullet style ('standard', 'circle', 'square', 'arrow', 'check', 'word-native')
   * @returns Object with symbol and font properties
   */
  static getBulletSymbolWithFont(
    level: number,
    style:
      | "standard"
      | "circle"
      | "square"
      | "arrow"
      | "check"
      | "word-native" = "standard"
  ): { symbol: string; font: string } {
    const bulletSets = {
      // Standard style now uses Word-native encoding for maximum compatibility
      standard: [
        {
          symbol: WORD_NATIVE_BULLETS.FILLED_BULLET.char,
          font: WORD_NATIVE_BULLETS.FILLED_BULLET.font,
        }, // Level 0: Filled bullet (Symbol U+F0B7)
        {
          symbol: WORD_NATIVE_BULLETS.OPEN_CIRCLE.char,
          font: WORD_NATIVE_BULLETS.OPEN_CIRCLE.font,
        }, // Level 1: Open circle (Courier New U+006F)
        {
          symbol: WORD_NATIVE_BULLETS.FILLED_SQUARE.char,
          font: WORD_NATIVE_BULLETS.FILLED_SQUARE.font,
        }, // Level 2: Filled square (Wingdings U+F0A7)
        {
          symbol: WORD_NATIVE_BULLETS.FILLED_BULLET.char,
          font: WORD_NATIVE_BULLETS.FILLED_BULLET.font,
        }, // Level 3: Filled bullet
        {
          symbol: WORD_NATIVE_BULLETS.OPEN_CIRCLE.char,
          font: WORD_NATIVE_BULLETS.OPEN_CIRCLE.font,
        }, // Level 4: Open circle
        {
          symbol: WORD_NATIVE_BULLETS.FILLED_SQUARE.char,
          font: WORD_NATIVE_BULLETS.FILLED_SQUARE.font,
        }, // Level 5: Filled square
        {
          symbol: WORD_NATIVE_BULLETS.FILLED_BULLET.char,
          font: WORD_NATIVE_BULLETS.FILLED_BULLET.font,
        }, // Level 6: Filled bullet
        {
          symbol: WORD_NATIVE_BULLETS.OPEN_CIRCLE.char,
          font: WORD_NATIVE_BULLETS.OPEN_CIRCLE.font,
        }, // Level 7: Open circle
        {
          symbol: WORD_NATIVE_BULLETS.FILLED_SQUARE.char,
          font: WORD_NATIVE_BULLETS.FILLED_SQUARE.font,
        }, // Level 8: Filled square
      ],
      circle: [
        { symbol: "●", font: "Calibri" }, // Level 0: Filled circle (bold)
        { symbol: "○", font: "Calibri" }, // Level 1: Empty circle
        { symbol: "◉", font: "Calibri" }, // Level 2: Fisheye
        { symbol: "◯", font: "Calibri" }, // Level 3: Large circle
        { symbol: "⦿", font: "Calibri" }, // Level 4: Circled bullet
        { symbol: "○", font: "Calibri" }, // Level 5: Empty circle
        { symbol: "●", font: "Calibri" }, // Level 6: Filled circle
        { symbol: "○", font: "Calibri" }, // Level 7: Empty circle
        { symbol: "◉", font: "Calibri" }, // Level 8: Fisheye
      ],
      square: [
        { symbol: "■", font: "Calibri" }, // Level 0: Filled square
        { symbol: "□", font: "Calibri" }, // Level 1: Empty square
        { symbol: "▪", font: "Calibri" }, // Level 2: Small filled square
        { symbol: "▫", font: "Calibri" }, // Level 3: Small empty square
        { symbol: "◼", font: "Calibri" }, // Level 4: Medium filled square
        { symbol: "◻", font: "Calibri" }, // Level 5: Medium empty square
        { symbol: "■", font: "Calibri" }, // Level 6: Filled square
        { symbol: "□", font: "Calibri" }, // Level 7: Empty square
        { symbol: "▪", font: "Calibri" }, // Level 8: Small filled square
      ],
      arrow: [
        { symbol: "➢", font: "Calibri" }, // Level 0: Right arrow
        { symbol: "➣", font: "Calibri" }, // Level 1: Right arrow filled
        { symbol: "➤", font: "Calibri" }, // Level 2: Right arrow bold
        { symbol: "➔", font: "Calibri" }, // Level 3: Right arrow simple
        { symbol: "➜", font: "Calibri" }, // Level 4: Right arrow outline
        { symbol: "➢", font: "Calibri" }, // Level 5: Right arrow
        { symbol: "➣", font: "Calibri" }, // Level 6: Right arrow filled
        { symbol: "➤", font: "Calibri" }, // Level 7: Right arrow bold
        { symbol: "➔", font: "Calibri" }, // Level 8: Right arrow simple
      ],
      check: [
        { symbol: "✓", font: "Calibri" }, // Level 0: Check mark
        { symbol: "✔", font: "Calibri" }, // Level 1: Heavy check mark
        { symbol: "☑", font: "Calibri" }, // Level 2: Checked box
        { symbol: "✓", font: "Calibri" }, // Level 3: Check mark
        { symbol: "✔", font: "Calibri" }, // Level 4: Heavy check mark
        { symbol: "☑", font: "Calibri" }, // Level 5: Checked box
        { symbol: "✓", font: "Calibri" }, // Level 6: Check mark
        { symbol: "✔", font: "Calibri" }, // Level 7: Heavy check mark
        { symbol: "☑", font: "Calibri" }, // Level 8: Checked box
      ],
      "word-native": [
        // Word-native bullets using PUA characters with Symbol/Wingdings fonts
        {
          symbol: WORD_NATIVE_BULLETS.FILLED_BULLET.char,
          font: WORD_NATIVE_BULLETS.FILLED_BULLET.font,
        }, // Level 0: Filled bullet (Symbol U+F0B7)
        {
          symbol: WORD_NATIVE_BULLETS.OPEN_CIRCLE.char,
          font: WORD_NATIVE_BULLETS.OPEN_CIRCLE.font,
        }, // Level 1: Open circle (Courier New U+006F)
        {
          symbol: WORD_NATIVE_BULLETS.FILLED_SQUARE.char,
          font: WORD_NATIVE_BULLETS.FILLED_SQUARE.font,
        }, // Level 2: Filled square (Wingdings U+F0A7)
        {
          symbol: WORD_NATIVE_BULLETS.FILLED_BULLET.char,
          font: WORD_NATIVE_BULLETS.FILLED_BULLET.font,
        }, // Level 3: Filled bullet
        {
          symbol: WORD_NATIVE_BULLETS.OPEN_CIRCLE.char,
          font: WORD_NATIVE_BULLETS.OPEN_CIRCLE.font,
        }, // Level 4: Open circle
        {
          symbol: WORD_NATIVE_BULLETS.FILLED_SQUARE.char,
          font: WORD_NATIVE_BULLETS.FILLED_SQUARE.font,
        }, // Level 5: Filled square
        {
          symbol: WORD_NATIVE_BULLETS.FILLED_BULLET.char,
          font: WORD_NATIVE_BULLETS.FILLED_BULLET.font,
        }, // Level 6: Filled bullet
        {
          symbol: WORD_NATIVE_BULLETS.OPEN_CIRCLE.char,
          font: WORD_NATIVE_BULLETS.OPEN_CIRCLE.font,
        }, // Level 7: Open circle
        {
          symbol: WORD_NATIVE_BULLETS.FILLED_SQUARE.char,
          font: WORD_NATIVE_BULLETS.FILLED_SQUARE.font,
        }, // Level 8: Filled square
      ],
    };

    const selectedSet = bulletSets[style];
    const levelIndex = level % selectedSet.length;
    const result = selectedSet[levelIndex];

    // Fallback to standard bullet if somehow undefined
    return result || { symbol: "•", font: "Calibri" };
  }

  /**
   * Calculates the standard indentation values for a given level
   * @param level The level index (0-8)
   * @returns Object with leftIndent and hangingIndent in twips
   * @example
   * const indent = NumberingLevel.calculateStandardIndentation(0);
   * // Returns: { leftIndent: 720, hangingIndent: 360 } (0.5" left, 0.25" hanging)
   *
   * const indent2 = NumberingLevel.calculateStandardIndentation(2);
   * // Returns: { leftIndent: 1440, hangingIndent: 360 } (1.0" left, 0.25" hanging)
   */
  static calculateStandardIndentation(level: number): {
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
   * Gets the standard number format for a given level
   * @param level The level index (0-8)
   * @returns The recommended number format for this level
   * @example
   * NumberingLevel.getStandardNumberFormat(0); // 'decimal' (1., 2., 3.)
   * NumberingLevel.getStandardNumberFormat(1); // 'lowerLetter' (a., b., c.)
   * NumberingLevel.getStandardNumberFormat(2); // 'lowerRoman' (i., ii., iii.)
   * NumberingLevel.getStandardNumberFormat(3); // 'upperLetter' (A., B., C.)
   * NumberingLevel.getStandardNumberFormat(4); // 'upperRoman' (I., II., III.)
   */
  static getStandardNumberFormat(level: number): NumberFormat {
    if (level < 0 || level > 8) {
      throw new Error(`Invalid level ${level}. Level must be between 0 and 8.`);
    }

    const formats: NumberFormat[] = [
      "decimal", // Level 0: 1., 2., 3.
      "lowerLetter", // Level 1: a., b., c.
      "lowerRoman", // Level 2: i., ii., iii.
      "upperLetter", // Level 3: A., B., C.
      "upperRoman", // Level 4: I., II., III.
    ];

    const result = formats[level % formats.length];
    return result || "decimal"; // Fallback to decimal (should never happen)
  }

  /**
   * Creates a bullet list level
   *
   * When called without parameters, uses Word-native encoding for the level:
   * - Levels 0, 3, 6: Filled bullet (Symbol font, U+F0B7)
   * - Levels 1, 4, 7: Open circle (Courier New, U+006F)
   * - Levels 2, 5, 8: Filled square (Wingdings, U+F0A7)
   *
   * @param level The level index (0-8)
   * @param bullet Optional bullet character (defaults to Word-native for level)
   * @param font Optional font to use for the bullet (defaults to Word-native for level)
   */
  static createBulletLevel(
    level: number,
    bullet?: string,
    font?: string
  ): NumberingLevel {
    // Use Word-native defaults when not specified
    const defaults = NumberingLevel.getBulletSymbolWithFont(level, "standard");
    const actualBullet = bullet ?? defaults.symbol;
    const actualFont = font ?? defaults.font;

    return new NumberingLevel({
      level,
      format: "bullet",
      text: actualBullet,
      alignment: "left",
      font: actualFont,
      fontSize: 24, // 12pt
      bold: false,
      color: "000000",
      leftIndent: 720 + level * 360,
      hangingIndent: 360,
    });
  }

  /**
   * Creates a decimal list level (1, 2, 3, ...)
   * @param level The level index (0-8)
   * @param template The text template (default: '%1.')
   */
  static createDecimalLevel(
    level: number,
    template: string = `%${level + 1}.`
  ): NumberingLevel {
    return new NumberingLevel({
      level,
      format: "decimal",
      text: template,
      alignment: "left",
      font: "Verdana",
      fontSize: 24, // 12pt
      bold: false,
      color: "000000",
      leftIndent: 720 + level * 360,
      hangingIndent: 360,
    });
  }

  /**
   * Creates a lower roman list level (i, ii, iii, ...)
   * @param level The level index (0-8)
   * @param template The text template (default: '%1.')
   */
  static createLowerRomanLevel(
    level: number,
    template: string = `%${level + 1}.`
  ): NumberingLevel {
    return new NumberingLevel({
      level,
      format: "lowerRoman",
      text: template,
      alignment: "left",
      font: "Verdana",
      fontSize: 24, // 12pt
      bold: false,
      color: "000000",
      leftIndent: 720 + level * 360,
      hangingIndent: 360,
    });
  }

  /**
   * Creates an upper roman list level (I, II, III, ...)
   * @param level The level index (0-8)
   * @param template The text template (default: '%1.')
   */
  static createUpperRomanLevel(
    level: number,
    template: string = `%${level + 1}.`
  ): NumberingLevel {
    return new NumberingLevel({
      level,
      format: "upperRoman",
      text: template,
      alignment: "left",
      font: "Verdana",
      fontSize: 24, // 12pt
      bold: false,
      color: "000000",
      leftIndent: 720 + level * 360,
      hangingIndent: 360,
    });
  }

  /**
   * Creates a lower letter list level (a, b, c, ...)
   * @param level The level index (0-8)
   * @param template The text template (default: '%1.')
   */
  static createLowerLetterLevel(
    level: number,
    template: string = `%${level + 1}.`
  ): NumberingLevel {
    return new NumberingLevel({
      level,
      format: "lowerLetter",
      text: template,
      alignment: "left",
      font: "Verdana",
      fontSize: 24, // 12pt
      bold: false,
      color: "000000",
      leftIndent: 720 + level * 360,
      hangingIndent: 360,
    });
  }

  /**
   * Creates an upper letter list level (A, B, C, ...)
   * @param level The level index (0-8)
   * @param template The text template (default: '%1.')
   */
  static createUpperLetterLevel(
    level: number,
    template: string = `%${level + 1}.`
  ): NumberingLevel {
    return new NumberingLevel({
      level,
      format: "upperLetter",
      text: template,
      alignment: "left",
      font: "Verdana",
      fontSize: 24, // 12pt
      bold: false,
      color: "000000",
      leftIndent: 720 + level * 360,
      hangingIndent: 360,
    });
  }

  /**
   * Factory method for creating a numbering level
   * @param properties The level properties
   */
  static create(properties: NumberingLevelProperties): NumberingLevel {
    return new NumberingLevel(properties);
  }

  /**
   * Creates a NumberingLevel from XML element
   * @param xml The XML string of the <w:lvl> element
   * @returns NumberingLevel instance
   */
  static fromXML(xml: string): NumberingLevel {
    // Extract level index (required)
    const ilvlMatch = xml.match(/<w:lvl[^>]*w:ilvl="([^"]+)"/);
    if (!ilvlMatch || !ilvlMatch[1]) {
      throw new Error("Missing required w:ilvl attribute");
    }
    const level = parseInt(ilvlMatch[1], 10);

    // Extract number format (required)
    const numFmtMatch = xml.match(/<w:numFmt[^>]*w:val="([^"]+)"/);
    if (!numFmtMatch || !numFmtMatch[1]) {
      throw new Error("Missing required w:numFmt element");
    }
    const format = numFmtMatch[1] as NumberFormat;

    // Extract level text (optional - can be empty for placeholder levels)
    const lvlTextMatch = xml.match(/<w:lvlText[^>]*w:val="([^"]*)"/);
    const text = lvlTextMatch && lvlTextMatch[1] !== undefined ? lvlTextMatch[1] : "";

    // Extract alignment (optional, default: left)
    const lvlJcMatch = xml.match(/<w:lvlJc[^>]*w:val="([^"]+)"/);
    const alignment = (
      lvlJcMatch && lvlJcMatch[1] ? lvlJcMatch[1] : "left"
    ) as NumberAlignment;

    // Extract start value (optional, default: 1)
    const startMatch = xml.match(/<w:start[^>]*w:val="([^"]+)"/);
    const start = startMatch && startMatch[1] ? parseInt(startMatch[1], 10) : 1;

    // Extract suffix (optional, default: tab)
    const suffixMatch = xml.match(/<w:suff[^>]*w:val="([^"]+)"/);
    const suffix =
      suffixMatch && suffixMatch[1]
        ? (suffixMatch[1] as "tab" | "space" | "nothing")
        : "tab";

    // Extract level restart (w:lvlRestart per ECMA-376 Part 1 §17.9.11)
    let lvlRestart: number | undefined;
    const lvlRestartMatch = xml.match(/<w:lvlRestart[^>]*w:val="([^"]+)"/);
    if (lvlRestartMatch && lvlRestartMatch[1]) {
      lvlRestart = parseInt(lvlRestartMatch[1], 10);
    }

    // Extract indentation from <w:pPr><w:ind>
    let leftIndent = 720 + level * 360; // default
    let hangingIndent = 360; // default
    const indMatch = xml.match(/<w:ind[^>]*\/>/);
    if (indMatch) {
      const indElement = indMatch[0];
      const leftMatch = indElement.match(/w:left="([^"]+)"/);
      const hangingMatch = indElement.match(/w:hanging="([^"]+)"/);

      if (leftMatch && leftMatch[1]) leftIndent = parseInt(leftMatch[1], 10);
      if (hangingMatch && hangingMatch[1])
        hangingIndent = parseInt(hangingMatch[1], 10);
    }

    // Extract font and size from <w:rPr>
    let font = "Calibri";
    let fontSize = 22;

    const rFontsMatch = xml.match(/<w:rFonts[^>]*\/>/);
    if (rFontsMatch) {
      const rFontsElement = rFontsMatch[0];
      const asciiMatch = rFontsElement.match(/w:ascii="([^"]+)"/);
      if (asciiMatch && asciiMatch[1]) font = asciiMatch[1];
    }

    const szMatch = xml.match(/<w:sz[^>]*w:val="([^"]+)"/);
    if (szMatch && szMatch[1]) fontSize = parseInt(szMatch[1], 10);

    // Bullet/number symbols should never be bold - ignore source XML bold formatting
    const bold = false;

    // Extract italic from <w:rPr>
    const iMatch = xml.match(/<w:i(?:\s|\/|>)/);
    const italic = !!iMatch;

    // Extract underline from <w:rPr>
    let underline: string | undefined;
    const uMatch = xml.match(/<w:u[^>]*w:val="([^"]+)"/);
    if (uMatch && uMatch[1]) {
      underline = uMatch[1];
    }

    // Extract color from <w:rPr>
    let color: string | undefined;
    const colorMatch = xml.match(/<w:color[^>]*w:val="([^"]+)"/);
    if (colorMatch && colorMatch[1]) {
      color = colorMatch[1];
    }

    return new NumberingLevel({
      level,
      format,
      text,
      alignment,
      start,
      leftIndent,
      hangingIndent,
      font,
      fontSize,
      suffix,
      bold,
      italic,
      underline,
      color,
      lvlRestart,
    });
  }
}
