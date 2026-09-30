import { getEditorRuntimeOwner } from './editor-runtime';

// The guard needs only the runtime owner, so it takes any editor or view
// without relating editor generics.
type EditorRuntimeCarrier = Parameters<typeof getEditorRuntimeOwner>[0];

const DOCUMENT_VIEWS = new WeakSet<EditorRuntimeCarrier>();
const DOCUMENT_VIEW_READS = new WeakMap<EditorRuntimeCarrier, number>();

/** Whether a view renders its own document. @internal */
export const isDocumentView = (view: object) =>
  DOCUMENT_VIEWS.has(view as EditorRuntimeCarrier);

/** Mark a view bound to its own document. @internal */
export const registerDocumentView = (view: EditorRuntimeCarrier) => {
  DOCUMENT_VIEWS.add(view);
};

/**
 * Run code on behalf of a document view. While it runs, reading the source
 * editor through its own API throws: plugin code must read the view's
 * document through the editor or state passed to it. Other editors run `fn`
 * unchanged.
 *
 * @internal
 */
export const withDocumentViewRead = <T>(
  editor: EditorRuntimeCarrier,
  fn: () => T
): T => {
  if (!DOCUMENT_VIEWS.has(editor)) return fn();

  const owner = getEditorRuntimeOwner(editor);
  const depth = DOCUMENT_VIEW_READS.get(owner) ?? 0;

  DOCUMENT_VIEW_READS.set(owner, depth + 1);
  try {
    return fn();
  } finally {
    if (depth === 0) DOCUMENT_VIEW_READS.delete(owner);
    else DOCUMENT_VIEW_READS.set(owner, depth);
  }
};

/** Refuse a source-editor read made while a document view is reading. @internal */
export const assertNoDocumentViewRead = (editor: EditorRuntimeCarrier) => {
  if (DOCUMENT_VIEW_READS.has(getEditorRuntimeOwner(editor))) {
    throw new Error(
      'Editor read its own document while a document view was reading. Read through the editor or state passed to this call: an editor captured when a plugin was created is the source editor.'
    );
  }
};
