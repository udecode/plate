import cloneDeep from 'lodash/cloneDeep.js';
import type { SlateEditor, TRange, Value } from 'platejs';

type AIStreamSnapshot = {
  children: Value;
  selection: TRange | null;
};

const AI_STREAM_SNAPSHOT = new WeakMap<SlateEditor, AIStreamSnapshot>();

export const captureAIStreamSnapshot = (
  editor: SlateEditor,
  snapshot: AIStreamSnapshot = {
    children: cloneDeep(editor.children),
    selection: cloneDeep(editor.selection),
  }
) => {
  AI_STREAM_SNAPSHOT.set(editor, snapshot);

  return snapshot;
};

export const clearAIStreamSnapshot = (editor: SlateEditor) => {
  AI_STREAM_SNAPSHOT.delete(editor);
};

export const getAIStreamSnapshot = (editor: SlateEditor) =>
  AI_STREAM_SNAPSHOT.get(editor);

export const restoreAIStreamSnapshot = (editor: SlateEditor) => {
  const snapshot = getAIStreamSnapshot(editor);

  if (!snapshot) return false;

  editor.tf.withoutSaving(() => {
    editor.tf.setValue(cloneDeep(snapshot.children));

    if (snapshot.selection) {
      editor.tf.setSelection(cloneDeep(snapshot.selection));
    } else {
      editor.tf.deselect();
    }
  });

  clearAIStreamSnapshot(editor);

  return true;
};

export const commitAIStreamValue = (editor: SlateEditor, value: Value) => {
  if (!restoreAIStreamSnapshot(editor)) return false;

  editor.tf.withNewBatch(() => {
    editor.tf.setValue(cloneDeep(value));
  });

  return true;
};
