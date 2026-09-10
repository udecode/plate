import type { EditorMarks, EditorTargetRuntime } from '../..';
import { type AnyEditor, getActiveEditorTransaction } from '../../internal';
import {
  getEditorRuntimeOwner,
  setEditorMarks,
  setEditorTargetRuntime,
  withEditorUpdateRootScope,
} from './runtime-editor-api';

export const writeRuntimeSelection = (
  editor: AnyEditor,
  target: Parameters<AnyEditor['update']['selection']['set']>[0]
) => {
  if (editor.read.view.isReadOnly()) {
    const owner = getEditorRuntimeOwner(editor);
    // A read-only view forbids commands, not the document owner's selection.
    withEditorUpdateRootScope(owner, editor.read.view.root(), () => {
      owner.update((tx) => tx.selection.set(target));
    });
    return;
  }
  const transaction = getActiveEditorTransaction(editor);

  if (transaction) {
    transaction.selection.set(target);
    return;
  }

  // DOM imports bypass command dispatch while preserving correction policy.
  editor.update((tx) => {
    tx.selection.set(target);
  });
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
