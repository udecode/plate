import {
  createEditorView,
  type EditorDocumentValue,
  type AuthoredProjectionDiagnostic,
  type StructuralPlainTextDiagnostic,
} from './facade';
import { serializePlatePlainText } from './internal/plugin/compilePlainTextMappings';
import type { Editor } from './lib/editor';
import type { EditorApplicationSchema } from './lib/editor/editorApplicationSchema';
import type { BasePluginInput } from './lib/editor/pluginRuntimeTypes';
import {
  projectPlateFormatDocument,
  withPlateFormatCompilation,
} from './lib/editor/withPlite';

export type PlainTextDiagnostic =
  | AuthoredProjectionDiagnostic
  | StructuralPlainTextDiagnostic;

export type PlainTextSerializeResult = Readonly<{
  data: string;
  diagnostics: readonly PlainTextDiagnostic[];
}>;

export type PlainTextEditorOptions = Readonly<{
  /**
   * Version of an authored document to export. `accepted` drops pending changes
   * and `proposed` applies them as plain content. Either choice adds an
   * `authored-lossy-projection` warning while changes are pending. Required
   * when the document has authored metadata, which every document from an
   * editor with the authored plugin carries, even with no pending change.
   * Omitting it or passing any other value then throws, and so does a valid
   * value when the editor or `plugins` lacks the authored plugin. A document
   * without authored metadata ignores it.
   */
  projection?: 'accepted' | 'proposed';
}>;

export type PlainTextDocumentOptions = PlainTextEditorOptions &
  Readonly<{
    plugins: readonly BasePluginInput[];
    schema?: EditorApplicationSchema;
  }>;

const serializeEditorPlainText = (
  editor: Editor,
  document: EditorDocumentValue,
  options: PlainTextEditorOptions
): PlainTextSerializeResult => {
  const projected = projectPlateFormatDocument(
    editor,
    document,
    options.projection
  );
  const view = createEditorView(editor, {
    document: projected.document,
  }) as unknown as Editor;
  const result = view.read((state) =>
    serializePlatePlainText(
      view,
      {
        content: projected.document.children,
        meta: projected.document.meta,
        roots: projected.document.roots,
      },
      state
    )
  );

  return Object.freeze({
    data: result.data,
    diagnostics: Object.freeze([
      ...projected.diagnostics,
      ...result.diagnostics,
    ]),
  });
};

export function serializePlainText(
  editor: Editor,
  options?: PlainTextEditorOptions
): PlainTextSerializeResult;
export function serializePlainText(
  document: EditorDocumentValue,
  options: PlainTextDocumentOptions
): PlainTextSerializeResult;
export function serializePlainText(
  source: Editor | EditorDocumentValue,
  options: PlainTextDocumentOptions | PlainTextEditorOptions = {}
): PlainTextSerializeResult {
  if ('read' in source) {
    return serializeEditorPlainText(source, source.read.value(), options);
  }
  if (!('plugins' in options)) {
    throw new TypeError(
      'Detached plain-text serialization requires plugins configuration.'
    );
  }
  const { plugins, projection, schema } = options;

  return withPlateFormatCompilation(
    { plugins, ...(schema ? { schema } : {}) },
    ({ editor, readDocument }) =>
      readDocument(source, projection, (state, document, diagnostics) => {
        const result = serializePlatePlainText(
          editor,
          {
            content: document.children,
            meta: document.meta,
            roots: document.roots,
          },
          state
        );

        return Object.freeze({
          data: result.data,
          diagnostics: Object.freeze([...diagnostics, ...result.diagnostics]),
        });
      })
  );
}
