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
  /** Write the footer. Defaults to true when `footerHtml` or `pageNumber` is set. */
  footer?: boolean;
  /** HTML of the footer. Defaults to an empty paragraph. */
  footerHtml?: string;
  footerType?: HeaderFooterType;
  header?: boolean;
  headerType?: HeaderFooterType;
  keywords?: string[];
  lastModifiedBy?: string;
  lineNumber?: boolean;
  lineNumberOptions?: LineNumberOptions;
  margins?: Margins | null;
  modifiedAt?: Date;
  numbering?: NumberingOptions;
  orientation?: 'landscape' | 'portrait';
  /** Append the page number to the footer's first block, unless it is a table. */
  pageNumber?: boolean;
  pageSize?: PageSize | null;
  revision?: number;
  skipFirstHeaderFooter?: boolean;
  subject?: string;
  table?: TableOptions;
  title?: string;
};
