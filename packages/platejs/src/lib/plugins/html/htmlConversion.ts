import type { EditorDocumentValue } from '../../../facade';
import { withPlateFormatCompilation } from '../../editor/withPlite';
import { createBrowserHtmlDocument } from './htmlAst';
import {
  HtmlPlugin,
  parseHtmlSliceWithEditor,
  parseHtmlWithEditor,
  serializeHtmlDocumentWithState,
} from './HtmlPlugin';
import type {
  HtmlDocumentParseResult,
  HtmlParseOptions,
  HtmlSerializeOptions,
  HtmlSerializeResult,
  HtmlSliceParseResult,
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

export const parseHtmlSliceWithDocument = (
  source: string,
  options: HtmlParseOptions,
  ownerDocument: Document
): HtmlSliceParseResult =>
  withPlateFormatCompilation(
    {
      plugins: [HtmlPlugin, ...options.plugins],
      ...(options.schema ? { schema: options.schema } : {}),
    },
    ({ editor, readState }) =>
      parseHtmlSliceWithEditor(
        editor,
        source,
        options,
        ownerDocument,
        readState
      )
  );

export const parseHtml = (
  source: string,
  options: HtmlParseOptions
): HtmlDocumentParseResult =>
  parseHtmlWithDocument(source, options, createBrowserHtmlDocument());

export const parseHtmlSlice = (
  source: string,
  options: HtmlParseOptions
): HtmlSliceParseResult =>
  parseHtmlSliceWithDocument(source, options, createBrowserHtmlDocument());

export const serializeHtml = (
  document: EditorDocumentValue,
  options: HtmlSerializeOptions
): HtmlSerializeResult =>
  withPlateFormatCompilation(
    {
      plugins: [HtmlPlugin, ...options.plugins],
      ...(options.schema ? { schema: options.schema } : {}),
    },
    ({ editor, projectDocument, readDocument }) => {
      const projected = projectDocument(
        document,
        options.projection ?? 'proposed'
      );

      return readDocument(projected.document, (state, ownedDocument) =>
        serializeHtmlDocumentWithState(
          editor,
          state,
          ownedDocument,
          projected.diagnostics as readonly HtmlWarningDiagnostic[],
          options.lossPolicy ?? 'reject'
        )
      );
    }
  );
