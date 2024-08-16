import type { TEditor } from '@udecode/slate';

import { ReactEditor } from 'slate-react';

/** Check if the target is inside void and in an non-readonly editor. */
export const isTargetInsideNonReadonlyVoid = (
  editor: TEditor,
  target: EventTarget | null
) => {
  try {
    return ReactEditor.isTargetInsideNonReadonlyVoid(editor as any, target);
  } catch (error) {}

  return false;
};
