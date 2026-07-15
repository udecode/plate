import type {
  Editor,
  EditorCommitCommand,
  EditorUpdateTag,
} from '../interfaces/editor';
import { reduceEditorUpdateTags } from './update-policy';

const COMMAND_CONTEXT = new WeakMap<Editor, EditorCommitCommand[]>();
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

export const getCurrentUpdateTags = (editor: Editor) =>
  UPDATE_TAG_CONTEXT.get(editor)?.at(-1) ?? [];

export const getCommandContext = (editor: Editor): EditorCommitCommand | null =>
  COMMAND_CONTEXT.get(editor)?.at(-1) ?? null;

export const pushCommandContext = (
  editor: Editor,
  command: EditorCommitCommand
) => {
  const stack = COMMAND_CONTEXT.get(editor) ?? [];
  stack.push(command);
  COMMAND_CONTEXT.set(editor, stack);
};

export const popCommandContext = (editor: Editor) => {
  const stack = COMMAND_CONTEXT.get(editor);

  if (!stack) {
    return;
  }

  stack.pop();

  if (stack.length === 0) {
    COMMAND_CONTEXT.delete(editor);
  }
};
