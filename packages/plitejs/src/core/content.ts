import type { AnyEditor as Editor } from '../interfaces/editor';
import { getEditorRuntimeOwner } from './editor-runtime';

/** @internal */
export type EditorContent = (editor: Editor, node: unknown) => boolean;

const CONTENT = new WeakMap<Editor, EditorContent>();

/** @internal */
export const registerEditorContent = (
  editor: Editor,
  predicate: EditorContent
) => {
  const owner = getEditorRuntimeOwner(editor);

  if (CONTENT.has(owner)) {
    throw new Error('An editor accepts one content predicate.');
  }
  CONTENT.set(owner, predicate);

  return () => {
    if (CONTENT.get(owner) === predicate) CONTENT.delete(owner);
  };
};

/** @internal */
export const hasEditorContent = (editor: Editor) =>
  CONTENT.has(getEditorRuntimeOwner(editor));

/** @internal */
export const isEditorContent = (editor: Editor, node: unknown) =>
  CONTENT.get(getEditorRuntimeOwner(editor))?.(editor, node) ?? true;
