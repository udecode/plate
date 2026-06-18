import type { EditorUpdateMetadata } from '@platejs/slate';
import type { Editor } from './runtime-editor-api';

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
  const selection = editor.read((state) => state.selection.get());

  return selection?.anchor;
};

export const getNativeTextInputHistoryMetadata = (
  editor: Editor,
  location = getCurrentSelectionLocation(editor)
): EditorUpdateMetadata => {
  const currentTime = now();
  const currentKey = getLocationKey(location);
  const previous = EDITOR_TO_LAST_NATIVE_TEXT_INPUT.get(editor);

  EDITOR_TO_LAST_NATIVE_TEXT_INPUT.set(editor, {
    key: currentKey,
    time: currentTime,
  });

  if (previous === undefined) {
    return { origin: { kind: 'native-text-input' } };
  }

  if (previous.key !== currentKey) {
    return {
      history: { mode: 'push' },
      origin: { kind: 'native-text-input' },
    };
  }

  return {
    history: {
      mode:
        currentTime - previous.time >
        NATIVE_TEXT_INPUT_HISTORY_MERGE_INTERVAL_MS
          ? 'push'
          : 'merge',
    },
    origin: { kind: 'native-text-input' },
  };
};
