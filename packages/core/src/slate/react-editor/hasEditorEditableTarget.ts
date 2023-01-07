import { ReactEditor } from 'slate-react';
import { Value } from '../editor/TEditor';
import { TReactEditor } from './TReactEditor';

/**
 * Check if the target is editable and in the editor.
 */
export const hasEditorEditableTarget = <V extends Value>(
  editor: TReactEditor<V>,
  target: EventTarget | null
): target is Node => {
  try {
    return ReactEditor.hasEditableTarget(editor as any, target);
  } catch (e) {}

  return false;
};
