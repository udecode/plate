import { Value } from '@udecode/slate';
import { ReactEditor } from 'slate-react';

import { TReactEditor } from '../types/TReactEditor';

/**
 * Check if the target is inside void and in an non-readonly editor.
 */
export const isTargetInsideNonReadonlyVoid = <V extends Value>(
  editor: TReactEditor<V>,
  target: EventTarget | null
) => {
  try {
    return ReactEditor.isTargetInsideNonReadonlyVoid(editor as any, target);
  } catch (error) {}

  return false;
};
