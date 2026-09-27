import { createRequire } from 'node:module';

import {
  parseHtmlSliceWithDocument,
  parseHtmlWithDocument,
} from '../../lib/plugins/html/htmlConversion';
import type {
  HtmlDocumentParseResult,
  HtmlParseOptions,
  HtmlSliceParseResult,
} from '../../lib/plugins/html/htmlTypes';

type LinkeDomModule = Readonly<{
  parseHTML: (html: string) => Readonly<{ document: Document }>;
}>;

const require = createRequire(import.meta.url);

const createServerHtmlDocument = (): Document => {
  let linkedom: LinkeDomModule;

  try {
    linkedom = require('linkedom') as LinkeDomModule;
  } catch (error) {
    throw new Error(
      'platejs/html/server requires the optional peer dependency "linkedom". Install linkedom@^0.18.13 before parsing HTML in Node.js.',
      { cause: error }
    );
  }

  return linkedom.parseHTML('<!doctype html><html><body></body></html>')
    .document;
};

export const parseHtml = (
  source: string,
  options: HtmlParseOptions
): HtmlDocumentParseResult =>
  parseHtmlWithDocument(source, options, createServerHtmlDocument());

export const parseHtmlSlice = (
  source: string,
  options: HtmlParseOptions
): HtmlSliceParseResult =>
  parseHtmlSliceWithDocument(source, options, createServerHtmlDocument());

export type {
  HtmlDiagnostic,
  HtmlDocumentParseResult,
  HtmlErrorDiagnostic,
  HtmlModelLocation,
  HtmlParseLimits,
  HtmlParseOptions,
  HtmlSliceParseResult,
  HtmlSourceLocation,
  HtmlWarningDiagnostic,
} from '../../lib/plugins/html/htmlTypes';
