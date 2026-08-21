import type { EditorMarks, EditorTargetRuntime } from '@platejs/plite';
import {
  type AnyEditor,
  getActiveEditorTransaction,
} from '@platejs/plite/internal';

import { setEditorMarks, setEditorTargetRuntime } from './runtime-editor-api';

export const writeRuntimeSelection = (
  editor: AnyEditor,
  target: Parameters<AnyEditor['update']['selection']['set']>[0]
) => {
  const transaction = getActiveEditorTransaction(editor);

  if (transaction) {
    transaction.selection.set(target);
    return;
  }

  // DOM imports bypass command dispatch while preserving correction policy.
  editor.update((tx) => tx.selection.set(target));
};

export const writeRuntimeMarks = (
  editor: AnyEditor,
  marks: EditorMarks | null
) => {
  setEditorMarks(editor, marks);
};

export const writeTargetRuntime = (
  editor: AnyEditor,
  targetRuntime: EditorTargetRuntime | null
) => {
  setEditorTargetRuntime(editor, targetRuntime);
};
