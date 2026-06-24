import { type BasePlateEditor, getEditorPlugin } from 'platejs';

import { TogglePlugin } from '../TogglePlugin';
import { getEnclosingToggleIds } from './getEnclosingToggleIds';

export const isInClosedToggle = (
  editor: BasePlateEditor,
  elementId: string
) => {
  const enclosingToggleIds = getEnclosingToggleIds(editor, elementId);

  return getEditorPlugin(editor, TogglePlugin).getOption(
    'someClosed',
    enclosingToggleIds
  );
};
