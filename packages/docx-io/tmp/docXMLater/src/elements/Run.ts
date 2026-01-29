/**
 * Run - Represents a run of text with uniform formatting
 * A run is the smallest unit of text formatting in a Word document
 */

import { deepClone } from "../utils/deepClone";
import { logSerialization, logTextDirection } from "../utils/diagnostics";
import { defaultLogger } from "../utils/logger";
import { normalizeColor, validateRunText } from "../utils/validation";
import { getActiveConditionalsInPriorityOrder } from "../utils/cnfStyleDecoder";
import { XMLBuilder, XMLElement } from "../xml/XMLBuilder";
import {
  ShadingPattern as CommonShadingPattern,
  ExtendedBorderStyle,
  BorderDefinition,
} from "./CommonTypes";
import type { RunPropertyChange } from "./PropertyChangeTypes";
// Type-only import to avoid circular dependency (Revision imports Run)
import type { Revision as RevisionType } from "./Revision";

/**
 * Run content element types
 * Per ECMA-376 Part 1 §17.3.3 EG_RunInnerContent, runs can contain multiple types of content
 */
export type RunContentType =
  | "text" // <w:t> - Regular text
  | "tab" // <w:tab/> - Tab character (used in TOC entries)
  | "break" // <w:br/> - Line/page/column break
  | "carriageReturn" // <w:cr/> - Carriage return
  | "softHyphen" // <w:softHyphen/> - Optional hyphen
  | "noBreakHyphen" // <w:noBreakHyphen/> - Non-breaking hyphen
  | "instructionText" // <w:instrText> - Field instruction text
  | "fieldChar" // <w:fldChar/> - Field character markers
  | "vml"; // <w:pict> - VML/legacy graphics (preserved as raw XML)

/**
 * Break type for <w:br> elements
 * Per ECMA-376 Part 1 §17.18.3
 */
export type BreakType = "page" | "column" | "textWrapping";

/**
 * Run content element
 * Represents a single content element within a run (text, tab, break, etc.)
 */
export interface RunContent {
  /** Type of content element */
  type: RunContentType;
  /** Text value (for 'text' and 'instructionText' types) */
  value?: string;
  /** Break type (only for 'break' type) */
  breakType?: BreakType;
  /** Field character subtype (only for 'fieldChar' type) */
  fieldCharType?: "begin" | "separate" | "end";
  /** Whether the field char is marked dirty */
  fieldCharDirty?: boolean;
  /** Whether the field char is locked */
  fieldCharLocked?: boolean;
  /** Raw XML content (for 'vml' type - preserves w:pict elements as-is) */
  rawXml?: string;
  /**
   * Whether this content came from a deleted section (w:delText or w:delInstrText)
   * Per ECMA-376 Part 1 §22.1.2.26-27, deleted content uses special elements
   * This flag helps with proper serialization back to w:delText/w:delInstrText
   */
  isDeleted?: boolean;
}

/**
 * Border style for text
 * @see CommonTypes.ExtendedBorderStyle for the canonical definition
 */
export type TextBorderStyle = ExtendedBorderStyle;

/**
 * Text border definition
 */
export interface TextBorder {
  /** Border style */
  style?: TextBorderStyle;
  /** Border size in eighths of a point */
  size?: number;
  /** Border color in hex format (without #) */
  color?: string;
  /** Space between border and text in points */
  space?: number;
}

/**
 * Shading pattern for text background
 * @see CommonTypes.ShadingPattern for the canonical definition
 */
export type ShadingPattern = CommonShadingPattern;

/**
 * Character shading definition
 */
export interface CharacterShading {
  /** Background fill color in hex format (without #) */
  fill?: string;
  /** Foreground pattern color in hex format (without #) */
  color?: string;
  /** Shading pattern */
  val?: ShadingPattern;
}

/**
 * East Asian typography layout options
 */
export interface EastAsianLayout {
  /** Layout ID for specific Asian typography */
  id?: number;
  /** Vertical text layout */
  vert?: boolean;
  /** Compress vertical text */
  vertCompress?: boolean;
  /** Combine characters into single character space */
  combine?: boolean;
  /** Bracket characters for combined text */
  combineBrackets?: "none" | "round" | "square" | "angle" | "curly";
}

/**
 * Emphasis mark type - decorative marks above/below text
 */
export type EmphasisMark = "dot" | "comma" | "circle" | "underDot";

/**
 * Theme color values per ECMA-376 Part 1 Section 17.18.96 (ST_ThemeColor)
 * These reference colors defined in the document's theme (theme1.xml)
 */
export type ThemeColorValue =
  | "dark1"
  | "light1"
  | "dark2"
  | "light2"
  | "accent1"
  | "accent2"
  | "accent3"
  | "accent4"
  | "accent5"
  | "accent6"
  | "hyperlink"
  | "followedHyperlink"
  | "background1"
  | "text1"
  | "background2"
  | "text2";

/**
 * Text formatting options for a run
 */
export interface RunFormatting {
  /** Character style reference - links to a character style definition */
  characterStyle?: string;
  /** Text border - draws a border around the text */
  border?: TextBorder;
  /** Character shading - background color/pattern for text */
  shading?: CharacterShading;
  /** Emphasis mark - decorative mark above/below text (e.g., dot, comma) */
  emphasis?: EmphasisMark;
  /** Bold text */
  bold?: boolean;
  /** Italic text */
  italic?: boolean;
  /** Bold text for complex scripts (RTL languages like Arabic, Hebrew) */
  complexScriptBold?: boolean;
  /** Italic text for complex scripts (RTL languages like Arabic, Hebrew) */
  complexScriptItalic?: boolean;
  /** Character spacing (letter spacing) in twips (1/20th of a point) */
  characterSpacing?: number;
  /** Horizontal scaling percentage (e.g., 200 = 200% width, 50 = 50% width) */
  scaling?: number;
  /** Vertical position in half-points (positive = raised, negative = lowered) */
  position?: number;
  /** Kerning threshold in half-points (font size at which kerning starts) */
  kerning?: number;
  /** Language code (e.g., 'en-US', 'fr-FR', 'es-ES') */
  language?: string;
  /** Underline text. Use "none" to explicitly override style underline. */
  underline?: boolean | "single" | "double" | "thick" | "dotted" | "dash" | "none";
  /** Strikethrough text */
  strike?: boolean;
  /** Double strikethrough */
  dstrike?: boolean;
  /** Subscript */
  subscript?: boolean;
  /** Superscript */
  superscript?: boolean;
  /** Font name */
  font?: string;
  /** Font size in points (half-points for Word) */
  size?: number;
  /** Font size for complex scripts (RTL languages) in points. If not set, uses size. */
  sizeCs?: number;
  /** Text color in hex format (without #) */
  color?: string;
  /**
   * Theme color reference for text color per ECMA-376 Part 1 Section 17.3.2.6
   * When set, the color is derived from the document's theme rather than a fixed hex value
   */
  themeColor?: ThemeColorValue;
  /**
   * Theme color tint (0-255, where 0=no tint, 255=full tint toward white)
   * Applied to themeColor to create lighter variations
   */
  themeTint?: number;
  /**
   * Theme color shade (0-255, where 0=no shade, 255=full shade toward black)
   * Applied to themeColor to create darker variations
   */
  themeShade?: number;
  /** Highlight color */
  highlight?:
    | "yellow"
    | "green"
    | "cyan"
    | "magenta"
    | "blue"
    | "red"
    | "darkBlue"
    | "darkCyan"
    | "darkGreen"
    | "darkMagenta"
    | "darkRed"
    | "darkYellow"
    | "darkGray"
    | "lightGray"
    | "black"
    | "white";
  /** Small caps */
  smallCaps?: boolean;
  /** All caps */
  allCaps?: boolean;
  /** Outline text effect - displays text with an outline */
  outline?: boolean;
  /** Shadow text effect - displays text with a shadow */
  shadow?: boolean;
  /** Emboss text effect - displays text with a 3D embossed appearance */
  emboss?: boolean;
  /** Imprint/engrave text effect - displays text with a pressed-in appearance */
  imprint?: boolean;
  /** Right-to-left text direction (for languages like Arabic, Hebrew) */
  rtl?: boolean;
  /** Hidden/vanish text (not displayed but present in document) */
  vanish?: boolean;
  /** No proofing - skip spell check and grammar check for this text */
  noProof?: boolean;
  /** Snap to grid - align text to document grid */
  snapToGrid?: boolean;
  /** Special vanish - hidden text for specific scenarios (like TOC entries) */
  specVanish?: boolean;
  /** Text effect/animation type */
  effect?:
    | "none"
    | "lights"
    | "blinkBackground"
    | "sparkleText"
    | "marchingBlackAnts"
    | "marchingRedAnts"
    | "shimmer"
    | "antsBlack"
    | "antsRed";
  /** Fit text to width in twips (1/20th of a point) */
  fitText?: number;
  /** East Asian typography layout options */
  eastAsianLayout?: EastAsianLayout;
  /**
   * Automatically clean XML-like patterns from text content.
   * When true (default), removes XML tags like <w:t> from text to prevent display issues.
   * Set to false to disable auto-cleaning (useful for debugging).
   * Default: true (auto-clean enabled by default for defensive data handling)
   */
  cleanXmlFromText?: boolean;
}

/**
 * Represents a run of formatted text
 */
export class Run {
  private content: RunContent[];
  private formatting: RunFormatting;
  private trackingContext?: import('../tracking/TrackingContext').TrackingContext;
  private propertyChangeRevision?: RunPropertyChange;
  /** Parent paragraph reference for automatic tracking */
  private _parentParagraph?: import('./Paragraph').Paragraph;

  /**
   * Creates a new Run
   * @param text - The text content
   * @param formatting - Formatting options
   */
  constructor(text: string, formatting: RunFormatting = {}) {
    // Warn about undefined/null text to help catch data quality issues
    if (text === undefined || text === null) {
      defaultLogger.warn(
        `DocXML Text Validation Warning [Run constructor]:\n` +
          `  - Received ${
            text === undefined ? "undefined" : "null"
          } text value\n` +
          `  - Converting to empty string for Word compatibility`
      );
    }

    // Default to auto-cleaning XML patterns unless explicitly disabled
    const shouldClean = formatting.cleanXmlFromText !== false;

    // Validate text for XML patterns
    const validation = validateRunText(text, {
      context: "Run constructor",
      autoClean: shouldClean,
      warnToConsole: true, // Enable warnings to help catch data quality issues
    });

    // Use cleaned text if available and cleaning was requested
    const cleanedText = validation.cleanedText || text;

    // Convert undefined/null to empty string for consistent XML generation
    const normalizedText = cleanedText ?? "";

    // Parse text to extract special characters into separate content elements
    this.content = this.parseTextWithSpecialCharacters(normalizedText);

    // Remove cleanXmlFromText from formatting as it's not a display property
    const { cleanXmlFromText, ...displayFormatting } = formatting;
    this.formatting = displayFormatting;
  }

  /**
   * Parses text containing special characters and converts them to content elements
   * @param text Text that may contain tabs, newlines, non-breaking hyphens, etc.
   * @returns Array of content elements
   * @private
   */
  private parseTextWithSpecialCharacters(text: string): RunContent[] {
    if (!text) {
      return [{ type: "text", value: "" }];
    }

    const content: RunContent[] = [];
    let currentText = "";

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      switch (char) {
        case "\t":
          // Add accumulated text before tab
          if (currentText) {
            content.push({ type: "text", value: currentText });
            currentText = "";
          }
          // Add tab element
          content.push({ type: "tab" });
          break;

        case "\n":
          // Add accumulated text before newline
          if (currentText) {
            content.push({ type: "text", value: currentText });
            currentText = "";
          }
          // Add break element
          content.push({ type: "break" });
          break;

        case "\u2011": // Non-breaking hyphen
          // Add accumulated text before non-breaking hyphen
          if (currentText) {
            content.push({ type: "text", value: currentText });
            currentText = "";
          }
          // Add non-breaking hyphen element
          content.push({ type: "noBreakHyphen" });
          break;

        case "\r": // Carriage return
          // Add accumulated text before carriage return
          if (currentText) {
            content.push({ type: "text", value: currentText });
            currentText = "";
          }
          // Add carriage return element
          content.push({ type: "carriageReturn" });
          break;

        case "\u00AD": // Soft hyphen
          // Add accumulated text before soft hyphen
          if (currentText) {
            content.push({ type: "text", value: currentText });
            currentText = "";
          }
          // Add soft hyphen element
          content.push({ type: "softHyphen" });
          break;

        default:
          // Accumulate regular text
          currentText += char;
          break;
      }
    }

    // Add any remaining text
    if (currentText) {
      content.push({ type: "text", value: currentText });
    }

    // If no content was added (empty string), add empty text element
    if (content.length === 0) {
      content.push({ type: "text", value: "" });
    }

    return content;
  }

  /**
   * Gets the text content from the run
   *
   * Concatenates all content elements and converts special characters
   * (tabs, breaks, etc.) back to their string representation.
   *
   * @returns The complete text string including tabs (\t) and line breaks (\n)
   *
   * @example
   * ```typescript
   * const run = new Run('Hello\tWorld');
   * console.log(run.getText()); // "Hello\tWorld"
   * ```
   */
  getText(): string {
    return this.content
      .map((c) => {
        switch (c.type) {
          case "text":
            return c.value || "";
          case "tab":
            return "\t";
          case "break":
            return "\n";
          case "carriageReturn":
            return "\r";
          case "softHyphen":
            return "\u00AD";
          case "noBreakHyphen":
            return "\u2011";
          case "instructionText":
            return "";
          case "fieldChar":
            return "";
          default:
            return "";
        }
      })
      .join("");
  }

  /**
   * Sets the text content of the run
   *
   * Replaces all existing content with new text. Special characters like
   * tabs (\t) and newlines (\n) are automatically converted to their
   * corresponding XML elements.
   *
   * @param text - The new text content
   *
   * @example
   * ```typescript
   * const run = new Run('Old text');
   * run.setText('New text');
   * run.setText('Text with\ttab'); // Tab is preserved
   * ```
   */
  setText(text: string): void {
    // Capture old text for tracking before any changes
    const oldText = this.getText();

    // Warn about undefined/null text to help catch data quality issues
    if (text === undefined || text === null) {
      defaultLogger.warn(
        `DocXML Text Validation Warning [Run.setText]:\n` +
          `  - Received ${
            text === undefined ? "undefined" : "null"
          } text value\n` +
          `  - Converting to empty string for Word compatibility`
      );
    }

    // Respect original cleanXmlFromText setting (Issue #9 fix)
    // This ensures consistent behavior with constructor
    const shouldClean = this.formatting.cleanXmlFromText !== false;

    // Validate text for XML patterns
    const validation = validateRunText(text, {
      context: "Run.setText",
      autoClean: shouldClean,
      warnToConsole: true, // Enable warnings to help catch data quality issues
    });

    // Use cleaned text if available and cleaning was requested
    const cleanedText = validation.cleanedText || text;

    // Convert undefined/null to empty string for consistent XML generation
    const normalizedText = cleanedText ?? "";

    // Check if current content is all instructionText - preserve the type
    // This is critical for TOC field instructions and other field codes
    // Without this, calling setText() on a run with instrText would convert it to w:t
    // which causes field instruction codes to appear as visible text in Word
    const isAllInstructionText = this.content.length > 0 &&
      this.content.every(c => c.type === "instructionText");

    if (isAllInstructionText) {
      // Preserve instructionText type - just update the value
      this.content = [{ type: "instructionText", value: normalizedText }];
    } else {
      // Normal behavior - parse text to extract special characters into separate content elements
      this.content = this.parseTextWithSpecialCharacters(normalizedText);
    }

    // Track text change if tracking is enabled and text actually changed
    if (this.trackingContext?.isEnabled() && this._parentParagraph && oldText !== normalizedText && oldText) {
      // Lazy load Revision to avoid circular dependency
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Revision } = require('./Revision');

      // Create a clone of this run with the OLD text for the delete revision
      const deleteRun = this.clone();
      deleteRun.content = this.parseTextWithSpecialCharacters(oldText);

      // Create delete revision for old text
      const deleteRev = Revision.createDeletion(
        this.trackingContext.getAuthor(),
        deleteRun,
        new Date()
      );
      this.trackingContext.getRevisionManager().register(deleteRev);

      // Create insert revision for new text (this run with updated content)
      const insertRev = Revision.createInsertion(
        this.trackingContext.getAuthor(),
        this,
        new Date()
      );
      this.trackingContext.getRevisionManager().register(insertRev);

      // Replace this run in parent's content with [delete, insert] revisions
      // Note: replaceContent does its own indexOf check on this.content (not a copy)
      this._parentParagraph.replaceContent(this, [deleteRev, insertRev]);
    }
  }

  /**
   * Gets a copy of the run formatting
   *
   * Returns a copy of all formatting properties including font, size,
   * bold, italic, color, and all other formatting attributes.
   *
   * @returns Copy of the run formatting object
   *
   * @example
   * ```typescript
   * const formatting = run.getFormatting();
   * console.log(`Font: ${formatting.font}, Size: ${formatting.size}pt`);
   * if (formatting.bold) {
   *   console.log('Text is bold');
   * }
   * ```
   */
  getFormatting(): RunFormatting {
    return { ...this.formatting };
  }

  /**
   * Gets the bold formatting value
   * @returns True if bold, false otherwise
   */
  getBold(): boolean {
    return this.formatting.bold ?? false;
  }

  /**
   * Gets the italic formatting value
   * @returns True if italic, false otherwise
   */
  getItalic(): boolean {
    return this.formatting.italic ?? false;
  }

  /**
   * Gets the underline style
   * @returns Underline style (string, boolean, or undefined)
   */
  getUnderline(): boolean | "none" | "single" | "double" | "dotted" | "thick" | "dash" | undefined {
    return this.formatting.underline;
  }

  /**
   * Gets the strikethrough formatting value
   * @returns True if strikethrough, false otherwise
   */
  getStrike(): boolean {
    return this.formatting.strike ?? false;
  }

  /**
   * Gets the font family name
   * @returns Font name or undefined if not set
   */
  getFont(): string | undefined {
    return this.formatting.font;
  }

  /**
   * Gets the font size in half-points
   * @returns Size in half-points or undefined if not set
   */
  getSize(): number | undefined {
    return this.formatting.size;
  }

  /**
   * Gets the text color as hex string
   * @returns Color hex string or undefined if not set
   */
  getColor(): string | undefined {
    return this.formatting.color;
  }

  /**
   * Gets the highlight color
   * @returns Highlight color name or undefined if not set
   */
  getHighlight(): string | undefined {
    return this.formatting.highlight;
  }

  /**
   * Gets the subscript formatting value
   * @returns True if subscript, false otherwise
   */
  getSubscript(): boolean {
    return this.formatting.subscript ?? false;
  }

  /**
   * Gets the superscript formatting value
   * @returns True if superscript, false otherwise
   */
  getSuperscript(): boolean {
    return this.formatting.superscript ?? false;
  }

  /**
   * Gets whether the run is right-to-left text
   * @returns True if RTL, false otherwise
   */
  isRTL(): boolean {
    return this.formatting.rtl ?? false;
  }

  /**
   * Gets the small caps formatting value
   * @returns True if small caps, false otherwise
   */
  getSmallCaps(): boolean {
    return this.formatting.smallCaps ?? false;
  }

  /**
   * Gets the all caps formatting value
   * @returns True if all caps, false otherwise
   */
  getAllCaps(): boolean {
    return this.formatting.allCaps ?? false;
  }

  /**
   * Gets effective bold formatting, resolving from:
   * 1. Direct formatting on this run
   * 2. Table conditional formatting (if in a table cell)
   *
   * @returns True if text should render bold, undefined if not determinable
   *
   * @example
   * ```typescript
   * // Check effective bold (considers table conditional formatting)
   * const isBold = run.getEffectiveBold();
   * if (isBold) {
   *   console.log('Text appears bold (direct or via table style)');
   * }
   * ```
   */
  getEffectiveBold(): boolean | undefined {
    // Direct formatting takes highest precedence
    if (this.formatting.bold !== undefined) {
      return this.formatting.bold;
    }

    // Check table conditional formatting
    return this.getConditionalFormattingProperty("bold") as boolean | undefined;
  }

  /**
   * Gets effective italic formatting, resolving from:
   * 1. Direct formatting on this run
   * 2. Table conditional formatting (if in a table cell)
   *
   * @returns True if text should render italic, undefined if not determinable
   */
  getEffectiveItalic(): boolean | undefined {
    if (this.formatting.italic !== undefined) {
      return this.formatting.italic;
    }
    return this.getConditionalFormattingProperty("italic") as boolean | undefined;
  }

  /**
   * Gets effective color formatting, resolving from:
   * 1. Direct formatting on this run
   * 2. Table conditional formatting (if in a table cell)
   *
   * @returns Hex color string or undefined
   */
  getEffectiveColor(): string | undefined {
    if (this.formatting.color !== undefined) {
      return this.formatting.color;
    }
    return this.getConditionalFormattingProperty("color") as string | undefined;
  }

  /**
   * Gets effective font formatting, resolving from:
   * 1. Direct formatting on this run
   * 2. Table conditional formatting (if in a table cell)
   *
   * @returns Font name or undefined
   */
  getEffectiveFont(): string | undefined {
    if (this.formatting.font !== undefined) {
      return this.formatting.font;
    }
    return this.getConditionalFormattingProperty("font") as string | undefined;
  }

  /**
   * Gets effective font size formatting, resolving from:
   * 1. Direct formatting on this run
   * 2. Table conditional formatting (if in a table cell)
   *
   * @returns Font size in points or undefined
   */
  getEffectiveSize(): number | undefined {
    if (this.formatting.size !== undefined) {
      return this.formatting.size;
    }
    return this.getConditionalFormattingProperty("size") as number | undefined;
  }

  /**
   * Checks if this run has the "Hyperlink" character style applied.
   *
   * This is useful when applying bulk style changes to a document,
   * to avoid overwriting hyperlink formatting (which would make
   * hyperlinks appear as plain text).
   *
   * @returns True if the run has "Hyperlink" character style
   *
   * @example
   * ```typescript
   * // Skip hyperlink-styled runs when applying color changes
   * for (const para of doc.getParagraphs()) {
   *   for (const run of para.getRuns()) {
   *     if (run.isHyperlinkStyled()) {
   *       continue; // Preserve hyperlink formatting
   *     }
   *     run.setColor('000000');
   *   }
   * }
   * ```
   */
  isHyperlinkStyled(): boolean {
    return this.formatting.characterStyle === "Hyperlink";
  }

  /**
   * Gets a specific property from table conditional formatting.
   * Traverses the parent chain to find conditional formatting from table styles.
   * @internal
   */
  private getConditionalFormattingProperty<K extends keyof RunFormatting>(
    property: K
  ): RunFormatting[K] | undefined {
    // Need parent paragraph to access cell context
    const para = this._parentParagraph;
    if (!para) return undefined;

    // Check if paragraph is in a table cell
    const cell = para._getParentCell();
    if (!cell) return undefined;

    // Get the cnfStyle (which conditionals apply)
    const cnfStyle = para.getTableConditionalStyle();
    if (!cnfStyle) return undefined;

    // Decode cnfStyle to find active conditionals
    const activeConditionals = getActiveConditionalsInPriorityOrder(cnfStyle);

    // Try explicit table style first
    const tableStyleId = cell.getTableStyleId();
    const stylesManager = para._getStylesManager();

    if (tableStyleId && stylesManager) {
      const style = stylesManager.getStyle(tableStyleId);
      if (style) {
        const tableStyleProps = style.getProperties().tableStyle;
        if (tableStyleProps?.conditionalFormatting) {
          // Check active conditionals in priority order (corners > edges > banding)
          for (const conditionalType of activeConditionals) {
            const conditional = tableStyleProps.conditionalFormatting.find(
              (cf) => cf.type === conditionalType
            );
            if (conditional?.runFormatting?.[property] !== undefined) {
              return conditional.runFormatting[property];
            }
          }

          // Fallback: check wholeTable conditional (applies to all cells)
          const wholeTable = tableStyleProps.conditionalFormatting.find(
            (cf) => cf.type === "wholeTable"
          );
          if (wholeTable?.runFormatting?.[property] !== undefined) {
            return wholeTable.runFormatting[property];
          }
        }
      }
    }

    // Apply Word's default formatting when no explicit style
    // Per Word behavior: firstRow, firstCol, lastRow, lastCol get bold by default
    if (property === "bold" && activeConditionals.length > 0) {
      const table = cell._getParentRow()?._getParentTable();
      if (table) {
        const tblLookFlags = table.getTblLookFlags();

        // Check if cell's conditional matches enabled tblLook flags
        for (const conditionalType of activeConditionals) {
          if (conditionalType === "firstRow" && tblLookFlags.firstRow)
            return true as RunFormatting[K];
          if (conditionalType === "lastRow" && tblLookFlags.lastRow)
            return true as RunFormatting[K];
          if (conditionalType === "firstCol" && tblLookFlags.firstColumn)
            return true as RunFormatting[K];
          if (conditionalType === "lastCol" && tblLookFlags.lastColumn)
            return true as RunFormatting[K];
        }
      }
    }

    return undefined;
  }

  /**
   * Sets character style reference
   * Per ECMA-376 Part 1 §17.3.2.36
   * @param styleId - Character style ID to apply
   * @returns This run for chaining
   */
  setCharacterStyle(styleId: string): this {
    const previousValue = this.formatting.characterStyle;
    this.formatting.characterStyle = styleId;
    if (this.trackingContext?.isEnabled() && previousValue !== styleId) {
      this.trackingContext.trackRunPropertyChange(this, 'characterStyle', previousValue, styleId);
    }
    return this;
  }

  /**
   * Sets text border
   * Per ECMA-376 Part 1 §17.3.2.5
   * @param border - Border definition
   * @returns This run for chaining
   */
  setBorder(border: TextBorder): this {
    const previousValue = this.formatting.border;
    this.formatting.border = border;
    if (this.trackingContext?.isEnabled() && previousValue !== border) {
      this.trackingContext.trackRunPropertyChange(this, 'border', previousValue, border);
    }
    return this;
  }

  /**
   * Sets character shading (background)
   * Per ECMA-376 Part 1 §17.3.2.32
   * @param shading - Shading definition
   * @returns This run for chaining
   */
  setShading(shading: CharacterShading): this {
    const previousValue = this.formatting.shading;
    this.formatting.shading = shading;
    if (this.trackingContext?.isEnabled() && previousValue !== shading) {
      this.trackingContext.trackRunPropertyChange(this, 'shading', previousValue, shading);
    }
    return this;
  }

  /**
   * Sets emphasis mark
   * Per ECMA-376 Part 1 §17.3.2.13
   * @param emphasis - Emphasis mark type ('dot', 'comma', 'circle', 'underDot')
   * @returns This run for chaining
   */
  setEmphasis(emphasis: EmphasisMark): this {
    const previousValue = this.formatting.emphasis;
    this.formatting.emphasis = emphasis;
    if (this.trackingContext?.isEnabled() && previousValue !== emphasis) {
      this.trackingContext.trackRunPropertyChange(this, 'emphasis', previousValue, emphasis);
    }
    return this;
  }

  /**
   * Sets the tracking context for automatic change tracking.
   * Called by Document when track changes is enabled.
   * @internal
   */
  _setTrackingContext(context: import('../tracking/TrackingContext').TrackingContext): void {
    this.trackingContext = context;
  }

  /**
   * Sets the parent paragraph reference for this run
   * @internal Used for content tracking
   */
  _setParentParagraph(paragraph: import('./Paragraph').Paragraph): void {
    this._parentParagraph = paragraph;
  }

  /**
   * Gets the parent paragraph reference
   * @internal Used for content tracking
   */
  _getParentParagraph(): import('./Paragraph').Paragraph | undefined {
    return this._parentParagraph;
  }

  /**
   * Gets the property change revision for this run (if any)
   *
   * Property change revisions (w:rPrChange) track formatting changes to runs.
   * They contain the PREVIOUS properties before the change was made.
   *
   * @returns Property change revision or undefined if not set
   *
   * @example
   * ```typescript
   * const propChange = run.getPropertyChangeRevision();
   * if (propChange) {
   *   console.log(`Changed by ${propChange.author} on ${propChange.date}`);
   *   console.log(`Previous: ${JSON.stringify(propChange.previousProperties)}`);
   * }
   * ```
   */
  getPropertyChangeRevision(): RunPropertyChange | undefined {
    return this.propertyChangeRevision;
  }

  /**
   * Sets the property change revision for this run
   *
   * Property change revisions (w:rPrChange) are stored inside the run properties
   * element (w:rPr) and track what the previous formatting was before a change.
   * This is used for round-trip preservation of tracked changes.
   *
   * @param propChange - Property change revision data
   * @returns This run for method chaining
   *
   * @example
   * ```typescript
   * run.setPropertyChangeRevision({
   *   id: 1,
   *   author: 'John Doe',
   *   date: new Date(),
   *   previousProperties: { bold: true }
   * });
   * ```
   */
  setPropertyChangeRevision(propChange: RunPropertyChange): this {
    this.propertyChangeRevision = propChange;
    return this;
  }

  /**
   * Clears the property change revision for this run
   *
   * @returns This run for method chaining
   */
  clearPropertyChangeRevision(): this {
    this.propertyChangeRevision = undefined;
    return this;
  }

  /**
   * Checks if this run has a property change revision
   *
   * @returns True if a property change revision is set
   */
  hasPropertyChangeRevision(): boolean {
    return this.propertyChangeRevision !== undefined;
  }

  /**
   * Sets bold formatting
   *
   * Makes the text bold or removes bold formatting.
   *
   * @param bold - If true, applies bold; if false, removes bold (default: true)
   * @returns This run instance for method chaining
   *
   * @example
   * ```typescript
   * run.setBold();        // Apply bold
   * run.setBold(true);    // Apply bold
   * run.setBold(false);   // Remove bold
   * ```
   */
  setBold(bold: boolean = true): this {
    const previousValue = this.formatting.bold;
    this.formatting.bold = bold;
    if (this.trackingContext?.isEnabled() && previousValue !== bold) {
      this.trackingContext.trackRunPropertyChange(this, 'bold', previousValue, bold);
    }
    return this;
  }

  /**
   * Sets italic formatting
   *
   * Makes the text italic or removes italic formatting.
   *
   * @param italic - If true, applies italic; if false, removes italic (default: true)
   * @returns This run instance for method chaining
   *
   * @example
   * ```typescript
   * run.setItalic();       // Apply italic
   * run.setItalic(true);   // Apply italic
   * run.setItalic(false);  // Remove italic
   * ```
   */
  setItalic(italic: boolean = true): this {
    const previousValue = this.formatting.italic;
    this.formatting.italic = italic;
    if (this.trackingContext?.isEnabled() && previousValue !== italic) {
      this.trackingContext.trackRunPropertyChange(this, 'italic', previousValue, italic);
    }
    return this;
  }

  /**
   * Sets bold formatting for complex scripts (RTL languages)
   * Per ECMA-376 Part 1 §17.3.2.3
   * @param bold - Whether text is bold for complex scripts
   */
  setComplexScriptBold(bold: boolean = true): this {
    const previousValue = this.formatting.complexScriptBold;
    this.formatting.complexScriptBold = bold;
    if (this.trackingContext?.isEnabled() && previousValue !== bold) {
      this.trackingContext.trackRunPropertyChange(this, 'complexScriptBold', previousValue, bold);
    }
    return this;
  }

  /**
   * Sets italic formatting for complex scripts (RTL languages)
   * Per ECMA-376 Part 1 §17.3.2.17
   * @param italic - Whether text is italic for complex scripts
   */
  setComplexScriptItalic(italic: boolean = true): this {
    const previousValue = this.formatting.complexScriptItalic;
    this.formatting.complexScriptItalic = italic;
    if (this.trackingContext?.isEnabled() && previousValue !== italic) {
      this.trackingContext.trackRunPropertyChange(this, 'complexScriptItalic', previousValue, italic);
    }
    return this;
  }

  /**
   * Sets character spacing (letter spacing)
   * Per ECMA-376 Part 1 §17.3.2.33
   * @param spacing - Spacing in twips (1/20th of a point). Positive values expand, negative values condense.
   */
  setCharacterSpacing(spacing: number): this {
    const previousValue = this.formatting.characterSpacing;
    this.formatting.characterSpacing = spacing;
    if (this.trackingContext?.isEnabled() && previousValue !== spacing) {
      this.trackingContext.trackRunPropertyChange(this, 'characterSpacing', previousValue, spacing);
    }
    return this;
  }

  /**
   * Sets horizontal text scaling
   * Per ECMA-376 Part 1 §17.3.2.43
   * @param scaling - Scaling percentage (e.g., 200 = 200% width, 50 = 50% width). Default is 100.
   */
  setScaling(scaling: number): this {
    const previousValue = this.formatting.scaling;
    this.formatting.scaling = scaling;
    if (this.trackingContext?.isEnabled() && previousValue !== scaling) {
      this.trackingContext.trackRunPropertyChange(this, 'scaling', previousValue, scaling);
    }
    return this;
  }

  /**
   * Sets vertical text position
   * Per ECMA-376 Part 1 §17.3.2.31
   * @param position - Position in half-points. Positive values raise text, negative values lower it.
   */
  setPosition(position: number): this {
    const previousValue = this.formatting.position;
    this.formatting.position = position;
    if (this.trackingContext?.isEnabled() && previousValue !== position) {
      this.trackingContext.trackRunPropertyChange(this, 'position', previousValue, position);
    }
    return this;
  }

  /**
   * Sets kerning threshold
   * Per ECMA-376 Part 1 §17.3.2.20
   * @param kerning - Font size in half-points at which kerning starts. 0 disables kerning.
   */
  setKerning(kerning: number): this {
    const previousValue = this.formatting.kerning;
    this.formatting.kerning = kerning;
    if (this.trackingContext?.isEnabled() && previousValue !== kerning) {
      this.trackingContext.trackRunPropertyChange(this, 'kerning', previousValue, kerning);
    }
    return this;
  }

  /**
   * Sets language
   * Per ECMA-376 Part 1 §17.3.2.20
   * @param language - Language code (e.g., 'en-US', 'fr-FR', 'es-ES')
   */
  setLanguage(language: string): this {
    const previousValue = this.formatting.language;
    this.formatting.language = language;
    if (this.trackingContext?.isEnabled() && previousValue !== language) {
      this.trackingContext.trackRunPropertyChange(this, 'language', previousValue, language);
    }
    return this;
  }

  /**
   * Sets underline formatting
   *
   * Applies various underline styles or removes underlining.
   *
   * @param underline - Underline style or boolean (default: true = 'single')
   *   - true or 'single': Single underline
   *   - 'double': Double underline
   *   - 'thick': Thick underline
   *   - 'dotted': Dotted underline
   *   - 'dash': Dashed underline
   *   - false: No underline
   * @returns This run instance for method chaining
   *
   * @example
   * ```typescript
   * run.setUnderline();          // Single underline
   * run.setUnderline('double');  // Double underline
   * run.setUnderline(false);     // Remove underline
   * ```
   */
  setUnderline(underline: RunFormatting["underline"] = true): this {
    const previousValue = this.formatting.underline;
    this.formatting.underline = underline;
    if (this.trackingContext?.isEnabled() && previousValue !== underline) {
      this.trackingContext.trackRunPropertyChange(this, 'underline', previousValue, underline);
    }
    return this;
  }

  /**
   * Sets strikethrough formatting
   *
   * Adds or removes a line through the text.
   *
   * @param strike - If true, applies strikethrough; if false, removes it (default: true)
   * @returns This run instance for method chaining
   *
   * @example
   * ```typescript
   * run.setStrike();       // Apply strikethrough
   * run.setStrike(false);  // Remove strikethrough
   * ```
   */
  setStrike(strike: boolean = true): this {
    const previousValue = this.formatting.strike;
    this.formatting.strike = strike;
    if (this.trackingContext?.isEnabled() && previousValue !== strike) {
      this.trackingContext.trackRunPropertyChange(this, 'strike', previousValue, strike);
    }
    return this;
  }

  /**
   * Sets subscript formatting
   *
   * Lowers the text below the baseline (e.g., H₂O).
   * Automatically removes superscript if set.
   *
   * @param subscript - If true, applies subscript; if false, removes it (default: true)
   * @returns This run instance for method chaining
   *
   * @example
   * ```typescript
   * run.setText('H₂O');
   * run.setSubscript();  // Format as subscript
   * ```
   */
  setSubscript(subscript: boolean = true): this {
    const previousValue = this.formatting.subscript;
    this.formatting.subscript = subscript;
    if (subscript) {
      this.formatting.superscript = false;
    }
    if (this.trackingContext?.isEnabled() && previousValue !== subscript) {
      this.trackingContext.trackRunPropertyChange(this, 'subscript', previousValue, subscript);
    }
    return this;
  }

  /**
   * Sets superscript formatting
   *
   * Raises the text above the baseline (e.g., x²).
   * Automatically removes subscript if set.
   *
   * @param superscript - If true, applies superscript; if false, removes it (default: true)
   * @returns This run instance for method chaining
   *
   * @example
   * ```typescript
   * run.setText('x²');
   * run.setSuperscript();  // Format as superscript
   * ```
   */
  setSuperscript(superscript: boolean = true): this {
    const previousValue = this.formatting.superscript;
    this.formatting.superscript = superscript;
    if (superscript) {
      this.formatting.subscript = false;
    }
    if (this.trackingContext?.isEnabled() && previousValue !== superscript) {
      this.trackingContext.trackRunPropertyChange(this, 'superscript', previousValue, superscript);
    }
    return this;
  }

  /**
   * Sets font family and optionally size
   *
   * Changes the font family (typeface) and optionally the font size.
   *
   * @param font - Font family name (e.g., 'Arial', 'Times New Roman', 'Verdana')
   * @param size - Optional font size in points
   * @returns This run instance for method chaining
   *
   * @example
   * ```typescript
   * run.setFont('Arial');           // Change font only
   * run.setFont('Verdana', 14);     // Change font and size
   * ```
   */
  setFont(font: string, size?: number): this {
    const previousFont = this.formatting.font;
    const previousSize = this.formatting.size;
    this.formatting.font = font;
    if (size !== undefined) {
      this.formatting.size = size;
    }
    if (this.trackingContext?.isEnabled()) {
      if (previousFont !== font) {
        this.trackingContext.trackRunPropertyChange(this, 'font', previousFont, font);
      }
      if (size !== undefined && previousSize !== size) {
        this.trackingContext.trackRunPropertyChange(this, 'size', previousSize, size);
      }
    }
    return this;
  }

  /**
   * Sets font size
   *
   * Changes the size of the text in points.
   *
   * @param size - Font size in points (e.g., 12 for 12pt text)
   * @returns This run instance for method chaining
   *
   * @example
   * ```typescript
   * run.setSize(12);   // 12pt text
   * run.setSize(18);   // 18pt text
   * ```
   */
  setSize(size: number): this {
    const previousValue = this.formatting.size;
    this.formatting.size = size;
    if (this.trackingContext?.isEnabled() && previousValue !== size) {
      this.trackingContext.trackRunPropertyChange(this, 'size', previousValue, size);
    }
    return this;
  }

  /**
   * Sets font size for complex scripts (RTL languages like Arabic, Hebrew)
   *
   * Sets the font size used for complex script text (w:szCs element).
   * If not set, the regular size is used for both regular and complex script text.
   *
   * @param size - Font size in points for complex scripts
   * @returns This run instance for method chaining
   *
   * @example
   * ```typescript
   * run.setSize(12).setSizeCs(14);   // 12pt for regular, 14pt for complex scripts
   * ```
   */
  setSizeCs(size: number): this {
    const previousValue = this.formatting.sizeCs;
    this.formatting.sizeCs = size;
    if (this.trackingContext?.isEnabled() && previousValue !== size) {
      this.trackingContext.trackRunPropertyChange(this, 'sizeCs', previousValue, size);
    }
    return this;
  }

  /**
   * Sets text color
   *
   * Sets the foreground (text) color using hexadecimal format.
   * Color is automatically normalized to uppercase without the # prefix.
   *
   * @param color - Color in hex format (with or without # prefix)
   * @returns This run instance for method chaining
   *
   * @throws Error if color format is invalid (not 6 hex characters)
   *
   * @example
   * ```typescript
   * run.setColor('FF0000');   // Red text
   * run.setColor('#0000FF');  // Blue text (# is removed)
   * run.setColor('00FF00');   // Green text
   * ```
   */
  setColor(color: string): this {
    const previousValue = this.formatting.color;
    const normalizedColor = normalizeColor(color);
    this.formatting.color = normalizedColor;
    if (this.trackingContext?.isEnabled() && previousValue !== normalizedColor) {
      this.trackingContext.trackRunPropertyChange(this, 'color', previousValue, normalizedColor);
    }
    return this;
  }

  /**
   * Sets theme color reference for text
   *
   * Uses a color from the document's theme instead of a fixed hex value.
   * Theme colors automatically update when the document theme changes.
   *
   * @param themeColor - Theme color reference (e.g., 'accent1', 'dark1', 'hyperlink')
   * @returns This run instance for method chaining
   *
   * @example
   * ```typescript
   * run.setThemeColor('accent1');    // Use theme accent color 1
   * run.setThemeColor('hyperlink');  // Use theme hyperlink color
   * ```
   */
  setThemeColor(themeColor: ThemeColorValue): this {
    const previousValue = this.formatting.themeColor;
    this.formatting.themeColor = themeColor;
    if (this.trackingContext?.isEnabled() && previousValue !== themeColor) {
      this.trackingContext.trackRunPropertyChange(this, 'themeColor', previousValue, themeColor);
    }
    return this;
  }

  /**
   * Sets theme color tint for lighter variations
   *
   * Applied to the theme color to create a lighter shade.
   * The tint value is a percentage where 0 = no change and 255 = white.
   *
   * @param themeTint - Tint value (0-255, toward white)
   * @returns This run instance for method chaining
   *
   * @example
   * ```typescript
   * run.setThemeColor('accent1').setThemeTint(128);  // 50% tint toward white
   * ```
   */
  setThemeTint(themeTint: number): this {
    const previousValue = this.formatting.themeTint;
    this.formatting.themeTint = themeTint;
    if (this.trackingContext?.isEnabled() && previousValue !== themeTint) {
      this.trackingContext.trackRunPropertyChange(this, 'themeTint', previousValue, themeTint);
    }
    return this;
  }

  /**
   * Sets theme color shade for darker variations
   *
   * Applied to the theme color to create a darker shade.
   * The shade value is a percentage where 0 = no change and 255 = black.
   *
   * @param themeShade - Shade value (0-255, toward black)
   * @returns This run instance for method chaining
   *
   * @example
   * ```typescript
   * run.setThemeColor('accent1').setThemeShade(128);  // 50% shade toward black
   * ```
   */
  setThemeShade(themeShade: number): this {
    const previousValue = this.formatting.themeShade;
    this.formatting.themeShade = themeShade;
    if (this.trackingContext?.isEnabled() && previousValue !== themeShade) {
      this.trackingContext.trackRunPropertyChange(this, 'themeShade', previousValue, themeShade);
    }
    return this;
  }

  /**
   * Sets highlight (background) color
   *
   * Applies a background highlight color to the text, similar to using
   * a highlighter marker.
   *
   * @param highlight - Highlight color name
   *   - Standard colors: 'yellow', 'green', 'cyan', 'magenta', 'blue', 'red'
   *   - Dark variants: 'darkBlue', 'darkCyan', 'darkGreen', 'darkMagenta', 'darkRed', 'darkYellow'
   *   - Grayscale: 'darkGray', 'lightGray', 'black', 'white'
   * @returns This run instance for method chaining
   *
   * @example
   * ```typescript
   * run.setHighlight('yellow');     // Yellow highlight
   * run.setHighlight('darkGreen');  // Dark green highlight
   * ```
   */
  setHighlight(highlight: RunFormatting["highlight"]): this {
    const previousValue = this.formatting.highlight;
    this.formatting.highlight = highlight;
    if (this.trackingContext?.isEnabled() && previousValue !== highlight) {
      this.trackingContext.trackRunPropertyChange(this, 'highlight', previousValue, highlight);
    }
    return this;
  }

  /**
   * Sets small caps formatting
   *
   * Formats lowercase letters as smaller versions of capital letters.
   *
   * @param smallCaps - If true, applies small caps; if false, removes it (default: true)
   * @returns This run instance for method chaining
   *
   * @example
   * ```typescript
   * run.setText('Small Caps Text');
   * run.setSmallCaps();  // SMALL CAPS TEXT
   * ```
   */
  setSmallCaps(smallCaps: boolean = true): this {
    const previousValue = this.formatting.smallCaps;
    this.formatting.smallCaps = smallCaps;
    if (this.trackingContext?.isEnabled() && previousValue !== smallCaps) {
      this.trackingContext.trackRunPropertyChange(this, 'smallCaps', previousValue, smallCaps);
    }
    return this;
  }

  /**
   * Sets all caps formatting
   *
   * Displays all text in capital letters regardless of original case.
   *
   * @param allCaps - If true, applies all caps; if false, removes it (default: true)
   * @returns This run instance for method chaining
   *
   * @example
   * ```typescript
   * run.setText('All Caps Text');
   * run.setAllCaps();  // ALL CAPS TEXT
   * ```
   */
  setAllCaps(allCaps: boolean = true): this {
    const previousValue = this.formatting.allCaps;
    this.formatting.allCaps = allCaps;
    if (this.trackingContext?.isEnabled() && previousValue !== allCaps) {
      this.trackingContext.trackRunPropertyChange(this, 'allCaps', previousValue, allCaps);
    }
    return this;
  }

  /**
   * Sets outline text effect
   * @param outline - Whether to apply outline effect (default: true)
   * @returns This run for method chaining
   */
  setOutline(outline: boolean = true): this {
    const previousValue = this.formatting.outline;
    this.formatting.outline = outline;
    if (this.trackingContext?.isEnabled() && previousValue !== outline) {
      this.trackingContext.trackRunPropertyChange(this, 'outline', previousValue, outline);
    }
    return this;
  }

  /**
   * Sets shadow text effect
   * @param shadow - Whether to apply shadow effect (default: true)
   * @returns This run for method chaining
   */
  setShadow(shadow: boolean = true): this {
    const previousValue = this.formatting.shadow;
    this.formatting.shadow = shadow;
    if (this.trackingContext?.isEnabled() && previousValue !== shadow) {
      this.trackingContext.trackRunPropertyChange(this, 'shadow', previousValue, shadow);
    }
    return this;
  }

  /**
   * Sets emboss text effect
   * @param emboss - Whether to apply emboss effect (default: true)
   * @returns This run for method chaining
   */
  setEmboss(emboss: boolean = true): this {
    const previousValue = this.formatting.emboss;
    this.formatting.emboss = emboss;
    if (this.trackingContext?.isEnabled() && previousValue !== emboss) {
      this.trackingContext.trackRunPropertyChange(this, 'emboss', previousValue, emboss);
    }
    return this;
  }

  /**
   * Sets imprint/engrave text effect
   * @param imprint - Whether to apply imprint effect (default: true)
   * @returns This run for method chaining
   */
  setImprint(imprint: boolean = true): this {
    const previousValue = this.formatting.imprint;
    this.formatting.imprint = imprint;
    if (this.trackingContext?.isEnabled() && previousValue !== imprint) {
      this.trackingContext.trackRunPropertyChange(this, 'imprint', previousValue, imprint);
    }
    return this;
  }

  /**
   * Sets right-to-left text direction
   * @param rtl - Whether text is RTL (default: true)
   * @returns This run for method chaining
   */
  setRTL(rtl: boolean = true): this {
    const previousValue = this.formatting.rtl;
    this.formatting.rtl = rtl;
    if (this.trackingContext?.isEnabled() && previousValue !== rtl) {
      this.trackingContext.trackRunPropertyChange(this, 'rtl', previousValue, rtl);
    }
    return this;
  }

  /**
   * Sets hidden/vanish text
   * @param vanish - Whether text is hidden (default: true)
   * @returns This run for method chaining
   */
  setVanish(vanish: boolean = true): this {
    const previousValue = this.formatting.vanish;
    this.formatting.vanish = vanish;
    if (this.trackingContext?.isEnabled() && previousValue !== vanish) {
      this.trackingContext.trackRunPropertyChange(this, 'vanish', previousValue, vanish);
    }
    return this;
  }

  /**
   * Sets no proofing (skip spell/grammar check)
   * @param noProof - Whether to skip proofing (default: true)
   * @returns This run for method chaining
   */
  setNoProof(noProof: boolean = true): this {
    const previousValue = this.formatting.noProof;
    this.formatting.noProof = noProof;
    if (this.trackingContext?.isEnabled() && previousValue !== noProof) {
      this.trackingContext.trackRunPropertyChange(this, 'noProof', previousValue, noProof);
    }
    return this;
  }

  /**
   * Sets snap to grid alignment
   * @param snapToGrid - Whether to snap to grid (default: true)
   * @returns This run for method chaining
   */
  setSnapToGrid(snapToGrid: boolean = true): this {
    const previousValue = this.formatting.snapToGrid;
    this.formatting.snapToGrid = snapToGrid;
    if (this.trackingContext?.isEnabled() && previousValue !== snapToGrid) {
      this.trackingContext.trackRunPropertyChange(this, 'snapToGrid', previousValue, snapToGrid);
    }
    return this;
  }

  /**
   * Sets special vanish (hidden for specific scenarios like TOC)
   * @param specVanish - Whether to apply special vanish (default: true)
   * @returns This run for method chaining
   */
  setSpecVanish(specVanish: boolean = true): this {
    const previousValue = this.formatting.specVanish;
    this.formatting.specVanish = specVanish;
    if (this.trackingContext?.isEnabled() && previousValue !== specVanish) {
      this.trackingContext.trackRunPropertyChange(this, 'specVanish', previousValue, specVanish);
    }
    return this;
  }

  /**
   * Sets text effect/animation
   * @param effect - Effect type (e.g., 'shimmer', 'sparkleText')
   * @returns This run for method chaining
   */
  setEffect(
    effect:
      | "none"
      | "lights"
      | "blinkBackground"
      | "sparkleText"
      | "marchingBlackAnts"
      | "marchingRedAnts"
      | "shimmer"
      | "antsBlack"
      | "antsRed"
  ): this {
    const previousValue = this.formatting.effect;
    this.formatting.effect = effect;
    if (this.trackingContext?.isEnabled() && previousValue !== effect) {
      this.trackingContext.trackRunPropertyChange(this, 'effect', previousValue, effect);
    }
    return this;
  }

  /**
   * Sets fit text to width
   * @param width - Width in twips (1/20th of a point)
   * @returns This run for method chaining
   */
  setFitText(width: number): this {
    const previousValue = this.formatting.fitText;
    this.formatting.fitText = width;
    if (this.trackingContext?.isEnabled() && previousValue !== width) {
      this.trackingContext.trackRunPropertyChange(this, 'fitText', previousValue, width);
    }
    return this;
  }

  /**
   * Sets East Asian typography layout
   * @param layout - East Asian layout options
   * @returns This run for method chaining
   */
  setEastAsianLayout(layout: EastAsianLayout): this {
    const previousValue = this.formatting.eastAsianLayout;
    this.formatting.eastAsianLayout = layout;
    if (this.trackingContext?.isEnabled() && previousValue !== layout) {
      this.trackingContext.trackRunPropertyChange(this, 'eastAsianLayout', previousValue, layout);
    }
    return this;
  }

  /**
   * Converts the run to WordprocessingML XML element
   *
   * **ECMA-376 Compliance:** Properties are generated in the order specified by
   * ECMA-376 Part 1 §17.3.2.28 to ensure strict OpenXML conformance.
   *
   * Per spec, the order is:
   * 1. rFonts (font family)
   * 2. b (bold)
   * 3. i (italic)
   * 4. caps/smallCaps (capitalization)
   * 5. strike/dstrike (strikethrough)
   * 6. u (underline)
   * 7. sz/szCs (font size)
   * 8. color (text color)
   * 9. highlight (highlight color)
   * 10. vertAlign (subscript/superscript)
   *
   * @returns XMLElement representing the run
   */
  toXML(): XMLElement {
    // Get text for diagnostic logging (backward compatibility)
    const text = this.getText();

    // Diagnostic logging before serialization
    logSerialization(`Serializing run: "${text}"`, {
      rtl: this.formatting.rtl || false,
    });
    if (this.formatting.rtl) {
      logTextDirection(`Run with RTL being serialized: "${text}"`);
    }

    // Build the run element
    const runChildren: XMLElement[] = [];

    // Add run properties using the static helper
    const rPr = Run.generateRunPropertiesXML(this.formatting);
    if (rPr || this.propertyChangeRevision) {
      // If we have a property change revision, we need to add w:rPrChange to the w:rPr element
      // Per ECMA-376, w:rPrChange must come after all other run properties
      const rPrElement = rPr || { name: 'w:rPr', attributes: {}, children: [] };

      if (this.propertyChangeRevision) {
        // Build w:rPrChange element
        const rPrChangeChildren: XMLElement[] = [];

        // Build previous properties as w:rPr child
        const prevPropChildren: XMLElement[] = [];
        const prevProps = this.propertyChangeRevision.previousProperties;

        if (prevProps) {
          // Generate XML for each previous property
          if (prevProps.bold) {
            prevPropChildren.push(XMLBuilder.wSelf("b", { "w:val": "1" }));
          }
          if (prevProps.italic) {
            prevPropChildren.push(XMLBuilder.wSelf("i", { "w:val": "1" }));
          }
          if (prevProps.underline) {
            const underlineValue = typeof prevProps.underline === 'string'
              ? prevProps.underline : 'single';
            prevPropChildren.push(XMLBuilder.wSelf("u", { "w:val": underlineValue }));
          }
          if (prevProps.strike) {
            prevPropChildren.push(XMLBuilder.wSelf("strike", { "w:val": "1" }));
          }
          if (prevProps.font) {
            prevPropChildren.push(XMLBuilder.wSelf("rFonts", {
              "w:ascii": prevProps.font,
              "w:hAnsi": prevProps.font,
              "w:cs": prevProps.font,
            }));
          }
          if (prevProps.size) {
            const halfPoints = Math.round(prevProps.size * 2);
            prevPropChildren.push(XMLBuilder.wSelf("sz", { "w:val": halfPoints.toString() }));
            prevPropChildren.push(XMLBuilder.wSelf("szCs", { "w:val": halfPoints.toString() }));
          }
          if (prevProps.color) {
            prevPropChildren.push(XMLBuilder.wSelf("color", { "w:val": prevProps.color }));
          }
          if (prevProps.highlight) {
            prevPropChildren.push(XMLBuilder.wSelf("highlight", { "w:val": prevProps.highlight }));
          }
          if (prevProps.subscript) {
            prevPropChildren.push(XMLBuilder.wSelf("vertAlign", { "w:val": "subscript" }));
          }
          if (prevProps.superscript) {
            prevPropChildren.push(XMLBuilder.wSelf("vertAlign", { "w:val": "superscript" }));
          }
          if (prevProps.smallCaps) {
            prevPropChildren.push(XMLBuilder.wSelf("smallCaps", { "w:val": "1" }));
          }
          if (prevProps.allCaps) {
            prevPropChildren.push(XMLBuilder.wSelf("caps", { "w:val": "1" }));
          }
        }

        // Only add w:rPr if there are previous properties
        if (prevPropChildren.length > 0) {
          rPrChangeChildren.push({
            name: 'w:rPr',
            attributes: {},
            children: prevPropChildren,
          });
        }

        // Create w:rPrChange element with attributes
        const rPrChange: XMLElement = {
          name: 'w:rPrChange',
          attributes: {
            'w:id': this.propertyChangeRevision.id.toString(),
            'w:author': this.propertyChangeRevision.author,
            'w:date': this.propertyChangeRevision.date.toISOString(),
          },
          children: rPrChangeChildren,
        };

        // Add rPrChange to rPr children (must come last per ECMA-376)
        if (rPrElement.children) {
          rPrElement.children.push(rPrChange);
        } else {
          rPrElement.children = [rPrChange];
        }
      }

      runChildren.push(rPrElement);
    }

    // Add run content elements (text, tabs, breaks, etc.) in order
    for (const contentElement of this.content) {
      switch (contentElement.type) {
        case "text":
          // Always generate <w:t> element, even for empty strings
          // This ensures proper Word compatibility and round-trip preservation
          runChildren.push(
            XMLBuilder.w(
              "t",
              {
                "xml:space": "preserve",
              },
              [contentElement.value || ""]
            )
          );
          break;

        case "tab":
          runChildren.push(XMLBuilder.wSelf("tab"));
          break;

        case "break":
          {
            const attrs: Record<string, string> = {};
            if (contentElement.breakType) {
              attrs["w:type"] = contentElement.breakType;
            }
            runChildren.push(
              XMLBuilder.wSelf(
                "br",
                Object.keys(attrs).length > 0 ? attrs : undefined
              )
            );
          }
          break;

        case "carriageReturn":
          runChildren.push(XMLBuilder.wSelf("cr"));
          break;

        case "softHyphen":
          runChildren.push(XMLBuilder.wSelf("softHyphen"));
          break;

        case "noBreakHyphen":
          runChildren.push(XMLBuilder.wSelf("noBreakHyphen"));
          break;

        case "instructionText":
          runChildren.push(
            XMLBuilder.w("instrText", { "xml:space": "preserve" }, [
              contentElement.value || "",
            ])
          );
          break;

        case "fieldChar": {
          if (!contentElement.fieldCharType) {
            break;
          }
          const attrs: Record<string, string> = {
            "w:fldCharType": contentElement.fieldCharType,
          };
          if (contentElement.fieldCharDirty !== undefined) {
            attrs["w:dirty"] = contentElement.fieldCharDirty ? "1" : "0";
          }
          if (contentElement.fieldCharLocked !== undefined) {
            attrs["w:fldLock"] = contentElement.fieldCharLocked ? "1" : "0";
          }
          runChildren.push(
            XMLBuilder.wSelf(
              "fldChar",
              Object.keys(attrs).length > 0 ? attrs : undefined
            )
          );
          break;
        }

        case "vml":
          // VML graphics (w:pict) - include raw XML without modification
          // This preserves legacy Word graphics like icons and symbols
          if (contentElement.rawXml) {
            // Use special __rawXml element name for passthrough (no wrapper element)
            runChildren.push({
              name: "__rawXml",
              rawXml: contentElement.rawXml,
            });
          }
          break;
      }
    }

    return XMLBuilder.w("r", undefined, runChildren);
  }

  /**
   * Checks if the run contains non-empty text
   *
   * @returns True if the run has text content with length > 0
   *
   * @example
   * ```typescript
   * const run1 = new Run('Hello');
   * const run2 = new Run('');
   * console.log(run1.hasText()); // true
   * console.log(run2.hasText()); // false
   * ```
   */
  hasText(): boolean {
    const text = this.getText();
    return text.length > 0;
  }

  /**
   * Checks if the run has any formatting properties
   *
   * @returns True if any formatting properties (bold, italic, font, etc.) are set
   *
   * @example
   * ```typescript
   * const run1 = new Run('Text', { bold: true });
   * const run2 = new Run('Text');
   * console.log(run1.hasFormatting()); // true
   * console.log(run2.hasFormatting()); // false
   * ```
   */
  hasFormatting(): boolean {
    return Object.keys(this.formatting).length > 0;
  }

  /**
   * Checks if the run is valid
   *
   * A run is considered valid if it has either text content or formatting.
   * An empty run with no formatting is invalid.
   *
   * @returns True if the run has text content or formatting properties
   *
   * @example
   * ```typescript
   * const run1 = new Run('Text');
   * const run2 = new Run('', { bold: true });
   * const run3 = new Run('');
   * console.log(run1.isValid()); // true (has text)
   * console.log(run2.isValid()); // true (has formatting)
   * console.log(run3.isValid()); // false (empty and unformatted)
   * ```
   */
  isValid(): boolean {
    return this.hasText() || this.hasFormatting();
  }

  /**
   * Gets the run content elements
   *
   * Returns the internal content structure including text elements,
   * tabs, breaks, and other special characters.
   *
   * @returns Array of RunContent elements
   *
   * @example
   * ```typescript
   * const content = run.getContent();
   * for (const element of content) {
   *   console.log(`Type: ${element.type}, Value: ${element.value || 'N/A'}`);
   * }
   * ```
   */
  getContent(): RunContent[] {
    return [...this.content];
  }

  /**
   * Adds a tab character to the run
   *
   * Inserts a tab character, commonly used in TOC entries to separate
   * heading text from page numbers, or for general text alignment.
   *
   * @returns This run instance for method chaining
   *
   * @example
   * ```typescript
   * const run = new Run('Heading');
   * run.addTab();
   * run.appendText('Page 5'); // "Heading\tPage 5"
   * ```
   */
  addTab(): this {
    this.content.push({ type: "tab" });
    return this;
  }

  /**
   * Adds a line, page, or column break to the run
   *
   * Inserts a break element for line breaks, page breaks, or column breaks.
   *
   * @param breakType - Type of break (default: line break if not specified)
   *   - undefined or 'textWrapping': Line break (like pressing Enter within a paragraph)
   *   - 'page': Page break
   *   - 'column': Column break
   * @returns This run instance for method chaining
   *
   * @example
   * ```typescript
   * run.addBreak();          // Line break
   * run.addBreak('page');    // Page break
   * run.addBreak('column');  // Column break
   * ```
   */
  addBreak(breakType?: BreakType): this {
    this.content.push({ type: "break", breakType });
    return this;
  }

  /**
   * Appends text to the run
   *
   * Adds additional text as a new content element without replacing
   * existing content. Useful for building text incrementally.
   *
   * @param text - Text to append
   * @returns This run instance for method chaining
   *
   * @example
   * ```typescript
   * const run = new Run('Hello');
   * run.appendText(' ');
   * run.appendText('World');  // "Hello World"
   * ```
   */
  appendText(text: string): this {
    if (text) {
      this.content.push({ type: "text", value: text });
    }
    return this;
  }

  /**
   * Adds a carriage return to the run
   * @returns This run for method chaining
   */
  addCarriageReturn(): this {
    this.content.push({ type: "carriageReturn" });
    return this;
  }

  /**
   * Creates a Run from an array of content elements
   * Factory method for advanced use cases (used by DocumentParser)
   * @param content - Array of run content elements
   * @param formatting - Run formatting options
   * @returns New Run instance
   */
  static createFromContent(
    content: RunContent[],
    formatting: RunFormatting = {}
  ): Run {
    const run = Object.create(Run.prototype) as Run;
    run.content = content;
    const { cleanXmlFromText, ...displayFormatting } = formatting;
    run.formatting = displayFormatting;
    return run;
  }

  /**
   * Generates run properties XML (<w:rPr>) from RunFormatting
   * This is a static helper used by both Run and Paragraph (for paragraph mark properties)
   *
   * Per ECMA-376 Part 1 §17.3.2.28, properties must be in specific order for strict compliance
   *
   * @param formatting - Run formatting options
   * @returns XMLElement representing <w:rPr> or null if no formatting
   */
  static generateRunPropertiesXML(
    formatting: RunFormatting
  ): XMLElement | null {
    const rPrChildren: XMLElement[] = [];

    // 1. Character style reference (must be absolutely first per ECMA-376 §17.3.2.36)
    if (formatting.characterStyle) {
      rPrChildren.push(
        XMLBuilder.wSelf("rStyle", {
          "w:val": formatting.characterStyle,
        })
      );
    }

    // 2. Font family (must be second per ECMA-376 §17.3.2.28)
    if (formatting.font) {
      rPrChildren.push(
        XMLBuilder.wSelf("rFonts", {
          "w:ascii": formatting.font,
          "w:hAnsi": formatting.font,
          "w:cs": formatting.font,
        })
      );
    }

    // 2.5. Text border (w:bdr) per ECMA-376 Part 1 §17.3.2.5
    if (formatting.border) {
      const bdrAttrs: Record<string, string | number> = {};
      if (formatting.border.style) bdrAttrs["w:val"] = formatting.border.style;
      if (formatting.border.size !== undefined)
        bdrAttrs["w:sz"] = formatting.border.size;
      if (formatting.border.color)
        bdrAttrs["w:color"] = formatting.border.color;
      if (formatting.border.space !== undefined)
        bdrAttrs["w:space"] = formatting.border.space;

      if (Object.keys(bdrAttrs).length > 0) {
        rPrChildren.push(XMLBuilder.wSelf("bdr", bdrAttrs));
      }
    }

    // 3. Bold
    if (formatting.bold) {
      rPrChildren.push(XMLBuilder.wSelf("b", { "w:val": "1" }));
    }

    // 3.5. Bold for complex scripts (w:bCs) per ECMA-376 Part 1 §17.3.2.3
    if (formatting.complexScriptBold) {
      rPrChildren.push(XMLBuilder.wSelf("bCs", { "w:val": "1" }));
    }

    // 4. Italic
    if (formatting.italic) {
      rPrChildren.push(XMLBuilder.wSelf("i", { "w:val": "1" }));
    }

    // 4.5. Italic for complex scripts (w:iCs) per ECMA-376 Part 1 §17.3.2.17
    if (formatting.complexScriptItalic) {
      rPrChildren.push(XMLBuilder.wSelf("iCs", { "w:val": "1" }));
    }

    // 5. Capitalization (caps/smallCaps)
    if (formatting.allCaps) {
      rPrChildren.push(XMLBuilder.wSelf("caps", { "w:val": "1" }));
    }
    if (formatting.smallCaps) {
      rPrChildren.push(XMLBuilder.wSelf("smallCaps", { "w:val": "1" }));
    }

    // 6. Character shading (w:shd) per ECMA-376 Part 1 §17.3.2.32
    if (formatting.shading) {
      const shdAttrs: Record<string, string> = {};
      if (formatting.shading.val) shdAttrs["w:val"] = formatting.shading.val;
      if (formatting.shading.fill) shdAttrs["w:fill"] = formatting.shading.fill;
      if (formatting.shading.color)
        shdAttrs["w:color"] = formatting.shading.color;

      if (Object.keys(shdAttrs).length > 0) {
        rPrChildren.push(XMLBuilder.wSelf("shd", shdAttrs));
      }
    }

    // 6.5. Emphasis marks (w:em) per ECMA-376 Part 1 §17.3.2.13
    if (formatting.emphasis) {
      rPrChildren.push(
        XMLBuilder.wSelf("em", { "w:val": formatting.emphasis })
      );
    }

    // 6.6. Outline text effect (w:outline) per ECMA-376 Part 1 §17.3.2.23
    if (formatting.outline) {
      rPrChildren.push(XMLBuilder.wSelf("outline", { "w:val": "1" }));
    }

    // 6.7. Shadow text effect (w:shadow) per ECMA-376 Part 1 §17.3.2.32
    if (formatting.shadow) {
      rPrChildren.push(XMLBuilder.wSelf("shadow", { "w:val": "1" }));
    }

    // 6.8. Emboss text effect (w:emboss) per ECMA-376 Part 1 §17.3.2.13
    if (formatting.emboss) {
      rPrChildren.push(XMLBuilder.wSelf("emboss", { "w:val": "1" }));
    }

    // 6.9. Imprint/engrave text effect (w:imprint) per ECMA-376 Part 1 §17.3.2.18
    if (formatting.imprint) {
      rPrChildren.push(XMLBuilder.wSelf("imprint", { "w:val": "1" }));
    }

    // 6.10. No proofing (w:noProof) per ECMA-376 Part 1 §17.3.2.21
    if (formatting.noProof) {
      rPrChildren.push(XMLBuilder.wSelf("noProof", { "w:val": "1" }));
    }

    // 6.11. Snap to grid (w:snapToGrid) per ECMA-376 Part 1 §17.3.2.35
    if (formatting.snapToGrid) {
      rPrChildren.push(XMLBuilder.wSelf("snapToGrid", { "w:val": "1" }));
    }

    // 6.12. Vanish/hidden (w:vanish) per ECMA-376 Part 1 §17.3.2.42
    if (formatting.vanish) {
      rPrChildren.push(XMLBuilder.wSelf("vanish", { "w:val": "1" }));
    }

    // 6.12.5. Special vanish (w:specVanish) per ECMA-376 Part 1 §17.3.2.36
    if (formatting.specVanish) {
      rPrChildren.push(XMLBuilder.wSelf("specVanish", { "w:val": "1" }));
    }

    // 6.13. RTL text (w:rtl) per ECMA-376 Part 1 §17.3.2.30
    // FIX: Must include w:val="1" to explicitly enable RTL, otherwise Word interprets empty tag incorrectly
    if (formatting.rtl) {
      rPrChildren.push(XMLBuilder.wSelf("rtl", { "w:val": "1" }));
    }

    // 7. Strikethrough
    if (formatting.strike) {
      rPrChildren.push(XMLBuilder.wSelf("strike", { "w:val": "1" }));
    }
    if (formatting.dstrike) {
      rPrChildren.push(XMLBuilder.wSelf("dstrike", { "w:val": "1" }));
    }

    // 8. Underline
    // When a character style is applied (e.g., Hyperlink) and underline is explicitly false,
    // we need to output <w:u w:val="none"/> to prevent the style's underline from being inherited.
    // Without this, setting underline=false on a run with characterStyle="Hyperlink" would
    // result in no w:u element, causing the Hyperlink style's underline to apply.
    if (formatting.underline) {
      const underlineValue =
        typeof formatting.underline === "string"
          ? formatting.underline
          : "single";
      rPrChildren.push(XMLBuilder.wSelf("u", { "w:val": underlineValue }));
    } else if (formatting.underline === false && formatting.characterStyle) {
      // Explicit "no underline" to override character style that may have underline
      rPrChildren.push(XMLBuilder.wSelf("u", { "w:val": "none" }));
    }

    // 8.5. Character spacing (w:spacing) per ECMA-376 Part 1 §17.3.2.33
    if (formatting.characterSpacing !== undefined) {
      rPrChildren.push(
        XMLBuilder.wSelf("spacing", { "w:val": formatting.characterSpacing })
      );
    }

    // 8.6. Horizontal scaling (w:w) per ECMA-376 Part 1 §17.3.2.43
    if (formatting.scaling !== undefined) {
      rPrChildren.push(XMLBuilder.wSelf("w", { "w:val": formatting.scaling }));
    }

    // 8.7. Vertical position (w:position) per ECMA-376 Part 1 §17.3.2.31
    if (formatting.position !== undefined) {
      rPrChildren.push(
        XMLBuilder.wSelf("position", { "w:val": formatting.position })
      );
    }

    // 8.8. Kerning (w:kern) per ECMA-376 Part 1 §17.3.2.20
    if (formatting.kerning !== undefined && formatting.kerning !== null) {
      rPrChildren.push(
        XMLBuilder.wSelf("kern", { "w:val": formatting.kerning })
      );
    }

    // 8.9. Language (w:lang) per ECMA-376 Part 1 §17.3.2.20
    if (formatting.language) {
      rPrChildren.push(
        XMLBuilder.wSelf("lang", { "w:val": formatting.language })
      );
    }

    // 8.9.5. East Asian layout (w:eastAsianLayout) per ECMA-376 Part 1 §17.3.2.10
    if (formatting.eastAsianLayout) {
      const layout = formatting.eastAsianLayout;
      const attrs: Record<string, string | number> = {};
      if (layout.id !== undefined) attrs["w:id"] = layout.id;
      if (layout.vert) attrs["w:vert"] = "1";
      if (layout.vertCompress) attrs["w:vertCompress"] = "1";
      if (layout.combine) attrs["w:combine"] = "1";
      if (layout.combineBrackets)
        attrs["w:combineBrackets"] = layout.combineBrackets;

      if (Object.keys(attrs).length > 0) {
        rPrChildren.push(XMLBuilder.wSelf("eastAsianLayout", attrs));
      }
    }

    // 8.10. Fit text to width (w:fitText) per ECMA-376 Part 1 §17.3.2.15
    if (formatting.fitText !== undefined) {
      rPrChildren.push(
        XMLBuilder.wSelf("fitText", { "w:val": formatting.fitText })
      );
    }

    // 8.11. Text effect/animation (w:effect) per ECMA-376 Part 1 §17.3.2.12
    if (formatting.effect) {
      rPrChildren.push(
        XMLBuilder.wSelf("effect", { "w:val": formatting.effect })
      );
    }

    // 9. Font size (w:sz for regular text, w:szCs for complex scripts)
    // Per ECMA-376 Part 1 §17.3.2.39 (sz) and §17.3.2.40 (szCs)
    if (formatting.size !== undefined) {
      // Word uses half-points (size * 2)
      const halfPoints = formatting.size * 2;
      rPrChildren.push(XMLBuilder.wSelf("sz", { "w:val": halfPoints }));
      // Use sizeCs if specified, otherwise fall back to size for backwards compatibility
      const csHalfPoints = formatting.sizeCs !== undefined ? formatting.sizeCs * 2 : halfPoints;
      rPrChildren.push(XMLBuilder.wSelf("szCs", { "w:val": csHalfPoints }));
    } else if (formatting.sizeCs !== undefined) {
      // Only complex script size specified (unusual but valid)
      const csHalfPoints = formatting.sizeCs * 2;
      rPrChildren.push(XMLBuilder.wSelf("szCs", { "w:val": csHalfPoints }));
    }

    // 10. Text color (per ECMA-376 Part 1 Section 17.3.2.6)
    // Supports both hex colors and theme color references
    if (formatting.color || formatting.themeColor) {
      const colorAttrs: Record<string, string> = {};

      if (formatting.color) {
        colorAttrs["w:val"] = formatting.color;
      }
      if (formatting.themeColor) {
        colorAttrs["w:themeColor"] = formatting.themeColor;
      }
      if (formatting.themeTint !== undefined) {
        // Convert to hex string (2 characters, uppercase)
        colorAttrs["w:themeTint"] = formatting.themeTint
          .toString(16)
          .toUpperCase()
          .padStart(2, "0");
      }
      if (formatting.themeShade !== undefined) {
        // Convert to hex string (2 characters, uppercase)
        colorAttrs["w:themeShade"] = formatting.themeShade
          .toString(16)
          .toUpperCase()
          .padStart(2, "0");
      }

      rPrChildren.push(XMLBuilder.wSelf("color", colorAttrs));
    }

    // 11. Highlight color
    if (formatting.highlight) {
      rPrChildren.push(
        XMLBuilder.wSelf("highlight", { "w:val": formatting.highlight })
      );
    }

    // 12. Vertical alignment (subscript/superscript) - must be last
    if (formatting.subscript) {
      rPrChildren.push(XMLBuilder.wSelf("vertAlign", { "w:val": "subscript" }));
    }
    if (formatting.superscript) {
      rPrChildren.push(
        XMLBuilder.wSelf("vertAlign", { "w:val": "superscript" })
      );
    }

    // Return null if no properties (prevents empty <w:rPr/> elements)
    if (rPrChildren.length === 0) {
      return null;
    }

    return XMLBuilder.w("rPr", undefined, rPrChildren);
  }

  /**
   * Creates a new Run instance
   *
   * Factory method for creating a Run with text and optional formatting.
   *
   * @param text - The text content
   * @param formatting - Optional formatting to apply
   * @returns New Run instance
   *
   * @example
   * ```typescript
   * const run = Run.create('Hello World');
   * const boldRun = Run.create('Bold Text', { bold: true });
   * ```
   */
  static create(text: string, formatting?: RunFormatting): Run {
    return new Run(text, formatting);
  }

  /**
   * Creates a deep clone of this run
   * @returns New Run instance with copied text and formatting
   * @example
   * ```typescript
   * const original = new Run('Hello', { bold: true });
   * const copy = original.clone();
   * copy.setText('World');  // Original unchanged
   * ```
   */
  clone(): Run {
    // Deep copy content and formatting to avoid shared references
    const clonedContent: RunContent[] = deepClone(this.content);
    const clonedFormatting: RunFormatting = deepClone(this.formatting);
    return Run.createFromContent(clonedContent, clonedFormatting);
  }

  /**
   * Inserts text at a specific position
   * NOTE: This flattens run content (loses tabs/breaks). Use with caution.
   * @param index - Position to insert at (0-based)
   * @param text - Text to insert
   * @returns This run for chaining
   * @example
   * ```typescript
   * const run = new Run('Hello World');
   * run.insertText(6, 'Beautiful ');  // "Hello Beautiful World"
   * ```
   */
  insertText(index: number, text: string): this {
    const currentText = this.getText();
    if (index < 0) index = 0;
    if (index > currentText.length) index = currentText.length;

    const newText =
      currentText.slice(0, index) + text + currentText.slice(index);
    this.setText(newText);
    return this;
  }

  /**
   * Replaces text in a specific range
   * NOTE: This flattens run content (loses tabs/breaks). Use with caution.
   * @param start - Start position (0-based, inclusive)
   * @param end - End position (0-based, exclusive)
   * @param text - Replacement text
   * @returns This run for chaining
   * @example
   * ```typescript
   * const run = new Run('Hello World');
   * run.replaceText(0, 5, 'Hi');  // "Hi World"
   * ```
   */
  replaceText(start: number, end: number, text: string): this {
    const currentText = this.getText();
    if (start < 0) start = 0;
    if (end > currentText.length) end = currentText.length;
    if (start > end) [start, end] = [end, start]; // Swap if reversed

    const newText = currentText.slice(0, start) + text + currentText.slice(end);
    this.setText(newText);
    return this;
  }

  /**
   * Clears run formatting properties that conflict with a style definition.
   * Uses smart clearing: only removes properties that DIFFER from the style.
   * Preserves properties not defined in the style (e.g., if style doesn't define bold, keeps run's bold).
   *
   * This is critical for allowing style definitions to apply properly, as direct formatting
   * in document.xml ALWAYS overrides style definitions in styles.xml per ECMA-376 §17.7.2.
   *
   * @param styleRunFormatting - Run formatting from the style definition to compare against
   * @returns This run for method chaining
   * @example
   * ```typescript
   * // Style says: black, 14pt Verdana
   * // Run has: red, 12pt Arial, bold
   * run.clearFormattingConflicts({
   *   color: '000000',
   *   size: 14,
   *   font: 'Verdana'
   * });
   * // Result: Run keeps bold (not in style), but color/size/font are cleared
   * ```
   */
  clearFormattingConflicts(styleRunFormatting: RunFormatting): this {
    // For each property in run's formatting, check if it conflicts with style
    const conflictingProperties: (keyof RunFormatting)[] = [];

    // Compare each property
    for (const key in this.formatting) {
      const propKey = key as keyof RunFormatting;

      // Skip if style doesn't define this property (preserve run's property)
      if (styleRunFormatting[propKey] === undefined) {
        continue;
      }

      // If style defines this property AND run's value differs, it's a conflict
      if (this.formatting[propKey] !== styleRunFormatting[propKey]) {
        conflictingProperties.push(propKey);
      }
    }

    // Clear conflicting properties
    for (const prop of conflictingProperties) {
      delete this.formatting[prop];
    }

    return this;
  }

  /**
   * Clears all formatting from this run
   *
   * Removes all direct formatting properties, leaving only the text content.
   * This is useful for applying clean styles without formatting overrides.
   *
   * @returns This run for chaining
   * @example
   * ```typescript
   * run.clearFormatting();
   * ```
   */
  clearFormatting(): this {
    this.formatting = {};
    return this;
  }
}
