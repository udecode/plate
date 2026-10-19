import type { EditorMarks, EditorTargetRuntime } from '../..';
import {
  mapFromAuthoredView,
  withAuthoredUpdateView,
} from '../../core/authored-runtime';
import { toInternalRoot } from '../../core/public-root';
import { getActiveEditorTransaction } from '../../core/public-state';
import type { AnyEditor } from '../../interfaces/editor';
import {
  getEditorRuntimeOwner,
  setEditorMarks,
  setEditorTargetRuntime,
  withEditorUpdateRootScope,
} from './runtime-editor-api';

export const writeRuntimeSelection = (
  editor: AnyEditor,
  shown: Parameters<AnyEditor['update']['selection']['set']>[0]
) => {
  const target =
    shown &&
    mapFromAuthoredView(editor, toInternalRoot(editor.read.view.root()), shown);

  if (shown && !target) return;
  if (editor.read.view.isReadOnly()) {
    const owner = getEditorRuntimeOwner(editor);
    withAuthoredUpdateView(owner, editor, () =>
      withEditorUpdateRootScope(owner, editor.read.view.root(), () => {
        owner.update((tx) => tx.selection.set(target));
      })
    );
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
