import { Value } from '@udecode/slate';
import { ReactEditor } from 'slate-react';
import { TReactEditor } from '../types/TReactEditor';

/**
 * Check if the target is in the editor.
 */
export const hasEditorTarget = <V extends Value>(
  editor: TReactEditor<V>,
  target: EventTarget | null
): target is Node => {
  try {
    return ReactEditor.hasTarget(editor as any, target);
  } catch (error) {}

  return false;
};
