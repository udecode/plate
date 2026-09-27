export type {
  HtmlAttributes,
  HtmlContentToken,
  HtmlElementPatch,
  HtmlMatcher,
  HtmlMatchValue,
  HtmlNodeSpec,
  HtmlWrapperSpec,
} from '../core';
export { HtmlPlugin } from '../lib/plugins/html/HtmlPlugin';
export {
  parseHtml,
  parseHtmlSlice,
  serializeHtml,
} from '../lib/plugins/html/htmlConversion';
export type {
  HtmlApi,
  HtmlDiagnostic,
  HtmlDocumentParseResult,
  HtmlEditorParseOptions,
  HtmlEditorSerializeOptions,
  HtmlErrorDiagnostic,
  HtmlModelLocation,
  HtmlParseLimits,
  HtmlParseOptions,
  HtmlSerializeOptions,
  HtmlSerializeResult,
  HtmlSliceParseResult,
  HtmlSourceLocation,
  HtmlWarningDiagnostic,
} from '../lib/plugins/html/htmlTypes';
