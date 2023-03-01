import { ReactEditor } from 'slate-react';
import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { TReactEditor } from './TReactEditor';

/**
 * Check if the target can be selectable.
 */
export const hasEditorSelectableTarget = <V extends Value>(
  editor: TReactEditor<V>,
  target: EventTarget | null
) => {
  try {
    return ReactEditor.hasSelectableTarget(editor as any, target);
  } catch (e) {}

  return false;
};
