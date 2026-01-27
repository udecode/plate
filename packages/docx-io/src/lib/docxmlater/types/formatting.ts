/**
 * Additional formatting types for enhanced document manipulation
 */

// Forward references to avoid circular dependencies
import type { Paragraph } from '../elements/Paragraph';
import type { Run } from '../elements/Run';

/**
 * Border style options
 */
export type BorderStyleType = 'single' | 'double' | 'dashed' | 'dotted' | 'triple' | 'none';

/**
 * Individual border configuration
 */
export interface BorderStyle {
  /** Border style */
  style: BorderStyleType;
  /** Border width in eighths of a point */
  width: number;
  /** Border color in hex format */
  color: string;
  /** Space between border and text in points */
  space?: number;
}

/**
 * Paragraph border configuration
 */
export interface ParagraphBorder {
  /** Top border */
  top?: BorderStyle;
  /** Bottom border */
  bottom?: BorderStyle;
  /** Left border */
  left?: BorderStyle;
  /** Right border */
  right?: BorderStyle;
  /** Apply border between paragraphs */
  between?: boolean;
}

/**
 * Shading patterns
 */
export type ShadingPattern =
  | 'clear'
  | 'solid'
  | 'pct5'
  | 'pct10'
  | 'pct20'
  | 'pct25'
  | 'pct30'
  | 'pct40'
  | 'pct50'
  | 'pct60'
  | 'pct70'
  | 'pct75'
  | 'pct80'
  | 'pct90'
  | 'horzStripe'
  | 'vertStripe'
  | 'diagStripe'
  | 'diagCross';

/**
 * Paragraph shading configuration
 */
export interface ParagraphShading {
  /** Fill color in hex format */
  fill: string;
  /** Shading pattern */
  pattern?: ShadingPattern;
  /** Pattern color in hex format */
  color?: string;
}

/**
 * Tab stop alignment
 */
export type TabAlignment = 'left' | 'center' | 'right' | 'decimal' | 'bar' | 'clear';

/**
 * Tab leader character
 */
export type TabLeader = 'none' | 'dot' | 'dash' | 'underscore' | 'heavy' | 'middleDot';

/**
 * Tab stop configuration
 */
export interface TabStop {
  /** Position in twips from left margin */
  position: number;
  /** Tab alignment type */
  type: TabAlignment;
  /** Leader character */
  leader?: TabLeader;
}

/**
 * Text search options
 */
export interface FindOptions {
  /** Case sensitive search */
  caseSensitive?: boolean;
  /** Match whole words only */
  wholeWord?: boolean;
  /** Use regular expressions */
  useRegex?: boolean;
  /** Include headers and footers */
  includeHeadersFooters?: boolean;
  /** Include footnotes and endnotes */
  includeNotes?: boolean;
}

/**
 * Text replacement options
 */
export interface ReplaceOptions extends FindOptions {
  /** Maximum number of replacements (0 = unlimited) */
  maxReplacements?: number;
  /** Track changes for replacements */
  trackChanges?: boolean;
  /** Author for track changes */
  author?: string;
}

/**
 * Search result
 */
export interface SearchResult {
  /** The paragraph containing the match */
  paragraph: Paragraph;
  /** The run containing the match */
  run?: Run;
  /** Match start position in paragraph */
  startIndex: number;
  /** Match end position in paragraph */
  endIndex: number;
  /** The matched text */
  match: string;
}

/**
 * Text emphasis options
 */
export type EmphasisType = 'bold' | 'italic' | 'underline';

/**
 * List prefix configuration
 */
export interface ListPrefix {
  /** List format type */
  format: 'bullet' | 'number';
  /** Custom style string (e.g., '•', '1.', 'a)') */
  style: string;
}

/**
 * Format options for style application
 */
export interface FormatOptions {
  // Text formatting
  /** Font family name (e.g., 'Arial', 'Verdana') */
  font?: string;
  /** Font size in points */
  size?: number;
  /** Text color as 6-digit hex (e.g., 'FF0000' for red) */
  color?: string;
  /** Text emphasis (bold, italic, underline) */
  emphasis?: EmphasisType[];

  // Alignment
  /** Paragraph alignment */
  alignment?: 'left' | 'right' | 'center' | 'justify';

  // Spacing (in points)
  /** Space before paragraph in points */
  spaceAbove?: number;
  /** Space after paragraph in points */
  spaceBelow?: number;
  /** Line spacing in points or multiplier */
  lineSpacing?: number;

  // Indentation (in inches)
  /** Left indentation in inches */
  indentLeft?: number;
  /** Right indentation in inches */
  indentRight?: number;
  /** First line indentation in inches */
  indentFirst?: number;
  /** Hanging indentation in inches */
  indentHanging?: number;

  // Padding (in points) - for table cells
  /** Top padding in points */
  paddingTop?: number;
  /** Bottom padding in points */
  paddingBottom?: number;
  /** Left padding in points */
  paddingLeft?: number;
  /** Right padding in points */
  paddingRight?: number;

  // List formatting
  /** List prefix style */
  prefixList?: string | ListPrefix;

  // Advanced options
  /** Border color as 6-digit hex */
  borderColor?: string;
  /** Border width in points */
  borderWidth?: number;
  /** Background shading color as 6-digit hex */
  shading?: string;
  /** Keep with next paragraph */
  keepWithNext?: boolean;
  /** Keep lines together */
  keepLines?: boolean;
}

/**
 * Options for applying styles to paragraphs
 */
export interface StyleApplyOptions {
  /** Specific paragraphs to apply style to (default: auto-detect) */
  paragraphs?: Paragraph[];
  /** Properties to preserve from existing formatting */
  keepProperties?: string[];
  /** Custom formatting to apply */
  format?: FormatOptions;
}