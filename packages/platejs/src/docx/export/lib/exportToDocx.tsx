import juice from 'juice';

import type { BasePluginInput, Value } from '../../../core';
import { createEditor } from '../../../core';
import type {
  PlateStaticProps,
  RenderStaticHtmlOptions,
} from '../../../static';
import { renderStaticHtml } from '../../../static';
import { htmlToDocxBlob } from './html-to-docx.internal';
import type { Margins, PageSize } from './internal/types';

export type { Margins, PageSize } from './internal/types';

/** Options for converting a document snapshot to DOCX. */
export type DocxExportOptions = {
  /**
   * Fetch remote HTTP(S) images during export.
   *
   * @default false
   */
  allowRemoteImages?: boolean;

  /** Exact CSS stylesheet to apply before converting HTML to DOCX. */
  stylesheet?: string;

  /** Plate editor-kit descriptors used for HTML serialization. */
  editorPlugins?: readonly BasePluginInput[];

  /** React component used for static HTML rendering. */
  editorStaticComponent?: React.ComponentType<PlateStaticProps>;

  /**
   * Font family for the document body. Sets the document default font; when
   * omitted the document falls back to the docx default (Times New Roman).
   *
   * @example
   * ```typescript
   * fontFamily: 'Calibri'
   * ```
   */
  fontFamily?: string;

  /**
   * Page margins in twentieths of a point.
   * 1 inch = 1440 twentieths.
   *
   * @example
   * ```typescript
   * margins: { top: 720, bottom: 720 } // 0.5 inch top/bottom
   * ```
   */
  margins?: Margins;

  /**
   * Page orientation.
   * @default 'portrait'
   */
  orientation?: 'landscape' | 'portrait';

  /**
   * Page size in twentieths of a point (twips). Defaults to the html-to-docx
   * default (US Letter) when omitted.
   *
   * @example
   * ```typescript
   * pageSize: { width: 11906, height: 16838 } // A4 portrait
   * ```
   */
  pageSize?: PageSize;

  /**
   * Document title (for metadata purposes).
   */
  title?: string;
};

const DEFAULT_DOCX_MARGINS: Margins = {
  bottom: 1440,
  footer: 720,
  gutter: 0,
  header: 720,
  left: 1440,
  right: 1440,
  top: 1440,
};

const preserveMarkedWhitespace = (html: string) =>
  html.replace(
    /(<([a-z][\w:-]*)\b[^>]*\bdata-docx-preserve-whitespace(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?[^>]*>)([\s\S]*?)(<\/\2>)/gi,
    (_match, open: string, _tag: string, content: string, close: string) =>
      `${open}${content.replace(
        /(^|>)([^<]+)(?=<|$)/g,
        (_textMatch, prefix: string, text: string) =>
          `${prefix}${text.replaceAll(' ', '&#160;')}`
      )}${close}`
  );

/** Converts a document snapshot to DOCX using explicit serialization plugins and CSS. */
export async function exportToDocx(
  value: Value,
  options: DocxExportOptions = {}
): Promise<Blob> {
  const {
    allowRemoteImages,
    editorPlugins,
    editorStaticComponent,
    fontFamily,
    margins,
    orientation = 'portrait',
    pageSize,
    stylesheet,
    title,
  } = options;
  const editorStatic = createEditor({
    plugins: editorPlugins ?? [],
    initialValue: value,
  });
  const htmlOptions: Partial<RenderStaticHtmlOptions> = {};

  if (editorStaticComponent) {
    htmlOptions.editorComponent = editorStaticComponent;
    htmlOptions.props = {
      style: { padding: '0', ...(fontFamily ? { fontFamily } : {}) },
    };
  }
  const bodyHtml = await renderStaticHtml(editorStatic, htmlOptions);
  const styleElement = stylesheet ? `<style>${stylesheet}</style>` : '';
  // Inter-tag whitespace and a doctype become leading empty DOCX paragraphs.
  const fullHtml = `<html lang="en"><head><meta charset="utf-8" />${styleElement}</head><body>${bodyHtml}</body></html>`;
  const inlinedHtml = juice(fullHtml, {
    removeStyleTags: false,
    preserveMediaQueries: false,
    preserveFontFaces: false,
  });

  return htmlToDocxBlob(preserveMarkedWhitespace(inlinedHtml), {
    allowRemoteImages,
    font: fontFamily,
    margins: { ...DEFAULT_DOCX_MARGINS, ...margins },
    orientation,
    pageSize,
    title,
  });
}
