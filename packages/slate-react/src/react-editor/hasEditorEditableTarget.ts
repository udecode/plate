import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** Check if the target is editable and in the editor. */
export const hasEditorEditableTarget = (
  editor: TReactEditor,
  target: EventTarget | null
): target is Node => {
  try {
    return ReactEditor.hasEditableTarget(editor as any, target);
  } catch (error) {}

  return false;
};
