import type {
  EditorDocumentValue,
  EditorValueFromPlugins,
  RuntimePluginReference,
} from '../../../facade';
import type { Editor } from '../../editor';
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

export const parseHtmlWithDocument = <
  const TPlugins extends readonly RuntimePluginReference[],
>(
  source: string,
  options: HtmlParseOptions<TPlugins>,
  ownerDocument: Document
): HtmlDocumentParseResult<EditorValueFromPlugins<TPlugins>> =>
  withPlateFormatCompilation(
    {
      plugins: [HtmlPlugin, ...options.plugins],
      ...(options.schema ? { schema: options.schema } : {}),
    },
    ({ editor, readState }) =>
      parseHtmlWithEditor(
        editor as unknown as Editor,
        source,
        options,
        ownerDocument,
        readState
      ) as HtmlDocumentParseResult<EditorValueFromPlugins<TPlugins>>
  );

export const parseHtmlSliceWithDocument = <
  const TPlugins extends readonly RuntimePluginReference[],
>(
  source: string,
  options: HtmlParseOptions<TPlugins>,
  ownerDocument: Document
): HtmlSliceParseResult<EditorValueFromPlugins<TPlugins>> =>
  withPlateFormatCompilation(
    {
      plugins: [HtmlPlugin, ...options.plugins],
      ...(options.schema ? { schema: options.schema } : {}),
    },
    ({ editor, readState }) =>
      parseHtmlSliceWithEditor(
        editor as unknown as Editor,
        source,
        options,
        ownerDocument,
        readState
      ) as HtmlSliceParseResult<EditorValueFromPlugins<TPlugins>>
  );

export const parseHtml = <
  const TPlugins extends readonly RuntimePluginReference[],
>(
  source: string,
  options: HtmlParseOptions<TPlugins>
): HtmlDocumentParseResult<EditorValueFromPlugins<TPlugins>> =>
  parseHtmlWithDocument(source, options, createBrowserHtmlDocument());

export const parseHtmlSlice = <
  const TPlugins extends readonly RuntimePluginReference[],
>(
  source: string,
  options: HtmlParseOptions<TPlugins>
): HtmlSliceParseResult<EditorValueFromPlugins<TPlugins>> =>
  parseHtmlSliceWithDocument(source, options, createBrowserHtmlDocument());

export const serializeHtml = <
  const TPlugins extends readonly RuntimePluginReference[],
>(
  document: EditorDocumentValue<EditorValueFromPlugins<TPlugins>>,
  options: HtmlSerializeOptions<TPlugins>
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
