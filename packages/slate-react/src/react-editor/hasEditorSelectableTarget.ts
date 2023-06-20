import { Value } from '@udecode/slate';
import { ReactEditor } from 'slate-react';
import { TReactEditor } from '../types/TReactEditor';

/**
 * Check if the target can be selectable.
 */
export const hasEditorSelectableTarget = <V extends Value>(
  editor: TReactEditor<V>,
  target: EventTarget | null
) => {
  try {
    return ReactEditor.hasSelectableTarget(editor as any, target);
  } catch (error) {}

  return false;
};
