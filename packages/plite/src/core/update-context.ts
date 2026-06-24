import type {
  Editor,
  EditorCommitCommand,
  EditorUpdateMetadata,
  EditorUpdateOptions,
  EditorUpdateTag,
} from '../interfaces/editor';
import { cloneFrozen } from './clone';

const COMMAND_CONTEXT = new WeakMap<Editor, EditorCommitCommand[]>();
const UPDATE_TAG_CONTEXT = new WeakMap<Editor, EditorUpdateTag[][]>();

export const cloneUpdateMetadata = (
  metadata: EditorUpdateMetadata = {}
): EditorUpdateMetadata => cloneFrozen(metadata);

export const mergeUpdateMetadata = (
  previous: EditorUpdateMetadata,
  next: EditorUpdateMetadata = {}
): EditorUpdateMetadata =>
  cloneUpdateMetadata({
    ...previous,
    ...next,
    collab: next.collab
      ? { ...previous.collab, ...next.collab }
      : previous.collab,
    history: next.history
      ? { ...previous.history, ...next.history }
      : previous.history,
    origin: next.origin ?? previous.origin,
    selection: next.selection
      ? { ...previous.selection, ...next.selection }
      : previous.selection,
  });

export const normalizeUpdateTags = (tag?: EditorUpdateOptions['tag']) => {
  if (!tag) {
    return [];
  }

  return Array.isArray(tag) ? [...tag] : [tag];
};

export const pushUpdateTagContext = (
  editor: Editor,
  tags: readonly EditorUpdateTag[]
) => {
  const stack = UPDATE_TAG_CONTEXT.get(editor) ?? [];
  const nextTags = [...new Set([...(stack.at(-1) ?? []), ...tags])];
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
