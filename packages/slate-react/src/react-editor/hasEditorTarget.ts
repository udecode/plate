import type { TEditor } from '@udecode/slate';

import { ReactEditor } from 'slate-react';

/** Check if the target is in the editor. */
export const hasEditorTarget = (
  editor: TEditor,
  target: EventTarget | null
): target is Node => {
  try {
    return ReactEditor.hasTarget(editor as any, target);
  } catch (error) {}

  return false;
};
