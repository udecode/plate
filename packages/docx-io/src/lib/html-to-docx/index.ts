/**
 * HTML to DOCX converter
 *
 * This module provides tools for converting HTML to DOCX format.
 */

// Main converter function (default export)
export { default as HTMLtoDOCX, default } from './html-to-docx';

// Re-export types for backwards compatibility
export type { DocumentMargins } from './schemas';

// Re-export tracking utilities
export * from './tracking';

// Re-export constants
export * from './constants';

// Re-export namespaces
export { default as namespaces } from './namespaces';

// ============================================================================
// Type definitions (matching index.d.ts namespace types)
// ============================================================================

export interface Margins {
  bottom?: number;
  footer?: number;
  gutter?: number;
  header?: number;
  left?: number;
  right?: number;
  top?: number;
}

export interface PageSize {
  height?: number;
  width?: number;
}

export interface Row {
  cantSplit?: boolean;
}

export interface BorderOptions {
  color?: string;
  size?: number;
}

export interface TableOptions {
  borderOptions?: BorderOptions;
  row?: Row;
}

export type TableBorderOptions = BorderOptions;

export interface LineNumberOptions {
  countBy?: number;
  distance?: number;
  restart?: 'continuous' | 'newPage' | 'newSection';
  start?: number;
}

export interface HeadingSpacing {
  after?: number;
  before?: number;
  line?: number;
  lineRule?: 'atLeast' | 'auto' | 'exact';
}

export interface HeadingStyleOptions {
  bold?: boolean;
  color?: string;
  font?: string;
  fontSize?: number;
  italic?: boolean;
  spacing?: HeadingSpacing;
  underline?: boolean;
}

export interface HeadingOptions {
  heading1?: HeadingStyleOptions;
  heading2?: HeadingStyleOptions;
  heading3?: HeadingStyleOptions;
  heading4?: HeadingStyleOptions;
  heading5?: HeadingStyleOptions;
  heading6?: HeadingStyleOptions;
}

export interface ImageProcessing {
  svgHandling?: 'convert' | 'native';
}

export interface NumberingOptions {
  defaultOrderedListStyleType?: string;
}

export interface DocumentOptions {
  complexScriptFontSize?: number | string;
  createdAt?: Date;
  creator?: string;
  decodeUnicode?: boolean;
  defaultLang?: string;
  description?: string;
  font?: string;
  fontSize?: number | string;
  footer?: boolean;
  footerType?: 'default' | 'even' | 'first';
  header?: boolean;
  headerType?: 'default' | 'even' | 'first';
  heading?: HeadingOptions;
  imageProcessing?: ImageProcessing;
  keywords?: string[];
  lastModifiedBy?: string;
  lineNumber?: boolean | LineNumberOptions;
  lineNumberOptions?: LineNumberOptions;
  margins?: Margins;
  modifiedAt?: Date;
  numbering?: NumberingOptions;
  orientation?: 'landscape' | 'portrait';
  pageNumber?: boolean;
  pageSize?: PageSize;
  revision?: number;
  skipFirstHeaderFooter?: boolean;
  subject?: string;
  table?: TableOptions;
  title?: string;
}
