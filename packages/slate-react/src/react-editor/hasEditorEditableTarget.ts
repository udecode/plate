import { Value } from '@udecode/slate';
import { ReactEditor } from 'slate-react';
import { TReactEditor } from '../types/TReactEditor';

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
