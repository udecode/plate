import type { AnyEditor } from '../interfaces/editor';
import { getDefined } from '../internal/get-defined';
import { getEditorRuntimeOwner } from './editor-runtime';

const BOUND = new WeakMap<AnyEditor, number>();

export const bindSharedRoom = (editor: AnyEditor) => {
  const owner = getEditorRuntimeOwner(editor);
  let bound = true;

  BOUND.set(owner, (BOUND.get(owner) ?? 0) + 1);

  return () => {
    if (!bound) return;
    bound = false;
    const left = getDefined(BOUND.get(owner)) - 1;

    if (left > 0) BOUND.set(owner, left);
    else BOUND.delete(owner);
  };
};

export const isBoundToSharedRoom = (editor: AnyEditor) =>
  BOUND.has(getEditorRuntimeOwner(editor));
