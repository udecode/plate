import { type SlateEditor, getEditorPlugin } from 'platejs';

import { TogglePlugin } from '../TogglePlugin';
import { getEnclosingToggleIds } from './getEnclosingToggleIds';

export const isInClosedToggle = (editor: SlateEditor, elementId: string) => {
  const enclosingToggleIds = getEnclosingToggleIds(editor, elementId);

  return getEditorPlugin(editor, TogglePlugin).getOption(
    'someClosed',
    enclosingToggleIds
  );
};
