/**
 * CommonTypes - Consolidated type definitions for docxmlater elements
 *
 * This file consolidates duplicate type definitions that were scattered across multiple
 * element files (Paragraph.ts, Run.ts, Table.ts, TableCell.ts, TableRow.ts, Image.ts, Section.ts).
 *
 * Benefits:
 * - Single source of truth for shared types
 * - Consistent type definitions across all elements
 * - Easier maintenance and updates
 * - Better type safety when passing values between elements
 *
 * @module CommonTypes
 */

// ============================================================================
// SHADING PATTERNS
// ============================================================================

/**
 * Shading pattern types per ECMA-376 Part 1 Section 17.18.78 (ST_Shd)
 *
 * Consolidated from: Paragraph.ts, Run.ts, TableRow.ts, TableCell.ts
 * This is the complete set of shading patterns supported by Word.
 */
export type ShadingPattern =
  // Solid patterns
  | "clear" // No pattern (transparent)
  | "solid" // Solid fill
  // Stripe patterns
  | "horzStripe" // Horizontal stripes
  | "vertStripe" // Vertical stripes
  | "reverseDiagStripe" // Reverse diagonal stripes (/)
  | "diagStripe" // Diagonal stripes (\)
  // Cross patterns
  | "horzCross" // Horizontal cross-hatch
  | "diagCross" // Diagonal cross-hatch
  // Thin stripe patterns
  | "thinHorzStripe" // Thin horizontal stripes
  | "thinVertStripe" // Thin vertical stripes
  | "thinReverseDiagStripe" // Thin reverse diagonal stripes
  | "thinDiagStripe" // Thin diagonal stripes
  // Thin cross patterns
  | "thinHorzCross" // Thin horizontal cross-hatch
  | "thinDiagCross" // Thin diagonal cross-hatch
  // Percentage fill patterns (5% increments with some extras)
  | "pct5"
  | "pct10"
  | "pct12"
  | "pct15"
  | "pct20"
  | "pct25"
  | "pct30"
  | "pct35"
  | "pct37"
  | "pct40"
  | "pct45"
  | "pct50"
  | "pct55"
  | "pct60"
  | "pct62"
  | "pct65"
  | "pct70"
  | "pct75"
  | "pct80"
  | "pct85"
  | "pct87"
  | "pct90"
  | "pct95";

/**
 * Basic shading patterns (without percentage fills)
 * Use this for contexts where percentage patterns are not needed
 */
export type BasicShadingPattern =
  | "clear"
  | "solid"
  | "horzStripe"
  | "vertStripe"
  | "reverseDiagStripe"
  | "diagStripe"
  | "horzCross"
  | "diagCross"
  | "thinHorzStripe"
  | "thinVertStripe"
  | "thinReverseDiagStripe"
  | "thinDiagStripe"
  | "thinHorzCross"
  | "thinDiagCross";

// ============================================================================
// BORDER STYLES
// ============================================================================

/**
 * Basic border styles per ECMA-376 Part 1 Section 17.18.2 (ST_Border)
 *
 * Consolidated from: Paragraph.ts, TableCell.ts, Table.ts
 * This covers the most commonly used border styles.
 */
export type BorderStyle =
  | "none" // No border
  | "single" // Single line
  | "double" // Double line
  | "dashed" // Dashed line
  | "dotted" // Dotted line
  | "thick"; // Thick single line

/**
 * Extended border styles including decorative effects
 *
 * Consolidated from: Run.ts (TextBorderStyle)
 * Includes 3D effects and other decorative styles.
 */
export type ExtendedBorderStyle =
  | BorderStyle
  | "wave" // Wavy line
  | "dashDotStroked" // Dash-dot stroked
  | "threeDEmboss" // 3D embossed effect
  | "threeDEngrave"; // 3D engraved effect

/**
 * Full border style set per ECMA-376
 * Includes all possible border values from the spec.
 */
export type FullBorderStyle =
  | ExtendedBorderStyle
  | "dotDash" // Dot-dash pattern
  | "dotDotDash" // Dot-dot-dash pattern
  | "triple" // Triple line
  | "thinThickSmallGap"
  | "thickThinSmallGap"
  | "thinThickThinSmallGap"
  | "thinThickMediumGap"
  | "thickThinMediumGap"
  | "thinThickThinMediumGap"
  | "thinThickLargeGap"
  | "thickThinLargeGap"
  | "thinThickThinLargeGap"
  | "dashSmallGap"
  | "dashDotStroked"
  | "outset"
  | "inset";

/**
 * Generic border definition interface
 *
 * Consolidated from: Paragraph.ts (BorderDefinition), Run.ts (TextBorder),
 * TableCell.ts (CellBorder), Table.ts (TableBorder)
 */
export interface BorderDefinition {
  /** Border style */
  style?: BorderStyle | ExtendedBorderStyle;
  /** Border width in eighths of a point (1-96) */
  size?: number;
  /** Border color in hex format (without #) */
  color?: string;
  /** Space between border and content in points (0-31) */
  space?: number;
}

/**
 * Four-sided border definitions
 */
export interface FourSidedBorders {
  top?: BorderDefinition;
  bottom?: BorderDefinition;
  left?: BorderDefinition;
  right?: BorderDefinition;
}

/**
 * Table border definitions (includes inside borders)
 */
export interface TableBorderDefinitions extends FourSidedBorders {
  /** Inside horizontal borders (between rows) */
  insideH?: BorderDefinition;
  /** Inside vertical borders (between columns) */
  insideV?: BorderDefinition;
}

// ============================================================================
// ALIGNMENT TYPES
// ============================================================================

/**
 * Horizontal alignment for general use
 *
 * Consolidated from: Image.ts, Table.ts (TableHorizontalAlignment)
 */
export type HorizontalAlignment =
  | "left"
  | "center"
  | "right"
  | "inside" // Toward binding edge
  | "outside"; // Away from binding edge

/**
 * Vertical alignment for general use
 *
 * Consolidated from: Image.ts, Table.ts (TableVerticalAlignment)
 */
export type VerticalAlignment =
  | "top"
  | "center"
  | "bottom"
  | "inside" // Toward top of page in header
  | "outside"; // Toward bottom of page in footer

/**
 * Vertical alignment for page content (Section-level)
 *
 * From: Section.ts - includes 'both' for justified vertical alignment
 */
export type PageVerticalAlignment = "top" | "center" | "bottom" | "both";

/**
 * Vertical alignment for table cells
 *
 * From: TableCell.ts (CellVerticalAlignment)
 */
export type CellVerticalAlignment = "top" | "center" | "bottom";

/**
 * Paragraph text alignment
 *
 * From: Paragraph.ts (ParagraphAlignment)
 * Note: 'both' is an alias for 'justify' in some contexts
 */
export type ParagraphAlignment =
  | "left"
  | "center"
  | "right"
  | "justify"
  | "both";

/**
 * Table alignment (horizontal positioning)
 *
 * From: Table.ts (TableAlignment)
 */
export type TableAlignment = "left" | "center" | "right";

/**
 * Row justification/alignment options
 *
 * From: TableRow.ts (RowJustification)
 */
export type RowJustification = "left" | "center" | "right" | "start" | "end";

/**
 * Text vertical alignment within line/cell
 *
 * From: Paragraph.ts (TextAlignment)
 */
export type TextVerticalAlignment =
  | "top"
  | "center"
  | "baseline"
  | "bottom"
  | "auto";

/**
 * Tab stop alignment types
 *
 * From: Paragraph.ts (TabAlignment)
 */
export type TabAlignment =
  | "clear" // Remove tab stop
  | "left" // Left-aligned
  | "center" // Center-aligned
  | "right" // Right-aligned
  | "decimal" // Decimal-aligned (for numbers)
  | "bar" // Bar tab (vertical line)
  | "num"; // List number alignment

// ============================================================================
// POSITIONING & ANCHORING
// ============================================================================

/**
 * Position anchor type (what to position relative to)
 *
 * From: Image.ts (PositionAnchor)
 */
export type PositionAnchor =
  | "page"
  | "margin"
  | "column"
  | "character"
  | "paragraph";

/**
 * Horizontal anchor for floating elements
 *
 * From: Table.ts (TableHorizontalAnchor), Paragraph.ts (FrameProperties.hAnchor)
 */
export type HorizontalAnchor = "text" | "margin" | "page";

/**
 * Vertical anchor for floating elements
 *
 * From: Table.ts (TableVerticalAnchor), Paragraph.ts (FrameProperties.vAnchor)
 */
export type VerticalAnchor = "text" | "margin" | "page";

// ============================================================================
// TEXT DIRECTION
// ============================================================================

/**
 * Text direction for paragraphs and cells
 *
 * Consolidated from: Paragraph.ts, Section.ts
 * Per ECMA-376 Part 1 Section 17.18.93 (ST_TextDirection)
 */
export type TextDirection =
  | "lrTb" // Left-to-right, top-to-bottom (Western default)
  | "tbRl" // Top-to-bottom, right-to-left (East Asian vertical)
  | "btLr" // Bottom-to-top, left-to-right
  | "lrTbV" // Left-to-right, top-to-bottom (vertical variant)
  | "tbRlV" // Top-to-bottom, right-to-left (vertical variant)
  | "tbLrV"; // Top-to-bottom, left-to-right (vertical variant)

/**
 * Simplified text direction for sections
 *
 * From: Section.ts
 */
export type SectionTextDirection = "ltr" | "rtl" | "tbRl" | "btLr";

// ============================================================================
// WIDTH TYPES
// ============================================================================

/**
 * Width type specification per ECMA-376
 *
 * Consolidated from: Table.ts, TableCell.ts
 */
export type WidthType =
  | "auto" // Automatically determined
  | "dxa" // Twips (twentieths of a point)
  | "pct"; // Percentage (in fiftieths of a percent)

// ============================================================================
// SHADING CONFIGURATION
// ============================================================================

/**
 * Generic shading configuration
 *
 * Consolidated from: Run.ts (CharacterShading), TableRow.ts (Shading), TableCell.ts (CellShading)
 */
export interface ShadingConfig {
  /** Background fill color in hex format (without #) */
  fill?: string;
  /** Foreground/pattern color in hex format (without #) */
  color?: string;
  /** Shading pattern type */
  pattern?: ShadingPattern;
}

// ============================================================================
// TAB STOPS
// ============================================================================

/**
 * Tab stop leader types
 *
 * From: Paragraph.ts (TabLeader)
 */
export type TabLeader =
  | "none" // No leader
  | "dot" // Dots ......
  | "hyphen" // Hyphens ------
  | "underscore" // Underscores ______
  | "heavy" // Heavy line
  | "middleDot"; // Middle dots

/**
 * Tab stop definition
 *
 * From: Paragraph.ts (TabStop)
 */
export interface TabStop {
  /** Position in twips from left margin */
  position: number;
  /** Alignment type */
  alignment?: TabAlignment;
  /** Leader character type */
  leader?: TabLeader;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if a value is a valid ShadingPattern
 */
export function isShadingPattern(value: string): value is ShadingPattern {
  const patterns = [
    "clear",
    "solid",
    "horzStripe",
    "vertStripe",
    "reverseDiagStripe",
    "diagStripe",
    "horzCross",
    "diagCross",
    "thinHorzStripe",
    "thinVertStripe",
    "thinReverseDiagStripe",
    "thinDiagStripe",
    "thinHorzCross",
    "thinDiagCross",
    "pct5",
    "pct10",
    "pct12",
    "pct15",
    "pct20",
    "pct25",
    "pct30",
    "pct35",
    "pct37",
    "pct40",
    "pct45",
    "pct50",
    "pct55",
    "pct60",
    "pct62",
    "pct65",
    "pct70",
    "pct75",
    "pct80",
    "pct85",
    "pct87",
    "pct90",
    "pct95",
  ];
  return patterns.includes(value);
}

/**
 * Check if a value is a valid BorderStyle
 */
export function isBorderStyle(value: string): value is BorderStyle {
  return ["none", "single", "double", "dashed", "dotted", "thick"].includes(
    value
  );
}

/**
 * Check if a value is a valid HorizontalAlignment
 */
export function isHorizontalAlignment(
  value: string
): value is HorizontalAlignment {
  return ["left", "center", "right", "inside", "outside"].includes(value);
}

/**
 * Check if a value is a valid VerticalAlignment
 */
export function isVerticalAlignment(value: string): value is VerticalAlignment {
  return ["top", "center", "bottom", "inside", "outside"].includes(value);
}

/**
 * Check if a value is a valid ParagraphAlignment
 */
export function isParagraphAlignment(
  value: string
): value is ParagraphAlignment {
  return ["left", "center", "right", "justify", "both"].includes(value);
}

/**
 * Check if a value is a valid WidthType
 */
export function isWidthType(value: string): value is WidthType {
  return ["auto", "dxa", "pct"].includes(value);
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default border definition
 */
export const DEFAULT_BORDER: BorderDefinition = {
  style: "single",
  size: 4, // 0.5pt (4 eighths)
  color: "000000",
  space: 0,
};

/**
 * No border definition
 */
export const NO_BORDER: BorderDefinition = {
  style: "none",
  size: 0,
  color: "auto",
  space: 0,
};
