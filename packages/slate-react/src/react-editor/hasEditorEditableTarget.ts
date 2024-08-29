import type { TEditor } from '@udecode/slate';

import { ReactEditor } from 'slate-react';

/** Check if the target is editable and in the editor. */
export const hasEditorEditableTarget = (
  editor: TEditor,
  target: EventTarget | null
): target is Node => {
  try {
    return ReactEditor.hasEditableTarget(editor as any, target);
  } catch (error) {}

  return false;
};
