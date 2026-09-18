import { type EditorUpdateTransaction, defineUpdateAnnotation } from '../..';
import { profilePliteReactDuration } from '../render-profiler';
import type { Editor } from './runtime-editor-api';
import { getEditorRuntime } from './runtime-editor-api';

export type NativeGroupingInput = Readonly<{
  origin: number;
  composition?: number;
}>;

export const nativeGroupingInput = defineUpdateAnnotation<NativeGroupingInput>({
  combine: (_previous, next) => next,
  key: 'history.native-grouping-input',
});

let nextNativeGroupingId = 0;

export const createNativeGroupingId = () => {
  nextNativeGroupingId += 1;

  return nextNativeGroupingId;
};

export const getNativeTextInputUpdateTags = () =>
  ['native-text-input'] as const;

export const updateNativeTextInput = (
  editor: Editor,
  update: (tx: EditorUpdateTransaction<any, any>) => void,
  input: NativeGroupingInput
) => {
  const tags = profilePliteReactDuration(
    'native-text-input-history-tags',
    getNativeTextInputUpdateTags
  );

  profilePliteReactDuration('native-text-input-update', () => {
    getEditorRuntime(editor).update(
      (tx) => {
        tx.annotations.set(nativeGroupingInput, input);
        update(tx);
      },
      { tags }
    );
  });
};
