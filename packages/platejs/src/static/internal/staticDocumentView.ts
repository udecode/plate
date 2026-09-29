import { createEditorView, type EditorDocumentValue } from '../../facade';
import type { Editor } from '../../lib';

const views = new WeakMap<object, WeakMap<EditorDocumentValue, Editor>>();

/**
 * The read-only view that renders `document` through `editor`'s plugins,
 * projected once per document object; without a document, the editor itself.
 */
export const getStaticDocumentView = (
  editor: Editor,
  document: EditorDocumentValue | undefined
): Editor => {
  if (!document) return editor;

  let byDocument = views.get(editor);

  if (!byDocument) {
    byDocument = new WeakMap();
    views.set(editor, byDocument);
  }

  let view = byDocument.get(document);

  if (!view) {
    view = createEditorView(editor, { document }) as unknown as Editor;
    byDocument.set(document, view);
  }

  return view;
};
