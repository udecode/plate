import type { EditorDocumentValue } from '../../../facade';
import { withPlateFormatCompilation } from '../../editor/withPlite';
import { createBrowserHtmlDocument } from './htmlAst';
import {
  HtmlPlugin,
  parseHtmlWithEditor,
  serializeHtmlDocumentWithState,
} from './HtmlPlugin';
import type {
  HtmlDocumentParseResult,
  HtmlParseOptions,
  HtmlSerializeOptions,
  HtmlSerializeResult,
  HtmlWarningDiagnostic,
} from './htmlTypes';

export const parseHtmlWithDocument = (
  source: string,
  options: HtmlParseOptions,
  ownerDocument: Document
): HtmlDocumentParseResult =>
  withPlateFormatCompilation(
    {
      plugins: [HtmlPlugin, ...options.plugins],
      ...(options.schema ? { schema: options.schema } : {}),
    },
    ({ editor, readState }) =>
      parseHtmlWithEditor(editor, source, options, ownerDocument, readState)
  );

export const parseHtml = (
  source: string,
  options: HtmlParseOptions
): HtmlDocumentParseResult =>
  parseHtmlWithDocument(source, options, createBrowserHtmlDocument());

export const serializeHtml = (
  document: EditorDocumentValue,
  options: HtmlSerializeOptions
): HtmlSerializeResult =>
  withPlateFormatCompilation(
    {
      plugins: [HtmlPlugin, ...options.plugins],
      ...(options.schema ? { schema: options.schema } : {}),
    },
    ({ editor, readDocument }) =>
      readDocument(
        document,
        options.projection,
        (state, ownedDocument, diagnostics) =>
          serializeHtmlDocumentWithState(
            editor,
            state,
            ownedDocument,
            diagnostics as readonly HtmlWarningDiagnostic[],
            options.lossPolicy ?? 'reject'
          )
      )
  );
