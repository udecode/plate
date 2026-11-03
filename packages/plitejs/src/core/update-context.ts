import type {
  AnyEditor as Editor,
  EditorUpdateTag,
} from '../interfaces/editor';
import { reduceEditorUpdateTags } from './update-policy';

const UPDATE_TAG_CONTEXT = new WeakMap<Editor, EditorUpdateTag[][]>();

export { normalizeUpdateTags } from './update-policy';

export const pushUpdateTagContext = (
  editor: Editor,
  tags: readonly EditorUpdateTag[]
) => {
  const stack = UPDATE_TAG_CONTEXT.get(editor) ?? [];
  const nextTags = [
    ...reduceEditorUpdateTags([...(stack.at(-1) ?? []), ...tags]),
  ];
  stack.push(nextTags);
  UPDATE_TAG_CONTEXT.set(editor, stack);
};

export const popUpdateTagContext = (editor: Editor) => {
  const stack = UPDATE_TAG_CONTEXT.get(editor);

  if (!stack) {
    return;
  }

  stack.pop();

  if (stack.length === 0) {
    UPDATE_TAG_CONTEXT.delete(editor);
  }
};

export const withoutUpdateTagContext = <T>(editor: Editor, fn: () => T): T => {
  const stack = UPDATE_TAG_CONTEXT.get(editor);

  if (!stack) return fn();

  UPDATE_TAG_CONTEXT.delete(editor);

  try {
    return fn();
  } finally {
    UPDATE_TAG_CONTEXT.set(editor, stack);
  }
};

export const getCurrentUpdateTags = (editor: Editor) =>
  UPDATE_TAG_CONTEXT.get(editor)?.at(-1) ?? [];
