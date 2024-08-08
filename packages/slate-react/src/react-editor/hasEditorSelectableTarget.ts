import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** Check if the target can be selectable. */
export const hasEditorSelectableTarget = (
  editor: TReactEditor,
  target: EventTarget | null
) => {
  try {
    return ReactEditor.hasSelectableTarget(editor as any, target);
  } catch (error) {}

  return false;
};
