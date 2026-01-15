/* biome-ignore-all lint: legacy code */
/**
 * Type declarations for html-to-docx
 *
 * TURBODOCX WILL ALSO (1) WORK DIRECTLY WITH REACT AND (2) WITHOUT NODE, NOR MHT.
 * IF I DOUBT THIS, I WILL OVERTHINK THE REASONS AND THEN COMPARE WITH THE EXAMPLES
 * CONTAINED IN THE FOLDER HTML-TO-DOCX. IF EVEN AFTER THAT I DISAGREE WITH THE ABOVE,
 * I'D CONDUCT AN EXTENSIVE RESEARCH UNTIL I FIND A PACKAGE THAT CAN PROVE I'M WRONG.
 */

declare namespace HTMLtoDOCX {
  type Margins = {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
    header?: number;
    footer?: number;
    gutter?: number;
  };

  type PageSize = {
    width?: number;
    height?: number;
  };

  type Row = {
    cantSplit?: boolean;
  };

  type BorderOptions = {
    size?: number;
    color?: string;
  };

  type Table = {
    row?: Row;
    borderOptions?: BorderOptions;
  };

  type LineNumberOptions = {
    countBy?: number;
    start?: number;
    restart?: 'continuous' | 'newPage' | 'newSection';
    distance?: number;
  };

  type HeadingSpacing = {
    before?: number;
    after?: number;
    line?: number;
    lineRule?: 'auto' | 'exact' | 'atLeast';
  };

  type HeadingStyle = {
    font?: string;
    fontSize?: number;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    color?: string;
    spacing?: HeadingSpacing;
  };

  type HeadingConfig = {
    heading1?: HeadingStyle;
    heading2?: HeadingStyle;
    heading3?: HeadingStyle;
    heading4?: HeadingStyle;
    heading5?: HeadingStyle;
    heading6?: HeadingStyle;
  };

  type ImageProcessing = {
    svgHandling?: 'convert' | 'native';
  };

  type DocumentOptions = {
    orientation?: 'portrait' | 'landscape';
    pageSize?: PageSize;
    margins?: Margins;
    title?: string;
    subject?: string;
    creator?: string;
    keywords?: string[];
    description?: string;
    lastModifiedBy?: string;
    revision?: number;
    createdAt?: Date;
    modifiedAt?: Date;
    font?: string;
    fontSize?: number;
    heading?: HeadingConfig;
    table?: Table;
    lineNumber?: LineNumberOptions;
    lineNumberOptions?: LineNumberOptions;
    header?: boolean;
    footer?: boolean;
    pageNumber?: boolean;
    imageProcessing?: ImageProcessing;
  };
}

/**
 * Convert HTML to DOCX format.
 *
 * @param htmlString - The HTML content to convert
 * @param headerHTMLString - Optional HTML for the document header
 * @param documentOptions - Optional document configuration
 * @param footerHTMLString - Optional HTML for the document footer
 * @returns A Promise that resolves to a Buffer (Node.js) or Blob (browser)
 */
declare function HTMLtoDOCX(
  htmlString: string,
  headerHTMLString?: string | null,
  documentOptions?: HTMLtoDOCX.DocumentOptions,
  footerHTMLString?: string | null
): Promise<Blob | Buffer>;

export = HTMLtoDOCX;
export as namespace HTMLtoDOCX;
