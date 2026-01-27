/**
 * Configuration interfaces for customizable style formatting
 * Used by Document.applyCustomFormattingToExistingStyles()
 */

/**
 * Run (character) formatting configuration for styles
 */
export interface StyleRunFormatting {
  /** Font family name (e.g., 'Verdana', 'Arial', 'Times New Roman') */
  font?: string;

  /** Font size in points (e.g., 12, 14, 18) */
  size?: number;

  /** Whether text should be bold */
  bold?: boolean;

  /** Whether text should be italic */
  italic?: boolean;

  /** Whether text should be underlined */
  underline?: boolean;

  /** Text color as hex without # (e.g., '000000', 'FF0000') */
  color?: string;

  /** If true, preserve existing bold formatting (don't apply bold property) */
  preserveBold?: boolean;

  /** If true, preserve existing italic formatting (don't apply italic property) */
  preserveItalic?: boolean;

  /** If true, preserve existing underline formatting (don't apply underline property) */
  preserveUnderline?: boolean;
}

/**
 * Paragraph formatting configuration for styles
 */
export interface StyleParagraphFormatting {
  /** Text alignment */
  alignment?: "left" | "center" | "right" | "justify";

  /** Spacing configuration */
  spacing?: {
    /** Spacing before paragraph in twips (20 twips = 1 point) */
    before?: number;

    /** Spacing after paragraph in twips (20 twips = 1 point) */
    after?: number;

    /** Line spacing in twips (240 = single spacing when lineRule is 'auto') */
    line?: number;

    /** How to interpret the line spacing value */
    lineRule?: "auto" | "exact" | "atLeast";
  };

  /** Indentation configuration */
  indentation?: {
    /** Left indent in twips (1440 twips = 1 inch) */
    left?: number;

    /** Right indent in twips */
    right?: number;

    /** First line indent in twips (positive = indent, negative = outdent) */
    firstLine?: number;

    /** Hanging indent in twips (typically used for lists) */
    hanging?: number;
  };

  /**
   * Whether to remove spacing between consecutive paragraphs of the same style
   * Per ECMA-376 Part 1 §17.3.1.8
   */
  contextualSpacing?: boolean;
}

/**
 * Table appearance options for Heading2 wrapping
 * Heading2 paragraphs are always wrapped in 1x1 tables with these settings
 */
export interface Heading2TableOptions {
  /** Cell background color as hex without # (e.g., 'BFBFBF' for gray) */
  shading?: string;

  /** Top cell margin in twips */
  marginTop?: number;

  /** Bottom cell margin in twips */
  marginBottom?: number;

  /** Left cell margin in twips (115 twips = 0.08 inches) */
  marginLeft?: number;

  /** Right cell margin in twips (115 twips = 0.08 inches) */
  marginRight?: number;

  /** Table width as percentage (5000 = 100%) */
  tableWidthPercent?: number;
}

/**
 * Base style configuration combining run and paragraph formatting
 */
export interface StyleConfig {
  /** Character formatting for the style */
  run?: StyleRunFormatting;

  /** Paragraph formatting for the style */
  paragraph?: StyleParagraphFormatting;
}

/**
 * Extended configuration for Heading2 style including table options
 * Heading2 paragraphs are always wrapped in tables
 */
export interface Heading2Config extends StyleConfig {
  /** Table appearance options for wrapping Heading2 paragraphs */
  tableOptions?: Heading2TableOptions;
}

/**
 * Extended configuration for Normal style with alignment preservation options
 */
export interface NormalConfig extends StyleConfig {
  /**
   * Whether to preserve center alignment during style application.
   * When true, paragraphs that are center-aligned will retain their center alignment
   * instead of being changed to the Normal style's alignment (typically 'left').
   * This is useful for preserving intentional centering like image captions or table headers.
   * @default false
   */
  preserveCenterAlignment?: boolean;
}

/**
 * Complete configuration for applyStyles()
 * All properties are optional - defaults will be used if not provided
 */
export interface ApplyStylesOptions {
  /** Heading1 style configuration */
  heading1?: StyleConfig;

  /** Heading2 style configuration with table options */
  heading2?: Heading2Config;

  /** Heading3 style configuration */
  heading3?: StyleConfig;

  /** Normal style configuration with alignment preservation options */
  normal?: NormalConfig;

  /** List Paragraph style configuration */
  listParagraph?: StyleConfig;

  /**
   * Whether to preserve blank lines added after 1x1 Heading 2 tables.
   * When true, blank paragraphs added after Heading 2 tables are marked as preserved
   * to prevent accidental removal by document processing operations (e.g., removing extra blank lines).
   * @default true
   */
  preserveBlankLinesAfterHeading2Tables?: boolean;

  /**
   * Whether to preserve white font (FFFFFF) color during style application.
   * When true, runs with white color will not have their color changed.
   * This is useful for preserving hidden text like ID tags or overlay text.
   * @default false
   */
  preserveWhiteFont?: boolean;

  /**
   * Whether to apply Normal style changes to NormalWeb (Normal (Web)) style as well.
   * When true (default), if NormalWeb style exists in the document,
   * it will receive the same formatting changes applied to Normal.
   * This ensures consistency between Normal and Normal (Web) styles.
   * @default true
   */
  linkNormalWebToNormal?: boolean;
}

/**
 * @deprecated Use {@link ApplyStylesOptions} instead (renamed in v4.0.0)
 */
export type ApplyCustomFormattingOptions = ApplyStylesOptions;
