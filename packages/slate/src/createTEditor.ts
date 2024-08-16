import { createEditor } from 'slate';

import type { TEditor, Value } from './interfaces/editor/TEditor';

const noop: {
  (): () => void;
  <T>(returnValue: T): () => T;
} =
  <T>(returnValue?: T) =>
  () =>
    returnValue;

export const createTEditor = <V extends Value>() => {
  const editor = createEditor() as any as TEditor<V>;

  // slate-react
  editor.hasEditableTarget = noop(false) as any;
  editor.hasRange = noop(false);
  editor.hasSelectableTarget = noop(false);
  editor.hasTarget = noop(false) as any;
  editor.insertData = noop();
  editor.insertFragmentData = noop() as any;
  editor.insertTextData = noop(false);
  editor.isTargetInsideNonReadonlyVoid = noop(false);
  editor.setFragmentData = noop();

  // slate-history
  editor.history = { redos: [], undos: [] };
  editor.undo = noop();
  editor.redo = noop();
  editor.writeHistory = noop();

  return editor;
};
