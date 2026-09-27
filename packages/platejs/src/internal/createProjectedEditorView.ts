import {
  createEditorReadApi,
  getEditorRuntime,
  getEditorRuntimeOwner,
  getEditorRuntimeRoot,
  getEditorStateView,
  inheritPluginRegistry,
  setEditorRuntime,
  withEditorDocumentProjection,
} from 'plitejs/internal';

import type { EditorDocumentValue, EditorStateSchemaApi } from '../facade';
import { createEditorView } from '../facade';
import type { Editor } from '../lib';

/** Create an immutable read-only view over a captured document. @internal */
export const createProjectedEditorView = (
  source: Editor,
  document: EditorDocumentValue
): Editor => {
  const schema: EditorStateSchemaApi = source.read.schema;

  schema.assertDocument(document);
  const baseView = createEditorView(source, { readOnly: true });
  const read = createEditorReadApi((fn) =>
    withEditorDocumentProjection(source, document, () =>
      fn(getEditorStateView(source))
    )
  );

  read.schema = source.read.schema;
  const projected = { ...baseView, read } as unknown as Editor;

  Object.defineProperty(projected, 'children', {
    get: () => read.children(),
  });
  setEditorRuntime(
    projected,
    getEditorRuntime(baseView),
    getEditorRuntimeOwner(source),
    getEditorRuntimeRoot(baseView)
  );
  inheritPluginRegistry(projected, source);

  return Object.freeze(projected);
};
