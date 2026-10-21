import type { HeaderFooterType } from './constants';
import type { DocxListStyleType } from './utils/list';

type UnitValue = number | string;

export type Margins = {
  bottom?: UnitValue;
  footer?: UnitValue;
  gutter?: UnitValue;
  header?: UnitValue;
  left?: UnitValue;
  right?: UnitValue;
  top?: UnitValue;
};

export type PageSize = {
  height?: UnitValue;
  width?: UnitValue;
};

/**
 * Space before and after a paragraph, in twentieths of a point (twips): 20
 * twips = 1 pt, and fractions round to whole twips. A key left out keeps the
 * converter's default for it.
 */
export type Spacing = {
  after?: number;
  before?: number;
};

export type TableOptions = {
  row?: {
    cantSplit?: boolean;
  };
};

export type LineNumberOptions = {
  countBy?: number;
  restart?: 'continuous' | 'newPage' | 'newSection';
  start?: number;
};

export type NumberingOptions = {
  defaultOrderedListStyleType?: DocxListStyleType;
};

export type DocumentOptions = {
  /**
   * Fetch remote HTTP(S) images while converting HTML to DOCX.
   *
   * Disabled by default because fetching attacker-controlled image URLs can
   * expose server-side environments to SSRF. Prefer trusted data URIs.
   */
  allowRemoteImages?: boolean;
  complexScriptFontSize?: number | string | null;
  createdAt?: Date;
  creator?: string;
  decodeUnicode?: boolean;
  defaultLang?: string;
  description?: string;
  font?: string;
  fontSize?: number | string | null;
  footer?: boolean;
  footerType?: HeaderFooterType;
  header?: boolean;
  headerType?: HeaderFooterType;
  /**
   * Space above and below all six heading levels. A key left out keeps each
   * level's built-in value. Heading 1 has no built-in `after` and takes
   * `paragraphSpacing.after`.
   */
  headingSpacing?: Spacing;
  keywords?: string[];
  lastModifiedBy?: string;
  lineNumber?: boolean;
  lineNumberOptions?: LineNumberOptions;
  margins?: Margins | null;
  modifiedAt?: Date;
  numbering?: NumberingOptions;
  orientation?: 'landscape' | 'portrait';
  pageNumber?: boolean;
  pageSize?: PageSize | null;
  /**
   * Space around paragraphs, written to the document defaults. Defaults to
   * 6 pt after (`{ after: 120 }`).
   */
  paragraphSpacing?: Spacing;
  revision?: number;
  skipFirstHeaderFooter?: boolean;
  subject?: string;
  table?: TableOptions;
  title?: string;
};
