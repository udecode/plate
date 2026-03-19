import type { HeaderFooterType } from './constants';
import type { DocxListStyleType } from './utils/list';

export type Margins = {
  bottom?: number;
  footer?: number;
  gutter?: number;
  header?: number;
  left?: number;
  right?: number;
  top?: number;
};

export type PageSize = {
  height?: number;
  width?: number;
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
  revision?: number;
  skipFirstHeaderFooter?: boolean;
  subject?: string;
  table?: TableOptions;
  title?: string;
};
