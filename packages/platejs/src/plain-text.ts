import {
  createEditorView,
  type EditorDocumentValue,
  type NativeAuthoredProjectionDiagnostic,
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
  | NativeAuthoredProjectionDiagnostic
  | StructuralPlainTextDiagnostic;

export type PlainTextSerializeResult = Readonly<{
  data: string;
  diagnostics: readonly PlainTextDiagnostic[];
}>;

export type PlainTextEditorOptions = Readonly<{
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
  assertPlainTextProjection(document, options);
  const projected = projectPlateFormatDocument(
    editor,
    document,
    options.projection ?? 'proposed'
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

const assertPlainTextProjection = (
  document: EditorDocumentValue,
  options: PlainTextEditorOptions
) => {
  if (document.meta?.authored !== undefined && !options.projection) {
    throw new TypeError(
      'Plain-text serialization requires projection when the document contains authored changes.'
    );
  }
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
  const { plugins, schema, ...projectionOptions } = options;
  assertPlainTextProjection(source, projectionOptions);

  return withPlateFormatCompilation(
    { plugins, ...(schema ? { schema } : {}) },
    ({ editor, projectDocument, readDocument }) => {
      const projected = projectDocument(
        source,
        projectionOptions.projection ?? 'proposed'
      );

      return readDocument(projected.document, (state, document) => {
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
          diagnostics: Object.freeze([
            ...projected.diagnostics,
            ...result.diagnostics,
          ]),
        });
      });
    }
  );
}
