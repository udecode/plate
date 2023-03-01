import { ReactEditor } from 'slate-react';
import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { TReactEditor } from './TReactEditor';

/**
 * Check if the target is inside void and in an non-readonly editor.
 */
export const isTargetInsideNonReadonlyVoid = <V extends Value>(
  editor: TReactEditor<V>,
  target: EventTarget | null
) => {
  try {
    return ReactEditor.isTargetInsideNonReadonlyVoid(editor as any, target);
  } catch (e) {}

  return false;
};
