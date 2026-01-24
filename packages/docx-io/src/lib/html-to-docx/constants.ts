import { cloneDeep } from 'lodash';

export type Orientation = 'landscape' | 'portrait';

export type HeaderFooterType = 'default' | 'even' | 'first';

export type LineNumberRestart = 'continuous' | 'newPage' | 'newSection';

export type ListStyleType =
  | 'decimal'
  | 'disc'
  | 'lower-alpha'
  | 'lower-roman'
  | 'upper-alpha'
  | 'upper-roman';

export type VerticalAlign = 'bottom' | 'middle' | 'top';

export type Margins = {
  bottom: number;
  footer: number;
  gutter: number;
  header: number;
  left: number;
  right: number;
  top: number;
};

export type PageSize = {
  height: number;
  width: number;
};

export type TableRowOptions = {
  cantSplit: boolean;
};

export type TableOptions = {
  row: TableRowOptions;
};

export type LineNumberOptions = {
  countBy: number;
  restart: LineNumberRestart;
  start: number;
};

export type NumberingOptions = {
  defaultOrderedListStyleType: ListStyleType;
};

export type BorderSide = {
  color: string;
  size: number;
  spacing: number;
};

export type ParagraphBorders = {
  bottom: BorderSide;
  left: BorderSide;
  right: BorderSide;
  top: BorderSide;
};

export type DocumentOptions = {
  complexScriptFontSize: number;
  createdAt: Date;
  creator: string;
  decodeUnicode: boolean;
  defaultLang: string;
  description: string;
  font: string;
  fontSize: number;
  footer: boolean;
  footerType: HeaderFooterType;
  header: boolean;
  headerType: HeaderFooterType;
  keywords: string[];
  lastModifiedBy: string;
  lineNumber: boolean;
  lineNumberOptions: LineNumberOptions;
  margins: Margins;
  modifiedAt: Date;
  numbering: NumberingOptions;
  orientation: Orientation;
  pageNumber: boolean;
  pageSize: PageSize;
  revision: number;
  skipFirstHeaderFooter: boolean;
  subject: string;
  table: TableOptions;
  title: string;
};

const applicationName = 'html-to-docx';
const defaultOrientation: Orientation = 'portrait';
const landscapeWidth = 15_840;
const landscapeHeight = 12_240;
const landscapeMargins: Margins = {
  bottom: 1800,
  footer: 720,
  gutter: 0,
  header: 720,
  left: 1440,
  right: 1440,
  top: 1800,
};
const portraitMargins: Margins = {
  bottom: 1440,
  footer: 720,
  gutter: 0,
  header: 720,
  left: 1800,
  right: 1800,
  top: 1440,
};
const defaultFont = 'Times New Roman';
const defaultFontSize = 22;
const defaultLang = 'en-US';
const defaultDocumentOptions: DocumentOptions = {
  complexScriptFontSize: defaultFontSize,
  createdAt: new Date(),
  creator: applicationName,
  decodeUnicode: false,
  defaultLang,
  description: '',
  font: defaultFont,
  fontSize: defaultFontSize,
  footer: false,
  footerType: 'default',
  header: false,
  headerType: 'default',
  keywords: [applicationName],
  lastModifiedBy: applicationName,
  lineNumber: false,
  lineNumberOptions: {
    countBy: 1,
    restart: 'continuous',
    start: 0,
  },
  margins: cloneDeep(portraitMargins),
  modifiedAt: new Date(),
  numbering: {
    defaultOrderedListStyleType: 'decimal',
  },
  orientation: defaultOrientation,
  pageNumber: false,
  pageSize: {
    height: landscapeWidth,
    width: landscapeHeight,
  },
  revision: 1,
  skipFirstHeaderFooter: false,
  subject: '',
  table: {
    row: {
      cantSplit: false,
    },
  },
  title: '',
};
const defaultHTMLString = '<p></p>';
const relsFolderName = '_rels';
const headerFileName = 'header1';
const footerFileName = 'footer1';
const themeFileName = 'theme1';
const documentFileName = 'document';
const headerType = 'header';
const footerType = 'footer';
const themeType = 'theme';
const commentsType = 'comments';
const hyperlinkType = 'hyperlink';
const imageType = 'image';
const internalRelationship = 'Internal';
const wordFolder = 'word';
const themeFolder = 'theme';
const paragraphBordersObject: ParagraphBorders = {
  bottom: {
    color: 'FFFFFF',
    size: 0,
    spacing: 3,
  },
  left: {
    color: 'FFFFFF',
    size: 0,
    spacing: 3,
  },
  right: {
    color: 'FFFFFF',
    size: 0,
    spacing: 3,
  },
  top: {
    color: 'FFFFFF',
    size: 0,
    spacing: 3,
  },
};
const colorlessColors: string[] = ['transparent', 'auto'];
const verticalAlignValues: VerticalAlign[] = ['top', 'middle', 'bottom'];

export {
  applicationName,
  colorlessColors,
  commentsType,
  defaultDocumentOptions,
  defaultFont,
  defaultFontSize,
  defaultHTMLString,
  defaultLang,
  defaultOrientation,
  documentFileName,
  footerFileName,
  footerType,
  headerFileName,
  headerType,
  hyperlinkType,
  imageType,
  internalRelationship,
  landscapeHeight,
  landscapeMargins,
  landscapeWidth,
  paragraphBordersObject,
  portraitMargins,
  relsFolderName,
  themeFileName,
  themeFolder,
  themeType,
  verticalAlignValues,
  wordFolder,
};
