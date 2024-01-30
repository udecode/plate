import { PlateEditor, Value } from '@udecode/plate-common';

import { someToggleClosed } from '../store';
import { getEnclosingToggleIds } from './getEnclosingToggleIds';

export const isInClosedToggle = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  elementId: string
) => {
  const enclosingToggleIds = getEnclosingToggleIds<V, E>(editor, elementId);
  return someToggleClosed<V, E>(editor, enclosingToggleIds);
};
