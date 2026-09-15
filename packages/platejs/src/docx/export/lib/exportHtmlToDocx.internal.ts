import juice from 'juice';

import type { DocxExportOptions } from './exportToDocx';
import { htmlToDocxBlob } from './html-to-docx.internal';
import type { Margins } from './internal/types';

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

export const exportHtmlToDocx = async (
  bodyHtml: string,
  {
    allowRemoteImages,
    fontFamily,
    margins,
    orientation = 'portrait',
    pageSize,
    stylesheet,
    title,
  }: DocxExportOptions
) => {
  const styleElement = stylesheet ? `<style>${stylesheet}</style>` : '';
  const fullHtml = `<html lang="en"><head><meta charset="utf-8" />${styleElement}</head><body>${bodyHtml}</body></html>`;
  const inlinedHtml = juice(fullHtml, {
    preserveFontFaces: false,
    preserveMediaQueries: false,
    removeStyleTags: false,
  });

  return htmlToDocxBlob(preserveMarkedWhitespace(inlinedHtml), {
    allowRemoteImages,
    font: fontFamily,
    margins: { ...DEFAULT_DOCX_MARGINS, ...margins },
    orientation,
    pageSize,
    title,
  });
};
