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
