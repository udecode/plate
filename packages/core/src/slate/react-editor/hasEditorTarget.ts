import { ReactEditor } from 'slate-react';
import { Value } from '../editor/TEditor';
import { TReactEditor } from './TReactEditor';

/**
 * Check if the target is in the editor.
 */
export const hasEditorTarget = <V extends Value>(
  editor: TReactEditor<V>,
  target: EventTarget | null
): target is Node => {
  try {
    return ReactEditor.hasTarget(editor as any, target);
  } catch (e) {}

  return false;
};
