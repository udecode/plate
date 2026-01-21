/* eslint-disable no-useless-escape */
import JSZip from 'jszip';

import addFilesToContainer from './html-to-docx';

// Export tracking types and utilities for external use
export * from './tracking';

/** Document options for DOCX generation */
export type DocumentOptions = {
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
  keywords?: string[];
  lastModifiedBy?: string;
  lineNumber?: boolean;
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
};

export type LineNumberOptions = {
  countBy?: number;
  restart?: 'continuous' | 'newPage' | 'newSection';
  start?: number;
};

export type Margins = {
  bottom?: number | string;
  footer?: number | string;
  gutter?: number | string;
  header?: number | string;
  left?: number | string;
  right?: number | string;
  top?: number | string;
};

export type NumberingOptions = {
  defaultOrderedListStyleType?: string;
};

export type PageSize = {
  height?: number | string;
  width?: number | string;
};

export type TableBorderOptions = {
  color?: string;
  size?: number;
};

export type TableOptions = {
  borderOptions?: TableBorderOptions;
  row?: {
    cantSplit?: boolean;
  };
};

export type HeadingSpacing = {
  after?: number;
  before?: number;
};

export type HeadingStyleOptions = {
  bold?: boolean;
  color?: string;
  font?: string;
  fontSize?: number;
  italic?: boolean;
  spacing?: HeadingSpacing;
};

export type HeadingOptions = {
  heading1?: HeadingStyleOptions;
  heading2?: HeadingStyleOptions;
  heading3?: HeadingStyleOptions;
  heading4?: HeadingStyleOptions;
  heading5?: HeadingStyleOptions;
  heading6?: HeadingStyleOptions;
};

const minifyHTMLString = (htmlString: string): string | null => {
  try {
    if (typeof htmlString === 'string') {
      const minifiedHTMLString = htmlString
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\r\n/g, ' ')
        .replace(/[\t]+</g, '<')
        .replace(/>[\t ]+</g, '><')
        .replace(/>[\t ]+$/g, '>');

      return minifiedHTMLString;
    }

    throw new Error('invalid html string');
  } catch (_error) {
    return null;
  }
};

async function generateContainer(
  htmlString: string,
  headerHTMLString: string | null | undefined,
  documentOptions: DocumentOptions,
  footerHTMLString?: string | null
): Promise<Blob | Buffer> {
  const zip = new JSZip();

  let contentHTML: string | null = htmlString;
  let headerHTML: string | null | undefined = headerHTMLString;
  let footerHTML: string | null | undefined = footerHTMLString;

  if (htmlString) {
    contentHTML = minifyHTMLString(contentHTML as string);
  }
  if (headerHTMLString) {
    headerHTML = minifyHTMLString(headerHTML as string);
  }
  if (footerHTMLString) {
    footerHTML = minifyHTMLString(footerHTML as string);
  }

  await addFilesToContainer(
    zip,
    contentHTML,
    documentOptions,
    headerHTML,
    footerHTML
  );

  const buffer = await zip.generateAsync({ type: 'arraybuffer' });

  if (Object.hasOwn(global, 'Buffer')) {
    return Buffer.from(new Uint8Array(buffer));
  }
  if (Object.hasOwn(global, 'Blob')) {
    // eslint-disable-next-line no-undef
    return new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
  }

  throw new Error(
    'Add blob support using a polyfill eg https://github.com/bjornstar/blob-polyfill'
  );
}

export default generateContainer;
