import type { AnyEditor as Editor } from '../interfaces/editor';
import type { Point } from '../interfaces/point';
import { getEditorRuntimeOwner } from './editor-runtime';

/** @internal */
export type EditorContent = (editor: Editor, node: unknown) => boolean;

/** @internal */
export type EditorHeldContent = (
  editor: Editor,
  point: Point,
  document: unknown
) => boolean;

type ContentOwner = Readonly<{
  content: EditorContent;
  held: EditorHeldContent | null;
}>;

const CONTENT = new WeakMap<Editor, ContentOwner>();

/** @internal */
export const registerEditorContent = (
  editor: Editor,
  predicate: EditorContent,
  held: EditorHeldContent | null = null
) => {
  const owner = getEditorRuntimeOwner(editor);

  if (CONTENT.has(owner)) {
    throw new Error('An editor accepts one content predicate.');
  }

  const registered = { content: predicate, held };

  CONTENT.set(owner, registered);

  return () => {
    if (CONTENT.get(owner) === registered) CONTENT.delete(owner);
  };
};

/** @internal */
export const hasEditorContent = (editor: Editor) =>
  CONTENT.has(getEditorRuntimeOwner(editor));

/** @internal */
export const isEditorContent = (editor: Editor, node: unknown) =>
  CONTENT.get(getEditorRuntimeOwner(editor))?.content(editor, node) ?? true;

/** @internal */
export const holdsEditorWrite = (
  editor: Editor,
  point: Point,
  document: unknown
) =>
  CONTENT.get(getEditorRuntimeOwner(editor))?.held?.(editor, point, document) ??
  false;
