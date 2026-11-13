import type { EditorUpdateTransaction, Value } from '../..';
import {
  type NativeGroupingInput,
  nativeGroupingInput,
} from '../../core/native-grouping-input';
import { profilePliteReactDuration } from '../render-profiler';
import type { Editor } from './runtime-editor-api';
import { getEditorRuntime } from './runtime-editor-api';

let nextNativeGroupingId = 0;

export const createNativeGroupingId = () => {
  nextNativeGroupingId += 1;

  return nextNativeGroupingId;
};

export const getNativeTextInputUpdateTags = () =>
  ['native-text-input'] as const;

/** Writes native text input and returns false when the editor refused it. */
export const updateNativeTextInput = <V extends Value>(
  editor: Editor<V>,
  update: (tx: EditorUpdateTransaction<V, any>) => void,
  input: NativeGroupingInput
) => {
  const tags = profilePliteReactDuration(
    'native-text-input-history-tags',
    getNativeTextInputUpdateTags
  );

  return profilePliteReactDuration(
    'native-text-input-update',
    () =>
      getEditorRuntime(editor).update(
        (tx) => {
          tx.annotations.set(nativeGroupingInput, input);
          update(tx);

          return true;
        },
        { tags }
      ) === true
  );
};
