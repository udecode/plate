import type { PlateEditor } from '@udecode/plate-common/server';

import { someToggleClosed } from '../toggle-controller-store';
import { getEnclosingToggleIds } from './getEnclosingToggleIds';

export const isInClosedToggle = (editor: PlateEditor, elementId: string) => {
  const enclosingToggleIds = getEnclosingToggleIds(editor, elementId);

  return someToggleClosed(editor, enclosingToggleIds);
};
