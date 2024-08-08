import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** Check if the target is in the editor. */
export const hasEditorTarget = (
  editor: TReactEditor,
  target: EventTarget | null
): target is Node => {
  try {
    return ReactEditor.hasTarget(editor as any, target);
  } catch (error) {}

  return false;
};
