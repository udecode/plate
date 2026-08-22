import type { EditorUpdateTag, EditorUpdateTransaction } from '@platejs/plite';

import { profileEditableMutationDuration } from './mutation-profiler';
import type { Editor } from './runtime-editor-api';
import { getEditorRuntime } from './runtime-editor-api';

type NativeTextInputLocation = {
  path: readonly number[];
  root?: string;
};

const EDITOR_TO_LAST_NATIVE_TEXT_INPUT = new WeakMap<
  Editor,
  { key: string | undefined; time: number }
>();

export const NATIVE_TEXT_INPUT_HISTORY_MERGE_INTERVAL_MS = 1000;

const now = () => globalThis.performance?.now?.() ?? Date.now();

const getLocationKey = (location: NativeTextInputLocation | undefined) =>
  location ? `${location.root ?? ''}:${location.path.join('.')}` : undefined;

const getCurrentSelectionLocation = (
  editor: Editor
): NativeTextInputLocation | undefined => {
  const selection = editor.read((state) => state.selection());

  return selection?.anchor;
};

export const getNativeTextInputUpdateTags = (
  editor: Editor,
  location = getCurrentSelectionLocation(editor)
): readonly EditorUpdateTag[] => {
  const currentTime = now();
  const currentKey = getLocationKey(location);
  const previous = EDITOR_TO_LAST_NATIVE_TEXT_INPUT.get(editor);

  EDITOR_TO_LAST_NATIVE_TEXT_INPUT.set(editor, {
    key: currentKey,
    time: currentTime,
  });

  if (previous === undefined) {
    return ['native-text-input'];
  }

  if (previous.key !== currentKey) {
    return ['native-text-input', 'history-push'];
  }

  return [
    'native-text-input',
    currentTime - previous.time > NATIVE_TEXT_INPUT_HISTORY_MERGE_INTERVAL_MS
      ? 'history-push'
      : 'history-merge',
  ];
};

export const updateNativeTextInput = (
  editor: Editor,
  update: (tx: EditorUpdateTransaction<any, any>) => void,
  options: { merge?: boolean } = {}
) => {
  const tags = profileEditableMutationDuration(
    'native-text-input-history-tags',
    () =>
      options.merge
        ? (['native-text-input', 'history-merge'] as const)
        : getNativeTextInputUpdateTags(editor)
  );

  profileEditableMutationDuration('native-text-input-update', () => {
    getEditorRuntime(editor).update(update, { tags });
  });
};
