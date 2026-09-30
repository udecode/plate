import {
  createEditorView,
  type EditorDocumentValue,
  readAuthoredView,
} from '../../facade';
import type { Editor } from '../../lib';

type RootReader = Readonly<{
  authored: unknown;
  readOnly: boolean;
  view: Editor;
}>;

const views = new WeakMap<object, WeakMap<EditorDocumentValue, Editor>>();
const rootReaders = new WeakMap<Editor, Map<string, RootReader>>();
const rootViewBases = new WeakMap<Editor, Editor>();

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

/**
 * The reader of content root `root` of what `reader` renders. Readers of the
 * same rendered document share one view per root, at any nesting depth, until
 * the rendering view's authored mode or read-only state changes.
 */
export const getStaticRootView = (reader: Editor, root: string): Editor => {
  const base = rootViewBases.get(reader) ?? reader;
  // A derived view keeps the policy it was created with, so a live editor
  // that switches modes needs a new reader.
  const authored = readAuthoredView(base);
  const readOnly = base.read.view.isReadOnly();
  let byRoot = rootReaders.get(base);

  if (!byRoot) {
    byRoot = new Map();
    rootReaders.set(base, byRoot);
  }

  const cached = byRoot.get(root);

  if (cached && cached.authored === authored && cached.readOnly === readOnly) {
    return cached.view;
  }

  const view = createEditorView(base, { root }) as unknown as Editor;

  byRoot.set(root, { authored, readOnly, view });
  rootViewBases.set(view, base);

  return view;
};
