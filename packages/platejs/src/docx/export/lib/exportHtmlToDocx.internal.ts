import juice from 'juice';

import { getPluginNodeClass } from '../../../lib/utils/pluginNodeClass';
import { PLUGINS } from '../../../utils/plate-keys';
import { parseDocxHtml } from '../../internal/domParser';
import type { DocxExportOptions } from './exportDocx';
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

const blockOfRecord = (wrapper: Element) => {
  const content = Array.from(wrapper.childNodes).filter(
    (node) =>
      node.nodeType !== node.TEXT_NODE || (node.textContent ?? '').trim() !== ''
  );
  const [block] = content;

  return content.length === 1 &&
    block.nodeType === block.ELEMENT_NODE &&
    !(block as Element).hasAttribute('data-docx-list')
    ? (block as Element)
    : undefined;
};

const unwrapListRecords = (body: HTMLElement) => {
  for (const wrapper of Array.from(body.querySelectorAll('[data-docx-list]'))) {
    const block = blockOfRecord(wrapper);

    if (!block) continue;
    for (const { name, value } of Array.from(wrapper.attributes)) {
      block.setAttribute(name, value);
    }
    wrapper.replaceWith(block);
  }
};

// A double-quoted CSS string serializes as `&quot;`, and html-to-vdom splits a
// style attribute at every `;` without decoding entities. A style no
// stylesheet rule matches skips juice's own requoting.
const singleQuoteStrings = (css: string) =>
  css.replace(
    /"((?:[^"\\]|\\.)*)"|'(?:[^'\\]|\\.)*'/g,
    (match, double: string | undefined) =>
      double === undefined ? match : `'${double.replaceAll("'", "\\'")}'`
  );

const stampOwnStyles = (html: string) => {
  const { body } = parseDocxHtml(html);

  unwrapListRecords(body);
  for (const element of Array.from(body.querySelectorAll('[style]'))) {
    const style = singleQuoteStrings(element.getAttribute('style') ?? '');

    element.setAttribute('style', style);
    element.setAttribute('data-docx-own-style', style);
  }

  return body.innerHTML;
};

const NAMED_STYLE_HTML = (['blockquote', 'code', 'kbd'] as const)
  .map((tag) => `<${tag} class="${getPluginNodeClass(PLUGINS[tag])}"></${tag}>`)
  .join('');

const JUICE_OPTIONS = {
  decodeStyleAttributes: true,
  preserveFontFaces: false,
  preserveMediaQueries: false,
  removeStyleTags: false,
};

// Output preparation already resolved every image to embedded bytes, so the
// writer never fetches on its own.
export const exportHtmlToDocx = async (
  bodyHtml: string,
  {
    fontFamily,
    margins,
    orientation = 'portrait',
    pageNumber,
    pageSize,
    stylesheet,
    title,
  }: DocxExportOptions
) => {
  const styleElement = stylesheet ? `<style>${stylesheet}</style>` : '';
  const page = (body: string) =>
    juice(
      `<html lang="en"><head><meta charset="utf-8" />${styleElement}</head><body>${body}</body></html>`,
      JUICE_OPTIONS
    );

  return htmlToDocxBlob(
    preserveMarkedWhitespace(page(stampOwnStyles(bodyHtml))),
    {
      font: fontFamily,
      footer: pageNumber,
      margins: { ...DEFAULT_DOCX_MARGINS, ...margins },
      namedStyleHtml: page(NAMED_STYLE_HTML),
      orientation,
      pageNumber,
      pageSize,
      title,
    }
  );
};
