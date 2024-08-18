import type { SlateEditor } from '@udecode/plate-common';

import { getEnclosingToggleIds } from './getEnclosingToggleIds';
import { someToggleClosed } from '../toggle-controller-store';

export const isInClosedToggle = (editor: SlateEditor, elementId: string) => {
  const enclosingToggleIds = getEnclosingToggleIds(editor, elementId);

  return someToggleClosed(editor, enclosingToggleIds);
};
