import type {
  AnyEditor as Editor,
  EditorUpdateTag,
} from '../interfaces/editor';
import { getEditorRuntimeOwner } from './editor-runtime';
import { reduceEditorUpdateTags } from './update-policy';

const UPDATE_TAG_CONTEXT = new WeakMap<Editor, EditorUpdateTag[][]>();

export { normalizeUpdateTags } from './update-policy';

export const pushUpdateTagContext = (
  editor: Editor,
  tags: readonly EditorUpdateTag[]
) => {
  const owner = getEditorRuntimeOwner(editor);
  const stack = UPDATE_TAG_CONTEXT.get(owner) ?? [];
  const nextTags = [
    ...reduceEditorUpdateTags([...(stack.at(-1) ?? []), ...tags]),
  ];
  stack.push(nextTags);
  UPDATE_TAG_CONTEXT.set(owner, stack);
};

export const popUpdateTagContext = (editor: Editor) => {
  const owner = getEditorRuntimeOwner(editor);
  const stack = UPDATE_TAG_CONTEXT.get(owner);

  if (!stack) {
    return;
  }

  stack.pop();

  if (stack.length === 0) {
    UPDATE_TAG_CONTEXT.delete(owner);
  }
};

export const withoutUpdateTagContext = <T>(editor: Editor, fn: () => T): T => {
  const owner = getEditorRuntimeOwner(editor);
  const stack = UPDATE_TAG_CONTEXT.get(owner);

  if (!stack) return fn();

  UPDATE_TAG_CONTEXT.delete(owner);

  try {
    return fn();
  } finally {
    UPDATE_TAG_CONTEXT.set(owner, stack);
  }
};

export const getCurrentUpdateTags = (editor: Editor) =>
  UPDATE_TAG_CONTEXT.get(getEditorRuntimeOwner(editor))?.at(-1) ?? [];
