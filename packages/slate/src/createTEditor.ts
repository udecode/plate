import { createEditor } from 'slate';

import type { TEditor, Value } from './interfaces/editor/TEditor';

const noop: {
  (name: string): () => void;
  <T>(name: string, returnValue: T): () => T;
} =
  <T>(name: string, returnValue?: T) =>
  () => {
    console.warn(
      `[OVERRIDE_MISSING] The method editor.${name}() has not been implemented or overridden. ` +
        `This may cause unexpected behavior. Please ensure that all required editor methods are properly defined.`
    );

    return returnValue;
  };

export const createTEditor = <V extends Value>() => {
  const editor = createEditor() as any as TEditor<V>;

  // slate-react
  editor.hasEditableTarget = noop('hasEditableTarget', false) as any;
  editor.hasRange = noop('hasRange', false);
  editor.hasSelectableTarget = noop('hasSelectableTarget', false);
  editor.hasTarget = noop('hasTarget', false) as any;
  editor.insertData = noop('insertData');
  editor.insertFragmentData = noop('insertFragmentData') as any;
  editor.insertTextData = noop('insertTextData', false);
  editor.isTargetInsideNonReadonlyVoid = noop(
    'isTargetInsideNonReadonlyVoid',
    false
  );
  editor.setFragmentData = noop('setFragmentData');

  // slate-history
  editor.history = { redos: [], undos: [] };
  editor.undo = noop('undo');
  editor.redo = noop('redo');
  editor.writeHistory = noop('writeHistory');

  return editor;
};
