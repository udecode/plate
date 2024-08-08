import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** Check if the target is inside void and in an non-readonly editor. */
export const isTargetInsideNonReadonlyVoid = (
  editor: TReactEditor,
  target: EventTarget | null
) => {
  try {
    return ReactEditor.isTargetInsideNonReadonlyVoid(editor as any, target);
  } catch (error) {}

  return false;
};
