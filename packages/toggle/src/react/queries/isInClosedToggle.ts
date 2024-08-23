import type { SlateEditor } from '@udecode/plate-common';

import { someToggleClosed } from '../toggle-controller-store';
import { getEnclosingToggleIds } from './getEnclosingToggleIds';

export const isInClosedToggle = (editor: SlateEditor, elementId: string) => {
  const enclosingToggleIds = getEnclosingToggleIds(editor, elementId);

  return someToggleClosed(editor, enclosingToggleIds);
};
