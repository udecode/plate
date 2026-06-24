import type { Editor, EditorSnapshot, SnapshotInput, Value } from '../../src';

export const getTestEditorSnapshot = <V extends Value>(
  editor: Editor<V>
): EditorSnapshot<V> => editor.read((state) => state.runtime.snapshot());

export const replaceEditorValue = <V extends Value>(
  editor: Editor<V>,
  input: SnapshotInput<V>
) => {
  editor.update((tx) => {
    tx.value.replace(input);
  });
};
